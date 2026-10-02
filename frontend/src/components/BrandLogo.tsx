type BrandLogoProps = {
  className?: string;
  variant?: 'lockup' | 'wordmark';
};

export const BrandLogo = ({ className = '', variant = 'lockup' }: BrandLogoProps) => (
  <img
    alt="Landed"
    className={className}
    src={variant === 'wordmark' ? '/landed-lockup.svg' : '/landed-lockup-full.svg'}
  />
);
