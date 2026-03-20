'use client';

import { useState } from 'react';

export default function DataDisclaimer() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="flex items-start gap-3 rounded bg-blue-50 px-4 py-3 text-sm text-blue-800 shadow">
      <span className="mt-0.5 text-blue-600" aria-hidden="true">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </span>
      <p className="flex-1">
        본 서비스는{' '}
        <a
          href="https://e-childschoolinfo.moe.go.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-900"
        >
          유치원알리미(e-childschoolinfo.moe.go.kr)
        </a>{' '}
        공공데이터를 활용합니다. 상업적 이용 전 이용조건을 확인하세요.
      </p>
      <button
        onClick={() => setDismissed(true)}
        aria-label="공지 닫기"
        className="text-blue-600 hover:text-blue-900"
      >
        x
      </button>
    </div>
  );
}
