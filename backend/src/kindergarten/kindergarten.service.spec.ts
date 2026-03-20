import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { KindergartenService } from '../modules/kindergarten/kindergarten.service';
import { KindergartenRepository } from '../modules/kindergarten/kindergarten.repository';

const mockRepository = {
  findAll: jest.fn(),
  findAllForCsv: jest.fn(),
  findByKinderCode: jest.fn(),
};

const mockKindergarten = {
  id: 1,
  kinderCode: 'TEST001',
  officeedu: '서울특별시교육청',
  subofficeedu: '강남교육지원청',
  kindername: '테스트유치원',
  establish: '사립',
  edate: '20100301',
  odate: null,
  addr: '서울특별시 강남구 테헤란로 1',
  telno: '02-1234-5678',
  hpaddr: null,
  opertime: '09:00~17:00',
  clcnt3: 2, clcnt4: 2, clcnt5: 2, mixclcnt: 0, shclcnt: 0,
  prmstfcnt: 10,
  ag3fpcnt: 20, ag4fpcnt: 20, ag5fpcnt: 20, mixfpcnt: 0, spcnfpcnt: 0,
  ppcnt3: 18, ppcnt4: 19, ppcnt5: 17, mixppcnt: 0, shppcnt: 0,
  pbnttmng: '있음',
  lttdcdnt: 37.5665,
  lngtcdnt: 126.978,
  totalClassCount: 6,
  totalChildCount: 54,
  sidoCode: '11',
  sggCode: '680',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('KindergartenService', () => {
  let service: KindergartenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KindergartenService,
        { provide: KindergartenRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<KindergartenService>(KindergartenService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns paginated list', async () => {
      mockRepository.findAll.mockResolvedValue({
        items: [mockKindergarten],
        total: 1,
      });

      const result = await service.findAll({ page: 1, limit: 100 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('returns empty list when no results', async () => {
      mockRepository.findAll.mockResolvedValue({ items: [], total: 0 });

      const result = await service.findAll({ page: 1, limit: 100 });

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('findByKinderCode', () => {
    it('returns kindergarten when found', async () => {
      mockRepository.findByKinderCode.mockResolvedValue(mockKindergarten);

      const result = await service.findByKinderCode('TEST001');

      expect(result.kinderCode).toBe('TEST001');
      expect(result.kindername).toBe('테스트유치원');
    });

    it('throws NotFoundException when not found', async () => {
      mockRepository.findByKinderCode.mockResolvedValue(null);

      await expect(service.findByKinderCode('NOTEXIST')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAllAsCsv', () => {
    it('returns csv string with BOM header', async () => {
      mockRepository.findAllForCsv.mockResolvedValue([mockKindergarten]);

      const csv = await service.findAllAsCsv({});

      expect(csv).toContain('유치원코드');
      expect(csv).toContain('TEST001');
      expect(csv).toContain('테스트유치원');
    });
  });
});
