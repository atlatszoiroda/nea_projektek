import { Layout } from '@/components/layout/Layout';
import { ProjectMap } from '@/components/map/ProjectMap';
import { useProjectData } from '@/hooks/useProjectData';
import { Loader2, Map, X } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { loadGeoJsonData } from '@/lib/parquetLoader';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Terkep() {
  const {
    filteredProjects,
    loading,
    aggregatedData,
    filters,
    updateFilter,
    uniqueValues,
    resetFilters,
  } = useProjectData();

  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [allCities, setAllCities] = useState<string[]>([]);

  // Load all cities from GeoJSON for the search dropdown (independent of filters)
  useEffect(() => {
    loadGeoJsonData().then(data => {
      if (data && data.features) {
        const cities = data.features
          .map((f: any) => f.properties?.varos)
          .filter(Boolean)
          .sort((a: string, b: string) => a.localeCompare(b, 'hu'));

        // Remove duplicates if any
        setAllCities([...new Set(cities)] as string[]);
      }
    });
  }, []);

  const filteredAggregatedByCity = useMemo(() => {
    const acc: Record<string, { count: number; osszeg: number }> = {};
    for (const project of filteredProjects) {
      const city = project.szekhely_varos;
      if (!city) continue;

      if (!acc[city]) {
        acc[city] = { count: 0, osszeg: 0 };
      }
      acc[city].count += 1;
      acc[city].osszeg += filters.activeValueType === 'awarded' ? project.osszeg : project.tamogatas;
    }
    return acc;
  }, [filteredProjects, filters.activeValueType]);

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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <Map className="h-6 w-6 text-info" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Térkép</h1>
              <p className="text-muted-foreground">
                Pályázatok földrajzi eloszlása
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* City Search - Separated from filters */}
            <div className="flex items-center gap-2 border-r border-border pr-4 mr-2">
              <span className="text-sm font-medium text-muted-foreground">Város keresése:</span>
              <Select
                value={activeCity || ''}
                onValueChange={setActiveCity}
              >
                <SelectTrigger className="w-[200px] bg-background">
                  <SelectValue placeholder="Válassz várost..." />
                </SelectTrigger>
                <SelectContent className="z-[2000]">
                  {allCities.map((varos) => (
                    <SelectItem key={varos} value={varos}>
                      {varos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Szűrés:</span>

              <Select
                value={filters.dontes[0] || 'all'}
                onValueChange={(value) =>
                  updateFilter('dontes', value === 'all' ? [] : [value])
                }
              >
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="Döntés" />
                </SelectTrigger>
                <SelectContent className="z-[2000]">
                  <SelectItem value="all">Minden döntés</SelectItem>
                  {uniqueValues.dontesek.map((dontes) => (
                    <SelectItem key={dontes} value={dontes}>
                      {dontes}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.besorolas[0] || 'all'}
                onValueChange={(value) =>
                  updateFilter('besorolas', value === 'all' ? [] : [value])
                }
              >
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="Besorolás" />
                </SelectTrigger>
                <SelectContent className="z-[2000]">
                  <SelectItem value="all">Minden besorolás</SelectItem>
                  {uniqueValues.besorolasok.map((besorolas) => (
                    <SelectItem key={besorolas} value={besorolas}>
                      {besorolas}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.szervezet_tipusa[0] || 'all'}
                onValueChange={(value) =>
                  updateFilter('szervezet_tipusa', value === 'all' ? [] : [value])
                }
              >
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="Szervezet típusa" />
                </SelectTrigger>
                <SelectContent className="z-[2000]">
                  <SelectItem value="all">Minden típus</SelectItem>
                  {uniqueValues.szervezetTipusok.map((tipus) => (
                    <SelectItem key={tipus} value={tipus}>
                      {tipus}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Support Type Toggle */}
              <div className="flex items-center rounded-md border border-border bg-secondary p-1">
                <button
                  onClick={() => updateFilter('activeValueType', 'awarded')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-all ${filters.activeValueType === 'awarded'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  Megítélt
                </button>
                <button
                  onClick={() => updateFilter('activeValueType', 'requested')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-all ${filters.activeValueType === 'requested'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  Igényelt
                </button>
              </div>

              {(activeCity || filters.dontes.length > 0 || filters.besorolas.length > 0 || filters.szervezet_tipusa.length > 0) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    resetFilters();
                    setActiveCity(null);
                  }}
                  title="Szűrők törlése"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <ProjectMap
          key={`${filters.dontes.join('-')}-${filters.besorolas.join('-')}-${filters.szervezet_tipusa.join('-')}-${filters.activeValueType}`}
          projects={filteredProjects}
          aggregatedByCity={filteredAggregatedByCity}
          activeCity={activeCity}
        />
      </div>
    </Layout>
  );
}
