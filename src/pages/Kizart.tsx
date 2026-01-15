import { Layout } from '@/components/layout/Layout';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { ProjectTable } from '@/components/dashboard/ProjectTable';
import { useProjectData } from '@/hooks/useProjectData';
import { Loader2, XCircle } from 'lucide-react';
import { useMemo } from 'react';

export default function Kizart() {
  const {
    filteredProjects,
    loading,
    filters,
    updateFilter,
    resetFilters,
    uniqueValues,
    groupedProjects,
  } = useProjectData({
    dontes: ['Elutasított', 'Nem támogatott', 'Érvénytelen']
  });

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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
            <XCircle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Elutasított pályázatok</h1>
            <p className="text-muted-foreground">
              {filteredProjects.length.toLocaleString('hu-HU')} elutasított/érvénytelen pályázat
            </p>
          </div>
        </div>

        <FilterPanel
          filters={filters}
          uniqueValues={uniqueValues}
          onUpdateFilter={updateFilter}
          onResetFilters={resetFilters}
        />

        <ProjectTable
          projects={filteredProjects}
          groupedProjects={groupedProjects}
        />
      </div>
    </Layout>
  );
}
