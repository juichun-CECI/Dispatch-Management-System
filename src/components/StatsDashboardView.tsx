import React, { useMemo } from 'react';
import { Intersection } from '../types';
import { BarChart3, Activity, ShieldAlert, Wifi, CheckCircle2, ChevronRight, HelpCircle, HardDrive } from 'lucide-react';

interface StatsDashboardViewProps {
  intersections: Intersection[];
  onSelectIntersection: (intersection: Intersection) => void;
  onAutoSwitchTab: (tab: 'home' | 'case' | 'document' | 'history' | 'stats') => void;
}

export default function StatsDashboardView({
  intersections,
  onSelectIntersection,
  onAutoSwitchTab
}: StatsDashboardViewProps) {
  
  // Aggregate stats using useMemo
  const stats = useMemo(() => {
    const total = intersections.length;
    const online = intersections.filter(i => i.status === 'E_ONLINE').length;
    const timeout = intersections.filter(i => i.status === 'E_TIMEOUT').length;
    const offline = intersections.filter(i => i.status === 'E_OFFLINE').length;
    
    const warrantyValid = intersections.filter(i => i.warranty === 'W_VALID').length;
    const warrantyExpired = intersections.filter(i => i.warranty === 'W_EXPIRED').length;

    const withCases = intersections.filter(i => i.caseStatus === 'C_PENDING' || i.caseStatus === 'C_ING').length;
    const completedToday = intersections.filter(i => i.caseStatus === 'C_DONE').length;

    // Distribute counts by towns/districts
    const distCounts: Record<string, number> = {};
    intersections.forEach(i => {
      distCounts[i.district] = (distCounts[i.district] || 0) + 1;
    });

    // Order by counts
    const orderedDistricts = Object.entries(distCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const onlineRate = total > 0 ? (online / total) * 100 : 0;
    const warrantyRate = total > 0 ? (warrantyValid / total) * 100 : 0;

    return {
      total,
      online,
      timeout,
      offline,
      warrantyValid,
      warrantyExpired,
      withCases,
      completedToday,
      orderedDistricts,
      onlineRate,
      warrantyRate
    };
  }, [intersections]);

  // Circumference calculation for circular SVG ring gauge
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.onlineRate / 100) * circumference;

  return (
    <div id="wrapper_stats_dashboard" className="h-full flex flex-col bg-slate-50 overflow-hidden">
      
      {/* Title banner */}
      <div className="p-4 bg-white border-b border-slate-200 shrink-0">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <span>📊 全縣號誌維運統計資訊中心</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          分析即時連線封包妥善率、保固履約合約比率、各鄉鎮號誌點位密度、以及派工作業修繕負載。
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 max-w-7xl mx-auto w-full">
        
        {/* Row 1: Key Executive Metric Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Total */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              監管號誌化路口總數
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">{stats.total}</span>
              <span className="text-xs text-slate-400 font-medium">處</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
              全花蓮縣共 {stats.total} 個號誌交匯點納入中控監管。
            </p>
          </div>

          {/* Under Warranty */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              保固期合約內 (Valid Warranty)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-sky-600 font-mono">{stats.warrantyValid}</span>
              <span className="text-xs text-slate-400 font-medium">處 / ({stats.warrantyRate.toFixed(0)}%)</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
              剩餘過保路口 {stats.warrantyExpired} 處由委外開口契約維護。
            </p>
          </div>

          {/* Dispatch active cases */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              在案搶修中工單 (Active cases)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-red-500 font-mono">{stats.withCases}</span>
              <span className="text-xs text-slate-400 font-medium">件 / 完工 {stats.completedToday} 件</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
              包含通訊阻斷、主機當機及1999民眾通報案件。
            </p>
          </div>

        </div>

        {/* Row 2: Charts and visual distributions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Gauge Widget: Online percentage circular meter */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col items-center text-center justify-center">
            
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 w-full text-left flex items-center gap-1">
              <Wifi className="w-4 h-4 text-emerald-500" /> 中心連線狀態
            </h4>

            {/* Circular Gauge */}
            <div className="relative w-44 h-44 mb-3">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                {/* Background slate circle */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth={strokeWidth}
                />
                {/* Foreground active ring */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Inner details */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800 font-mono">{stats.onlineRate.toFixed(1)}%</span>
                <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">網路在線妥善</span>
              </div>
            </div>

            {/* Minor values breakdown */}
            <div className="grid grid-cols-3 gap-2 w-full text-xs pt-2">
              <div className="bg-emerald-50 p-1.5 rounded border border-emerald-100 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-emerald-700 font-mono">{stats.online}</span>
                <span className="text-[10px] text-slate-400 scale-95 mt-0.5">健康在線</span>
              </div>
              <div className="bg-amber-50 p-1.5 rounded border border-amber-100 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-amber-700 font-mono">{stats.timeout}</span>
                <span className="text-[10px] text-slate-400 scale-95 mt-0.5">連線逾時</span>
              </div>
              <div className="bg-slate-100 p-1.5 rounded flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-slate-700 font-mono">{stats.offline}</span>
                <span className="text-[10px] text-slate-400 scale-95 mt-0.5">完全斷線</span>
              </div>
            </div>

          </div>

          {/* Bar Chart Widget: District Density distribution bars */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs lg:col-span-2 flex flex-col">
            
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1">
              <BarChart3 className="w-4 h-4 text-blue-500" /> 鄉鎮行政區域點位密度排行
            </h4>

            {/* List bars */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {stats.orderedDistricts.map((item, idx) => {
                // Percentage based on max district count (first element in ordered array)
                const maxCount = stats.orderedDistricts[0]?.count || 1;
                const fillPct = (item.count / maxCount) * 100;

                return (
                  <div key={item.name} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center text-slate-700 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <span className="bg-slate-100 text-slate-500 w-4.5 h-4.5 rounded-md inline-flex items-center justify-center font-mono text-[9px] font-bold">
                          {idx + 1}
                        </span>
                        <span>{item.name} ({item.name.endsWith('市') ? '行政中心' : '轄區'})</span>
                      </span>
                      <span className="font-bold text-slate-800 font-mono text-[11px]">{item.count} 處點位</span>
                    </div>

                    {/* Progress tracking line */}
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner relative">
                      <div
                        style={{ width: `${fillPct}%` }}
                        className="bg-blue-500 hover:bg-blue-600 transition-all duration-500 rounded-full h-full"
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* Row 3: Active warning table (List of intersections with alerts or pending dispatches) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800">維運管控中心: 當前通訊連線與工單修繕清冊</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                列出當前發生連線逾時(E_TIMEOUT)、離線(E_OFFLINE) 或帶有派工作業工單之路口，供值班調度小組即時呼叫或派遣備料。
              </p>
            </div>
            
            <button
              onClick={() => onAutoSwitchTab('case')}
              className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition cursor-pointer"
            >
              進入派工工單看板
            </button>
          </div>

          {/* Tabular alert view list */}
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50/50">
                  <th className="p-2.5 w-20">編號 ID</th>
                  <th className="p-2.5">路口名稱與區域</th>
                  <th className="p-2.5 w-32">控制器型號</th>
                  <th className="p-2.5 w-32">通訊狀態 / IP</th>
                  <th className="p-2.5 w-24">保固</th>
                  <th className="p-2.5 w-44">現行派工狀況</th>
                  <th className="p-2.5 w-24 text-center">快捷聯動</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {intersections
                  .filter(i => i.status !== 'E_ONLINE' || i.caseStatus !== 'C_NONE')
                  .slice(0, 8)
                  .map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="p-2.5 font-mono font-bold text-slate-900">{item.id}</td>
                      <td className="p-2.5 font-semibold text-slate-700">
                        {item.name} <span className="text-[10px] text-slate-400 font-medium ml-1">({item.district})</span>
                      </td>
                      <td className="p-2.5 font-mono text-slate-500">{item.controllerType}</td>
                      <td className="p-2.5">
                        <div className="flex flex-col">
                          <span className={`font-bold ${
                            item.status === 'E_TIMEOUT' ? 'text-amber-600' : 'text-gray-500'
                          }`}>
                            {item.status === 'E_TIMEOUT' ? '連線逾時' : '連線中斷'}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">{item.ip}</span>
                        </div>
                      </td>
                      <td className="p-2.5 font-medium">
                        {item.warranty === 'W_VALID' ? (
                          <span className="text-sky-600">保固內</span>
                        ) : (
                          <span className="text-purple-600">已過期</span>
                        )}
                      </td>
                      <td className="p-2.5">
                        {item.case ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 line-clamp-1">{item.case.title}</span>
                            <span className="text-[10px] text-slate-400 font-medium">工人: {item.case.assignedTo} ({item.case.status})</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => {
                            onSelectIntersection(item);
                            onAutoSwitchTab('home');
                          }}
                          className="bg-slate-100 hover:bg-blue-600 hover:text-white px-2 py-1.5 rounded text-[10px] font-semibold text-slate-700 transition cursor-pointer"
                        >
                          地圖定位
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
