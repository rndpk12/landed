export const LoadingSpinner = ({ label = 'Loading' }: { label?: string }) => (
  <div className="flex min-h-40 items-center justify-center gap-3 text-sm text-slate-500">
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-primary-600" />
    {label}
  </div>
);
