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
    const response: IApiResponse<IPageableList<AssignmentDTO>> =
      await apiClient.get('/instructor/assignments', {
        token: accessToken,
        signal,
        query: {
          page: filter.page,
          size: filter.size,
          search: filter.search,
          status: filter.status,
        },
      });
    return extractApiData(response);
  }
}
