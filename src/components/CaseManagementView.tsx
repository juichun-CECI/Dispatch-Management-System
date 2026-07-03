import React, { useState, useMemo, useRef } from 'react';
import { Intersection, DispatchCase, Contract, ContractWorkItem, ConstructionPhoto, RelocationSheet, SystemUser } from '../types';
import { 
  Wrench, 
  PlusCircle, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  User, 
  Info, 
  FileText, 
  Send, 
  Calendar, 
  Search, 
  ShieldAlert, 
  Briefcase, 
  Camera, 
  Upload, 
  Download, 
  FileDown, 
  RefreshCw, 
  ArrowRightLeft, 
  CheckSquare, 
  Square, 
  Sparkles, 
  MapPin, 
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  Edit,
  Check,
  X,
  History,
  Eye
} from 'lucide-react';

interface CaseManagementViewProps {
  intersections: Intersection[];
  contracts?: Contract[];
  selectedIntersection: Intersection | null;
  onUpdateIntersectionCase: (intersectionId: string, newCase: DispatchCase | undefined) => void;
  onSelectIntersection: (intersection: Intersection) => void;
  currentUser: SystemUser;
  onAutoSwitchTab?: (tab: 'home' | 'case' | 'document' | 'history' | 'stats' | 'contract' | 'elements' | 'users') => void;
}

// Preset Hualien open-ended contract work items matching the details schedule and categorized
const PRESET_CONTRACT_WORK_ITEMS: (Omit<ContractWorkItem, 'qty'> & { category: string })[] = [
  // 1. 號誌桿件與支架
  { id: '02893A0003', name: '架空線鍍鋅鋼管號誌桿 (管壁6.0mm)', price: 12350, unit: '組', category: '號誌桿件與支架' },
  { id: '02893A0001', name: '單懸臂鍍鋅鋼管號誌桿 (管壁6.0mm)', price: 18571, unit: '組', category: '號誌桿件與支架' },
  { id: '02893A0002', name: '雙懸臂鍍鋅鋼管號誌桿 (管壁6.0mm)', price: 20429, unit: '組', category: '號誌桿件與支架' },
  { id: '02893A0019', name: '號誌桿基座 (含螺栓、機器挖掘、灌漿)', price: 13557, unit: '座', category: '號誌桿件與支架' },
  { id: '02893A0013', name: '加高支架 (新設或汰換)', price: 2646, unit: '支', category: '號誌桿件與支架' },

  // 2. 號誌燈箱與有聲號誌
  { id: '02893A0028', name: '30cm LED 三燈式鋁合金燈箱 (紅、黃、綠)', price: 15052, unit: '組', category: '號誌燈箱與有聲號誌' },
  { id: '02893A0030', name: '30cm LED 四燈式鋁合金燈箱 (紅、黃、綠、綠箭頭)', price: 19923, unit: '組', category: '號誌燈箱與有聲號誌' },
  { id: '02893A0049', name: '行人號誌燈箱組 (含LED燈及行人動態倒數計時器)', price: 16784, unit: '組', category: '號誌燈箱與有聲號誌' },
  { id: '02893A0052', name: '行人及腳踏車手動觸動語音開關', price: 1059, unit: '組', category: '號誌燈箱與有聲號誌' },
  { id: '0289300001A', name: '有聲號誌微電腦控制器 (含安裝)', price: 55714, unit: '組', category: '號誌燈箱與有聲號誌' },

  // 3. 控制器與電源分界箱
  { id: '02893A0056', name: '微電腦三色號誌控制器 (含外箱組)', price: 83571, unit: '組', category: '控制器與電源分界箱' },
  { id: '02893A0074', name: '不銹鋼電源分界箱 (含漏電斷路開關)', price: 7939, unit: '個', category: '控制器與電源分界箱' },
  { id: '02893A0075', name: '不銹鋼附掛式電源分界箱 (機箱內嵌)', price: 4411, unit: '個', category: '控制器與電源分界箱' },

  // 4. 管線佈設與線材
  { id: '02893A0082', name: '瀝青路面管線挖埋鐵板鋪設 (含CLSM填築)', price: 1795, unit: 'M', category: '管線佈設與線材' },
  { id: '1612300001', name: '戶外防潮充膠型號誌光纜', price: 743, unit: 'M', category: '管線佈設與線材' },
  { id: '02893A0093', name: '7/C 2mm2 PVC 訊號雙絞控制電纜線', price: 88, unit: 'M', category: '管線佈設與線材' },
  { id: '02893A0094', name: '8/C 2mm2 PVC 訊號雙絞控制電纜線', price: 106, unit: 'M', category: '管線佈設與線材' },

  // 5. 智慧路口與感應設備
  { id: '02893A0115', name: '智慧感應微電腦三色號誌控制器 (AI軟體修改)', price: 207071, unit: '組', category: '智慧路口與感應設備' },
  { id: '02893C200051', name: '路口行人高精度影像AI辨識伺服器', price: 246387, unit: '台', category: '智慧路口與感應設備' },
  { id: '13704E0008', name: '路口交通資訊發布 CMS 看板 (128X48CM)', price: 61750, unit: '台', category: '智慧路口與感應設備' },
  { id: '02893C0083a', name: '縮小型智慧聯網號誌控制器 (Edge PC)', price: 113807, unit: '台', category: '智慧路口與感應設備' },
  { id: '137041006A', name: '路口交控閉路電視彩色攝影機 (防塵防水型)', price: 15786, unit: '台', category: '智慧路口與感應設備' },

  // 6. 標誌標線與安全設施
  { id: '02893A0155', name: '豎立式交通警告標誌牌面製作 (△90cm)', price: 2579, unit: '面', category: '標誌標線與安全設施' },
  { id: '02893A0174', name: '2mm 厚高反光熱處理聚酯反光標線', price: 351, unit: 'M2', category: '標誌標線與安全設施' },
  { id: '02893A0191', name: '彈性回復式防撞交通立桿 (直徑11cm)', price: 789, unit: '支', category: '標誌標線與安全設施' },
  { id: '02893A0165', name: '100cm 圓形不鏽鋼防霧式道路反射鏡', price: 4643, unit: '面', category: '標誌標線與安全設施' }
];

