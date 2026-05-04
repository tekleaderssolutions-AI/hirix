import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export function useUploadCandidates() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ formData, jobCode }) => {
      // Try using job_code instead of job_id to match analyzeJob pattern
      const url = jobCode ? `/candidates/upload?job_code=${jobCode}` : '/candidates/upload';
      return api.post(url, formData).then((r) => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
}
