/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MainTab, Intersection, DispatchCase, AppNotification, NotificationSettings, Contract, SystemUser, UserRole } from './types';
import { hualienIntersections as initialIntersections, dashboardStats } from './data';
import SidebarList from './components/SidebarList';
import MapCanvas from './components/MapCanvas';
import CaseManagementView from './components/CaseManagementView';
import DocumentGeneratorView from './components/DocumentGeneratorView';
import ContractManagementView from './components/ContractManagementView';
import SignalHistoryView from './components/SignalHistoryView';
import StatsDashboardView from './components/StatsDashboardView';
import IntersectionElementsView from './components/IntersectionElementsView';
import UserPermissionManagerView from './components/UserPermissionManagerView';
import NotificationCenter from './components/NotificationCenter';
import NotificationToast from './components/NotificationToast';
import { playChime } from './utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import { Map, Wrench, FileText, ClipboardList, BarChart3, Clock, User, LogOut, CheckCircle2, ChevronRight, HelpCircle, Briefcase, Database, ShieldAlert, Lock, Shield } from 'lucide-react';

export default function App() {
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  
  // Entire intersections database state
  const [intersections, setIntersections] = useState<Intersection[]>(initialIntersections);
  
  // Contracts list state with initial values matching the PDF
  const [contracts, setContracts] = useState<Contract[]>([
    {
      id: 'CONTRACT-114-001',
      name: '114-115年度花蓮縣交通號誌增設及維護工程(含代養省道交通號誌)(開口契約)',
      type: '開口契約',
      partyA: '花蓮縣政府',
      partyB: '大亞交通號誌工程股份有限公司',
      startDate: '2025-01-01',
      endDate: '2026-12-31',
      totalAmount: 13000000,
      budgets: {
        engineering: 10837693,
        safety: 270846,
        quality: 264403,
        profit: 975670,
        insurance: 32340,
        tax: 619048
      },
      settledAmount: 45000, // starting with completed CASE-003 included
      status: '履約中',
      attachedFiles: [
        {
          id: 'file-1',
          name: '114-115契約主文電子檔.pdf',
          size: '1.8 MB',
          uploadTime: '2025-01-05 09:30'
        },
        {
          id: 'file-2',
          name: '核定詳細價目表[契約].xlsx',
          size: '4.2 MB',
          uploadTime: '2025-01-05 09:45'
        }
      ]
    },
    {
      id: 'CONTRACT-113-005',
      name: '113年度吉安鄉智慧路口及有聲號誌改善工程契約',
      type: '一般總包',
      partyA: '花蓮縣政府',
      partyB: '聯立交通控制工程處',
      startDate: '2024-01-15',
      endDate: '2024-11-30',
      totalAmount: 3500000,
      budgets: {
        engineering: 2900000,
        safety: 80000,
        quality: 70000,
        profit: 250000,
        insurance: 10000,
        tax: 190000
      },
      settledAmount: 3500000,
      status: '已結案',
      attachedFiles: [
        {
          id: 'file-3',
          name: '驗收合格結算證書.pdf',
          size: '0.9 MB',
          uploadTime: '2024-12-05 13:15'
        }
      ]
    },
    {
      id: 'CONTRACT-112-018',
      name: '112-113年度壽豐鄉及鳳林鎮號誌緊急搶修開口契約',
      type: '開口契約',
      partyA: '花蓮縣政府',
      partyB: '振新機電有限公司',
      startDate: '2023-03-01',
      endDate: '2024-03-01',
      totalAmount: 5000000,
      budgets: {
        engineering: 4150000,
        safety: 110000,
        quality: 100000,
        profit: 380500,
        insurance: 12500,
        tax: 247000
      },
      settledAmount: 4890000,
      status: '已結案',
      attachedFiles: []
    }
  ]);
  
  // Selected single intersection
  const [selectedIntersection, setSelectedIntersection] = useState<Intersection | null>(null);

  // System users state database (RBAC)
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([
    {
      id: 'usr-engineer',
      name: '張技師 (juichun)',
      email: 'juichun@gcs.ceci.com.tw',
      role: 'ENGINEER',
      roleName: '運維工程師',
      department: '中興工程顧問交控維修課',
      avatarColor: 'bg-emerald-600',
      permissions: {
        canEditIntersections: true,
        canManageCases: true,
        canManageContracts: true,
        canEditSurveyElements: true,
        canApproveSurvey: false,
        canManageSystemUsers: false,
      }
    },
    {
      id: 'usr-admin',
      name: '陳管理 (Admin)',
      email: 'admin_hualien@ceci.org.tw',
      role: 'ADMIN',
      roleName: '系統管理員',
      department: '花蓮縣交通號誌管理科',
      avatarColor: 'bg-indigo-600',
      permissions: {
        canEditIntersections: true,
        canManageCases: true,
        canManageContracts: true,
        canEditSurveyElements: true,
        canApproveSurvey: true,
        canManageSystemUsers: true,
      }
    },
    {
      id: 'usr-supervisor',
      name: '林處長 (Supervisor)',
      email: 'director_lin@hl.gov.tw',
      role: 'SUPERVISOR',
      roleName: '稽核/處長主管',
      department: '花蓮縣政府建設處交通科',
      avatarColor: 'bg-rose-600',
      permissions: {
        canEditIntersections: true,
        canManageCases: false,
        canManageContracts: false,
        canEditSurveyElements: true,
        canApproveSurvey: true,
        canManageSystemUsers: false,
      }
    },
    {
      id: 'usr-surveyor',
      name: '李普查 (Surveyor)',
      email: 'surveyor_lee@da_ya.com.tw',
      role: 'SURVEYOR',
      roleName: '現場普查員',
      department: '大亞號誌工程普查小組',
      avatarColor: 'bg-amber-600',
      permissions: {
        canEditIntersections: false,
        canManageCases: false,
        canManageContracts: false,
        canEditSurveyElements: true,
        canApproveSurvey: false,
        canManageSystemUsers: false,
      }
    }
  ]);

  // Track the active user logged into the system
  const [currentUser, setCurrentUser] = useState<SystemUser>(systemUsers[0]);

  // Connection/Status toggled layer switches
  const [activeLayers, setActiveLayers] = useState({
    connection: true,
    warranty: true,
    cases: true
  });

  // Current local time simulation clock
  const [currentTime, setCurrentTime] = useState('');

  // Initial Notification Preferences Settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    soundEnabled: true,
    audioTone: 'bell',
    districts: [], // empty means receive all
    triggerDispatchAssigned: true,
    triggerStatusChanged: true,
    triggerCriticalAlert: true,
    minSeverity: 'info'
  });

  // Notifications Feed state
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-init-1',
      title: '系統監控開始運作',
      message: '花蓮縣號誌運維管控通報系統已開啟，即時通聯與保固模組運作中。',
      type: 'critical_alert',
      severity: 'info',
      timestamp: '08:30',
      read: true,
    },
    {
      id: 'notif-init-2',
      title: '號誌通訊逾時超時警訊',
      message: '系統遙測到中山路與國聯一路口 (TC01) 動態通訊異常，當前連線逾時 (E_TIMEOUT)。已聯動在線工單進行查驗。',
      type: 'status_changed',
      severity: 'warn',
      timestamp: '08:32',
      read: false,
      intersectionId: 'TC01'
    }
  ]);

  useEffect(() => {
    // Establish a live ticking clock to simulate professional SCC operations room environments
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('zh-TW', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Pre-load default junction on startup to guide operations immediately
  useEffect(() => {
    if (intersections.length > 0) {
      setSelectedIntersection(intersections[0]);
    }
  }, []);

  // User Permission Administration Callbacks
  const handleUpdateUserPermissions = (userId: string, updatedPermissions: SystemUser['permissions']) => {
    setSystemUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = { ...u, permissions: updatedPermissions };
        if (currentUser.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole, newRoleName: string) => {
    setSystemUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = { ...u, role: newRole, roleName: newRoleName };
        if (currentUser.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));
  };

  const handleChangeActiveUser = (userId: string) => {
    const target = systemUsers.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  const handleAddSystemUser = (newUser: SystemUser) => {
    setSystemUsers(prev => [...prev, newUser]);
  };

  const handleDeleteSystemUser = (userId: string) => {
    setSystemUsers(prev => prev.filter(u => u.id !== userId));
  };

  // Trigger sound feed and push alerts
  const addNotification = (
    title: string,
    message: string,
    type: AppNotification['type'],
    severity: AppNotification['severity'],
    intersectionId?: string
  ) => {
    const freshNotifId = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const nowTime = new Date().toLocaleTimeString('zh-TW', { hour12: false }).slice(0, 5);
    
    const newNotif: AppNotification = {
      id: freshNotifId,
      title,
      message,
      type,
      severity,
      timestamp: nowTime,
      read: false,
      intersectionId
    };

    // Calculate if it qualifies for filter & chime ring
    let allowChime = notificationSettings.soundEnabled;
    
    // Severity level ceiling checks
    const prios = { info: 0, warn: 1, critical: 2 };
    if (prios[severity] < prios[notificationSettings.minSeverity]) {
      allowChime = false;
    }

    // Trigger types enabled checks
    if (type === 'dispatch_assigned' && !notificationSettings.triggerDispatchAssigned) allowChime = false;
    if (type === 'status_changed' && !notificationSettings.triggerStatusChanged) allowChime = false;
    if (type === 'critical_alert' && !notificationSettings.triggerCriticalAlert) allowChime = false;

    // District filters checks
    if (intersectionId && notificationSettings.districts.length > 0) {
      const matchJunction = intersections.find(item => item.id === intersectionId);
      if (matchJunction && !notificationSettings.districts.includes(matchJunction.district)) {
        allowChime = false;
        // Don't append notification if district is filtered out
        return;
      }
    }

    if (allowChime) {
      playChime(notificationSettings.audioTone);
    }

    setNotifications(prev => [newNotif, ...prev]);
  };

  // Automated background simulated connection fluctuating chimes
  useEffect(() => {
    const bgTimer = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.3) {
        // Find a random online item to go timeout
        const onlines = intersections.filter(i => i.status === 'E_ONLINE');
        if (onlines.length > 5) {
          const sample = onlines[Math.floor(Math.random() * onlines.length)];
          setIntersections(prev => prev.map(item => item.id === sample.id ? { ...item, status: 'E_TIMEOUT' } : item));
          addNotification(
            '即時遙測: 號誌連線品質波動跳轉',
            `遙修巡檢機制檢測到 ${sample.district} 轄區路口 [${sample.id}] ${sample.name} 當前通訊連線品質超時跌落（E_TIMEOUT），請派遣調度留意信號完整性。`,
            'status_changed',
            'warn',
            sample.id
          );
        }
      } else if (rand > 0.8) {
        // Find a timeout item to recover online
        const timeoutIntersections = intersections.filter(i => i.status === 'E_TIMEOUT');
        if (timeoutIntersections.length > 0) {
          const sample = timeoutIntersections[Math.floor(Math.random() * timeoutIntersections.length)];
          // Only touch dynamic nodes, skip TC01 which is pinned for initial work task testing and analysis
          if (sample.id !== 'TC01') {
            setIntersections(prev => prev.map(item => item.id === sample.id ? { ...item, status: 'E_ONLINE' } : item));
            addNotification(
              '即時遙測: 號誌通訊恢復正常',
              `各機房巡點感應機制顯示 [${sample.id}] ${sample.name} 通訊光纖信號已恢復順暢通聯，連線狀態調整回 在線 (E_ONLINE)。`,
              'status_changed',
              'info',
              sample.id
            );
          }
        }
      }
    }, 120000); // Check every 2 minutes
    return () => clearInterval(bgTimer);
  }, [intersections, notificationSettings]);

  // Performs simulation drills anomalies from side preference panel
  const handleSimulateEvent = (type: 'status_change' | 'dispatch' | 'critical') => {
    if (type === 'status_change') {
      const onlines = intersections.filter(i => i.status === 'E_ONLINE');
      const target = onlines.length > 0 
        ? onlines[Math.floor(Math.random() * onlines.length)] 
        : intersections[Math.floor(Math.random() * intersections.length)];
      
      setIntersections(prev => prev.map(item => {
        if (item.id === target.id) {
          return { ...item, status: 'E_TIMEOUT' };
        }
        return item;
      }));

      addNotification(
        '號誌通訊段線警報 (Simulated)',
        `系統即時心跳監控發覺 ${target.district} 地區路口 [${target.id}] ${target.name} 交控線路連動丟失，狀態警示升為連線逾時（E_TIMEOUT）。`,
        'status_changed',
        'warn',
        target.id
      );
    } else if (type === 'dispatch') {
      // Pick a random intersection
      const availableNode = intersections[Math.floor(Math.random() * intersections.length)];
      const randomCaseId = `CASE-SIM-${Math.floor(Math.random() * 9000) + 1000}`;
      
      const nextCase: DispatchCase = {
        id: randomCaseId,
        title: `${availableNode.id} 故障控制器電容器抽換及重置施工`,
        type: '設備故障',
        status: '待派工',
        priority: Math.random() > 0.4 ? '急件' : '普通',
        assignedTo: '陳大華 (工程師一組)',
        reportTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
        deadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 16),
        description: '後台巡點警訊通報，路口微控制器電容負載發生異常高溫溫升，需要即刻前往更換重置，避免號誌完全死機黑屏。',
        logs: [
          {
            time: new Date().toLocaleTimeString('zh-TW', { hour12: false }).slice(0, 5),
            action: '後台遙測高溫溫升立案通報',
            user: '監控中心'
          }
        ]
      };

      handleUpdateIntersectionCase(availableNode.id, nextCase);
    } else if (type === 'critical') {
      const target = intersections[Math.floor(Math.random() * intersections.length)];
      addNotification(
        '雙向電力供應突波重度熔斷警報 (Simulated)',
        `供電網絡即時感應器警報：${target.district} 的路口 [${target.id}] ${target.name} 遭受電力供電突波衝擊，主變壓器熔斷絲斷路，控制器緊急使用備份用蓄電池供電運轉！請搶修隊30分鐘內前往。`,
        'critical_alert',
        'critical',
        target.id
      );
    }
  };

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleLocateIntersection = (intersectionId: string) => {
    const item = intersections.find(i => i.id === intersectionId);
    if (item) {
      handleSelectIntersection(item);
      setActiveTab('home');
    }
  };

  const handleDismissToast = (id: string) => {
    handleMarkRead(id);
  };

  // Toggle individual map layers (動態及連線、保固及過保、派工案件)
  const handleToggleLayer = (layer: 'connection' | 'warranty' | 'cases') => {
    setActiveLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  // Callback to select intersection from sidebar or map pins
  const handleSelectIntersection = (intersection: Intersection) => {
    // Find freshest state from local list array
    const freshData = intersections.find(i => i.id === intersection.id) || intersection;
    setSelectedIntersection(freshData);
  };

  // Callback triggered when selecting an intersection to automatically switch to the corresponding tab/interface
  const handleAutoSwitchTab = (tab: MainTab) => {
    setActiveTab(tab);
  };

  // Callback to insert/update in-memory dispatch case
  const handleUpdateIntersectionCase = (intersectionId: string, newCase: DispatchCase | undefined) => {
    const targetJunction = intersections.find(i => i.id === intersectionId);
    const junctionName = targetJunction?.name || '未知路口';
    const districtName = targetJunction?.district || '花蓮縣';

    setIntersections(prevList => {
      const newList = prevList.map(item => {
        if (item.id === intersectionId) {
          return {
            ...item,
            caseStatus: newCase ? (newCase.status === '待派工' ? 'C_PENDING' : newCase.status === '處理中' ? 'C_ING' : 'C_DONE') : 'C_NONE',
            case: newCase
          };
        }
        return item;
      });

      // Maintain selection sync with updated data
      const updatedSelect = newList.find(i => i.id === intersectionId);
      if (updatedSelect && selectedIntersection?.id === intersectionId) {
        setSelectedIntersection(updatedSelect);
      }

      return newList;
    });

    if (newCase === undefined) {
      addNotification(
        '派工工單手動完結案件',
        `路口 [${intersectionId}] ${junctionName} 案件警報故障狀態已手動解除消除。工單結案。`,
        'status_changed',
        'info',
        intersectionId
      );
    } else {
      const oldCase = targetJunction?.case;
      if (!oldCase) {
        addNotification(
          '新增號誌工程派工單指派',
          `系統已成功立案派遣工單 [${newCase.id}]: "${newCase.title}"。\n組別：${newCase.assignedTo}\n緊急度：【${newCase.priority}】\n限期：${newCase.deadline}前。`,
          'dispatch_assigned',
          newCase.priority === '急件' ? 'critical' : 'info',
          intersectionId
        );
      } else if (oldCase.status !== newCase.status) {
        addNotification(
          '交控號誌工單狀態變更通知',
          `路口 [${intersectionId}] 責任工單 "${newCase.title}" 的進度已異動更新為：【${newCase.status}】。`,
          'status_changed',
          newCase.status === '已完工' ? 'info' : 'warn',
          intersectionId
        );
      }
    }
  };

  // Update other dynamic properties for intersections (e.g. settings edits, timing plans)
  const handleUpdateIntersectionDetails = (id: string, updatedParams: Partial<Intersection>) => {
    setIntersections(prev => prev.map(item => {
      if (item.id === id) {
        const fresh = { ...item, ...updatedParams };
        if (selectedIntersection?.id === id) {
          setSelectedIntersection(fresh);
        }
        return fresh;
      }
      return item;
    }));

    // Trigger notification to simulate system update
    if (updatedParams.cycleTime) {
      addNotification(
        '時制體系變更完成',
        `路口 [${id}] 號誌時序計畫已手動更新：設定週期調整為 ${updatedParams.cycleTime} 秒。`,
        'status_changed',
        'info',
        id
      );
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-50 text-slate-800 font-sans overflow-hidden select-none">
      
      {/* Top Header Navigation */}
      <header className="h-16 bg-blue-700 text-white flex items-center justify-between px-6 shadow-md z-20 sticky top-0 shrink-0">
        
        {/* Brand Name Logotype */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-700 shadow-sm shrink-0">
            <Map className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span>花蓮縣派工管理系統</span>
              <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                <span>系統運作中</span>
              </span>
            </h1>
          </div>
        </div>

        {/* Five Functional Navigation buttons (首頁、案件管理、文件產製、號誌履歷、統計資訊) */}
        <nav className="flex gap-1">
          
          {/* Tab 1: 首頁 (Home Map) */}
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-2 font-medium text-sm rounded transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'home'
                ? 'bg-blue-800 text-white border-b-2 border-white'
                : 'text-white/80 hover:bg-blue-600 hover:text-white'
            }`}
            id="nav_btn_home"
          >
            <Map className="w-4 h-4" />
            <span>首頁</span>
          </button>

          {/* Tab 2: 案件管理 (Case Management) */}
          <button
            onClick={() => setActiveTab('case')}
            className={`px-4 py-2 font-medium text-sm rounded transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'case'
                ? 'bg-blue-800 text-white border-b-2 border-white'
                : 'text-white/80 hover:bg-blue-600 hover:text-white'
            }`}
            id="nav_btn_case"
          >
            <Wrench className="w-4 h-4" />
            <span>案件管理</span>
          </button>

          {/* Tab 3: 文件產製 (Document Generation) */}
          <button
            onClick={() => setActiveTab('document')}
            className={`px-4 py-2 font-medium text-sm rounded transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'document'
                ? 'bg-blue-800 text-white border-b-2 border-white'
                : 'text-white/80 hover:bg-blue-600 hover:text-white'
            }`}
            id="nav_btn_document"
          >
            <FileText className="w-4 h-4" />
            <span>文件產製</span>
          </button>

          {/* Tab 4: 號誌履歷 (Traffic Signal History) */}
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-medium text-sm rounded transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-blue-800 text-white border-b-2 border-white'
                : 'text-white/80 hover:bg-blue-600 hover:text-white'
            }`}
            id="nav_btn_history"
          >
            <ClipboardList className="w-4 h-4" />
            <span>號誌履歷</span>
          </button>

          {/* Tab 5: 統計資訊 (Statistical Information) */}
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 font-medium text-sm rounded transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-blue-800 text-white border-b-2 border-white'
                : 'text-white/80 hover:bg-blue-600 hover:text-white'
            }`}
            id="nav_btn_stats"
          >
            <BarChart3 className="w-4 h-4" />
            <span>統計資訊</span>
          </button>

          {/* Tab 6: 合約管理 (Contract Management) */}
          <button
            onClick={() => setActiveTab('contract')}
            className={`px-4 py-2 font-medium text-sm rounded transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'contract'
                ? 'bg-blue-800 text-white border-b-2 border-white'
                : 'text-white/80 hover:bg-blue-600 hover:text-white'
            }`}
            id="nav_btn_contract"
          >
            <Briefcase className="w-4 h-4" />
            <span>合約管理</span>
          </button>

          {/* Tab 7: 路口諸元管理 (Intersection Elements) */}
          <button
            onClick={() => setActiveTab('elements')}
            className={`px-4 py-2 font-medium text-sm rounded transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'elements'
                ? 'bg-blue-800 text-white border-b-2 border-white'
                : 'text-white/80 hover:bg-blue-600 hover:text-white'
            }`}
            id="nav_btn_elements"
          >
            <Database className="w-4 h-4 text-emerald-300" />
            <span>路口諸元管理</span>
          </button>

          {/* Tab 8: 使用者權限管理 (User Permission Management) */}
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium text-sm rounded transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-blue-800 text-white border-b-2 border-white'
                : 'text-white/80 hover:bg-blue-600 hover:text-white'
            }`}
            id="nav_btn_users"
          >
            <Shield className="w-4 h-4 text-indigo-300 animate-pulse" />
            <span>權限與使用者</span>
          </button>

        </nav>

        {/* User Identity, Live Time info, and Notification Center bell */}
        <div className="flex items-center gap-4 text-sm font-medium">
          <NotificationCenter
            notifications={notifications}
            settings={notificationSettings}
            intersections={intersections}
            onUpdateSettings={setNotificationSettings}
            onClearAll={handleClearAll}
            onMarkAllRead={handleMarkAllRead}
            onMarkRead={handleMarkRead}
            onLocateIntersection={handleLocateIntersection}
            onSimulateEvent={handleSimulateEvent}
          />
          
          <div className="hidden xl:block text-sm opacity-90 text-right select-none">
            <p className="font-extrabold text-white flex items-center gap-1 text-right justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{currentUser.name}</span>
            </p>
            <p className="text-[10px] text-white/70 font-mono text-right">{currentUser.email}</p>
          </div>
          
          <div className={`hidden sm:flex w-10 h-10 rounded-full ${currentUser.avatarColor || 'bg-blue-500'} border-2 border-white/60 items-center justify-center text-white shrink-0 shadow-sm select-none font-black text-xs`}>
            {currentUser.name.charAt(0)}
          </div>
        </div>

      </header>

      {/* Main Content Body */}
      <div className="flex-1 w-full flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Sidebar (1/5) */}
        <aside className="w-full lg:w-[280px] xl:w-[350px] bg-white border-r border-slate-200 flex flex-col shadow-sm shrink-0 h-[400px] lg:h-full">
          <SidebarList
            intersections={intersections}
            selectedIntersection={selectedIntersection}
            onSelectIntersection={handleSelectIntersection}
            onAutoSwitchTab={handleAutoSwitchTab}
          />
        </aside>

        {/* Right Map/Workspace View (4/5) */}
        <main className="flex-1 h-full min-w-0 relative bg-slate-50 overflow-hidden">
          <AnimatePresence mode="wait">
            
            {activeTab === 'home' && (
              <motion.div
                key="home-tab"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                <MapCanvas
                  intersections={intersections}
                  selectedIntersection={selectedIntersection}
                  onSelectIntersection={handleSelectIntersection}
                  tabView={activeTab}
                  activeLayers={activeLayers}
                  onToggleLayer={handleToggleLayer}
                />
              </motion.div>
            )}

            {activeTab === 'case' && (
              <motion.div
                key="case-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full"
              >
                <CaseManagementView
                  intersections={intersections}
                  selectedIntersection={selectedIntersection}
                  onUpdateIntersectionCase={handleUpdateIntersectionCase}
                  onSelectIntersection={handleSelectIntersection}
                  contracts={contracts}
                  currentUser={currentUser}
                  onAutoSwitchTab={handleAutoSwitchTab}
                />
              </motion.div>
            )}

            {activeTab === 'document' && (
              <motion.div
                key="document-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full"
              >
                <DocumentGeneratorView
                  intersections={intersections}
                  selectedIntersection={selectedIntersection}
                />
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full"
              >
                <SignalHistoryView
                  intersections={intersections}
                  selectedIntersection={selectedIntersection}
                  onUpdateIntersectionDetails={handleUpdateIntersectionDetails}
                  onUpdateIntersectionCase={handleUpdateIntersectionCase}
                />
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div
                key="stats-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full"
              >
                <StatsDashboardView
                  intersections={intersections}
                  onSelectIntersection={handleSelectIntersection}
                  onAutoSwitchTab={handleAutoSwitchTab}
                />
              </motion.div>
            )}

            {activeTab === 'contract' && (
              <motion.div
                key="contract-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full"
              >
                <ContractManagementView
                  intersections={intersections}
                  contracts={contracts}
                  onUpdateContracts={setContracts}
                  onUpdateIntersectionCase={handleUpdateIntersectionCase}
                  currentUser={currentUser}
                  onAutoSwitchTab={handleAutoSwitchTab}
                  onSelectIntersection={handleSelectIntersection}
                />
              </motion.div>
            )}

            {activeTab === 'elements' && (
              <motion.div
                key="elements-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full"
              >
                <IntersectionElementsView
                  intersections={intersections}
                  onUpdateIntersectionDetails={handleUpdateIntersectionDetails}
                  selectedIntersection={selectedIntersection}
                  onSelectIntersection={handleSelectIntersection}
                  currentUser={currentUser}
                />
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                key="users-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full"
              >
                <UserPermissionManagerView
                  currentUser={currentUser}
                  users={systemUsers}
                  onUpdateUserPermissions={handleUpdateUserPermissions}
                  onUpdateUserRole={handleUpdateUserRole}
                  onChangeActiveUser={handleChangeActiveUser}
                  onAddSystemUser={handleAddSystemUser}
                  onDeleteSystemUser={handleDeleteSystemUser}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </main>

      </div>

      {/* Bottom Status Bar */}
      <footer className="h-8 bg-slate-800 text-slate-300 flex items-center justify-between px-6 text-[10px] uppercase tracking-widest shrink-0">
        <div>System Engine: Hualien-Traf-v4.2</div>
        <div className="flex gap-6">
          <span>Active Sessions: 12</span>
          <span>Network Latency: 14ms</span>
          <span className="text-green-400">Server Status: Online</span>
        </div>
      </footer>

      {/* Floating notification toasts stack */}
      <NotificationToast
        notifications={notifications}
        onDismiss={handleDismissToast}
        onLocate={handleLocateIntersection}
      />

    </div>
  );
}
