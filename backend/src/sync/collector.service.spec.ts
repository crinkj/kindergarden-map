import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { KindergartenCollectorService } from '../modules/sync/collector/kindergarten-collector.service';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockPrisma = {
  kindergarten: {
    upsert: jest.fn(),
  },
  regionCode: {
    findMany: jest.fn(),
  },
};

const mockConfig = {
  get: jest.fn((key: string) => {
    const values: Record<string, string> = {
      KINDERGARTEN_API_KEY: 'test_api_key',
      MOCK_MODE: 'false',
      API_RATE_LIMIT_MS: '0',
      API_TIMEOUT_MS: '5000',
    };
    return values[key];
  }),
};

describe('KindergartenCollectorService', () => {
  let service: KindergartenCollectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KindergartenCollectorService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<KindergartenCollectorService>(KindergartenCollectorService);
    jest.clearAllMocks();
  });

  describe('fetchBasicInfo', () => {
    it('returns kinderInfo from API response', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          kinderInfo: [
            {
              kinderCode: 'API001',
              officeedu: '서울특별시교육청',
              subofficeedu: '강남교육지원청',
              kindername: 'API유치원',
            },
          ],
          totalCount: 1,
        },
      });

      const result = await service.fetchBasicInfo('11', '680');

      expect(result).toHaveLength(1);
      expect(result[0].kinderCode).toBe('API001');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('e-childschoolinfo'),
        expect.objectContaining({
          params: expect.objectContaining({ sidoCode: '11', sggCode: '680' }),
        }),
      );
    });

    it('returns empty array when kinderInfo is undefined', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} });

      const result = await service.fetchBasicInfo('11', '680');

      expect(result).toEqual([]);
    });

    it('retries on failure and throws after 3 attempts', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(service.fetchBasicInfo('11', '680')).rejects.toThrow('Network error');
      expect(mockedAxios.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('mock mode', () => {
    it('returns mock data when MOCK_MODE=true', async () => {
      mockConfig.get.mockImplementation((key: string) => {
        if (key === 'MOCK_MODE') return 'true';
        return '';
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          KindergartenCollectorService,
          { provide: PrismaService, useValue: mockPrisma },
          { provide: ConfigService, useValue: mockConfig },
        ],
      }).compile();

      const mockService = module.get<KindergartenCollectorService>(
        KindergartenCollectorService,
      );

      const result = await mockService.fetchBasicInfo('11', '680');

      expect(result.length).toBeGreaterThan(0);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });
  });
});
