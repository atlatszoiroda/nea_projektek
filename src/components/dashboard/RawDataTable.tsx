import { useState } from 'react';
import { Project } from '@/types/project';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RawDataTableProps {
    projects: Project[];
    maxRows?: number;
}

type SortField = keyof Project;
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
    'Érvénytelen': 'bg-muted text-foreground border-border',
    'Várólistás': 'bg-warning/20 text-warning border-warning/30',
};

export function RawDataTable({ projects, maxRows }: RawDataTableProps) {
    const [sortField, setSortField] = useState<SortField>('tamogatas');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [page, setPage] = useState(0);
    const rowsPerPage = maxRows || 20;

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const sortedData = [...projects].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        const aString = String(aValue || '');
        const bString = String(bValue || '');

        return sortDirection === 'asc'
            ? aString.localeCompare(bString, 'hu')
            : bString.localeCompare(aString, 'hu');
    });

    const paginatedData = sortedData.slice(
        page * rowsPerPage,
        (page + 1) * rowsPerPage
    );

    const totalPages = Math.ceil(projects.length / rowsPerPage);

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ?
            <ChevronUp className="h-4 w-4" /> :
            <ChevronDown className="h-4 w-4" />;
    };

    const headers: { id: SortField; label: string; className?: string }[] = [
        { id: 'azonosito', label: 'Azonosító', className: 'w-[120px]' },
        { id: 'szervezet_neve', label: 'Szervezet neve', className: 'w-[25%] min-w-[200px]' },
        { id: 'adoszama', label: 'Adószám', className: 'w-[120px]' },
        { id: 'szekhely_varos', label: 'Város', className: 'w-[15%] min-w-[120px]' },
        { id: 'besorolas', label: 'Besorolás', className: 'w-[15%] min-w-[120px]' },
        { id: 'tamogatas', label: 'Támogatás', className: 'w-[130px] text-right' },
        { id: 'palyazati_dontes', label: 'Döntés', className: 'w-[130px]' },
        { id: 'palyazat_targya', label: 'Pályázat tárgya', className: 'w-[30%] min-w-[300px]' },
    ];

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="scrollbar-thin max-h-[600px] overflow-auto">
                    <table className="data-table w-full text-sm table-fixed">
                        <thead className="sticky top-0 z-10 bg-muted/50">
                            <tr>
                                {headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className={`cursor-pointer hover:bg-muted/80 px-4 py-3 text-left font-medium text-foreground ${header.className || ''}`}
                                        onClick={() => handleSort(header.id)}
                                    >
                                        <div className={`flex items-center gap-1 ${header.className?.includes('text-right') ? 'justify-end' : ''}`}>
                                            {header.label}
                                            <SortIcon field={header.id} />
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {paginatedData.map((project, idx) => (
                                <tr key={`${project.azonosito}-${idx}`} className="group hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-3 font-mono !text-[10px] text-foreground whitespace-nowrap">
                                        {project.azonosito}
                                    </td>
                                    <td className="px-4 py-3 font-medium truncate" title={project.szervezet_neve}>
                                        {project.szervezet_neve}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-foreground whitespace-nowrap">
                                        {project.adoszama}
                                    </td>
                                    <td className="px-4 py-3 truncate" title={project.szekhely_varos}>
                                        {project.szekhely_varos}
                                    </td>
                                    <td className="px-4 py-3 text-foreground truncate" title={project.besorolas}>
                                        {project.besorolas}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium tabular-nums whitespace-nowrap">
                                        {formatCurrency(project.tamogatas)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[project.palyazati_dontes] || 'bg-muted text-foreground border-border'}`}>
                                            {project.palyazati_dontes}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-foreground max-w-[400px] truncate" title={project.palyazat_targya}>
                                        {project.palyazat_targya}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, projects.length)} / {projects.length.toLocaleString('hu-HU')} projekt
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
