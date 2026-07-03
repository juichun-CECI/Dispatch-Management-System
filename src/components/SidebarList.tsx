import React, { useState, useMemo } from 'react';
import { Intersection } from '../types';
import { Search, Filter, Signal, Shield, ShieldAlert, Wrench, ChevronRight, CheckCircle2, HelpCircle } from 'lucide-react';

interface SidebarListProps {
  intersections: Intersection[];
  selectedIntersection: Intersection | null;
  onSelectIntersection: (intersection: Intersection) => void;
  onAutoSwitchTab: (tab: 'home' | 'case' | 'document' | 'history' | 'stats') => void;
}

type FilterCategory = 'ALL' | 'ABNORMAL' | 'W_VALID' | 'W_EXPIRED' | 'CASE_ACTIVE' | 'HIGH_FLOW' | 'SMART_SIGNAL';

export default function SidebarList({
  intersections,
  selectedIntersection,
  onSelectIntersection,
  onAutoSwitchTab
}: SidebarListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('ALL');

  // Human-readable names for the demand classifications (需求分類)
  const categories = [
    { key: 'ALL', label: '全部路口' },
    { key: 'ABNORMAL', label: '連線路口' },
    { key: 'CASE_ACTIVE', label: '派工案件' },
    { key: 'W_VALID', label: '保固到期' },
    { key: 'SMART_SIGNAL', label: '智慧號誌路口' }
  ];

  // Map of district counts for decorative summary
  const districtCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    intersections.forEach(i => {
      counts[i.district] = (counts[i.district] || 0) + 1;
    });
    return counts;
  }, [intersections]);

  // Handle filtering
  const filteredIntersections = useMemo(() => {
    return intersections.filter(item => {
      // Fuzzy search on ID + Name or IP or District
      const matchesSearch =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ip.includes(searchQuery);

      if (!matchesSearch) return false;

      // Filter by operational demand classification (需求分類篩選)
      switch (activeCategory) {
        case 'ABNORMAL':
          return item.status === 'E_ONLINE';
        case 'W_VALID':
          return item.warranty === 'W_EXPIRED';
        case 'W_EXPIRED':
          return item.warranty === 'W_EXPIRED';
        case 'CASE_ACTIVE':
          return item.caseStatus === 'C_PENDING' || item.caseStatus === 'C_ING';
        case 'HIGH_FLOW':
          return item.flowRate >= 800;
        case 'SMART_SIGNAL':
          return item.controllerType === 'MGC-3100' || item.controllerType === 'ITC-2000';
        case 'ALL':
        default:
          return true;
      }
    });
  }, [intersections, searchQuery, activeCategory]);

  return (
    <div id="sidebar_junction_menu" className="w-full h-full flex flex-col bg-white overflow-hidden">
      
      {/* Header with quick stats */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <span>🗺️ 路口列表選單 ({filteredIntersections.length})</span>
          </h2>
          <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded font-mono select-none">
            Hualien
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-normal">
          列出本縣管轄號誌化路口。可點擊展開下方詳細參數，並快速聯動詳細分析。
        </p>
      </div>

      {/* Fuzzy search filter input block */}
      <div className="p-3 border-b border-slate-100 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            id="input_fuzzy_search"
            type="text"
            placeholder="模糊搜尋路口名稱、ID、IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-colors hover:bg-slate-50/80"
          />
        </div>
      </div>

      {/* Demand Classifications Pill filters (需求分類篩選) */}
      <div className="p-2.5 bg-slate-50/50 border-b border-slate-100">
        <span className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5 px-1 flex items-center gap-1 select-none">
          <Filter className="w-3 h-3 text-slate-400" /> 需求分類篩選 (Demand Category)
        </span>
        <div className="grid grid-cols-2 gap-1">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                id={`btn_filter_cat_${cat.key}`}
                onClick={() => setActiveCategory(cat.key as FilterCategory)}
                className={`py-1 px-1 rounded text-[10px] font-medium transition cursor-pointer text-center truncate last:col-span-2 ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
                title={cat.label}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Scrollable List showing ID + Name */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100" id="sidebar_junction_list">
        {filteredIntersections.length > 0 ? (
          filteredIntersections.map((item) => {
            const isSelected = selectedIntersection && selectedIntersection.id === item.id;
            
            return (
              <div
                key={item.id}
                id={`list_item_${item.id}`}
                onClick={() => onSelectIntersection(item)}
                className={`p-4 text-left cursor-pointer flex items-start justify-between relative border-l-4 transition-colors ${
                  isSelected
                    ? 'bg-blue-50/50 border-blue-500'
                    : 'hover:bg-slate-50 border-transparent'
                }`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className={`text-[10px] font-semibold font-mono px-1.5 py-0.2 rounded ${
                      isSelected ? 'bg-blue-200 text-blue-900' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium select-none">
                      {item.district}
                    </span>
                  </div>
                  
                  <h4 className={`text-xs font-semibold truncate leading-snug ${
                    isSelected ? 'text-blue-900 font-bold' : 'text-slate-800'
                  }`}>
                    {item.name}
                  </h4>

                  <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                    IP: {item.ip}
                  </span>
                </div>

                {/* Indicators Block */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex gap-1 items-center">
                    
                    {/* Connection dot indicator */}
                    <span
                      className={`w-2 h-2 rounded-full inline-block ${
                        item.status === 'E_ONLINE' ? 'bg-emerald-500' :
                        item.status === 'E_TIMEOUT' ? 'bg-amber-500 animate-pulse' : 'bg-gray-400'
                      }`}
                      title={item.status === 'E_ONLINE' ? '通訊良好 (Online)' : item.status === 'E_TIMEOUT' ? '連線逾時 (Timeout)' : '斷線狀態 (Offline)'}
                    ></span>

                    {/* Warranty indicator label */}
                    <span
                      className={`text-[9px] font-bold px-1 rounded-sm ${
                        item.warranty === 'W_VALID' ? 'bg-sky-50 text-sky-600' : 'bg-purple-50 text-purple-600'
                      }`}
                      title={item.warranty === 'W_VALID' ? '保固期內' : '保固到期'}
                    >
                      {item.warranty === 'W_VALID' ? '保' : '過'}
                    </span>

                  </div>

                  {/* Active Case Banner flag */}
                  {item.caseStatus !== 'C_NONE' && (
                    <span className={`flex items-center gap-0.5 text-[8px] font-bold px-1 rounded-sm ${
                      item.caseStatus === 'C_PENDING' ? 'bg-red-100 text-red-700' :
                      item.caseStatus === 'C_ING' ? 'bg-orange-100 text-orange-700 animate-pulse' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      <Wrench className="w-2.5 h-2.5" />
                      {item.case?.status || '派工'}
                    </span>
                  )}
                </div>

                <div className="self-center pl-1 text-slate-300">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>

              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            找不到符合條件的號誌路口
          </div>
        )}
      </div>

      {/* Dynamic Detail Loading box below the menu (路口點選後，下方載入資訊) */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50" id="sidebar_bottom_infobox">
        {selectedIntersection ? (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                💡 已載入路口參數詳情
              </span>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-sm">
                即時通訊中
              </span>
            </div>



            {/* Quick Action switches to optimizing interfaces (自動切換至對應分析介面) */}
            <div className="mt-3.5 space-y-1.5 border-t border-slate-200/60 pt-3">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
                ⚡ 優化操作效率: 自動切換詳細儀表
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                
                {/* Auto Switch to Ticket Status */}
                <button
                  id="btn_auto_switch_case"
                  onClick={() => onAutoSwitchTab('case')}
                  className="p-1 px-2 text-[10px] font-medium text-slate-700 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded text-center cursor-pointer transition flex items-center justify-center gap-1"
                >
                  <Wrench className="w-3 h-3 text-red-500" />
                  <span>分析派工案件</span>
                </button>

                {/* Auto Switch to Physical Master Signal Record */}
                <button
                  id="btn_auto_switch_history"
                  onClick={() => onAutoSwitchTab('history')}
                  className="p-1 px-2 text-[10px] font-medium text-slate-700 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded text-center cursor-pointer transition flex items-center justify-center gap-1"
                >
                  <ChevronRight className="w-3 h-3 text-emerald-500" />
                  <span>查證號誌履歷</span>
                </button>

              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <HelpCircle className="w-7 h-7 text-slate-300" />
            <span>請在上方列表中，點選任一號誌路口載入通訊與保固履歷資料。</span>
          </div>
        )}
      </div>

    </div>
  );
}
