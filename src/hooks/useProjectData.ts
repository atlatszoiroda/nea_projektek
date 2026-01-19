import { useState, useEffect, useMemo } from 'react';
import { Project, FilterState, AggregatedData, GroupedProject } from '@/types/project';
import { loadParquetData } from '@/lib/parquetLoader';

const normalizeText = (text: string | null | undefined): string => {
  if (!text) return '';
  const trimmed = String(text).trim();
  if (trimmed.length === 0) return '';

  // Convert to Title Case: "NEW YORK" -> "New York", "budapest" -> "Budapest"
  return trimmed.toLowerCase().split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const defaultFilters: FilterState = {
  searchQuery: '',
  dontes: [],
  varos: [],
  besorolas: [],
  szervezet_tipusa: [],
  minOsszeg: 0,
  maxOsszeg: Infinity,
  groupBy: 'none',
  activeValueType: 'awarded',
};

export function useProjectData(initialFilters?: Partial<FilterState>) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters
  });

  useEffect(() => {
    loadParquetData()
      .then(data => {
        // Normalize text fields to avoid duplicates (e.g. "Egyesület" vs "egyesület")
        const normalizedData = data.map(project => ({
          ...project,
          palyazati_dontes: normalizeText(project.palyazati_dontes),
          szekhely_varos: normalizeText(project.szekhely_varos),
          besorolas: normalizeText(project.besorolas),
          szervezet_tipusa: normalizeText(project.szervezet_tipusa),
        }));
        setProjects(normalizedData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredProjects = useMemo(() => {
    const getValue = (p: Project) => filters.activeValueType === 'awarded' ? p.osszeg : p.tamogatas;

    return projects.filter(project => {
      // Search query - search by name, organization+tax number, city, id
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchFields = [
          project.palyazat_targya,
          project.szervezet_neve,
          project.adoszama,
          project.szekhely_varos,
          project.azonosito,
          project.besorolas,
        ].map(f => String(f || '').toLowerCase());

        if (!searchFields.some(f => f.includes(query))) {
          return false;
        }
      }

      // Decision filter
      if (filters.dontes.length > 0 && !filters.dontes.includes(project.palyazati_dontes)) {
        return false;
      }

      // City filter
      if (filters.varos.length > 0 && !filters.varos.includes(project.szekhely_varos)) {
        return false;
      }

      // Classification filter
      if (filters.besorolas.length > 0 && !filters.besorolas.includes(project.besorolas)) {
        return false;
      }

      // Organization type filter
      if (filters.szervezet_tipusa.length > 0 && !filters.szervezet_tipusa.includes(project.szervezet_tipusa)) {
        return false;
      }

      // Amount range
      const value = getValue(project);
      if (value < filters.minOsszeg) {
        return false;
      }
      if (filters.maxOsszeg !== Infinity && value > filters.maxOsszeg) {
        return false;
      }

      return true;
    });
  }, [projects, filters]);

  const aggregatedData: AggregatedData = useMemo(() => {
    const data: AggregatedData = {
      osszesOsszeg: 0,
      projektekSzama: filteredProjects.length,
      atlagOsszeg: 0,
      varosokSzerint: {},
      besorolasSzerint: {},
      dontesSzerint: {},
      szervezetTipusSzerint: {},
    };

    filteredProjects.forEach(project => {
      const isNyertes = project.palyazati_dontes?.toLowerCase() === 'nyertes';
      const value = filters.activeValueType === 'awarded' ? project.osszeg : project.tamogatas;

      data.osszesOsszeg += value;

      // By city
      if (!data.varosokSzerint[project.szekhely_varos]) {
        data.varosokSzerint[project.szekhely_varos] = { count: 0, osszeg: 0 };
      }
      data.varosokSzerint[project.szekhely_varos].count++;
      data.varosokSzerint[project.szekhely_varos].osszeg += value;

      // By classification
      if (!data.besorolasSzerint[project.besorolas]) {
        data.besorolasSzerint[project.besorolas] = { count: 0, osszeg: 0 };
      }
      data.besorolasSzerint[project.besorolas].count++;
      data.besorolasSzerint[project.besorolas].osszeg += value;

      // By decision
      if (!data.dontesSzerint[project.palyazati_dontes]) {
        data.dontesSzerint[project.palyazati_dontes] = { count: 0, osszeg: 0 };
      }
      data.dontesSzerint[project.palyazati_dontes].count++;
      data.dontesSzerint[project.palyazati_dontes].osszeg += value;

      // By organization type
      if (!data.szervezetTipusSzerint[project.szervezet_tipusa]) {
        data.szervezetTipusSzerint[project.szervezet_tipusa] = { count: 0, osszeg: 0 };
      }
      data.szervezetTipusSzerint[project.szervezet_tipusa].count++;
      data.szervezetTipusSzerint[project.szervezet_tipusa].osszeg += value;
    });

    const nyertesTotalCount = (data.dontesSzerint['Nyertes']?.count || 0) + (data.dontesSzerint['nyertes']?.count || 0);
    data.atlagOsszeg = nyertesTotalCount > 0
      ? data.osszesOsszeg / nyertesTotalCount
      : 0;

    return data;
  }, [filteredProjects, filters.activeValueType]);

  const globalStats = useMemo(() => {
    const winners = projects.filter(p => p.palyazati_dontes?.toLowerCase() === 'nyertes');
    const totalWinners = winners.length;
    const getValue = (p: Project) => filters.activeValueType === 'awarded' ? p.osszeg : p.tamogatas;
    const totalSupport = winners.reduce((sum, p) => sum + getValue(p), 0);
    const averageWinnerSupport = totalWinners > 0 ? totalSupport / totalWinners : 0;

    return {
      totalWinners,
      averageWinnerSupport
    };
  }, [projects, filters.activeValueType]);

  const groupedProjects = useMemo(() => {
    if (!filters.groupBy || filters.groupBy === 'none') return null;

    const groups: Record<string, GroupedProject> = {};

    filteredProjects.forEach(project => {
      let key = '';
      let name = '';
      let adoszama: string | undefined = undefined;

      switch (filters.groupBy) {
        case 'szervezet':
          key = `${project.szervezet_neve}-${project.adoszama}`;
          name = project.szervezet_neve;
          adoszama = project.adoszama;
          break;
        case 'varos':
          key = project.szekhely_varos;
          name = project.szekhely_varos;
          break;
        case 'besorolas':
          key = project.besorolas;
          name = project.besorolas;
          break;
        case 'szervezet_tipusa':
          key = project.szervezet_tipusa;
          name = project.szervezet_tipusa;
          break;
        case 'dontes':
          key = project.palyazati_dontes;
          name = project.palyazati_dontes;
          break;
      }

      if (!groups[key]) {
        groups[key] = {
          id: key,
          name,
          adoszama,
          count: 0,
          osszeg: 0,
          tamogatas: 0,
        };
      }
      groups[key].count++;
      groups[key].osszeg += project.osszeg;
      groups[key].tamogatas += project.tamogatas;
    });

    return Object.values(groups).sort((a, b) => b.osszeg - a.osszeg);
  }, [filteredProjects, filters.groupBy, filters.activeValueType]);

  const uniqueValues = useMemo(() => {
    // Calculate total amounts per category for sorting
    const decisionAmounts: Record<string, number> = {};
    const classificationAmounts: Record<string, number> = {};
    const orgTypeAmounts: Record<string, number> = {};

    projects.forEach(p => {
      const value = filters.activeValueType === 'awarded' ? p.osszeg : p.tamogatas;
      // Decision
      if (p.palyazati_dontes) {
        decisionAmounts[p.palyazati_dontes] = (decisionAmounts[p.palyazati_dontes] || 0) + value;
      }
      // Classification
      if (p.besorolas) {
        classificationAmounts[p.besorolas] = (classificationAmounts[p.besorolas] || 0) + value;
      }
      // Organization Type
      if (p.szervezet_tipusa) {
        orgTypeAmounts[p.szervezet_tipusa] = (orgTypeAmounts[p.szervezet_tipusa] || 0) + value;
      }
    });

    return {
      varosok: [...new Set(projects.map(p => p.szekhely_varos))].filter(Boolean).sort((a, b) => a.localeCompare(b, 'hu')),

      besorolasok: [...new Set(projects.map(p => p.besorolas))].filter(Boolean)
        .sort((a, b) => (classificationAmounts[b] || 0) - (classificationAmounts[a] || 0)),

      dontesek: [...new Set(projects.map(p => p.palyazati_dontes))].filter(Boolean)
        .sort((a, b) => (decisionAmounts[b] || 0) - (decisionAmounts[a] || 0)),

      szervezetTipusok: [...new Set(projects.map(p => p.szervezet_tipusa))].filter(Boolean)
        .sort((a, b) => (orgTypeAmounts[b] || 0) - (orgTypeAmounts[a] || 0)),
    };
  }, [projects, filters.activeValueType]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return {
    projects,
    filteredProjects,
    loading,
    error,
    filters,
    updateFilter,
    resetFilters,
    aggregatedData,
    globalStats,
    uniqueValues,
    groupedProjects,
  };
}
