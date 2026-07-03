import { Intersection, DispatchCase } from './types';

// Raw list extracted from the user's CSV data with geographic coordinates, connection specifics, and district matching
const rawCSVIntersections = [
  { id: "TC01", lon: 121.618397, lat: 23.989057, ip: "172.16.102.29", port: 4001, addr: 1, defaultName: "中山路與國聯一路口", district: "花蓮市" },
  { id: "TC02", lon: 121.618596, lat: 23.990392, ip: "172.16.101.180", port: 4001, addr: 2, defaultName: "中山路與國聯二路口", district: "花蓮市" },
  { id: "TC03", lon: 121.616275, lat: 23.989351, ip: "172.16.102.31", port: 4001, addr: 3, defaultName: "建國路與自強路口", district: "花蓮市" },
  { id: "TC04", lon: 121.61659, lat: 23.990669, ip: "172.16.102.32", port: 4001, addr: 4, defaultName: "建國路與商校街口", district: "花蓮市" },
  { id: "TC06", lon: 121.61294, lat: 24.00675, ip: "172.16.101.26", port: 4100, addr: 6, defaultName: "台9線與北埔路口", district: "新城鄉" },
  { id: "TC07", lon: 121.61394, lat: 24.0072, ip: "172.16.101.27", port: 4100, addr: 7, defaultName: "台9線與康樂路口", district: "新城鄉" },
  { id: "TC09", lon: 121.61839, lat: 24.0063, ip: "172.16.101.6", port: 4100, addr: 9, defaultName: "台9線與府前路口", district: "花蓮市" },
  { id: "TC10", lon: 121.61918, lat: 24.00333, ip: "172.16.101.8", port: 4100, addr: 10, defaultName: "台9線與民權五街口", district: "花蓮市" },
  { id: "TC12", lon: 121.62141, lat: 23.99717, ip: "172.16.101.37", port: 4100, addr: 12, defaultName: "台9線與中正路口", district: "花蓮市" },
  { id: "TC13", lon: 121.57471, lat: 23.97552, ip: "172.16.4.106", port: 4100, addr: 13, defaultName: "台9丙線與仁里二街口", district: "吉安鄉" },
  { id: "TC14", lon: 121.57097, lat: 23.97054, ip: "172.16.101.45", port: 4001, addr: 14, defaultName: "吉安路一段與中華路口", district: "吉安鄉" },
  { id: "TC17", lon: 121.57696, lat: 23.963135, ip: "172.16.101.11", port: 4100, addr: 17, defaultName: "台9線與中山路三段", district: "吉安鄉" },
  { id: "TC20", lon: 121.56348, lat: 23.95937, ip: "172.16.101.46", port: 4100, addr: 20, defaultName: "中山路三段與吉興路口", district: "吉安鄉" },
  { id: "TC21", lon: 121.55434, lat: 23.959687, ip: "172.16.101.34", port: 4100, addr: 21, defaultName: "台9線與大學路一段", district: "壽豐鄉" },
  { id: "TC22", lon: 121.56129, lat: 23.95607, ip: "172.16.101.35", port: 4100, addr: 22, defaultName: "中央路三段與中正路口", district: "吉安鄉" },
  { id: "TC24", lon: 121.55211, lat: 23.956132, ip: "172.16.101.31", port: 4100, addr: 24, defaultName: "台9線與志學二街口", district: "壽豐鄉" },
  { id: "TC25", lon: 121.55044, lat: 23.953587, ip: "172.16.101.33", port: 4100, addr: 25, defaultName: "台9線與志學五街口", district: "壽豐鄉" },
  { id: "TC26", lon: 121.55916, lat: 23.952334, ip: "172.16.101.44", port: 4100, addr: 26, defaultName: "吉興路與中興街口", district: "吉安鄉" },
  { id: "TC28", lon: 121.55168, lat: 23.946137, ip: "172.16.101.48", port: 4001, addr: 28, defaultName: "台9線與豐田中山路口", district: "壽豐鄉" },
  { id: "TC29", lon: 121.54752, lat: 23.944839, ip: "172.16.5.42", port: 4100, addr: 29, defaultName: "台9丙線與溪口二街口", district: "壽豐鄉" },
  { id: "TC30", lon: 121.54477, lat: 23.941315, ip: "172.16.5.74", port: 4100, addr: 30, defaultName: "台9線與大恩路口", district: "壽豐鄉" },
  { id: "TC31", lon: 121.53555, lat: 23.92489, ip: "172.16.101.32", port: 4100, addr: 31, defaultName: "台9線與鳳林光復路口", district: "鳳林鎮" },
  { id: "TC32", lon: 121.60443, lat: 23.925324, ip: "172.16.5.138", port: 4100, addr: 32, defaultName: "台11線與大德街口", district: "壽豐鄉" },
  { id: "TC33", lon: 121.55285, lat: 23.895219, ip: "172.16.5.170", port: 4100, addr: 33, defaultName: "台11丙線與東華大學路口", district: "壽豐鄉" },
  { id: "TC34", lon: 121.54785, lat: 23.889512, ip: "172.16.101.39", port: 4100, addr: 34, defaultName: "台11丙線與志學北街口", district: "壽豐鄉" },
  { id: "TC35", lon: 121.54616, lat: 23.887748, ip: "172.16.101.30", port: 4100, addr: 35, defaultName: "台11丙線與志學南街口", district: "壽豐鄉" },
  
  // TCI系列
  { id: "TCI-001", lon: 121.613294, lat: 23.981946, ip: "172.16.102.78", port: 4001, addr: 65535, defaultName: "建國路與中山路口", district: "花蓮市" },
  { id: "TCI-002", lon: 121.532954, lat: 23.917097, ip: "172.16.102.60", port: 4001, addr: 65535, defaultName: "台9線 202K+300 陸橋處", district: "壽豐鄉" },
  { id: "TCI-003", lon: 121.531438, lat: 23.91188, ip: "172.16.102.62", port: 4001, addr: 65535, defaultName: "台9線 202K+950 路口", district: "壽豐鄉" },
  { id: "TCI-004", lon: 121.530973, lat: 23.910363, ip: "172.16.102.54", port: 4001, addr: 65535, defaultName: "台9線 203K+080 處", district: "壽豐鄉" },
  { id: "TCI-005", lon: 121.530536, lat: 23.90885, ip: "172.16.102.61", port: 4001, addr: 65535, defaultName: "台9線 203K+200 連接道", district: "壽豐鄉" },
  { id: "TCI-006", lon: 121.530017, lat: 23.907238, ip: "172.16.102.55", port: 4001, addr: 65535, defaultName: "台9線 203K+480 鳳林北口", district: "鳳林鎮" },
  { id: "TCI-007", lon: 121.529407, lat: 23.905168, ip: "172.16.102.56", port: 4001, addr: 65535, defaultName: "台9線 203K+670 路口", district: "鳳林鎮" },
  { id: "TCI-008", lon: 121.526417, lat: 23.894485, ip: "172.16.102.57", port: 4001, addr: 65535, defaultName: "台9線 204K+950 鳳興路口", district: "鳳林鎮" },
  { id: "TCI-009", lon: 121.525128, lat: 23.890963, ip: "172.16.102.58", port: 4001, addr: 65535, defaultName: "台9線 205K+300 林榮國小口", district: "鳳林鎮" },
  { id: "TCI-010", lon: 121.524373, lat: 23.888406, ip: "172.16.102.59", port: 4001, addr: 65535, defaultName: "台9線 205K+600 太同街口", district: "鳳林鎮" },
  { id: "TCI-011", lon: 121.522223, lat: 23.883591, ip: "172.16.102.79", port: 4001, addr: 65535, defaultName: "台9線 206K+200 水源路口", district: "鳳林鎮" },
  { id: "TCI-012", lon: 121.279173, lat: 23.214594, ip: "172.16.102.63", port: 4001, addr: 65535, defaultName: "玉里鎮 台9線 293K+650 樂和", district: "玉里鎮" },
  { id: "TCI-013", lon: 121.596587, lat: 23.988569, ip: "172.16.102.70", port: 4001, addr: 65535, defaultName: "國興一街與國興二街口", district: "花蓮市" },
  { id: "TCI-014", lon: 121.606906, lat: 24.026245, ip: "172.16.102.71", port: 4001, addr: 65535, defaultName: "新城鄉 嘉里路與佳林路口", district: "新城鄉" },
  { id: "TCI-015", lon: 121.568357, lat: 23.956722, ip: "172.16.102.72", port: 4001, addr: 65535, defaultName: "吉安鄉 中山路與中央路口", district: "吉安鄉" },
  { id: "TCI-016", lon: 121.605823, lat: 23.972238, ip: "172.16.102.73", port: 4001, addr: 65535, defaultName: "重慶路與和平路口", district: "花蓮市" },
  { id: "TCI-017", lon: 121.6255, lat: 23.989831, ip: "172.16.102.74", port: 4001, addr: 65535, defaultName: "海濱路與中山路口", district: "花蓮市" },
  { id: "TCI-018", lon: 121.377523, lat: 23.498332, ip: "172.16.102.75", port: 4001, addr: 65535, defaultName: "瑞穗鄉 中正北路與溫泉路口", district: "瑞穗鄉" },
  { id: "TCI-019", lon: 121.587639, lat: 23.967459, ip: "172.16.102.76", port: 4001, addr: 65535, defaultName: "吉安鄉 中山路一段與吉豐路口", district: "吉安鄉" },
  { id: "TCI-020", lon: 121.584698, lat: 23.975701, ip: "172.16.102.77", port: 4001, addr: 65535, defaultName: "中原路與中華路口", district: "花蓮市" },
  { id: "TCI-021", lon: 121.422741, lat: 23.714633, ip: "172.16.102.96", port: 4001, addr: 65535, defaultName: "光復鄉 台9線 228K+750 中華路", district: "光復鄉" },
  { id: "TCI-022", lon: 121.423467, lat: 23.716248, ip: "172.16.102.97", port: 4001, addr: 65535, defaultName: "光復鄉 中山路與中正路口", district: "光復鄉" },
  { id: "TCI-023", lon: 121.566677, lat: 23.901538, ip: "172.16.102.98", port: 4001, addr: 65535, defaultName: "台11丙線 3K+850 農場入口", district: "壽豐鄉" },
  { id: "TCI-024", lon: 121.573169, lat: 23.907571, ip: "172.16.102.99", port: 4001, addr: 65535, defaultName: "台11丙線 2K+900 新城橋頭", district: "壽豐鄉" },
  { id: "TCI-025", lon: 121.530392, lat: 23.863542, ip: "172.16.102.100", port: 4001, addr: 65535, defaultName: "台11丙線 9K+500 豐坪路", district: "壽豐鄉" },
  { id: "TCI-026", lon: 121.562186, lat: 23.78411, ip: "172.16.102.101", port: 4001, addr: 65535, defaultName: "台11線 23K+700 鹽寮段", district: "豐濱鄉" },
  { id: "TCI-027", lon: 121.502695, lat: 23.825015, ip: "172.16.102.102", port: 4001, addr: 65535, defaultName: "台11線 14K+800 水璉段", district: "壽豐鄉" },
  { id: "TCI-028", lon: 121.410127, lat: 23.69765, ip: "172.16.102.103", port: 4001, addr: 65535, defaultName: "台9線 231K+100 光復國中路口", district: "光復鄉" },
  { id: "TCI-029", lon: 121.616643, lat: 24.007384, ip: "172.16.102.104", port: 4001, addr: 65535, defaultName: "新城鄉 台9線與佳民路口", district: "新城鄉" },
  
  // TCJin系列
  { id: "TCJin037", lon: 121.612668, lat: 23.985021, ip: "172.16.101.100", port: 4001, addr: 37, defaultName: "和平路與民國路口", district: "花蓮市" },
  { id: "TCJin038", lon: 121.609277, lat: 23.981238, ip: "172.16.101.101", port: 4001, addr: 38, defaultName: "林森路與和平路口", district: "花蓮市" },
  { id: "TCJin039", lon: 121.630839, lat: 23.998389, ip: "172.16.101.102", port: 4001, addr: 39, defaultName: "美崙府前路與民權路口", district: "花蓮市" },
  { id: "TCJin040", lon: 121.572395, lat: 23.987626, ip: "172.16.101.103", port: 4001, addr: 40, defaultName: "吉安鄉 建國路與中央路口", district: "吉安鄉" },
  { id: "TCJin042", lon: 121.625037, lat: 23.986796, ip: "172.16.101.96", port: 4001, addr: 42, defaultName: "海濱路與和平路口", district: "花蓮市" },
  { id: "TCJin043", lon: 121.628415, lat: 23.99095, ip: "172.16.101.106", port: 4001, addr: 43, defaultName: "中正路與復興路口", district: "花蓮市" },
  { id: "TCJin044", lon: 121.59273, lat: 23.985524, ip: "172.16.101.107", port: 4001, addr: 44, defaultName: "吉安鄉 吉安路與中央路口", district: "吉安鄉" },
  { id: "TCJin045", lon: 121.594019, lat: 23.967433, ip: "172.16.101.108", port: 4001, addr: 45, defaultName: "吉安鄉 慶豐路與自強路口", district: "吉安鄉" },
  { id: "TCJin046", lon: 121.562577, lat: 23.98233, ip: "172.16.101.109", port: 4001, addr: 46, defaultName: "吉安鄉 中山路二段與中央路口", district: "吉安鄉" },
  { id: "TCJin047", lon: 121.508812, lat: 23.862346, ip: "172.16.101.110", port: 4001, addr: 47, defaultName: "吉安鄉 吉興路與自立路口", district: "吉安鄉" },
  { id: "TCJin049", lon: 121.574091, lat: 23.968959, ip: "172.16.101.112", port: 4001, addr: 49, defaultName: "吉安鄉 慶豐十街與自強路口", district: "吉安鄉" },
  { id: "TCJin050", lon: 121.566239, lat: 23.97324, ip: "172.16.101.113", port: 4001, addr: 50, defaultName: "吉安鄉 慶豐三街與自強路口", district: "吉安鄉" },
  { id: "TCJin051", lon: 121.567465, lat: 23.970228, ip: "172.16.101.114", port: 4001, addr: 51, defaultName: "吉安鄉 慶豐一街與自強路口", district: "吉安鄉" },
  { id: "TCJin052", lon: 121.554695, lat: 23.895777, ip: "172.16.101.115", port: 4001, addr: 52, defaultName: "台11丙線 5K+200 水資源中心", district: "壽豐鄉" },
  { id: "TCJin053", lon: 121.552334, lat: 23.946692, ip: "172.16.101.116", port: 4001, addr: 53, defaultName: "台9丙線 豐田一街與大學路口", district: "壽豐鄉" },
  { id: "TCJin054", lon: 121.619059, lat: 23.992849, ip: "172.16.101.117", port: 4001, addr: 54, defaultName: "林森路與中山路口", district: "花蓮市" },
  { id: "TCJin055", lon: 121.58782, lat: 23.975218, ip: "172.16.101.118", port: 4001, addr: 6552, defaultName: "明豐街與慶豐路口", district: "吉安鄉" },
  { id: "TCJin056", lon: 121.317359, lat: 23.326919, ip: "172.16.101.119", port: 4001, addr: 56, defaultName: "富里鄉 台9線與富里市區路口", district: "富里鄉" },
  { id: "TCJin057", lon: 121.318989, lat: 23.336683, ip: "172.16.101.120", port: 4001, addr: 57, defaultName: "富里鄉 中山路與富中路口", district: "富里鄉" },
  { id: "TCJin058", lon: 121.318749, lat: 23.335032, ip: "172.16.101.99", port: 4001, addr: 58, defaultName: "富里鄉 永安街與中山路口", district: "富里鄉" },
  { id: "TCJin059", lon: 121.584211, lat: 23.955559, ip: "172.16.101.122", port: 4001, addr: 59, defaultName: "吉安鄉 東昌路與自強路口", district: "吉安鄉" },
  { id: "TCJin060", lon: 121.608936, lat: 23.972427, ip: "172.16.101.123", port: 4001, addr: 60, defaultName: "中華路與中正路口", district: "花蓮市" },
  
  // TCL 系列 (選取一部分)
  { id: "TCL002", lon: 121.5891, lat: 24.00305, ip: "172.16.101.80", port: 4001, addr: 65535, defaultName: "明禮路與中山路口", district: "花蓮市" },
  { id: "TCL004", lon: 121.5706, lat: 23.98977, ip: "172.16.101.78", port: 4001, addr: 65535, defaultName: "中央路二段與中原路口", district: "吉安鄉" },
  { id: "TCL005", lon: 121.574074, lat: 23.990221, ip: "172.16.101.77", port: 4001, addr: 65535, defaultName: "中央路二段與建國路口", district: "吉安鄉" },
  { id: "TCL006", lon: 121.60634, lat: 23.99344, ip: "172.16.101.76", port: 4001, addr: 65535, defaultName: "美崙中興路與民權九街口", district: "花蓮市" },
  { id: "TCL007", lon: 121.61128, lat: 23.97722, ip: "172.16.101.75", port: 4001, addr: 65535, defaultName: "中華路與和平路口", district: "花蓮市" },
  { id: "TCL008", lon: 121.61993, lat: 23.98426, ip: "172.16.101.74", port: 4001, addr: 65535, defaultName: "中正路與和平路口", district: "花蓮市" },
  { id: "TCL009", lon: 121.61778, lat: 23.98207, ip: "172.16.101.88", port: 4001, addr: 65535, defaultName: "中華路與南京街口", district: "花蓮市" },
  { id: "TCL010", lon: 121.60924, lat: 23.97845, ip: "172.16.101.87", port: 4001, addr: 65535, defaultName: "中華路與明義街口", district: "花蓮市" },
  { id: "TCL056", lon: 121.368884, lat: 23.499109, ip: "172.16.101.169", port: 4001, addr: 65535, defaultName: "瑞穗鄉 中山路二段與國光北路口", district: "瑞穗鄉" },
  { id: "TCL057", lon: 121.314734, lat: 23.326321, ip: "172.16.101.168", port: 4001, addr: 65535, defaultName: "富里鄉 中山路與富中路口", district: "富里鄉" },
  { id: "TCL058", lon: 121.31794, lat: 23.325326, ip: "172.16.101.144", port: 4001, addr: 65535, defaultName: "富里鄉 富里國小正門口", district: "富里鄉" },
  { id: "TCL119", lon: 121.266341, lat: 23.155209, ip: "172.16.101.207", port: 4001, addr: 65535, defaultName: "富里鄉 台9線與學田路口(學田國小)", district: "富里鄉" },
  { id: "TCL120", lon: 121.248308, lat: 23.176394, ip: "172.16.101.173", port: 4001, addr: 65535, defaultName: "富里鄉 台9線與竹田路口", district: "富里鄉" },
  { id: "TCL146", lon: 121.30453, lat: 23.268411, ip: "172.16.101.253", port: 4001, addr: 65535, defaultName: "玉里鎮 興國路與大同路口", district: "玉里鎮" },
  { id: "TCL147", lon: 121.30617, lat: 23.269254, ip: "172.16.101.252", port: 4001, addr: 65535, defaultName: "玉里鎮 中正路與康樂街口", district: "玉里鎮" },
  { id: "TCL148", lon: 121.280097, lat: 23.215923, ip: "172.16.101.254", port: 4001, addr: 65535, defaultName: "玉里鎮 光復路與民權路口", district: "玉里鎮" }
];

