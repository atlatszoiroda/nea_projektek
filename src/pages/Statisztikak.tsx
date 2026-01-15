import { useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { StatCard } from '@/components/dashboard/StatCard';
import { BarChartComponent } from '@/components/charts/BarChartComponent';
import { PieChartComponent } from '@/components/charts/PieChartComponent';
import { useProjectData } from '@/hooks/useProjectData';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { Loader2, BarChart3, Wallet, FileText, TrendingUp, Percent } from 'lucide-react';

export function formatCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1).replace('.', ',')}\u00A0Mrd\u00A0Ft`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(0).replace('.', ',')}\u00A0M\u00A0Ft`;
  }
  return new Intl.NumberFormat('hu-HU').format(amount) + '\u00A0Ft';
}

export default function Statisztikak() {
  const {
    projects,
    filteredProjects,
    loading,
    aggregatedData,
    globalStats,
    filters,
    uniqueValues,
    updateFilter,
    resetFilters
  } = useProjectData();

  /* 
   * Calculate Top 50 Winners 
   * Group by Tax Number (adoszama) + Name (szervezet_neve) to handle duplicates/variations
   */


  if (loading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  /* Removed filtered nyertesCount and successRate calculations */
  const successRate = projects.length > 0
    ? (filteredProjects.length / projects.length) * 100
    : 0;

  const varosChartData = Object.entries(aggregatedData.varosokSzerint)
    .map(([name, data]) => ({ name, value: data.osszeg, count: data.count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const besorolasChartData = Object.entries(aggregatedData.besorolasSzerint)
    .map(([name, data]) => ({ name, value: data.osszeg, count: data.count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const dontesChartData = Object.entries(aggregatedData.dontesSzerint)
    .map(([name, data]) => ({ name, value: data.count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const dontesAmountChartData = Object.entries(aggregatedData.dontesSzerint)
    .map(([name, data]) => ({ name, value: data.osszeg }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const szervezetTipusChartData = Object.entries(aggregatedData.szervezetTipusSzerint)
    .map(([name, data]) => ({ name, value: data.osszeg }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const varosCountChartData = Object.entries(aggregatedData.varosokSzerint)
    .map(([name, data]) => ({ name, value: data.count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);




  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Statisztikák</h1>
            <p className="text-muted-foreground">
              Részletes statisztikai áttekintés
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={
              filters.dontes.length === 0
                ? "Minden döntés"
                : filters.dontes.length === 1
                  ? filters.dontes[0]
                  : "Kiválasztott döntések"
            }
            value={formatCurrency(aggregatedData.osszesTamogatas)}
            icon={Wallet}
            variant="primary"
          />
          <StatCard
            title="Pályázatok száma"
            value={aggregatedData.projektekSzama.toLocaleString('hu-HU')}
            icon={FileText}
          />
          <StatCard
            title="Nyertesek átlagos támogatása"
            value={formatCurrency(globalStats.averageWinnerSupport)}
            icon={TrendingUp}
          />
          <StatCard
            title="Összes pályázaton belüli arány"
            value={`${successRate.toFixed(1)}%`}
            icon={Percent}
            variant="success"
          />
        </div>

        <FilterPanel
          filters={filters}
          uniqueValues={uniqueValues}
          onUpdateFilter={updateFilter}
          onResetFilters={resetFilters}
          showGrouping={false}
        />



        <div className="grid gap-6 lg:grid-cols-2">
          <BarChartComponent
            data={dontesChartData}
            title="Pályázatok döntés szerint (db)"
            formatValue={(v) => `${v.toLocaleString('hu-HU')}\u00A0db`}
            tooltipLabel="Darabszám"
          />
          <BarChartComponent
            data={dontesAmountChartData}
            title="Pályázatok döntés szerint (összeg)"
            formatValue={formatCurrency}
            tooltipLabel="Összeg"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <BarChartComponent
            data={varosChartData}
            title="Top 10 város támogatás szerint"
          />
          <BarChartComponent
            data={varosCountChartData}
            title="Top 10 város pályázatok száma szerint"
            formatValue={(v) => `${v}\u00A0db`}
            tooltipLabel="Projektek száma"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <BarChartComponent
            data={besorolasChartData}
            title="Besorolás szerinti támogatás"
          />
          <BarChartComponent
            data={szervezetTipusChartData}
            title="Szervezet típusok szerinti támogatás"
          />
        </div>
      </div>
    </Layout>
  );
}
