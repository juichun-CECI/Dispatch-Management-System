import React, { useState, useMemo } from 'react';
import { AppNotification, NotificationSettings, Intersection } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, BellRing, Settings, Volume2, VolumeX, Filter, 
  ShieldAlert, Wrench, Check, Play, X, ExternalLink, 
  AlertTriangle, CheckCircle2, ShieldAlert as AlertIcon, RefreshCw, Radio
} from 'lucide-react';
import { playChime } from '../utils/audio';

interface NotificationCenterProps {
  notifications: AppNotification[];
  settings: NotificationSettings;
  intersections: Intersection[];
  onUpdateSettings: (settings: NotificationSettings) => void;
  onClearAll: () => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onLocateIntersection: (intersectionId: string) => void;
  onSimulateEvent: (type: 'status_change' | 'dispatch' | 'critical') => void;
}

export default function NotificationCenter({
  notifications,
  settings,
  intersections,
  onUpdateSettings,
  onClearAll,
  onMarkAllRead,
  onMarkRead,
  onLocateIntersection,
  onSimulateEvent
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings' | 'simulator'>('notifications');

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Unique districts in Hualien (from raw list)
  const availableDistricts = [
    '花蓮市', '吉安鄉', '壽豐鄉', '新城鄉', '鳳林鎮', 
    '光復鄉', '瑞穗鄉', '玉里鎮', '富里鄉', '豐濱鄉'
  ];

  // Helper status for filters
  const toggleDistrict = (district: string) => {
    let updatedDistricts = [...settings.districts];
    if (updatedDistricts.includes(district)) {
      updatedDistricts = updatedDistricts.filter(d => d !== district);
    } else {
      updatedDistricts.push(district);
    }
    onUpdateSettings({ ...settings, districts: updatedDistricts });
  };

  const handleTestSound = () => {
    playChime(settings.audioTone);
  };

  return (
    <div className="relative flex items-center">
      {/* Trigger Bell Button */}
      <button
        id="btn_notification_center_bell"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full cursor-pointer transition-all duration-300 outline-none focus:ring-2 focus:ring-blue-300 ${
          isOpen ? 'bg-blue-800 text-white' : 'hover:bg-blue-600 text-white bg-blue-700/50'
        }`}
        title="系統即時通知中心"
      >
        {unreadCount > 0 ? (
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 4, repeatDelay: 2 }}
          >
            <BellRing className="w-5 h-5 text-amber-300 fill-amber-300/25" />
          </motion.div>
        ) : (
          <Bell className="w-5 h-5 text-blue-100" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-extrabold text-white ring-2 ring-blue-700 animate-pulse select-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Drawer Overlay Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Notification Drawer Panel */}
            <motion.div
              id="drawer_notification_panel"
              initial={{ x: '100%', opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 h-screen w-full sm:w-[420px] bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col overflow-hidden text-slate-800"
            >
              {/* Header */}
              <div className="p-4 bg-slate-800 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-600 p-1.5 rounded-lg">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold tracking-tight">系統即時監控通知中心</h2>
                    <p className="text-[10px] opacity-75 font-mono">Real-time Signal Operations Feed</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-700 rounded-md transition text-slate-300 hover:text-white cursor-pointer"
                  id="btn_close_notification_drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sub Navigation Tabs */}
              <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`flex-1 py-3 text-xs font-bold border-b-2 transition ${
                    activeTab === 'notifications' 
                      ? 'border-blue-600 text-blue-600 bg-white' 
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                  }`}
                  id="tab_drawer_notifications"
                >
                  即時警報 ({notifications.length})
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex-1 py-3 text-xs font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'settings' 
                      ? 'border-blue-600 text-blue-600 bg-white' 
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                  }`}
                  id="tab_drawer_settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                  偏好設定
                </button>
                <button
                  onClick={() => setActiveTab('simulator')}
                  className={`flex-1 py-3 text-xs font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'simulator' 
                      ? 'border-rose-600 text-rose-600 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                  }`}
                  id="tab_drawer_simulator"
                >
                  <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                  異常模擬
                </button>
              </div>

              {/* Content Panel Area */}
              <div className="flex-1 overflow-y-auto bg-slate-50/50">
                
                {/* 1. Notifications List Tab */}
                {activeTab === 'notifications' && (
                  <div className="h-full flex flex-col">
                    
                    {/* Action buttons bar */}
                    {notifications.length > 0 && (
                      <div className="px-4 py-2 border-b border-slate-200 bg-white flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase select-none shrink-0">
                        <span>歷史累積 ({notifications.length} 則)</span>
                        <div className="flex gap-3">
                          <button 
                            onClick={onMarkAllRead}
                            className="text-blue-600 hover:text-blue-800 transition cursor-pointer"
                            id="btn_notifications_mark_all_read"
                          >
                            全部標示為已讀
                          </button>
                          <span className="text-slate-200">|</span>
                          <button 
                            onClick={onClearAll}
                            className="text-red-500 hover:text-red-700 transition cursor-pointer"
                            id="btn_notifications_clear_all"
                          >
                            清除全部
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Infinite Notifications list */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                      {notifications.length > 0 ? (
                        notifications.map((n) => {
                          // Filter out if not matches district settings
                          const matchesDistrict = settings.districts.length === 0 || 
                            (n.intersectionId && intersections.find(item => item.id === n.intersectionId)?.district && 
                             settings.districts.includes(intersections.find(item => item.id === n.intersectionId)!.district));
                          
                          // Filter if severity level below minSeverity setting
                          const severityPriority = { info: 0, warn: 1, critical: 2 };
                          const matchesSeverity = severityPriority[n.severity] >= severityPriority[settings.minSeverity];

                          if (!matchesDistrict || !matchesSeverity) return null;

                          return (
                            <div 
                              key={n.id}
                              className={`p-3.5 rounded-xl border transition-all text-xs relative ${
                                n.read 
                                  ? 'bg-white border-slate-100 opacity-75' 
                                  : 'bg-white border-blue-100 shadow-sm ring-1 ring-blue-50/50'
                              }`}
                            >
                              {/* Unread Indicator Glow */}
                              {!n.read && (
                                <span className="absolute left-2 top-4 w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                              )}

                              {/* Title / Severity bar */}
                              <div className="flex items-start justify-between gap-1 mb-1 pl-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    n.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                    n.severity === 'warn' ? 'bg-amber-100 text-amber-700' :
                                    'bg-sky-100 text-sky-700'
                                  }`}>
                                    {n.severity === 'critical' ? '緊急' : n.severity === 'warn' ? '警報' : '資訊'}
                                  </span>
                                  <h4 className="font-bold text-slate-800 leading-normal">{n.title}</h4>
                                </div>
                                
                                <span className="font-mono text-[9px] text-slate-400 shrink-0">
                                  {n.timestamp}
                                </span>
                              </div>

                              {/* Message text */}
                              <p className="text-slate-600 pl-1.5 leading-relaxed font-normal mb-2 whitespace-pre-wrap">
                                {n.message}
                              </p>

                              {/* Inline action targets */}
                              <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-md text-[10px] border border-slate-100/60 pl-2">
                                <div className="text-slate-400">
                                  {n.intersectionId && (
                                    <span>
                                      號誌點: <span className="font-mono font-bold text-slate-700 bg-slate-200/50 px-1 py-0.2 rounded">{n.intersectionId}</span>
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  {n.intersectionId && (
                                    <button
                                      onClick={() => {
                                        onLocateIntersection(n.intersectionId!);
                                        setIsOpen(false);
                                      }}
                                      className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 transition hover:underline cursor-pointer"
                                      title="在地圖中定位此路口"
                                    >
                                      <span>地圖定位</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </button>
                                  )}

                                  {!n.read && (
                                    <button
                                      onClick={() => onMarkRead(n.id)}
                                      className="text-slate-400 hover:text-slate-800 font-bold flex items-center gap-0.5 transition cursor-pointer"
                                    >
                                      <span>標示已讀</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                            </div>
                          );
                        })
                      ) : (
                        <div className="py-16 text-center text-slate-400 space-y-2 flex flex-col items-center">
                          <CheckCircle2 className="w-12 h-12 text-slate-200" />
                          <h4 className="font-bold text-slate-500">尚無即時通報與警報通知</h4>
                          <p className="text-[11px] text-slate-400 max-w-xs leading-normal">
                            當系統路口斷線、過期保固號誌發生劇烈異常、或派工管理中心有新增委派案件時，警報將即時載入至此。
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Notification Preferences Tab */}
                {activeTab === 'settings' && (
                  <div className="p-4 space-y-5 text-xs text-slate-700">
                    
                    {/* Audio & sound effects section */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                          {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                          <span>音效與提醒聲響 (Audio Tones)</span>
                        </h4>
                        
                        {/* Audio Chime Switch Wrapper */}
                        <button
                          onClick={() => {
                            const val = !settings.soundEnabled;
                            onUpdateSettings({ ...settings, soundEnabled: val });
                            if (val) playChime(settings.audioTone);
                          }}
                          className={`w-10 h-5.5 rounded-full p-0.5 transition-all duration-200 cursor-pointer ${
                            settings.soundEnabled ? 'bg-blue-600' : 'bg-slate-300'
                          }`}
                          id="btn_settings_sound_toggle"
                        >
                          <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            settings.soundEnabled ? 'translate-x-4.5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>

                      {settings.soundEnabled && (
                        <div className="space-y-2.5 pt-1">
                          <label className="block text-slate-500 font-semibold">提醒聲響種類 (Audio Tone Type)</label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(['bell', 'digital', 'soft'] as const).map((tone) => (
                              <button
                                key={tone}
                                onClick={() => {
                                  onUpdateSettings({ ...settings, audioTone: tone });
                                  playChime(tone);
                                }}
                                className={`p-2 border rounded-lg text-center font-bold transition cursor-pointer ${
                                  settings.audioTone === tone 
                                    ? 'bg-blue-50 border-blue-400 text-blue-700' 
                                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
                                }`}
                                id={`btn_audio_tone_${tone}`}
                              >
                                {tone === 'bell' ? '經典大鐘' : tone === 'digital' ? '數碼雙響' : '溫暖滑弦'}
                              </button>
                            ))}
                          </div>
                          
                          <button
                            onClick={handleTestSound}
                            className="w-full flex items-center justify-center gap-1 p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg font-bold transition cursor-pointer"
                            id="btn_test_notification_chime"
                          >
                            <Play className="w-3.5 h-3.5 fill-slate-700" />
                            <span>測試通知聲響音頻</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Subscription Districts Filtering */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
                      <h4 className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <Filter className="w-4 h-4 text-slate-500" />
                        <span>訂閱轄區篩選 (District Subscriptions)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        勾選欲監控訂閱的鄉鎮區域。留空表示訂閱全部鄉鎮市路口。
                      </p>

                      <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto p-1 bg-slate-50/55 rounded-lg border border-slate-100">
                        {availableDistricts.map((d) => {
                          const isSubscribed = settings.districts.includes(d);
                          return (
                            <button
                              key={d}
                              onClick={() => toggleDistrict(d)}
                              className={`p-1.5 rounded-md border flex items-center justify-between text-left transition cursor-pointer ${
                                isSubscribed 
                                  ? 'bg-blue-50 border-blue-200 font-bold text-blue-700' 
                                  : 'bg-white border-slate-100 hover:bg-slate-100 text-slate-600'
                              }`}
                              id={`chk_district_${d}`}
                            >
                              <span>{d}</span>
                              {isSubscribed ? (
                                <Check className="w-3.5 h-3.5 text-blue-600 font-bold" />
                              ) : (
                                <span className="w-3.5 h-3.5 rounded border border-slate-300"></span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Event Triggers Filter Toggles */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
                      <h4 className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <Wrench className="w-4 h-4 text-slate-500" />
                        <span>觸發警報篩選 (Trigger Events)</span>
                      </h4>
                      
                      <div className="space-y-2.5">
                        <label className="flex items-center justify-between cursor-pointer p-1">
                          <span className="font-semibold text-slate-600">新委派派工事件 (New Dispatches)</span>
                          <button
                            onClick={() => onUpdateSettings({ ...settings, triggerDispatchAssigned: !settings.triggerDispatchAssigned })}
                            className={`w-9 h-5 rounded-full p-0.5 transition-all cursor-pointer ${
                              settings.triggerDispatchAssigned ? 'bg-blue-500' : 'bg-slate-200'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                              settings.triggerDispatchAssigned ? 'translate-x-4' : 'translate-x-0'
                            }`} />
                          </button>
                        </label>

                        <label className="flex items-center justify-between cursor-pointer p-1">
                          <span className="font-semibold text-slate-600">號誌通訊變更 (Connection Status Changes)</span>
                          <button
                            onClick={() => onUpdateSettings({ ...settings, triggerStatusChanged: !settings.triggerStatusChanged })}
                            className={`w-9 h-5 rounded-full p-0.5 transition-all cursor-pointer ${
                              settings.triggerStatusChanged ? 'bg-blue-500' : 'bg-slate-200'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                              settings.triggerStatusChanged ? 'translate-x-4' : 'translate-x-0'
                            }`} />
                          </button>
                        </label>

                        <label className="flex items-center justify-between cursor-pointer p-1">
                          <span className="font-semibold text-slate-600">臨界與合約到期警告 (Warranty & Critical)</span>
                          <button
                            onClick={() => onUpdateSettings({ ...settings, triggerCriticalAlert: !settings.triggerCriticalAlert })}
                            className={`w-9 h-5 rounded-full p-0.5 transition-all cursor-pointer ${
                              settings.triggerCriticalAlert ? 'bg-blue-500' : 'bg-slate-200'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                              settings.triggerCriticalAlert ? 'translate-x-4' : 'translate-x-0'
                            }`} />
                          </button>
                        </label>

                        <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                          <span className="font-bold text-slate-700">最低警報層級 (Min Severity)</span>
                          <select
                            value={settings.minSeverity}
                            onChange={(e) => onUpdateSettings({ ...settings, minSeverity: e.target.value as NotificationSettings['minSeverity'] })}
                            className="bg-white border border-slate-200 p-1.5 rounded-md font-semibold text-xs text-slate-800"
                            id="select_settings_min_severity"
                          >
                            <option value="info">最低 (Info 以上)</option>
                            <option value="warn">中等 (Warn 以上)</option>
                            <option value="critical">高 (Critical 以上)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* 3. Anomalies Simulator Tab */}
                {activeTab === 'simulator' && (
                  <div className="p-4 space-y-4 text-xs text-slate-700">
                    <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 text-rose-900 leading-normal">
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>緊急操作演練模擬器</span>
                      </div>
                      <p className="text-[11px] opacity-90 leading-relaxed font-normal">
                        此演練工具提供維運人員在「不干擾花蓮實體路口」情況下，於本調度管控端安全模擬並測試通知推送、系統聲響、地圖同步圖層與派工流動效率。
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <h4 className="font-bold text-slate-800 tracking-wider uppercase mb-1 flex items-center gap-1 text-[10px]">
                        選點演練功能 (Click-to-Trigger Simulated Incidents)
                      </h4>

                      {/* Trigger connection failure */}
                      <button
                        onClick={() => onSimulateEvent('status_change')}
                        className="w-full text-left p-3.5 bg-white border border-slate-200 hover:border-amber-300 rounded-xl flex items-center justify-between transition cursor-pointer group shadow-xs hover:shadow-sm"
                        id="btn_sim_status_change"
                      >
                        <div className="space-y-1 pr-2">
                          <p className="font-bold text-slate-800 group-hover:text-blue-700 transition">模擬隨機路口 [連線逾時斷訊] 警報</p>
                          <p className="text-[10px] text-slate-400 font-normal">發布 E_TIMEOUT 警訊，並於首頁列表與地圖亮起警示黃點</p>
                        </div>
                        <div className="bg-amber-100 group-hover:bg-amber-200 text-amber-700 p-2 rounded-lg shrink-0 transition">
                          <Radio className="w-5 h-5 text-amber-600 animate-pulse" />
                        </div>
                      </button>

                      {/* Trigger citizen major report details */}
                      <button
                        onClick={() => onSimulateEvent('dispatch')}
                        className="w-full text-left p-3.5 bg-white border border-slate-200 hover:border-blue-300 rounded-xl flex items-center justify-between transition cursor-pointer group shadow-xs hover:shadow-sm"
                        id="btn_sim_dispatch"
                      >
                        <div className="space-y-1 pr-2">
                          <p className="font-bold text-slate-800 group-hover:text-blue-700 transition">模擬隨機路口 [急件市民指派維護] 案件</p>
                          <p className="text-[10px] text-slate-400 font-normal">建立待指派號誌維護立案通知，且可連攜至案件中心直接審查</p>
                        </div>
                        <div className="bg-blue-100 group-hover:bg-blue-200 text-blue-700 p-2 rounded-lg shrink-0 transition">
                          <Wrench className="w-5 h-5 text-blue-600" />
                        </div>
                      </button>

                      {/* Power surge cabinet warning */}
                      <button
                        onClick={() => onSimulateEvent('critical')}
                        className="w-full text-left p-3.5 bg-white border border-slate-200 hover:border-red-300 rounded-xl flex items-center justify-between transition cursor-pointer group shadow-xs hover:shadow-sm"
                        id="btn_sim_critical"
                      >
                        <div className="space-y-1 pr-2">
                          <p className="font-bold text-slate-800 group-hover:text-red-700 transition">模擬隨機路口的 [電控箱供電異常] 急件</p>
                          <p className="text-[10px] text-slate-400 font-normal">模擬電控箱電壓不穩、跳開，需即刻派遣重組檢修，伴隨高頻聲響</p>
                        </div>
                        <div className="bg-red-100 group-hover:bg-red-200 text-red-700 p-2 rounded-lg shrink-0 transition">
                          <AlertIcon className="w-5 h-5 text-red-600" />
                        </div>
                      </button>
                    </div>

                    <div className="bg-slate-100 p-3 rounded-lg text-[11px] text-slate-500 font-normal leading-relaxed text-center select-none">
                      💡 提示：按壓上方按鈕後，音效、大眾通報系統以及地圖圖層皆將即刻展開全自動連鎖對應，極具即時控制真實感。
                    </div>
                  </div>
                )}

              </div>
              
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
