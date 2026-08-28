import { useEffect, useRef, useState, type ReactNode } from 'react';

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: 'd1' | 'd2' | 'd3' | 'd4';
};

export const Reveal = ({ children, className = '', delay }: RevealProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`translate-y-[26px] opacity-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        delay === 'd1'
          ? 'delay-75'
          : delay === 'd2'
            ? 'delay-150'
            : delay === 'd3'
              ? 'delay-200'
              : delay === 'd4'
                ? 'delay-300'
                : ''
      } ${visible ? 'translate-y-0 opacity-100' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
