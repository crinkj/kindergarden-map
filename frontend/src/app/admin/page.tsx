'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { SyncJobListResponse } from '@/lib/types';
import { swrFetcher, startSync } from '@/lib/api';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: '대기중', color: 'text-gray-500' },
  running: { label: '수집 중', color: 'text-blue-600' },
  completed: { label: '완료', color: 'text-green-600' },
  completed_with_errors: { label: '완료(오류있음)', color: 'text-amber-600' },
  failed: { label: '실패', color: 'text-red-600' },
};

function formatDatetime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

const JOB_TYPE_LABELS: Record<string, string> = {
  full: '유치원 전국',
  sido: '유치원 시도',
  sgg: '유치원 시군구',
  childcare: '어린이집 전국',
};

export default function AdminPage() {
  const [startingType, setStartingType] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, string>>({});

  const { data, mutate, isLoading } = useSWR<SyncJobListResponse>(
    '/api/admin/sync/jobs',
    swrFetcher as (url: string) => Promise<SyncJobListResponse>,
    { refreshInterval: 5000 },
  );

  const handleSync = async (jobType: 'full' | 'childcare'): Promise<void> => {
    setStartingType(jobType);
    setMessages((prev) => ({ ...prev, [jobType]: '' }));
    try {
      const res = await startSync({ jobType });
      setMessages((prev) => ({ ...prev, [jobType]: `작업 #${res.jobId} 시작됨` }));
      await mutate();
    } catch (err) {
      setMessages((prev) => ({
        ...prev,
        [jobType]: err instanceof Error ? err.message : '동기화 시작 실패',
      }));
    } finally {
      setStartingType(null);
    }
  };

  const jobs = data?.data ?? [];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">관리자 - 데이터 수집</h1>

      {/* 유치원 full sync */}
      <div className="bg-white rounded shadow p-5 mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">전국 유치원 데이터 최신화</h2>
          <p className="text-xs text-gray-500 mt-1">
            전국 모든 시도·시군구의 유치원 정보를 유치원알리미 API에서 새로 수집합니다. (우편번호 포함)
          </p>
          {messages['full'] && <p className="text-xs text-blue-600 mt-2">{messages['full']}</p>}
        </div>
        <button
          onClick={() => handleSync('full')}
          disabled={startingType !== null}
          className="flex-shrink-0 rounded bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {startingType === 'full' ? '수집 중...' : '전국 최신화 시작'}
        </button>
      </div>

      {/* 어린이집 full sync */}
      <div className="bg-white rounded shadow p-5 mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">전국 어린이집 데이터 최신화</h2>
          <p className="text-xs text-gray-500 mt-1">
            전국 모든 지역의 어린이집 정보를 보육통합정보시스템 API에서 새로 수집합니다. (우편번호 포함)
          </p>
          {messages['childcare'] && <p className="text-xs text-blue-600 mt-2">{messages['childcare']}</p>}
        </div>
        <button
          onClick={() => handleSync('childcare')}
          disabled={startingType !== null}
          className="flex-shrink-0 rounded bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition"
        >
          {startingType === 'childcare' ? '수집 중...' : '전국 최신화 시작'}
        </button>
      </div>

      {/* History */}
      <div className="bg-white rounded shadow p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">수집 이력</h2>
        {isLoading ? (
          <p className="text-sm text-gray-400">불러오는 중...</p>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">수집 이력이 없습니다.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {[...jobs].reverse().map((job) => {
              const statusInfo = STATUS_LABELS[job.status] ?? { label: job.status, color: 'text-gray-600' };
              return (
                <div key={job.id} className="flex items-center justify-between py-3 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-gray-400 w-5 text-right flex-shrink-0">#{job.id}</span>
                    <span className={`text-sm font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      {JOB_TYPE_LABELS[job.jobType] ?? job.jobType}
                    </span>
                    {job.errorCount > 0 && (
                      <span className="text-xs text-red-500">오류 {job.errorCount}건</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {job.totalCount > 0 && (
                      <span className="text-sm text-gray-700 font-medium">
                        {job.totalCount.toLocaleString()}개 수집
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {job.startedAt ? formatDatetime(job.startedAt) : '-'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
