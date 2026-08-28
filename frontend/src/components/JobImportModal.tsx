import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Link, Loader2, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { jobImportApi } from '../services/jobImportApi';
import type { JobImportResponse } from '../types/jobImport';

interface JobImportModalProps {
  onClose: () => void;
  onImported: (url: string, job: JobImportResponse) => void;
}

export const JobImportModal = ({ onClose, onImported }: JobImportModalProps) => {
  const [url, setUrl] = useState('');
  const importMutation = useMutation({ mutationFn: jobImportApi.importJob });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await importMutation.mutateAsync({ url: url.trim() });
    onImported(url.trim(), result);
  };

  const imported = importMutation.data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-5 backdrop-blur-sm">
      <form
        className="max-h-[86dvh] w-full max-w-lg overflow-y-auto border-[4px] border-black bg-[#fffaf1] p-5 text-black shadow-[8px_8px_0_#000]"
        onSubmit={onSubmit}
      >
        <div className="mb-5 flex items-start justify-between gap-4 border-b-[3px] border-black pb-4">
          <div>
            <h3 className="text-xl font-black uppercase text-black">Import from Job URL</h3>
            <p className="mt-1 text-xs font-bold leading-5 text-[#555]">Paste a posting from LinkedIn, Greenhouse, Lever, Workday, Ashby, Naukri, or a company career page.</p>
          </div>
          <button
            className="grid h-10 w-10 shrink-0 place-items-center border-[3px] border-black bg-white text-black shadow-[3px_3px_0_#000] transition hover:-translate-y-0.5 hover:bg-[#f9d44a]"
            type="button"
            onClick={onClose}
            aria-label="Close import modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="text-xs font-black uppercase text-black" htmlFor="job-import-url">Job URL</label>
        <div className="mt-2 flex items-center gap-2 border-[3px] border-black bg-white px-3 py-2 shadow-[3px_3px_0_rgba(0,0,0,0.18)]">
          <Link className="h-4 w-4 text-[#f97316]" />
          <input
            id="job-import-url"
            className="w-full bg-transparent text-sm font-bold text-black outline-none placeholder:text-[#9a9489]"
            placeholder="https://company.com/careers/jobs/..."
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            required
          />
        </div>

        {importMutation.isPending ? (
          <div className="mt-4 flex items-center gap-2 border-[3px] border-black bg-[#fff6e8] px-3 py-2 text-xs font-black uppercase text-[#7a3515]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Importing job details...
          </div>
        ) : null}

        {importMutation.isError ? (
          <div className="mt-4 border-[3px] border-[#dc2626] bg-[#fee2e2] px-3 py-2 text-xs font-black text-[#991b1b]">
            {importMutation.error.message}
          </div>
        ) : null}

        {imported ? (
          <div className="mt-4 border-[3px] border-black bg-[#dcfce7] px-3 py-2 text-xs font-bold text-[#166534]">
            <div className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-black uppercase">Job imported</p>
                <p className="mt-1">{[imported.role, imported.company].filter(Boolean).join(' at ') || 'The create form has been populated.'}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex justify-end gap-3">
          <button className="border-[3px] border-black bg-white px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0_#000] transition hover:-translate-y-0.5 hover:bg-[#f9d44a]" type="button" onClick={onClose}>Cancel</button>
          <button className="border-[3px] border-black bg-[#f97316] px-4 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0_#000] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={importMutation.isPending || !url.trim()}>
            {importMutation.isPending ? 'Importing...' : 'Import Job'}
          </button>
        </div>
      </form>
    </div>
  );
};
