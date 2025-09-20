import {IApiResponse, IPageableList} from "@/types";

class StudentAttemptService {
    async getAttemptHistory(
        accessToken: string,
        signal?: AbortSignal,
        params?: { status?: string; page?: number; size?: number }
    ): Promise<IPageableList<StudentAttemptDTO>> {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.page !== undefined) queryParams.append('page', String(params.page));
        if (params?.size !== undefined) queryParams.append('size', String(params.size));

        const endpoint = `/student/attempts/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response: IApiResponse<IPageableList<?>> = await apiClient.get(
            endpoint,
            accessToken,
            signal
        );
        return extractApiData(response);
    }

}