import { useMemo, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { BarChartComponent } from '@/components/charts/BarChartComponent';
import { useProjectData } from '@/hooks/useProjectData';
import { Loader2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TopCharts() {

    function formatCurrencyTop50(amount: number): string {
        if (amount >= 1000000000) {
            return `${(amount / 1000000000).toFixed(1).replace('.', ',')}\u00A0Mrd\u00A0Ft`;
        }
        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(1).replace('.', ',')}\u00A0M\u00A0Ft`;
        }
        return new Intl.NumberFormat('hu-HU').format(amount) + '\u00A0Ft';
    }

    const {
        projects,
        loading,
        uniqueValues,
    } = useProjectData();

    const topWinners = useMemo(() => {
        const winnersMap = new Map<string, { name: string; count: number; value: number; varos: string; besorolas: string }>();

        projects.forEach(project => {
            // Strict "Nyertes" filter
            const isNyertes = String(project.palyazati_dontes || '').toLowerCase() === 'nyertes';
            if (!isNyertes) return;

            // Use adoszama for unique ID if available and valid, otherwise name
            const invalidTaxIds = ['nincs adat', 'n/a', ''];
            let id = project.szervezet_neve; // Default to name

            if (project.adoszama && !invalidTaxIds.includes(String(project.adoszama).toLowerCase().trim())) {
                id = project.adoszama;
            }

            if (!id) return; // Skip invalid entries

            const key = String(id);

            if (!winnersMap.has(key)) {
                winnersMap.set(key, {
                    name: project.szervezet_neve || 'Névtelen szervezet',
                    count: 0,
                    value: 0,
                    varos: project.szekhely_varos || '',
                    besorolas: project.besorolas || ''
                });
            }

            const winner = winnersMap.get(key)!;
            winner.count += 1; // Count this project
            winner.value += (Number(project.tamogatas) || 0);
        });

        const allWinners = Array.from(winnersMap.values());

        return {
            byAmount: [...allWinners]
                .sort((a, b) => b.value - a.value)
                .slice(0, 50),
            byCount: [...allWinners]
                .sort((a, b) => b.count - a.count)
                .slice(0, 50)
        };
    }, [projects]);

    if (loading) {
        return (
            <Layout>
                <div className="flex h-[80vh] items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="font-display text-2xl font-bold">Top 50 Nyertes</h1>
                        <p className="text-muted-foreground">
                            A legtöbb támogatást elnyert szervezetek (csak nyertes pályázatok)
                        </p>
                    </div>
                </div>

                {/* Top 50 Winners Charts */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <BarChartComponent
                        data={topWinners.byAmount}
                        title="Top 50 nyertes támogatás összege szerint"
                        height={2000}
                        yAxisWidth={350}
                        formatValue={formatCurrencyTop50}
                    />
                    <BarChartComponent
                        data={topWinners.byCount}
                        title="Top 50 nyertes elnyert projektek száma szerint"
                        height={2000}
                        yAxisWidth={350}
                        dataKey="count"
                        formatValue={(v) => `${v} db`}
                        tooltipLabel="Projektek száma"
                    />
                </div>
            </div >
        </Layout >
    );
}
