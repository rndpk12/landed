import { Download, FileUp, RotateCcw, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { liteStore } from '../lib/store';

const download = (filename: string, content: string, type: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const LiteSettingsPage = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const exportJson = () => { download(`landed-lite-backup-${new Date().toISOString().slice(0, 10)}.json`, liteStore.export(), 'application/json'); setMessage('Your Lite backup has downloaded.'); };
  const exportCsv = () => {
    const columns = ['company', 'role', 'location', 'status', 'jobUrl', 'description', 'notes', 'createdAt', 'updatedAt'] as const;
    const escape = (value: string | undefined) => `"${(value ?? '').replace(/"/g, '""')}"`;
    const rows = liteStore.list().map((application) => columns.map((column) => escape(application[column])).join(','));
    download(`landed-lite-applications-${new Date().toISOString().slice(0, 10)}.csv`, [columns.join(','), ...rows].join('\n'), 'text/csv');
    setMessage('Your CSV has downloaded.');
  };
  const importBackup = async (file?: File) => {
    if (!file) return;
    try { const count = liteStore.import(await file.text()); setMessage(`Imported ${count} application${count === 1 ? '' : 's'}.`); } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not import that backup.'); }
    if (inputRef.current) inputRef.current.value = '';
  };
  const clear = () => { if (window.confirm('Permanently remove every Landed Lite application in this browser?')) { liteStore.clear(); setMessage('All local Lite data was removed.'); } };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#f97316]">Landed Lite</p><h1 className="mt-1 text-4xl font-black uppercase">Your data</h1><p className="mt-3 font-bold text-[#666]">Landed Lite saves your applications in this browser only. Back up before you clear browser data or change devices.</p></div>
      <section className="border-[4px] border-black bg-white shadow-[6px_6px_0_#000]"><div className="border-b-[3px] border-black bg-[#f5ead8] p-4"><h2 className="text-lg font-black uppercase">Backup and restore</h2></div><div className="grid gap-4 p-5 sm:grid-cols-2"><button className="btn-primary" type="button" onClick={exportJson}><Download className="h-4 w-4" /> Export JSON backup</button><button className="btn-secondary" type="button" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</button><button className="btn-secondary sm:col-span-2" type="button" onClick={() => inputRef.current?.click()}><FileUp className="h-4 w-4" /> Import JSON backup</button><input accept="application/json,.json" className="hidden" ref={inputRef} type="file" onChange={(event) => void importBackup(event.target.files?.[0])} /></div></section>
      <section className="border-[4px] border-black bg-white shadow-[6px_6px_0_#000]"><div className="border-b-[3px] border-black bg-[#ffe5e5] p-4"><h2 className="text-lg font-black uppercase">Danger zone</h2></div><div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-black">Clear local Lite data</p><p className="mt-1 text-sm font-bold text-[#666]">This cannot be undone unless you exported a backup.</p></div><button className="btn-secondary border-[#b42318] text-[#b42318] hover:bg-[#ffe5e5]" type="button" onClick={clear}><Trash2 className="h-4 w-4" /> Clear data</button></div></section>
      {message ? <p className="flex items-center gap-2 border-[3px] border-black bg-[#96d35f] p-4 text-sm font-black"><RotateCcw className="h-4 w-4" /> {message}</p> : null}
    </div>
  );
};
