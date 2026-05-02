import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useCandidates(filters = {}) {
  return useQuery({
    queryKey: ['candidates', filters],
    queryFn: () => api.get('/candidates', { params: filters }).then((r) => r.data),
  });
}

export function useCandidate(id) {
  return useQuery({
    queryKey: ['candidates', id],
    queryFn: () => api.get(`/candidates/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}
