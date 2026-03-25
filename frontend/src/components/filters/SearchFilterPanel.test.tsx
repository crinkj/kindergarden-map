import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchFilterPanel from '@/components/search/SearchFilterPanel';

const defaultProps = {
  facilityMode: 'kindergarten' as const,
  keyword: '',
  onKeywordChange: jest.fn(),
  sidoCode: '',
  sggCode: '',
  onSidoChange: jest.fn(),
  onSggChange: jest.fn(),
  sidoList: [{ code: '11', name: '서울특별시' }],
  sggList: [{ sidoCode: '11', sggCode: '680', name: '강남구' }],
  establish: '',
  onEstablishChange: jest.fn(),
  crtype: '',
  onCrtypeChange: jest.fn(),
  minChildren: '',
  maxChildren: '',
  onMinChildrenChange: jest.fn(),
  onMaxChildrenChange: jest.fn(),
  rankingMode: false,
  onRankingModeChange: jest.fn(),
  hasOpertime: false,
  onHasOpertimeChange: jest.fn(),
  hasHomepage: false,
  onHasHomepageChange: jest.fn(),
  onReset: jest.fn(),
  onExcelDownload: jest.fn(),
  isLoading: false,
  isError: false,
};

describe('SearchFilterPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders keyword input', () => {
    render(<SearchFilterPanel {...defaultProps} />);
    expect(screen.getByPlaceholderText('유치원 이름 입력...')).toBeInTheDocument();
  });

  it('calls onKeywordChange on input', () => {
    render(<SearchFilterPanel {...defaultProps} />);
    const input = screen.getByPlaceholderText('유치원 이름 입력...');
    fireEvent.change(input, { target: { value: '강남' } });
    expect(defaultProps.onKeywordChange).toHaveBeenCalledWith('강남');
  });

  it('renders sido options', () => {
    render(<SearchFilterPanel {...defaultProps} />);
    expect(screen.getByText('서울특별시')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<SearchFilterPanel {...defaultProps} isError={true} />);
    expect(screen.getByText(/필터 로드 실패/)).toBeInTheDocument();
  });

  it('calls onReset when reset button clicked', () => {
    render(<SearchFilterPanel {...defaultProps} />);
    fireEvent.click(screen.getByText('필터 초기화'));
    expect(defaultProps.onReset).toHaveBeenCalled();
  });

  it('disables inputs when loading', () => {
    render(<SearchFilterPanel {...defaultProps} isLoading={true} />);
    expect(screen.getByPlaceholderText('유치원 이름 입력...')).toBeDisabled();
    expect(screen.getByText('필터 초기화').closest('button')).toBeDisabled();
  });
});
