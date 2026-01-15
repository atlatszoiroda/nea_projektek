import { useState } from 'react';
import { Project, GroupedProject } from '@/types/project';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectTableProps {
  projects: Project[];
  groupedProjects?: GroupedProject[] | null;
  maxRows?: number;
}

type SortField = 'palyazat_targya' | 'szervezet_neve' | 'szekhely_varos' | 'tamogatas' | 'palyazati_dontes';
type SortDirection = 'asc' | 'desc';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'HUF',
    maximumFractionDigits: 0,
  }).format(amount);
}

const statusColors: Record<string, string> = {
  'Nyertes': 'bg-success/20 text-success border-success/30',
  'nyertes': 'bg-success/20 text-success border-success/30',
  'Nem támogatott': 'bg-destructive/20 text-destructive border-destructive/30',
  'nem támogatott': 'bg-destructive/20 text-destructive border-destructive/30',
  'Elutasított': 'bg-destructive/20 text-destructive border-destructive/30',
  'elutasított': 'bg-destructive/20 text-destructive border-destructive/30',
  'Érvénytelen': 'bg-muted text-muted-foreground border-border',
  'Várólistás': 'bg-warning/20 text-warning border-warning/30',
};

export function ProjectTable({ projects, groupedProjects, maxRows }: ProjectTableProps) {
  const [sortField, setSortField] = useState<SortField>('tamogatas');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(0);
  const rowsPerPage = maxRows || 20;

  const isGrouped = !!groupedProjects;
  const currentData = isGrouped ? groupedProjects : projects;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = [...(currentData || [])].sort((a, b) => {
    let comparison = 0;

    // Type guard for GroupedProject vs Project sorting
    if ('palyazat_targya' in a && 'palyazat_targya' in b) {
      // Sorting for Project
      const pA = a as Project;
      const pB = b as Project;
      switch (sortField) {
        case 'palyazat_targya':
        case 'szervezet_neve':
        case 'szekhely_varos':
        case 'palyazati_dontes':
          comparison = (pA[sortField] || '').localeCompare(pB[sortField] || '', 'hu');
          break;
        case 'tamogatas':
          comparison = pA[sortField] - pB[sortField];
          break;
      }
    } else {
      // Sorting for GroupedProject
      const gA = a as GroupedProject;
      const gB = b as GroupedProject;
      if (sortField === 'tamogatas') {
        comparison = gA.tamogatas - gB.tamogatas;
      } else if (sortField === 'szervezet_neve') {
        comparison = gA.name.localeCompare(gB.name, 'hu');
      }
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  const totalPages = Math.ceil((currentData?.length || 0) / rowsPerPage);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ?
      <ChevronUp className="h-4 w-4" /> :
      <ChevronDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="scrollbar-thin max-h-[600px] overflow-auto">
          <table className="data-table table-fixed w-full">
            <thead className="sticky top-0 z-10">
              <tr>

                <th className="w-[120px] px-4 py-3 text-left">Azonosító</th>
                <th
                  className="w-[30%] min-w-[200px] cursor-pointer hover:bg-muted/80 px-4 py-3 text-left"
                  onClick={() => handleSort('szervezet_neve')}
                >
                  <div className="flex items-center gap-1">
                    Szervezet
                    <SortIcon field="szervezet_neve" />
                  </div>
                </th>
                <th
                  className="w-[15%] min-w-[150px] cursor-pointer hover:bg-muted/80 px-4 py-3 text-left"
                  onClick={() => handleSort('szekhely_varos')}
                >
                  <div className="flex items-center gap-1">
                    Város
                    <SortIcon field="szekhely_varos" />
                  </div>
                </th>
                <th className="w-[15%] min-w-[150px] px-4 py-3 text-left">Besorolás</th>
                <th
                  className="w-[160px] cursor-pointer hover:bg-muted/80 px-4 py-3 text-right"
                  onClick={() => handleSort('tamogatas')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Támogatás
                    <SortIcon field="tamogatas" />
                  </div>
                </th>
                <th
                  className="w-[140px] cursor-pointer hover:bg-muted/80 px-4 py-3 text-left"
                  onClick={() => handleSort('palyazati_dontes')}
                >
                  <div className="flex items-center gap-1">
                    Döntés
                    <SortIcon field="palyazati_dontes" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {isGrouped ? (
                (paginatedData as GroupedProject[]).map((group, idx) => (
                  <tr key={`${group.id}-${idx}`} className="group">
                    <td colSpan={2}>
                      <div className="font-medium">{group.name}</div>
                      {group.adoszama && (
                        <div className="text-xs text-muted-foreground font-mono">{group.adoszama}</div>
                      )}
                    </td>
                    <td colSpan={2} className="text-muted-foreground">
                      {group.count} db projekt
                    </td>
                    <td className="text-right font-bold tabular-nums text-primary">
                      {formatCurrency(group.tamogatas)}
                    </td>
                    <td></td>
                  </tr>
                ))
              ) : (
                (paginatedData as Project[]).map((project, idx) => (
                  <tr key={`${project.azonosito}-${idx}`} className="group border-b border-border/50 last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3 align-top">
                      <span className="font-mono text-xs text-muted-foreground">{project.azonosito}</span>

                    </td>
                    <td className="max-w-[250px] px-4 py-3 align-top">
                      <div className="truncate font-medium">{project.szervezet_neve}</div>
                      <div className="text-xs text-muted-foreground font-mono">{project.adoszama}</div>
                    </td>
                    <td className="px-4 py-3 align-top">{project.szekhely_varos}</td>
                    <td className="max-w-[150px] truncate px-4 py-3 align-top text-muted-foreground">{project.besorolas}</td>
                    <td className="px-4 py-3 align-top text-right font-medium tabular-nums">
                      {formatCurrency(project.tamogatas)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[project.palyazati_dontes] || 'bg-muted text-muted-foreground border-border'}`}>
                        {project.palyazati_dontes}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, currentData?.length || 0)} / {(currentData?.length || 0).toLocaleString('hu-HU')} {isGrouped ? 'csoport' : 'projekt'}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
            >
              Előző
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
            >
              Következő
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
