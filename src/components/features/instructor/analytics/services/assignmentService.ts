import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';
import { IPageableList } from '@/types/common';

import { AssignmentDTO, AssignmentFilter } from '../types/assignment';

export class AssignmentService {
  static async getAssignments(
    filter: AssignmentFilter = {},
    accessToken: string,
    signal?: AbortSignal
  ): Promise<IPageableList<AssignmentDTO>> {
    const params = new URLSearchParams();
    if (filter.page !== undefined) params.append('page', String(filter.page));
    if (filter.size !== undefined) params.append('size', String(filter.size));
    if (filter.search) params.append('search', filter.search);
    if (filter.status) params.append('status', String(filter.status));

    const endpoint = `/instructor/assignments${params.toString() ? `?${params.toString()}` : ''}`;
    const response: IApiResponse<IPageableList<AssignmentDTO>> =
      await apiClient.get(endpoint, accessToken, signal);
    return extractApiData(response);
  }
}
