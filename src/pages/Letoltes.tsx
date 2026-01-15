import { Layout } from '@/components/layout/Layout';
import { useProjectData } from '@/hooks/useProjectData';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { RawDataTable } from '@/components/dashboard/RawDataTable';

export default function Letoltes() {
  const { projects, loading } = useProjectData();
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadCSV = async () => {
    setDownloading('full-csv');

    await new Promise(resolve => setTimeout(resolve, 500));

    const headers = [
      'Azonosító', 'Szervezet neve', 'Adószám', 'Besorolás', 'Székhely város',
      'Székhely ország', 'Szervezet típusa', 'Támogatás', 'Pályázati döntés', 'Pályázat tárgya'
    ];

    const rows = projects.map(p => [
      p.azonosito,
      `"${(p.szervezet_neve || '').replace(/"/g, '""')}"`,
      p.adoszama,
      `"${(p.besorolas || '').replace(/"/g, '""')}"`,
      p.szekhely_varos,
      p.szekhely_orszag,
      `"${(p.szervezet_tipusa || '').replace(/"/g, '""')}"`,
      p.tamogatas,
      p.palyazati_dontes,
      `"${(p.palyazat_targya || '').replace(/"/g, '""')}"`
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `nea-osszes-projekt.csv`;
    link.click();

    URL.revokeObjectURL(url);
    setDownloading(null);
  };

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Adatok letöltése</h1>
              <p className="text-muted-foreground">
                {projects.length.toLocaleString('hu-HU')} projekt
              </p>
            </div>
          </div>

          <Button
            onClick={downloadCSV}
            disabled={downloading !== null}
            size="lg"
            className="gap-2"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            Összes adat exportálása (.csv)
          </Button>
        </div>

        <RawDataTable projects={projects} />
      </div>
    </Layout>
  );
}
