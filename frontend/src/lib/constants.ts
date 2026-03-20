export const SIDO_CODES: Record<string, string> = {
  '11': '서울특별시',
  '26': '부산광역시',
  '27': '대구광역시',
  '28': '인천광역시',
  '29': '광주광역시',
  '30': '대전광역시',
  '31': '울산광역시',
  '36': '세종특별자치시',
  '41': '경기도',
  '43': '충청북도',
  '44': '충청남도',
  '46': '전라남도',
  '47': '경상북도',
  '48': '경상남도',
  '50': '제주특별자치도',
  '51': '강원특별자치도',
  '52': '전북특별자치도',
};

export const ESTABLISH_TYPES = [
  { value: '', label: '전체' },
  { value: '공립(단설)', label: '공립(단설)' },
  { value: '공립(병설)', label: '공립(병설)' },
  { value: '사립(사인)', label: '사립(사인)' },
  { value: '사립(법인)', label: '사립(법인)' },
  { value: '국립', label: '국립' },
];

export const ESTABLISH_BADGE_COLORS: Record<string, string> = {
  '공립(단설)': 'bg-blue-500 text-white',
  '공립(병설)': 'bg-blue-300 text-white',
  '사립(사인)': 'bg-emerald-500 text-white',
  '사립(법인)': 'bg-emerald-700 text-white',
  '국립': 'bg-purple-500 text-white',
};

export const DEFAULT_MAP_CENTER = { lat: 37.5665, lng: 126.978 };
export const DEFAULT_MAP_LEVEL = 7;
