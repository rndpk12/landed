export const BrandLogo = ({ className = '' }: { className?: string }) => (
  <span className={`inline-flex items-center gap-2 font-black tracking-[-0.06em] text-black ${className}`}>
    <span aria-hidden="true" className="relative inline-block h-[1em] w-[0.8em] border-b-[0.18em] border-black before:absolute before:left-[0.1em] before:top-0 before:h-[0.35em] before:w-[0.35em] before:bg-black after:absolute after:bottom-[0.08em] after:right-0 after:h-[0.25em] after:w-[0.25em] after:bg-[#f97316]" />
    <span className="text-[1.1em]">landed<span className="text-[#f97316]">.</span></span>
  </span>
);
