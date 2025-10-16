/* eslint-disable @typescript-eslint/no-explicit-any */
import { QuestionService } from '../questionService';
import { apiClient } from '@/lib/api';
import { QuestionType } from '../../types/question';

jest.mock('@/lib/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

type MockedApiClient = jest.Mocked<typeof apiClient>;
const mockedApi = apiClient as unknown as MockedApiClient;

describe('QuestionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sampleDto = {
    id: 1,
    questionType: QuestionType.MULTIPLE_CHOICE,
    content: 'What is 2+2?',
    order: 0,
    points: 1,
    answers: [],
  };

  describe('createQuestion', () => {
    it('posts to the correct endpoint and returns validated DTO', async () => {
      const payload = {
        quizId: 7,
        questionType: QuestionType.MULTIPLE_CHOICE,
        content: 'What is 2+2?',
        points: 1,
        order: 0,
        answers: [],
      };

      mockedApi.post.mockResolvedValue({ data: sampleDto, errors: [] });

      const result = await QuestionService.createQuestion(payload);

      expect(mockedApi.post).toHaveBeenCalledWith(
        '/instructor/quizzes/:quizId/questions',
        payload,
        { params: { quizId: payload.quizId } }
      );
      expect(result).toEqual(sampleDto);
    });
  });

  describe('updateQuestion', () => {
    it('puts to the correct endpoint with path params and returns validated DTO', async () => {
      const payload = {
        quizId: 7,
        questionType: QuestionType.MULTIPLE_CHOICE,
        content: 'Updated',
        points: 2,
        order: 1,
        answers: [],
      };

      const updated = { ...sampleDto, content: 'Updated', points: 2, order: 1 };
      mockedApi.put.mockResolvedValue({ data: updated, errors: [] });

      const result = await QuestionService.updateQuestion(1, payload);

      expect(mockedApi.put).toHaveBeenCalledWith(
        '/instructor/quizzes/:quizId/questions/:id',
        payload,
        { params: { quizId: payload.quizId, id: 1 } }
      );
      expect(result).toEqual(updated);
    });
  });

  describe('getQuestions', () => {
    it('gets pageable list with params and query, validates via pageable schema', async () => {
      const filter = { quizId: 7, page: 0, size: 10 } as const;
      const page = {
        content: [sampleDto],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        page: 0,
      };

      mockedApi.get.mockResolvedValue({ data: page, errors: [] });

      const result = await QuestionService.getQuestions(filter);

      expect(mockedApi.get).toHaveBeenCalledWith(
        '/instructor/quizzes/:quizId/questions',
        {
          signal: undefined,
          params: { quizId: filter.quizId },
          query: { page: filter.page, size: filter.size },
        }
      );
      expect(result).toEqual(page);
    });
  });

  describe('getQuestion', () => {
    it('gets single question with path params and returns validated DTO', async () => {
      mockedApi.get.mockResolvedValue({ data: sampleDto, errors: [] });
      const result = await QuestionService.getQuestion(7, 1);

      expect(mockedApi.get).toHaveBeenCalledWith(
        '/instructor/quizzes/:quizId/questions/:id',
        { signal: undefined, params: { quizId: 7, id: 1 } }
      );
      expect(result).toEqual(sampleDto);
    });
  });

  describe('deleteQuestion', () => {
    it('calls delete with correct endpoint and params', async () => {
      mockedApi.delete.mockResolvedValue({ data: null, errors: [] } as any);
      await QuestionService.deleteQuestion(7, 1);
      expect(mockedApi.delete).toHaveBeenCalledWith(
        '/instructor/quizzes/:quizId/questions/:id',
        { params: { quizId: 7, id: 1 } }
      );
    });
  });

  describe('reorderQuestions', () => {
    it('puts reorder payload to correct endpoint with params', async () => {
      mockedApi.put.mockResolvedValue({ data: null, errors: [] } as any);
      const items = [
        { id: 10, order: 0 },
        { id: 11, order: 1 },
      ];
      await QuestionService.reorderQuestions(7, items);
      expect(mockedApi.put).toHaveBeenCalledWith(
        '/instructor/quizzes/:quizId/questions/reorder',
        items,
        { params: { quizId: 7 } }
      );
    });
  });
});


// Additional negative test to validate pageable Zod errors
describe('QuestionService.getQuestions - invalid pageable payload', () => {
  it('rejects with ZodError when pageable fields have wrong types', async () => {
    const filter = { quizId: 7, page: 0, size: 10 } as const;
    // Invalid: size provided as string, totalPages missing
    const invalidPage: any = {
      content: [{
        id: 1,
        questionType: QuestionType.MULTIPLE_CHOICE,
        content: 'Q',
        order: 0,
        points: 1,
        answers: [],
      }],
      totalElements: 1,
      // totalPages: missing
      size: '10',
      page: 0,
    };

    (apiClient.get as jest.Mock).mockResolvedValue({ data: invalidPage, errors: [] });

    await expect(QuestionService.getQuestions(filter)).rejects.toBeInstanceOf(Error);
  });
});
