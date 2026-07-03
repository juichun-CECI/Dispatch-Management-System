import React, { useState, useMemo, useEffect } from 'react';
import { Intersection } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Eye, Info, RefreshCw, ZoomIn, ZoomOut, Maximize2, Shield, Wrench, Wifi, Settings, AlertTriangle, Globe } from 'lucide-react';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidGoogleKey = Boolean(GOOGLE_MAPS_KEY) && GOOGLE_MAPS_KEY !== 'YOUR_API_KEY';

interface MapCanvasProps {
  intersections: Intersection[];
  selectedIntersection: Intersection | null;
  onSelectIntersection: (intersection: Intersection) => void;
  tabView: 'home' | 'case' | 'document' | 'history' | 'stats';
  activeLayers: {
    connection: boolean;
    warranty: boolean;
    cases: boolean;
  };
  onToggleLayer: (layer: 'connection' | 'warranty' | 'cases') => void;
}

export default function MapCanvas({
  intersections,
  selectedIntersection,
  onSelectIntersection,
  activeLayers,
  onToggleLayer
}: MapCanvasProps) {
  // Map dimensions and interactive state (Zoom and Pan)
  const [zoom, setZoom] = useState(1.1);
  const [pan, setPan] = useState({ x: 0, y: -40 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredIntersection, setHoveredIntersection] = useState<Intersection | null>(null);

  // Switch between Google Maps and custom vector topology canvas
  const useGoogleMap = false;

  // Track the ON/OFF state of smart signals per intersection
  const [smartSignalsStatus, setSmartSignalsStatus] = useState<Record<string, boolean>>({});


  // Dynamically tracked state of Google Maps coordinates centered around Hualien
  const [mapCenter, setMapCenter] = useState({ lat: 23.97565, lng: 121.6046 });
  const [mapZoom, setMapZoom] = useState(11);

  // Auto-centering Google Maps onto selected intersection
  useEffect(() => {
    if (selectedIntersection) {
      setMapCenter({ lat: selectedIntersection.lat, lng: selectedIntersection.lon });
      setMapZoom(14);
    }
  }, [selectedIntersection]);

  // Utility to map Tailwind background classes to hex code color
  const getColorFromBgClass = (bgClass: string) => {
    if (bgClass.includes('emerald')) return '#10b981';
    if (bgClass.includes('red')) return '#ef4444';
    if (bgClass.includes('blue')) return '#3b82f6';
    if (bgClass.includes('amber')) return '#fbbf24';
    return '#94a3b8';
  };

  // Set up local map display mode configuration: 'connection' | 'smart_signal' | 'warranty' | 'dispatch'
  const [mapMode, setMapMode] = useState<'connection' | 'smart_signal' | 'warranty' | 'dispatch'>('connection');

  // Bounding box of Hualien intersections for accurate projection
  const bounds = useMemo(() => {
    return {
      minLon: 121.20,
      maxLon: 121.75,
      minLat: 23.10,
      maxLat: 24.30
    };
  }, []);

  // Convert longitude and latitude into percentage-based map coordinates
  const projectCoordinates = (lon: number, lat: number) => {
    const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * 100;
    // Map latitude in reverse (top is higher latitude, bottom is lower latitude)
    const y = 100 - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;
    return { x, y };
  };

  // Zoom manipulation
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.8));
  const handleReset = () => {
    setZoom(1.1);
    setPan({ x: 0, y: -40 });
  };

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  /**
   * Determine the visual configuration of the marker depending on selected single-select mapMode:
   * 1. connection: 連線 (emerald) / 未連線 (red)
   * 2. smart_signal: 動態控制 (emerald) / 優先控制 (blue) / 斷線 (slate)
   * 3. warranty: 保固中 (emerald) / 快過保 (amber) / 已過保 (red)
   * 4. dispatch: 派工中 (red) / 無派工 (slate)
   */
  const getMarkerStyle = (item: Intersection) => {
    switch (mapMode) {
      case 'connection': {
        if (item.status === 'E_ONLINE') {
          return {
            bg: 'bg-emerald-500',
            border: 'border-white shadow-sm ring-1 ring-emerald-300',
            text: 'text-emerald-700 bg-emerald-50',
            label: '連線',
            ping: ''
          };
        } else {
          return {
            bg: 'bg-red-500',
            border: 'border-white shadow-sm ring-1 ring-red-300',
            text: 'text-red-700 bg-red-50',
            label: '未連線',
            ping: item.status === 'E_TIMEOUT' ? 'animate-pulse' : ''
          };
        }
      }

      case 'smart_signal': {
        if (item.status === 'E_OFFLINE' || item.status === 'E_TIMEOUT') {
          return {
            bg: 'bg-slate-400',
            border: 'border-white shadow-sm ring-1 ring-slate-300',
            text: 'text-slate-700 bg-slate-50',
            label: '定時',
            ping: ''
          };
        } else {
          if (item.controllerType === 'MGC-3100' || item.controllerType === 'ITC-2000') {
            return {
              bg: 'bg-emerald-500',
              border: 'border-white shadow-sm ring-1 ring-emerald-300',
              text: 'text-emerald-700 bg-emerald-50',
              label: '動態控制',
              ping: ''
            };
          } else {
            return {
              bg: 'bg-blue-500',
              border: 'border-white shadow-sm ring-1 ring-blue-300',
              text: 'text-blue-700 bg-blue-50',
              label: '優先控制',
              ping: ''
            };
          }
        }
      }

      case 'warranty': {
        if (item.warranty === 'W_EXPIRED') {
          return {
            bg: 'bg-red-500',
            border: 'border-white shadow-sm ring-1 ring-red-300',
            text: 'text-red-700 bg-red-50',
            label: '已過保',
            ping: ''
          };
        } else {
          const index = intersections.findIndex(i => i.id === item.id);
          const isSoonExpiring = index !== -1 && index % 4 === 1;
          if (isSoonExpiring) {
            return {
              bg: 'bg-amber-400',
              border: 'border-white shadow-sm ring-1 ring-amber-300',
              text: 'text-amber-700 bg-amber-50',
              label: '快過保',
              ping: 'animate-pulse'
            };
          } else {
            return {
              bg: 'bg-emerald-500',
              border: 'border-white shadow-sm ring-1 ring-emerald-300',
              text: 'text-emerald-700 bg-emerald-50',
              label: '保固中',
              ping: ''
            };
          }
        }
      }

      case 'dispatch': {
        const isDispatching = item.caseStatus === 'C_PENDING' || item.caseStatus === 'C_ING';
        if (isDispatching) {
          return {
            bg: 'bg-red-500',
            border: 'border-red-200 ring-2 ring-red-400',
            text: 'text-red-700 bg-red-50',
            label: '派工中',
            ping: 'animate-ping duration-1000'
          };
        } else {
          return {
            bg: 'bg-slate-400',
            border: 'border-white shadow-sm',
            text: 'text-slate-500 bg-slate-50',
            label: '無派工',
            ping: ''
          };
        }
      }

      default:
        return {
          bg: 'bg-blue-500',
          border: 'border-white shadow-xs',
          text: 'text-blue-700 bg-blue-50',
          label: '號誌路口',
          ping: ''
        };
    }
  };

  return (
    <div id="hualien_map_dashboard" className="h-full flex flex-col bg-slate-50 overflow-hidden relative">
      
      {/* Map Control Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-col md:flex-row gap-2">
        {/* Zoom Controls */}
        <div className="bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/80 rounded-xl p-1.5 flex gap-1">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 transition"
            title="放大"
            id="btn_zoom_in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 transition"
            title="縮小"
            id="btn_zoom_out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 transition"
            title="重設視角"
            id="btn_zoom_reset"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Layer Switch Controls (圖層切換 - 改為單選方式共 4 種選擇) */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/80 rounded-xl p-3.5 w-68">
          <h3 className="text-xs font-bold text-slate-400 tracking-wider mb-2.5 flex items-center justify-between">
            <span>圖層切換</span>
            <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase font-mono tracking-wider">Control</span>
          </h3>
          <div className="space-y-2">
            
            {/* 1. 連線/未連線 */}
            <div 
              onClick={() => setMapMode('connection')}
              className={`p-2 rounded-lg border transition cursor-pointer flex flex-col ${
                mapMode === 'connection' 
                  ? 'bg-emerald-50/20 border-emerald-200 shadow-xs' 
                  : 'bg-transparent border-slate-100 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="map_mode"
                  checked={mapMode === 'connection'}
                  onChange={() => setMapMode('connection')}
                  className="w-3.5 h-3.5 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
                />
                <span className="text-xs font-bold text-slate-700">1. 選擇連線/未連線</span>
              </div>
              <div className="mt-1.5 pl-5 flex items-center gap-2 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>連線</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>未連線</span>
                </span>
              </div>
            </div>

            {/* 2. 智慧號誌/定時 */}
            <div 
              onClick={() => setMapMode('smart_signal')}
              className={`p-2 rounded-lg border transition cursor-pointer flex flex-col ${
                mapMode === 'smart_signal' 
                  ? 'bg-blue-50/20 border-blue-200 shadow-xs' 
                  : 'bg-transparent border-slate-100 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="map_mode"
                  checked={mapMode === 'smart_signal'}
                  onChange={() => setMapMode('smart_signal')}
                  className="w-3.5 h-3.5 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
                />
                <span className="text-xs font-bold text-slate-700">2. 選擇智慧號誌/定時</span>
              </div>
              <div className="mt-1.5 pl-5 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>動態控制</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>優先控制</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  <span>定時</span>
                </span>
              </div>
            </div>

            {/* 3. 保固狀態 */}
            <div 
              onClick={() => setMapMode('warranty')}
              className={`p-2 rounded-lg border transition cursor-pointer flex flex-col ${
                mapMode === 'warranty' 
                  ? 'bg-amber-50/20 border-amber-200 shadow-xs' 
                  : 'bg-transparent border-slate-100 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="map_mode"
                  checked={mapMode === 'warranty'}
                  onChange={() => setMapMode('warranty')}
                  className="w-3.5 h-3.5 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
                />
                <span className="text-xs font-bold text-slate-700">3. 選擇保固狀態</span>
              </div>
              <div className="mt-1.5 pl-5 flex items-center gap-2 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>保固中</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>快過保</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>已過保</span>
                </span>
              </div>
            </div>

            {/* 4. 派工資訊 */}
            <div 
              onClick={() => setMapMode('dispatch')}
              className={`p-2 rounded-lg border transition cursor-pointer flex flex-col ${
                mapMode === 'dispatch' 
                  ? 'bg-red-50/20 border-red-200 shadow-xs' 
                  : 'bg-transparent border-slate-100 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="map_mode"
                  checked={mapMode === 'dispatch'}
                  onChange={() => setMapMode('dispatch')}
                  className="w-3.5 h-3.5 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
                />
                <span className="text-xs font-bold text-slate-700">4. 選擇派工資訊</span>
              </div>
              <div className="mt-1.5 pl-5 flex items-center gap-2 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  <span>派工中</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  <span>無派工</span>
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Map Stage and SVG backgrounds */}
      <div
        className={`w-full h-full overflow-hidden select-none relative cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute inset-0 transition-transform duration-100 ease-out origin-center z-10"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* Geographical Canvas */}
          <div className="absolute top-[10%] left-[25%] w-[500px] h-[750px] relative">
            
            {/* Styled Ocean Base */}
            <div className="absolute inset-[-400px] bg-sky-100/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
            
            {/* SVG Vector Layout of Hualien County */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-white pointer-events-none">
              {/* Generalized Hualien outline */}
              <defs>
                <linearGradient id="hualien-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#f8fafc" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              
              {/* Outline Path of Hualien Region */}
              <path
                d="M 45,2 L 53,8 L 56,12 L 65,18 L 68,22 L 72,28 L 74,33 L 72,40 L 68,48 L 58,58 L 54,65 L 50,72 L 48,82 L 44,92 L 40,98 C 30,90 28,78 30,68 C 31,60 26,55 24,48 C 22,40 25,32 28,25 C 31,18 35,10 45,2 Z"
                fill="url(#hualien-grad)"
                stroke="#cbd5e1"
                strokeWidth="0.5"
                className="transition duration-300"
              />

              {/* Pacific Ocean Border Line */}
              <path
                d="M 65,18 C 65,18 73,28 74,33"
                stroke="#93c5fd"
                strokeWidth="0.4"
                strokeDasharray="1,1"
              />
              
              {/* Secondary Land borders (West Side - Central Range mountains) */}
              <path
                d="M 45,2 C 40,8 35,18 31,25"
                stroke="#e2e8f0"
                strokeWidth="0.3"
              />

              {/* Highway Trunks to provide orientation context (台9線 - East Rift Valley) */}
              <path
                d="M 51,5 C 51,5 57,17 60,25 C 62,31 60,37 57,43 C 54,50 49,60 46,72 C 43,84 41,95 41,97"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="0.6"
                strokeOpacity="0.5"
                strokeDasharray="2,1"
              />
              <text x="50" y="32" fill="#3b82f6" fontSize="1.4" opacity="0.4" transform="rotate(78, 50,32)">台9線 縱谷公路</text>

              {/* Coastal Highway Trunk (台11線 - Coastal road) */}
              <path
                d="M 68,22 Q 72,35 68,45 T 57,63 T 44,90"
                fill="none"
                stroke="#d946ef"
                strokeWidth="0.4"
                strokeOpacity="0.4"
              />
              <text x="69" y="40" fill="#d946ef" fontSize="1.3" opacity="0.4" transform="rotate(82, 69,40)">台11線 海岸公路</text>
              
              {/* Geographic Region Label indicators */}
              <text x="56" y="16" fill="#94a3b8" fontSize="2.2" fontWeight="600" opacity="0.8">花蓮市區域</text>
              <text x="46" y="24" fill="#94a3b8" fontSize="2" fontWeight="600" opacity="0.7">吉安鄉</text>
              <text x="41" y="38" fill="#94a3b8" fontSize="2" fontWeight="600" opacity="0.6">壽豐鄉</text>
              <text x="43" y="52" fill="#94a3b8" fontSize="1.8" fontWeight="600" opacity="0.6">鳳林鎮</text>
              <text x="35" y="68" fill="#94a3b8" fontSize="1.8" fontWeight="600" opacity="0.5">光復鄉</text>
              <text x="36" y="80" fill="#94a3b8" fontSize="1.8" fontWeight="600" opacity="0.5">玉里鎮</text>
              <text x="34" y="93" fill="#94a3b8" fontSize="1.8" fontWeight="600" opacity="0.5">富里鄉</text>

              <text x="73" y="60" fill="#2563eb" fontSize="2" opacity="0.25" transform="rotate(-90, 73, 60)">太平洋 Pacific Ocean</text>
              <text x="25" y="45" fill="#15803d" fontSize="2.2" opacity="0.2" transform="rotate(80, 25, 45)">中央山脈 Central Range</text>
            </svg>

            {/* Render Intersection Points on top */}
            <div className="absolute inset-0 pointer-events-none">
              
              {intersections.map(item => {
                const coords = projectCoordinates(item.lon, item.lat);
                const visual = getMarkerStyle(item);
                const isSelected = selectedIntersection && selectedIntersection.id === item.id;
                
                return (
                  <div
                    key={item.id}
                    id={`marker_pin_${item.id}`}
                    className="absolute pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
                    style={{
                      left: `${coords.x}%`,
                      top: `${coords.y}%`,
                      zIndex: isSelected ? 40 : (hoveredIntersection?.id === item.id ? 30 : 10)
                    }}
                    onClick={() => onSelectIntersection(item)}
                    onMouseEnter={() => setHoveredIntersection(item)}
                    onMouseLeave={() => setHoveredIntersection(null)}
                  >
                    
                    {/* Ring Pulse for urgent active dispatch tickets */}
                    {visual.ping && (
                      <span className={`absolute inset-0 w-6 h-6 -m-1 rounded-full ${visual.ping} ${visual.bg} opacity-40 pointer-events-none`}></span>
                    )}

                    {/* Interactive Marker Pin */}
                    <div
                      className={`w-3.5 h-3.5 rounded-full transition-transform duration-200 border-2 ${visual.bg} ${visual.border} ${
                        isSelected ? 'scale-175 shadow-lg border-white ring-4 ring-blue-500/80 ring-offset-1' : 'hover:scale-135 shadow'
                      }`}
                    >
                      {/* Active Case Inner dot indicator */}
                      {item.caseStatus !== 'C_NONE' && (
                        <div className="w-1.5 h-1.5 m-px rounded-full bg-white animate-pulse"></div>
                      )}
                    </div>

                    {/* Pop Label on hover or selection */}
                    <AnimatePresence>
                      {(isSelected || hoveredIntersection?.id === item.id) && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.9 }}
                          animate={{ opacity: 1, y: -4, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-slate-900 text-white text-xs py-1.5 px-2.5 rounded-lg whitespace-nowrap shadow-xl flex flex-col gap-0.5 z-50 pointer-events-none"
                        >
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="bg-slate-700 text-slate-300 font-mono px-1 rounded text-[10px]">{item.id}</span>
                            <span>{item.name}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 mt-1 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                            <span>域: {item.district}</span>
                            <span className="flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${visual.bg}`}></span>
                              <span>{visual.label}</span>
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                );
              })}

            </div>

          </div>
        </div>
      </div>

      {/* Map Legend Overlay showing marker semantics */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/80 rounded-xl p-3 flex flex-wrap gap-4 text-xs">
        <div className="flex flex-col gap-1.5">
          <span className="font-semibold text-slate-400 font-mono tracking-wider text-[10px] uppercase">
            當前圖樣圖例 ({
              mapMode === 'connection' ? '連線狀態' :
              mapMode === 'smart_signal' ? '智慧號誌/定時' :
              mapMode === 'warranty' ? '保固狀態' : '派工資訊'
            })
          </span>
          <div className="flex gap-4">
            
            {mapMode === 'connection' && (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="text-slate-700">綠色表示連線</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                  <span className="text-slate-700">紅色表示未連線</span>
                </span>
              </div>
            )}

            {mapMode === 'smart_signal' && (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="text-slate-700">綠色表示動態控制</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                  <span className="text-slate-700">藍色表示優先控制</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
                  <span className="text-slate-700">灰色表示定時</span>
                </span>
              </div>
            )}

            {mapMode === 'warranty' && (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="text-slate-700">綠色表示保固中</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                  <span className="text-slate-700">黃色表示快過保</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                  <span className="text-slate-700">紅色表示已過保</span>
                </span>
              </div>
            )}

            {mapMode === 'dispatch' && (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse inline-block"></span>
                  <span className="text-slate-700">紅色表示派工中</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
                  <span className="text-slate-700">灰色表示無派工</span>
                </span>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Floating Panel showing selected intersection summary details */}
      <AnimatePresence>
        {selectedIntersection && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="absolute bottom-4 right-4 left-4 md:left-auto md:w-[420px] bg-white/95 backdrop-blur-md shadow-2xl border border-blue-200/90 rounded-xl p-4 z-20 pointer-events-auto"
            id="panel_bottom_selected_detail"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md">
                    {selectedIntersection.id}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {selectedIntersection.district}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-1">
                  {selectedIntersection.name}
                </h4>
              </div>
              <button
                onClick={() => onSelectIntersection(selectedIntersection)} // toggle closing by calling it or we close it
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-3.5">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col">
                <span className="text-slate-400 font-medium pb-1 flex items-center gap-1"><Wifi className="w-3 h-3" /> 當前通訊</span>
                {selectedIntersection.status === 'E_ONLINE' ? (
                  <span className="text-emerald-700 font-bold">在線中 (Active)</span>
                ) : selectedIntersection.status === 'E_TIMEOUT' ? (
                  <span className="text-amber-700 font-bold">連線逾時 (Timeout)</span>
                ) : (
                  <span className="text-gray-600 font-bold">連線中斷 (Offline)</span>
                )}
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                  IP: {selectedIntersection.ip}:{selectedIntersection.port}
                </span>
              </div>

              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col">
                <span className="text-slate-400 font-medium pb-1 flex items-center gap-1"><Shield className="w-3 h-3" /> 合約保固</span>
                {selectedIntersection.warranty === 'W_VALID' ? (
                  <span className="text-sky-700 font-bold">保固期內 (Warranty)</span>
                ) : (
                  <span className="text-purple-700 font-bold">合約過保 (Expired)</span>
                )}
                <span className="text-[10px] text-slate-400 mt-0.5">
                  保固日期: {selectedIntersection.installDate}
                </span>
              </div>

              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col">
                <span className="text-slate-400 font-medium pb-1">🚦 號誌運行</span>
                <span className="text-slate-800 font-semibold">{selectedIntersection.phaseCount} 時相數 (週期 {selectedIntersection.cycleTime} 秒)</span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                  控制器: {selectedIntersection.controllerType}
                </span>
              </div>

              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col justify-between">
                <span className="text-slate-400 font-medium pb-1 flex items-center gap-1">✨ 智慧號誌資訊</span>
                <span className="text-slate-800 font-semibold flex items-center justify-between">
                  <span>正常運作中</span>
                  <button
                    onClick={() => {
                      setSmartSignalsStatus(prev => ({
                        ...prev,
                        [selectedIntersection.id]: !((prev[selectedIntersection.id] ?? true))
                      }));
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      (smartSignalsStatus[selectedIntersection.id] ?? true) ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        (smartSignalsStatus[selectedIntersection.id] ?? true) ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </span>
                <span className="text-[10px] text-slate-400">
                  狀態: {(smartSignalsStatus[selectedIntersection.id] ?? true) ? '系統開啟' : '系統關閉'}
                </span>
              </div>
            </div>

            {/* Render information if there is an active dispatch ticket */}
            {selectedIntersection.case ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 mb-3.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1 text-xs font-bold text-red-800">
                    <Wrench className="w-3.5 h-3.5 text-red-600" />
                    派工案件: {selectedIntersection.case.priority}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedIntersection.case.status === '待派工' ? 'bg-red-100 text-red-700' :
                    selectedIntersection.case.status === '處理中' ? 'bg-orange-100 text-orange-700 animate-pulse' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {selectedIntersection.case.status}
                  </span>
                </div>
                <h5 className="font-bold text-slate-900 text-sm">{selectedIntersection.case.title}</h5>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                  {selectedIntersection.case.description}
                </p>
                <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-red-200/50 text-[10px] text-slate-500">
                  <span>指派人員: {selectedIntersection.case.assignedTo}</span>
                  <span>通報時間: {selectedIntersection.case.reportTime}</span>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 px-3 mb-3.5 text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                <span>✓</span>
                <span>此路口號誌目前運行良好，無待修復或保養派工案件。</span>
              </div>
            )}

            <div className="text-[11px] text-slate-400 text-right italic font-mono">
              經緯度: {selectedIntersection.lon.toFixed(5)}, {selectedIntersection.lat.toFixed(5)}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