export default function CaseManagementView({
  intersections,
  contracts = [],
  selectedIntersection,
  onUpdateIntersectionCase,
  onSelectIntersection,
  currentUser,
  onAutoSwitchTab
}: CaseManagementViewProps) {
  // Navigation tabs of Case view
  const [viewTab, setViewTab] = useState<'tracking' | 'create'>('tracking');
  const [filterArchived, setFilterArchived] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  
  // Selection of active case
  const [selectedCaseId, setSelectedCaseId] = useState<string>('CASE-001');

  // Interactive Create Case Wizard states
  const [newCaseContractId, setNewCaseContractId] = useState<string>(contracts[0]?.id || '');
  const [newCaseIntersectionId, setNewCaseIntersectionId] = useState<string>(selectedIntersection?.id || '');
  const [newCaseReportSource, setNewCaseReportSource] = useState<string>('民眾通報 (1999專線)');
  const [newCaseType, setNewCaseType] = useState<DispatchCase['type']>('號誌故障');
  const [newCasePriority, setNewCasePriority] = useState<DispatchCase['priority']>('普通');
  const [newCaseAssignedTo, setNewCaseAssignedTo] = useState('王小明 (巡檢工務組)');
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCaseDescription, setNewCaseDescription] = useState('');
  const [selectedWorkItemQuantities, setSelectedWorkItemQuantities] = useState<Record<string, number>>({});
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('全部');

  // Interactive Case items edit states for an existing case
  const [isEditingCaseItems, setIsEditingCaseItems] = useState(false);
  const [editCaseItemQuantities, setEditCaseItemQuantities] = useState<Record<string, number>>({});
  const [editCaseCategoryFilter, setEditCaseCategoryFilter] = useState<string>('全部');
  
  // Interactive Case tracking local upload state
  const [uploadingPhase, setUploadingPhase] = useState<'before' | 'during' | 'after' | null>(null);
  const [editPhaseComment, setEditPhaseComment] = useState<{before: string, during: string, after: string}>({
    before: '',
    during: '',
    after: ''
  });

  // Modal State for unique Relocation Sheet
  const [isRelocationModalOpen, setIsRelocationModalOpen] = useState(false);
  const [relocItemName, setRelocItemName] = useState('MGC-3100型 智慧號誌控制器');
  const [relocToJunctionId, setRelocToJunctionId] = useState('');
  const [relocEngineer, setRelocEngineer] = useState('juichun@gcs.ceci.com.tw');
  const [relocDate, setRelocDate] = useState(new Date().toISOString().split('T')[0]);
  const [relocNotes, setRelocNotes] = useState('配合市區智慧幹道整合工程，將原控制器拆移至鄰近路口以擴大車流感應覆蓋面。');
  const [generatedRelocation, setGeneratedRelocation] = useState<RelocationSheet | null>(null);

  // Close Case Interactive Modal states
  const [isCloseCaseModalOpen, setIsCloseCaseModalOpen] = useState(false);
  const [closeCaseId, setCloseCaseId] = useState('');
  const [closeCaseUpdateElements, setCloseCaseUpdateElements] = useState(true);
  const [closeCaseRemark, setCloseCaseRemark] = useState('主管機關審訖驗收合格，案件結案歸檔存查。');

  // Status message alert feedback banner
  const [bannerMsg, setBannerMsg] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Audio effect notification or quick triggers
  const triggerBanner = (text: string, type: 'success' | 'info' = 'success') => {
    setBannerMsg({ text, type });
    setTimeout(() => setBannerMsg(null), 4000);
  };

  // Extract all active dispatch cases across the entire intersections database
  const allCases = useMemo(() => {
    const list: Array<{ intersection: Intersection; case: DispatchCase }> = [];
    intersections.forEach(item => {
      if (item.case) {
        list.push({ intersection: item, case: item.case });
      }
    });
    return list;
  }, [intersections]);

  // Handle auto matching when currentCaseId selected
  const currentCaseDetail = useMemo(() => {
    let matched = allCases.find(c => c.case.id === selectedCaseId);
    if (!matched && allCases.length > 0) {
      // default select first
      matched = allCases[0];
    }
    return matched;
  }, [allCases, selectedCaseId]);

  // Synchronize phase comments when case detail changes
  React.useEffect(() => {
    if (currentCaseDetail?.case) {
      setEditPhaseComment({
        before: currentCaseDetail.case.photos?.before?.comment || '路口號誌故障黑屏，電源不亮通訊中斷。',
        during: currentCaseDetail.case.photos?.during?.comment || '開啟機櫃量測迴路電容值，並替換全新故障控制器板。',
        after: currentCaseDetail.case.photos?.after?.comment || '號誌全相序經重新送電測試，全部恢復正常週期秒數運作。'
      });
      setIsEditingCaseItems(false);
    }
  }, [currentCaseDetail]);

  // Filter cases lists (Archived/Closed vs Active)
  const filteredCases = useMemo(() => {
    return allCases.filter(({ case: ticket, intersection }) => {
      // 1. Search Query checks
      const matchesSearch = 
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intersection.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intersection.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      // 2. Date Range checks
      if (startDateFilter) {
        const reportDate = ticket.reportTime.slice(0, 10); // extracts YYYY-MM-DD
        if (reportDate < startDateFilter) return false;
      }
      if (endDateFilter) {
        const reportDate = ticket.reportTime.slice(0, 10); // extracts YYYY-MM-DD
        if (reportDate > endDateFilter) return false;
      }

      // 3. Archive checks
      if (filterArchived) {
        return ticket.status === '已結案';
      } else {
        return ticket.status !== '已結案';
      }
    });
  }, [allCases, searchQuery, filterArchived, startDateFilter, endDateFilter]);

  // Work items calculator for custom case creation
  const calculatedNewCaseCost = useMemo(() => {
    let sum = 0;
    PRESET_CONTRACT_WORK_ITEMS.forEach(item => {
      const qty = selectedWorkItemQuantities[item.id] || 0;
      sum += item.price * qty;
    });
    return sum;
  }, [selectedWorkItemQuantities]);

  // Work items calculator for custom case items editing
  const calculatedEditCaseCost = useMemo(() => {
    let sum = 0;
    PRESET_CONTRACT_WORK_ITEMS.forEach(item => {
      const qty = editCaseItemQuantities[item.id] || 0;
      sum += item.price * qty;
    });
    return sum;
  }, [editCaseItemQuantities]);

  // Submitting a new structured dispatch ticket
  const handleCreateCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.permissions.canManageCases) {
      alert('權限被拒！您目前的登入身分不具備「派工單維運與結案」權限。');
      return;
    }
    if (!newCaseIntersectionId) {
      alert('請先指定或選擇派工路口！');
      return;
    }

    const targetIntersection = intersections.find(
      i => i.id.trim().toLowerCase() === newCaseIntersectionId.trim().toLowerCase()
    );

    if (!targetIntersection) {
      alert(`系統查無編號為 [${newCaseIntersectionId}] 的號誌路口，請重新輸入！`);
      return;
    }

    // Prepare contract work items selected
    const activeSelectedItems: ContractWorkItem[] = [];
    PRESET_CONTRACT_WORK_ITEMS.forEach(item => {
      const qty = selectedWorkItemQuantities[item.id] || 0;
      if (qty > 0) {
        activeSelectedItems.push({
          ...item,
          qty
        });
      }
    });

    const nextId = `CASE-${targetIntersection.id}-${Math.floor(Math.random() * 900) + 100}`;
    const newCasePrice = calculatedNewCaseCost > 0 ? calculatedNewCaseCost : 45000; // default cost fallback

    const newCase: DispatchCase = {
      id: nextId,
      title: newCaseTitle || `${targetIntersection.id} 路口綜合維護派工`,
      type: newCaseType,
      status: '待派工',
      priority: newCasePriority,
      assignedTo: newCaseAssignedTo,
      reportTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
      deadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 16),
      description: newCaseDescription || '現場設備組件巡邏異常，建立緊急派工排故單。',
      contractId: newCaseContractId,
      caseCost: newCasePrice,
      reportSource: newCaseReportSource,
      selectedContractItems: activeSelectedItems,
      photos: {
        before: {
          url: 'https://images.unsplash.com/photo-1590372648787-df53d537f88a?w=400',
          comment: '現場通報電力疑似跳脫，通訊故障。'
        },
        during: {
          url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
          comment: '拆卸機櫃進行繼電器、控制主板檢修中。'
        },
        after: {
          url: 'https://images.unsplash.com/photo-1494537176455-031cbd02a466?w=400',
          comment: '燈泡與控制模組更新，通訊與相序恢復運轉。'
        }
      },
      logs: [
        {
          time: new Date().toLocaleTimeString('zh-TW', { hour12: false }).slice(0, 5),
          action: `由【${newCaseReportSource}】立案。關聯標案：【${newCaseContractId}】`,
          user: '系統管理員'
        },
        {
          time: new Date().toLocaleTimeString('zh-TW', { hour12: false }).slice(0, 5),
          action: `選定對應合約工項 ${activeSelectedItems.length} 筆，概估核算金額：$${newCasePrice.toLocaleString()}元。`,
          user: '工務調度所'
        }
      ]
    };

    // Update in parent database
    onUpdateIntersectionCase(targetIntersection.id, newCase);
    onSelectIntersection(targetIntersection);
    setSelectedCaseId(nextId);

    // Reset Creation values
    setNewCaseTitle('');
    setNewCaseDescription('');
    setSelectedWorkItemQuantities({});
    
    triggerBanner(`✓ 成功！案件 [${nextId}] 已成功立案關聯標案`, 'success');
    setViewTab('tracking');
  };

  // Status transitions
  const handleUpdateCaseStatus = (caseId: string, status: DispatchCase['status']) => {
    if (!currentUser.permissions.canManageCases) {
      triggerBanner('❌ 權限不足！您目前登入身分缺乏「派工單維運與結案」特權，無法異動狀態。', 'info');
      return;
    }
    const matched = allCases.find(c => c.case.id === caseId);
    if (!matched) return;

    const updatedCase: DispatchCase = {
      ...matched.case,
      status,
      logs: [
        ...matched.case.logs,
        {
          time: new Date().toLocaleTimeString('zh-TW', { hour12: false }).slice(0, 5),
          action: `工程派工狀態更新為：【${status}】`,
          user: '現場工務組'
        }
      ]
    };

    onUpdateIntersectionCase(matched.intersection.id, updatedCase);
    triggerBanner(`工單進度已更動為: ${status}`, 'info');
  };

  // Save localized photo comments back to state
  const handleSavePhotoComment = (phase: 'before' | 'during' | 'after') => {
    if (!currentUser.permissions.canManageCases) {
      triggerBanner('❌ 權限不足！您目前的登入身分缺乏「派工單維運與結案」特權，無法儲存備註。', 'info');
      return;
    }
    if (!currentCaseDetail) return;
    
    const targetCase = currentCaseDetail.case;
    const existingPhotos = targetCase.photos || {};
    const defaultUrls = {
      before: 'https://images.unsplash.com/photo-1590372648787-df53d537f88a?w=400',
      during: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
      after: 'https://images.unsplash.com/photo-1494537176455-031cbd02a466?w=400'
    };

    const updatedCase: DispatchCase = {
      ...targetCase,
      photos: {
        ...existingPhotos,
        [phase]: {
          url: existingPhotos[phase]?.url || defaultUrls[phase],
          comment: editPhaseComment[phase]
        }
      },
      logs: [
        ...targetCase.logs,
        {
          time: new Date().toLocaleTimeString('zh-TW', { hour12: false }).slice(0, 5),
          action: `編輯儲存修復追蹤 [施工${phase === 'before' ? '前' : phase === 'during' ? '中' : '後'}] 階段相片文字說明`,
          user: '工務技師'
        }
      ]
    };

    onUpdateIntersectionCase(currentCaseDetail.intersection.id, updatedCase);
    triggerBanner(`✓ 已儲存施工${phase === 'before' ? '前' : phase === 'during' ? '中' : '後'}照片文字說明!`);
  };

  // Simulated Photo Uploader Natively
  const handleSimulatedPhotoUpload = (phase: 'before' | 'during' | 'after') => {
    if (!currentUser.permissions.canManageCases) {
      triggerBanner('❌ 權限不足！您目前的登入身分缺乏「派工單維運與結案」特權，無法置換施工照片影像。', 'info');
      return;
    }
    if (!currentCaseDetail) return;
    
    setUploadingPhase(phase);
    
    setTimeout(() => {
      const targetCase = currentCaseDetail.case;
      const existingPhotos = targetCase.photos || {};
      
      // Seed random photolog image based on phase to make it super authentic
      let url = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400'; // fallback
      if (phase === 'before') url = 'https://images.unsplash.com/photo-1590372648787-df53d537f88a?w=400';
      if (phase === 'during') url = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400';
      if (phase === 'after') url = 'https://images.unsplash.com/photo-1473842191133-c21179ae258b?w=400';

      const updatedCase: DispatchCase = {
        ...targetCase,
        photos: {
          ...existingPhotos,
          [phase]: {
            ...existingPhotos[phase],
            url,
            comment: existingPhotos[phase]?.comment || '上傳相片影像查驗記錄運作成案'
          }
        },
        logs: [
          ...targetCase.logs,
          {
            time: new Date().toLocaleTimeString('zh-TW', { hour12: false }).slice(0, 5),
            action: `施工${phase === 'before' ? '前' : phase === 'during' ? '中' : '後'}現場照片上傳更新成功`,
            user: '行動查維端 APP'
          }
        ]
      };

      onUpdateIntersectionCase(currentCaseDetail.intersection.id, updatedCase);
      setUploadingPhase(null);
      triggerBanner(`施工${phase === 'before' ? '前' : phase === 'during' ? '中' : '後'}施工照片上傳完成！`);
    }, 1200);
  };

  // Official Equipment Relocation Sheet (設備遷移單) submit
  const handleGenerateRelocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.permissions.canManageCases) {
      alert('權限被拒！您目前的登入身分不具備「派工單維運與結案」權限。無法發起設施遷移單。');
      return;
    }
    if (!currentCaseDetail) return;
    if (!relocToJunctionId) {
      alert('請先選擇目標遷移路口！');
      return;
    }

    const sheet: RelocationSheet = {
      id: `REL-115-${Math.floor(Math.random() * 90000) + 10000}`,
      itemName: relocItemName,
      fromJunction: `${currentCaseDetail.intersection.id} - ${currentCaseDetail.intersection.name}`,
      toJunction: relocToJunctionId,
      engineer: relocEngineer,
      planDate: relocDate,
      notes: relocNotes,
      createdAt: new Date().toLocaleString().slice(0, 16)
    };

    setGeneratedRelocation(sheet);
    
    // Save record to the selected active case
    const updatedCase: DispatchCase = {
      ...currentCaseDetail.case,
      relocationSheet: sheet,
      logs: [
        ...currentCaseDetail.case.logs,
        {
          time: new Date().toLocaleTimeString('zh-TW', { hour12: false }).slice(0, 5),
          action: `核定登記設備遷移單，拆卸項目【${relocItemName}】，移設至【${relocToJunctionId}】`,
          user: '交控設計科'
        }
      ]
    };
    onUpdateIntersectionCase(currentCaseDetail.intersection.id, updatedCase);
    triggerBanner(`✓ 設備遷移單產製登記成功！項目：${relocItemName}`);
  };

  // Download printable report mockup files
  const handleDownloadFile = (docType: 'as-built' | 'pricing' | 'photos') => {
    if (!currentCaseDetail) return;
    const ticket = currentCaseDetail.case;
    const junction = currentCaseDetail.intersection;
    
    let fileName = '';
    let content = '';

    if (docType === 'as-built') {
      fileName = `[竣工圖說]-工單-${ticket.id}-${junction.id}.txt`;
      content = `
========================================
   花蓮縣號誌運維管理平台 - 竣工證明圖說
========================================
派工編號：${ticket.id}
路口編號：${junction.id}
路口區劃：${junction.district}
交岔路口：${junction.name}
座標位置：LON ${junction.lon} / LAT ${junction.lat}

核定控制器機櫃規格：${junction.controllerType}
施工項目主體：${ticket.title}
施工承包商簽核：大亞交通號誌工程股份有限公司
時制週期設定：${junction.cycleTime} 秒 (時相數：${junction.phaseCount} 時相)

========================================
               【竣工配置圖說】
                 (一、平面配置)
       ▲ N (北)      [ 中原路 ]
       │            
───────┼───────  ◀ 號誌面- LED-300mm
       │  (交)  ─── 
───────┼───────
       │  (叉)
       │            
[控制器機櫃 ${junction.controllerType}] -- (四芯地下防干擾配線)

========================================
竣工查檢日：民國115年06月12日
主體試運轉測值結果：合格 (達 NTCIP 反應速率標準)
========================================
      `;
    } else if (docType === 'pricing') {
      fileName = `[計價明細圖說]-工單-${ticket.id}-${junction.id}.txt`;
      
      const itemsText = ticket.selectedContractItems && ticket.selectedContractItems.length > 0
        ? ticket.selectedContractItems.map(item => `  - ${item.name} | 單價: NT$${item.price} / 數量: ${item.qty}${item.unit} | 小計: NT$${item.price * item.qty}`).join('\n')
        : '  - 號誌搶修改良與工務微控制板配線保溫費 | 合約定額: NT$45,000';
      
      content = `
========================================
   花蓮縣政府交通工程標案 估驗計價證明單
========================================
對應標案ID：${ticket.contractId || 'CONTRACT-114-001'}
案件編號：${ticket.id}
施工路口：${junction.id} ${junction.name}
通報來源：${ticket.reportSource || '運維巡檢'}
結算總支金額：NT$ ${(ticket.caseCost || 45000).toLocaleString()} 元

【計價核定工項明細表】：
${itemsText}

----------------------------------------
職安保險與稅務拆解概算：
- 職業安全衛生費用 (比例 2.5％)：NT$ ${((ticket.caseCost || 45000) * 0.025).toFixed(0)}
- 品管品保控制費用 (比例 2.0％)：NT$ ${((ticket.caseCost || 45000) * 0.020).toFixed(0)}
- 包商應得利益利潤 (比例 9.0％)：NT$ ${((ticket.caseCost || 45000) * 0.090).toFixed(0)}
- 營業稅等稅費申購 (比例 5.0％)：NT$ ${((ticket.caseCost || 45000) * 0.05).toFixed(0)}

當次估驗領牌程序：合格 (同意撥付大亞交通號誌工程)
審查官印信：花蓮縣政府工務處交通科
      `;
    } else if (docType === 'photos') {
      fileName = `[施工施工照片圖說]-工單-${ticket.id}-${junction.id}.txt`;
      content = `
========================================
  花蓮縣政府號誌故障檢修 - 施工照片圖說證明
========================================
派工工單：${ticket.id}
路口編號：${junction.id} - ${junction.name}
檢修工程師：${ticket.assignedTo}
通報時間：${ticket.reportTime}
結案核銷估算：NT$ ${(ticket.caseCost || 45000).toLocaleString()} 

----------------------------------------
【第一階段：施工前 (Before Construction)】
[影像位置]：${ticket.photos?.before?.url || '預設現場故障影像庫'}
[技師備註說明]：${editPhaseComment.before}

【第二階段：施工中 (During Construction)】
[影像位置]：${ticket.photos?.during?.url || '預設查修接線與更換影像庫'}
[技師備註說明]：${editPhaseComment.during}

【第三階段：施工後 (After Construction)】
[影像位置]：${ticket.photos?.after?.url || '預設完工亮燈通聯影像庫'}
[技師備註說明]：${editPhaseComment.after}

----------------------------------------
監監承造意見：經本處委任技師現場依 CNS 標準實測核退三次，
全部檢修階段均有影像備核，照片軌跡判定無偽造。
查驗章：【花蓮市交通運維監核合格證】
      `;
    }

    // Dynamic browser downloads helper
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    triggerBanner(`✓ 文件「${fileName}」已被系統自動下載`, 'success');
  };

  // Close Case and Archive into historical registry
  const handleCloseCaseToArchive = (caseId: string) => {
    if (!currentUser.permissions.canManageCases) {
      triggerBanner('❌ 權限被拒！您目前的登入身分不具備「派工單維運與結案」權限，無法執行竣工結案之實質核定。', 'info');
      return;
    }
    const matched = allCases.find(c => c.case.id === caseId);
    if (!matched) return;

    setCloseCaseId(caseId);
    setCloseCaseRemark('◆ 主管機關審訖驗收合格，案件結案歸檔存查 ◆');
    setCloseCaseUpdateElements(true);
    setIsCloseCaseModalOpen(true);
  };

  const handleConfirmCloseCase = () => {
    const matched = allCases.find(c => c.case.id === closeCaseId);
    if (!matched) return;

    const updatedCase: DispatchCase = {
      ...matched.case,
      status: '已結案',
      logs: [
        ...matched.case.logs,
        {
          time: new Date().toLocaleTimeString('zh-TW', { hour12: false }).slice(0, 5),
          action: closeCaseRemark || '◆ 主管機關審訖驗收合格，案件結案歸檔存查 ◆',
          user: currentUser.name || '花蓮縣政府交通科驗收官'
        }
      ]
    };

    onUpdateIntersectionCase(matched.intersection.id, updatedCase);
    setIsCloseCaseModalOpen(false);
    triggerBanner(`🍾 恭喜！案件 ${closeCaseId} 已圓滿竣工結案，歸檔為標案履約記錄。`, 'success');

    // If checked to switch and update elements
    if (closeCaseUpdateElements) {
      if (onSelectIntersection && matched.intersection) {
        onSelectIntersection(matched.intersection);
      }
      if (onAutoSwitchTab) {
        setTimeout(() => {
          onAutoSwitchTab('elements');
        }, 300);
        triggerBanner(`✓ 結案成功！已為您連動載入 [${matched.intersection.name}] 進行路口諸元保固與設施盤點更新。`, 'success');
      }
    }

    // Update selected case ID after delay
    setTimeout(() => {
      setSelectedCaseId('CASE-001');
    }, 450);
  };

  return (
    <div id="wrapper_case_management" className="h-full flex flex-col bg-slate-50 overflow-hidden">
      
      {/* Dynamic Action Alerts Banner */}
      {bannerMsg && (
        <div className={`fixed top-14 right-6 px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2 border text-xs font-bold transition-all duration-300 animate-bounce ${
          bannerMsg.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-blue-600 border-blue-500 text-white'
        }`}>
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{bannerMsg.text}</span>
        </div>
      )}

      {/* Main Feature Menu Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
            <Wrench className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-wide flex items-center gap-2">
              <span>🛠️ 花蓮縣路口號誌派工案件管理</span>
              <span className="text-[10px] bg-slate-950 font-mono text-amber-400 font-extrabold px-2 py-0.5 rounded">
                PRO-V1.2
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              提供智慧交控號誌立案流程、施工三階段照片與技師備忘編輯、產製設備遷移單，並支援竣工與估驗文書自動下載。
            </p>
          </div>
        </div>

        {/* Tab Controls to switch with User focused state */}
        <div className="flex p-0.5 bg-slate-100 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setViewTab('tracking')}
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewTab === 'tracking' 
                ? 'bg-white text-slate-950 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>派工案件追蹤記錄</span>
          </button>
          
          <button
            onClick={() => {
              setViewTab('create');
              if (selectedIntersection) {
                setNewCaseIntersectionId(selectedIntersection.id);
              }
            }}
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewTab === 'create' 
                ? 'bg-white text-slate-950 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>新派工案件成立</span>
          </button>
        </div>
      </div>

      {viewTab === 'tracking' ? (
        /* =================== Tab 1: CASE TRACKING VIEW =================== */
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          
          {/* Left Case list container */}
          <div className="w-full lg:w-[350px] bg-white flex flex-col shrink-0 overflow-hidden">
            
            <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2 shrink-0">
              {/* Search & Toggle Filters */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜尋工程代號、路口、技師..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Date Filters (起訖時間篩選) */}
              <div className="bg-white border border-slate-200 rounded-lg p-2 space-y-1.5 shadow-3xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-500 flex items-center gap-1 leading-none">
                    <Calendar className="w-3 h-3 text-indigo-500" />
                    <span>派工起訖日篩選</span>
                  </span>
                  {(startDateFilter || endDateFilter) && (
                    <button
                      type="button"
                      onClick={() => {
                        setStartDateFilter('');
                        setEndDateFilter('');
                      }}
                      className="text-[9px] font-bold text-rose-600 hover:text-rose-850 flex items-center gap-0.5 cursor-pointer bg-rose-50 px-1.5 py-0.5 rounded transition"
                      title="清除日期篩選"
                    >
                      <X className="w-2.5 h-2.5" />
                      <span>清除</span>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-bold text-slate-400 block select-none">起始日期 (From)</span>
                    <input
                      type="date"
                      value={startDateFilter}
                      onChange={(e) => setStartDateFilter(e.target.value)}
                      className="w-full text-[10px] font-extrabold py-1 px-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-700"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-bold text-slate-400 block select-none">截止日期 (To)</span>
                    <input
                      type="date"
                      value={endDateFilter}
                      onChange={(e) => setEndDateFilter(e.target.value)}
                      className="w-full text-[10px] font-extrabold py-1 px-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Status active/archive filter toggle */}
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setFilterArchived(false)}
                  className={`flex-1 py-1 px-2.5 rounded-md text-[10px] font-bold text-center border transition ${
                    !filterArchived 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  進行中派工 ({allCases.filter(c => c.case.status !== '已結案').length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterArchived(true)}
                  className={`flex-1 py-1 px-2.5 rounded-md text-[10px] font-bold text-center border transition ${
                    filterArchived 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  已驗收結案 ({allCases.filter(c => c.case.status === '已結案').length})
                </button>
              </div>
            </div>

            {/* Cases records scroll list */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredCases.length > 0 ? (
                filteredCases.map(({ intersection, case: ticket }) => {
                  const isSelected = selectedCaseId === ticket.id;
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => {
                        setSelectedCaseId(ticket.id);
                        onSelectIntersection(intersection);
                      }}
                      className={`p-4 text-left transition duration-150 cursor-pointer relative font-sans ${
                        isSelected 
                          ? 'bg-blue-50/40 border-l-4 border-blue-600 shadow-xs' 
                          : 'bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-mono text-[9px] font-black bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                          {ticket.id}
                        </span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                          ticket.status === '待派工' ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' :
                          ticket.status === '處理中' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                          ticket.status === '已完工' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-extrabold text-slate-900 leading-normal line-clamp-1">
                        {ticket.title}
                      </h4>
                      <p className="text-[10px] font-semibold text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>{intersection.district} · {intersection.name}</span>
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span>技師：{ticket.assignedTo}</span>
                        {ticket.caseCost !== undefined && (
                          <span className="font-mono font-bold text-slate-700">
                            ${ticket.caseCost.toLocaleString()}元
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-400 py-24 flex flex-col items-center justify-center space-y-1 bg-slate-50/40">
                  <ShieldAlert className="w-8 h-8 text-slate-200 mb-1" />
                  <p className="text-xs font-medium text-slate-500">找不到相符的派工工單資料</p>
                  <p className="text-[10px] text-slate-400">可切換狀態頁籤或輸入新關鍵字</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Case Detailed Workstation */}
          <div className="flex-1 bg-white overflow-y-auto flex flex-col p-6">
            {currentCaseDetail ? (
              <div className="space-y-6">
                
                {/* Dashboard Detail Title block */}
                <div className="border-b border-slate-200 pb-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-900 text-white font-mono text-[10px] font-black px-2 py-0.5 rounded">
                        {currentCaseDetail.intersection.id}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        {currentCaseDetail.intersection.district} · {currentCaseDetail.intersection.name} 路口
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400">工單編號:</span>
                      <span className="font-mono bg-slate-100 text-slate-800 font-black px-2 py-0.5 rounded text-[10px] border border-slate-200">
                        {currentCaseDetail.case.id}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-2">
                    <div>
                      <h3 className="text-base font-black text-slate-900 leading-tight">
                        {currentCaseDetail.case.title}
                      </h3>
                      {currentCaseDetail.case.reportSource && (
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">
                          通報來源：<span className="text-slate-800 font-bold bg-amber-100 px-1.5 py-0.5 rounded-md text-[10px]">{currentCaseDetail.case.reportSource}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {currentCaseDetail.case.status !== '已結案' && (
                        <button
                          onClick={() => handleCloseCaseToArchive(currentCaseDetail.case.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-300" />
                          <span>審驗合格 (結案歸檔)</span>
                        </button>
                      )}

                      <button
                        id="btn_intersection_elements_mgmt"
                        onClick={() => {
                          if (onSelectIntersection && currentCaseDetail.intersection) {
                            onSelectIntersection(currentCaseDetail.intersection);
                          }
                          if (onAutoSwitchTab) {
                            onAutoSwitchTab('elements');
                          }
                        }}
                        className="bg-indigo-50 hover:bg-indigo-150 text-indigo-700 border border-indigo-200 px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-3xs"
                      >
                        <Wrench className="w-3.5 h-3.5 text-indigo-500" />
                        <span>路口諸元管理</span>
                      </button>

                      <button
                        onClick={() => setIsRelocationModalOpen(true)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-350 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
                        <span>設備遷移單</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grid metadata indicators */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 border border-slate-250 p-3 rounded-xl leading-normal">
                    <span className="text-slate-400 text-[10px] font-black uppercase block mb-0.5">工單案別</span>
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      {currentCaseDetail.case.type}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-250 p-3 rounded-xl leading-normal">
                    <span className="text-slate-400 text-[10px] font-black uppercase block mb-0.5">責任派遣技師</span>
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      {currentCaseDetail.case.assignedTo}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-250 p-3 rounded-xl leading-normal">
                    <span className="text-slate-400 text-[10px] font-black uppercase block mb-0.5">簽約計價估算</span>
                    <span className="text-xs font-mono font-black text-slate-900">
                      ${(currentCaseDetail.case.caseCost || 45000).toLocaleString()} 元
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-250 p-3 rounded-xl leading-normal">
                    <span className="text-slate-400 text-[10px] font-black uppercase block mb-0.5">派工執行狀態</span>
                    <span className={`text-xs font-black inline-flex items-center gap-1 ${
                      currentCaseDetail.case.status === '待派工' ? 'text-red-600 font-bold' :
                      currentCaseDetail.case.status === '處理中' ? 'text-orange-600' :
                      currentCaseDetail.case.status === '已完工' ? 'text-emerald-600' : 'text-slate-550'
                    }`}>
                      <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                      {currentCaseDetail.case.status}
                    </span>
                  </div>
                </div>

                {/* Sub Contract Description Info / Editable Selector */}
                {currentCaseDetail.case.contractId && (
                  <div className="bg-amber-50/45 p-3.5 rounded-xl border border-amber-200/70 space-y-2.5 text-xs font-semibold">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-amber-600" />
                        <div>
                          <span className="text-[10px] text-amber-805 font-bold tracking-wider uppercase block">已連結合約專案案碼</span>
                          <span className="text-slate-900 leading-normal font-black block">
                            {contracts.find(c => c.id === currentCaseDetail.case.contractId)?.name || currentCaseDetail.case.contractId}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] font-black bg-white border border-amber-300 text-amber-800 px-2 py-0.5 rounded whitespace-nowrap">
                        {currentCaseDetail.case.contractId}
                      </span>
                    </div>

                    {currentCaseDetail.case.status !== '已結案' && (
                      <div className="bg-white border border-amber-100 rounded-lg p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <label htmlFor="reassign_contract_select" className="text-[10px] font-black text-amber-900 whitespace-nowrap">變更合約關聯：</label>
                          <select
                            id="reassign_contract_select"
                            value={currentCaseDetail.case.contractId}
                            onChange={(e) => {
                              const newContractId = e.target.value;
                              if (!newContractId) return;

                              const targetCase = currentCaseDetail.case;
                              const updatedCase = {
                                ...targetCase,
                                contractId: newContractId,
                                logs: [
                                  ...(targetCase.logs || []),
                                  {
                                    time: new Date().toLocaleTimeString('zh-TW', { hour12: false }).slice(0, 5),
                                    action: `調整工單合約關聯：【${targetCase.contractId}】變更為【${newContractId}】`,
                                    user: currentUser.name || '系統核心'
                                  }
                                ]
                              };
                              onUpdateIntersectionCase(currentCaseDetail.intersection.id, updatedCase);
                              triggerBanner(`✓ 已成功將工單所屬標案變更為: ${newContractId}`);
                            }}
                            className="bg-slate-50 border border-slate-200 text-slate-800 text-[11px] rounded-md px-2 py-1 focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold w-full truncate cursor-pointer"
                          >
                            {contracts.map(c => (
                              <option key={c.id} value={c.id}>
                                [{c.id}] {c.name} (餘額: ${(c.totalAmount - c.settledAmount).toLocaleString()}元)
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Detailed descriptions */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 leading-relaxed">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">通報問題說明</h4>
                  <p className="text-xs text-slate-705 whitespace-pre-wrap font-medium">
                    {currentCaseDetail.case.description}
                  </p>
                </div>

                {/* 施工工項明細 Table (Consistent with Contract Details) */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 select-none">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>核定施工工項明細 (Contract Construction Items)</span>
                    </h4>
                    {currentCaseDetail.case.status !== '已結案' && (
                      <div className="flex gap-1.5 self-end">
                        {!isEditingCaseItems ? (
                          <button
                            id="btn_edit_case_items"
                            type="button"
                            onClick={() => {
                              const initialQuantities: Record<string, number> = {};
                              if (currentCaseDetail.case.selectedContractItems) {
                                currentCaseDetail.case.selectedContractItems.forEach(item => {
                                  initialQuantities[item.id] = item.qty;
                                });
                              }
                              setEditCaseItemQuantities(initialQuantities);
                              setEditCaseCategoryFilter('全部');
                              setIsEditingCaseItems(true);
                            }}
                            className="text-[10px] font-black tracking-wide text-indigo-650 hover:bg-slate-50 border border-slate-200 bg-white shadow-3xs hover:text-indigo-805 transition px-2.5 py-1 rounded-md cursor-pointer flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3 text-indigo-505" />
                            <span>變更項目與數量設定</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              id="btn_save_case_items"
                              type="button"
                              onClick={() => {
                                if (!currentUser.permissions.canManageCases) {
                                  triggerBanner('❌ 權限不足！您目前的登入身分缺乏「派工單維運與結案」特權，無法異動工項。', 'info');
                                  return;
                                }
                                const updatedSelectedItems: ContractWorkItem[] = [];
                                PRESET_CONTRACT_WORK_ITEMS.forEach(it => {
                                  const qty = editCaseItemQuantities[it.id] || 0;
                                  if (qty > 0) {
                                    updatedSelectedItems.push({
                                      ...it,
                                      qty
                                    });
                                  }
                                });

                                const newCasePrice = updatedSelectedItems.reduce((acc, current) => acc + (current.price * current.qty), 0);
                                const updatedCase: DispatchCase = {
                                  ...currentCaseDetail.case,
                                  selectedContractItems: updatedSelectedItems,
                                  caseCost: newCasePrice,
                                  logs: [
                                    ...(currentCaseDetail.case.logs || []),
                                    {
                                      time: new Date().toLocaleTimeString('zh-TW', { hour12: false }).slice(0, 5),
                                      action: `異動派工項目與施工數量設定：異動後工項數 ${updatedSelectedItems.length} 筆，概估核算金額重算為 $${newCasePrice.toLocaleString()}元。`,
                                      user: currentUser.name || '現場工務組'
                                    }
                                  ]
                                };
                                onUpdateIntersectionCase(currentCaseDetail.intersection.id, updatedCase);
                                setIsEditingCaseItems(false);
                                triggerBanner('✓ 成功！此案件之工項明細及估驗數量已異動完成並重算金額。', 'success');
                              }}
                              className="text-[10px] font-black tracking-wide bg-indigo-650 hover:bg-indigo-700 text-white shadow-3xs transition px-2.5 py-1 rounded-md cursor-pointer flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>儲存工項變更</span>
                            </button>
                            <button
                              id="btn_cancel_case_items"
                              type="button"
                              onClick={() => {
                                setIsEditingCaseItems(false);
                              }}
                              className="text-[10px] font-black tracking-wide text-slate-550 hover:bg-slate-50 border border-slate-200 bg-white shadow-3xs transition px-2 py-1 rounded-md cursor-pointer flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              <span>取消</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {isEditingCaseItems ? (
                    // EDITING MODE PREVIEW
                    <div className="space-y-3">
                      <div className="p-3.5 bg-indigo-50/45 rounded-xl border border-indigo-100/90 text-[11px] leading-relaxed text-indigo-950">
                        <span className="font-extrabold text-indigo-900 block mb-0.5">※ 派工項目及數量變更設定中</span>
                        本功能在案件完工前，皆能讓調度工程師隨時配合現場開挖、耗材回流情形，直接抽換、加掛合約定額計價工項，並進行細部數量異動。
                        <div className="mt-1 font-bold flex items-center gap-1 text-slate-650">
                          <span>即時試算總合價：</span>
                          <span className="text-xs font-black text-indigo-700 font-mono">NT$ {calculatedEditCaseCost.toLocaleString()} 元</span>
                        </div>
                      </div>

                      {/* Filter category bar for editing */}
                      <div className="flex flex-wrap gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                        {['全部', '號誌桿件與支架', '號誌燈箱與有聲號誌', '控制器與電源分界箱', '管線佈設與線材', '智慧路口與感應設備', '標誌標線與安全設施'].map((cat) => {
                          const countInEditCat = PRESET_CONTRACT_WORK_ITEMS.filter(item => {
                            if (cat !== '全部' && item.category !== cat) return false;
                            return (editCaseItemQuantities[item.id] || 0) > 0;
                          }).length;

                          const isActive = editCaseCategoryFilter === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setEditCaseCategoryFilter(cat)}
                              className={`px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-bold transition-all duration-150 cursor-pointer flex items-center gap-1 ${
                                isActive
                                  ? 'bg-indigo-600 text-white shadow-xs font-black'
                                  : 'bg-white text-slate-650 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'
                              }`}
                            >
                              <span>{cat}</span>
                              {countInEditCat > 0 && (
                                <span className={`text-[9px] px-1.5 rounded-full flex items-center justify-center font-black ${isActive ? 'bg-indigo-805 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                                  {countInEditCat}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
                        <table className="w-full text-left text-xs leading-normal">
                          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-205 text-[10px] select-none">
                            <tr>
                              <th className="p-2.5 pl-4 w-28">工項編碼</th>
                              {editCaseCategoryFilter === '全部' && <th className="p-2.5 w-32">群組分類</th>}
                              <th className="p-2.5">契約核定工項名稱</th>
                              <th className="p-2.5 text-right w-24">單價 (元)</th>
                              <th className="p-2.5 text-center w-20">單位</th>
                              <th className="p-2.5 text-right w-32 pr-4">施工數量</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {PRESET_CONTRACT_WORK_ITEMS.filter(item => editCaseCategoryFilter === '全部' || item.category === editCaseCategoryFilter).map(item => {
                              const qty = editCaseItemQuantities[item.id] || 0;
                              const isChosen = qty > 0;

                              return (
                                <tr key={item.id} className={`${isChosen ? 'bg-indigo-50/20' : 'bg-white hover:bg-slate-55/30'} transition-colors duration-150`}>
                                  <td className="p-2.5 pl-4 font-mono font-bold text-[10px] text-slate-450">
                                    {item.id}
                                  </td>
                                  {editCaseCategoryFilter === '全部' && (
                                    <td className="p-2.5 select-none">
                                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold border ${
                                        item.category === '號誌桿件與支架' ? 'bg-blue-50 border-blue-150 text-blue-700' :
                                        item.category === '號誌燈箱與有聲號誌' ? 'bg-indigo-50 border-indigo-150 text-indigo-705' :
                                        item.category === '控制器與電源分界箱' ? 'bg-amber-50 border-amber-150 text-amber-700' :
                                        item.category === '管線佈設與線材' ? 'bg-emerald-50 border-emerald-150 text-emerald-705' :
                                        item.category === '智慧路口與感應設備' ? 'bg-violet-50 border-violet-150 text-violet-700' :
                                        'bg-rose-50 border-rose-150 text-rose-700'
                                      }`}>
                                        {item.category?.slice(0, 4)}
                                      </span>
                                    </td>
                                  )}
                                  <td className="p-2.5 font-bold text-slate-800">
                                    {item.name}
                                  </td>
                                  <td className="p-2.5 text-right font-mono font-medium text-slate-500">
                                    ${item.price.toLocaleString()}
                                  </td>
                                  <td className="p-2.5 text-center text-slate-400 font-bold select-none">
                                    {item.unit}
                                  </td>
                                  <td className="p-2.5 text-right pr-4">
                                    <div className="inline-flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditCaseItemQuantities(prev => ({
                                            ...prev,
                                            [item.id]: Math.max((prev[item.id] || 0) - 1, 0)
                                          }));
                                        }}
                                        className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition rounded flex items-center justify-center font-bold text-xs select-none cursor-pointer"
                                      >
                                        -
                                      </button>
                                      <input
                                        type="number"
                                        min="0"
                                        value={qty || ''}
                                        onChange={(e) => {
                                          const val = Math.max(parseInt(e.target.value) || 0, 0);
                                          setEditCaseItemQuantities(prev => ({
                                            ...prev,
                                            [item.id]: val
                                          }));
                                        }}
                                        className="w-12 p-1 border border-slate-250 rounded text-center text-xs font-mono font-bold bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditCaseItemQuantities(prev => ({
                                            ...prev,
                                            [item.id]: (prev[item.id] || 0) + 1
                                          }));
                                        }}
                                        className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition rounded flex items-center justify-center font-bold text-xs select-none cursor-pointer"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Bottom action bar when editing to submit or cancel */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 select-none">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 font-medium">
                            已變更選用工項: <strong className="font-mono text-indigo-700 text-xs font-black bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{Object.keys(editCaseItemQuantities).filter(k => (editCaseItemQuantities[k] || 0) > 0).length}</strong> 項
                          </span>
                          <span className="text-[11px] text-slate-450">|</span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            即時結算總額: <strong className="font-mono text-emerald-600 font-extrabold text-xs">${calculatedEditCaseCost.toLocaleString()}</strong> 元
                          </span>
                        </div>
                        <div className="flex items-center gap-2 self-end">
                          <button
                            id="btn_cancel_case_items_bottom"
                            type="button"
                            onClick={() => {
                              setIsEditingCaseItems(false);
                            }}
                            className="px-3.5 py-2 bg-white text-slate-650 font-bold border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-lg text-xs transition cursor-pointer shadow-3xs flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5 text-slate-400" />
                            <span>取消變更</span>
                          </button>
                          <button
                            id="btn_save_case_items_bottom"
                            type="button"
                            onClick={() => {
                              if (!currentUser.permissions.canManageCases) {
                                triggerBanner('❌ 權限不足！您目前的登入身分缺乏「派工單維運與結案」特權，無法異動工項。', 'info');
                                return;
                              }
                              const updatedSelectedItems: ContractWorkItem[] = [];
                              PRESET_CONTRACT_WORK_ITEMS.forEach(it => {
                                const qty = editCaseItemQuantities[it.id] || 0;
                                if (qty > 0) {
                                  updatedSelectedItems.push({
                                    ...it,
                                    qty
                                  });
                                }
                              });

                              const newCasePrice = updatedSelectedItems.reduce((acc, current) => acc + (current.price * current.qty), 0);
                              const updatedCase: DispatchCase = {
                                ...currentCaseDetail.case,
                                selectedContractItems: updatedSelectedItems,
                                caseCost: newCasePrice,
                                logs: [
                                  ...(currentCaseDetail.case.logs || []),
                                  {
                                    time: new Date().toLocaleTimeString('zh-TW', { hour12: false }).slice(0, 5),
                                    action: `完成工項異動與派遣數量設定：調整後共計 ${updatedSelectedItems.length} 項，即時合約結估價重算為 $${newCasePrice.toLocaleString()}元。`,
                                    user: currentUser.name || '現場工務組'
                                  }
                                ]
                              };
                              onUpdateIntersectionCase(currentCaseDetail.intersection.id, updatedCase);
                              setIsEditingCaseItems(false);
                              triggerBanner('✓ 成功！此案件之工項選定與估估數量已變更完成並重新計價。', 'success');
                            }}
                            className="px-5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-black rounded-lg text-xs transition cursor-pointer shadow-sm flex items-center gap-1.5 active:scale-95"
                          >
                            <Check className="w-4 h-4 text-indigo-200" />
                            <span>變更完成</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // VIEWING MODE
                    currentCaseDetail.case.selectedContractItems && currentCaseDetail.case.selectedContractItems.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px] leading-normal border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-150 text-[10px] select-none uppercase">
                              <th className="p-2 sm:pl-3">工項編碼</th>
                              <th className="p-2">核定工項名稱</th>
                              <th className="p-2 text-right">核定單價</th>
                              <th className="p-2 text-center">單位</th>
                              <th className="p-2 text-right">派遣數量</th>
                              <th className="p-2 text-right sm:pr-3">小計</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono text-slate-705">
                            {currentCaseDetail.case.selectedContractItems.map(item => (
                              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-2 sm:pl-3 font-semibold text-slate-400 text-[10px]">{item.id}</td>
                                <td className="p-2 font-bold font-sans text-slate-800">{item.name}</td>
                                <td className="p-2 text-right text-slate-500">${item.price.toLocaleString()}</td>
                                <td className="p-2 text-center text-slate-400 font-sans">{item.unit}</td>
                                <td className="p-2 text-right font-black text-slate-900">{item.qty}</td>
                                <td className="p-2 text-right sm:pr-3 font-black text-emerald-605">${(item.price * item.qty).toLocaleString()}</td>
                              </tr>
                            ))}
                            <tr className="bg-slate-50/75 font-bold text-slate-900 border-t border-slate-200">
                              <td className="p-2 sm:pl-3" colSpan="4">
                                <span className="font-sans text-[11px] font-black text-slate-700">Σ 施工計價概算小計：</span>
                              </td>
                              <td className="p-2 text-right font-mono font-black" colSpan="2">
                                <span className="text-xs font-black text-indigo-600 font-mono">${(currentCaseDetail.case.selectedContractItems.reduce((acc, current) => acc + (current.price * current.qty), 0)).toLocaleString()} 元</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-5 text-center text-xs text-slate-450 border border-dashed border-slate-200 rounded-lg bg-slate-50 select-none">
                        <FileSpreadsheet className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                        <span>本案件目前暫無核定工項明細。您可以點擊右上角「變更項目與數量設定」自行選擇與編輯。</span>
                      </div>
                    )
                  )}
                </div>



                {/* Photo slots for Before, During, and After (施工照片編輯上傳) */}
                <div className="border-t border-slate-200/80 pt-5 space-y-4">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1">
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <span>派工流程實證照片軌跡與技師報告 (施工前 · 施工中 · 施工後)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                      請撰寫並編輯各流程階段的修護回報說明，您可以上傳現場實境故障與修護照作為撥款計價公文必備資料。
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Phase A: Before */}
                    <div className="border border-slate-200 p-3.5 rounded-xl bg-slate-50/50 flex flex-col justify-between space-y-3 shadow-xs">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-rose-50 text-rose-800 border border-rose-100 rounded-md px-2 py-1 select-none">
                          <span className="text-[10px] font-black">【階段一：施工前】</span>
                          <span className="text-[9px] font-mono font-bold">BEFORE</span>
                        </div>
                        
                        <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-200 relative border border-slate-250 group">
                          {currentCaseDetail.case.photos?.before?.url ? (
                            <img 
                              src={currentCaseDetail.case.photos.before.url} 
                              alt="Before" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                              <Camera className="w-6 h-6 text-slate-350 mb-1" />
                              <span className="text-[9px] font-bold">無照片存檔</span>
                            </div>
                          )}

                          {uploadingPhase === 'before' && (
                            <div className="absolute inset-0 bg-slate-950/70 text-white flex items-center justify-center text-[10px] font-bold">
                              <RefreshCw className="w-4 h-4 animate-spin text-amber-400 mr-1.5" />
                              上傳中...
                            </div>
                          )}
                        </div>

                        <textarea
                          rows={3}
                          value={editPhaseComment.before}
                          onChange={(e) => setEditPhaseComment(prev => ({ ...prev, before: e.target.value }))}
                          placeholder="請輸入施工前發現的問題、機箱或燈泡黑屏現狀描述..."
                          className="w-full bg-white border border-slate-250 rounded-lg p-2 text-[11px] leading-relaxed focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSimulatedPhotoUpload('before')}
                          className="flex-1 py-1 px-1.5 border border-slate-300 text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-100 rounded flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Upload className="w-3 h-3 text-emerald-600" />
                          <span>上傳照片</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSavePhotoComment('before')}
                          className="py-1 px-2.5 bg-slate-900 hover:bg-slate-950 text-white text-[10px] font-black rounded cursor-pointer"
                        >
                          儲存備註
                        </button>
                      </div>
                    </div>

                    {/* Phase B: During */}
                    <div className="border border-slate-200 p-3.5 rounded-xl bg-slate-50/50 flex flex-col justify-between space-y-3 shadow-xs">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-orange-50 text-orange-850 border border-orange-100 rounded-md px-2 py-1 select-none">
                          <span className="text-[10px] font-black">【階段二：施工中】</span>
                          <span className="text-[9px] font-mono font-bold">DURING</span>
                        </div>
                        
                        <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-200 relative border border-slate-250 group">
                          {currentCaseDetail.case.photos?.during?.url ? (
                            <img 
                              src={currentCaseDetail.case.photos.during.url} 
                              alt="During" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                              <Camera className="w-6 h-6 text-slate-350 mb-1" />
                              <span className="text-[9px] font-bold">無照片存檔</span>
                            </div>
                          )}

                          {uploadingPhase === 'during' && (
                            <div className="absolute inset-0 bg-slate-950/70 text-white flex items-center justify-center text-[10px] font-bold">
                              <RefreshCw className="w-4 h-4 animate-spin text-amber-400 mr-1.5" />
                              上傳中...
                            </div>
                          )}
                        </div>

                        <textarea
                          rows={3}
                          value={editPhaseComment.during}
                          onChange={(e) => setEditPhaseComment(prev => ({ ...prev, during: e.target.value }))}
                          placeholder="請寫明查修配線程序、更換之零配件名、量測數值報告紀錄..."
                          className="w-full bg-white border border-slate-250 rounded-lg p-2 text-[11px] leading-relaxed focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSimulatedPhotoUpload('during')}
                          className="flex-1 py-1 px-1.5 border border-slate-300 text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-100 rounded flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Upload className="w-3 h-3 text-emerald-600" />
                          <span>上傳照片</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSavePhotoComment('during')}
                          className="py-1 px-2.5 bg-slate-900 hover:bg-slate-950 text-white text-[10px] font-black rounded cursor-pointer"
                        >
                          儲存備註
                        </button>
                      </div>
                    </div>

                    {/* Phase C: After */}
                    <div className="border border-slate-200 p-3.5 rounded-xl bg-slate-50/50 flex flex-col justify-between space-y-3 shadow-xs">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-emerald-50 text-emerald-850 border border-emerald-100 rounded-md px-2 py-1 select-none">
                          <span className="text-[10px] font-black">【階段三：施工後】</span>
                          <span className="text-[9px] font-mono font-bold">AFTER</span>
                        </div>
                        
                        <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-200 relative border border-slate-250 group">
                          {currentCaseDetail.case.photos?.after?.url ? (
                            <img 
                              src={currentCaseDetail.case.photos.after.url} 
                              alt="After" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                              <Camera className="w-6 h-6 text-slate-350 mb-1" />
                              <span className="text-[9px] font-bold">無照片存檔</span>
                            </div>
                          )}

                          {uploadingPhase === 'after' && (
                            <div className="absolute inset-0 bg-slate-950/70 text-white flex items-center justify-center text-[10px] font-bold">
                              <RefreshCw className="w-4 h-4 animate-spin text-amber-400 mr-1.5" />
                              上傳中...
                            </div>
                          )}
                        </div>

                        <textarea
                          rows={3}
                          value={editPhaseComment.after}
                          onChange={(e) => setEditPhaseComment(prev => ({ ...prev, after: e.target.value }))}
                          placeholder="請說明通訊回連遙修中心是否順暢、號誌亮燈是否全部功能恢復正常..."
                          className="w-full bg-white border border-slate-250 rounded-lg p-2 text-[11px] leading-relaxed focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSimulatedPhotoUpload('after')}
                          className="flex-1 py-1 px-1.5 border border-slate-300 text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-100 rounded flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Upload className="w-3 h-3 text-emerald-600" />
                          <span>上傳照片</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSavePhotoComment('after')}
                          className="py-1 px-2.5 bg-slate-900 hover:bg-slate-950 text-white text-[10px] font-black rounded cursor-pointer"
                        >
                          儲存備註
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Report file download zone (竣工、計價、及照片圖說等3份文件能進行自動下載) */}
                <div className="border-t border-slate-200/80 pt-5 space-y-4">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <FileDown className="w-4 h-4 text-blue-600 animate-pulse" />
                      <span>案內估估與竣工核銷文書製表大廳 (Reports Download Deck)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                      本案施工完成或計價時，可在此一鍵產製契合花蓮市府及委託查核用CNS認證文書。檔案將直接下載至本機電腦。
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                    {/* Doc A */}
                    <button
                      onClick={() => handleDownloadFile('as-built')}
                      className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl transition flex flex-col justify-between space-y-3 shadow-xs font-sans text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 group-hover:bg-blue-600 group-hover:text-white transition flex items-center justify-center text-blue-600">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-black text-slate-900 block text-xs">① 竣工圖說檔案</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">As-built Drawings PDF</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 w-full pt-1">
                        <span>副檔名: .txt / dwg</span>
                        <span className="text-blue-600 group-hover:underline flex items-center gap-0.5 font-bold">
                          聯動下載
                          <Download className="w-3 h-3" />
                        </span>
                      </div>
                    </button>

                    {/* Doc B */}
                    <button
                      onClick={() => handleDownloadFile('pricing')}
                      className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl transition flex flex-col justify-between space-y-3 shadow-xs font-sans text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition flex items-center justify-center text-emerald-600">
                          <Download className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-black text-slate-900 block text-xs">② 計價圖說清冊</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">Billing Valuation Sheet</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 w-full pt-1 font-sans">
                        <span>副檔名: .txt / xlsx</span>
                        <span className="text-emerald-600 group-hover:underline flex items-center gap-0.5 font-bold font-sans">
                          名細下載
                          <Download className="w-3 h-3" />
                        </span>
                      </div>
                    </button>

                    {/* Doc C */}
                    <button
                      onClick={() => handleDownloadFile('photos')}
                      className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl transition flex flex-col justify-between space-y-3 shadow-xs font-sans text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 group-hover:bg-amber-600 group-hover:text-white transition flex items-center justify-center text-amber-600">
                          <Camera className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-black text-slate-900 block text-xs">③ 施工照片圖說</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">Site Photograph Report</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 w-full pt-1">
                        <span>副檔名: .txt / docx</span>
                        <span className="text-amber-600 group-hover:underline flex items-center gap-0.5 font-bold">
                          三段下載
                          <Download className="w-3 h-3" />
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Logs timeline audit trails */}
                <div className="border-t border-slate-200/80 pt-5 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-150">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase select-none">
                      <History className="w-4 h-4 text-indigo-600" />
                      <span>派工案件修改/變更歷程</span>
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded cursor-default">
                      異動軌跡聯
                    </span>
                  </div>

                  <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4">
                    <div className="relative pl-6 border-l-2 border-indigo-200 space-y-5 text-xs">
                      {currentCaseDetail.case.logs.map((log, index) => (
                        <div key={index} className="relative group transition-opacity duration-150">
                          {/* Chronological Circle Bullet */}
                          <span className="absolute -left-[32px] top-0.5 bg-white border-2 border-indigo-500 rounded-full inline-flex justify-center items-center z-10 w-4.5 h-4.5 shadow-xs group-hover:bg-indigo-50 transition-colors">
                            <span className="text-[8px] font-black text-indigo-650 font-mono">#{index + 1}</span>
                          </span>

                          <div className="flex flex-wrap items-center gap-2 text-[10px] mb-1.5 text-slate-500/90">
                            <div className="flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md shadow-3xs font-mono font-semibold select-none text-slate-600">
                              <Clock className="w-3 h-3 text-indigo-500" />
                              <span>{log.time}</span>
                            </div>
                            <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md font-black select-none text-indigo-700">
                              <User className="w-3 h-3 text-indigo-500" />
                              <span>操作帳號: {log.user}</span>
                            </div>
                          </div>
                          
                          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-3xs text-[11px] leading-relaxed">
                            <div className="text-slate-400 mb-1 font-bold select-none text-[9px] uppercase tracking-wider">調整/變更內容:</div>
                            <div className="font-sans font-bold text-slate-800">{log.action}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 py-32">
                <ShieldAlert className="w-12 h-12 text-slate-200 mb-2" />
                <h4 className="font-extrabold text-slate-650 text-sm">請從左側列表點選並載入派工作業案件</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  點選中原路、國聯一路等派工任務，以進入完工照片核銷與估驗下載核心。
                </p>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* =================== Tab 2: CREATE NEW CASE FORM =================== */
        !currentUser.permissions.canManageCases ? (
          <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 min-h-[350px]">
            <div className="max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center space-y-4">
              <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 mx-auto border border-rose-100">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900">
                  ⚠️ 派工派遣成立權限限制 (唯讀模式)
                </h3>
                <p className="text-xs text-slate-400">
                  您目前登入身分為 <strong>[{currentUser.name}] ({currentUser.roleName})</strong>，缺乏建立派工調度特權之能。
                </p>
              </div>
              <p className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-150 leading-relaxed text-left">
                💡 <strong>權限管理機制：</strong> 欲解鎖號誌派工單建立、工項與遷移單指派：
                <br />
                請點選上方選單中的 <strong>「權限與使用者」</strong> 頁面，點擊 <strong>「陳管理 (Admin)」</strong> 旁的 <em>✨ 模擬切換登入</em>，或是在系統設定中開啟您當前帳號的 <strong>「派工單維運與結案」</strong> 存取權限。
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full font-sans">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>成立全新交通改善與號誌故障派公單</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                建立新案件時，您需要優先鎖定計價合約、填答通報市民案件來源，並勾選合約定額工項，以供運維數據追蹤及工程歸檔。
              </p>
            </div>

            <form onSubmit={handleCreateCaseSubmit} className="space-y-5 text-xs">
              
              {/* Mandatory Requirement 1: 先選擇合約 */}
              <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/80 space-y-2">
                <label className="block text-slate-800 font-extrabold flex items-center gap-1 text-[11px] uppercase tracking-wide">
                  <Briefcase className="w-4 h-4 text-amber-600" />
                  <span>步驟 1. 指定簽約計價工程標合約 (Prerequisite Contract) *</span>
                </label>
                <select
                  required
                  value={newCaseContractId}
                  onChange={(e) => setNewCaseContractId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs font-bold text-slate-800 focus:ring-1 focus:ring-blue-500"
                >
                  {contracts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.id} | [{c.type}] {c.name} (額度: ${c.totalAmount.toLocaleString()}元)
                    </option>
                  ))}
                  {contracts.length === 0 && (
                    <option value="CONTRACT-114-001">114-115年度花蓮縣交通號誌代養契約 (開口契約)</option>
                  )}
                </select>
                <span className="text-[10px] text-amber-700/80 font-bold block leading-relaxed">
                  ※ 依照本案防杜條款，此派工後續累積的所有結算開支金額，將在完工時直接從該合約標案剩餘额度中扣款。
                </span>
              </div>

              {/* Steps 2: Route details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Input Intersection */}
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1.5">步驟 2. 指定執行政區號誌化路口 (Intersection ID) *</label>
                  <select
                    required
                    value={newCaseIntersectionId}
                    onChange={(e) => setNewCaseIntersectionId(e.target.value)}
                    className="w-full p-2.5 border border-slate-350 rounded-lg text-xs bg-white font-bold"
                  >
                    <option value="">--請選擇號誌管制交岔路口--</option>
                    {intersections.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.id} | [{item.district}] {item.name} ({item.controllerType})
                      </option>
                    ))}
                  </select>
                  <span className="block text-[10px] text-slate-400 mt-1">
                    路口經緯度座標將由遙測系統自動完成對齊匹配。
                  </span>
                </div>

                {/* Report sources (通報來源) */}
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1.5">步驟 3. 事件通報通報來源註冊 *</label>
                  <select
                    value={newCaseReportSource}
                    onChange={(e) => setNewCaseReportSource(e.target.value)}
                    className="w-full p-2.5 border border-slate-350 rounded-lg text-xs bg-white font-bold"
                  >
                    <option value="民眾通報 (1999專線)">民眾通報 (1999專線)</option>
                    <option value="交警勤務調度反映">交警勤務調度反映 (重大事故)</option>
                    <option value="運維工程組現場巡檢">運維工程組現場巡檢 (例行發現)</option>
                    <option value="電訊監控自動心跳逾時">電訊監控自動心跳逾時 (遙測預警)</option>
                    <option value="公所函文指派改善案件">公所函文指派改善案件 (專案辦理)</option>
                  </select>
                  <span className="block text-[10px] text-slate-400 mt-1">
                    若為1999專線，立案時將預留與市民回復之聯動介面。
                  </span>
                </div>

              </div>

              {/* Task Details Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1.5">步驟 4. 故障/需求大類</label>
                  <select
                    value={newCaseType}
                    onChange={(e) => setNewCaseType(e.target.value as DispatchCase['type'])}
                    className="w-full p-2.5 border border-slate-350 rounded-lg text-xs bg-white font-bold"
                  >
                    <option value="設備故障">設備故障 (控制器IC、電源主板)</option>
                    <option value="號誌故障">號誌故障 (燈泡不亮、黑屏、罩體破碎)</option>
                    <option value="線路損壞">線路損壞 (地下光纖、接線斷裂)</option>
                    <option value="定期保養">定期保養 (清除塵埃、箱體散熱檢驗)</option>
                    <option value="路口調整">路口調整 (秒數設定與時相體更迭)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1.5">步驟 5. 卡限緊急度</label>
                  <div className="flex gap-1.5">
                    {['一般', '普通', '急件'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewCasePriority(p as DispatchCase['priority'])}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition text-center cursor-pointer ${
                          newCasePriority === p
                            ? 'bg-red-50 border-red-300 text-red-700 ring-2 ring-red-500/10'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1.5">步驟 6. 指定執法查檢工程師</label>
                  <input
                    type="text"
                    required
                    value={newCaseAssignedTo}
                    onChange={(e) => setNewCaseAssignedTo(e.target.value)}
                    className="w-full p-2.5 border border-slate-350 rounded-lg text-xs font-semibold"
                    placeholder="王小明 (巡檢工務組)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1.5">步驟 7. 派工作業簡短主旨 *</label>
                <input
                  type="text"
                  required
                  value={newCaseTitle}
                  onChange={(e) => setNewCaseTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-350 rounded-lg text-xs font-bold"
                  placeholder="如：美崙區中正路 LED 燈泡熔毀抽換並微調控制器電容接頭"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1.5">步驟 8. Citizens Citizens 報修事件描述說明</label>
                <textarea
                  rows={3}
                  value={newCaseDescription}
                  onChange={(e) => setNewCaseDescription(e.target.value)}
                  className="w-full p-2.5 border border-slate-350 rounded-lg text-xs font-medium"
                  placeholder="請在此詳細紀錄民眾來電、查修回執或主板警報紀錄等關鍵參數..."
                />
              </div>

               {/* Requirement: 選擇對應合約工項 */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>步驟 9. 勾選關聯標案之合約計價單價工項 (Engineering Work Items) *</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      點選勾選各單項工項並輸入數量，系統將基於花蓮縣府核定之契約單價自動加總概算，並於成立核定時帶入估驗中。
                    </p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg shrink-0 text-right select-none">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">預計核憑小計 (Est. Total Cost)</span>
                    <span className="font-mono text-sm text-emerald-700 font-extrabold block">
                      NT$ {calculatedNewCaseCost.toLocaleString()} 元
                    </span>
                  </div>
                </div>

                {/* Category selection tabs for open-contract schedule detailed items */}
                <div className="flex flex-wrap gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                  {['全部', '號誌桿件與支架', '號誌燈箱與有聲號誌', '控制器與電源分界箱', '管線佈設與線材', '智慧路口與感應設備', '標誌標線與安全設施'].map((cat) => {
                    const countInCat = PRESET_CONTRACT_WORK_ITEMS.filter(item => {
                      if (cat !== '全部' && item.category !== cat) return false;
                      return (selectedWorkItemQuantities[item.id] || 0) > 0;
                    }).length;
                    
                    const isActive = activeCategoryFilter === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-bold transition-all duration-150 cursor-pointer flex items-center gap-1 ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-xs font-black'
                            : 'bg-white text-slate-650 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'
                        }`}
                      >
                        <span>{cat}</span>
                        {countInCat > 0 && (
                          <span className={`text-[9px] px-1.5 rounded-full flex items-center justify-center font-black ${isActive ? 'bg-indigo-805 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                            {countInCat}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
                  <table className="w-full text-left text-xs leading-normal">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-205 text-[10px] select-none">
                      <tr>
                        <th className="p-2.5 pl-4 w-28">工項編碼</th>
                        {activeCategoryFilter === '全部' && <th className="p-2.5 w-32">群組分類</th>}
                        <th className="p-2.5">契約核定工項名稱</th>
                        <th className="p-2.5 text-right w-24">單價 (元)</th>
                        <th className="p-2.5 text-center w-20">單位</th>
                        <th className="p-2.5 text-right w-32 pr-4">核配數量</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {PRESET_CONTRACT_WORK_ITEMS.filter(item => activeCategoryFilter === '全部' || item.category === activeCategoryFilter).map(item => {
                        const qty = selectedWorkItemQuantities[item.id] || 0;
                        const isChosen = qty > 0;
                        
                        return (
                          <tr key={item.id} className={`${isChosen ? 'bg-indigo-50/20' : 'bg-white hover:bg-slate-55/30'} transition-colors duration-150`}>
                            <td className="p-2.5 pl-4 font-mono font-bold text-[10px] text-slate-450">
                              {item.id}
                            </td>
                            {activeCategoryFilter === '全部' && (
                              <td className="p-2.5 select-none">
                                <span className={`text-[9px] px-2 py-0.5 rounded font-bold border ${
                                  item.category === '號誌桿件與支架' ? 'bg-blue-50 border-blue-150 text-blue-700' :
                                  item.category === '號誌燈箱與有聲號誌' ? 'bg-indigo-50 border-indigo-150 text-indigo-705' :
                                  item.category === '控制器與電源分界箱' ? 'bg-amber-50 border-amber-150 text-amber-700' :
                                  item.category === '管線佈設與線材' ? 'bg-emerald-50 border-emerald-150 text-emerald-705' :
                                  item.category === '智慧路口與感應設備' ? 'bg-violet-50 border-violet-150 text-violet-700' :
                                  'bg-rose-50 border-rose-150 text-rose-700'
                                }`}>
                                  {item.category?.slice(0, 4)}
                                </span>
                              </td>
                            )}
                            <td className="p-2.5 font-bold text-slate-800">
                              {item.name}
                            </td>
                            <td className="p-2.5 text-right font-mono text-slate-600">
                              ${item.price.toLocaleString()}
                            </td>
                            <td className="p-2.5 text-center text-slate-400 font-bold select-none">
                              {item.unit}
                            </td>
                            <td className="p-2.5 text-right pr-4">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedWorkItemQuantities(prev => ({
                                      ...prev,
                                      [item.id]: Math.max((prev[item.id] || 0) - 1, 0)
                                    }));
                                  }}
                                  className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition rounded flex items-center justify-center font-bold text-xs select-none cursor-pointer"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={qty}
                                  onChange={(e) => {
                                    const val = Math.max(parseInt(e.target.value) || 0, 0);
                                    setSelectedWorkItemQuantities(prev => ({
                                      ...prev,
                                      [item.id]: val
                                    }));
                                  }}
                                  className="w-12 p-1 border border-slate-250 rounded text-center text-xs font-mono font-bold bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedWorkItemQuantities(prev => ({
                                      ...prev,
                                      [item.id]: (prev[item.id] || 0) + 1
                                    }));
                                  }}
                                  className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition rounded flex items-center justify-center font-bold text-xs select-none cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-150 flex items-center justify-between gap-3 font-sans">
                <span className="text-[10px] text-slate-400 font-medium">
                  ※ 點擊後，本路口名秒數將同步標記為具有「待派工(C_PENDING)」之運維黃色異常信號，供大螢幕總控。
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setViewTab('tracking')}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    返回追蹤列表
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black shadow-md flex items-center gap-1 cursor-pointer transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>核定成立此派工單</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
        )
      )}

      {/* ================= MODAL DIALOG: EQUIPMENT RELOCATION SHEET (設備遷移單) ================= */}
      {isRelocationModalOpen && (
        <div id="modal_relocation" className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 transition-all overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex justify-between items-center border-b border-slate-950 shrink-0 select-none">
              <span className="text-xs font-black tracking-wide flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>花蓮縣交通號誌設備移設/設備遷移單登記產製</span>
              </span>
              <button 
                onClick={() => {
                  setIsRelocationModalOpen(false);
                  setGeneratedRelocation(null);
                }} 
                className="text-slate-400 hover:text-white font-extrabold cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              
              {!generatedRelocation ? (
                /* Step A: RELOCATION INPUT FORM & REAL-TIME PREVIEW PANEL (DOCK SIDE-BY-SIDE) */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column (Input Controls) */}
                  <form onSubmit={handleGenerateRelocation} className="lg:col-span-5 space-y-4 text-xs">
                    
                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-[11px] leading-relaxed select-none">
                      <span className="font-extrabold text-blue-900 block mb-0.5">※ 設備拆卸遷移說明</span>
                      本聯單由派工工程師核對填發。請指定當次工單欲卸載之機殼或智慧控制IC，並指定縣政府核可接收之目的地路口，以利遙測主控天線完成拓樸移設。
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-700 font-extrabold mb-1">1. 要進行遷移的現有設備名稱 *</label>
                      <input
                        type="text"
                        required
                        value={relocItemName}
                        onChange={(e) => setRelocItemName(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 font-bold text-slate-800 bg-white"
                        placeholder="如：MGC-3100核心微控制器板及其NTCIP模組"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-slate-500 font-bold mb-1">2. 原始起點安裝路口 (From)</label>
                        <input
                          type="text"
                          disabled
                          value={currentCaseDetail ? `${currentCaseDetail.intersection.id} ${currentCaseDetail.intersection.name}` : ''}
                          className="w-full p-2 border border-slate-200 rounded bg-slate-50 text-slate-550 font-semibold text-[11px]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-700 font-extrabold mb-1">3. 目標移設終點路口 (To) *</label>
                        <select
                          required
                          value={relocToJunctionId}
                          onChange={(e) => setRelocToJunctionId(e.target.value)}
                          className="w-full p-2 border border-slate-350 rounded bg-white text-slate-800 font-bold text-[11px]"
                        >
                          <option value="">-- 請選擇接收路口 --</option>
                          {intersections
                            .filter(i => i.id !== currentCaseDetail?.intersection?.id)
                            .map(i => (
                              <option key={i.id} value={`${i.id} - [${i.district}] ${i.name}`}>
                                {i.id} | [{i.district}] {i.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-slate-700 font-extrabold mb-1">4. 專案主辦驗證技師 / 主辦人 *</label>
                        <input
                          type="text"
                          required
                          value={relocEngineer}
                          onChange={(e) => setRelocEngineer(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-800 bg-white"
                          placeholder="juichun@gcs.ceci.com.tw"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-700 font-extrabold mb-1">5. 核定移解預計執行時程</label>
                        <input
                          type="date"
                          required
                          value={relocDate}
                          onChange={(e) => setRelocDate(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded font-mono font-bold text-slate-800 bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-700 font-extrabold mb-1">6. 拆裝與線路變更備註 *</label>
                      <textarea
                        rows={3}
                        value={relocNotes}
                        onChange={(e) => setRelocNotes(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded font-medium text-slate-800 bg-white"
                        placeholder="說明移設後之光纖天線接頭配置或備用電源對接等事項..."
                      />
                    </div>

                    {/* Submit buttons */}
                    <div className="pt-3 border-t border-slate-100 flex gap-2 justify-end font-sans select-none">
                      <button
                        type="button"
                        onClick={() => setIsRelocationModalOpen(false)}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer text-xs font-bold transition"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black flex items-center gap-1 shadow hover:shadow-md cursor-pointer transition"
                      >
                        <CheckCircle className="w-4 h-4 text-blue-200" />
                        <span>確認登記並產製遷移憑單</span>
                      </button>
                    </div>

                  </form>

                  {/* Right Column (Instant Document Document Preview Card) */}
                  <div className="lg:col-span-7 space-y-3 bg-slate-50/70 border border-slate-200 p-4 rounded-xl flex flex-col shadow-inner select-none">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                      <span className="text-[11px] font-black text-slate-700 flex items-center gap-1.5 px-2 py-0.5 rounded bg-white border border-slate-200">
                        <Eye className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                        <span>文件即時預覽 (Document Instant Preview)</span>
                      </span>
                      <span className="text-[9px] font-extrabold text-blue-500 tracking-wider">DRAFT SHIELD PREVIEW</span>
                    </div>

                    {/* Styled Document Voucher Form */}
                    <div className="p-8 border-4 border-double border-slate-400 bg-white text-slate-900 font-serif relative overflow-hidden leading-relaxed shadow shadow-slate-100 min-h-[350px]">
                      
                      {/* Chinese Official Red Stamp simulated */}
                      <div className="absolute right-5 bottom-8 w-20 h-20 rounded-full border-4 border-red-500/80 flex items-center justify-center text-red-500/80 font-black text-[9px] uppercase select-none rotate-12 border-double">
                        <div className="text-center font-bold">
                          <span>花蓮縣工務處</span>
                          <span className="block text-[6px] font-sans">TRANSPORT DEP</span>
                          <span>查照驗收正印</span>
                        </div>
                      </div>

                      {/* Official Ribbon watermarked */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-100/30 text-5xl font-black rotate-[25deg] uppercase select-none pointer-events-none tracking-widest font-serif">
                        DRAFT PREVIEW
                      </div>

                      <div className="text-center space-y-1 mb-5 relative z-10">
                        <h2 className="text-base font-black tracking-widest text-slate-950">花蓮縣政府交通主體設備遷移核定單</h2>
                        <p className="text-[8px] font-sans tracking-wide text-slate-450 italic">Equipment Relocation Authorization Order (Draft)</p>
                        <div className="text-[9px] font-mono text-slate-400">憑單流水號：DRAFT-{Math.floor(Math.random() * 90) + 10}-XXXXX</div>
                      </div>

                      <table className="w-full text-xs text-left border-collapse border border-slate-400 font-medium relative z-10 bg-white/70">
                        <tbody>
                          <tr className="border-b border-slate-400">
                            <td className="p-2 border-r border-slate-400 bg-slate-50 font-bold w-28 select-none">指定移設項目</td>
                            <td className="p-2 font-black text-slate-900 text-[11px]">
                              {relocItemName || <span className="text-amber-500 italic">尚未輸入設備名稱</span>}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <td className="p-2 border-r border-slate-400 bg-slate-50 font-bold select-none">移出起點路口</td>
                            <td className="p-2 text-slate-700">
                              {currentCaseDetail ? `${currentCaseDetail.intersection.id} ${currentCaseDetail.intersection.name}` : ''}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <td className="p-2 border-r border-slate-400 bg-slate-50 font-bold select-none">裝設目的地</td>
                            <td className="p-2 pb-2.5">
                              {relocToJunctionId ? (
                                <span className="font-black text-rose-700 text-[11px]">{relocToJunctionId}</span>
                              ) : (
                                <span className="text-rose-500 italic bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded text-[10px]">
                                  ⚠ 請選擇移設目標路口
                                </span>
                              )}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <td className="p-2 border-r border-slate-400 bg-slate-50 font-bold select-none">工程簽證技師</td>
                            <td className="p-2 font-sans font-bold text-slate-800">
                              {relocEngineer || <span className="text-amber-500 italic">請填寫簽證技師姓名</span>}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <td className="p-2 border-r border-slate-400 bg-slate-50 font-bold select-none">預計移裝日期</td>
                            <td className="p-2 font-mono font-bold text-slate-800">
                              {relocDate || <span className="text-amber-500 italic">yyyy-mm-dd</span>}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-slate-400 bg-slate-50 font-bold select-none">施工移裝說明</td>
                            <td className="p-2 text-[10px] font-sans text-slate-700 whitespace-pre-line leading-normal">
                              {relocNotes || <span className="text-amber-500 italic">請輸入拆卸與接頭防銹等施工要求...</span>}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="mt-6 pt-4 border-t border-dashed border-slate-200 text-[9px] text-slate-450 leading-relaxed font-sans relative z-10">
                        <p className="font-extrabold select-none">【注意事項】：</p>
                        <p>一、依花蓮縣交維與路政法規第32條，拆遷之信號機及控制器IP、Port應於完工4小時內更新拓牌架構。</p>
                        <p>二、地下多芯屏蔽線纜移設時應行抗干擾屏蔽，凡接頭除鏽未滿70%者驗收官得逕行退件估算罰鍰。</p>
                        <p className="mt-3 text-right font-serif text-slate-500 select-none">
                          核定機關：花蓮縣政府交通工務處第一調度所 敬啟 (存執聯)
                        </p>
                      </div>

                    </div>
                  </div>

                </div>
              ) : (
                /* Step B: BEAUTIFUL Printable warrant display (民國115年花蓮縣政府交通裝備遷移證明書) */
                <div className="space-y-4">
                  <div className="p-8 border-4 border-double border-slate-700 bg-slate-50 text-slate-900 font-serif relative select-text leading-relaxed">
                    
                    {/* Chinese Official Red Stamp simulated */}
                    <div className="absolute right-8 bottom-12 w-24 h-24 rounded-full border-4 border-red-500 flex items-center justify-center text-red-500 font-black text-xs uppercase opacity-85 select-none rotate-12 border-double">
                      <div className="text-center font-bold">
                        <span>花蓮縣工務處</span>
                        <span className="block text-[8px] font-sans">TRANSPORT DEP</span>
                        <span>查照驗收正印</span>
                      </div>
                    </div>

                    <div className="text-center space-y-1 mb-6">
                      <h2 className="text-lg font-black tracking-widest text-slate-950">花蓮縣政府交通主體設備遷移核定單</h2>
                      <p className="text-[10px] font-sans tracking-wide text-slate-550 italic">Equipment Relocation Authorization Order</p>
                      <div className="text-[10px] font-mono text-slate-400">憑單流水號：{generatedRelocation.id}</div>
                    </div>

                    <table className="w-full text-xs text-left border-collapse border border-slate-400 font-medium">
                      <tbody>
                        <tr className="border-b border-slate-400">
                          <td className="p-2 border-r border-slate-400 bg-slate-150 font-bold w-32">指定移設項目</td>
                          <td className="p-2 font-black">{generatedRelocation.itemName}</td>
                        </tr>
                        <tr className="border-b border-slate-400">
                          <td className="p-2 border-r border-slate-400 bg-slate-150 font-bold">移出起點路口</td>
                          <td className="p-2">{generatedRelocation.fromJunction}</td>
                        </tr>
                        <tr className="border-b border-slate-400">
                          <td className="p-2 border-r border-slate-400 bg-slate-150 font-bold">裝設目的地</td>
                          <td className="p-2 font-black text-rose-700">{generatedRelocation.toJunction}</td>
                        </tr>
                        <tr className="border-b border-slate-400">
                          <td className="p-2 border-r border-slate-400 bg-slate-150 font-bold">工程簽證技師</td>
                          <td className="p-2 font-sans font-bold">{generatedRelocation.engineer}</td>
                        </tr>
                        <tr className="border-b border-slate-400">
                          <td className="p-2 border-r border-slate-400 bg-slate-150 font-bold">預計移裝日期</td>
                          <td className="p-2 font-mono font-bold">{generatedRelocation.planDate}</td>
                        </tr>
                        <tr>
                          <td className="p-2 border-r border-slate-400 bg-slate-150 font-bold">施工移裝說明</td>
                          <td className="p-2 text-[11px] font-sans">{generatedRelocation.notes}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="mt-8 pt-4 border-t border-dashed border-slate-300 text-[10px] text-slate-500 leading-normal font-sans">
                      <p>【注意事項】：</p>
                      <p>一、依花蓮縣交維與路政法規第32條，拆遷之信號機及控制器IP、Port應於完工4小時內更新拓牌架構。</p>
                      <p>二、地下多芯屏蔽線纜移設時應行抗干擾屏蔽，凡接頭除鏽未滿70%者驗收官得逕行退件估算罰鍰。</p>
                      <p className="mt-4 text-right font-serif text-slate-600 block">
                        核定機關：花蓮縣政府交通工務處第一調度所 敬啟 (存執聯)
                      </p>
                    </div>

                  </div>

                  {/* Actions for generated warrant */}
                  <div className="flex gap-2 justify-end pt-2 font-sans">
                    <button
                      type="button"
                      onClick={() => {
                        // Natively trigger print sheet text file download
                        const fileName = `[遷移裝備單]-流水編-${generatedRelocation.id}.txt`;
                        const content = `
==================================================
        花蓮縣政府交通工程設備遷移核定單
==================================================
流 水 號 ： ${generatedRelocation.id}
出 單 時 間： ${generatedRelocation.createdAt}
設備名稱： ${generatedRelocation.itemName}
起點路口： ${generatedRelocation.fromJunction}
終點目的地： ${generatedRelocation.toJunction}
主辦技師： ${generatedRelocation.engineer}
施工日期： ${generatedRelocation.planDate}
拆裝備忘： ${generatedRelocation.notes}

--------------------------------------------------
本遷移單一式兩份，由主辦單位及現場技師各自存執。
簽核處： _________________ (蓋印代檢)
                        `;
                        const b = new Blob([content], { type: 'text/plain;charset=utf-8' });
                        const u = URL.createObjectURL(b);
                        const l = document.createElement('a');
                        l.href = u;
                        l.download = fileName;
                        l.click();
                        triggerBanner(`✓ 已成功下載遷移單！`);
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer transition shadow"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-300" />
                      <span>下載此設備遷移單 TXT</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        window.print();
                      }}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold select-none cursor-pointer"
                    >
                      列印遷移證書
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRelocationModalOpen(false);
                        setGeneratedRelocation(null);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      關閉視窗
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL DIALOG: CLOSE CASE WITH REMARK AND OPTION (竣工結案彈窗) ================= */}
      {isCloseCaseModalOpen && (
        <div id="modal_close_case" className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 transition-all overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-emerald-700 text-white px-5 py-4 flex justify-between items-center border-b border-emerald-850 shrink-0 select-none font-sans">
              <span className="text-xs font-black tracking-wide flex items-center gap-1.5">
                <CheckCircle className="w-5 h-5 text-emerald-300" />
                <span>竣工結案程序確認</span>
              </span>
              <button 
                onClick={() => setIsCloseCaseModalOpen(false)} 
                className="text-emerald-150 hover:text-white font-extrabold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-sans">
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 leading-relaxed font-bold select-none text-[11px]">
                💡 【提醒是否更改路口諸元設定】：
                結案完成後，系統建議您同步檢視或辦理此號誌路口的實體設施/諸元保固設定，以維護最新的通訊與控制盒硬體資產。
              </div>

              {/* Close Remark Field */}
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-extrabold select-none">
                  自行編輯結案備註說明 (Closing Remarks)
                </label>
                <textarea
                  rows={4}
                  value={closeCaseRemark}
                  onChange={(e) => setCloseCaseRemark(e.target.value)}
                  className="w-full font-bold text-[11px] p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-slate-800"
                  placeholder="請在此輸入此案件竣工驗收備註說明..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-2 justify-end select-none">
                <button
                  type="button"
                  onClick={() => setIsCloseCaseModalOpen(false)}
                  className="px-4 py-2 bg-white text-slate-700 font-bold border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition cursor-pointer text-xs"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCloseCase}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg transition shadow-sm cursor-pointer text-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>確定結案</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
