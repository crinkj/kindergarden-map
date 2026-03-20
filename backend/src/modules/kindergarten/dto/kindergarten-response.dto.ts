export interface KindergartenListItemDto {
  kinderCode: string;
  kindername: string;
  establish: string | null;
  addr: string | null;
  telno: string | null;
  lttdcdnt: number | null;
  lngtcdnt: number | null;
  totalClassCount: number;
  totalChildCount: number;
  prmstfcnt: number;
  sidoCode: string | null;
  sggCode: string | null;
  updatedAt: Date;
}

export interface KindergartenDetailDto {
  id: number;
  kinderCode: string;
  officeedu: string;
  subofficeedu: string;
  kindername: string;
  establish: string | null;
  edate: string | null;
  odate: string | null;
  addr: string | null;
  telno: string | null;
  hpaddr: string | null;
  opertime: string | null;
  clcnt3: number;
  clcnt4: number;
  clcnt5: number;
  mixclcnt: number;
  shclcnt: number;
  prmstfcnt: number;
  ag3fpcnt: number;
  ag4fpcnt: number;
  ag5fpcnt: number;
  mixfpcnt: number;
  spcnfpcnt: number;
  ppcnt3: number;
  ppcnt4: number;
  ppcnt5: number;
  mixppcnt: number;
  shppcnt: number;
  pbnttmng: string | null;
  lttdcdnt: number | null;
  lngtcdnt: number | null;
  totalClassCount: number;
  totalChildCount: number;
  sidoCode: string | null;
  sggCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface KindergartenListResponseDto {
  data: KindergartenListItemDto[];
  meta: PaginationMeta;
}
