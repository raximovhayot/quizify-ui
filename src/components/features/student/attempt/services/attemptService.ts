import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';

import {
  attemptDataSchema,
  attemptQuestionSchema,
  attemptResultSchema,
  questionResultSchema,
} from '../schemas/attemptSchema';
import {
  AttemptData,
  AttemptQuestion,
  AttemptResult,
  QuestionResult,
  SubmitAnswerRequest,
} from '../types/attempt';

/**
 * StudentAttemptService - Handles student quiz attempt operations
 */
export class StudentAttemptService {
  /**
   * Start a new attempt for an assignment
   */
  static async startAttempt(
    assignmentId: number,
    accessToken: string,
    signal?: AbortSignal
  ): Promise<AttemptData> {
    const response: IApiResponse<AttemptData> = await apiClient.post(
      `/student/assignments/:id/attempts/start`,
      {},
      {
        token: accessToken,
        params: { id: assignmentId },
        signal,
      }
    );
    const data = extractApiData(response);
    return attemptDataSchema.parse(data);
  }

  /**
   * Get attempt details including questions
   */
  static async getAttempt(
    assignmentId: number,
    attemptId: number,
    accessToken: string,
    signal?: AbortSignal
  ): Promise<{
    attempt: AttemptData;
    questions: AttemptQuestion[];
  }> {
    const response: IApiResponse<{
      attempt: AttemptData;
      questions: AttemptQuestion[];
    }> = await apiClient.get(
      `/student/assignments/:assignmentId/attempts/:attemptId`,
      {
        token: accessToken,
        params: { assignmentId, attemptId },
        signal,
      }
    );
    const data = extractApiData(response);
    
    // Validate the response
    const attempt = attemptDataSchema.parse(data.attempt);
    const questions = data.questions.map((q: unknown) =>
      attemptQuestionSchema.parse(q)
    );

    return { attempt, questions };
  }

  /**
   * Submit an answer for a question
   */
  static async submitAnswer(
    assignmentId: number,
    attemptId: number,
    answerData: SubmitAnswerRequest,
    accessToken: string,
    signal?: AbortSignal
  ): Promise<void> {
    await apiClient.post(
      `/student/assignments/:assignmentId/attempts/:attemptId/answers`,
      answerData,
      {
        token: accessToken,
        params: { assignmentId, attemptId },
        signal,
      }
    );
  }

  /**
   * Submit the entire attempt (finish)
   */
  static async submitAttempt(
    assignmentId: number,
    attemptId: number,
    accessToken: string,
    signal?: AbortSignal
  ): Promise<AttemptResult> {
    const response: IApiResponse<AttemptResult> = await apiClient.post(
      `/student/assignments/:assignmentId/attempts/:attemptId/submit`,
      {},
      {
        token: accessToken,
        params: { assignmentId, attemptId },
        signal,
      }
    );
    const data = extractApiData(response);
    return attemptResultSchema.parse(data);
  }

  /**
   * Get attempt results
   */
  static async getAttemptResults(
    assignmentId: number,
    attemptId: number,
    accessToken: string,
    signal?: AbortSignal
  ): Promise<{
    result: AttemptResult;
    questions?: QuestionResult[];
  }> {
    const response: IApiResponse<{
      result: AttemptResult;
      questions?: QuestionResult[];
    }> = await apiClient.get(
      `/student/assignments/:assignmentId/attempts/:attemptId/results`,
      {
        token: accessToken,
        params: { assignmentId, attemptId },
        signal,
      }
    );
    const data = extractApiData(response);

    const result = attemptResultSchema.parse(data.result);
    const questions = data.questions?.map((q: unknown) =>
      questionResultSchema.parse(q)
    );

    return { result, questions };
  }
}