export const mockDispatchCases: Record<string, DispatchCase> = {
  'CASE-001': {
    id: 'CASE-001',
    title: 'TC01 號誌燈頭不亮與通訊異常',
    type: '號誌故障',
    status: '處理中',
    priority: '急件',
    assignedTo: '王小明 (工程師二組)',
    reportTime: '2026-06-10 06:15',
    deadline: '2026-06-10 12:00',
    description: '通報來源為市民專線1999。通報中山路與國聯一路口南向號誌燈頭完全不亮，現場流量大且危險。系統監測同時顯示該路口通訊逾時(E_TIMEOUT)。',
    logs: [
      { time: '06:15', action: '接收 1999 民眾通報，立案派單', user: '派工中心管理員' },
      { time: '06:30', action: '指派給維護工程師 王小明', user: '派工中心管理員' },
      { time: '07:10', action: '工程師到達現場，展開查修', user: '王小明' },
      { time: '07:45', action: '發現主板控制IC燒毀，已更換備件，通訊恢復，正測試燈號燈泡中', user: '王小明' }
    ],
    contractId: 'CONTRACT-114-001',
    caseCost: 65000,
    selectedContractItems: [
      { id: 'WK-005', name: '重載型智慧不中斷電力系統 (UPS)', price: 65000, qty: 1, unit: '組' }
    ]
  },
  'CASE-002': {
    id: 'CASE-002',
    title: 'TC24 實體線路與光纖中斷異常',
    type: '線路損壞',
    status: '待派工',
    priority: '普通',
    assignedTo: '待指派',
    reportTime: '2026-06-10 08:02',
    deadline: '2026-06-11 08:00',
    description: '巡檢回報，台9線與志學二街口附近因道路施工，造成路口實體光纖線路拉扯拉傷，號誌目前獨立運行但連線中斷(E_OFFLINE)。',
    logs: [
      { time: '08:02', action: '巡檢人員現場登記回報', user: '李工程師' },
      { time: '08:15', action: '系統建立案件，等待備料指派', user: '系統自動' }
    ],
    contractId: 'CONTRACT-114-001',
    caseCost: 120000,
    selectedContractItems: [
      { id: 'WK-002', name: '多時相號誌控制器主機組 (TYPE-A)', price: 45000, qty: 2, unit: '套' },
      { id: 'WK-004', name: '各項號誌控制整合箱體/架', price: 15000, qty: 2, unit: '組' }
    ]
  },
  'CASE-003': {
    id: 'CASE-003',
    title: 'TC33 號誌連線倒數顯示異常',
    type: '號誌故障',
    status: '已完工',
    priority: '一般',
    assignedTo: '陳大華 (工程師一組)',
    reportTime: '2026-06-09 14:20',
    deadline: '2026-06-09 18:00',
    description: '東華大學路口之行人倒數顯示器(小綠人)局部LED缺損。',
    logs: [
      { time: '14:20', action: '立案', user: '巡檢回報' },
      { time: '15:10', action: '指派給陳大華', user: '管理員' },
      { time: '16:05', action: '更換倒數顯示器面板與連接線', user: '陳大華' },
      { time: '16:30', action: '現場測試正常，結案', user: '陳大華' }
    ],
    contractId: 'CONTRACT-114-001',
    caseCost: 45000,
    selectedContractItems: [
      { id: 'WK-002', name: '多時相號誌控制器主機組 (TYPE-A)', price: 45000, qty: 1, unit: '套' }
    ]
  }
};

