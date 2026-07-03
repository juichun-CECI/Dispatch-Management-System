import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Intersection, ControllerType, SystemUser } from '../types';
import { 
  Database, 
  Info, 
  Activity, 
  Wrench, 
  ShieldCheck, 
  ShieldAlert, 
  Calendar, 
  Cpu, 
  Search, 
  Upload, 
  Trash2, 
  Plus, 
  CheckCircle, 
  Download, 
  Sparkles, 
  Layers,
  FileText,
  AlertCircle,
  HelpCircle,
  MapPin,
  ClipboardList
} from 'lucide-react';

interface IntersectionElementsViewProps {
  intersections: Intersection[];
  onUpdateIntersectionDetails: (id: string, updatedParams: Partial<Intersection>) => void;
  selectedIntersection: Intersection | null;
  onSelectIntersection: (intersection: Intersection) => void;
  currentUser: SystemUser;
}

// Full 43-item list from Table 19 in the PDF
export interface SurveyItem {
  id: string;
  index: number;
  name: string;
  type: 'select' | 'number';
  options?: string[];
  unit?: string;
  defaultVal: string | number;
}

export const TABLE_19_ITEMS: SurveyItem[] = [
  // Group A: 行政轄區與號誌一般屬性 (1-3, 13-15)
  { id: 'survey_1', index: 1, name: '號誌屬性(三色管制/三色開閃光/閃光號誌/時段自動三色管制/ITS智慧化路口/感應式號誌)', type: 'select', options: ['三色管制', '三色開閃光', '閃光號誌', '時段自動三色管制', 'ITS智慧化路口', '感應式號誌'], defaultVal: '三色管制' },
  { id: 'survey_2', index: 2, name: '管線配置(地下線/架空線/地下線架空線)', type: 'select', options: ['地下線', '架空線', '地下線架空線'], defaultVal: '地下線' },
  { id: 'survey_3', index: 3, name: '感應式號誌', type: 'select', options: ['是', '否'], defaultVal: '是' },
  { id: 'survey_13', index: 13, name: '管理轄區(新城分局/花蓮分局/吉安分局/鳳林分局/玉里分局)', type: 'select', options: ['新城分局', '花蓮分局', '吉安分局', '鳳林分局', '玉里分局'], defaultVal: '花蓮分局' },
  { id: 'survey_14', index: 14, name: '省縣道(省道/縣道)', type: 'select', options: ['省道', '縣道', '一般市區道路'], defaultVal: '縣道' },
  { id: 'survey_15', index: 15, name: '易肇事路口', type: 'select', options: ['是', '否'], defaultVal: '否' },

  // Group B: 燈箱組與燈泡數量 (6-12, 16)
  { id: 'survey_6', index: 6, name: '行人號誌燈數', type: 'number', unit: '個', defaultVal: 4 },
  { id: 'survey_7', index: 7, name: '單燈箱數', type: 'number', unit: '組', defaultVal: 0 },
  { id: 'survey_8', index: 8, name: '三燈箱數', type: 'number', unit: '組', defaultVal: 4 },
  { id: 'survey_9', index: 9, name: '四燈箱數', type: 'number', unit: '組', defaultVal: 2 },
  { id: 'survey_10', index: 10, name: '五燈箱數', type: 'number', unit: '組', defaultVal: 0 },
  { id: 'survey_11', index: 11, name: '倒數燈箱(黃燈)', type: 'number', unit: '組', defaultVal: 2 },
  { id: 'survey_12', index: 12, name: '倒數燈箱(獨立)', type: 'number', unit: '組', defaultVal: 2 },
  { id: 'survey_16', index: 16, name: '行人燈箱數', type: 'number', unit: '個', defaultVal: 4 },

  // Group C: 桿件結構與共桿配置 (4, 17, 19-34)
  { id: 'survey_4', index: 4, name: '號誌桿數', type: 'number', unit: '桿', defaultVal: 4 },
  { id: 'survey_17', index: 17, name: '附掛標誌牌號誌桿數', type: 'number', unit: '支', defaultVal: 4 },
  { id: 'survey_19', index: 19, name: '號誌桿數(一般型懸臂桿)', type: 'number', unit: '支', defaultVal: 2 },
  { id: 'survey_20', index: 20, name: '號誌桿數(六英吋組合桿)', type: 'number', unit: '支', defaultVal: 0 },
  { id: 'survey_21', index: 21, name: '號誌桿數(八英吋組合桿)', type: 'number', unit: '支', defaultVal: 2 },
  { id: 'survey_22', index: 22, name: '號誌桿數(十英吋組合桿)', type: 'number', unit: '支', defaultVal: 0 },
  { id: 'survey_23', index: 23, name: '號誌桿數(其他)', type: 'number', unit: '支', defaultVal: 0 },
  { id: 'survey_24', index: 24, name: '加高桿數', type: 'number', unit: '支', defaultVal: 1 },
  { id: 'survey_25', index: 25, name: '行人號誌桿數', type: 'number', unit: '支', defaultVal: 2 },
  { id: 'survey_26', index: 26, name: '燈牌共桿數(F型燈牌共桿)', type: 'number', unit: '支', defaultVal: 2 },
  { id: 'survey_27', index: 27, name: '燈牌共桿數(附掛燈牌共桿)', type: 'number', unit: '支', defaultVal: 0 },
  { id: 'survey_28', index: 28, name: '路燈共桿數', type: 'number', unit: '支', defaultVal: 2 },
  { id: 'survey_29', index: 29, name: '路燈共桿數(加高桿彎曲)', type: 'number', unit: '支', defaultVal: 1 },
  { id: 'survey_30', index: 30, name: '號誌輔助桿數', type: 'number', unit: '支', defaultVal: 0 },
  { id: 'survey_31', index: 31, name: '瑕疵號誌桿數', type: 'number', unit: '支', defaultVal: 0 },
  { id: 'survey_32', index: 32, name: '歪斜號誌桿數', type: 'number', unit: '支', defaultVal: 0 },
  { id: 'survey_33', index: 33, name: '號誌桿手孔蓋(未加強)', type: 'number', unit: '支', defaultVal: 4 },
  { id: 'survey_34', index: 34, name: '號誌桿手孔蓋(已加強)', type: 'number', unit: '支', defaultVal: 0 },

  // Group D: 監控錄影及標誌附掛 (5, 18, 35-43)
  { id: 'survey_5', index: 5, name: '路口監視器數', type: 'number', unit: '支', defaultVal: 2 },
  { id: 'survey_18', index: 18, name: '車流監視器數(交通科)', type: 'number', unit: '支', defaultVal: 1 },
  { id: 'survey_35', index: 35, name: '附掛標誌(圓形)', type: 'number', unit: '面', defaultVal: 4 },
  { id: 'survey_36', index: 36, name: '附掛標誌(三角形)', type: 'number', unit: '面', defaultVal: 2 },
  { id: 'survey_37', index: 37, name: '附掛標誌(方型)', type: 'number', unit: '面', defaultVal: 2 },
  { id: 'survey_38', index: 38, name: '附掛標誌(大型)', type: 'number', unit: '面', defaultVal: 0 },
  { id: 'survey_39', index: 39, name: '附掛標誌(說明牌)', type: 'number', unit: '面', defaultVal: 1 },
  { id: 'survey_40', index: 40, name: '附掛標誌(路名牌)', type: 'number', unit: '面', defaultVal: 4 },
  { id: 'survey_41', index: 41, name: '附掛牌面(反光鏡)', type: 'number', unit: '面', defaultVal: 2 },
  { id: 'survey_42', index: 42, name: '廣告物', type: 'number', unit: '面', defaultVal: 0 },
  { id: 'survey_43', index: 43, name: '附掛標誌(其他)', type: 'number', unit: '面', defaultVal: 0 }
];

