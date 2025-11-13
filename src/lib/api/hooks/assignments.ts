/**
 * React Query hooks for assignment operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { assignmentsApi, type AssignmentCreateRequest, type AssignmentListParams } from '@/lib/api/endpoints/assignments';
import { queryKeys } from '@/lib/query/keys';

/**
 * Get assignments (instructor view)
 */
export const useAssignments = (params?: AssignmentListParams) => {
  return useQuery({
    queryKey: queryKeys.assignments.list(params),
    queryFn: async () => {
      const response = await assignmentsApi.getAll(params);
      return response.data;
    },
  });
};

/**
 * Get single assignment by ID (instructor)
 */
export const useAssignment = (id: number, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.assignments.detail(id),
    queryFn: async () => {
      const response = await assignmentsApi.getById(id);
      return response.data;
    },
    enabled: enabled && !!id,
  });
};

/**
 * Get student assignments
 */
export const useStudentAssignments = (params?: AssignmentListParams) => {
  return useQuery({
    queryKey: [...queryKeys.assignments.lists(), 'student', params],
    queryFn: async () => {
      const response = await assignmentsApi.getStudentAssignments(params);
      return response.data;
    },
  });
};

/**
 * Get single student assignment
 */
export const useStudentAssignment = (id: number, enabled = true) => {
  return useQuery({
    queryKey: [...queryKeys.assignments.detail(id), 'student'],
    queryFn: async () => {
      const response = await assignmentsApi.getStudentAssignment(id);
      return response.data;
    },
    enabled: enabled && !!id,
  });
};

/**
 * Create a new assignment
 */
export const useCreateAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AssignmentCreateRequest) => {
      const response = await assignmentsApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
      toast.success('Assignment created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create assignment');
    },
  });
};

/**
 * Delete an assignment
 */
export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await assignmentsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
      toast.success('Assignment deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete assignment');
    },
  });
};
