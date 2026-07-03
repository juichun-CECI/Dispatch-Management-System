export type ControllerType = 'MGC-3100' | 'ITC-2000' | 'TC-800' | 'NTCIP-90';

export interface ConstructionPhoto {
  url: string;
  comment: string;
}

export interface ContractWorkItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  unit: string;
  category?: string;
}

export interface RelocationSheet {
  id: string;
  itemName: string;
  fromJunction: string;
  toJunction: string;
  engineer: string;
  planDate: string;
  notes: string;
  createdAt: string;
}

export interface DispatchCase {
  id: string;
  title: string;
  type: '設備故障' | '號誌故障' | '線路損壞' | '定期保養' | '路口調整';
  status: '待派工' | '處理中' | '已完工' | '已結案';
  priority: '急件' | '普通' | '一般';
  assignedTo: string;
  reportTime: string;
  deadline: string;
  description: string;
  logs: Array<{
    time: string;
    action: string;
    user: string;
  }>;
  contractId?: string; // 關聯的合約 ID
  caseCost?: number;   // 已結算支出金額
  reportSource?: string; // 通報來源 (民眾通報, 1999專線, 交警通報, 巡檢發現, 系統遙測)
  selectedContractItems?: ContractWorkItem[]; // 對應合約工項
  photos?: {
    before?: ConstructionPhoto;
    during?: ConstructionPhoto;
    after?: ConstructionPhoto;
  };
  relocationSheet?: RelocationSheet; // 設備遷移單
}

export interface Intersection {
  id: string;
  name: string;
  district: '花蓮市' | '吉安鄉' | '壽豐鄉' | '新城鄉' | '鳳林鎮' | '光復鄉' | '瑞穗鄉' | '玉里鎮' | '富里鄉' | '秀林鄉' | '豐濱鄉';
  lon: number;
  lat: number;
  ip: string;
  port: number;
  status: 'E_ONLINE' | 'E_OFFLINE' | 'E_TIMEOUT'; // 1. 動態及連線
  warranty: 'W_VALID' | 'W_EXPIRED';              // 2. 保固及過保
  caseStatus: 'C_NONE' | 'C_PENDING' | 'C_ING' | 'C_DONE'; // 3. 派工案件狀態
  case?: DispatchCase;
  flowRate: number; // 交通流量 (輛/小時)
  cycleTime: number; // 週期 (秒)
  phaseCount: number; // 時相數
  controllerType: ControllerType;
  installDate: string;
  controllerBrand?: string; // 控制器廠牌
  warrantyStartDate?: string; // 保固開始日
  warrantyEndDate?: string; // 保固截止日
  uploadedFiles?: Array<{
    id: string;
    name: string;
    size: string;
    uploadTime: string;
  }>; // 上傳諸元檔案庫
  elementsCheckedData?: Record<string, string | number>; // 43項調查項目快照
  elementsCheckedStatus?: 'PENDING' | 'APPROVED'; // 諸元核定審查狀態
  elementsCheckedBy?: string; // 核定審訖主管
}

export interface Contract {
  id: string;
  name: string;
  type: string; // '開口契約' | '一般總包' | '單價契約'
  partyA: string; // 業主 (e.g. '花蓮縣政府' | '吉安鄉公所')
  partyB: string; // 廠商
  startDate: string;
  endDate: string;
  totalAmount: number; // 契約總金額 (e.g. 13,000,000)
  budgets: {
    engineering: number;   // 工程費
    safety: number;        // 職安費
    quality: number;       // 品管費
    profit: number;        // 包商利潤
    insurance: number;     // 保險費
    tax: number;           // 營業稅
  };
  settledAmount: number;   // 已結案支出金額
  status: '履約中' | '已結案' | '未開始';
  attachedFiles: Array<{
    id: string;
    name: string;
    size: string;
    uploadTime: string;
  }>;
}

export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'ENGINEER' | 'SURVEYOR';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleName: string;
  department: string;
  avatarColor: string;
  permissions: {
    canEditIntersections: boolean; // 可編輯號誌基本屬性
    canManageCases: boolean;        // 可建立與結案調度派工
    canManageContracts: boolean;    // 可管理與上傳開口與一般契約
    canEditSurveyElements: boolean; // 可回報與填寫43項路口諸元
    canApproveSurvey: boolean;      // 可核定與審核諸元普查成果
    canManageSystemUsers: boolean;  // 可配置與變更使用者權限
  };
}

export type MainTab = 'home' | 'case' | 'document' | 'history' | 'stats' | 'contract' | 'elements' | 'users';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'dispatch_assigned' | 'status_changed' | 'critical_alert';
  severity: 'info' | 'warn' | 'critical';
  timestamp: string;
  read: boolean;
  intersectionId?: string;
  intersectionName?: string;
}

export interface NotificationSettings {
  soundEnabled: boolean;
  audioTone: 'bell' | 'digital' | 'soft';
  districts: string[]; // empty fits all
  triggerDispatchAssigned: boolean;
  triggerStatusChanged: boolean;
  triggerCriticalAlert: boolean;
  minSeverity: 'info' | 'warn' | 'critical';
}

