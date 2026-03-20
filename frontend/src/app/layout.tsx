import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '유치원 지도 서비스',
  description: '전국 유치원 정보를 지도에서 검색하고 상세 정보를 확인하세요.',
  keywords: ['유치원', '지도', '유치원알리미', '공립', '사립'],
  openGraph: {
    title: '유치원 지도 서비스',
    description: '전국 유치원 정보를 지도에서 검색하고 상세 정보를 확인하세요.',
    type: 'website',
    locale: 'ko_KR',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-slate-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
