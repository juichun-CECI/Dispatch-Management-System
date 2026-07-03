import React, { useState, useMemo, useEffect } from 'react';
import { Intersection, DispatchCase } from '../types';
import { 
  ShieldCheck, 
  Info, 
  Clock, 
  AlertTriangle, 
  Cpu, 
  Settings, 
  Database, 
  Radio, 
  Wrench, 
  Activity, 
  CheckCircle, 
  ArrowRight, 
  Plus, 
  X, 
  MapPin, 
  FileEdit,
  Sliders,
  Calendar,
  Layers,
  CircleCheck,
  TrendingUp,
  ExternalLink
} from 'lucide-react';

interface SignalHistoryViewProps {
  intersections: Intersection[];
  selectedIntersection: Intersection | null;
  onUpdateIntersectionDetails?: (id: string, updatedParams: Partial<Intersection>) => void;
  onUpdateIntersectionCase?: (intersectionId: string, newCase: DispatchCase | undefined) => void;
}

interface RepairLog {
  date: string;
  title: string;
  content: string;
  engineer: string;
  type: string;
}

export default function SignalHistoryView({
  intersections,
  selectedIntersection,
  onUpdateIntersectionDetails,
  onUpdateIntersectionCase
}: SignalHistoryViewProps) {
  // Currently displayed intersection ID
  const [activeSegmentId, setActiveSegmentId] = useState(selectedIntersection?.id || 'TC01');

  // Interactive local timelines state (cache in-memory to persist during runtime)
  const [logsCache, setLogsCache] = useState<Record<string, RepairLog[]>>({});

  // 1. Modals & Dialog states
  const [isCabinetControlOpen, setCabinetControlOpen] = useState(false);
  const [isTimingControlOpen, setTimingControlOpen] = useState(false);
  const [isDetailEditOpen, setDetailEditOpen] = useState(false);
  const [isAddingCaseOpen, setAddingCaseOpen] = useState(false);
  
  // 2. Add New Log Form State
  const [isAddingLogOpen, setAddingLogOpen] = useState(false);
  const [newLogDate, setNewLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLogTitle, setNewLogTitle] = useState('');
  const [newLogContent, setNewLogContent] = useState('');
  const [newLogEngineer, setNewLogEngineer] = useState('juichun@gcs.ceci.com.tw');
  const [newLogType, setNewLogType] = useState('定期查護');

  // 3. New Quick Dispatch Case State
  const [caseTitle, setCaseTitle] = useState('');
  const [caseType, setCaseType] = useState<'設備故障' | '號誌故障' | '線路損壞' | '定期保養' | '路口調整'>('設備故障');
  const [casePriority, setCasePriority] = useState<'急件' | '普通' | '一般'>('急件');
  const [caseDesc, setCaseDesc] = useState('');
  const [caseAssignee, setCaseAssignee] = useState('陳大華 (工程師一組)');

  // 4. Cabinet Control Modal / Lane Configuration State
  const [laneCountNS, setLaneCountNS] = useState(2);
  const [laneCountEW, setLaneCountEW] = useState(2);
  const [hasLeftTurnNS, setHasLeftTurnNS] = useState(true);
  const [hasLeftTurnEW, setHasLeftTurnEW] = useState(false);

  // 5. Timing plan modal sliders state (pre-filled on opening)
  const [editGreenA, setEditGreenA] = useState(35);
  const [editYellowA, setEditYellowA] = useState(4);
  const [editRedA, setEditRedA] = useState(2);

  const [editGreenB, setEditGreenB] = useState(25);
  const [editYellowB, setEditYellowB] = useState(4);
  const [editRedB, setEditRedB] = useState(2);

  // 6. Settings editor fields
  const [editIP, setEditIP] = useState('');
  const [editPort, setEditPort] = useState(4001);
  const [editController, setEditController] = useState<'MGC-3100' | 'ITC-2000' | 'TC-800' | 'NTCIP-90'>('MGC-3100');
  const [editWarranty, setEditWarranty] = useState<'W_VALID' | 'W_EXPIRED'>('W_VALID');
  const [editInstallDate, setEditInstallDate] = useState('2024-06-11');
  const [editCabinetSpec, setEditCabinetSpec] = useState('IP55 戶外防水防塵配電櫃');
  const [editTelecomFee, setEditTelecomFee] = useState(599);

  // Load selected intersection from list
  const targetIntersection = useMemo(() => {
    return intersections.find(i => i.id.toUpperCase() === activeSegmentId.toUpperCase()) || intersections[0] || {} as Intersection;
  }, [intersections, activeSegmentId]);

  // Sync selection when parent switches it
  useEffect(() => {
    if (selectedIntersection) {
      setActiveSegmentId(selectedIntersection.id);
    }
  }, [selectedIntersection]);

  // Initialize/Sync edit states when active intersection changes
  useEffect(() => {
    if (targetIntersection && targetIntersection.id) {
      setEditIP(targetIntersection.ip || '172.16.102.29');
      setEditPort(targetIntersection.port || 4001);
      setEditController(targetIntersection.controllerType || 'MGC-3100');
      setEditWarranty(targetIntersection.warranty || 'W_VALID');
      setEditInstallDate(targetIntersection.installDate || '2024-06-11');
      
      // Seed timing plans
      setEditGreenA(targetIntersection.cycleTime > 100 ? 50 : 35);
      setEditYellowA(4);
      setEditRedA(2);
      
      setEditGreenB(targetIntersection.cycleTime > 100 ? 40 : 25);
      setEditYellowB(4);
      setEditRedB(2);
    }
  }, [targetIntersection]);

  // Initialize and get the repair/maintenance logs timeline
  const activeTimelineLogs = useMemo(() => {
    const defaultLogs: RepairLog[] = [
      {
        date: '2026-04-12',
        title: '定期巡檢保養與除濕工作',
        content: '巡修小組執行季度巡檢，箱體微控大底板、配線螺栓完成緊固。箱體配溫控排風扇功能運作正常。',
        engineer: '黃技師 (巡修三組)',
        type: '定期查護'
      },
      {
        date: targetIntersection.addr % 2 === 0 ? '2025-11-05' : '2025-08-18',
        title: '5G通訊界面卡更換與韌體重置',
        content: '因應光纖斷路備援，安裝全雙工 5G NTCIP 協定通訊天線卡，韌體版本一併升級至 HL-NTCIP-V3.9。',
        engineer: '陳大華 (工程師一組)',
        type: '韌體升級'
      },
      {
        date: '2024-06-11',
        title: '新型 LED 高亮度號誌燈具汰換施工',
        content: '綠色低碳路口標準工程，拆除舊款高耗能鹵素白熾燈泡，抽換為高演色性 12吋 LED 省電大圓形燈頭組。',
        engineer: '蘇工程師 (委外厂商)',
        type: '硬體汰換'
      }
    ];

    if (!logsCache[targetIntersection.id]) {
      return defaultLogs;
    }
    return logsCache[targetIntersection.id];
  }, [logsCache, targetIntersection]);

  // Append new maintenance record to current intersection
  const handleAddLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogTitle || !newLogContent) return;

    const addedRecord: RepairLog = {
      date: newLogDate,
      title: newLogTitle,
      content: newLogContent,
      engineer: newLogEngineer,
      type: newLogType
    };

    setLogsCache(prev => {
      const currentList = prev[targetIntersection.id] || activeTimelineLogs;
      return {
        ...prev,
        [targetIntersection.id]: [addedRecord, ...currentList]
      };
    });

    // Clear form
    setNewLogTitle('');
    setNewLogContent('');
    setAddingLogOpen(false);
  };

  // Submit edits for Specifications (Settings editor)
  const handleSpecsSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateIntersectionDetails && targetIntersection.id) {
      onUpdateIntersectionDetails(targetIntersection.id, {
        ip: editIP,
        port: editPort,
        controllerType: editController,
        warranty: editWarranty,
        installDate: editInstallDate
        // Additional custom parameters can mock write locally
      });
    }
    setDetailEditOpen(false);
  };

  // Submit quick dispatch case
  const handleQuickDispatchCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseTitle || !caseDesc) return;

    const caseId = `CASE-HIST-${Math.floor(Math.random() * 9000) + 1000}`;
    const newCase: DispatchCase = {
      id: caseId,
      title: caseTitle,
      type: caseType,
      status: '待派工',
      priority: casePriority,
      assignedTo: caseAssignee,
      reportTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
      deadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 16),
      description: caseDesc,
      logs: [
        {
          time: new Date().toLocaleTimeString('zh-TW', { hour12: false }).slice(0, 5),
          action: '經由號誌履歷管理頁面「快速建立派工」管道立案',
          user: ' juichun@gcs.ceci.com.tw'
        }
      ]
    };

    if (onUpdateIntersectionCase) {
      onUpdateIntersectionCase(targetIntersection.id, newCase);
    }

    // Reset fields
    setCaseTitle('');
    setCaseDesc('');
    setAddingCaseOpen(false);
  };

  // Dispatch work cases actions update status
  const handleSetDispatchStatus = (nextStatus: '處理中' | '已完工' | '結案') => {
    if (!targetIntersection.case) return;
    if (nextStatus === '結案') {
      if (onUpdateIntersectionCase) {
        onUpdateIntersectionCase(targetIntersection.id, undefined);
      }
    } else {
      const updatedCase: DispatchCase = {
        ...targetIntersection.case,
        status: nextStatus,
        logs: [
          ...targetIntersection.case.logs,
          {
            time: new Date().toLocaleTimeString('zh-TW', { hour12: false }).slice(0, 5),
            action: `工程進度標記改為: 【${nextStatus}】`,
            user: 'juichun'
          }
        ]
      };
      if (onUpdateIntersectionCase) {
        onUpdateIntersectionCase(targetIntersection.id, updatedCase);
      }
    }
  };

  // Save timing configuration from modal
  const handleTimingPlanSave = () => {
    const calculatedCycle = editGreenA + editYellowA + editRedA + editGreenB + editYellowB + editRedB;
    if (onUpdateIntersectionDetails) {
      onUpdateIntersectionDetails(targetIntersection.id, {
        cycleTime: calculatedCycle
      });
    }
    setTimingControlOpen(false);
  };

  return (
    <div id="wrapper_signal_history" className="h-full flex flex-col bg-slate-100 overflow-hidden select-none">
      
      {/* Selector Area (Global across tabs) */}
      <div className="p-4 bg-white border-b border-slate-200 shrink-0 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <span className="text-indigo-600 font-extrabold">🚨</span> 
            <span>號誌全生命週期運維與履歷管理面板</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            綜合呈現控制箱硬體諸元、連通路口圖配置、時序計量秒數、即時工單派遣與歷史檢修事件流。
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <MapPin className="w-4 h-4 text-indigo-500" />
          <span className="text-xs text-slate-600 font-bold whitespace-nowrap">連線路口檢索:</span>
          <select
            value={activeSegmentId}
            onChange={(e) => {
              setActiveSegmentId(e.target.value);
              // Initialize cached customized layouts
              const isEven = parseInt(e.target.value.replace(/\D/g, '') || '1') % 2 === 0;
              setLaneCountNS(isEven ? 3 : 2);
              setLaneCountEW(isEven ? 2 : 3);
              setHasLeftTurnNS(isEven);
              setHasLeftTurnEW(!isEven);
            }}
            className="px-2 py-1.5 border border-slate-200 bg-white rounded text-xs font-mono font-black text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none w-52 sm:w-64 cursor-pointer"
          >
            {intersections.map(i => (
              <option key={i.id} value={i.id}>
                {i.id} - {i.name} ({i.district})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Core Columns Workspace */}
      <div className="flex-1 overflow-y-auto p-4 max-w-full">
        
        {/* Layout matching user's diagram: Left column 3 blocks (GREEN), Right column 2 blocks (CREAM YELLOW) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 max-w-[1600px] mx-auto">
          
          {/* ==================== LEFT COLUMN (Soft Green Theme Boxes) ==================== */}
          <div className="space-y-5">
            
            {/* Box 1: 路口基本資訊 */}
            <div className="bg-[#f0f9f4] border-2 border-[#ccebd6] rounded-xl p-5 shadow-xs flex flex-col relative min-h-[360px]">
              {/* Highlight label requested like yellow hand-drawn style */}
              <div className="mb-3 flex items-start justify-between">
                <span className="bg-[#fff3b3] border border-[#f5df5d] text-slate-900 font-bold px-3 py-1 text-xs rounded shadow-xs select-none">
                  路口基本資訊
                </span>
                <span className="text-[10px] text-emerald-800 font-mono font-bold">
                  TRAFFIC PLATFORM INDEX
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {/* Text Bullets: ◆ */}
                <div className="space-y-3.5 text-xs text-emerald-950 font-medium leading-relaxed">
                  <div className="flex items-start gap-1">
                    <span className="text-emerald-600 font-bold shrink-0">◆</span>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">系統識別 / 名稱</span>
                      <strong className="text-slate-900 text-sm font-black">{targetIntersection.id} - {targetIntersection.name}</strong>
                    </div>
                  </div>

                  <div className="flex items-start gap-1">
                    <span className="text-emerald-600 font-bold shrink-0">◆</span>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">轄區行政區域</span>
                      <strong className="text-slate-900">{targetIntersection.district} (花蓮縣轄區)</strong>
                    </div>
                  </div>

                  <div className="flex items-start gap-1">
                    <span className="text-emerald-600 font-bold shrink-0">◆</span>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">地理全球坐標</span>
                      <span className="font-mono text-slate-800">
                        緯度: {targetIntersection.lat.toFixed(5)}° N, 經度: {targetIntersection.lon.toFixed(5)}° E
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1">
                    <span className="text-emerald-600 font-bold shrink-0">◆</span>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">車道配置佈局</span>
                      <span className="text-slate-800">
                        南北向配有 {laneCountNS} 車道 {hasLeftTurnNS && '(含左轉專用道)'}
                        <br />
                        東西向配有 {laneCountEW} 車道 {hasLeftTurnEW && '(含左轉專用道)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SVG Visual Road Map Layout */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 relative shadow-inner overflow-hidden select-none min-h-[160px] flex flex-col justify-between">
                  <div className="absolute top-1.5 left-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest z-10 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-indigo-400 animate-pulse" /> 
                    <span>路口車道圖動態示意</span>
                  </div>

                  {/* SVG Intersection drawing */}
                  <svg viewBox="0 0 200 200" className="w-full h-full max-h-[140px] mt-2">
                    {/* Background Roads */}
                    <rect x="75" y="0" width="50" height="200" fill="#334155" />
                    <rect x="0" y="75" width="200" height="50" fill="#334155" />

                    {/* Lane dividers (dashed lines) */}
                    <line x1="100" y1="0" x2="100" y2="200" stroke="#fef08a" strokeDasharray="3,3" strokeWidth="1" />
                    <line x1="0" y1="100" x2="200" y2="100" stroke="#fef08a" strokeDasharray="3,3" strokeWidth="1" />

                    {/* Pedestrian crosswalks */}
                    <g stroke="#f8fafc" strokeWidth="1.5">
                      <line x1="75" y1="70" x2="125" y2="70" strokeDasharray="1,2" />
                      <line x1="75" y1="130" x2="125" y2="130" strokeDasharray="1,2" />
                      <line x1="70" y1="75" x2="70" y2="125" strokeDasharray="1,2" />
                      <line x1="130" y1="75" x2="130" y2="125" strokeDasharray="1,2" />
                    </g>

                    {/* Active green/red glowing signal dots */}
                    <circle cx="70" cy="70" r="3.5" fill={targetIntersection.status === 'E_ONLINE' ? '#10b981' : '#ef4444'} className="animate-ping" />
                    <circle cx="70" cy="70" r="2.5" fill={targetIntersection.status === 'E_ONLINE' ? '#10b981' : '#ef4444'} />

                    <circle cx="130" cy="130" r="3.5" fill={targetIntersection.status === 'E_ONLINE' ? '#10b981' : '#ef4444'} className="animate-ping" />
                    <circle cx="130" cy="130" r="2.5" fill={targetIntersection.status === 'E_ONLINE' ? '#10b981' : '#ef4444'} />

                    {/* Direction arrows */}
                    <g fill="#94a3b8" fontSize="10" fontWeight="bold">
                      <text x="105" y="40">↓</text>
                      <text x="85" y="170">↑</text>
                      <text x="40" y="115">→</text>
                      <text x="150" y="92">←</text>
                    </g>
                  </svg>

                  <div className="text-[10px] text-slate-500 font-mono text-center justify-self-end mt-1">
                    調試模式: HL-PLATFORM v4.0.2
                  </div>
                </div>
              </div>

              {/* Bot right button: 綁連結按鈕進入交控 (新增、修改、檢視) */}
              <button 
                onClick={() => setCabinetControlOpen(true)}
                className="mt-4 self-end bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer border border-emerald-500"
              >
                <span>🔗 綁定連結進入交控</span>
                <span className="text-[10px] text-emerald-100 font-normal">(新增、修改、檢視)</span>
              </button>
            </div>

            {/* Box 2: 號誌履歷資訊 */}
            <div className="bg-[#f0f9f4] border-2 border-[#ccebd6] rounded-xl p-5 shadow-xs flex flex-col relative min-h-[330px]">
              <div className="mb-3 flex items-start justify-between">
                <span className="bg-[#fff3b3] border border-[#f5df5d] text-slate-900 font-bold px-3 py-1 text-xs rounded shadow-xs select-none">
                  號誌履歷資訊
                </span>
                <span className="text-[10px] text-emerald-800 font-mono font-bold">
                  MAINTENANCE CONTRACT LOGS
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {/* Column left details: ◆ */}
                <div className="space-y-3.5 text-xs text-emerald-950 font-medium">
                  <div className="flex items-start gap-1">
                    <span className="text-emerald-600 font-bold shrink-0">◆</span>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">保固與合約責任狀態</span>
                      <span className={`inline-flex items-center gap-1 font-bold ${
                        targetIntersection.warranty === 'W_VALID' ? 'text-sky-700' : 'text-purple-700'
                      }`}>
                        {targetIntersection.warranty === 'W_VALID' ? '廠商保固合約期內 (W_VALID)' : '保固過期 / 委辦維護期 (W_EXPIRED)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1">
                    <span className="text-emerald-600 font-bold shrink-0">◆</span>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">專用通訊資費標準</span>
                      <span>
                        中華電信 5G 全時 VPN 交控專線
                        <br />
                        <strong className="text-slate-900 font-black">配合費: 月租 ${editTelecomFee} NTD</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1">
                    <span className="text-emerald-600 font-bold shrink-0">◆</span>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">建置與完工啟用日期</span>
                      <strong className="text-slate-800">{targetIntersection.installDate}</strong>
                    </div>
                  </div>
                </div>

                {/* Column right details: ◆ */}
                <div className="space-y-3.5 text-xs text-emerald-950 font-medium">
                  <div className="flex items-start gap-1">
                    <span className="text-emerald-600 font-bold shrink-0">◆</span>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">路口主底板晶片諸元</span>
                      <span className="font-mono text-slate-800 font-bold">
                        {targetIntersection.controllerType} Rev-C 主控板
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1">
                    <span className="text-emerald-600 font-bold shrink-0">◆</span>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">網路接取埠配置</span>
                      <span className="font-mono text-slate-800">
                        IP: {targetIntersection.ip}:{targetIntersection.port}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1">
                    <span className="text-emerald-600 font-bold shrink-0">◆</span>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">電子機櫃物理防護</span>
                      <span>IP55 散熱風扇與備用 1000VA UPS</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bot right button: 設定編輯 */}
              <button 
                onClick={() => setDetailEditOpen(true)}
                className="mt-4 self-end bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer border border-slate-600"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>⚙️ 設定編輯</span>
              </button>
            </div>

            {/* Box 3: 號誌時制資訊 */}
            <div className="bg-[#f0f9f4] border-2 border-[#ccebd6] rounded-xl p-5 shadow-xs flex flex-col relative min-h-[360px]">
              <div className="mb-3 flex items-start justify-between">
                <span className="bg-[#fff3b3] border border-[#f5df5d] text-slate-900 font-bold px-3 py-1 text-xs rounded shadow-xs select-none">
                  號誌時制資訊
                </span>
                <span className="text-[10px] text-emerald-800 font-mono font-bold">
                  SIGNAL TIMING CONTROL PLANS
                </span>
              </div>

              <div className="space-y-4 flex-1">
                {/* Table timing parameters: ◆ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-emerald-950 font-medium">
                  <div className="flex items-start gap-1">
                    <span className="text-emerald-600 font-bold shrink-0">◆</span>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">時段型態運行方式</span>
                      <span>
                        07:00-09:00 上班大尖峰計畫
                        <br />
                        09:00-17:00 常態平日離峰時制計畫
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1">
                    <span className="text-emerald-600 font-bold shrink-0">◆</span>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">時制計畫運行參數</span>
                      <span className="font-mono text-slate-800">
                        設定主週期: <strong>{targetIntersection.cycleTime} 秒</strong>
                        <br />
                        多時相組態: <strong>{targetIntersection.phaseCount} 個單獨時相</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timing configuration visual block */}
                <div className="bg-[#e2f3e8] border border-[#b8e2c7] rounded-lg p-3 space-y-3.5">
                  <div className="flex items-center justify-between text-emerald-900 font-bold text-[11px] mb-1">
                    <span>各時相秒數分配視覺分配圖</span>
                    <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded leading-none">
                      Active Cycle: {targetIntersection.cycleTime}s
                    </span>
                  </div>

                  {/* Horizontal visual colored line representing Phase timings */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                      <span>南北主向時相 (第 1、2 相段)</span>
                      <span className="font-mono">
                        綠燈 {editGreenA}s / 黃燈 {editYellowA}s / 紅燈 {editRedA}s
                      </span>
                    </div>
                    <div className="h-4.5 w-full bg-slate-200 rounded overflow-hidden flex shadow-inner border border-slate-300">
                      <div style={{ width: '60%' }} className="bg-emerald-600 flex items-center justify-center text-white text-[9px] font-bold">綠燈</div>
                      <div style={{ width: '15%' }} className="bg-amber-400 flex items-center justify-center text-amber-950 text-[9px] font-bold">黃燈</div>
                      <div style={{ width: '25%' }} className="bg-rose-600 flex items-center justify-center text-white text-[9px] font-bold">全紅</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                      <span>東西副向時相 (第 3、4 相段)</span>
                      <span className="font-mono">
                        綠燈 {editGreenB}s / 黃燈 {editYellowB}s / 紅燈 {editRedB}s
                      </span>
                    </div>
                    <div className="h-4.5 w-full bg-slate-200 rounded overflow-hidden flex shadow-inner border border-slate-300">
                      <div style={{ width: '50%' }} className="bg-emerald-600 flex items-center justify-center text-white text-[9px] font-bold">綠燈</div>
                      <div style={{ width: '15%' }} className="bg-amber-400 flex items-center justify-center text-amber-950 text-[9px] font-bold">黃燈</div>
                      <div style={{ width: '35%' }} className="bg-rose-600 flex items-center justify-center text-white text-[9px] font-bold">全紅</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bot right button: 綁連結按鈕進入交控 (新增、修改、檢視) */}
              <button 
                onClick={() => setTimingControlOpen(true)}
                className="mt-4 self-end bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer border border-emerald-500"
              >
                <span>🔗 綁定連結進入時制</span>
                <span className="text-[10px] text-emerald-100 font-normal">(新增、修改、檢視)</span>
              </button>
            </div>

          </div>

          {/* ==================== RIGHT COLUMN (Soft Cream Yellow Theme Boxes) ==================== */}
          <div className="space-y-5">
            
            {/* Box 4: 派工中案件 */}
            <div className="bg-[#fdf9f0] border-2 border-[#faebd0] rounded-xl p-5 shadow-xs flex flex-col relative min-h-[280px]">
              <div className="mb-3 flex items-start justify-between">
                <span className="bg-[#fff3b3] border border-[#f5df5d] text-slate-900 font-bold px-3 py-1 text-xs rounded shadow-xs select-none">
                  派工中案件
                </span>
                <span className="text-[10px] text-amber-800 font-mono font-bold">
                  ACTIVE CASE DISPATCHING
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-start">
                {targetIntersection.case ? (
                  <div className="bg-white border-2 border-amber-200/60 rounded-xl p-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8 bg-amber-500/10 rounded-full select-none pointer-events-none" />
                    
                    {/* Header line */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-amber-800 font-bold px-2 py-0.5 bg-amber-100 rounded border border-amber-200">
                          {targetIntersection.case.id}
                        </span>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                          targetIntersection.case.priority === '急件' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {targetIntersection.case.priority}
                        </span>
                      </div>

                      <span className="text-xs bg-amber-500 text-white font-extrabold px-2.5 py-0.5 rounded-full animate-pulse shadow-xs">
                        已派工 · 處理中
                      </span>
                    </div>

                    {/* Case Properties */}
                    <h5 className="font-black text-slate-900 text-sm mb-2">
                      {targetIntersection.case.title}
                    </h5>

                    <p className="text-[11px] text-slate-600 leading-normal mb-3 whitespace-pre-line bg-slate-50 p-2 rounded border border-slate-100">
                      {targetIntersection.case.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-slate-100 pt-2.5 text-slate-500">
                      <div>
                        <span>主要派遣工程師 / 班組:</span>
                        <span className="block font-bold text-slate-800">{targetIntersection.case.assignedTo}</span>
                      </div>
                      <div>
                        <span>限期完工時限:</span>
                        <span className="block font-mono text-slate-800 font-semibold">{targetIntersection.case.deadline}</span>
                      </div>
                    </div>

                    {/* Progress actions for dispatch mock workflow */}
                    <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex flex-wrap gap-2 justify-end">
                      <button 
                        onClick={() => handleSetDispatchStatus('已完工')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1 rounded shadow-xs cursor-pointer transition"
                      >
                        ✓ 標記完工
                      </button>
                      <button 
                        onClick={() => handleSetDispatchStatus('結案')}
                        className="bg-slate-600 hover:bg-slate-700 text-white font-bold text-[11px] px-3 py-1 rounded shadow-xs cursor-pointer transition"
                      >
                        ✕ 解除/結案
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-7 text-center rounded-xl border border-dashed border-amber-300 bg-amber-50/20 select-none">
                    <Activity className="w-8 h-8 text-amber-500/80 mb-2 animate-bounce" />
                    <p className="text-xs font-bold text-amber-900/80">
                      目前此路號誌無任何正在進行中的維修派工單。
                    </p>
                    <p className="text-[10px] text-amber-600 mt-1 max-w-xs">
                      路口感應遙測器回報 100% 在線。若現場回報故障，您可按下方按鈕快速建立指派工單。
                    </p>

                    {/* Action to add dispatch */}
                    <button 
                      onClick={() => setAddingCaseOpen(true)}
                      className="mt-3 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-black px-3 py-1.5 rounded shadow-sm cursor-pointer transition"
                    >
                      + 快速建立此路口派工案件
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Box 5: 維修歷程 */}
            <div className="bg-[#fdf9f0] border-2 border-[#faebd0] rounded-xl p-5 shadow-xs flex flex-col relative min-h-[440px]">
              <div className="mb-3 flex items-start justify-between border-b border-[#faebd0] pb-2">
                <span className="bg-[#fff3b3] border border-[#f5df5d] text-slate-900 font-bold px-3 py-1 text-xs rounded shadow-xs select-none">
                  維修歷程
                </span>
                <button
                  onClick={() => setAddingLogOpen(true)}
                  className="bg-amber-700 hover:bg-amber-800 text-white text-[10px] font-black px-2 py-1 rounded flex items-center gap-1 cursor-pointer transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>新增紀錄</span>
                </button>
              </div>

              {/* Timber chronological log feed list */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[460px]">
                {activeTimelineLogs.map((log, idx) => (
                  <div key={idx} className="bg-white border border-[#faebd0]/70 rounded-lg p-3 shadow-xs relative hover:border-amber-400 transition">
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-black bg-amber-100 text-amber-900 py-0.5 px-1.5 rounded leading-none">
                          {log.date}
                        </span>
                        <span className="text-[9px] bg-slate-100 text-slate-700 border border-slate-200 py-0.2 px-1 rounded-sm leading-none font-bold">
                          {log.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        負責：{log.engineer}
                      </span>
                    </div>

                    <h5 className="font-bold text-slate-900 text-xs mb-1">
                      {log.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      {log.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ==================================== MODALS INJECTIONS ==================================== */}

      {/* 1. Modal: Control Platform System iframe style simulation for road alignment (新增、修改、車道配置) */}
      {isCabinetControlOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500 w-3 h-3 rounded-full animate-pulse" />
                <h3 className="font-extrabold text-sm font-sans tracking-wide">
                  花蓮縣交控平台系統 - 線路車道配置器 (Junction Vector Configurator)
                </h3>
              </div>
              <button 
                onClick={() => setCabinetControlOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-emerald-50 text-emerald-950 p-3 rounded-lg text-xs leading-relaxed border border-emerald-100 mb-2">
                <strong>系統對應節點:</strong> 您當前正在檢視與重新編輯 <strong>{targetIntersection.id} - {targetIntersection.name}</strong> 的實體路口幾何車道配置。儲存後資訊將自動寫入平台伺服器中。
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                <div className="space-y-2.5">
                  <span className="text-slate-500 block text-[10px] uppercase font-black">南北向車道特性</span>
                  <div>
                    <label className="block mb-1 font-bold">南北向車道總數</label>
                    <select 
                      value={laneCountNS}
                      onChange={(e) => setLaneCountNS(Number(e.target.value))}
                      className="p-2 border border-slate-300 rounded bg-white w-full"
                    >
                      <option value={2}>2 車道 (單向一車道)</option>
                      <option value={3}>3 車道 (一側配左轉)</option>
                      <option value={4}>4 車道 (雙向雙車道)</option>
                      <option value={6}>6 車道 (大十字路段)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1">
                    <input 
                      type="checkbox" 
                      id="hasLeftNS"
                      checked={hasLeftTurnNS} 
                      onChange={(e) => setHasLeftTurnNS(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" 
                    />
                    <label htmlFor="hasLeftNS" className="cursor-pointer select-none">設置左轉專用待轉道</label>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <span className="text-slate-500 block text-[10px] uppercase font-black">東西向車道特性</span>
                  <div>
                    <label className="block mb-1 font-bold">東西向車道總數</label>
                    <select 
                      value={laneCountEW}
                      onChange={(e) => setLaneCountEW(Number(e.target.value))}
                      className="p-2 border border-slate-300 rounded bg-white w-full"
                    >
                      <option value={2}>2 車道 (單向一車道)</option>
                      <option value={3}>3 車道 (一側配左轉)</option>
                      <option value={4}>4 車道 (雙向雙車道)</option>
                      <option value={6}>6 車道 (大十字路段)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1">
                    <input 
                      type="checkbox" 
                      id="hasLeftEW"
                      checked={hasLeftTurnEW} 
                      onChange={(e) => setHasLeftTurnEW(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" 
                    />
                    <label htmlFor="hasLeftEW" className="cursor-pointer select-none">設置左轉專用待轉道</label>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="block text-[10px] uppercase text-slate-500 font-extrabold mb-1.5">路口排面示意向量預覽</span>
                <div className="flex justify-center items-center gap-4 py-2 border-t border-slate-100">
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded font-bold">N-S: {laneCountNS} Lanes</span>
                  <span className="text-slate-400">⚡</span>
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded font-bold">E-W: {laneCountEW} Lanes</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
              <button 
                onClick={() => setCabinetControlOpen(false)}
                className="bg-slate-500 hover:bg-slate-600 text-white font-bold text-xs py-2 px-4 rounded transition cursor-pointer"
              >
                取消
              </button>
              <button 
                onClick={() => setCabinetControlOpen(false)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2 px-4 rounded transition cursor-pointer shadow-sm"
              >
                確認更新路口配置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: Setup Editor Dialog (設定編輯) */}
      {isDetailEditOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleSpecsSaveSubmit}
            className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="bg-slate-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-400 animate-spin" />
                <h3 className="font-extrabold text-sm font-sans tracking-wide">
                  編輯號誌實體屬性與合約設定 ({targetIntersection.id})
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setDetailEditOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-500 text-[10px] uppercase">控制晶片底板型號</label>
                  <select
                    value={editController}
                    onChange={(e) => setEditController(e.target.value as any)}
                    className="p-2 border border-slate-300 rounded bg-white w-full outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="MGC-3100">MGC-3100 (旗艦型微電腦)</option>
                    <option value="ITC-2000">ITC-2000 (智慧型主板)</option>
                    <option value="TC-800">TC-800 (基礎型控制核心)</option>
                    <option value="NTCIP-90">NTCIP-90 (標準NTCIP協定板)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-500 text-[10px] uppercase">保固與合約責任狀態</label>
                  <select
                    value={editWarranty}
                    onChange={(e) => setEditWarranty(e.target.value as any)}
                    className="p-2 border border-slate-300 rounded bg-white w-full outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="W_VALID">廠商保固合約內 (W_VALID)</option>
                    <option value="W_EXPIRED">保固已屆期 (W_EXPIRED)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-500 text-[10px] uppercase">實體連線 IP 遮罩</label>
                  <input 
                    type="text" 
                    value={editIP}
                    onChange={(e) => setEditIP(e.target.value)}
                    className="p-2 border border-slate-300 rounded bg-white w-full font-mono font-bold" 
                    required 
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-500 text-[10px] uppercase">通訊協定 Port 號</label>
                  <input 
                    type="number" 
                    value={editPort}
                    onChange={(e) => setEditPort(Number(e.target.value))}
                    className="p-2 border border-slate-300 rounded bg-white w-full font-mono font-bold" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-500 text-[10px] uppercase">建置完工啟用日期</label>
                  <input 
                    type="date" 
                    value={editInstallDate}
                    onChange={(e) => setEditInstallDate(e.target.value)}
                    className="p-2 border border-slate-300 rounded bg-white w-full" 
                    required 
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-500 text-[10px] uppercase">配合通訊月租費 (NTD / 月)</label>
                  <input 
                    type="number" 
                    value={editTelecomFee}
                    onChange={(e) => setEditTelecomFee(Number(e.target.value))}
                    className="p-2 border border-slate-300 rounded bg-white w-full font-bold text-slate-800" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-500 text-[10px] uppercase">控制櫃物理規格備註</label>
                <input 
                  type="text" 
                  value={editCabinetSpec}
                  onChange={(e) => setEditCabinetSpec(e.target.value)}
                  className="p-2 border border-slate-300 rounded bg-white w-full" 
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
              <button 
                type="button"
                onClick={() => setDetailEditOpen(false)}
                className="bg-slate-500 hover:bg-slate-600 text-white font-bold text-xs py-2 px-4 rounded transition cursor-pointer"
              >
                取消
              </button>
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2 px-4 rounded transition cursor-pointer shadow-sm"
              >
                儲存硬體設定屬性
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Modal: Timing Configuration Edit Platform (號誌時制計時與計畫設定) */}
      {isTimingControlOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-indigo-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400 rotate-90" />
                <h3 className="font-extrabold text-sm font-sans tracking-wide">
                  花蓮縣交控平台 - 進階時制配時計畫設計面板
                </h3>
              </div>
              <button 
                onClick={() => setTimingControlOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-semibold text-slate-700">
              <div className="bg-indigo-50 text-indigo-950 p-3 rounded-lg text-xs leading-relaxed border border-indigo-100">
                <strong>即時互鎖防護機制 (Safety Interlock Active):</strong>
                <br />
                設定時請確保黃燈時間不低於 3秒，全紅時間不低於 2秒，以符合國家法定道路路口號誌運轉清空標準。
              </div>

              {/* Timing Plan variables sliders */}
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">A 時相段 (南北主道路流量對應)</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400">綠燈(Green) 秒數</label>
                      <input 
                        type="number" 
                        value={editGreenA} 
                        onChange={(e) => setEditGreenA(Math.max(5, Number(e.target.value)))}
                        className="p-1.5 border border-slate-300 rounded w-full font-bold font-mono bg-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400">黃燈(Yellow) 秒數</label>
                      <input 
                        type="number" 
                        value={editYellowA} 
                        onChange={(e) => setEditYellowA(Math.max(1, Number(e.target.value)))}
                        className="p-1.5 border border-slate-300 rounded w-full font-bold font-mono bg-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400">全紅(All-Red) 秒數</label>
                      <input 
                        type="number" 
                        value={editRedA} 
                        onChange={(e) => setEditRedA(Math.max(0, Number(e.target.value)))}
                        className="p-1.5 border border-slate-300 rounded w-full font-bold font-mono bg-white" 
                      />
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">B 時相段 (東西副道路流量對應)</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400">綠燈(Green) 秒數</label>
                      <input 
                        type="number" 
                        value={editGreenB} 
                        onChange={(e) => setEditGreenB(Math.max(5, Number(e.target.value)))}
                        className="p-1.5 border border-slate-300 rounded w-full font-bold font-mono bg-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400">黃燈(Yellow) 秒數</label>
                      <input 
                        type="number" 
                        value={editYellowB} 
                        onChange={(e) => setEditYellowB(Math.max(1, Number(e.target.value)))}
                        className="p-1.5 border border-slate-300 rounded w-full font-bold font-mono bg-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400">全紅(All-Red) 秒數</label>
                      <input 
                        type="number" 
                        value={editRedB} 
                        onChange={(e) => setEditRedB(Math.max(0, Number(e.target.value)))}
                        className="p-1.5 border border-slate-300 rounded w-full font-bold font-mono bg-white" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Total cycle time counter */}
              <div className="bg-slate-900 text-emerald-400 text-center py-2.5 rounded-lg border border-slate-800 font-mono text-sm shadow-inner flex items-center justify-center gap-2">
                <span>計算所得時制計畫總週期路口週期 (ACT_CYCLE) = </span>
                <strong className="text-white text-base underline font-black">
                  {editGreenA + editYellowA + editRedA + editGreenB + editYellowB + editRedB} 秒
                </strong>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
              <button 
                onClick={() => setTimingControlOpen(false)}
                className="bg-slate-500 hover:bg-slate-600 text-white font-bold text-xs py-2 px-4 rounded transition cursor-pointer"
              >
                取消
              </button>
              <button 
                onClick={handleTimingPlanSave}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2 px-4 rounded transition cursor-pointer shadow-sm"
              >
                儲存時制並寫入控制器
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: Create Dispatch (快速指派工單) */}
      {isAddingCaseOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleQuickDispatchCase}
            className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="bg-amber-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-white" />
                <h3 className="font-black text-sm tracking-wide">
                  在線路口故障快速立案指派 ─ {targetIntersection.id}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setAddingCaseOpen(false)}
                className="text-amber-100 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1 font-bold text-slate-500 text-[10px] uppercase">工單標題/主題</label>
                <input 
                  type="text" 
                  value={caseTitle} 
                  onChange={(e) => setCaseTitle(e.target.value)}
                  placeholder="例如: 門口控制器模組過熱黑屏或燈頭透鏡碎裂更換"
                  className="p-2 border border-slate-300 rounded bg-white w-full text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-500 text-[10px] uppercase">問題故障大分類</label>
                  <select
                    value={caseType}
                    onChange={(e) => setCaseType(e.target.value as any)}
                    className="p-2 border border-slate-300 rounded bg-white w-full outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="設備故障">設備故障</option>
                    <option value="號誌故障">號誌故障</option>
                    <option value="線路損壞">線路損壞</option>
                    <option value="定期保養">定期保養</option>
                    <option value="路口調整">路口調整</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-500 text-[10px] uppercase">急迫度優先權</label>
                  <select
                    value={casePriority}
                    onChange={(e) => setCasePriority(e.target.value as any)}
                    className="p-2 border border-slate-300 rounded bg-white w-full outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="急件">🔥 急件 (2HR搶通)</option>
                    <option value="普通">普通 (當日完工)</option>
                    <option value="一般">一般 (定期維修)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-500 text-[10px] uppercase">故障詳細原因描述與報案管道</label>
                <textarea 
                  value={caseDesc} 
                  onChange={(e) => setCaseDesc(e.target.value)}
                  placeholder="報修詳情，包含主要問題。例如: 1999 通報中山路與國聯一路口南向號誌不亮，請前往查修是否保險絲熔斷。"
                  className="p-2 border border-slate-300 rounded bg-white w-full h-24 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-500 text-[10px] uppercase">指派現場工程人員/小組</label>
                <input 
                  type="text" 
                  value={caseAssignee} 
                  onChange={(e) => setCaseAssignee(e.target.value)}
                  className="p-2 border border-slate-300 rounded bg-white w-full"
                  required
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
              <button 
                type="button"
                onClick={() => setAddingCaseOpen(false)}
                className="bg-slate-500 hover:bg-slate-600 text-white font-bold text-xs py-2 px-4 rounded transition cursor-pointer"
              >
                取消
              </button>
              <button 
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs py-2 px-4 rounded transition cursor-pointer shadow-sm"
              >
                完成立案並發送派工通知碼
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. Modal: Add Maintenance Log Entry (新增檢修歷程紀錄) */}
      {isAddingLogOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleAddLogSubmit}
            className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="bg-amber-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-200" />
                <h3 className="font-extrabold text-sm font-sans tracking-wide">
                  新增路口歷史維修與定檢事件紀錄
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setAddingLogOpen(false)}
                className="text-amber-100 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-500 text-[10px] uppercase">檢修事件發生日期</label>
                  <input 
                    type="date" 
                    value={newLogDate} 
                    onChange={(e) => setNewLogDate(e.target.value)}
                    className="p-2 border border-slate-300 rounded bg-white w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-500 text-[10px] uppercase">工程事件分類</label>
                  <select
                    value={newLogType}
                    onChange={(e) => setNewLogType(e.target.value)}
                    className="p-2 border border-slate-300 rounded bg-white w-full outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="定期查護">定期查護</option>
                    <option value="案件修復">案件修復</option>
                    <option value="硬體汰換">硬體汰換</option>
                    <option value="韌體升級">韌體升級</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-500 text-[10px] uppercase">事件標題/主題</label>
                <input 
                  type="text" 
                  value={newLogTitle} 
                  onChange={(e) => setNewLogTitle(e.target.value)}
                  placeholder="例如: 第四季度主變壓避雷器更新工程"
                  className="p-2 border border-slate-300 rounded bg-white w-full text-slate-950 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-500 text-[10px] uppercase">檢修作業詳情/施作詳情</label>
                <textarea 
                  value={newLogContent} 
                  onChange={(e) => setNewLogContent(e.target.value)}
                  placeholder="請列述更換耗材型號、施作人員等具體細節..."
                  className="p-2 border border-slate-300 rounded bg-white w-full h-24 text-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-500 text-[10px] uppercase">施作責任人 / 維護廠商單位</label>
                <input 
                  type="text" 
                  value={newLogEngineer} 
                  onChange={(e) => setNewLogEngineer(e.target.value)}
                  className="p-2 border border-slate-300 rounded bg-white w-full"
                  required
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
              <button 
                type="button"
                onClick={() => setAddingLogOpen(false)}
                className="bg-slate-500 hover:bg-slate-600 text-white font-bold text-xs py-2 px-4 rounded transition cursor-pointer"
              >
                取消
              </button>
              <button 
                type="submit"
                className="bg-amber-700 hover:bg-amber-800 text-white font-black text-xs py-2 px-4 rounded transition cursor-pointer shadow-sm"
              >
                儲存至維修歷程軌跡
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
