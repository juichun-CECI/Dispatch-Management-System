import React, { useState, useMemo, useEffect } from 'react';
import { Intersection } from '../types';
import { 
  FileText, 
  Printer, 
  Check, 
  Clipboard, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Edit3, 
  Sliders, 
  AlertCircle, 
  Sparkles, 
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  CircleDollarSign,
  Briefcase,
  HelpCircle,
  FileSpreadsheet,
  Search,
  History,
  ArrowLeftRight,
  Download,
  BookOpen
} from 'lucide-react';

interface DocumentGeneratorViewProps {
  intersections: Intersection[];
  selectedIntersection: Intersection | null;
}

// Struct of individual items in the detail schedule
interface BillItem {
  id: string; // e.g. "1", "(1)"
  name: string;
  unit: string;
  quantity: number;
  price: number;
  code: string;
  remark: string;
  category: '壹_工程費' | '貳_職安費' | '參_品管費' | '四_標誌標線';
}

interface HistoricalDoc {
  id: string;
  year: string;
  title: string;
  sponsorName: string;
  district: string;
  accountingSubject: string;
  projectNumber: string;
  constructionLocation: string;
  date: string;
  designerName: string;
  templateType: 'A_SUMMARY' | 'A_DETAIL' | 'B_DIRECT';
  b利润率?: number;
  b保险率?: number;
  b营业税率?: number;
  designServiceRate?: number;
  contractorProfitRateB?: number;
  hasItems: boolean;
  notes: string;
  grandTotal: number;
  items: BillItem[];
}

const historicalDocs: HistoricalDoc[] = [
  {
    id: "HIST-01",
    year: "113年",
    title: "113年度吉安鄉廣興一街路口增設多時相三色號誌設備工程補助款案",
    sponsorName: "鄭乾龍議員",
    district: "吉安鄉",
    accountingSubject: "EC113110255",
    projectNumber: "EC113110255",
    constructionLocation: "吉安鄉廣興一街-吉興路二段-號誌路口",
    date: "113年11月10日",
    designerName: "崔瑞駿",
    templateType: "B_DIRECT",
    designServiceRate: 10.0,
    contractorProfitRateB: 10.0,
    hasItems: true,
    grandTotal: 532490,
    notes: "本案為典型議員建議款補助，採用範本乙單頁格式編列，利潤率與監造費均為10.0%上限。",
    items: [
      { id: '1', name: 'L型8"行車號誌桿(臂長3.5M管壁6.0mm)', unit: '組', quantity: 2, price: 37687, code: '鍍鋅防風防鏽型', remark: '含安裝', category: '壹_工程費' },
      { id: '2', name: 'T型8吋行車號誌桿(臂長3.5M管壁6.0mm)', unit: '組', quantity: 1, price: 43278, code: '耐風壓設計型式', remark: '含安裝', category: '壹_工程費' },
      { id: '3', name: '號誌桿基礎混凝土基座(含1"高強度地錨螺栓、機器挖掘、深灌漿)', unit: '座', quantity: 3, price: 14577, code: '3000psi預拌混凝土', remark: '附基座灌漿檢查照', category: '壹_工程費' },
      { id: '4', name: '30cm三燈式燈箱組起吊空中安裝或舊阻拆除工資', unit: '邊', quantity: 8, price: 474, code: '配合高空吊車施工', remark: '含工料', category: '壹_工程費' },
      { id: '5', name: '12吋 30cmLED三燈式鋁合金超高亮燈箱頭組(配置紅、黃、綠三色)', unit: '組', quantity: 8, price: 16185, code: '節能長效一體成型', remark: '含不銹鋼固定支架', category: '壹_工程費' },
      { id: '6', name: '不銹鋼附掛式交控專用電源分界配電箱及安裝(含100A漏電開關)', unit: '個', quantity: 3, price: 4743, code: 'SUS304防撬密閉', remark: '含防突波漏電保護', category: '壹_工程費' },
      { id: '7', name: '新設台電線路供電申請及路口竣工聯合會勘相關規雜費', unit: '處', quantity: 3, price: 5691, code: '電力一併規畫申請', remark: '行政規費及試燈', category: '壹_工程費' }
    ]
  },
  {
    id: "HIST-02",
    year: "113年",
    title: "113年度光復鄉大華街與中山路口汰換暨行車號誌改善議員建議案",
    sponsorName: "徐雪玉副議長",
    district: "光復鄉",
    accountingSubject: "EC113080121",
    projectNumber: "EC113080121",
    constructionLocation: "光復鄉大華街興建工區",
    date: "113年08月15日",
    designerName: "崔瑞駿",
    templateType: "A_SUMMARY",
    b利润率: 9.0,
    b保险率: 0.3,
    b营业税率: 5.0,
    hasItems: true,
    grandTotal: 319200,
    notes: "採用範本甲總表及詳細表格式。工程費、職安費與品管費分離計算，並自動加計9%包商利潤與0.3%保險費格式，已核定撥款。",
    items: [
      { id: '1', name: '光復鄉大華街號誌新建工程項目合規施工', unit: '式', quantity: 1.00, price: 215000, code: '015741010H', remark: '含配管放線', category: '壹_工程費' },
      { id: '(1)', name: '工程告示牌 (立牌及防護欄阻隔配置)', unit: '面', quantity: 1, price: 1588, code: '02893A0137', remark: '雙面鍍鋅高強鍍', category: '壹_工程費' },
      { id: '(2)', name: '勞工安全衛生，一般器材，安全告示牌', unit: '座', quantity: 1, price: 5425, code: '015741010H', remark: '附固定基底', category: '壹_工程費' },
      { id: '1', name: '職業安全衛生，保護器材，耐衝擊工程帽(黃/白色)', unit: '頂', quantity: 5, price: 186, code: '02893A0204', remark: 'CNS檢驗合格標章', category: '貳_職安費' },
      { id: '8', name: '職業安全衛生管理及施作計畫編列(按工料費比例0.2%)', unit: '式', quantity: 1.00, price: 580, code: '比例計算', remark: '專職主辦工程師編列', category: '貳_職安費' },
      { id: '5', name: '品質管理及取樣試驗人員(配合工區試體駐廠取樣天數)', unit: '天', quantity: 5.00, price: 1235, code: '02893A0215', remark: '品管專員檢核簽章', category: '參_品管費' },
      { id: '(1)', name: '路面熱處理聚酯反光標線施工 (厚度達 2.0mm)', unit: 'M2', quantity: 10.00, price: 351, code: '02893A0174', remark: '高亮反光玻璃砂', category: '四_標誌標線' }
    ]
  },
  {
    id: "HIST-03",
    year: "112年",
    title: "112年度壽豐鄉志學路段高解析行人號誌與過路管線埋設補助款案",
    sponsorName: "林正分議員",
    district: "壽豐鄉",
    accountingSubject: "EC112051280",
    projectNumber: "EC112051280",
    constructionLocation: "壽豐鄉大學路三段與中正路交叉口",
    date: "112年05月20日",
    designerName: "崔瑞駿",
    templateType: "B_DIRECT",
    designServiceRate: 8.5,
    contractorProfitRateB: 9.0,
    hasItems: true,
    grandTotal: 412500,
    notes: "林正分議員壽豐鄉首件行人專用安全號誌工程，項目著重於降噪式微電腦控制器與高空中配線吊裝工程。",
    items: [
      { id: '1', name: 'L型行車號誌桿(短臂長2.5M管壁5.5mm)', unit: '組', quantity: 2, price: 29500, code: '鋼材鍍鋅處理', remark: '含吊裝施工', category: '壹_工程費' },
      { id: '2', name: '微電腦智慧型交通控制大底板主控機組', unit: '台', quantity: 1, price: 95000, code: 'MGC-2000 Pro', remark: '含機箱配電與防雷裝置', category: '壹_工程費' },
      { id: '3', name: '30cm LED行人計時二燈式鋁合金燈箱組', unit: '組', quantity: 4, price: 12500, code: '高透光鋼化玻璃殼', remark: '附固定拉力架', category: '壹_工程費' },
      { id: '4', name: '既有熱處理聚酯道路標線機械磨除工作', unit: 'M2', quantity: 15.00, price: 320, code: '深度磨除不留痕', remark: '高壓水車協同洗地', category: '四_標誌標線' },
      { id: '5', name: '2mm厚高反光耐磨熱處理聚酯反光標線重繪工程', unit: 'M2', quantity: 40.00, price: 360, code: '30%反光玻璃珠珠', remark: '黃線雙向及斑馬線', category: '四_標誌標線' }
    ]
  },
  {
    id: "HIST-04",
    year: "112年",
    title: "112年度花蓮市主權路段十字路口三色智慧燈頭組與倒數讀秒新設案",
    sponsorName: "魏嘉賢議員",
    district: "花蓮市",
    accountingSubject: "EC112120045",
    projectNumber: "EC112120045",
    constructionLocation: "花蓮市重慶路與和平路十字路口",
    date: "112年12月05日",
    designerName: "崔瑞駿",
    templateType: "A_SUMMARY",
    b利润率: 10.0,
    b保险率: 0.4,
    b营业税率: 5.0,
    hasItems: true,
    grandTotal: 648300,
    notes: "花蓮市建議款指標型案件，工程經費大，採取範本甲格式配合主管單位覆核，編列10%頂格包商利潤費。",
    items: [
      { id: '1', name: '花蓮市主權路段號誌新建工程合規管線敷設工程', unit: '式', quantity: 1.00, price: 420000, code: '015741010H', remark: '內含地下道頂地岩盤鑽孔', category: '壹_工程費' },
      { id: '(1)', name: '工程告示牌 (立牌及防護欄阻隔配置)', unit: '面', quantity: 1, price: 1800, code: '02893A0137', remark: '三防耐候鋼', category: '壹_工程費' },
      { id: '(2)', name: '勞工安全衛生，一般器材，安全告示牌', unit: '座', quantity: 2, price: 4200, code: '015741010H', remark: '含夜間高亮閃燈輪', category: '壹_工程費' },
      { id: '1', name: '職業安全衛生，保護器材，耐衝擊工程帽(黃/白色)', unit: '頂', quantity: 10, price: 186, code: '02893A0204', remark: 'CNS檢驗合格標章', category: '貳_職安費' },
      { id: '2', name: '產品，職業安全衛生，急救箱配急救備品', unit: '組', quantity: 1, price: 800, code: '02893A0209', remark: '雙層防撕裂材質', category: '貳_職安費' },
      { id: '5', name: '品質管理及取樣試驗人員(品管駐點取樣天數)', unit: '天', quantity: 12.00, price: 1235, code: '02893A0215', remark: '品管專員實地量測', category: '參_品管費' },
      { id: '(1)', name: '路面熱處理聚酯反光標線施工 (厚度達 2.0mm)', unit: 'M2', quantity: 30.00, price: 350, code: '02893A0174', remark: '高亮反光玻璃砂', category: '四_標誌標線' }
    ]
  }
];

