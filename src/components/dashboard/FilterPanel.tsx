import { Search, X, Filter, BarChart2 } from 'lucide-react';
import { FilterState } from '@/types/project';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterPanelProps {
  filters: FilterState;
  uniqueValues: {
    varosok: string[];
    besorolasok: string[];
    dontesek: string[];
    szervezetTipusok: string[];
  };
  onUpdateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onResetFilters: () => void;
  showGrouping?: boolean;
  hiddenFilters?: string[];
}

export function FilterPanel({
  filters,
  uniqueValues,
  onUpdateFilter,
  onResetFilters,
  showGrouping = true,
  hiddenFilters = []
}: FilterPanelProps) {
  const hasActiveFilters =
    filters.searchQuery ||
    filters.dontes.length > 0 ||
    filters.varos.length > 0 ||
    filters.besorolas.length > 0 ||
    filters.szervezet_tipusa.length > 0 ||
    (filters.groupBy && filters.groupBy !== 'none');

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Keresés azonosító, szervezet, város, besorolás..."
          value={filters.searchQuery}
          onChange={(e) => onUpdateFilter('searchQuery', e.target.value)}
          className="search-input pl-10"
        />
        {filters.searchQuery && (
          <button
            onClick={() => onUpdateFilter('searchQuery', '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Szűrők:</span>
        </div>

        {/* Decision Filter */}
        <Select
          value={filters.dontes[0] || 'all'}
          onValueChange={(value) =>
            onUpdateFilter('dontes', value === 'all' ? [] : [value])
          }
        >
          <SelectTrigger className="w-44 bg-secondary border-border">
            <SelectValue placeholder="Döntés" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Minden döntés</SelectItem>
            {uniqueValues.dontesek.map(dontes => (
              <SelectItem key={dontes} value={dontes}>{dontes}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* City Filter */}
        {!hiddenFilters.includes('varos') && (
          <Select
            value={filters.varos[0] || 'all'}
            onValueChange={(value) =>
              onUpdateFilter('varos', value === 'all' ? [] : [value])
            }
          >
            <SelectTrigger className="w-44 bg-secondary border-border">
              <SelectValue placeholder="Város" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Minden város</SelectItem>
              {uniqueValues.varosok.map(varos => (
                <SelectItem key={varos} value={varos}>{varos}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Classification Filter */}
        <Select
          value={filters.besorolas[0] || 'all'}
          onValueChange={(value) =>
            onUpdateFilter('besorolas', value === 'all' ? [] : [value])
          }
        >
          <SelectTrigger className="w-48 bg-secondary border-border">
            <SelectValue placeholder="Besorolás" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Minden besorolás</SelectItem>
            {uniqueValues.besorolasok.map(besorolas => (
              <SelectItem key={besorolas} value={besorolas}>{besorolas}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Organization Type Filter */}
        <Select
          value={filters.szervezet_tipusa[0] || 'all'}
          onValueChange={(value) =>
            onUpdateFilter('szervezet_tipusa', value === 'all' ? [] : [value])
          }
        >
          <SelectTrigger className="w-48 bg-secondary border-border">
            <SelectValue placeholder="Szervezet típusa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Minden típus</SelectItem>
            {uniqueValues.szervezetTipusok.map(tipus => (
              <SelectItem key={tipus} value={tipus}>{tipus}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Grouping Filter - Hide if showGrouping is false */}
        {showGrouping && (
          <div className="flex items-center gap-2 border-l border-border pl-3 ml-1">
            <BarChart2 className="h-4 w-4 text-primary" />
            <Select
              value={filters.groupBy || 'none'}
              onValueChange={(value) => onUpdateFilter('groupBy', value as any)}
            >
              <SelectTrigger className="w-48 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 transition-colors">
                <SelectValue placeholder="Csoportosítás" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nincs csoportosítás</SelectItem>
                <SelectItem value="szervezet">Nyertes pályázó szerint</SelectItem>
                <SelectItem value="varos">Város szerint</SelectItem>
                <SelectItem value="besorolas">Besorolás szerint</SelectItem>
                <SelectItem value="szervezet_tipusa">Szervezet típusa szerint</SelectItem>
                <SelectItem value="dontes">Döntés szerint</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            Szűrők törlése
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.searchQuery && (
            <span className="filter-chip active">
              Keresés: {filters.searchQuery}
              <button onClick={() => onUpdateFilter('searchQuery', '')}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.dontes.map(d => (
            <span key={d} className="filter-chip active">
              {d}
              <button onClick={() => onUpdateFilter('dontes', filters.dontes.filter(x => x !== d))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {filters.varos.map(v => (
            <span key={v} className="filter-chip active">
              {v}
              <button onClick={() => onUpdateFilter('varos', filters.varos.filter(x => x !== v))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {filters.besorolas.map(b => (
            <span key={b} className="filter-chip active">
              {b}
              <button onClick={() => onUpdateFilter('besorolas', filters.besorolas.filter(x => x !== b))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {filters.szervezet_tipusa.map(t => (
            <span key={t} className="filter-chip active">
              {t}
              <button onClick={() => onUpdateFilter('szervezet_tipusa', filters.szervezet_tipusa.filter(x => x !== t))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {showGrouping && filters.groupBy && filters.groupBy !== 'none' && (
            <span className="filter-chip active bg-primary/20 text-primary border-primary/30">
              Csoportosítás: {
                filters.groupBy === 'szervezet' ? 'Nyertes pályázó' :
                  filters.groupBy === 'varos' ? 'Város' :
                    filters.groupBy === 'besorolas' ? 'Besorolás' :
                      filters.groupBy === 'szervezet_tipusa' ? 'Szervezet típusa' :
                        filters.groupBy === 'dontes' ? 'Döntés' : filters.groupBy
              }
              <button onClick={() => onUpdateFilter('groupBy', 'none')}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
