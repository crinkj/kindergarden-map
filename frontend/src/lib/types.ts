export interface KindergartenListItem {
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
  updatedAt: string;
}

export interface KindergartenDetail {
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
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface KindergartenListResponse {
  data: KindergartenListItem[];
  meta: PaginationMeta;
}

export interface SidoItem {
  code: string;
  name: string;
}

export interface SggItem {
  sidoCode: string;
  sggCode: string;
  name: string;
}

export interface MapBounds {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

export interface KindergartenFilters {
  keyword: string;
  sidoCode: string;
  sggCode: string;
  establish: string;
  minChildren?: number;
  maxChildren?: number;
  sortBy?: string;
  page: number;
}

export interface SyncJob {
  id: number;
  status: string;
  jobType: string;
  targetCode: string | null;
  totalCount: number;
  errorCount: number;
  errorLog: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface SyncJobListResponse {
  data: SyncJob[];
  meta: PaginationMeta;
}