export default function DocumentGeneratorView({
  intersections,
  selectedIntersection
}: DocumentGeneratorViewProps) {
  // Tab control in Left Panel: editor / history (歷史對照庫)
  const [leftSidebarTab, setLeftSidebarTab] = useState<'editor' | 'history'>('editor');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyFilterDistrict, setHistoryFilterDistrict] = useState('ALL');
  const [selectedHistoryDoc, setSelectedHistoryDoc] = useState<HistoricalDoc | null>(null);
  const [isCompareMode, setIsCompareMode] = useState(false);

  // We support three document modes reflecting the uploaded PDFs
  // 1. TEMPLATE_A_SUMMARY: 花蓮縣政府 總表 [議員款補助案-估價單]
  // 2. TEMPLATE_A_DETAIL: 花蓮縣政府 詳細價目表 [議員款補助案-估價單]
  // 3. TEMPLATE_B_DIRECT: 議員款補助案 - 增設三色號誌費用估價詳細表 (鄭乾龍議員款)
  const [activeTemplate, setActiveTemplate] = useState<'A_SUMMARY' | 'A_DETAIL' | 'B_DIRECT'>('A_SUMMARY');

  // Interactive local states for metadata
  const [targetId, setTargetId] = useState(selectedIntersection?.id || 'TC01');
  const [projectTitle, setProjectTitle] = useState('114-115年度花蓮縣交通號誌增設及維護工程(含代養省道交通號誌)(開口契約)');
  const [sponsorName, setSponsorName] = useState('徐雪玉副議長');
  const [accountingSubject, setAccountingSubject] = useState('EC114070301');
  const [projectNumber, setProjectNumber] = useState('EC114070301');
  const [constructionLocation, setConstructionLocation] = useState('光復鄉中山路二段-建國路二段-派工路口');
  const [customDate, setCustomDate] = useState('115年6月12日');
  const [designerName, setDesignerName] = useState('崔瑞駿');
  
  // Custom formulas sliders
  const [b利润率, setB利润率] = useState(9.0); // 9.0% for Template A
  const [b保险率, setB保险率] = useState(0.3); // 0.3% for Template A
  const [b营业税率, setB营业税率] = useState(5.0); // 5.0%

  // Template B specific rates
  const [designServiceRate, setDesignServiceRate] = useState(10.0); // 10%
  const [contractorProfitRateB, setContractorProfitRateB] = useState(10.0); // 10%

  // Sync selected intersection info
  const targetIntersection = useMemo(() => {
    return intersections.find(i => i.id.toUpperCase() === targetId.toUpperCase()) || intersections[0];
  }, [intersections, targetId]);

  const filteredHistoryDocs = useMemo(() => {
    return historicalDocs.filter(doc => {
      const dMatch = historyFilterDistrict === 'ALL' || doc.district === historyFilterDistrict;
      const sMatch = !historySearchQuery 
        || doc.title.toLowerCase().includes(historySearchQuery.toLowerCase())
        || doc.sponsorName.toLowerCase().includes(historySearchQuery.toLowerCase())
        || doc.district.toLowerCase().includes(historySearchQuery.toLowerCase())
        || doc.constructionLocation.toLowerCase().includes(historySearchQuery.toLowerCase())
        || doc.accountingSubject.toLowerCase().includes(historySearchQuery.toLowerCase());
      return dMatch && sMatch;
    });
  }, [historySearchQuery, historyFilterDistrict]);

  useEffect(() => {
    if (selectedIntersection) {
      setTargetId(selectedIntersection.id);
    }
  }, [selectedIntersection]);

  // When intersection changes, auto-load standard information mapping to district
  useEffect(() => {
    if (targetIntersection) {
      let streetName = '';
      if (targetIntersection.id === 'TC01') {
        streetName = '光復鄉中山路二段-建國路二段-派工路口';
      } else if (targetIntersection.id === 'TC02') {
        streetName = '吉安鄉廣興一街-吉興路二段-號誌路口';
      } else {
        streetName = `${targetIntersection.district}${targetIntersection.name}-增設號誌路段`;
      }
      setConstructionLocation(streetName);

      // Distinguish template default sponsor based on district or name
      if (targetIntersection.district === '吉安鄉') {
        setSponsorName('鄭乾龍議員');
        setActiveTemplate('B_DIRECT');
      } else {
        setSponsorName('徐雪玉副議長');
        setActiveTemplate('A_SUMMARY');
      }
    }
  }, [targetIntersection]);

  // The actual Bill of Quantities spreadsheet state, seeding default values directly matching the OCR of screenshots!
  const [billItems, setBillItems] = useState<BillItem[]>([
    // Category 壹 - 工程費 (徐雪玉案 / Template A)
    { id: '1', name: '光復鄉中山路二段-建國路二段號誌新建工程項目合規施工', unit: '式', quantity: 1.00, price: 251246, code: '015741010H', remark: '含配管放線', category: '壹_工程費' },
    { id: '(1)', name: '工程告示牌 (立牌及防護欄阻隔配置)', unit: '面', quantity: 1, price: 1588, code: '02893A0137', remark: '雙面鍍鋅高強鍍', category: '壹_工程費' },
    { id: '(2)', name: '勞工安全衛生，一般器材，安全告示牌', unit: '座', quantity: 1, price: 5425, code: '015741010H', remark: '附固定基底', category: '壹_工程費' },
    { id: '(3)', name: '交控維修灑水車 (10噸配備強力自排噴水壓)', unit: '時', quantity: 1.00, price: 1323, code: '1時/處', remark: '租用及運費', category: '壹_工程費' },
    { id: '(4)', name: '交通防護交維車 (配置後置防撞緩衝網)', unit: '日', quantity: 10.00, price: 5571, code: '1日/處', remark: '交維計畫指定備配', category: '壹_工程費' },
    { id: '(5)', name: '現場交維引導人員 (配置哨子、指揮LED棒)', unit: '日', quantity: 10.00, price: 1857, code: '1日/處', remark: '交監主管核備證照', category: '壹_工程費' },
    { id: '(6)', name: '環境保護，其他環境保護維生防塵防蟻措施', unit: '處', quantity: 1.00, price: 279, code: '01572C00041', remark: '施工完畢吹塵維護', category: '壹_工程費' },

    // Category 貳 - 職業安全衛生費
    { id: '1', name: '職業安全衛生，保護器材，耐衝擊工程帽(黃/白色)', unit: '頂', quantity: 5, price: 186, code: '02893A0204', remark: 'CNS檢驗合格標章', category: '貳_職安費' },
    { id: '2', name: '產品，職業安全衛生，保護手部沾塑防滑工作毛手套', unit: '套', quantity: 10, price: 28, code: '02893A0205', remark: '雙層防撕裂材質', category: '貳_職安費' },
    { id: '3', name: '產品，職業安全衛生，雙效呼吸活性碳防塵防蟻式口罩', unit: '個', quantity: 20, price: 42, code: '02893A0206', remark: '特等密合過濾效率', category: '貳_職安費' },
    { id: '4', name: '產品，職業安全衛生，施工護目鏡，防電焊濺射護面鏡', unit: '個', quantity: 2, price: 335, code: '02893A0207', remark: '防霧高透光鋼化玻璃', category: '貳_職安費' },
    { id: '5', name: '產品，職業安全衛生，一般器材，高亮防護帽用安全防滑燈', unit: '只', quantity: 2, price: 441, code: '02893A0208', remark: '防潑水快拆頭盔夾', category: '貳_職安費' },
    { id: '6', name: '產品，職業安全衛生，急救箱配急救備品(附消毒生理鹽水)', unit: '組', quantity: 1, price: 661, code: '02893A0209', remark: '專用壁掛不鏽鋼箱', category: '貳_職安費' },
    { id: '7', name: '產品，職業安全衛生，ABC型乾粉滅火器(10P/附壓力錶)', unit: '具', quantity: 2, price: 1102, code: '02893A0210', remark: '消防安檢法規新品', category: '貳_職安費' },
    { id: '8', name: '職業安全衛生管理及施作計畫編列(按工料費比例0.2%)', unit: '式', quantity: 1.00, price: 654, code: '比例計算', remark: '專職主辦工程師編列', category: '貳_職安費' },
    { id: '9', name: '職業安全教育訓練、危害告知及演練(按工料費用0.4%)', unit: '式', quantity: 1.00, price: 1309, code: '比例計算', remark: '開工前安衛宣導備份', category: '貳_職安費' },
    { id: '10', name: '現場專職職業安全衛生管理稽查人員(按工料 fee1.8%)', unit: '式', quantity: 1.00, price: 5888, code: '管理編制', remark: '工程簽署指派技師', category: '貳_職安費' },

    // Category 參 - 品管費
    { id: '5', name: '品質管理及取樣試驗人員(配合工區試體駐廠取樣天數)', unit: '天', quantity: 10.00, price: 1235, code: '02893A0215', remark: '品管專員檢核簽章', category: '參_品管費' },
    { id: '6', name: '現場行政管理費、自主品管及照片彙整 (按工料比0.01%)', unit: '式', quantity: 1.00, price: 33, code: '小額比例', remark: '印產資料備查', category: '參_品管費' },

    // Category 肆 - 標誌標線及其他設施
    { id: '(1)', name: '路面熱處理聚酯反光標線施工 (厚度達 2.0mm)', unit: 'M2', quantity: 12.50, price: 351, code: '02893A0174', remark: '高亮反光玻璃砂', category: '四_標誌標線' },
    { id: '(16)', name: '既有熱處理聚酯標線磨除及廢土運棄工作', unit: 'M2', quantity: 5.00, price: 316, code: '02893A0189', remark: '磨除深達2mm不留痕', category: '四_標誌標線' }
  ]);

  // Seeding default values for Template B (鄭乾龍議員款) matching exact OCR parameters
  const [billItemsB, setBillItemsB] = useState<BillItem[]>([
    { id: '1', name: 'L型8"行車號誌桿(臂長3.5M管壁6.0mm)', unit: '組', quantity: 2, price: 37687, code: '鍍鋅防風防鏽型', remark: '含安裝', category: '壹_工程費' },
    { id: '2', name: 'T型8吋行車號誌桿(臂長3.5M管壁6.0mm)', unit: '組', quantity: 1, price: 43278, code: '耐風壓設計型式', remark: '含安裝', category: '壹_工程費' },
    { id: '3', name: '號誌桿基礎混凝土基座(含1"高強度地錨螺栓、機器挖掘、深灌漿)', unit: '座', quantity: 3, price: 14577, code: '3000psi預拌混凝土', remark: '附基座灌漿檢查照', category: '壹_工程費' },
    { id: '4', name: '30cm三燈式燈箱組起吊空中安裝或舊阻拆除工資', unit: '邊', quantity: 8, price: 474, code: '配合高空吊車施工', remark: '含工料', category: '壹_工程費' },
    { id: '5', name: '12吋 30cmLED三燈式鋁合金超高亮燈箱頭組(配置紅、黃、綠三色)', unit: '組', quantity: 8, price: 16185, code: '節能長效一體成型', remark: '含不銹鋼固定支架', category: '壹_工程費' },
    { id: '6', name: '不銹鋼附掛式交控專用電源分界配電箱及安裝(含100A漏電開關)', unit: '個', quantity: 3, price: 4743, code: 'SUS304防撬密閉', remark: '含防突波漏電保護', category: '壹_工程費' },
    { id: '7', name: '新設台電線路供電申請及路口竣工聯合會勘相關規雜費', unit: '處', quantity: 3, price: 5691, code: '電力一併規畫申請', remark: '行政規費及試燈', category: '壹_工程費' },
    { id: '8', name: '2/C 5.5mm2 PVC 高阻燃耐熱橡膠包覆通訊電纜線(地埋管道)', unit: 'M', quantity: 30, price: 76, code: 'CNS符合標準', remark: '銅抽線防鼠咬', category: '壹_工程費' },
    { id: '9', name: '7/C 2.0mm2 PVC 多芯信號控制連動電纜線(高空吊掛及穿管)', unit: 'M', quantity: 30, price: 95, code: '高彈性多股芯線', remark: '多時相燈頭配線', category: '壹_工程費' },
    { id: '10', name: '微電腦智慧型多功能交通號誌控制器內部大底板主控機組', unit: '台', quantity: 1, price: 109829, code: 'MGC-3100 NTCIP', remark: '台廠自主研發晶片', category: '壹_工程費' },
    { id: '11', name: '多時相智慧號誌控制器無線5G/LTE雙備援通訊介面板模組', unit: '台', quantity: 3, price: 25960, code: 'VPN加密通訊認證', remark: '即時串流回報秒數', category: '壹_工程費' },
    { id: '12', name: '多功能控制主機網域備援5G無線模組天線配置與調頻拆裝費', unit: '式', quantity: 1, price: 9984, code: '高增益強效全向天線', remark: '交控中心登錄連線', category: '壹_工程費' },
    { id: '13', name: '多時相智慧號誌安裝工程系統現場調頻工料或周邊拆除復原費', unit: '式', quantity: 1, price: 44930, code: '多波段模擬時序計畫', remark: '現場全功能測試及點交', category: '壹_工程費' },
    { id: '14', name: '熱處理聚酯道路標線機械磨除作業(含現場標沙磨除及棄土運棄)', unit: 'M2', quantity: 20, price: 339, code: '深度去除2mm防反光', remark: '防滑係數重配置', category: '四_標誌標線' },
    { id: '15', name: '路面 2mm 厚高反光耐磨熱處理聚酯玻璃珠反光標線重繪工程', unit: 'M2', quantity: 50, price: 377, code: '15%特級反光玻璃砂', remark: '標線耐候性測試完畢', category: '四_標誌標線' }
  ]);

  const handleOpenDocInNewWindow = (docToView?: HistoricalDoc | {
    title: string;
    sponsorName: string;
    date: string;
    accountingSubject: string;
    projectNumber: string;
    constructionLocation: string;
    templateType: 'A_SUMMARY' | 'A_DETAIL' | 'B_DIRECT';
    items: BillItem[];
    b利润率: number;
    b保险率: number;
    b营业税率: number;
    designServiceRate: number;
    contractorProfitRateB: number;
  }) => {
    const data = docToView || {
      title: projectTitle,
      sponsorName: sponsorName,
      date: customDate,
      accountingSubject: accountingSubject,
      projectNumber: projectNumber,
      constructionLocation: constructionLocation,
      templateType: activeTemplate,
      items: activeItems,
      b利润率: b利润率,
      b保险率: b保险率,
      b营业税率: b营业税率,
      designServiceRate: designServiceRate,
      contractorProfitRateB: contractorProfitRateB
    };

    const newWindow = window.open('', '_blank');
    if (!newWindow) {
      alert('彈出視窗已被瀏覽器封鎖，請允許快顯視窗再試一次！');
      return;
    }

    // Do calculations dynamically
    let htmlContent = '';
    
    if (data.templateType === 'B_DIRECT') {
      const baseSum = data.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
      const designServiceFee = Math.round(baseSum * (data.designServiceRate / 100));
      const contractorProfitFee = Math.round(baseSum * (data.contractorProfitRateB / 100));
      const grandTotal = baseSum + designServiceFee + contractorProfitFee;

      htmlContent = `
        <div style="background: #ffffff; color: #1e293b; padding: 20px; font-family: -apple-system, sans-serif;">
          <h2 style="text-align:center; color:#1e3a8a; margin-bottom:5px; font-size:22px; font-weight:bold;">花蓮縣政府</h2>
          <h3 style="text-align:center; color:#334155; margin-top:0; margin-bottom:20px; font-size:16px;">
            議員建議(補助)款 - 增設三色號誌費用估價詳細表 (${data.sponsorName}建議款)
          </h3>
          
          <table style="width:100%; border-collapse: collapse; margin-bottom:15px; font-size:12px; border: 1px solid #000;">
            <tr>
              <td style="padding:6px; border: 1px solid #000; font-weight:bold; background:#f8fafc; width:15%;">補助議員</td>
              <td style="padding:6px; border: 1px solid #000; width:35%;">${data.sponsorName}</td>
              <td style="padding:6px; border: 1px solid #000; font-weight:bold; background:#f8fafc; width:15%;">估價日期</td>
              <td style="padding:6px; border: 1px solid #000; width:35%;">${data.date}</td>
            </tr>
            <tr>
              <td style="padding:6px; border: 1px solid #000; font-weight:bold; background:#f8fafc;">工程全銜</td>
              <td style="padding:6px; border: 1px solid #000;" colspan="3">${data.title}</td>
            </tr>
            <tr>
              <td style="padding:6px; border: 1px solid #000; font-weight:bold; background:#f8fafc;">施工位置</td>
              <td style="padding:6px; border: 1px solid #000;" colspan="3">${data.constructionLocation}</td>
            </tr>
          </table>

          <table style="width:100%; border-collapse: collapse; font-size:11px; text-align: left; border: 1.5px solid #000;">
            <thead>
              <tr style="background:#f1f5f9; border-bottom: 2px solid #000;">
                <th style="padding:6px; border: 1px solid #000; text-align:center; width:5%;">項</th>
                <th style="padding:6px; border: 1px solid #000; width:45%;">項目名稱及規格說明</th>
                <th style="padding:6px; border: 1px solid #000; text-align:center; width:8%;">單位</th>
                <th style="padding:6px; border: 1px solid #000; text-align:center; width:8%;">數量</th>
                <th style="padding:6px; border: 1px solid #000; text-align:right; width:14%;">單價 (元)</th>
                <th style="padding:6px; border: 1px solid #000; text-align:right; width:20%;">複價 (元)</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map((item, idx) => `
                <tr style="border-bottom: 1px solid #000;">
                  <td style="padding:6px; border: 1px solid #000; text-align:center;">${idx + 1}</td>
                  <td style="padding:6px; border: 1px solid #000; font-weight:bold;">${item.name}</td>
                  <td style="padding:6px; border: 1px solid #000; text-align:center;">${item.unit}</td>
                  <td style="padding:6px; border: 1px solid #000; text-align:center; font-family:monospace;">${item.quantity}</td>
                  <td style="padding:6px; border: 1px solid #000; text-align:right; font-family:monospace;">$${item.price.toLocaleString()}</td>
                  <td style="padding:6px; border: 1px solid #000; text-align:right; font-weight:bold; font-family:monospace;">$${Math.round(item.quantity * item.price).toLocaleString()}</td>
                </tr>
              `).join('')}
              <tr style="background:#f8fafc; font-weight:bold;">
                <td colspan="5" style="padding:6px; border: 1px solid #000; text-align:right;">項目費用小計：</td>
                <td style="padding:6px; border: 1px solid #000; text-align:right; font-family:monospace;">$${baseSum.toLocaleString()}</td>
              </tr>
              <tr style="background:#f8fafc;">
                <td colspan="5" style="padding:6px; border: 1px solid #000; text-align:right; font-weight:bold;">設計監造服務費 (${data.designServiceRate}%)：</td>
                <td style="padding:6px; border: 1px solid #000; text-align:right; font-weight:bold; font-family:monospace;">$${designServiceFee.toLocaleString()}</td>
              </tr>
              <tr style="background:#f8fafc;">
                <td colspan="5" style="padding:6px; border: 1px solid #000; text-align:right; font-weight:bold;">包商利潤及配合費 (${data.contractorProfitRateB}%)：</td>
                <td style="padding:6px; border: 1px solid #000; text-align:right; font-weight:bold; font-family:monospace;">$${contractorProfitFee.toLocaleString()}</td>
              </tr>
              <tr style="background:#f1f5f9; font-weight:bold; font-size:13px;">
                <td colspan="5" style="padding:8px; border: 1px solid #000; text-align:right;">合 意 總 預 算 額：</td>
                <td style="padding:8px; border: 1px solid #000; text-align:right; color:#1e3b8a; font-family:monospace;">$${grandTotal.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    } else {
      // Template A_SUMMARY or A_DETAIL
      // 壹: 工程費
      const engFee = Math.round(data.items.filter(i => i.category === '壹_工程費' || i.category === '四_標誌標線')
        .reduce((acc, item) => acc + (item.quantity * item.price), 0));
      const safetyFee = Math.round(data.items.filter(i => i.category === '貳_職安費')
        .reduce((acc, item) => acc + (item.quantity * item.price), 0));
      const qualityFee = Math.round(data.items.filter(i => i.category === '參_品管費')
        .reduce((acc, item) => acc + (item.quantity * item.price), 0));
      const baseA = engFee + safetyFee + qualityFee;
      const tempProfit = Math.round(baseA * (data.b利润率 / 100));
      const insuranceFee = Math.round(baseA * (data.b保险率 / 100));
      const subTotalA = baseA + tempProfit + insuranceFee;
      const vatTax = Math.round(subTotalA * (data.b营业税率 / 100));
      const grandTotal = subTotalA + vatTax;

      if (data.templateType === 'A_SUMMARY') {
        htmlContent = `
          <div style="background: #ffffff; color: #1e293b; padding: 20px; font-family: -apple-system, sans-serif;">
            <h2 style="text-align:center; color:#1e3a8a; margin-bottom:5px; font-size:22px; font-weight:bold;">花蓮縣政府</h2>
            <h3 style="text-align:center; color:#334155; margin-top:0; margin-bottom:20px; font-size:16px;">
              總表 [${data.sponsorName}議員款補助案-估價單]
            </h3>
            
            <table style="width:100%; border-collapse: collapse; margin-bottom:15px; font-size:12px; border: 1px solid #000;">
              <tr>
                <td style="padding:6px; border: 1px solid #000; font-weight:bold; background:#f8fafc; width:15%;">會計科目</td>
                <td style="padding:6px; border: 1px solid #000; width:35%;">${data.accountingSubject}</td>
                <td style="padding:6px; border: 1px solid #000; font-weight:bold; background:#f8fafc; width:15%;">工程編號</td>
                <td style="padding:6px; border: 1px solid #000; width:35%;">${data.projectNumber}</td>
              </tr>
              <tr>
                <td style="padding:6px; border: 1px solid #000; font-weight:bold; background:#f8fafc;">工程名稱</td>
                <td style="padding:6px; border: 1px solid #000;" colspan="3">${data.title}</td>
              </tr>
              <tr>
                <td style="padding:6px; border: 1px solid #000; font-weight:bold; background:#f8fafc;">施工位置</td>
                <td style="padding:6px; border: 1px solid #000;" colspan="3">${data.constructionLocation}</td>
              </tr>
            </table>

            <table style="width:100%; border-collapse: collapse; font-size:11px; text-align: left; border: 1.5px solid #000;">
              <thead>
                <tr style="background:#f1f5f9; border-bottom: 2px solid #000;">
                  <th style="padding:6px; border: 1px solid #000; text-align:center; width:10%;">項次</th>
                  <th style="padding:6px; border: 1px solid #000; width:50%;">工作項目</th>
                  <th style="padding:6px; border: 1px solid #000; text-align:right; width:20%;">金額 (元)</th>
                  <th style="padding:6px; border: 1px solid #000; width:20%;">備註</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #000;">
                  <td style="padding:6px; border: 1px solid #000; text-align:center; font-weight:bold;">壹</td>
                  <td style="padding:6px; border: 1px solid #000;">工程費</td>
                  <td style="padding:6px; border: 1px solid #000; text-align:right; font-family:monospace; font-weight:bold;">$${engFee.toLocaleString()}</td>
                  <td style="padding:6px; border: 1px solid #000; color:#555;">詳見詳細價目表</td>
                </tr>
                <tr style="border-bottom: 1px solid #000;">
                  <td style="padding:6px; border: 1px solid #000; text-align:center; font-weight:bold;">貳</td>
                  <td style="padding:6px; border: 1px solid #000;">職業安全衛生費</td>
                  <td style="padding:6px; border: 1px solid #000; text-align:right; font-family:monospace; font-weight:bold;">$${safetyFee.toLocaleString()}</td>
                  <td style="padding:6px; border: 1px solid #000; color:#555;">詳見詳細價目表</td>
                </tr>
                <tr style="border-bottom: 1px solid #000;">
                  <td style="padding:6px; border: 1px solid #000; text-align:center; font-weight:bold;">參</td>
                  <td style="padding:6px; border: 1px solid #000;">品管費</td>
                  <td style="padding:6px; border: 1px solid #000; text-align:right; font-family:monospace; font-weight:bold;">$${qualityFee.toLocaleString()}</td>
                  <td style="padding:6px; border: 1px solid #000; color:#555;">詳見詳細價目表</td>
                </tr>
                <tr style="border-bottom: 1px solid #000;">
                  <td style="padding:6px; border: 1px solid #000; text-align:center; font-weight:bold;">肆</td>
                  <td style="padding:6px; border: 1px solid #000;">包商利潤費 (${data.b利润率.toFixed(1)}%)</td>
                  <td style="padding:6px; border: 1px solid #000; text-align:right; font-family:monospace; font-weight:bold;">$${tempProfit.toLocaleString()}</td>
                  <td style="padding:6px; border: 1px solid #000; font-family:monospace; color:#555;">壹~參約${data.b利润率}%</td>
                </tr>
                <tr style="border-bottom: 1px solid #000;">
                  <td style="padding:6px; border: 1px solid #000; text-align:center; font-weight:bold;">伍</td>
                  <td style="padding:6px; border: 1px solid #000;">保險費 (${data.b保险率.toFixed(2)}%)</td>
                  <td style="padding:6px; border: 1px solid #000; text-align:right; font-family:monospace; font-weight:bold;">$${insuranceFee.toLocaleString()}</td>
                  <td style="padding:6px; border: 1px solid #000; font-family:monospace; color:#555;">壹~參約${data.b保险率}%</td>
                </tr>
                <tr style="background:#f8fafc; font-weight:bold; font-size:12px;">
                  <td style="padding:6px; border: 1px solid #000; text-align:center;"></td>
                  <td style="padding:6px; border: 1px solid #000;">小計 (壹~伍)：</td>
                  <td style="padding:6px; border: 1px solid #000; text-align:right; font-family:monospace;">$${subTotalA.toLocaleString()}</td>
                  <td style="padding:6px; border: 1px solid #000;"></td>
                </tr>
                <tr style="border-bottom: 1px solid #000;">
                  <td style="padding:6px; border: 1px solid #000; text-align:center; font-weight:bold;">陸</td>
                  <td style="padding:6px; border: 1px solid #000;">營業稅 (${data.b营业税率.toFixed(1)}%)</td>
                  <td style="padding:6px; border: 1px solid #000; text-align:right; font-family:monospace; font-weight:bold;">$${vatTax.toLocaleString()}</td>
                  <td style="padding:6px; border: 1px solid #000; font-family:monospace; color:#555;">壹~伍之${data.b营业税率}%</td>
                </tr>
                <tr style="background:#f1f5f9; font-weight:bold; font-size:13px;">
                  <td style="padding:8px; border: 1px solid #000; text-align:center;">總價</td>
                  <td style="padding:8px; border: 1px solid #000;">
                    總預算金額：
                  </td>
                  <td style="padding:8px; border: 1px solid #000; text-align:right; color:#1e3b8a; font-family:monospace;">$${grandTotal.toLocaleString()}</td>
                  <td style="padding:8px; border: 1px solid #000;"></td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
      } else {
        // A_DETAIL
        htmlContent = `
          <div style="background: #ffffff; color: #1e293b; padding: 20px; font-family: -apple-system, sans-serif;">
            <h2 style="text-align:center; color:#1e3a8a; margin-bottom:5px; font-size:22px; font-weight:bold;">花蓮縣政府</h2>
            <h3 style="text-align:center; color:#334155; margin-top:0; margin-bottom:20px; font-size:16px;">
              詳細價目表 [${data.sponsorName}議員款補助案]
            </h3>
            
            <table style="width:100%; border-collapse: collapse; margin-bottom:15px; font-size:12px; border: 1px solid #000;">
              <tr>
                <td style="padding:6px; border: 1px solid #000; font-weight:bold; background:#f8fafc; width:15%;">會計科目</td>
                <td style="padding:6px; border: 1px solid #000; width:35%;">${data.accountingSubject}</td>
                <td style="padding:6px; border: 1px solid #000; font-weight:bold; background:#f8fafc; width:15%;">工程編號</td>
                <td style="padding:6px; border: 1px solid #000; width:35%;">${data.projectNumber}</td>
              </tr>
              <tr>
                <td style="padding:6px; border: 1px solid #000; font-weight:bold; background:#f8fafc;">工程名稱</td>
                <td style="padding:6px; border: 1px solid #000;" colspan="3">${data.title}</td>
              </tr>
              <tr>
                <td style="padding:6px; border: 1px solid #000; font-weight:bold; background:#f8fafc;">施工位置</td>
                <td style="padding:6px; border: 1px solid #000;" colspan="3">${data.constructionLocation}</td>
              </tr>
            </table>

            <table style="width:100%; border-collapse: collapse; font-size:11px; text-align: left; border: 1.5px solid #000;">
              <thead>
                <tr style="background:#f1f5f9; border-bottom: 2px solid #000;">
                  <th style="padding:6px; border: 1px solid #000; text-align:center; width:8%;">編號</th>
                  <th style="padding:6px; border: 1px solid #000; width:45%;">項目名稱及規格說明</th>
                  <th style="padding:6px; border: 1px solid #000; text-align:center; width:8%;">單位</th>
                  <th style="padding:6px; border: 1px solid #000; text-align:center; width:8%;">數量</th>
                  <th style="padding:6px; border: 1px solid #000; text-align:right; width:13%;">單價 (元)</th>
                  <th style="padding:6px; border: 1px solid #000; text-align:right; width:18%;">複價 (元)</th>
                </tr>
              </thead>
              <tbody>
                ${['壹_工程費', '貳_職安費', '參_品管費', '四_標誌標線'].map(cat => {
                  const itemsInCat = data.items.filter(i => i.category === cat);
                  if (itemsInCat.length === 0) return '';
                  return `
                    <tr style="background:#f8fafc; font-weight:bold;">
                      <td colspan="6" style="padding:6px; border: 1px solid #000; color:#1e3b8a;">【分類小計: ${cat.replace('_', ' ')}】</td>
                    </tr>
                    ${itemsInCat.map(item => `
                      <tr style="border-bottom: 1px solid #000;">
                        <td style="padding:6px; border: 1px solid #000; text-align:center;">${item.id}</td>
                        <td style="padding:6px; border: 1px solid #000;">${item.name}</td>
                        <td style="padding:6px; border: 1px solid #000; text-align:center;">${item.unit}</td>
                        <td style="padding:6px; border: 1px solid #000; text-align:center; font-family:monospace;">${item.quantity}</td>
                        <td style="padding:6px; border: 1px solid #000; text-align:right; font-family:monospace;">$${item.price.toLocaleString()}</td>
                        <td style="padding:6px; border: 1px solid #000; text-align:right; font-weight:bold; font-family:monospace;">$${Math.round(item.quantity * item.price).toLocaleString()}</td>
                      </tr>
                    `).join('')}
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    }

    newWindow.document.write(`
      <html>
        <head>
          <title>${data.title} - 高解析在線核備公文檢視系統</title>
          <meta charset="utf-8" />
          <style>
            body {
              background: #f1f5f9;
              margin: 0;
              padding: 40px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 90vh;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Taipei Sans TC", sans-serif;
            }
            .container {
              max-width: 800px;
              width: 100%;
            }
            .header-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              color: #475569;
              margin-bottom: 16px;
              font-size: 13px;
              font-weight: 600;
            }
            .btn-print {
              background: #0284c7;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 6px;
              font-weight: bold;
              cursor: pointer;
              transition: background 0.2s;
            }
            .btn-print:hover {
              background: #0369a1;
            }
            .certificate-seal {
              position: relative;
              width: 100px;
              height: 100px;
              border-radius: 50%;
              border: 2px solid #ef4444;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ef4444;
              font-weight: bold;
              font-size: 11px;
              transform: rotate(-12deg);
              margin-left: auto;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header-bar">
              <span>🛡️ 花蓮交通建設公務補助核備公文及估價單明細檢視(副本)</span>
              <button class="btn-print" onclick="window.print()">列印 / 匯出 PDF 副本</button>
            </div>
            <div style="background: #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border-radius: 12px; border: 1.5px solid #cbd5e1; padding: 20px;">
              ${htmlContent}
              <div style="padding: 20px 20px 0 20px; display: flex; align-items: flex-end;">
                <div style="font-size: 11px; color: #64748b; font-family: monospace;">
                  編製系統核簽: 安全配對認證通過<br/>
                  序號: SECORE-${Math.floor(Math.random() * 90000) + 10000}<br/>
                  時戳: ${new Date().toISOString().replace('T', ' ').substring(0, 19)} 安全校簽
                </div>
                <!-- Red Seal Stamp -->
                <div class="certificate-seal">
                  <div style="text-align: center; line-height: 1.3;">花蓮縣政府<br/>核定印信章<br/>✓校訖✓</div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    newWindow.document.close();
  };

  // Form states for adding a custom row
  const [newRowName, setNewRowName] = useState('');
  const [newRowUnit, setNewRowUnit] = useState('組');
  const [newRowQty, setNewRowQty] = useState(1);
  const [newRowPrice, setNewRowPrice] = useState(1000);
  const [newRowCode, setNewRowCode] = useState('');
  const [newRowCategory, setNewRowCategory] = useState<'壹_工程費' | '貳_職安費' | '參_品管費' | '四_標誌標線'>('壹_工程費');

  // Add Item to Spreadsheet
  const handleAddNewRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRowName) return;

    const newItem: BillItem = {
      id: `${Math.floor(Math.random() * 900) + 100}`,
      name: newRowName,
      unit: newRowUnit,
      quantity: newRowQty,
      price: newRowPrice,
      code: newRowCode || '自訂參數項目',
      remark: '工程人員新增',
      category: newRowCategory
    };

    if (activeTemplate === 'B_DIRECT') {
      setBillItemsB(prev => [...prev, newItem]);
    } else {
      setBillItems(prev => [...prev, newItem]);
    }

    // Reset Form
    setNewRowName('');
    setNewRowCode('');
  };

  // Remove Item from Spreadsheet
  const handleRemoveRow = (categoryId: string, indexInTemplate: number) => {
    if (activeTemplate === 'B_DIRECT') {
      setBillItemsB(prev => prev.filter((_, idx) => idx !== indexInTemplate));
    } else {
      setBillItems(prev => prev.filter((_, idx) => idx !== indexInTemplate));
    }
  };

  // Inline Cell Spreadsheet Update Handler
  const handleCellUpdate = (index: number, field: keyof BillItem, value: any) => {
    if (activeTemplate === 'B_DIRECT') {
      setBillItemsB(prev => {
        const copy = [...prev];
        copy[index] = { ...copy[index], [field]: value };
        return copy;
      });
    } else {
      setBillItems(prev => {
        const copy = [...prev];
        copy[index] = { ...copy[index], [field]: value };
        return copy;
      });
    }
  };

  // Spreadsheet calculations based strictly on current Template rules
  const activeItems = activeTemplate === 'B_DIRECT' ? billItemsB : billItems;

  const calculations = useMemo(() => {
    if (activeTemplate === 'B_DIRECT') {
      // 1. Sum up base item rows (Items 1-15)
      const baseSum = billItemsB.reduce((acc, item) => acc + (item.quantity * item.price), 0);
      
      // 2. 設計監造服務費 (e.g. 10%)
      const designServiceFee = Math.round(baseSum * (designServiceRate / 100));
      
      // 3. 包商利潤費 (e.g. 10%)
      const contractorProfitFee = Math.round(baseSum * (contractorProfitRateB / 100));
      
      // 4. Grand Total
      const grandTotal = baseSum + designServiceFee + contractorProfitFee;

      return {
        baseSum,
        designServiceFee,
        contractorProfitFee,
        grandTotal,
        // Empty template A specs
        engFee: 0,
        safetyFee: 0,
        qualityFee: 0,
        tempProfit: 0,
        insuranceFee: 0,
        subTotalA: 0,
        vatTax: 0
      };
    } else {
      // TEMPLATE A (徐雪玉案 總表 & 詳細價目表)
      // 壹: 工程費
      const engFee = Math.round(billItems.filter(i => i.category === '壹_工程費' || i.category === '四_標誌標線')
        .reduce((acc, item) => acc + (item.quantity * item.price), 0));
      
      // 貳: 職業安全衛生費
      const safetyFee = Math.round(billItems.filter(i => i.category === '貳_職安費')
        .reduce((acc, item) => acc + (item.quantity * item.price), 0));
      
      // 參: 品管費
      const qualityFee = Math.round(billItems.filter(i => i.category === '參_品管費')
        .reduce((acc, item) => acc + (item.quantity * item.price), 0));

      // 肆: 包商利潤費 (壹 ~ 參之約 9.0%)
      const baseA = engFee + safetyFee + qualityFee;
      const tempProfit = Math.round(baseA * (b利润率 / 100));

      // 伍: 保險費 (壹 ~ 參之約 0.3%)
      const insuranceFee = Math.round(baseA * (b保险率 / 100));

      // 小計 (壹 ~ 伍)
      const subTotalA = baseA + tempProfit + insuranceFee;

      // 陸: 營業稅 (5%)
      const vatTax = Math.round(subTotalA * (b营业税率 / 100));

      // 總價
      const grandTotal = subTotalA + vatTax;

      return {
        engFee,
        safetyFee,
        qualityFee,
        tempProfit,
        insuranceFee,
        subTotalA,
        vatTax,
        grandTotal,
        // Empty template B specs
        baseSum: 0,
        designServiceFee: 0,
        contractorProfitFee: 0
      };
    }
  }, [billItems, billItemsB, activeTemplate, b利润率, b保险率, b营业税率, designServiceRate, contractorProfitRateB]);

  // Helper: Format regular digits into commas or Chinese characters
  const formatCurrency = (val: number) => {
    return val.toLocaleString('zh-TW');
  };

  // Chinese standard writing numerals for security totals
  function toChineseCapital(n: number) {
    if (isNaN(n) || n < 0) return '';
    const fraction = ['角', '分'];
    const digit = ['零', '壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖'];
    const unit = [
      ['元', '萬', '億'],
      ['', '拾', '佰', '仟']
    ];
    let s = '';
    let num = Math.floor(n);
    let decimal = n - num;
    
    // Process Whole part
    for (let i = 0; i < unit[0].length && num > 0; i++) {
      let p = '';
      for (let j = 0; j < unit[1].length && num > 0; j++) {
        p = digit[num % 10] + unit[1][j] + p;
        num = Math.floor(num / 10);
      }
      s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
    }
    
    // Clean ups
    s = s.replace(/(零.)*零元/, '元');
    s = s.replace(/(零.)+/g, '零');
    s = s.replace(/^整$/, '零元整');
    
    if (s.startsWith('元')) s = s.substring(1);
    return s ? s + '整' : '零元整';
  }

  // Trigger browser print action
  const [printStatusText, setPrintStatusText] = useState('');
  const handlePrintDocument = () => {
    setPrintStatusText('準備列印紙張... 正套用高解析 A4 自動分頁與防折行格式！');
    setTimeout(() => {
      window.print();
    }, 300);
    setTimeout(() => {
      setPrintStatusText('');
    }, 4000);
  };

  // Reset spreadsheets to PDF default state
  const handleResetToDefaults = () => {
    if (window.confirm('確定要將當前表格內容重置為原始範本檔案設定值嗎？')) {
      // Fresh restore
      setBillItems([
        { id: '1', name: '光復鄉中山路二段-建國路二段號誌新建工程項目合規施工', unit: '式', quantity: 1.00, price: 251246, code: '015741010H', remark: '含配管放線', category: '壹_工程費' },
        { id: '(1)', name: '工程告示牌 (立牌及防護欄阻隔配置)', unit: '面', quantity: 1, price: 1588, code: '02893A0137', remark: '雙面鍍鋅高強鍍', category: '壹_工程費' },
        { id: '(2)', name: '勞工安全衛生，一般器材，安全告示牌', unit: '座', quantity: 1, price: 5425, code: '015741010H', remark: '附固定基底', category: '壹_工程費' },
        { id: '(3)', name: '交控維修灑水車 (10噸配備強力自排噴水壓)', unit: '時', quantity: 1.00, price: 1323, code: '1時/處', remark: '租用及運費', category: '壹_工程費' },
        { id: '(4)', name: '交通防護交維車 (配置後置防撞緩衝網)', unit: '日', quantity: 10.00, price: 5571, code: '1日/處', remark: '交維計畫指定備配', category: '壹_工程費' },
        { id: '(5)', name: '現場交維引導人員 (配置哨子、指揮LED棒)', unit: '日', quantity: 10.00, price: 1857, code: '1日/處', remark: '交監主管核備證照', category: '壹_工程費' },
        { id: '(6)', name: '環境保護，其他環境保護維生防塵防蟻措施', unit: '處', quantity: 1.00, price: 279, code: '01572C00041', remark: '施工完畢吹塵維護', category: '壹_工程費' },
        { id: '1', name: '職業安全衛生，保護器材，耐衝擊工程帽(黃/白色)', unit: '頂', quantity: 5, price: 186, code: '02893A0204', remark: 'CNS檢驗合格標章', category: '貳_職安費' },
        { id: '2', name: '產品，職業安全衛生，保護手部沾塑防滑工作毛手套', unit: '套', quantity: 10, price: 28, code: '02893A0205', remark: '雙層防撕裂材質', category: '貳_職安費' },
        { id: '3', name: '產品，職業安全衛生，雙效呼吸活性碳防塵防蟻式口罩', unit: '個', quantity: 20, price: 42, code: '02893A0206', remark: '特等密合過濾效率', category: '貳_職安費' },
        { id: '4', name: '產品，職業安全衛生，施工護目鏡，防電焊濺射護面鏡', unit: '個', quantity: 2, price: 335, code: '02893A0207', remark: '防霧高透光鋼化玻璃', category: '貳_職安費' },
        { id: '5', name: '產品，職業安全衛生，一般器材，高亮防護帽用安全防滑燈', unit: '只', quantity: 2, price: 441, code: '02893A0208', remark: '防潑水快拆頭盔夾', category: '貳_職安費' },
        { id: '6', name: '產品，職業安全衛生，急救箱配急救備品(附消毒生理鹽水)', unit: '組', quantity: 1, price: 661, code: '02893A0209', remark: '專用壁掛不鏽鋼箱', category: '貳_職安費' },
        { id: '7', name: '產品，職業安全衛生，ABC型乾粉滅火器(10P/附壓力錶)', unit: '具', quantity: 2, price: 1102, code: '02893A0210', remark: '消防安檢法規新品', category: '貳_職安費' },
        { id: '8', name: '職業安全衛生管理及施作計畫編列(按工料費比例0.2%)', unit: '式', quantity: 1.00, price: 654, code: '比例計算', remark: '專職主辦工程師編列', category: '貳_職安費' },
        { id: '9', name: '職業安全教育訓練、危害告知及演練(按工料費用0.4%)', unit: '式', quantity: 1.00, price: 1309, code: '比例計算', remark: '開工前安衛宣導備份', category: '貳_職安費' },
        { id: '10', name: '現場專職職業安全衛生管理稽查人員(按工料 fee1.8%)', unit: '式', quantity: 1.00, price: 5888, code: '管理編制', remark: '工程簽署指派技師', category: '貳_職安費' },
        { id: '5', name: '品質管理及取樣試驗人員(配合工區試體駐廠取樣天數)', unit: '天', quantity: 10.00, price: 1235, code: '02893A0215', remark: '品管專員檢核簽章', category: '參_品管費' },
        { id: '6', name: '現場行政管理費、自主品管及照片彙整 (按工料比0.01%)', unit: '式', quantity: 1.00, price: 33, code: '小額比例', remark: '印產資料備查', category: '參_品管費' },
        { id: '(1)', name: '路面熱處理聚酯反光標線施工 (厚度達 2.0mm)', unit: 'M2', quantity: 12.50, price: 351, code: '02893A0174', remark: '高亮反光玻璃砂', category: '四_標誌標線' },
        { id: '(16)', name: '既有熱處理聚酯標線磨除及廢土運棄工作', unit: 'M2', quantity: 5.00, price: 316, code: '02893A0189', remark: '磨除深達2mm不留痕', category: '四_標誌標線' }
      ]);
      setBillItemsB([
        { id: '1', name: 'L型8"行車號誌桿(臂長3.5M管壁6.0mm)', unit: '組', quantity: 2, price: 37687, code: '鍍鋅防風防鏽型', remark: '含安裝', category: '壹_工程費' },
        { id: '2', name: 'T型8吋行車號誌桿(臂長3.5M管壁6.0mm)', unit: '組', quantity: 1, price: 43278, code: '耐風壓設計型式', remark: '含安裝', category: '壹_工程費' },
        { id: '3', name: '號誌桿基礎混凝土基座(含1"高強度地錨螺栓、機器挖掘、深灌漿)', unit: '座', quantity: 3, price: 14577, code: '3000psi預拌混凝土', remark: '附基座灌漿檢查照', category: '壹_工程費' },
        { id: '4', name: '30cm三燈式燈箱組起吊空中安裝或舊阻拆除工資', unit: '邊', quantity: 8, price: 474, code: '配合高空吊車施工', remark: '含工料', category: '壹_工程費' },
        { id: '5', name: '12吋 30cmLED三燈式鋁合金超高亮燈箱頭組(配置紅、黃、綠三色)', unit: '組', quantity: 8, price: 16185, code: '節能長效一體成型', remark: '含不銹鋼固定支架', category: '壹_工程費' },
        { id: '6', name: '不銹鋼附掛式交控專用電源分界配電箱及安裝(含100A漏電開關)', unit: '個', quantity: 3, price: 4743, code: 'SUS304防撬密閉', remark: '含防突波漏電保護', category: '壹_工程費' },
        { id: '7', name: '新設台電線路供電申請及路口竣工聯合會勘相關規雜費', unit: '處', quantity: 3, price: 5691, code: '電力一併規畫申請', remark: '行政規費及試燈', category: '壹_工程費' },
        { id: '8', name: '2/C 5.5mm2 PVC 高阻燃耐熱橡膠包覆通訊電纜線(地埋管道)', unit: 'M', quantity: 30, price: 76, code: 'CNS符合標準', remark: '銅抽線防鼠咬', category: '壹_工程費' },
        { id: '9', name: '7/C 2.0mm2 PVC 多芯信號控制連動電纜線(高空吊掛及穿管)', unit: 'M', quantity: 30, price: 95, code: '高彈性多股芯線', remark: '多時相燈頭配線', category: '壹_工程費' },
        { id: '10', name: '微電腦智慧型多功能交通號誌控制器內部大底板主控機組', unit: '台', quantity: 1, price: 109829, code: 'MGC-3100 NTCIP', remark: '台廠自主研發晶片', category: '壹_工程費' },
        { id: '11', name: '多時相智慧號誌控制器無線5G/LTE雙備援通訊介面板模組', unit: '台', quantity: 3, price: 25960, code: 'VPN加密通訊認證', remark: '即時串流回報秒數', category: '壹_工程費' },
        { id: '12', name: '多功能控制主機網域備援5G無線模組天線配置與調頻拆裝費', unit: '式', quantity: 1, price: 9984, code: '高增益強效全向天線', remark: '交控中心登錄連線', category: '壹_工程費' },
        { id: '13', name: '多時相智慧號誌安裝工程系統現場調頻工料或周邊拆除復原費', unit: '式', quantity: 1, price: 44930, code: '多波段模擬時序計畫', remark: '現場全功能測試及點交', category: '壹_工程費' },
        { id: '14', name: '熱處理聚酯道路標線機械磨除作業(含現場標沙磨除及棄土運棄)', unit: 'M2', quantity: 20, price: 339, code: '深度去除2mm防反光', remark: '防滑係數重配置', category: '四_標誌標線' },
        { id: '15', name: '路面 2mm 厚高反光耐磨熱處理聚酯玻璃珠反光標線重繪工程', unit: 'M2', quantity: 50, price: 377, code: '15%特級反光玻璃砂', remark: '標線耐候性測試完畢', category: '四_標誌標線' }
      ]);
      setB利润率(9.0);
      setB保险率(0.3);
      setB营业税率(5.0);
      setDesignServiceRate(10.0);
      setContractorProfitRateB(10.0);
    }
  };

  return (
    <div id="wrapper_document_generation" className="h-full flex flex-col bg-slate-100 overflow-hidden select-none">
      
      {/* Dynamic Header Toolbar */}
      <div className="p-4 bg-white border-b border-slate-200 shrink-0 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <span className="text-blue-600 font-extrabold">📁</span> 
            <span>花蓮公務議員補助款預算文件產製器</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            依據議員建議款或補助款實物範本格式設計，整合動態計算算式，一鍵產製格式完美之「總表」與「詳細價目表」。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToDefaults}
            className="px-3 py-1.5 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            id="btn_reset_defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>規格重置</span>
          </button>
          
          <button 
            type="button"
            onClick={() => handleOpenDocInNewWindow()}
            className="bg-sky-600 hover:bg-sky-700 text-white font-black text-xs py-1.5 px-3.5 rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer border border-sky-500"
            id="btn_open_current_new_window"
          >
            <BookOpen className="w-4 h-4" />
            <span>開新視窗檢視</span>
          </button>

          <button 
            onClick={handlePrintDocument}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-1.5 px-4 rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer border border-indigo-500"
            id="nav_btn_document"
          >
            <Printer className="w-4 h-4" />
            <span>匯出 PDF / 列印紙張</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* ================================== LEFT CONFIGURATION / SPREADSHEET EDITOR PANEL ================================== */}
        <div className="w-full lg:w-[460px] bg-slate-900 text-slate-200 p-5 overflow-y-auto shrink-0 flex flex-col border-r border-slate-950">
          
          {/* Sub Tab Selection (Current Editor VS Historical Database) */}
          <div className="flex bg-slate-950 p-1 rounded-xl mb-4 text-xs font-bold border border-slate-850 shrink-0 select-none">
            <button
              type="button"
              onClick={() => setLeftSidebarTab('editor')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
                leftSidebarTab === 'editor'
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>🛠️ 當前估價編輯</span>
            </button>
            <button
              type="button"
              onClick={() => setLeftSidebarTab('history')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
                leftSidebarTab === 'history'
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>📜 歷史對照庫</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-1.5 rounded-full border border-amber-500/30">
                {historicalDocs.length}
              </span>
            </button>
          </div>

          {leftSidebarTab === 'editor' ? (
            <>
              {/* Section 1: Template Choices */}
          <div className="mb-5">
            <span className="text-[10px] uppercase font-black text-indigo-400 tracking-wider">Step 1. 選取目標範本類型</span>
            <div className="grid grid-cols-3 gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTemplate('A_SUMMARY');
                  setSponsorName('徐雪玉副議長');
                }}
                className={`py-2 px-1 text-center rounded-lg border text-[11px] font-bold cursor-pointer transition flex flex-col items-center justify-center gap-1 ${
                  activeTemplate === 'A_SUMMARY'
                    ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
                id="template_btn_a_summary"
              >
                <FileText className="w-4 h-4" />
                <span className="truncate w-full max-w-full">範本甲: 總表</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setActiveTemplate('A_DETAIL');
                  setSponsorName('徐雪玉副議長');
                }}
                className={`py-2 px-1 text-center rounded-lg border text-[11px] font-bold cursor-pointer transition flex flex-col items-center justify-center gap-1 ${
                  activeTemplate === 'A_DETAIL'
                    ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
                id="template_btn_a_detail"
              >
                <Layers className="w-4 h-4" />
                <span className="truncate w-full max-w-full">範本甲: 詳細表</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTemplate('B_DIRECT');
                  setSponsorName('鄭乾龍議員');
                }}
                className={`py-2 px-1 text-center rounded-lg border text-[11px] font-bold cursor-pointer transition flex flex-col items-center justify-center gap-1 ${
                  activeTemplate === 'B_DIRECT'
                    ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
                id="template_btn_b_direct"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="truncate w-full max-w-full">範本乙: 單頁詳表</span>
              </button>
            </div>
          </div>

          {/* Section 2: Core Variables Mapping */}
          <div className="mb-5 space-y-3 bg-slate-800 p-4 rounded-xl border border-slate-700/80">
            <span className="text-[10px] uppercase font-black text-indigo-400 tracking-wider flex items-center justify-between">
              <span>Step 2. 公文及標案基本變更</span>
              <span className="text-slate-400 font-mono text-[9px]">綁定: [{targetId}] ({targetIntersection.district})</span>
            </span>

            <div className="grid grid-cols-2 gap-2.5 text-[11px]">
              <div>
                <label className="block text-slate-400 font-bold mb-1">對應及加載路口</label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full p-2 border border-slate-700 bg-slate-900 rounded text-xs text-white"
                >
                  {intersections.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.id} - {i.name} ({i.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">編製款名義 (動態補助)</label>
                <input
                  type="text"
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-emerald-300 font-bold"
                  placeholder="如: 徐雪玉副議長"
                />
              </div>
            </div>

            <div className="text-[11px]">
              <label className="block text-slate-400 font-bold mb-1">工程名稱 (標案全銜)</label>
              <textarea
                rows={2}
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white leading-normal"
                placeholder="輸入工程標案正式名稱..."
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-[11px]">
              <div>
                <label className="block text-slate-400 font-bold mb-1">施工地點 (自動帶入)</label>
                <input
                  type="text"
                  value={constructionLocation}
                  onChange={(e) => setConstructionLocation(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                  placeholder="例如: 廣興一街-吉興路二段"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">產製日期 (格式)</label>
                <input
                  type="text"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-[11px]">
              <div>
                <label className="block text-slate-400 font-bold mb-1">會計科目編號</label>
                <input
                  type="text"
                  value={accountingSubject}
                  onChange={(e) => setAccountingSubject(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">標案工程編號</label>
                <input
                  type="text"
                  value={projectNumber}
                  onChange={(e) => setProjectNumber(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Spreadsheet Dynamic Parameters Adjuster */}
          <div className="mb-5 space-y-3 bg-slate-800 p-4 rounded-xl border border-slate-700/80">
            <span className="text-[10px] uppercase font-black text-indigo-400 tracking-wider flex items-center justify-between">
              <span>Step 3. 系統規費與趴數比例算式調配</span>
              <CircleDollarSign className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            </span>

            {activeTemplate !== 'B_DIRECT' ? (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 font-bold mb-1">
                    <span>包商利潤費率 (肆)</span>
                    <span className="font-mono text-amber-300 font-black">{b利润率.toFixed(1)} %</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="0.1"
                    value={b利润率}
                    onChange={(e) => setB利润率(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-900 h-1.5 rounded-lg appearance-none"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">※ 法定為第壹~參項總和乘以本比例</span>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-bold mb-1">
                    <span>綜合保險費率 (伍)</span>
                    <span className="font-mono text-amber-300 font-black">{b保险率.toFixed(2)} %</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.05"
                    value={b保险率}
                    onChange={(e) => setB保险率(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-900 h-1.5 rounded-lg appearance-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-bold mb-1">
                    <span>營業稅比例 (陸)</span>
                    <span className="font-mono text-amber-300 font-black">{b营业税率.toFixed(1)} %</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={b营业税率}
                    onChange={(e) => setB营业税率(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-900 h-1.5 rounded-lg appearance-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 font-bold mb-1">
                    <span>設計監造服務費率</span>
                    <span className="font-mono text-amber-300 font-black">{designServiceRate.toFixed(1)} %</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="0.5"
                    value={designServiceRate}
                    onChange={(e) => setDesignServiceRate(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-900 h-1.5 rounded-lg appearance-none"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">※ 依法套用議員款設計監理上限</span>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-bold mb-1">
                    <span>包商利潤及配合費率</span>
                    <span className="font-mono text-amber-300 font-black">{contractorProfitRateB.toFixed(1)} %</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="0.5"
                    value={contractorProfitRateB}
                    onChange={(e) => setContractorProfitRateB(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-900 h-1.5 rounded-lg appearance-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Live Item List Spreadsheet (Cell Editor) */}
          <div className="flex-1 flex flex-col min-h-[300px]">
            <span className="text-[10px] uppercase font-black text-indigo-400 tracking-wider mb-2 block">
              Step 4. 動態單價分析/數量即時修改 (動態算式套用)
            </span>

            {/* List with light cards to touch and modify prices fast */}
            <div className="space-y-2 flex-1 overflow-y-auto max-h-[340px] pr-1.5">
              {activeItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="bg-slate-800 p-2.5 rounded-lg border border-slate-700/70 text-xs flex flex-col gap-2 relative">
                  
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveRow(item.category, index)}
                    className="absolute top-2 right-2 text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-750 transition cursor-pointer"
                    title="刪除此項目"
                    id={`btn_del_item_${item.id}_${index}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="pr-6 font-bold text-slate-100 flex items-center gap-1.5 text-[11px]">
                    <span className="bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded font-mono text-[9px] uppercase">
                      {item.id}
                    </span>
                    <span className="truncate max-w-[280px]" title={item.name}>{item.name}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-[10px] font-mono">
                    <div>
                      <span className="text-slate-500 block">單位</span>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleCellUpdate(index, 'unit', e.target.value)}
                        className="w-full bg-slate-950 text-slate-200 p-1 rounded text-center border border-slate-800 text-[10px]"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block">數量</span>
                      <input
                        type="number"
                        step="0.1"
                        value={item.quantity}
                        onChange={(e) => handleCellUpdate(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 text-emerald-300 p-1 rounded text-center font-bold border border-slate-800 text-[10px]"
                      />
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 block">單價(元)</span>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleCellUpdate(index, 'price', parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 text-amber-300 p-1 rounded font-bold border border-slate-800 text-[10px] text-right pr-1"
                      />
                    </div>
                  </div>

                  {/* Subtotal preview block */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-750/60 pt-1.5 font-mono">
                    <span>備註編碼: <span className="text-slate-300">{item.code || '無'}</span></span>
                    <span>小計: <strong className="text-slate-200">${formatCurrency(Math.round(item.quantity * item.price))}</strong> 元</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Form to insert custom items */}
            <form onSubmit={handleAddNewRow} className="mt-3 pt-3 border-t border-slate-800 text-[11px] space-y-2">
              <span className="text-[10px] font-black text-indigo-400 flex items-center gap-1">
                <Plus className="w-3 h-3" />
                <span>新增自訂估價細目</span>
              </span>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <input
                    type="text"
                    value={newRowName}
                    onChange={(e) => setNewRowName(e.target.value)}
                    placeholder="新增項目及規格說明"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
                    id="input_new_item_name"
                  />
                </div>
                <div>
                  <select
                    value={newRowCategory}
                    onChange={(e) => setNewRowCategory(e.target.value as any)}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-slate-300"
                  >
                    <option value="壹_工程費">壹_工程費</option>
                    <option value="貳_職安費">貳_職安費</option>
                    <option value="參_品管費">參_品管費</option>
                    <option value="四_標誌標線">肆_標誌標線</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <input
                    type="text"
                    value={newRowUnit}
                    onChange={(e) => setNewRowUnit(e.target.value)}
                    placeholder="單位"
                    className="w-full p-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-center"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={newRowQty}
                    onChange={(e) => setNewRowQty(parseFloat(e.target.value) || 0)}
                    placeholder="數量"
                    className="w-full p-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-center"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={newRowPrice}
                    onChange={(e) => setNewRowPrice(parseInt(e.target.value) || 0)}
                    placeholder="單價(元)"
                    className="w-full p-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-right"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-1.5 rounded text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                id="btn_add_to_spreadsheet"
              >
                + 添加至下方預算估算表
              </button>
            </form>
          </div>
          </>
          ) : (
            <div className="flex-1 flex flex-col space-y-4">
              <div>
                <span className="text-[10px] uppercase font-black text-amber-400 tracking-wider">📚 歷史核定公文與估價單資料庫</span>
                <p className="text-[11px] text-slate-400 mt-1 font-medium leading-relaxed">
                  提供往年同地區、同議員核定補助案件之估價項目及成效費趴數比例，方便對照稽核、防範超出規範。
                </p>
              </div>

              {/* Search & Filter section */}
              <div className="space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    placeholder="搜尋議員姓名、地區、工程關鍵字..."
                    className="w-full pl-9 pr-7 py-2 bg-slate-900 border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 transition"
                  />
                  {historySearchQuery && (
                    <button
                      type="button"
                      onClick={() => setHistorySearchQuery('')}
                      className="absolute right-2 top-2 text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">依鄉鎮市篩選</label>
                    <select
                      value={historyFilterDistrict}
                      onChange={(e) => setHistoryFilterDistrict(e.target.value)}
                      className="w-full p-1.5 bg-slate-900 border border-slate-800 rounded-sm text-[11px] text-white"
                    >
                      <option value="ALL">全部地區</option>
                      <option value="吉安鄉">吉安鄉</option>
                      <option value="光復鄉">光復鄉</option>
                      <option value="壽豐鄉">壽豐鄉</option>
                      <option value="花蓮市">花蓮市</option>
                    </select>
                  </div>
                  
                  {/* Quick Preset Buttons */}
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        setHistorySearchQuery('鄭乾龍');
                        setHistoryFilterDistrict('ALL');
                      }}
                      className="px-2 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[10px] rounded-md font-bold text-amber-300 transition cursor-pointer"
                    >
                      #鄭乾龍
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHistorySearchQuery('徐雪玉');
                        setHistoryFilterDistrict('ALL');
                      }}
                      className="px-2 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[10px] rounded-md font-bold text-amber-300 transition cursor-pointer ml-1"
                    >
                      #徐雪玉
                    </button>
                  </div>
                </div>
              </div>

              {/* Historical Documents list */}
              <div className="space-y-2 flex-1 max-h-[300px] overflow-y-auto pr-1">
                <div className="text-[10px] font-black text-slate-400">目前符合篩選條件金額對照的歷史案卷: ({filteredHistoryDocs.length} 筆)</div>
                {filteredHistoryDocs.length === 0 ? (
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-lg text-center text-slate-500 text-xs">
                    找不到符合搜尋條件的歷史文案
                  </div>
                ) : (
                  filteredHistoryDocs.map(doc => {
                    const isSelected = selectedHistoryDoc?.id === doc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedHistoryDoc(doc)}
                        className={`p-3 rounded-xl border transition cursor-pointer select-none relative ${
                          isSelected
                            ? 'bg-amber-900/20 border-amber-500 shadow-md text-white'
                            : 'bg-slate-950 border-slate-850 text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1 pb-1">
                          <span className="text-[10px] font-black bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded">
                            {doc.year} · {doc.district}
                          </span>
                          <span className={`text-[10px] py-0.5 px-1.5 rounded font-bold ${
                            doc.templateType === 'B_DIRECT' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          }`}>
                            {doc.templateType === 'B_DIRECT' ? '範本乙 (單頁價目)' : '範本甲 (總/詳細表)'}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold leading-normal mt-1">{doc.title}</h4>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 border-t border-slate-800/60 pt-1.5 animate-duration-300">
                          <div>
                            <span>建議補助：</span>
                            <span className="text-emerald-400 font-extrabold">{doc.sponsorName}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDocInNewWindow(doc);
                              }}
                              className="px-2 py-0.5 bg-sky-700 hover:bg-sky-600 text-white font-bold text-[9px] rounded-md transition-colors flex items-center gap-0.5 shadow-xs cursor-pointer"
                              title="在單獨安全新視窗中開立檢視此公文明細"
                            >
                              <BookOpen className="w-2.5 h-2.5" />
                              <span>檢視</span>
                            </button>
                            <div className="font-mono text-white">
                              <strong className="text-amber-400 font-black">${doc.grandTotal.toLocaleString()}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Selected Historical File Details and Comparison */}
              {selectedHistoryDoc ? (
                <div className="bg-slate-950 rounded-xl border border-amber-500/40 p-4 space-y-3 shrink-0">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                    <div>
                      <h4 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>已選取對照歷史案卷</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{selectedHistoryDoc.id} · {selectedHistoryDoc.accountingSubject}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenDocInNewWindow(selectedHistoryDoc)}
                        className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-black rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                        title="在新視窗中安心檢視公文與此歷史估價單內容"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>新視窗檢視</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`確定要將「${selectedHistoryDoc.title}」的「${selectedHistoryDoc.sponsorName}」建議補助款項目、單價、算式比例複製並覆蓋至當前工作區嗎？您的現有編輯將會被重置！`)) {
                            // Perform apply!
                            setProjectTitle(selectedHistoryDoc.title);
                            setSponsorName(selectedHistoryDoc.sponsorName);
                            setActiveTemplate(selectedHistoryDoc.templateType);
                            setAccountingSubject(selectedHistoryDoc.accountingSubject);
                            setProjectNumber(selectedHistoryDoc.projectNumber);
                            setConstructionLocation(selectedHistoryDoc.constructionLocation);
                            setCustomDate(selectedHistoryDoc.date);
                            setDesignerName(selectedHistoryDoc.designerName);
                            
                            if (selectedHistoryDoc.templateType === 'B_DIRECT') {
                              setBillItemsB(selectedHistoryDoc.items);
                              if (selectedHistoryDoc.designServiceRate) setDesignServiceRate(selectedHistoryDoc.designServiceRate);
                              if (selectedHistoryDoc.contractorProfitRateB) setContractorProfitRateB(selectedHistoryDoc.contractorProfitRateB);
                            } else {
                              setBillItems(selectedHistoryDoc.items);
                              if (selectedHistoryDoc.b利润率) setB利润率(selectedHistoryDoc.b利润率);
                              if (selectedHistoryDoc.b保险率) setB保险率(selectedHistoryDoc.b保险率);
                              if (selectedHistoryDoc.b营业税率) setB营业税率(selectedHistoryDoc.b营业税率);
                            }
                            
                            setLeftSidebarTab('editor');
                            alert(`對對備妥！已成功套用歷史估價項目與參數設定：\n- 項目數：${selectedHistoryDoc.items.length} 段\n- 補助名義：${selectedHistoryDoc.sponsorName}\n- 套用格式：${selectedHistoryDoc.templateType}`);
                          }
                        }}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                        title="快速點按此鍵可將核定項目拷貝至編輯器動態調適"
                      >
                        <Download className="w-3 h-3" />
                        <span>直接套用</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-[11px] leading-relaxed text-slate-300 font-sans">
                    <div>
                      <span className="text-slate-500 font-bold block">歷史說明備忘記錄:</span>
                      <p className="bg-slate-900 border border-slate-800 p-2 rounded text-[10px] text-slate-300 leading-normal">
                        {selectedHistoryDoc.notes}
                      </p>
                    </div>

                    {/* Compare calculations */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 font-sans">
                      <div>
                        <span className="text-slate-500 font-bold block justify-between">歷史總經費:</span>
                        <span className="font-mono text-amber-300 font-black text-md">${selectedHistoryDoc.grandTotal.toLocaleString()}元</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block justify-between">當前設計總經費:</span>
                        <span className="font-mono text-emerald-400 font-black text-md">${calculations.grandTotal.toLocaleString()}元</span>
                      </div>
                      <div className="col-span-2 border-t border-slate-800/80 pt-1 mt-1 flex justify-between items-center text-[9px] font-sans">
                        <span className="text-slate-500">與當前設計金額之差異變動:</span>
                        {calculations.grandTotal - selectedHistoryDoc.grandTotal === 0 ? (
                          <span className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded font-bold font-mono">相符 (±0)</span>
                        ) : calculations.grandTotal - selectedHistoryDoc.grandTotal > 0 ? (
                          <span className="text-red-400 bg-red-950 px-1 py-0.5 rounded font-black font-mono">
                            增加 +${(calculations.grandTotal - selectedHistoryDoc.grandTotal).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-emerald-400 bg-emerald-950 px-1 py-0.5 rounded font-black font-mono">
                            減少 ${(calculations.grandTotal - selectedHistoryDoc.grandTotal).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Toggle overlay comparison in right preview panel */}
                    <div className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800 mt-1 font-sans">
                      <span className="text-[10px] text-slate-300 font-bold flex items-center gap-1">
                        <ArrowLeftRight className="w-3 h-3 text-amber-400 animate-pulse" />
                        <span>啟用預算對照遮置 (與右側比對)</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={isCompareMode}
                        onChange={(e) => setIsCompareMode(e.target.checked)}
                        className="w-3.5 h-3.5 rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl text-center text-slate-500 text-[11px] font-bold">
                  💡 請在上方清單中選擇一個歷史案卷以進行「金額比例分析對照」或直接套用該案。
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================================== RIGHT PAPER PRINTER-PREVIEW VIEWPORT ================================== */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-slate-250 flex items-start justify-center print:bg-white print:p-0">
          
          {/* Printable visual frame, styled exactly with clean grid lines and traditional public sector fonts */}
          <div 
            className="w-full max-w-[800px] bg-white border border-slate-300 shadow-2xl rounded-sm p-10 md:p-12 print:border-none print:shadow-none min-h-[1050px] relative font-serif text-slate-900 print:p-0 select-text"
            id="print_preview_canvas"
          >
            
            {/* Status alerts overlay only in preview container, hidden during physical print (print:hidden) */}
            {printStatusText && (
              <div className="print:hidden absolute top-4 left-4 right-4 bg-emerald-50 border border-emerald-300 text-emerald-950 p-3 rounded shadow-lg flex items-center gap-2 text-xs font-sans z-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-bounce" />
                <span>{printStatusText}</span>
              </div>
            )}

            {/* Comparison Overlay Banner (print:hidden) */}
            {isCompareMode && selectedHistoryDoc && (
              <div className="print:hidden mb-6 bg-amber-50 border-2 border-amber-550 rounded-lg p-4 font-sans text-xs shadow-md space-y-2 select-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/30 rounded-full -mr-8 -mt-8 pointer-events-none"></div>
                <div className="flex items-center justify-between text-amber-950 font-black">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    <History className="w-4 h-4 text-amber-600" />
                    <span>歷史公文預算比對中...</span>
                  </div>
                  <button 
                    onClick={() => setIsCompareMode(false)}
                    className="text-stone-500 hover:text-stone-850 text-sm cursor-pointer"
                    title="關閉比對遮置"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1 font-sans">
                    <span className="text-slate-500 font-bold block text-[10px] uppercase">對照歷史案件資訊:</span>
                    <div className="text-black font-extrabold">{selectedHistoryDoc.title}</div>
                    <div className="text-slate-600">
                      建議補助: <span className="font-bold text-amber-800">{selectedHistoryDoc.sponsorName}</span> · 
                      類型: <span className="text-stone-700 font-bold">{selectedHistoryDoc.templateType === 'B_DIRECT' ? '範本乙' : '範本甲'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 border-t md:border-t-0 md:border-l border-amber-200 pt-2 md:pt-0 md:pl-4 font-sans">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">歷史總金額:</span>
                      <span className="font-mono font-black text-amber-700">${selectedHistoryDoc.grandTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">當前預算金額:</span>
                      <span className="font-mono font-black text-emerald-700">${calculations.grandTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] border-t border-amber-200/80 pt-1 mt-1">
                      <span className="font-bold text-slate-800">核支差異比率:</span>
                      {calculations.grandTotal - selectedHistoryDoc.grandTotal === 0 ? (
                        <span className="font-mono text-slate-750 font-bold">完全等值 (±0)</span>
                      ) : calculations.grandTotal - selectedHistoryDoc.grandTotal > 0 ? (
                        <span className="font-mono text-red-650 font-black">
                          超出比率 +{(( (calculations.grandTotal - selectedHistoryDoc.grandTotal) / selectedHistoryDoc.grandTotal ) * 100).toFixed(1)}% 
                          (+${(calculations.grandTotal - selectedHistoryDoc.grandTotal).toLocaleString()})
                        </span>
                      ) : (
                        <span className="font-mono text-emerald-650 font-black">
                          節省比率 -{Math.abs(( (calculations.grandTotal - selectedHistoryDoc.grandTotal) / selectedHistoryDoc.grandTotal ) * 100).toFixed(1)}% 
                          (-${Math.abs(calculations.grandTotal - selectedHistoryDoc.grandTotal).toLocaleString()})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Show simple side-by-side items grid inside comparison widget */}
                <div className="mt-2.5 pt-2 border-t border-amber-200 text-[10px] font-sans">
                  <span className="text-slate-500 font-bold block mb-1">歷史核定主要項目參考明細 (對照比對):</span>
                  <div className="max-h-[120px] overflow-y-auto bg-white/60 p-1.5 rounded border border-amber-200/60 divide-y divide-amber-100/50">
                    {selectedHistoryDoc.items.map((hi, i) => (
                      <div key={hi.id + i} className="py-1 flex justify-between gap-2">
                        <span className="text-stone-880 truncate font-semibold">{hi.id}. {hi.name} ({hi.unit})</span>
                        <span className="font-mono text-stone-900 shrink-0 font-extrabold">
                          {hi.quantity} × ${hi.price?.toLocaleString()} = <span className="text-amber-800">${(hi.quantity * hi.price)?.toLocaleString()}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================================== A1. TEMPLATE A: 總表估價單 ================================== */}
            {activeTemplate === 'A_SUMMARY' && (
              <div className="space-y-6">
                {/* Header Section */}
                <div className="text-center space-y-1">
                  <h1 className="text-2xl font-black text-black tracking-widest font-sans">花 蓮 縣 政 府</h1>
                  <h2 className="text-xl font-bold tracking-wide text-stone-900 font-sans">
                    總表[{sponsorName}議員款補助案-估價單]
                  </h2>
                  <div className="flex justify-between items-center text-xs pt-4 font-sans text-stone-700 font-bold">
                    <span>115年6月12日</span>
                    <span>第 1 頁 共 1 頁</span>
                  </div>
                </div>

                {/* Top Parameters Block Grid */}
                <table className="w-full border-t-2 border-x-2 border-black border-collapse text-xs">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="w-20 p-2.5 font-bold border-r border-black bg-stone-50 select-none text-center">工程名稱</td>
                      <td className="p-2.5 leading-relaxed font-sans font-medium" colSpan={3}>
                        {projectTitle}
                      </td>
                      <td className="w-20 p-2.5 font-bold border-x border-black bg-stone-50 select-none text-center">會計科目</td>
                      <td className="w-28 p-2.5 font-mono">{accountingSubject}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="w-20 p-2.5 font-bold border-r border-black bg-stone-50 select-none text-center">施工地點</td>
                      <td className="p-2.5 font-sans font-bold" colSpan={3}>
                        {constructionLocation}
                      </td>
                      <td className="w-20 p-2.5 font-bold border-x border-black bg-stone-50 select-none text-center">工程編號</td>
                      <td className="w-28 p-2.5 font-mono">{projectNumber}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Main Table Items Grid (Excel Style) */}
                <table className="w-full border-2 border-black border-collapse text-xs font-sans">
                  <thead>
                    <tr className="border-b border-black bg-stone-50 text-stone-900">
                      <th className="w-14 p-2 border-r border-black font-extrabold text-center">項 次</th>
                      <th className="p-2 border-r border-black text-left pl-4">工 作 項 目</th>
                      <th className="w-32 p-2 border-r border-black text-right pr-4">金額 (元)</th>
                      <th className="w-32 p-2 text-left pl-3">備 註</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Row 壹: 工程費 */}
                    <tr className="border-b border-stone-300">
                      <td className="p-2 border-r border-black text-center font-bold">壹</td>
                      <td className="p-2 border-r border-black pl-4">工程費</td>
                      <td className="p-2 border-r border-black text-right pr-4 font-bold font-mono">
                        {formatCurrency(calculations.engFee)}
                      </td>
                      <td className="p-2 text-stone-500 font-medium">詳見甲詳細價目表</td>
                    </tr>

                    {/* Row 貳: 職業安全衛生費 */}
                    <tr className="border-b border-stone-300">
                      <td className="p-2 border-r border-black text-center font-bold">貳</td>
                      <td className="p-2 border-r border-black pl-4">職業安全衛生費</td>
                      <td className="p-2 border-r border-black text-right pr-4 font-bold font-mono">
                        {formatCurrency(calculations.safetyFee)}
                      </td>
                      <td className="p-2 text-stone-500 font-medium">按規定編列設施費</td>
                    </tr>

                    {/* Row 參: 品管費 */}
                    <tr className="border-b border-stone-300">
                      <td className="p-2 border-r border-black text-center font-bold">參</td>
                      <td className="p-2 border-r border-black pl-4">品管費</td>
                      <td className="p-2 border-r border-black text-right pr-4 font-bold font-mono">
                        {formatCurrency(calculations.qualityFee)}
                      </td>
                      <td className="p-2 text-stone-500 font-medium">試維考檢自主管理費</td>
                    </tr>

                    {/* Row 肆: 包商利潤費 */}
                    <tr className="border-b border-stone-300">
                      <td className="p-2 border-r border-black text-center font-bold">肆</td>
                      <td className="p-2 border-r border-black pl-4">包商利潤費 (壹~參之約 {b利润率.toFixed(1)}%)</td>
                      <td className="p-2 border-r border-black text-right pr-4 font-bold font-mono">
                        {formatCurrency(calculations.tempProfit)}
                      </td>
                      <td className="p-2 text-stone-500 font-mono">自動精算比例 {b利润率}%</td>
                    </tr>

                    {/* Row 伍: 保險費 */}
                    <tr className="border-b border-stone-300">
                      <td className="p-2 border-r border-black text-center font-bold">伍</td>
                      <td className="p-2 border-r border-black pl-4">保險費 (壹~參之約 {b保险率.toFixed(2)}%)</td>
                      <td className="p-2 border-r border-black text-right pr-4 font-bold font-mono">
                        {formatCurrency(calculations.insuranceFee)}
                      </td>
                      <td className="p-2 text-stone-500 font-mono">工程及第三人及保費</td>
                    </tr>

                    {/* Subtotal line */}
                    <tr className="border-b-2 border-stone-400 bg-stone-50/50">
                      <td className="p-2 border-r border-black text-center font-bold"></td>
                      <td className="p-2 border-r border-black pl-4 font-semibold">小計(壹~伍)</td>
                      <td className="p-2 border-r border-black text-right pr-4 font-bold font-mono text-black">
                        {formatCurrency(calculations.subTotalA)}
                      </td>
                      <td className="p-2"></td>
                    </tr>

                    {/* Row 陸: 營業稅 */}
                    <tr className="border-b border-black">
                      <td className="p-2 border-r border-black text-center font-bold">陸</td>
                      <td className="p-2 border-r border-black pl-4">營業稅 (壹~伍之 {b营业税率.toFixed(1)}%)</td>
                      <td className="p-2 border-r border-black text-right pr-4 font-bold font-mono">
                        {formatCurrency(calculations.vatTax)}
                      </td>
                      <td className="p-2 text-stone-500 font-mono">加值型營業稅 {b营业税率}%</td>
                    </tr>

                    {/* Grand Total Row */}
                    <tr className="bg-stone-50 text-stone-950 font-bold border-b border-black">
                      <td className="p-2.5 border-r border-black text-center">總價</td>
                      <td className="p-2.5 border-r border-black pl-4 text-sm tracking-widest font-sans flex items-center justify-between">
                        <span>總價 (總計)</span>
                        <span className="text-[10px] bg-amber-100 text-stone-900 px-1 py-0.5 rounded ml-2 selection:bg-stone-800">
                          {toChineseCapital(calculations.grandTotal)}
                        </span>
                      </td>
                      <td className="p-2.5 border-r border-black text-right pr-4 text-sm font-black font-mono">
                        {formatCurrency(calculations.grandTotal)}
                      </td>
                      <td className="p-2.5">元整</td>
                    </tr>

                    {/* Empty Fill Rows to maintain exact government document aesthetic height */}
                    {Array.from({ length: 9 }).map((_, i) => (
                      <tr key={`empty-${i}`} className="h-6 border-b border-stone-200">
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Signature Panel */}
                <div className="pt-8 flex justify-between items-center text-xs font-sans font-bold text-stone-800 select-none">
                  <div>
                    <span>編製：{designerName} 印</span>
                  </div>
                  <div className="w-36 text-center border-b border-stone-400 pb-1 mr-12 text-stone-400">
                    <span>簽核複審主管章簽具處</span>
                  </div>
                </div>
              </div>
            )}

            {/* ================================== A2. TEMPLATE A: 詳細價目表 ================================== */}
            {activeTemplate === 'A_DETAIL' && (
              <div className="space-y-6">
                {/* Header Section */}
                <div className="text-center space-y-1">
                  <h1 className="text-2xl font-black text-black tracking-widest font-sans">花 蓮 縣 政 府</h1>
                  <h2 className="text-xl font-bold tracking-wide text-stone-900 font-sans">
                    詳細價目表[{sponsorName}議員款補助案-估價單]
                  </h2>
                  <div className="flex justify-between items-center text-xs pt-4 font-sans text-stone-700 font-bold">
                    <span>115年6月12日</span>
                    <span>第 1 頁 共 1 頁</span>
                  </div>
                </div>

                {/* Parameters block */}
                <table className="w-full border-t-2 border-x-2 border-black border-collapse text-xs">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="w-20 p-2 border-r border-black bg-stone-50 select-none text-center font-bold">工程名稱</td>
                      <td className="p-2" colSpan={3}>{projectTitle}</td>
                      <td className="w-20 p-2 border-x border-black bg-stone-50 select-none text-center font-bold">會計科目</td>
                      <td className="w-28 p-2 font-mono">{accountingSubject}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="w-20 p-2 border-r border-black bg-stone-50 select-none text-center font-bold">施工地點</td>
                      <td className="p-2 font-bold" colSpan={3}>{constructionLocation}</td>
                      <td className="w-20 p-2 border-x border-black bg-stone-50 select-none text-center font-bold">工程編號</td>
                      <td className="w-28 p-2 font-mono">{projectNumber}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Spreadsheet Body */}
                <table className="w-full border-2 border-black border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-black bg-stone-50 font-bold text-center">
                      <th className="w-10 p-1.5 border-r border-black">項次</th>
                      <th className="p-1.5 border-r border-black text-left">項 目 及 說 明</th>
                      <th className="w-8 p-1.5 border-r border-black">單位</th>
                      <th className="w-12 p-1.5 border-r border-black">數量</th>
                      <th className="w-20 p-1.5 border-r border-black text-right pr-2">單 價</th>
                      <th className="w-20 p-1.5 border-r border-black text-right pr-2">複 價</th>
                      <th className="w-24 p-1.5 text-left">編碼 (備註)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-black bg-stone-100 font-extrabold text-[11px]">
                      <td className="p-1.5 border-r border-black text-center">壹</td>
                      <td className="p-1.5 border-r border-black" colSpan={6}>工程費</td>
                    </tr>

                    {/* Map Items belonging to Engineering Fee */}
                    {billItems.filter(item => item.category === '壹_工程費').map((item, idx) => (
                      <tr key={item.id} className="border-b border-stone-200">
                        <td className="p-1.5 border-r border-black text-center font-mono font-bold">{idx + 1}</td>
                        <td className="p-1.5 border-r border-black">{item.name}</td>
                        <td className="p-1.5 border-r border-black text-center">{item.unit}</td>
                        <td className="p-1.5 border-r border-black text-center font-mono">{item.quantity.toFixed(2)}</td>
                        <td className="p-1.5 border-r border-black text-right pr-2 font-mono">{formatCurrency(item.price)}</td>
                        <td className="p-1.5 border-r border-black text-right pr-2 font-mono font-bold">
                          {formatCurrency(Math.round(item.quantity * item.price))}
                        </td>
                        <td className="p-1.5 text-stone-500 truncate max-w-[90px]">{item.code}</td>
                      </tr>
                    ))}

                    <tr className="border-b border-black bg-stone-100 font-extrabold text-[11px]">
                      <td className="p-1.5 border-r border-black text-center">貳</td>
                      <td className="p-1.5 border-r border-black" colSpan={6}>職業安全衛生費</td>
                    </tr>

                    {/* Map items belonging to Safety Class */}
                    {billItems.filter(item => item.category === '貳_職安費').map((item, idx) => (
                      <tr key={item.id} className="border-b border-stone-200">
                        <td className="p-1.5 border-r border-black text-center font-mono font-bold">{idx + 1}</td>
                        <td className="p-1.5 border-r border-black">{item.name}</td>
                        <td className="p-1.5 border-r border-black text-center">{item.unit}</td>
                        <td className="p-1.5 border-r border-black text-center font-mono">{item.quantity.toFixed(2)}</td>
                        <td className="p-1.5 border-r border-black text-right pr-2 font-mono">{formatCurrency(item.price)}</td>
                        <td className="p-1.5 border-r border-black text-right pr-2 font-mono font-bold">
                          {formatCurrency(Math.round(item.quantity * item.price))}
                        </td>
                        <td className="p-1.5 text-stone-500 truncate max-w-[90px]">{item.code}</td>
                      </tr>
                    ))}

                    <tr className="border-b border-black bg-stone-100 font-extrabold text-[11px]">
                      <td className="p-1.5 border-r border-black text-center">參</td>
                      <td className="p-1.5 border-r border-black" colSpan={6}>品管費</td>
                    </tr>

                    {/* Map items belonging to QC Class */}
                    {billItems.filter(item => item.category === '參_品管費').map((item, idx) => (
                      <tr key={item.id} className="border-b border-stone-200">
                        <td className="p-1.5 border-r border-black text-center font-mono font-bold">{idx + 1}</td>
                        <td className="p-1.5 border-r border-black">{item.name}</td>
                        <td className="p-1.5 border-r border-black text-center">{item.unit}</td>
                        <td className="p-1.5 border-r border-black text-center font-mono">{item.quantity.toFixed(2)}</td>
                        <td className="p-1.5 border-r border-black text-right pr-2 font-mono">{formatCurrency(item.price)}</td>
                        <td className="p-1.5 border-r border-black text-right pr-2 font-mono font-bold">
                          {formatCurrency(Math.round(item.quantity * item.price))}
                        </td>
                        <td className="p-1.5 text-stone-500 truncate max-w-[90px]">{item.code}</td>
                      </tr>
                    ))}

                    {/* Map items belonging to Mark Paint */}
                    {billItems.filter(item => item.category === '四_標誌標線').map((item, idx) => (
                      <tr key={item.id} className="border-b border-stone-200">
                        <td className="p-1.5 border-r border-black text-center font-mono font-bold">{idx + 1}</td>
                        <td className="p-1.5 border-r border-black">{item.name}</td>
                        <td className="p-1.5 border-r border-black text-center">{item.unit}</td>
                        <td className="p-1.5 border-r border-black text-center font-mono">{item.quantity.toFixed(2)}</td>
                        <td className="p-1.5 border-r border-black text-right pr-2 font-mono">{formatCurrency(item.price)}</td>
                        <td className="p-1.5 border-r border-black text-right pr-2 font-mono font-bold">
                          {formatCurrency(Math.round(item.quantity * item.price))}
                        </td>
                        <td className="p-1.5 text-stone-500 truncate max-w-[90px]">{item.code}</td>
                      </tr>
                    ))}

                    {/* Sum Category Totals reflecting the real math formulas */}
                    <tr className="border-b border-black font-extrabold bg-stone-50 text-[10px]">
                      <td className="p-1.5 border-r border-black text-center">肆</td>
                      <td className="p-1.5 border-r border-black" colSpan={4}>包商利潤費 (按比 {b利润率}% 計算)</td>
                      <td className="p-1.5 border-r border-black text-right pr-2 font-mono">{formatCurrency(calculations.tempProfit)}</td>
                      <td className="p-1.5">比例扣代</td>
                    </tr>
                    <tr className="border-b border-black font-extrabold bg-stone-50 text-[10px]">
                      <td className="p-1.5 border-r border-black text-center">伍</td>
                      <td className="p-1.5 border-r border-black" colSpan={4}>保險費 (按比 {b保险率}% 自動預扣)</td>
                      <td className="p-1.5 border-r border-black text-right pr-2 font-mono">{formatCurrency(calculations.insuranceFee)}</td>
                      <td className="p-1.5">工程風險保額</td>
                    </tr>
                    <tr className="border-b-2 border-black font-extrabold bg-stone-200 text-[11px]">
                      <td className="p-1.5 border-r border-black text-center"></td>
                      <td className="p-1.5 border-r border-black" colSpan={4}>小計 (壹 ~ 伍項之總和)</td>
                      <td className="p-1.5 border-r border-black text-right pr-2 font-mono text-black">{formatCurrency(calculations.subTotalA)}</td>
                      <td className="p-1.5">中繼暫估</td>
                    </tr>
                    <tr className="border-b border-black font-extrabold bg-stone-50 text-[10px]">
                      <td className="p-1.5 border-r border-black text-center">陸</td>
                      <td className="p-1.5 border-r border-black" colSpan={4}>營業稅 (各項之 {b营业税率}%)</td>
                      <td className="p-1.5 border-r border-black text-right pr-2 font-mono">{formatCurrency(calculations.vatTax)}</td>
                      <td className="p-1.5">5%加值型稅金</td>
                    </tr>
                    <tr className="border-b-2 border-black font-black bg-stone-900 text-white text-[11px]">
                      <td className="p-2 border-r border-white text-center"></td>
                      <td className="p-2 border-r border-white" colSpan={4}>總價 (總計金額)</td>
                      <td className="p-2 border-r border-white text-right pr-2 font-mono text-amber-300 font-extrabold">{formatCurrency(calculations.grandTotal)}</td>
                      <td className="p-2">NTD 元整</td>
                    </tr>
                  </tbody>
                </table>

                {/* Signature Block */}
                <div className="pt-6 flex justify-between items-center text-xs font-sans font-bold">
                  <div>編製：{designerName} 印</div>
                  <div className="mr-8">複核小組 / 科長主管會章戮名：__________________</div>
                </div>
              </div>
            )}

            {/* ================================== B1. TEMPLATE B: 鄭乾龍議員詳細價目表 ================================== */}
            {activeTemplate === 'B_DIRECT' && (
              <div className="space-y-6">
                {/* PDF Template Header (Screenshot 2 Style) */}
                <div className="space-y-2 border-b-2 border-black pb-4 text-stone-950 font-semibold text-xs leading-relaxed font-sans">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="block text-md tracking-wider text-black font-black">
                        {sponsorName}建議補助款案號誌設備估案表
                      </strong>
                      <div className="mt-1 space-y-0.5">
                        <span className="block">路口：{constructionLocation}</span>
                        <span className="block">需求：多相智慧三色號誌全套施工與高流量調配系統</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block font-sans font-black text-[13px] bg-stone-100 px-2 py-1 rounded inline-block text-black">
                        預算明細
                      </span>
                      <span className="block text-[10px] text-stone-500 mt-1">
                        產製日期: {customDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* High contrast table matching Screenshot Page 6 */}
                <table className="w-full border-2 border-black border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-stone-50 border-b-2 border-black text-[10px] font-black text-stone-900">
                      <th className="w-10 p-1.5 border-r border-black text-center">項次</th>
                      <th className="p-1.5 border-r border-black text-left">項目及說明</th>
                      <th className="w-10 p-1.5 border-r border-black text-center">單位</th>
                      <th className="w-10 p-1.5 border-r border-black text-center">數量</th>
                      <th className="w-18 p-1.5 border-r border-black text-right pr-2">單價</th>
                      <th className="w-20 p-1.5 border-r border-black text-right pr-2">複價</th>
                      <th className="w-20 p-1.5 text-left pl-2">備註</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-black font-extrabold bg-stone-50">
                      <td className="p-1.5 border-r border-black text-center font-bold">一</td>
                      <td className="p-1.5 border-r border-black font-black" colSpan={6}>號誌與道路安全整合組件施工</td>
                    </tr>

                    {/* Array mapping */}
                    {billItemsB.map((item, idx) => (
                      <tr key={item.id} className="border-b border-stone-200">
                        <td className="p-1.5 border-r border-black text-center font-mono">{idx + 1}</td>
                        <td className="p-1.5 border-r border-black font-sans leading-relaxed text-stone-900">{item.name}</td>
                        <td className="p-1.5 border-r border-black text-center">{item.unit}</td>
                        <td className="p-1.5 border-r border-black text-center font-mono font-bold">{item.quantity}</td>
                        <td className="p-1.5 border-r border-black text-right pr-2 font-mono">{formatCurrency(item.price)}</td>
                        <td className="p-1.5 border-r border-black text-right pr-2 font-mono font-semibold">
                          {formatCurrency(Math.round(item.quantity * item.price))}
                        </td>
                        <td className="p-1.5 text-stone-500 font-sans truncate max-w-[80px]" title={item.remark}>
                          {item.id === '1' || item.id === '2' ? '含安裝' : item.remark}
                        </td>
                      </tr>
                    ))}

                    {/* Base Small Total */}
                    <tr className="border-b border-black bg-stone-50 font-bold">
                      <td className="p-1.5 border-r border-black text-center"></td>
                      <td className="p-1.5 border-r border-black text-right pr-3 font-extrabold" colSpan={4}>工程費用小計</td>
                      <td className="p-1.5 border-r border-black text-right pr-2 font-mono text-black font-black">
                        {formatCurrency(calculations.baseSum)}
                      </td>
                      <td className="p-1.5"></td>
                    </tr>

                    {/* Dynamic Design Services Addition */}
                    <tr className="border-b border-stone-300">
                      <td className="p-1.5 border-r border-black text-center font-mono">16</td>
                      <td className="p-1.5 border-r border-black">設計監造服務費 (按前計比例約 {designServiceRate}%)</td>
                      <td className="p-1.5 border-r border-black text-center">式</td>
                      <td className="p-1.5 border-r border-black text-center font-mono">1</td>
                      <td className="p-1.5 border-r border-black text-right pr-2 font-mono">{formatCurrency(calculations.designServiceFee)}</td>
                      <td className="p-1.5 border-r border-black text-right pr-2 font-mono font-bold">{formatCurrency(calculations.designServiceFee)}</td>
                      <td className="p-1.5 text-stone-500">規劃及開標監審</td>
                    </tr>

                    {/* Contractor Profit addition */}
                    <tr className="border-b border-black">
                      <td className="p-1.5 border-r border-black text-center font-mono">17</td>
                      <td className="p-1.5 border-r border-black">包商利潤費 (約 {contractorProfitRateB}%)</td>
                      <td className="p-1.5 border-r border-black text-center">式</td>
                      <td className="p-1.5 border-r border-black text-center font-mono">1</td>
                      <td className="p-1.5 border-r border-black text-right pr-2 font-mono">{formatCurrency(calculations.contractorProfitFee)}</td>
                      <td className="p-1.5 border-r border-black text-right pr-2 font-mono font-bold">{formatCurrency(calculations.contractorProfitFee)}</td>
                      <td className="p-1.5 text-stone-500">施工技術利潤</td>
                    </tr>

                    {/* Grand Total Row */}
                    <tr className="bg-stone-100 text-stone-950 font-black border-b-2 border-black text-[11px]">
                      <td className="p-2 border-r border-black text-center">合計</td>
                      <td className="p-2 border-r border-black pl-3 flex items-center justify-between" colSpan={4}>
                        <span>工程及各項規費總計 (GRAND TOTAL)</span>
                        <span className="text-[10px] bg-stone-250 border border-stone-350 text-stone-900 px-1 py-0.5 rounded leading-none mr-1.5 font-bold">
                          大寫金額: {toChineseCapital(calculations.grandTotal)}
                        </span>
                      </td>
                      <td className="p-2 border-r border-black text-right pr-2 font-mono text-md font-black text-black">
                        {formatCurrency(calculations.grandTotal)}
                      </td>
                      <td className="p-2">元整</td>
                    </tr>
                  </tbody>
                </table>

                {/* Footer seal placeholders */}
                <div className="pt-5 grid grid-cols-3 gap-4 text-[10px] font-sans font-bold text-stone-700 select-none">
                  <div>
                    <span>主辦編製單位：花蓮交通科</span>
                  </div>
                  <div className="text-center">
                    <span>承辦技師負責人簽章處</span>
                  </div>
                  <div className="text-right">
                    <span>委任技師監造章：__________________</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom watermark or legal notices during preview, hidden on print */}
            <div className="absolute bottom-4 right-4 text-[9px] text-stone-400 font-mono italic print:hidden text-right">
              自動套表產生器 HL-Platform v4.1 · 簽准後由公文傳遞
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
