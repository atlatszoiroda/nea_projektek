import { Layout } from '@/components/layout/Layout';
import { StatCard } from '@/components/dashboard/StatCard';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { ProjectTable } from '@/components/dashboard/ProjectTable';
import { BarChartComponent } from '@/components/charts/BarChartComponent';
import { PieChartComponent } from '@/components/charts/PieChartComponent';
import { useProjectData } from '@/hooks/useProjectData';
import { Wallet, FileText, Trophy, TrendingUp, Loader2 } from 'lucide-react';

function formatCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1).replace('.', ',')} Mrd Ft`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(0).replace('.', ',')} M Ft`;
  }
  return new Intl.NumberFormat('hu-HU').format(amount) + ' Ft';
}

export default function Index() {
  const {
    filteredProjects,
    loading,
    filters,
    updateFilter,
    resetFilters,
    aggregatedData,
    globalStats,
    uniqueValues,
    groupedProjects,
  } = useProjectData();

  if (loading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">Adatok betöltése...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Prepare chart data
  const varosChartData = Object.entries(aggregatedData.varosokSzerint)
    .map(([name, data]) => ({ name, value: data.osszeg, count: data.count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const besorolasChartData = Object.entries(aggregatedData.besorolasSzerint)
    .map(([name, data]) => ({ name, value: data.osszeg, count: data.count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  /* Removed dontesRawData and dontesChartData (Count) usage */

  const dontesAmountChartData = Object.entries(aggregatedData.dontesSzerint)
    .map(([name, data]) => ({ name, value: data.osszeg }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Limit to top 5 for dashboard overview



  const szervezetTipusChartData = Object.entries(aggregatedData.szervezetTipusSzerint)
    .map(([name, data]) => ({ name, value: data.osszeg }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  /* Removed filtered nyertesCount calculation used for StatCards */

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            <span className="gold-text">NEA</span> Pályázati Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Nemzeti Együttműködési Alap pályázatainak áttekintése
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={
              filters.dontes.length === 0
                ? "Minden döntés"
                : filters.dontes.length === 1
                  ? filters.dontes[0]
                  : "Kiválasztott döntések"
            }
            value={formatCurrency(aggregatedData.osszesOsszeg)}
            icon={Wallet}
            variant="primary"
          />
          <StatCard
            title="Pályázatok száma"
            value={aggregatedData.projektekSzama.toLocaleString('hu-HU')}
            icon={FileText}
          />
          <StatCard
            title="Nyertes pályázatok"
            value={globalStats.totalWinners.toLocaleString('hu-HU')}
            icon={Trophy}
            variant="success"
          />
          <StatCard
            title="Nyertesek átlagos támogatása"
            value={formatCurrency(Math.round(globalStats.averageWinnerSupport))}
            icon={TrendingUp}
          />
        </div>

        {/* Filters */}
        <FilterPanel
          filters={filters}
          uniqueValues={uniqueValues}
          onUpdateFilter={updateFilter}
          onResetFilters={resetFilters}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <BarChartComponent
            data={dontesAmountChartData}
            title="Pályázatok döntés szerint (összeg)"
            formatValue={formatCurrency}
            tooltipLabel="Összeg"
          />
          <BarChartComponent
            data={szervezetTipusChartData}
            title="Szervezet típusok szerinti eloszlás"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <BarChartComponent
            data={varosChartData}
            title="Top 10 város támogatás szerint"
          />
          <BarChartComponent
            data={besorolasChartData}
            title="Besorolás szerinti eloszlás"
          />
        </div>

        {/* Projects Table */}
        <div>
          <h2 className="mb-4 font-display text-xl font-semibold">Pályázatok</h2>
          <ProjectTable
            projects={filteredProjects}
            groupedProjects={groupedProjects}
            maxRows={20}
          />
        </div>
      </div>
    </Layout>
  );
}
