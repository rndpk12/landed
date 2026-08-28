import { useMatches } from 'react-router-dom';

export const usePageTitle = () => {
  const matches = useMatches();
  const current = [...matches].reverse().find((match) => (match.handle as { title?: string } | undefined)?.title);
  return ((current?.handle as { title?: string } | undefined)?.title ?? 'Dashboard');
};