export default function IntersectionElementsView({
  intersections,
  onUpdateIntersectionDetails,
  selectedIntersection,
  onSelectIntersection,
  currentUser
}: IntersectionElementsViewProps) {
  // Currently managed intersection selection
  const activeIntersection = useMemo(() => {
    if (selectedIntersection) {
      return intersections.find(i => i.id === selectedIntersection.id) || selectedIntersection;
    }
    return intersections[0] || null;
  }, [intersections, selectedIntersection]);

  // Sidebar search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  // Interactive local inputs
  const [brandInput, setBrandInput] = useState('');
  const [typeInput, setTypeInput] = useState<ControllerType>('MGC-3100');
  const [warrantyStart, setWarrantyStart] = useState('');
  const [warrantyEnd, setWarrantyEnd] = useState('');

  // 43 survey items state
  const [surveyState, setSurveyState] = useState<Record<string, string | number>>({});
  
  // Categorized survey tab for better readability
  const [surveyGroupTab, setSurveyGroupTab] = useState<'A' | 'B' | 'C' | 'D'>('A');

  // File Upload states
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Dynamic Alert / feedback banners
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const triggerFeedback = (text: string, type: 'success' | 'info' = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Synchronize dynamic input fields on selection change
  useEffect(() => {
    if (activeIntersection) {
      setBrandInput(activeIntersection.controllerBrand || '大亞號誌工業 (Hualien Branch)');
      setTypeInput(activeIntersection.controllerType || 'MGC-3100');
      
      // Auto build standard dates if not yet completed
      const defaultStart = activeIntersection.installDate || '2024-01-10';
      const defaultEnd = activeIntersection.warrantyStartDate 
        ? new Date(new Date(activeIntersection.warrantyStartDate).setFullYear(new Date(activeIntersection.warrantyStartDate).getFullYear() + 2)).toISOString().split('T')[0]
        : '2026-01-10';

      setWarrantyStart(activeIntersection.warrantyStartDate || defaultStart);
      setWarrantyEnd(activeIntersection.warrantyEndDate || defaultEnd);

      // Load 43 surveyors values or fallback to default table 19 values
      const currentSnapshot = activeIntersection.elementsCheckedData || {};
      const fullSnapshot: Record<string, string | number> = {};
      TABLE_19_ITEMS.forEach(item => {
        fullSnapshot[item.id] = currentSnapshot[item.id] !== undefined ? currentSnapshot[item.id] : item.defaultVal;
      });
      setSurveyState(fullSnapshot);
    }
  }, [activeIntersection]);

  // District options list helper
  const districts = useMemo(() => {
    const list = new Set(intersections.map(i => i.district));
    return ['all', ...Array.from(list)];
  }, [intersections]);

  // Filter intersections lists
  const filteredIntersections = useMemo(() => {
    return intersections.filter(i => {
      const matchesSearch = 
        i.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDistrict = selectedDistrict === 'all' || i.district === selectedDistrict;
      return matchesSearch && matchesDistrict;
    });
  }, [intersections, searchTerm, selectedDistrict]);

  // Survey item group classifications
  const groupedItems = useMemo(() => {
    return {
      A: TABLE_19_ITEMS.filter(it => [1, 2, 3, 13, 14, 15].includes(it.index)),
      B: TABLE_19_ITEMS.filter(it => [6, 7, 8, 9, 10, 11, 12, 16].includes(it.index)),
      C: TABLE_19_ITEMS.filter(it => [4, 17, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34].includes(it.index)),
      D: TABLE_19_ITEMS.filter(it => [5, 18, 35, 36, 37, 38, 39, 40, 41, 42, 43].includes(it.index)),
    };
  }, []);

  // Update specific survey values
  const handleSurveyValChange = (surveyId: string, value: string | number) => {
    setSurveyState(prev => ({
      ...prev,
      [surveyId]: value
    }));
  };

  // Perform full survey default quick seeds imports
  const handleImportSurveyTemplate = () => {
    if (!currentUser.permissions.canEditSurveyElements) {
      alert('權限不足！您目前的登入身分缺乏「普查與填寫43項路口諸元」特權，無法帶入預設屬性。');
      return;
    }
    if (!activeIntersection) return;
    
    // Auto populate reasonable random but realistic numbers close to physical reality
    const isMajorJunction = activeIntersection.flowRate > 1500;
    
    const seeded: Record<string, string | number> = {};
    TABLE_19_ITEMS.forEach(it => {
      if (it.type === 'number') {
        let val = Number(it.defaultVal);
        if (isMajorJunction) {
          if (it.index === 4) val = 6; // poles
          if (it.index === 8) val = 6; // 3-box lanterns
          if (it.index === 5) val = 4; // cameras
          if (it.index === 17) val = 8; // attachments
        } else {
          // minor lanes
          if (it.index === 4) val = 2;
          if (it.index === 8) val = 2;
          if (it.index === 9) val = 0;
        }
        seeded[it.id] = val;
      } else {
        // selects
        if (it.index === 13) {
          // maps to true division
          if (activeIntersection.district === '花蓮市') seeded[it.id] = '花蓮分局';
          else if (activeIntersection.district === '吉安鄉') seeded[it.id] = '吉安分局';
          else if (activeIntersection.district === '新城鄉') seeded[it.id] = '新城分局';
          else seeded[it.id] = '鳳林分局';
        } else if (it.index === 14) {
          seeded[it.id] = activeIntersection.name.includes('台9') || activeIntersection.name.includes('台11') ? '省道' : '一般市區道路';
        } else {
          seeded[it.id] = it.defaultVal;
        }
      }
    });

    setSurveyState(seeded);
    triggerFeedback('✓ 成功快速生成路口諸元預設配置，您可以微調後儲存存檔！', 'info');
  };

  // Handle saving survey + controller metadata
  const handleSaveAllElements = () => {
    if (!activeIntersection) return;

    // Check if warranty fields or manufacturer details changed
    const hasMetadataChanges = brandInput !== (activeIntersection.controllerBrand || '') || 
                               typeInput !== (activeIntersection.controllerType || '') || 
                               warrantyStart !== (activeIntersection.warrantyStartDate || '') || 
                               warrantyEnd !== (activeIntersection.warrantyEndDate || '');
    
    // Check if the 43 items changed
    const originalSurvey = activeIntersection.elementsCheckedData || {};
    let hasSurveyChanges = false;
    TABLE_19_ITEMS.forEach(it => {
      const orig = String(originalSurvey[it.id] !== undefined ? originalSurvey[it.id] : it.defaultVal);
      const cur = String(surveyState[it.id] !== undefined ? surveyState[it.id] : it.defaultVal);
      if (orig !== cur) {
        hasSurveyChanges = true;
      }
    });

    if (hasMetadataChanges && !currentUser.permissions.canEditIntersections) {
      alert('權限被拒！您目前的登入身分不具備「編輯基本路口及控制器屬性」權限。無法儲存控制器廠牌/型號/保固期等資訊。');
      return;
    }

    if (hasSurveyChanges && !currentUser.permissions.canEditSurveyElements) {
      alert('權限被拒！您目前的登入身分不具備「普查及填寫43項路口諸元」權限。無法儲存 43 項表格盤點數據。');
      return;
    }

    // Check if warranty is expired on current systems
    const todayStr = new Date().toISOString().split('T')[0];
    const computedWarrantyStatus = (warrantyEnd && warrantyEnd < todayStr) ? 'W_EXPIRED' : 'W_VALID';

    // Build overall variables set
    const paramsToUpdate: Partial<Intersection> = {
      controllerBrand: brandInput,
      controllerType: typeInput,
      warrantyStartDate: warrantyStart,
      warrantyEndDate: warrantyEnd,
      warranty: computedWarrantyStatus,
      elementsCheckedData: surveyState
    };

    onUpdateIntersectionDetails(activeIntersection.id, paramsToUpdate);
    triggerFeedback(`✓ 已成功建檔與儲存 [${activeIntersection.id}] 的全口號誌諸元 43 項設施與保固期履歷！`, 'success');
  };

  // Simulate file drag actions
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Simulate drop action
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle selected file dialog
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // Standard process files helper
  const handleFiles = (files: FileList) => {
    if (!currentUser.permissions.canEditSurveyElements) {
      alert('權限被拒！您目前的登入身分缺乏「普查與填寫43項路口諸元」權限，無法上傳路口設計大圖。');
      return;
    }
    if (!activeIntersection) return;

    const itemsArray = Array.from(files);
    const existing = activeIntersection.uploadedFiles || [];
    
    const freshAttachments = itemsArray.map((file, idx) => ({
      id: `element-file-${Date.now()}-${idx}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      uploadTime: new Date().toISOString().replace('T', ' ').slice(0, 16)
    }));

    const merged = [...existing, ...freshAttachments];
    onUpdateIntersectionDetails(activeIntersection.id, {
      uploadedFiles: merged
    });

    triggerFeedback(`✓ 親，已上傳「${freshAttachments[0]?.name}」至諸元庫！`, 'success');
  };

  // Remove uploaded file
  const handleRemoveFile = (fileId: string) => {
    if (!currentUser.permissions.canEditSurveyElements) {
      alert('權限被拒！您目前的登入身分缺乏「普查與填寫43項路口諸元」權限，無法移除諸元大圖。');
      return;
    }
    if (!activeIntersection) return;
    const existing = activeIntersection.uploadedFiles || [];
    const filtered = existing.filter(f => f.id !== fileId);
    onUpdateIntersectionDetails(activeIntersection.id, {
      uploadedFiles: filtered
    });
    triggerFeedback('檔案已自諸元管理庫移除！', 'info');
  };

  // Supervisor Approval Workflow (canApproveSurvey check)
  const handleApproveSurvey = () => {
    if (!activeIntersection) return;
    if (!currentUser.permissions.canApproveSurvey) {
      alert('權限被拒！您目前的登入身分不具備「審核核定諸元普查成果」主管特權。請切換登入身份，或修訂您所屬角色的核准審查特權。');
      return;
    }
    onUpdateIntersectionDetails(activeIntersection.id, {
      elementsCheckedStatus: 'APPROVED',
      elementsCheckedBy: `${currentUser.name} (${currentUser.roleName})`
    });
    triggerFeedback(`✓ 審核成功！已正式核定簽認 [${activeIntersection.id}] 的諸元盤點普查竣工成果！`, 'success');
  };

  const handleRevokeApproveSurvey = () => {
    if (!activeIntersection) return;
    if (!currentUser.permissions.canApproveSurvey) {
      alert('權限被拒！您目前的登入身分不具備「審核核定諸元普查成果」主管特權。無法變更核准狀態。');
      return;
    }
    onUpdateIntersectionDetails(activeIntersection.id, {
      elementsCheckedStatus: 'PENDING',
      elementsCheckedBy: undefined
    });
    triggerFeedback(`已撤銷 [${activeIntersection.id}] 的諸元核可成果，狀態已退回到「待簽認核定」狀態。`, 'info');
  };

  // Download entire survey element dataset
  const handleDownloadSurveyReport = () => {
    if (!activeIntersection) return;

    let txt_report = `
===================================================================
             花蓮縣智慧號誌管理系統 - 號誌路口諸元建檔履歷
===================================================================
檔案建立：${new Date().toLocaleString()}
管轄代處：花蓮工務處交通科
維運技師：juichun@gcs.ceci.com.tw

【一、路口基本通識與硬體控制盤】
- 路口編號：${activeIntersection.id}
- 路口名稱：${activeIntersection.name}
- 轄區鄉鎮：${activeIntersection.district}
- 號誌控制器廠牌：${brandInput || '大亞號誌工業'}
- 號誌控制器型號：${typeInput || 'MGC-3100'}
- 保固起訖：${warrantyStart || '無數據'} ～ ${warrantyEnd || '無數據'}
- 當前狀態：${activeIntersection.status === 'E_ONLINE' ? '網聯在線 (ONLINE)' : '通訊逾時 (TIMEOUT)'}
- 保固狀態：${warrantyEnd && warrantyEnd < new Date().toISOString().split('T')[0] ? '❌ 已過保固期' : '🟢 在保固期內'}

【二、PDF 表19 號誌設備調查項目盤點數據 (43項)】
-------------------------------------------------------------------
`;

    TABLE_19_ITEMS.forEach(it => {
      const val = surveyState[it.id] !== undefined ? surveyState[it.id] : it.defaultVal;
      const unitStr = it.unit ? ` ${it.unit}` : '';
      txt_report += `項次 ${String(it.index).padStart(2, '0')}. 【${it.name}】 ===> 數值/設定：${val}${unitStr}\n`;
    });

    txt_report += `
-------------------------------------------------------------------
【三、關聯附屬規劃竣工檔案清單 (${activeIntersection.uploadedFiles?.length || 0} 筆)】
`;

    const documents = activeIntersection.uploadedFiles || [];
    if (documents.length > 0) {
      documents.forEach((d, index) => {
        txt_report += `  - 檔案 ${index + 1}: ${d.name} (${d.size}) -- 上傳時間: ${d.uploadTime}\n`;
      });
    } else {
      txt_report += '  - 暫無任何上傳竣工檔案。\n';
    }

    txt_report += `
===================================================================
竣工報備稽查官證：【花蓮市交通運維監核合格證】
    `;

    const blob = new Blob([txt_report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `[路口諸元建檔成果]-${activeIntersection.id}-${activeIntersection.name}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerFeedback('✓ 已下載該路口諸元建檔專用報表', 'success');
  };

  // Pre-loaded seed files for every intersection to demonstrate amazing design completeness
  const defaultAttachedFiles = useMemo(() => {
    if (!activeIntersection) return [];
    return activeIntersection.uploadedFiles || [
      {
        id: 'seed-file-1',
        name: `${activeIntersection.id}-路口號誌地下管線鋪設竣工圖.dwg`,
        size: '11.45 MB',
        uploadTime: '2024-02-15 11:20'
      },
      {
        id: 'seed-file-2',
        name: `${activeIntersection.id}-表19設備調查實地成果盤存表.xlsx`,
        size: '1.24 MB',
        uploadTime: '2024-02-16 14:05'
      }
    ];
  }, [activeIntersection]);

  const currentFilesList = activeIntersection?.uploadedFiles || defaultAttachedFiles;

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden" id="wrapper_elements_management">
      
      {/* Toast Alert feedback block */}
      {feedback && (
        <div className={`fixed top-14 right-6 px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2 border text-xs font-bold transition-all duration-300 animate-fade-in ${
          feedback.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-blue-600 border-blue-500 text-white'
        }`}>
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Main Feature Menu Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
            <Database className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-wide flex items-center gap-2">
              <span>📋 路口設備諸元及保固履歷建檔盤</span>
              <span className="text-[10px] bg-slate-950 font-mono text-emerald-400 font-extrabold px-2 py-0.5 rounded">
                PDF 表 19 核心版
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              提供花蓮 1,150 處路口硬體諸元全面稽核建檔，整合控制器廠保固起訖、CAD平面圖上傳，並產製 43 項設施履歷成果。
            </p>
          </div>
        </div>

        {/* Quick export button */}
        {activeIntersection && (
          <button
            onClick={handleDownloadSurveyReport}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white text-xs font-black rounded-xl shadow-xs transition duration-150 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>匯出本路口諸元報表</span>
          </button>
        )}
      </div>

      {/* Workspace Area Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        
        {/* Left Sidebar Pane: Junction list selection */}
        <div className="w-full lg:w-[280px] xl:w-[320px] bg-white flex flex-col shrink-0 overflow-hidden">
          
          <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2 shrink-0">
            {/* Find Intersection */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="搜尋編號、路名名稱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              />
            </div>

            {/* Area Filter Selector */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">🌐 全部行政區轄</option>
              {districts.filter(d => d !== 'all').map(d => (
                <option key={d} value={d}>📍 {d}</option>
              ))}
            </select>
          </div>

          {/* List Scroll Element */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredIntersections.map(item => {
              const isActive = activeIntersection?.id === item.id;
              const hasElements = item.uploadedFiles && item.uploadedFiles.length > 0;
              const isExpired = item.warranty === 'W_EXPIRED';
              
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectIntersection(item)}
                  className={`p-4 text-left transition duration-150 cursor-pointer relative ${
                    isActive 
                      ? 'bg-emerald-50/40 border-l-4 border-emerald-600 shadow-xs' 
                      : 'bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-[10px] font-black bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                      {item.id}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isExpired ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-105'
                    }`}>
                      {isExpired ? '已過保' : '保固中'}
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-slate-900 leading-normal">
                    {item.name}
                  </h4>
                  
                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{item.district} · {item.controllerType}</span>
                    <span className="text-[9px] bg-slate-50 border border-slate-150 px-1 py-0.2 rounded-md">
                      保固: {item.warrantyStartDate || item.installDate}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredIntersections.length === 0 && (
              <div className="p-8 text-center text-slate-400 py-16">
                <AlertCircle className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                <p className="text-xs font-black">找不到符合的路口</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Workspace Main View */}
        <div className="flex-1 bg-white overflow-y-auto flex flex-col p-6">
          {activeIntersection ? (
            <div className="space-y-6">
              
              {/* Top Banner of Selected Road */}
              <div className="border-b border-slate-200 pb-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-600 text-white font-mono text-[10px] font-black px-2 py-0.5 rounded">
                      {activeIntersection.id}
                    </span>
                    <span className="text-xs text-slate-550 font-bold">
                      {activeIntersection.district} · {activeIntersection.name}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-bold font-mono">
                    時相配置: {activeIntersection.phaseCount} 時相 / 週期: {activeIntersection.cycleTime} 秒
                  </span>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-1">
                  <div>
                    <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
                      <span>號誌設備履歷建檔工作台</span>
                      <span className="text-xs font-normal text-slate-400">(43項諸元成果)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      可在此指定特定的控制器廠牌、型號、保固截止，上傳CAD/Excel竣工大圖，並編輯PDF之表19調查項目盤點表。
                    </p>
                    {(!currentUser.permissions.canEditIntersections || !currentUser.permissions.canEditSurveyElements) && (
                      <div className="bg-amber-50 text-amber-800 border border-amber-200/60 p-2.5 rounded-lg text-[10.5px] font-semibold flex items-center gap-2 mt-2">
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          <strong>唯讀警告模式：</strong>您目前登入身分缺乏部分特權 (
                          {!currentUser.permissions.canEditIntersections && <span className="text-red-650">❌ 基本屬建檔 / </span>}
                          {!currentUser.permissions.canEditSurveyElements && <span className="text-red-650">❌ 諸元表43項編輯</span>}
                          )。變更欄位數據後將會被系統防護機制阻擋而無法存檔。
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleImportSurveyTemplate}
                      className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer transition duration-150"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                      <span>快速帶入預設屬性諸元</span>
                    </button>

                    <button
                      onClick={handleSaveAllElements}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black flex items-center gap-1 shadow-sm cursor-pointer transition duration-150"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-200" />
                      <span>儲存建檔成果</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION A: CONTROLLER WARRANTY & BRAND FORM (控制器廠牌型號保固日期等資料建檔) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-black text-slate-900">控制器及保固期建檔管理</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* brand */}
                  <div>
                    <label className="text-[11px] font-black text-slate-500 block mb-1">號誌控制器廠牌廠商</label>
                    <input
                      type="text"
                      value={brandInput}
                      onChange={(e) => setBrandInput(e.target.value)}
                      placeholder="例如：大亞號誌工業股份有限公司"
                      className="w-full text-xs bg-white border border-slate-250 p-2 rounded-lg focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* controller select */}
                  <div>
                    <label className="text-[11px] font-black text-slate-500 block mb-1">控制機櫃主體型號</label>
                    <select
                      value={typeInput}
                      onChange={(e) => setTypeInput(e.target.value as ControllerType)}
                      className="w-full text-xs bg-white border border-slate-250 p-1.5 rounded-lg focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="MGC-3100">MGC-3100 (智慧號誌)</option>
                      <option value="ITC-2000">ITC-2000 (微電腦式)</option>
                      <option value="TC-800">TC-800 (標準數位式)</option>
                      <option value="NTCIP-90">NTCIP-90 (智慧網通型)</option>
                    </select>
                  </div>

                  {/* warranty start */}
                  <div>
                    <label className="text-[11px] font-black text-slate-500 block mb-1">保固/建置開始日期</label>
                    <div className="relative">
                      <Calendar className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="date"
                        value={warrantyStart}
                        onChange={(e) => setWarrantyStart(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-250 p-2 rounded-lg focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* warranty end */}
                  <div>
                    <label className="text-[11px] font-black text-slate-500 block mb-1">合約保固驗收截止期</label>
                    <div className="relative">
                      <Calendar className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="date"
                        value={warrantyEnd}
                        onChange={(e) => setWarrantyEnd(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-250 p-2 rounded-lg focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* status flag */}
                {warrantyEnd && (
                  <div className="pt-2">
                    {warrantyEnd < new Date().toISOString().split('T')[0] ? (
                      <div className="bg-red-50 text-red-800 border border-red-100 p-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                        <span>系統檢測：當前日期已超越截止保固，該路口狀態標記為【過保固期 (Expired)】。建議指派巡檢或維運開展修護標案。</span>
                      </div>
                    ) : (
                      <div className="bg-emerald-55/70 text-emerald-900 border border-emerald-100 p-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>系統檢測：保固資格有效。本路口於政府合約在保保修涵蓋期限內，非天然損壞之非人為故障享有承包商免費排故退換。</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Supervisor Approval & Sign-Off Section */}
                <div className="bg-white border-2 border-slate-100 p-4 rounded-xl space-y-3 mt-4">
                  <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wide">
                        路口 43 項設施諸元普查核定審查書 (Survey Sign-off)
                      </span>
                    </div>
                    {activeIntersection.elementsCheckedStatus === 'APPROVED' ? (
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9.5px] font-black rounded-full uppercase border border-emerald-250 animate-pulse">
                        ★★★ 已審訖核定 ★★★
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 text-[9.5px] font-extrabold rounded-full uppercase">
                        待審核/待簽認
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="text-[11px] text-slate-500 space-y-1 leading-relaxed">
                      {activeIntersection.elementsCheckedStatus === 'APPROVED' ? (
                        <>
                          <p className="font-bold text-slate-700">
                            審核結果：🟢 審查合格，准予備查竣工。
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            簽署主管：{activeIntersection.elementsCheckedBy || '系統管理員 (Admin)'}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-slate-600">
                            審置狀態：⚠️ 本路口普查項目尚未核定。
                          </p>
                          <p className="text-[10.5px] text-indigo-500 font-medium">
                            主管權限限定！需具備 <strong>「審核核定諸元普查成果」</strong> 特權方能對其落實核准竣工建檔手續。
                          </p>
                        </>
                      )}
                    </div>

                    <div className="shrink-0 flex gap-2">
                      {activeIntersection.elementsCheckedStatus === 'APPROVED' ? (
                        <button
                          onClick={handleRevokeApproveSurvey}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-black cursor-pointer transition"
                        >
                          撤銷核定
                        </button>
                      ) : (
                        <button
                          onClick={handleApproveSurvey}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black flex items-center gap-1 shadow-sm cursor-pointer transition"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>審核合格准予核定</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* SECTION B: UPLOAD FILE MANAGER (上傳檔案的路口諸元資料) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-black text-slate-900">路口諸元檔案/竣工規劃大圖上傳管理庫</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* drag-and-drop zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center flex flex-col items-center justify-center cursor-pointer transition ${
                      dragActive 
                        ? 'border-emerald-500 bg-emerald-50/20' 
                        : 'border-slate-300 bg-slate-50/30 hover:border-emerald-400'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-xs font-black text-slate-700">拖曳或點擊此處上傳路口諸元大圖/試算表</p>
                    <p className="text-[10px] text-slate-400 mt-1">支援 .dwg 竣工圖、.xlsx諸元成果冊、.pdf、.png (最大15MB)</p>
                  </div>

                  {/* uploaded files lists */}
                  <div className="border border-slate-200 rounded-xl bg-white p-4 flex flex-col justify-between">
                    <div>
                      <h5 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>當前儲存之諸元公文附件 ({currentFilesList.length})</span>
                        <span className="text-slate-500 text-[9px] font-mono font-bold bg-slate-100 px-1 py-0.2 rounded">STORAGE: CLOUD</span>
                      </h5>

                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                        {currentFilesList.map(file => (
                          <div 
                            key={file.id} 
                            className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 flex items-center justify-between text-xs font-semibold leading-normal"
                          >
                            <div className="flex items-center gap-2 truncate pr-4">
                              <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                              <div className="truncate">
                                <span className="text-slate-800 font-extrabold truncate block text-[11px]">
                                  {file.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  大小: {file.size} · 時間: {file.uploadTime}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFile(file.id);
                              }}
                              className="text-slate-400 hover:text-red-650 p-1 rounded hover:bg-slate-200 transition shrink-0 cursor-pointer"
                              title="刪除此諸元附件"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {currentFilesList.length === 0 && (
                          <div className="text-center py-8 text-slate-400 text-xs">
                            暫無上傳諸元檔案。可將紙本設備普查表或平面CAD影像存放到此。
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION C: 43 DETAILED SURVEY ITEMS FOR THE PDF TABLE 19 (表19號誌設備調查項目填報) */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-2 gap-3">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-emerald-600" />
                    <div>
                      <h4 className="text-xs font-black text-slate-900">PDF「表 19 號誌設備調查項目」盤點建檔填報系統 (43 項完備屬性)</h4>
                      <p className="text-[11px] text-slate-400">依據招標規範，現場調查路口諸元，逐一登載更新，將成果備份於履歷系统中。</p>
                    </div>
                  </div>

                  {/* 4 Tabs to break 43 items into elegant smaller groups */}
                  <div className="flex bg-slate-100 p-0.5 border border-slate-200 rounded-lg self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setSurveyGroupTab('A')}
                      className={`px-2.5 py-1 text-[11px] font-black rounded-md cursor-pointer transition ${
                        surveyGroupTab === 'A' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      A.行政與一般 (6項)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSurveyGroupTab('B')}
                      className={`px-2.5 py-1 text-[11px] font-black rounded-md cursor-pointer transition ${
                        surveyGroupTab === 'B' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      B.燈箱燈具 (8項)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSurveyGroupTab('C')}
                      className={`px-2.5 py-1 text-[11px] font-black rounded-md cursor-pointer transition ${
                        surveyGroupTab === 'C' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      C.桿件與共桿 (18項)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSurveyGroupTab('D')}
                      className={`px-2.5 py-1 text-[11px] font-black rounded-md cursor-pointer transition ${
                        surveyGroupTab === 'D' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      D.監控及附掛 (11項)
                    </button>
                  </div>
                </div>

                {/* Survey Inputs Grid Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50/55 p-4 rounded-xl border border-slate-150">
                  {groupedItems[surveyGroupTab].map(item => {
                    const currentVal = surveyState[item.id] !== undefined ? surveyState[item.id] : item.defaultVal;
                    
                    return (
                      <div 
                        key={item.id} 
                        className="bg-white p-3 rounded-lg border border-slate-200/90 flex flex-col justify-between space-y-1.5 shadow-2xs hover:border-emerald-300 transition duration-150"
                      >
                        <div className="flex items-start gap-1.5 leading-normal">
                          <span className="font-mono text-[9px] font-black bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded shrink-0">
                            {item.index}
                          </span>
                          <span className="text-[11px] font-black text-slate-700 leading-normal line-clamp-2">
                            {item.name}
                          </span>
                        </div>

                        <div>
                          {item.type === 'select' && item.options ? (
                            <select
                              value={currentVal as string}
                              onChange={(e) => handleSurveyValChange(item.id, e.target.value)}
                              className="w-full text-[11px] bg-slate-50 border border-slate-250 rounded-md p-1.5 focus:ring-1 focus:ring-emerald-500"
                            >
                              {item.options.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                value={currentVal as number}
                                onChange={(e) => handleSurveyValChange(item.id, Number(e.target.value))}
                                className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-250 rounded-md p-1.5 focus:ring-1 focus:ring-emerald-500"
                              />
                              {item.unit && (
                                <span className="text-[11.5px] text-slate-400 shrink-0 font-bold w-6 text-right">
                                  {item.unit}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-amber-50/50 border border-amber-200 p-3 rounded-lg flex items-center gap-2.5 text-[11px] leading-relaxed font-medium">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-amber-850">
                    <strong>提示：</strong>
                    本路口盤點共計有 43 項設施諸元。點選分頁頁籤可迅速切換硬體、桿件結構等。修改完後，請務必點擊頂部<strong>「儲存建檔成果」</strong>按鈕以儲存到系統中央庫中。
                  </span>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 py-32 flex flex-col items-center justify-center space-y-2">
              <Database className="w-12 h-12 text-slate-200" />
              <p className="text-sm font-black">暫無載入的號誌路口資料</p>
              <p className="text-xs text-slate-400">請確認左邊清單是否有項目可選取</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
