import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

const STORAGE_KEY = 'schoolsync:last-data-version';

const parseVersion = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function useDataVersionSync(enabled) {
  const queryClient = useQueryClient();

  const versionQuery = useQuery({
    queryKey: ['meta', 'data-version'],
    enabled,
    queryFn: async () => {
      const response = await api.get('/meta/data-version', {
        cache: false,
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      return parseVersion(response.data?.version);
    },
    staleTime: 0,
    gcTime: 1000 * 60,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    retry: 0,
  });

  useEffect(() => {
    if (!enabled) {
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }

    const currentVersion = parseVersion(versionQuery.data);
    if (currentVersion <= 0) return;

    const lastVersion = parseVersion(sessionStorage.getItem(STORAGE_KEY));
    if (lastVersion > 0 && currentVersion > lastVersion) {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey?.[0] !== 'meta',
      });
    }

    sessionStorage.setItem(STORAGE_KEY, String(currentVersion));
  }, [enabled, queryClient, versionQuery.data]);
}
