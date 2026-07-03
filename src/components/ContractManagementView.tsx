import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Intersection, DispatchCase, Contract, SystemUser, MainTab } from '../types';
import { 
  FileText, 
  UploadCloud, 
  Trash2, 
  Link2, 
  Coins, 
  TrendingUp, 
  Plus, 
  FileSpreadsheet, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Briefcase, 
  PlusCircle, 
  FileCheck,
  Search,
  BookOpen,
  DollarSign,
  Eye,
  X,
  ExternalLink,
  Download,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface ContractManagementViewProps {
  intersections: Intersection[];
  contracts: Contract[];
  onUpdateContracts: (updatedContracts: Contract[]) => void;
  onUpdateIntersectionCase: (intersectionId: string, newCase: DispatchCase | undefined) => void;
  currentUser: SystemUser;
  onAutoSwitchTab?: (tab: MainTab) => void;
  onSelectIntersection?: (intersection: Intersection) => void;
}

export default function ContractManagementView({
  intersections,
  contracts,
  onUpdateContracts,
  onUpdateIntersectionCase,
  currentUser,
  onAutoSwitchTab,
  onSelectIntersection
}: ContractManagementViewProps) {
  const [selectedContractId, setSelectedCaseId] = useState<string>(contracts[0]?.id || '');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingFileName, setUploadingFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewingFile, setPreviewingFile] = useState<{ id: string; name: string; size: string; uploadTime: string } | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(100);

  // New Contract Form States
  const [newContractName, setNewContractName] = useState('');
  const [newContractType, setNewContractType] = useState('開口契約');
  const [newContractPartyA, setNewContractPartyA] = useState('花蓮縣政府');
  const [newContractPartyB, setNewContractPartyB] = useState('大亞交通號誌工程股份有限公司');
  const [newContractStart, setNewContractStart] = useState('2025-01-01');
  const [newContractEnd, setNewContractEnd] = useState('2026-12-31');
  const [newContractAmount, setNewContractAmount] = useState(13000000);
  
  // Budgets breakdown form states
  const [budgetEng, setBudgetEngineering] = useState(10837693);
  const [budgetSafety, setBudgetSafety] = useState(270846);
  const [budgetQuality, setBudgetQuality] = useState(264403);
  const [budgetProfit, setBudgetProfit] = useState(975670);
  const [budgetInsurance, setBudgetInsurance] = useState(32340);
  const [budgetTax, setBudgetTax] = useState(619048);

  const selectedContract = useMemo(() => {
    return contracts.find(c => c.id === selectedContractId) || contracts[0];
  }, [contracts, selectedContractId]);

  // Selected contract cases mapping
  const linkedCasesData = useMemo(() => {
    if (!selectedContract) return [];
    
    // Scan all dispatch cases in intersections
    const list: Array<{ intersectionId: string; intersectionName: string; case: DispatchCase }> = [];
    intersections.forEach(item => {
      if (item.case && item.case.contractId === selectedContract.id) {
        list.push({ 
          intersectionId: item.id, 
          intersectionName: item.name, 
          case: item.case 
        });
      }
    });
    return list;
  }, [intersections, selectedContract]);

  // Available cases to link (Active dispatch cases which haven't been linked to any contract yet)
  const availableCasesToLink = useMemo(() => {
    const list: Array<{ intersectionId: string; name: string; case: DispatchCase }> = [];
    intersections.forEach(item => {
      if (item.case && !item.case.contractId) {
        list.push({
          intersectionId: item.id,
          name: item.name,
          case: item.case
        });
      }
    });
    return list;
  }, [intersections]);

  // Calculated expenditures
  const calculatedExpenses = useMemo(() => {
    if (!selectedContract) return 0;
    
    // Sum of settled cost for all completed linked cases
    return linkedCasesData.reduce((sum, item) => {
      if (item.case.status === '已完工') {
        return sum + (item.case.caseCost || 0);
      }
      return sum;
    }, 0);
  }, [linkedCasesData, selectedContract]);

  // Sync settledAmount to contracts main state whenever expenditures recalculate (passive correction)
  React.useEffect(() => {
    if (selectedContract && selectedContract.settledAmount !== calculatedExpenses) {
      const updated = contracts.map(c => {
        if (c.id === selectedContract.id) {
          return {
            ...c,
            settledAmount: calculatedExpenses
          };
        }
        return c;
      });
      onUpdateContracts(updated);
    }
  }, [calculatedExpenses, selectedContract, contracts]);

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const simulateFileUpload = (fileName: string, fileSizeStr: string) => {
    setUploadingFileName(fileName);
    setUploadProgress(10);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Append newly uploaded file info
            if (selectedContract) {
              const newFile = {
                id: `FILE-${Date.now()}`,
                name: fileName,
                size: fileSizeStr,
                uploadTime: new Date().toISOString().replace('T', ' ').slice(0, 16)
              };
              const updated = contracts.map(c => {
                if (c.id === selectedContract.id) {
                  return {
                    ...c,
                    attachedFiles: [...c.attachedFiles, newFile]
                  };
                }
                return c;
              });
              onUpdateContracts(updated);
            }
            setUploadProgress(null);
            setUploadingFileName('');
          }, 500);
          return 100;
        }
        return prev + 15;
      });
    }, 150);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (!currentUser.permissions.canManageContracts) {
      alert('權限被拒！您目前的登入身分缺乏「合約與預算管理」權限。無法上傳合約附件。');
      return;
    }
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      simulateFileUpload(file.name, `${sizeMB} MB`);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser.permissions.canManageContracts) {
      alert('權限被拒！您目前的登入身分缺乏「合約與預算管理」權限。無法上傳合約附件。');
      return;
    }
    if (e.target.files && e.dataTransfer?.files?.[0] || e.target.files?.[0]) {
      const file = e.target.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      simulateFileUpload(file.name, `${sizeMB} MB`);
    }
  };

  // Bind a case caseCost value (settle workflow)
  const handleSetCaseCost = (intersectionId: string, caseObj: DispatchCase, cost: number) => {
    if (!currentUser.permissions.canManageContracts) {
      alert('權限被拒！您目前的登入身分缺乏「合約與預算管理」權限。無法設定工務計量經費。');
      return;
    }
    const updatedCase: DispatchCase = {
      ...caseObj,
      caseCost: cost
    };
    onUpdateIntersectionCase(intersectionId, updatedCase);
  };

  // Associate a dispatch case to target contract
  const handleLinkCaseToContract = (intersectionId: string, caseObj: DispatchCase) => {
    if (!currentUser.permissions.canManageContracts) {
      alert('權限被拒！您目前的登入身分缺乏「合約與預算管理」權限。無法指定及關聯標案。');
      return;
    }
    const updatedCase: DispatchCase = {
      ...caseObj,
      contractId: selectedContract.id,
      caseCost: caseObj.caseCost || 12500 // Assign mock default expenditure NT 12,500 if unset
    };
    onUpdateIntersectionCase(intersectionId, updatedCase);
  };

  // Unlink case from contract
  const handleUnlinkCaseFromContract = (intersectionId: string, caseObj: DispatchCase) => {
    if (!currentUser.permissions.canManageContracts) {
      alert('權限被拒！您目前的登入身分缺乏「合約與預算管理」權限。無法解除標案關聯。');
      return;
    }
    const { contractId, caseCost, ...rest } = caseObj;
    onUpdateIntersectionCase(intersectionId, {
      ...rest,
      status: caseObj.status // preserve status
    });
  };

  // Delete attached contract document file
  const handleDeleteContractFile = (fileId: string) => {
    if (!currentUser.permissions.canManageContracts) {
      alert('權限被拒！您目前的登入身分缺乏「合約與預算管理」權限。無法拆除檔案合規存封。');
      return;
    }
    if (confirm('確定要移除此合約封存文件檔案嗎？')) {
      const updated = contracts.map(c => {
        if (c.id === selectedContract.id) {
          return {
            ...c,
            attachedFiles: c.attachedFiles.filter(f => f.id !== fileId)
          };
        }
        return c;
      });
      onUpdateContracts(updated);
    }
  };

  // Open file preview content in a new standalone custom window
  const handleOpenInNewWindow = (file: { name: string; size: string; uploadTime: string }) => {
    const newWindow = window.open('', '_blank');
    if (!newWindow) {
      alert('彈出視窗已被瀏覽器封鎖，請允許快顯視窗再試一次！');
      return;
    }
    
    // Determine CSS and markup based on file type
    const isXlsx = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const isCertificate = file.name.includes('驗收合格');
    
    let previewHtml = '';
    if (isXlsx) {
      previewHtml = `
        <div style="background: #ffffff; color: #1e293b; border-radius: 12px; border: 1.5px solid #e2e8f0; padding: 25px; font-family: -apple-system, sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h2 style="margin-top:0; color:#2563eb; font-size: 20px; font-weight: 800; border-bottom: 2px solid #2563eb; padding-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            📊 ${file.name} (核定詳細價目表電子檢視)
          </h2>
          <p style="font-size:12px; color:#64748b; margin-bottom: 24px;">檔案大小: ${file.size} | 備份上傳時間: ${file.uploadTime}</p>
          <div style="overflow-x: auto;">
            <table style="width:100%; border-collapse: collapse; font-size:13px; text-align: left; min-width: 600px;">
              <thead>
                <tr style="background:#f8fafc; border-bottom: 2px solid #e2e8f0;">
                  <th style="padding:12px; font-weight:800; color:#475569;">編號</th>
                  <th style="padding:12px; font-weight:800; color:#475569;">工項名稱</th>
                  <th style="padding:12px; font-weight:800; color:#475569;">單位</th>
                  <th style="padding:12px; text-align: right; font-weight:800; color:#475569;">單價 (NT$)</th>
                  <th style="padding:12px; text-align: center; font-weight:800; color:#475569;">核定數量</th>
                  <th style="padding:12px; text-align: right; font-weight:800; color:#475569;">核定總複價 (NT$)</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding:12px; color:#64748b;">1</td>
                  <td style="padding:12px; font-weight:bold; color:#0f172a;">300mm LED型三色號誌燈頭</td>
                  <td style="padding:12px; color:#475569;">組</td>
                  <td style="padding:12px; text-align: right; font-family: monospace; font-weight: 600; color:#334155;">$8,200</td>
                  <td style="padding:12px; text-align: center; font-family: monospace; font-weight: 600; color:#334155;">85</td>
                  <td style="padding:12px; text-align: right; font-weight:bold; color:#16a34a; font-family: monospace;">$697,000</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding:12px; color:#64748b;">2</td>
                  <td style="padding:12px; font-weight:bold; color:#0f172a;">多時相號誌控制器主機組 (TYPE-A)</td>
                  <td style="padding:12px; color:#475569;">套</td>
                  <td style="padding:12px; text-align: right; font-family: monospace; font-weight: 600; color:#334155;">$45,000</td>
                  <td style="padding:12px; text-align: center; font-family: monospace; font-weight: 600; color:#334155;">12</td>
                  <td style="padding:12px; text-align: right; font-weight:bold; color:#16a34a; font-family: monospace;">$540,000</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding:12px; color:#64748b;">3</td>
                  <td style="padding:12px; font-weight:bold; color:#0f172a;">雷達/微波車輛感應偵測器</td>
                  <td style="padding:12px; color:#475569;">組</td>
                  <td style="padding:12px; text-align: right; font-family: monospace; font-weight: 600; color:#334155;">$38,000</td>
                  <td style="padding:12px; text-align: center; font-family: monospace; font-weight: 600; color:#334155;">18</td>
                  <td style="padding:12px; text-align: right; font-weight:bold; color:#16a34a; font-family: monospace;">$684,000</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding:12px; color:#64748b;">4</td>
                  <td style="padding:12px; font-weight:bold; color:#0f172a;">各項號誌控制整合箱體/架</td>
                  <td style="padding:12px; color:#475569;">組</td>
                  <td style="padding:12px; text-align: right; font-family: monospace; font-weight: 600; color:#334155;">$15,000</td>
                  <td style="padding:12px; text-align: center; font-family: monospace; font-weight: 600; color:#334155;">24</td>
                  <td style="padding:12px; text-align: right; font-weight:bold; color:#16a34a; font-family: monospace;">$360,000</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding:12px; color:#64748b;">5</td>
                  <td style="padding:12px; font-weight:bold; color:#0f172a;">重載型智慧不中斷電力系統 (UPS)</td>
                  <td style="padding:12px; color:#475569;">組</td>
                  <td style="padding:12px; text-align: right; font-family: monospace; font-weight: 600; color:#334155;">$65,000</td>
                  <td style="padding:12px; text-align: center; font-family: monospace; font-weight: 600; color:#334155;">10</td>
                  <td style="padding:12px; text-align: right; font-weight:bold; color:#16a34a; font-family: monospace;">$650,000</td>
                </tr>
                <tr style="border-bottom: 2px solid #e2e8f0; background:#f8fafc;">
                  <td colspan="5" style="padding:12px; font-weight:bold; text-align:right; color:#475569;">工程詳細價目款項合約小計：</td>
                  <td style="padding:12px; text-align: right; font-weight:800; color:#15803d; font-size:15px; font-family: monospace;">$10,837,693</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (isCertificate) {
      previewHtml = `
        <div style="background: #ffffff; color: #1e293b; border-radius: 12px; border: 8px double #1e3a8a; padding: 40px; font-family: 'Times New Roman', 'SimSun', serif; text-align: center; position:relative; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <h1 style="color:#1e3a8a; margin-bottom:5px; font-size:28px; font-weight:bold;">花蓮縣政府</h1>
          <h2 style="color:#1e3a8a; margin-top:0; margin-bottom:30px; letter-spacing:4px; font-size:22px;">工程收購及驗收結算合格證明書</h2>
          
          <table style="width:100%; border-collapse: collapse; margin-top:20px; font-size:14px; text-align: left; border: 1.5px solid #1e293b;">
            <tr>
              <td style="padding:12px; border: 1px solid #1e293b; font-weight:bold; background:#f1f5f9; width:25%;">工程名稱</td>
              <td style="padding:12px; border: 1px solid #1e293b;" colspan="3">113年度吉安鄉智慧路口及有聲號誌改善工程</td>
            </tr>
            <tr>
              <td style="padding:12px; border: 1px solid #1e293b; font-weight:bold; background:#f1f5f9;">承包廠商</td>
              <td style="padding:12px; border: 1px solid #1e293b;">聯立交通控制工程處</td>
              <td style="padding:12px; border: 1px solid #1e293b; font-weight:bold; background:#f1f5f9; width:20%;">契約編號</td>
              <td style="padding:12px; border: 1px solid #1e293b;">CONTRACT-113-005</td>
            </tr>
            <tr>
              <td style="padding:12px; border: 1px solid #1e293b; font-weight:bold; background:#f1f5f9;">合約總價</td>
              <td style="padding:12px; border: 1px solid #1e293b; font-weight:bold; color:#1d4ed8;">NT$ 3,500,000 元</td>
              <td style="padding:12px; border: 1px solid #1e293b; font-weight:bold; background:#f1f5f9;">最終結算金額</td>
              <td style="padding:12px; border: 1px solid #1e293b; font-weight:bold; color:#15803d;">NT$ 3,500,000 元</td>
            </tr>
            <tr>
              <td style="padding:12px; border: 1px solid #1e293b; font-weight:bold; background:#f1f5f9;">開工日期</td>
              <td style="padding:12px; border: 1px solid #1e293b;">2024-01-15</td>
              <td style="padding:12px; border: 1px solid #1e293b; font-weight:bold; background:#f1f5f9;">完工日期</td>
              <td style="padding:12px; border: 1px solid #1e293b;">2024-11-30</td>
            </tr>
            <tr>
              <td style="padding:12px; border: 1px solid #1e293b; font-weight:bold; background:#f1f5f9;">驗收結果</td>
              <td style="padding:12px; border: 1px solid #1e293b;" colspan="3">經本府工務處、監工單位及主計處聯合驗收，各項智慧感知設備及行車號誌運行效能良好，合乎國家CNS與契約標準，准予驗收合格結算。</td>
            </tr>
          </table>
          
          <div style="margin-top:40px; display:flex; justify-content:space-around; align-items:center;">
            <div style="text-align: left; font-size:13px;">
              <p>發證機關：花蓮縣政府</p>
              <p>發證日期：中華民國 一一三年 十二月 五日</p>
            </div>
            <div style="position:relative; width:90px; height:90px; border-radius:50%; border:2px solid #ef4444; display:flex; align-items:center; justify-content:center; color:#ef4444; font-weight:bold; font-size:12px; transform: rotate(-15deg);">
              <div style="text-align:center;">花蓮縣政府<br/>驗收合格章</div>
            </div>
          </div>
        </div>
      `;
    } else {
      previewHtml = `
        <div style="background: #ffffff; color: #1e293b; border-radius: 12px; border: 1px solid #cbd5e1; padding: 40px; font-family: sans-serif; box-shadow: 0 10px 25px rgba(0,0,0,0.05); line-height: 1.6;">
          <h2 style="color:#0f172a; margin-top:0; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">📝 花蓮縣號誌工程開口合約主文 (契約副本)</h2>
          <p style="font-size:12px; color:#64748b;">契約編號: CONTRACT-114-001 | 備份時戳: ${file.uploadTime}</p>
          
          <h3 style="color:#1e3a8a; margin-top:20px; font-size: 16px;">第一條 契約文件及效力</h3>
          <p style="font-size: 14px; color: #334155;">本契約包含招標文件、經核定詳細價目表及監造說明規範。經雙方代表用印後，即生法定合約約束效力。</p>
          
          <h3 style="color:#1e3a8a; margin-top:20px; font-size: 16px;">第二條 履約期限</h3>
          <p style="font-size: 14px; color: #334155;">乙方應於簽約起 720 日曆天內完成全部交通控制主系統核心、微波設備，並完備職安管制條件。</p>
          
          <h3 style="color:#1e3a8a; margin-top:20px; font-size: 16px;">第三條 契約價金之給付與調整</h3>
          <p style="font-size: 14px; color: #334155;">本標案依開口工程實作實算完成進度辦理，應於扣得各路口派工項目計價累計數後，動態更新剩餘可用額度（Balance控制）。</p>

          <div style="margin-top:60px; border-top:1px dashed #cbd5e1; padding-top:20px; display:flex; justify-content: space-between; font-size:12px; color: #475569;">
            <div>
              <p><b>甲方：花蓮縣政府</b></p>
              <p>代表人：縣長 徐榛蔚</p>
            </div>
            <div>
              <p><b>乙方：大亞交通號誌工程股份有限公司</b></p>
              <p>代表人：董事長 林大亞</p>
            </div>
          </div>
        </div>
      `;
    }

    newWindow.document.write(`
      <html>
        <head>
          <title>${file.name} - 線上電子安全檢視</title>
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
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
              background: #1e293b;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 6px;
              font-weight: bold;
              cursor: pointer;
              transition: background 0.2s;
            }
            .btn-print:hover {
              background: #0f172a;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header-bar">
              <span>🛡️ 工程合約大底封存文件在線安全校對系統</span>
              <button class="btn-print" onclick="window.print()">列印與匯出副本</button>
            </div>
            ${previewHtml}
          </div>
        </body>
      </html>
    `);
    newWindow.document.close();
  };

  // Register modern term contract into system
  const handleCreateContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.permissions.canManageContracts) {
      alert('權限被拒！您目前的登入身分缺乏「合約與預算管理」權限。無法增列新合約案書。');
      return;
    }
    if (!newContractName) {
      alert('請填入合約案名');
      return;
    }

    const nextContractId = `CONTRACT-114-${Math.floor(Math.random() * 900) + 100}`;
    const freshContract: Contract = {
      id: nextContractId,
      name: newContractName,
      type: newContractType,
      partyA: newContractPartyA,
      partyB: newContractPartyB,
      startDate: newContractStart,
      endDate: newContractEnd,
      totalAmount: newContractAmount,
      budgets: {
        engineering: budgetEng,
        safety: budgetSafety,
        quality: budgetQuality,
        profit: budgetProfit,
        insurance: budgetInsurance,
        tax: budgetTax
      },
      settledAmount: 0,
      status: '履約中',
      attachedFiles: []
    };

    onUpdateContracts([...contracts, freshContract]);
    setSelectedCaseId(nextContractId);
    setIsCreateModalOpen(false);

    // Reset simple form variables
    setNewContractName('');
  };

  const remainingBalance = selectedContract ? selectedContract.totalAmount - selectedContract.settledAmount : 0;
  const billingPercent = selectedContract ? (selectedContract.settledAmount / selectedContract.totalAmount) * 100 : 0;
  const remainingPercent = 100 - billingPercent;

  return (
    <div id="wrapper_contract_management" className="h-full flex flex-col bg-white overflow-hidden">
      
      {/* Top Banner section */}
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-950">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
            <Layers className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-wide flex items-center gap-2">
              <span>🗃️ 工程合約管理</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-2 py-0.5 rounded">
                契約控制室
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
              維護各鄉鎮實體開口契約預算、上傳核定大底公文、追蹤派工支出明細並自動運算合約剩餘款。
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>建立新契約</span>
        </button>
      </div>

      <div className="flex-1 w-full flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-200">
        
        {/* Left List Pane: Contracts Registry */}
        <div className="w-full md:w-[350px] bg-slate-50 flex flex-col check-parent overflow-hidden">
          <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
            <span className="text-xs font-black text-slate-700 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>現行合約庫 ({contracts.length} 筆)</span>
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {contracts.map(c => {
              const isSelected = selectedContractId === c.id;
              const ratio = (c.settledAmount / c.totalAmount) * 100;
              const rem = c.totalAmount - c.settledAmount;
              
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer text-left select-none relative ${
                    isSelected 
                      ? 'bg-white border-blue-600 shadow-md ring-1 ring-blue-500/10' 
                      : 'bg-white border-slate-200 hover:bg-slate-100/50 text-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center gap-2 mb-1.5">
                    <span className="font-mono text-[9px] font-black bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                      {c.id}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      c.status === '履約中' ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200' :
                      c.status === '已結案' ? 'bg-gray-100 text-gray-700 font-medium' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-slate-900 leading-normal line-clamp-2">
                    {c.name}
                  </h4>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-400 space-y-1.5">
                    <div className="flex justify-between font-medium">
                      <span>簽約總額：</span>
                      <span className="font-bold text-slate-800">${c.totalAmount.toLocaleString()}元</span>
                    </div>

                    <div className="flex justify-between font-medium">
                      <span>已支預算：</span>
                      <span className="font-bold text-red-600">${c.settledAmount.toLocaleString()}元 ({ratio.toFixed(1)}%)</span>
                    </div>

                    <div className="flex justify-between font-medium">
                      <span>剩餘額度：</span>
                      <span className={`font-black ${rem < c.totalAmount * 0.15 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ${rem.toLocaleString()}元
                      </span>
                    </div>

                    {/* Progress tracking line */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          ratio > 85 ? 'bg-red-500' : ratio > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(ratio, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Opened Contract Detail & Live Calculations */}
        <div className="flex-1 bg-white overflow-y-auto flex flex-col">
          {selectedContract ? (
            <div className="p-6 space-y-6">
              
              {/* SECTION A: General Details and Duration */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-200 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500 text-amber-950 font-mono text-xs font-black px-2.5 py-0.5 rounded">
                      {selectedContract.type}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold font-mono">
                      簽定時程: {selectedContract.startDate} 至 {selectedContract.endDate}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {selectedContract.name}
                  </h3>
                  <div className="text-xs font-semibold text-slate-500 pt-0.5">
                    業主 (甲方)：<span className="text-slate-800 font-bold">{selectedContract.partyA}</span> · 
                    承包商 (乙方)：<span className="text-slate-800 font-bold">{selectedContract.partyB}</span>
                  </div>
                </div>
                
                <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-right font-sans min-w-[180px] shrink-0 self-stretch lg:self-auto flex flex-col justify-center gap-1.5">
                  <div>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">合約總金額 (Total Contract)</span>
                    <span className="text-sm font-mono font-black text-slate-900">
                      ${selectedContract.totalAmount.toLocaleString()}元
                    </span>
                  </div>
                  <div className="border-t border-slate-200/60 pt-1.5">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">剩餘合約價額 (Balance)</span>
                    <span className={`text-base font-mono font-black block ${remainingBalance < selectedContract.totalAmount * 0.15 ? 'text-red-600 animate-pulse' : 'text-emerald-600'}`}>
                      ${remainingBalance.toLocaleString()}元
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold block mt-0.5">
                      佔比: {remainingPercent.toFixed(1)}% / 剩餘
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION B: Budgets and Visual Progress Gauges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Visual Gauge of Settlement */}
                <div className="md:col-span-2 bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1">
                      <Coins className="w-4 h-4 text-amber-500" />
                      <span>合約計價支出監控指標</span>
                    </h4>
                    {remainingBalance < selectedContract.totalAmount * 0.15 && (
                      <span className="text-[10px] bg-red-100 text-red-700 font-black px-2 py-0.5 rounded border border-red-200 flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>合約餘額探底超限警告</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>已結案支出累計金額：</span>
                      <span className="font-mono text-slate-900">${selectedContract.settledAmount.toLocaleString()} 元 ({billingPercent.toFixed(1)}%)</span>
                    </div>
                    
                    {/* Double progress bar */}
                    <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden relative border border-slate-300 shadow-inner flex">
                      <div 
                        className={`h-full transition-all duration-300 flex items-center justify-end px-2 text-[9px] text-white font-black ${
                          billingPercent > 85 ? 'bg-red-500' : billingPercent > 50 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(billingPercent, 100)}%` }}
                      >
                        {billingPercent > 10 && `${billingPercent.toFixed(0)}%`}
                      </div>
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${Math.max(remainingPercent, 0)}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[11px] font-bold mt-1">
                      <span className="text-blue-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        已開支 ({billingPercent.toFixed(1)}%)
                      </span>
                      <span className="text-emerald-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        合約剩餘可用資金 ({remainingPercent.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {/* Micro Breakdown progress lines for Contract Parts */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] pt-2 border-t border-slate-200/60 leading-normal">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold">工程費 (壹)</span>
                        <span className="font-mono text-slate-700">${selectedContract.budgets.engineering.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                        <div className="bg-slate-400 h-full rounded" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold">包商利潤 (肆)</span>
                        <span className="font-mono text-slate-700">${selectedContract.budgets.profit.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                        <div className="bg-slate-400 h-full rounded" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold">職安衛生費 (貳)</span>
                        <span className="font-mono text-slate-700">${selectedContract.budgets.safety.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                        <div className="bg-slate-400 h-full rounded" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold">營業稅 (陸)</span>
                        <span className="font-mono text-slate-700">${selectedContract.budgets.tax.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                        <div className="bg-slate-400 h-full rounded" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub Panel: Uploaded documents list & uploader */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 mb-2">
                      <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                      <span>合約大底封存文件</span>
                    </h4>

                    {selectedContract.attachedFiles.length > 0 ? (
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                        {selectedContract.attachedFiles.map(file => (
                          <div key={file.id} className="p-2 bg-white rounded-lg border border-slate-200/80 flex items-center justify-between text-[11px] leading-tight">
                            <div className="flex items-center gap-1.5 shrink-0 max-w-[80%]">
                              <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <div className="font-medium text-slate-800 truncate" title={file.name}>
                                {file.name}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-mono font-medium">{file.size}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewingFile(file);
                                }}
                                className="text-slate-500 hover:text-blue-500 cursor-pointer p-0.5 rounded hover:bg-slate-100 transition whitespace-nowrap"
                                title="線上檢視"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteContractFile(file.id)}
                                className="text-slate-400 hover:text-red-500 cursor-pointer p-0.5 rounded hover:bg-slate-100 transition whitespace-nowrap"
                                title="刪除檔案"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 py-3 text-center">
                        暫無任何合約附屬主文、核定公文掃描檔。
                      </p>
                    )}
                  </div>

                  {/* File Uploader (Drag-over Box + Click) */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition select-none flex flex-col items-center justify-center relative ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-50/50' 
                        : 'border-slate-350 bg-white hover:bg-slate-100/30'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileInputChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    />

                    {uploadProgress !== null ? (
                      <div className="w-full space-y-1.5">
                        <span className="text-[10px] font-bold text-blue-600 block animate-pulse">
                          正在上傳 {uploadingFileName}...
                        </span>
                        <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                          <div className="bg-blue-600 h-full transition-all duration-100" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className={`w-6 h-6 text-slate-400 mb-1 ${dragActive ? 'animate-bounce text-blue-500' : ''}`} />
                        <span className="text-[10px] font-bold text-slate-600 block">
                          拖曳 PDF/核定大底檔案至此
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          或點擊開啟檔案總管選擇
                        </span>
                      </>
                    )}
                  </div>

                </div>

              </div>

              {/* SECTION C: LINKED CASES AND SPENDING DEDUCTIONS */}
              <div className="border-t border-slate-200/80 pt-5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Link2 className="w-4 h-4 text-blue-500" />
                      <span>合約連結之派工案件與結案支出計價清單</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      只有當連結案件派工被標記為<strong>「已完工」</strong>時，其結案支出金額才會被合約引擎認列，並自動從剩餘預算內扣除。
                    </p>
                  </div>
                  
                  {/* Select box to link a new Case directly */}
                  {availableCasesToLink.length > 0 && (
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 shrink-0 w-full sm:w-auto">
                      <span className="text-[10px] font-black text-slate-600 shrink-0">🔗 快速綁定派工:</span>
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) return;
                          const found = availableCasesToLink.find(item => item.case.id === val);
                          if (found) {
                            handleLinkCaseToContract(found.intersectionId, found.case);
                            // reset
                            e.target.value = '';
                          }
                        }}
                        className="bg-white border border-slate-350 rounded p-1 text-[11px] font-bold text-slate-700 w-full sm:w-48"
                      >
                        <option value="">選擇未綁定工程單...</option>
                        {availableCasesToLink.map(c => (
                          <option key={c.case.id} value={c.case.id}>
                            {c.intersectionId} - {c.case.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {linkedCasesData.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs leading-normal">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold select-none text-[10px] uppercase">
                        <tr>
                          <th className="p-3">派工編號</th>
                          <th className="p-3">路口及案件名</th>
                          <th className="p-3 text-center">案件狀態</th>
                          <th className="p-3 text-right">支出項目計價(NT$)</th>
                          <th className="p-3 text-center">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {linkedCasesData.map(({ intersectionId, intersectionName, case: ticket }) => {
                          const isSettled = ticket.status === '已完工';
                          return (
                            <tr key={ticket.id} className={`${isSettled ? 'bg-emerald-50/15' : 'bg-white'}`}>
                              <td className="p-3 font-mono text-slate-800 font-bold shrink-0">
                                {ticket.id}
                              </td>
                              <td className="p-3">
                                <div className="font-bold text-slate-900">{ticket.title}</div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                  {intersectionId} · {intersectionName}
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  ticket.status === '已完工' 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                    : 'bg-orange-100 text-orange-800'
                                }`}>
                                  {ticket.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                                  <input
                                    type="number"
                                    value={ticket.caseCost || 0}
                                    onChange={(e) => {
                                      const cost = parseInt(e.target.value) || 0;
                                      handleSetCaseCost(intersectionId, ticket, cost);
                                    }}
                                    className="p-1.5 border border-slate-200 rounded text-right font-mono font-bold text-xs w-28 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    title="輸入或微調此案件項目之支出金額"
                                  />
                                </div>
                                {!isSettled && (
                                  <span className="text-[9px] text-slate-400 block pt-0.5 select-none">
                                    (待結案，暫不扣款)
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    const targetIntObj = intersections.find(i => i.id === intersectionId);
                                    if (targetIntObj && onSelectIntersection) {
                                      onSelectIntersection(targetIntObj);
                                    }
                                    if (onAutoSwitchTab) {
                                      onAutoSwitchTab('case');
                                    }
                                  }}
                                  className="text-[11px] font-semibold px-2.5 py-1.5 rounded bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition inline-flex items-center gap-1 mr-2 cursor-pointer"
                                  title="連結至對應關聯案件頁面"
                                >
                                  案件管理
                                </button>
                                <button
                                  onClick={() => handleUnlinkCaseFromContract(intersectionId, ticket)}
                                  className="text-[11px] font-semibold px-2.5 py-1.5 rounded bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition inline-flex items-center gap-1 cursor-pointer"
                                  title="解綁並刪除對應該合約之案件扣款金額"
                                >
                                  刪除綁定
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center border border-slate-200 border-dashed rounded-xl bg-slate-50 text-slate-400">
                    <Link2 className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                    <h5 className="font-bold text-slate-600 text-xs">當前合約尚未連結任何派工作業工單</h5>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
                      您可以使用右上角的連結下拉單，將歷史/當前故障派工單綁定至本合約，以納入餘額及計價管制網中。
                    </p>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 py-32">
              <Layers className="w-12 h-12 text-slate-200 mb-2" />
              <h4 className="font-semibold text-slate-600">請選取合約進行管理</h4>
            </div>
          )}
        </div>

      </div>

      {/* CREATE NEW CONTRACT MODAL OVERLAY */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-950">
              <h3 className="text-sm font-black flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-amber-300" />
                <span>登記新開口契約/工程標合約案</span>
              </h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateContractSubmit} className="p-5 overflow-y-auto space-y-4 max-h-[500px] text-xs">
              
              <div>
                <label className="block text-slate-600 font-bold mb-1.5">1. 合約專案案名碼 *</label>
                <input
                  type="text"
                  required
                  placeholder="請填寫合約全稱（如：114-115年度花蓮市交通號誌改善工程）"
                  value={newContractName}
                  onChange={(e) => setNewContractName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1.5">2. 契約類型</label>
                  <select
                    value={newContractType}
                    onChange={(e) => setNewContractType(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-700 bg-white"
                  >
                    <option value="開口契約">開口契約 (年度總計價)</option>
                    <option value="一般總包">一般總包 (固定總價)</option>
                    <option value="單價契約">單價契約 (逐項計價)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1.5">3. 契約總金額 (元) *</label>
                  <input
                    type="number"
                    required
                    value={newContractAmount}
                    onChange={(e) => setNewContractAmount(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1.5">4. 甲分單位 (業主)</label>
                  <input
                    type="text"
                    required
                    value={newContractPartyA}
                    onChange={(e) => setNewContractPartyA(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1.5">5. 乙分廠商 (承包商)</label>
                  <input
                    type="text"
                    required
                    value={newContractPartyB}
                    onChange={(e) => setNewContractPartyB(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1.5">6. 履約起始日期</label>
                  <input
                    type="date"
                    required
                    value={newContractStart}
                    onChange={(e) => setNewContractStart(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1.5">7. 履約屆滿日期</label>
                  <input
                    type="date"
                    required
                    value={newContractEnd}
                    onChange={(e) => setNewContractEnd(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Sub Budget breakup (壹~陸項次) matching the PDF parameters */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="font-black text-slate-800 mb-2 flex items-center gap-1 text-[11px] uppercase tracking-wide">
                  <span>💰 契約項次預算參考拆解比重 (配合結算查對)</span>
                </h4>
                <p className="text-[10px] text-slate-400 mb-3">
                  預設比率引述自花蓮縣政府「核定契約預算[總表]」：工程款約83.3％、品管約2％、利潤費約9.0％。
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">壹. 工程費</label>
                    <input 
                      type="number" 
                      value={budgetEng} 
                      onChange={(e) => setBudgetEngineering(parseInt(e.target.value) || 0)}
                      className="w-full p-1.5 border border-slate-200 rounded font-mono font-bold" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">貳. 職安衛生費</label>
                    <input 
                      type="number" 
                      value={budgetSafety} 
                      onChange={(e) => setBudgetSafety(parseInt(e.target.value) || 0)}
                      className="w-full p-1.5 border border-slate-200 rounded font-mono font-bold" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">參. 品管費</label>
                    <input 
                      type="number" 
                      value={budgetQuality} 
                      onChange={(e) => setBudgetQuality(parseInt(e.target.value) || 0)}
                      className="w-full p-1.5 border border-slate-200 rounded font-mono font-bold" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">肆. 承包利益</label>
                    <input 
                      type="number" 
                      value={budgetProfit} 
                      onChange={(e) => setBudgetProfit(parseInt(e.target.value) || 0)}
                      className="w-full p-1.5 border border-slate-200 rounded font-mono font-bold" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">伍. 保險費</label>
                    <input 
                      type="number" 
                      value={budgetInsurance} 
                      onChange={(e) => setBudgetInsurance(parseInt(e.target.value) || 0)}
                      className="w-full p-1.5 border border-slate-200 rounded font-mono font-bold" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">陸. 營業稅</label>
                    <input 
                      type="number" 
                      value={budgetTax} 
                      onChange={(e) => setBudgetTax(parseInt(e.target.value) || 0)}
                      className="w-full p-1.5 border border-slate-200 rounded font-mono font-bold" 
                    />
                  </div>
                </div>
              </div>

              {/* Modal buttons */}
              <div className="flex gap-2 pt-4 border-t border-slate-100 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  確認登記
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Online Document Preview Canvas Overlay */}
      <AnimatePresence>
        {previewingFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.35 }}
              className="w-full max-w-4xl h-[85vh] bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
            >
              {/* Modal Title bar */}
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/90">
                <div className="flex items-center gap-2 max-w-[50%]">
                  {previewingFile.name.endsWith('.xlsx') || previewingFile.name.endsWith('.xls') ? (
                    <FileSpreadsheet className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold truncate text-slate-100" title={previewingFile.name}>
                      {previewingFile.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      安全校驗通過 · 副本存檔 · 大小: {previewingFile.size}
                    </p>
                  </div>
                </div>

                {/* Toolbar/Control bar */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-800 rounded-lg px-2 py-1 gap-2.5 mr-2">
                    <button
                      onClick={() => setPreviewZoom(prev => Math.max(prev - 10, 50))}
                      className="text-slate-400 hover:text-white cursor-pointer p-0.5 rounded transition"
                      title="縮小"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] font-mono font-bold text-slate-300 select-none min-w-[35px] text-center">
                      {previewZoom}%
                    </span>
                    <button
                      onClick={() => setPreviewZoom(prev => Math.min(prev + 10, 155))}
                      className="text-slate-400 hover:text-white cursor-pointer p-0.5 rounded transition"
                      title="放大"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleOpenInNewWindow(previewingFile)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition mr-2 cursor-pointer shadow-lg shadow-blue-500/15"
                    title="新分頁彈出安全檢視視窗"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>開新視窗檢視</span>
                  </button>

                  <button
                    onClick={() => {
                      setPreviewingFile(null);
                      setPreviewZoom(100);
                    }}
                    className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg transition cursor-pointer"
                    title="關閉檢視"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Content Pane */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left side sidebar details panel */}
                <div className="w-64 border-r border-slate-800 p-5 bg-slate-950/45 text-slate-300 font-sans text-xs flex flex-col justify-between overflow-y-auto shrink-0 select-none">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">所屬合約標案</span>
                      <p className="font-bold text-slate-100 mt-1 leading-normal">{selectedContract?.name}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">合約編號</span>
                      <p className="font-mono font-medium text-slate-200 mt-0.5">{selectedContract?.id}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">檔案校對規格</span>
                      <p className="font-mono mt-0.5 text-slate-200">
                        {previewingFile.name.endsWith('.xlsx') || previewingFile.name.endsWith('.xls') 
                          ? 'Microsoft Excel Spreadsheet' 
                          : 'Portable Document Format (PDF)'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">系統登載日期</span>
                      <p className="mt-0.5 text-slate-200">{previewingFile.uploadTime}</p>
                    </div>
                    <div className="pt-3 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">資訊安全及數位簽章</span>
                      <div className="mt-1.5 p-2 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-[10px] text-emerald-400 font-medium leading-relaxed">
                        ✓ 經由金鑰配對完整性校對<br/>
                        ✓ 安全沙盒檢視加密保護中<br/>
                        ✓ 具本府核可簽單效力
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex flex-col items-center gap-1.5">
                    {/* Retro seal design as watermark placeholder */}
                    <div className="w-16 h-16 rounded-full border border-red-500/30 flex items-center justify-center p-1 relative rotate-[-12deg] opacity-70">
                      <div className="w-full h-full rounded-full border border-dashed border-red-500/40 flex items-center justify-center text-[8px] text-red-500 font-bold text-center leading-normal">
                        花蓮縣政府<br/>驗章合格
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-500 pt-1 font-mono">HASH: SHA-256 SAFE</span>
                  </div>
                </div>

                {/* Right side interactive file previewer viewport */}
                <div className="flex-1 bg-slate-950 overflow-auto p-8 flex items-start justify-center">
                  <div 
                    className="origin-top transition-transform duration-200" 
                    style={{ 
                      transform: `scale(${previewZoom / 100})`,
                      width: '100%',
                      maxWidth: '720px'
                    }}
                  >
                    {previewingFile.name.endsWith('.xlsx') || previewingFile.name.endsWith('.xls') ? (
                      /* EXCEL SAMPLE VIEW */
                      <div className="bg-white text-slate-800 rounded-xl border border-slate-300 shadow-xl overflow-hidden font-sans">
                        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs font-bold text-slate-500">
                          <div className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded bg-emerald-600 block"></span>
                            <span>Detailed_Prices.csv [唯讀]</span>
                          </div>
                          <span>Sheet 1 / 1</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 text-[10px]">
                                <th className="p-2.5 border-r border-slate-200 text-center w-10">列</th>
                                <th className="p-2.5 border-r border-slate-200">項目工項名稱</th>
                                <th className="p-2.5 border-r border-slate-200 text-center">單位</th>
                                <th className="p-2.5 border-r border-slate-200 text-right">核定單價(NT$)</th>
                                <th className="p-2.5 border-r border-slate-200 text-center">數量</th>
                                <th className="p-2.5 text-right">核定總複價(NT$)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-150 font-mono text-slate-700">
                              <tr className="hover:bg-slate-50">
                                <td className="p-2 border-r border-slate-200 text-center bg-slate-50/50 text-slate-400 font-bold">1</td>
                                <td className="p-2 border-r border-slate-200 font-bold font-sans text-slate-900">300mm LED型三色號誌燈頭</td>
                                <td className="p-2 border-r border-slate-200 text-center font-sans">組</td>
                                <td className="p-2 border-r border-slate-200 text-right">$8,200</td>
                                <td className="p-2 border-r border-slate-200 text-center">85</td>
                                <td className="p-2 text-right font-bold text-emerald-600">$697,000</td>
                              </tr>
                              <tr className="hover:bg-slate-50">
                                <td className="p-2 border-r border-slate-200 text-center bg-slate-50/50 text-slate-400 font-bold">2</td>
                                <td className="p-2 border-r border-slate-200 font-bold font-sans text-slate-900">多時相號誌控制器主機組 (TYPE-A)</td>
                                <td className="p-2 border-r border-slate-200 text-center font-sans">套</td>
                                <td className="p-2 border-r border-slate-200 text-right">$45,000</td>
                                <td className="p-2 border-r border-slate-200 text-center">12</td>
                                <td className="p-2 text-right font-bold text-emerald-600">$540,000</td>
                              </tr>
                              <tr className="hover:bg-slate-50">
                                <td className="p-2 border-r border-slate-200 text-center bg-slate-50/50 text-slate-400 font-bold">3</td>
                                <td className="p-2 border-r border-slate-200 font-bold font-sans text-slate-900">雷達/微波車輛感應偵測器</td>
                                <td className="p-2 border-r border-slate-200 text-center font-sans">組</td>
                                <td className="p-2 border-r border-slate-200 text-right">$38,000</td>
                                <td className="p-2 border-r border-slate-200 text-center">18</td>
                                <td className="p-2 text-right font-bold text-emerald-600">$684,000</td>
                              </tr>
                              <tr className="hover:bg-slate-50">
                                <td className="p-2 border-r border-slate-200 text-center bg-slate-50/50 text-slate-400 font-bold">4</td>
                                <td className="p-2 border-r border-slate-200 font-bold font-sans text-slate-900">各項號誌控制整合箱體/架</td>
                                <td className="p-2 border-r border-slate-200 text-center font-sans">組</td>
                                <td className="p-2 border-r border-slate-200 text-right">$15,000</td>
                                <td className="p-2 border-r border-slate-200 text-center">24</td>
                                <td className="p-2 text-right font-bold text-emerald-600">$360,000</td>
                              </tr>
                              <tr className="hover:bg-slate-50">
                                <td className="p-2 border-r border-slate-200 text-center bg-slate-50/50 text-slate-400 font-bold">5</td>
                                <td className="p-2 border-r border-slate-200 font-bold font-sans text-slate-900">重載型智慧不中斷電力系統 (UPS)</td>
                                <td className="p-2 border-r border-slate-200 text-center font-sans">組</td>
                                <td className="p-2 border-r border-slate-200 text-right">$65,000</td>
                                <td className="p-2 border-r border-slate-200 text-center">10</td>
                                <td className="p-2 text-right font-bold text-emerald-600">$650,000</td>
                              </tr>
                              <tr className="hover:bg-slate-50">
                                <td className="p-2 border-r border-slate-200 text-center bg-slate-50/50 text-slate-400 font-bold">6</td>
                                <td className="p-2 border-r border-slate-200 font-bold font-sans text-slate-900">各路口及機房配線大底防護、暗管敷設項目</td>
                                <td className="p-2 border-r border-slate-200 text-center font-sans">一式</td>
                                <td className="p-2 border-r border-slate-200 text-right">$880,000</td>
                                <td className="p-2 border-r border-slate-200 text-center">1</td>
                                <td className="p-2 text-right font-bold text-emerald-600">$880,000</td>
                              </tr>
                              <tr className="bg-slate-100 font-bold text-slate-900">
                                <td className="p-2.5 border-r border-slate-200 text-center bg-slate-200/55 text-slate-500">Σ</td>
                                <td className="p-2.5 border-r border-slate-200 font-sans" colSpan="3">工程細部核備費用主目彙總：</td>
                                <td className="p-2.5 border-r border-slate-200 text-center bg-emerald-50">139項</td>
                                <td className="p-2.5 text-right text-emerald-700 font-black">${selectedContract?.budgets.engineering.toLocaleString()}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : previewingFile.name.includes('驗收合格') ? (
                      /* CERTIFICATE FORM VIEW */
                      <div className="bg-white text-[#1e293b] rounded-xl border-4 border-double border-blue-900 p-8 shadow-xl text-center relative max-w-xl mx-auto font-serif">
                        <h1 className="text-blue-900 text-2xl font-black mb-1">花蓮縣政府</h1>
                        <h2 className="text-blue-900 text-base tracking-[3px] font-bold border-b border-blue-900/20 pb-4 mb-6">
                          工程驗收核定結算合格證明書
                        </h2>

                        <div className="grid grid-cols-4 border border-slate-900 text-left text-xs mb-8">
                          <div className="p-2 bg-slate-100 font-bold border-r border-b border-slate-950">工程標案名稱</div>
                          <div className="p-2 border-b border-slate-950 col-span-3 font-sans font-bold">{selectedContract?.name}</div>

                          <div className="p-2 bg-slate-100 font-bold border-r border-b border-slate-950">工程起迄日程</div>
                          <div className="p-2 border-b border-slate-950 font-sans">{selectedContract?.startDate} 至 {selectedContract?.endDate}</div>
                          <div className="p-2 bg-slate-100 font-bold border-r border-b border-slate-950">合約核定金額</div>
                          <div className="p-2 border-b border-slate-950 font-sans font-bold text-blue-700">${selectedContract?.totalAmount.toLocaleString()}</div>

                          <div className="p-2 bg-slate-100 font-bold border-r border-slate-950">最終核備總結</div>
                          <div className="p-2 col-span-3 font-sans text-slate-700 leading-normal">
                            本案依合約工期實作項目核結。經工務、財務、稽核小組等現場實地測算抽校符合CNS號誌系統規程，准予核銷結算，特此證明。
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs text-slate-500 mt-6 pt-4 border-t border-slate-100">
                          <div className="text-left font-sans space-y-1">
                            <p className="font-bold text-slate-800">核簽主管機關：花蓮縣政府一級主簽</p>
                            <p>授權檢視日期：中華民國 一一五年 六月 十七日</p>
                          </div>
                          
                          {/* Simulated official stamp */}
                          <div className="w-16 h-16 border-2 border-rose-500 rounded-full flex items-center justify-center p-1 relative rotate-[-10deg] shrink-0 font-sans animate-pulse">
                            <div className="text-[7.5px] font-black text-rose-500 text-center leading-tight">
                              花蓮縣政府<br/>工程驗章合格<br/>✓核訖✓
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* STANDARD CONTRACT DOCUMENT VIEW */
                      <div className="bg-white text-[#1e293b] rounded-xl p-8 shadow-xl text-left border border-slate-200 leading-relaxed font-sans max-w-xl mx-auto space-y-4">
                        <div className="border-b border-blue-500/20 pb-4 mb-4">
                          <h2 className="text-base font-black text-slate-900">
                            花蓮縣智慧號誌與安全路口改善工程契約 (副本主文)
                          </h2>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            契約字號: 府交通字第1140010025號 (存檔管理)
                          </p>
                        </div>

                        <div className="text-xs space-y-3.5 text-slate-700">
                          <div>
                            <h4 className="font-bold text-slate-900 border-l-2 border-blue-500 pl-1.5 mb-1 text-[13px]">
                              第一條 契約主文效力
                            </h4>
                            <p>
                              本契約及其附隨文件、核定詳細價目清冊、職安工程款明細等，皆屬本系統履約管控之不可分割主體。
                            </p>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 border-l-2 border-blue-500 pl-1.5 mb-1 text-[13px]">
                              第二條 派工款項管理與實作限制
                            </h4>
                            <p>
                              凡納入本系統之故障申漏、智慧號誌改善及路口電力不中斷(UPS)系統相關施作派遣項目，應依「實作實算」原則，在案件核銷結案後立即實施各單項合約子科目額度的動態核扣管理。
                            </p>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 border-l-2 border-blue-500 pl-1.5 mb-1 text-[13px]">
                              第三條 資訊安全與智慧控制器
                            </h4>
                            <p>
                              乙方所提供之多時相控制器與網通安全封包，皆須符合交通部最新制訂網路資安標準與一級加密機制，得受甲方隨時聯機檢修與稽查。
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-8 border-t border-slate-100/80 text-[10px] text-slate-500">
                          <div>
                            <p className="font-bold text-slate-800">甲方: 花蓮縣政府</p>
                            <p>乙方: {(selectedContract?.partyB) || '大亞交通號誌工程股份有限公司'}</p>
                          </div>
                          <div className="w-14 h-14 border border-rose-500 text-rose-500 rounded-full flex items-center justify-center font-bold text-[7.5px] text-center rotate-[-15deg]">
                            雙方核章<br/>安全副本
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