// Compile and decorate all intersections with dynamic but predictable/stable realistic properties.
// We map IDs to ensure we have cases, warranty, and status distributed properly.
export const hualienIntersections: Intersection[] = rawCSVIntersections.map((item, index) => {
  // Establish stability using modulo arithmetic based on index or ID
  const isTC01 = item.id === 'TC01';
  const isTC24 = item.id === 'TC24';
  const isTC33 = item.id === 'TC33';

  // 1. Connection status configuration
  let status: Intersection['status'] = 'E_ONLINE';
  if (isTC01) {
    status = 'E_TIMEOUT';
  } else if (isTC24) {
    status = 'E_OFFLINE';
  } else if (index % 12 === 3) {
    status = 'E_OFFLINE';
  } else if (index % 15 === 7) {
    status = 'E_TIMEOUT';
  }

  // 2. Warranty status configuration
  let warranty: Intersection['warranty'] = 'W_VALID';
  if (index % 3 === 0 || item.id.startsWith('TCL')) {
    warranty = 'W_EXPIRED';
  }

  // 3. Dispatch case association
  let caseStatus: Intersection['caseStatus'] = 'C_NONE';
  let associatedCase: DispatchCase | undefined = undefined;

  if (isTC01) {
    caseStatus = 'C_ING';
    associatedCase = mockDispatchCases['CASE-001'];
  } else if (isTC24) {
    caseStatus = 'C_PENDING';
    associatedCase = mockDispatchCases['CASE-002'];
  } else if (isTC33) {
    caseStatus = 'C_DONE';
    associatedCase = mockDispatchCases['CASE-003'];
  } else if (index % 13 === 5) {
    caseStatus = 'C_ING';
    associatedCase = {
      id: `CASE-GEN-${index}`,
      title: `${item.id} 定期保養與迴路檢測`,
      type: '定期保養',
      status: '處理中',
      priority: '一般',
      assignedTo: '黃師傅 (工程師三組)',
      reportTime: '2026-06-10 07:00',
      deadline: '2026-06-10 16:00',
      description: '例行性路口控制器電控箱內部清潔、保險絲與端子排固定檢查。',
      logs: [{ time: '07:00', action: '開工立案並執行清潔維護', user: '黃師傅' }]
    };
  }

  // Realistic telemetry data
  const flowRate = isTC01 ? 1420 : 250 + (index * 23) % 1200;
  const cycleTime = 60 + (index * 15) % 120;
  const phaseCount = 2 + (index % 3);
  const controllerTypes: Array<Intersection['controllerType']> = ['MGC-3100', 'ITC-2000', 'TC-800', 'NTCIP-90'];
  const controllerType = controllerTypes[index % controllerTypes.length];
  
  const installYear = 2018 + (index % 7);
  const installMonth = 1 + (index % 12);
  const installDate = `${installYear}-${String(installMonth).padStart(2, '0')}-15`;

  return {
    id: item.id,
    name: item.defaultName,
    district: item.district as Intersection['district'],
    lon: item.lon,
    lat: item.lat,
    ip: item.ip,
    port: item.port,
    status,
    warranty,
    caseStatus,
    case: associatedCase,
    flowRate,
    cycleTime,
    phaseCount,
    controllerType,
    installDate
  };
});

// Helper stats for dashboard reporting
export const dashboardStats = {
  total: hualienIntersections.length,
  online: hualienIntersections.filter(i => i.status === 'E_ONLINE').length,
  offline: hualienIntersections.filter(i => i.status === 'E_OFFLINE').length,
  timeout: hualienIntersections.filter(i => i.status === 'E_TIMEOUT').length,
  warrantyValid: hualienIntersections.filter(i => i.warranty === 'W_VALID').length,
  warrantyExpired: hualienIntersections.filter(i => i.warranty === 'W_EXPIRED').length,
  hasActiveCases: hualienIntersections.filter(i => i.caseStatus === 'C_PENDING' || i.caseStatus === 'C_ING').length,
  completedCasesToday: hualienIntersections.filter(i => i.caseStatus === 'C_DONE').length,
};
