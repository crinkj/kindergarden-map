'use client';

import Link from 'next/link';

export default function AdminSyncPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-4">
        <Link href="/admin" className="text-sm text-blue-600 hover:underline">
          ← 관리자 홈
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">동기화 실행</h1>
      <p className="text-gray-600 text-sm mb-6">
        상세 동기화 설정은{' '}
        <Link href="/admin" className="text-blue-600 hover:underline">
          관리자 페이지
        </Link>
        에서 진행할 수 있습니다.
      </p>
    </div>
  );
}
