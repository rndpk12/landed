export const LoadingSpinner = ({ label = 'Loading' }: { label?: string }) => (
  <div className="flex min-h-40 items-center justify-center gap-3 text-[12px] font-black uppercase tracking-wide text-black" role="status">
    <span
      aria-hidden="true"
      className="h-8 w-8 animate-spin border-[3px] border-black border-t-[#f97316] bg-[#fffaf1] shadow-[3px_3px_0_#000]"
    />
    <span>{label}</span>
  </div>
);
