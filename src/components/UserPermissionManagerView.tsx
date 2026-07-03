import React, { useState } from 'react';
import { SystemUser, UserRole } from '../types';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck,
  UserCheck, 
  Users, 
  Lock, 
  Unlock, 
  UserPlus, 
  Trash2, 
  Search, 
  Sparkles,
  RefreshCw,
  HelpCircle,
  FileText,
  Key
} from 'lucide-react';

interface UserPermissionManagerViewProps {
  currentUser: SystemUser;
  users: SystemUser[];
  onUpdateUserPermissions: (userId: string, updatedPermissions: SystemUser['permissions']) => void;
  onUpdateUserRole: (userId: string, newRole: UserRole, newRoleName: string) => void;
  onChangeActiveUser: (userId: string) => void;
  onAddSystemUser: (newUser: SystemUser) => void;
  onDeleteSystemUser: (userId: string) => void;
}

// Security Audit Log Entry
interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  targetName: string;
  action: string;
  type: 'modify_perm' | 'modify_role' | 'add_user' | 'delete_user' | 'switch_user';
}

export default function UserPermissionManagerView({
  currentUser,
  users,
  onUpdateUserPermissions,
  onUpdateUserRole,
  onChangeActiveUser,
  onAddSystemUser,
  onDeleteSystemUser
}: UserPermissionManagerViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<SystemUser | null>(null);

  // New system user form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserDept, setNewUserDept] = useState('花蓮工務處交通科');
  const [newUserRole, setNewUserRole] = useState<UserRole>('SURVEYOR');

  // Internal audit log state for demonstration purposes
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'audit-1',
      timestamp: '2026-06-13 09:12:45',
      actorName: '陳管理 (Admin)',
      targetName: '李普查 (Surveyor)',
      action: '調整「路口諸元編輯」權限設定為：允許',
      type: 'modify_perm'
    },
    {
      id: 'audit-2',
      timestamp: '2026-06-13 10:04:15',
      actorName: '林處長 (Supervisor)',
      targetName: '張技師 (Engineer)',
      action: '重授「派工單調度」權限權及核可設定為：啟用',
      type: 'modify_perm'
    },
    {
      id: 'audit-3',
      timestamp: '2026-06-13 11:30:22',
      actorName: '系統管理員',
      targetName: '全體使用者',
      action: '系統成功加掛使用者權限角色存取控制矩陣 (Role-Based Access Control)',
      type: 'add_user'
    }
  ]);

  const addAuditLog = (action: string, targetName: string, type: AuditLog['type']) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorName: `${currentUser.name} (${currentUser.roleName})`,
      targetName,
      action,
      type
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Toast notifier within view
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const triggerFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  // Switch Active Session
  const handleSwitchSession = (userId: string) => {
    const clickedUser = users.find(u => u.id === userId);
    if (!clickedUser) return;
    
    onChangeActiveUser(userId);
    addAuditLog(`切換當前系統登入身分為 [${clickedUser.name}]`, clickedUser.name, 'switch_user');
    triggerFeedback(`✓ 已成功登入/切換為: [${clickedUser.name}] (${clickedUser.roleName})`);
    
    if (selectedUserForEdit?.id === userId) {
      setSelectedUserForEdit(clickedUser);
    }
  };

  // Role details metadata mapping
  const roleMeta = {
    ADMIN: { name: '系統管理員', desc: '擁有系統核心全部刪除、配置修改、稽核及使用者權限分配之全權限。', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    SUPERVISOR: { name: '稽核/處長主管', desc: '負責宏觀統計稽查，簽署或駁回諸元普查結果，無權異動底層架構。', color: 'bg-rose-100 text-rose-800 border-rose-200' },
    ENGINEER: { name: '運維工程師', desc: '調配路口派遣、修繕契約建檔、建立派工單與附件竣工圖之上傳。', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    SURVEYOR: { name: '現場普查員', desc: '可按表 19 地區巡邏回報、上傳實地調查照片、或更新其諸元狀態。', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  };

  // Handle single permission checkbox toggle
  const handleTogglePermission = (userId: string, permKey: keyof SystemUser['permissions']) => {
    const userToEdit = users.find(u => u.id === userId);
    if (!userToEdit) return;

    // Security Guard: Check if current user has power to edit permissions
    if (!currentUser.permissions.canManageSystemUsers) {
      triggerFeedback(`❌ 權限被拒！您當前身分為 [${currentUser.roleName}]，無特權修改權限矩陣！`);
      return;
    }

    const updatedPerms = {
      ...userToEdit.permissions,
      [permKey]: !userToEdit.permissions[permKey]
    };

    onUpdateUserPermissions(userId, updatedPerms);
    addAuditLog(
      `變更權限 [${permKey}] 為：${updatedPerms[permKey] ? '啟用' : '停用'}`,
      userToEdit.name,
      'modify_perm'
    );
    triggerFeedback(`✓ 已更新 [${userToEdit.name}] 的個別功能存取控制設定！`);
    
    // update state
    if (selectedUserForEdit && selectedUserForEdit.id === userId) {
      setSelectedUserForEdit({
        ...userToEdit,
        permissions: updatedPerms
      });
    }
  };

  // Handle entire Role mapping switch
  const handleRoleChange = (userId: string, targetRole: UserRole) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (!currentUser.permissions.canManageSystemUsers) {
      triggerFeedback(`❌ 權限被拒！僅「系統管理員」有權限變更系統預載之角色等級！`);
      return;
    }

    // Default permissions according to Role definitions
    const defaultPermsByRole: Record<UserRole, SystemUser['permissions']> = {
      ADMIN: {
        canEditIntersections: true,
        canManageCases: true,
        canManageContracts: true,
        canEditSurveyElements: true,
        canApproveSurvey: true,
        canManageSystemUsers: true,
      },
      SUPERVISOR: {
        canEditIntersections: true,
        canManageCases: false,
        canManageContracts: false,
        canEditSurveyElements: true,
        canApproveSurvey: true, // yes
        canManageSystemUsers: false,
      },
      ENGINEER: {
        canEditIntersections: true,
        canManageCases: true, // yes
        canManageContracts: true, // yes
        canEditSurveyElements: true,
        canApproveSurvey: false,
        canManageSystemUsers: false,
      },
      SURVEYOR: {
        canEditIntersections: false,
        canManageCases: false,
        canManageContracts: false,
        canEditSurveyElements: true, // yes
        canApproveSurvey: false,
        canManageSystemUsers: false,
      }
    };

    const updatedRoleName = roleMeta[targetRole].name;
    onUpdateUserRole(userId, targetRole, updatedRoleName);
    onUpdateUserPermissions(userId, defaultPermsByRole[targetRole]);

    addAuditLog(`將角色身分改為 「${updatedRoleName}」 並初始化標準權限組`, user.name, 'modify_role');
    triggerFeedback(`✓ 已將 [${user.name}] 身分角色重新調整為：${updatedRoleName}`);
    
    if (selectedUserForEdit?.id === userId) {
      setSelectedUserForEdit({
        ...user,
        role: targetRole,
        roleName: updatedRoleName,
        permissions: defaultPermsByRole[targetRole]
      });
    }
  };

  // Create customized user account
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      triggerFeedback('❌ 請確實填寫姓名與安全電子信箱！');
      return;
    }

    if (!currentUser.permissions.canManageSystemUsers) {
      triggerFeedback('❌ 您的當前身分不能建立或新增使用者帳號！');
      return;
    }

    // Role initial permissions
    const standardPerms: SystemUser['permissions'] = {
      ADMIN: {
        canEditIntersections: true,
        canManageCases: true,
        canManageContracts: true,
        canEditSurveyElements: true,
        canApproveSurvey: true,
        canManageSystemUsers: true,
      },
      SUPERVISOR: {
        canEditIntersections: true,
        canManageCases: false,
        canManageContracts: false,
        canEditSurveyElements: true,
        canApproveSurvey: true,
        canManageSystemUsers: false,
      },
      ENGINEER: {
        canEditIntersections: true,
        canManageCases: true,
        canManageContracts: true,
        canEditSurveyElements: true,
        canApproveSurvey: false,
        canManageSystemUsers: false,
      },
      SURVEYOR: {
        canEditIntersections: false,
        canManageCases: false,
        canManageContracts: false,
        canEditSurveyElements: true,
        canApproveSurvey: false,
        canManageSystemUsers: false,
      }
    }[newUserRole];

    const colors = ['bg-blue-600', 'bg-purple-600', 'bg-orange-600', 'bg-teal-600', 'bg-amber-600', 'bg-indigo-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const createdUser: SystemUser = {
      id: `USR-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      roleName: roleMeta[newUserRole].name,
      department: newUserDept,
      avatarColor: randomColor,
      permissions: standardPerms
    };

    onAddSystemUser(createdUser);
    addAuditLog(`在資料庫中成功新增使用者，派屬角色為 [${roleMeta[newUserRole].name}]`, createdUser.name, 'add_user');
    triggerFeedback(`✓ 成功建置使用者 [${newUserName}] 權限配額！`);

    // Reset Form
    setNewUserName('');
    setNewUserEmail('');
    setShowAddModal(false);
  };

  // Delete user accounts
  const handleDeleteUser = (userId: string, name: string) => {
    if (userId === currentUser.id) {
      triggerFeedback('❌ 瘋狂警告：您不能將自我本人登入的帳號從資料庫中移除！');
      return;
    }

    if (!currentUser.permissions.canManageSystemUsers) {
      triggerFeedback('❌ 權限被拒！僅高階「系統管理員」有權調閱或解雇人員！');
      return;
    }

    onDeleteSystemUser(userId);
    addAuditLog('將對名下的登載帳號完全自權限庫登出刪除', name, 'delete_user');
    triggerFeedback(`✓ 已移移 [${name}] 的系統授權紀錄與工作配發`);
    
    if (selectedUserForEdit?.id === userId) {
      setSelectedUserForEdit(null);
    }
  };

  // Filter systems users
  const filteredUsers = users.filter(usr => {
    return usr.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           usr.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           usr.department.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="h-full flex flex-col bg-slate-100 overflow-hidden" id="user_permissions_manager_dashboard">
      
      {/* Mini Top Banner Alert Feedback */}
      {actionFeedback && (
        <div className="fixed top-14 right-6 px-4 py-3 bg-slate-900 border border-slate-755 text-white shadow-xl rounded-xl z-50 text-xs font-bold font-mono flex items-center gap-2 transition duration-300 animate-fade-in animate-pulse">
          <Key className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Main Title Banner Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between shrink-0 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
            <Lock className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-wide flex items-center gap-2">
              <span>🛡️ 系統使用者權限暨存取控制管理中心</span>
              <span className="text-[10px] bg-indigo-950 font-mono text-indigo-400 font-extrabold px-2 py-0.5 rounded">
                RBAC MATRIX
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              提供花蓮智慧路段號誌運維系統之安全防護。可線上實時進行角色指派、客製切換帳戶以測試相容視圖、動態管理 6 大核心權限。
            </p>
          </div>
        </div>

        {/* Action Button: Add System User */}
        <button
          onClick={() => {
            if (!currentUser.permissions.canManageSystemUsers) {
              triggerFeedback('❌ 您目前的身份不允許執行「新增使用者」！請切換為 [系統管理員] 以解鎖此功能。');
              return;
            }
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black flex items-center gap-1.5 shadow-sm transition duration-150 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>新增使用者帳號</span>
        </button>
      </div>

      {/* Overview Matrix / Status Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-900 text-white px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0 shadow-inner">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-350">
              偵測到登入身分為：
            </span>
            <span className="text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
              {currentUser.name} ({currentUser.roleName})
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">
              [{currentUser.email}]
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-normal max-w-3xl">
            <strong>目前可用之操作特權：</strong> 
            {currentUser.permissions.canManageSystemUsers ? '🟢 本尊為高級管理員，可以操作全域權限切換與刪增' : '⚠️ 限縮模式。部分核心異動操作按鈕將自動鎖定，唯可切換下方帳戶以測試系統適應性。'}
          </p>
        </div>

        {/* Quick Help box */}
        <div className="text-[10.5px] bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10 flex items-center gap-2 max-w-sm">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="text-slate-200">
            <strong>模擬小常識：</strong>點選清單中任何人的「✨ 模擬切換登入」即可化身為他，實時體驗視圖變色與權限阻斷。
          </span>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        
        {/* SIDE A: List of System Accounts */}
        <div className="w-full lg:w-3/5 bg-white flex flex-col overflow-hidden h-1/2 lg:h-full">
          
          {/* List Toolbar Search */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="搜尋姓名、信箱、組織轄區..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="text-[11px] text-slate-450 font-bold shrink-0">
              系統資料庫：共計有 <span className="text-indigo-600 font-extrabold">{filteredUsers.length}</span> 位註冊維運帳號
            </div>
          </div>

          {/* Scrolling User List Cards */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredUsers.map(user => {
              const isActive = currentUser.id === user.id;
              const isSelected = selectedUserForEdit?.id === user.id;
              const roleMetaDetail = roleMeta[user.role];

              return (
                <div 
                  key={user.id}
                  onClick={() => setSelectedUserForEdit(user)}
                  className={`border rounded-xl p-4 transition-all duration-150 cursor-pointer text-left flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-50/20 shadow-md ring-1 ring-indigo-500/20' 
                      : isActive 
                        ? 'border-emerald-300 bg-emerald-50/20 shadow-xs' 
                        : 'border-slate-200 hover:border-slate-350 bg-white'
                  }`}
                >
                  {/* Left Column: Avatar & Basic Infos */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className={`w-10 h-10 ${user.avatarColor || 'bg-slate-600'} rounded-lg flex items-center justify-center text-white shrink-0 font-black text-sm relative`}>
                      {user.name.charAt(0)}
                      {isActive && (
                        <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2.5 py-0.5">
                        <span className="text-xs font-black text-slate-900 truncate">
                          {user.name}
                        </span>
                        
                        {/* Role tag */}
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${roleMetaDetail?.color}`}>
                          {user.roleName}
                        </span>

                        {isActive && (
                          <span className="text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.2 rounded">
                            當前登入中
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-slate-450 truncate font-mono mt-0.5">
                        {user.email} · {user.department}
                      </p>

                      {/* Display a dynamic preview of permissions */}
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {user.permissions.canManageSystemUsers && (
                          <span className="text-[9px] bg-slate-950 text-indigo-300 px-1.5 py-0.2 rounded font-black font-mono">ROOT</span>
                        )}
                        {user.permissions.canApproveSurvey && (
                          <span className="text-[9px] bg-indigo-50 border border-indigo-150 text-indigo-600 px-1.5 py-0.2 rounded font-semibold">諸元核定審查</span>
                        )}
                        {user.permissions.canEditSurveyElements && (
                          <span className="text-[9px] bg-emerald-50 border border-emerald-150 text-emerald-600 px-1.5 py-0.2 rounded font-semibold">表19諸元編輯</span>
                        )}
                        {user.permissions.canManageCases && (
                          <span className="text-[9px] bg-blue-50 border border-blue-150 text-blue-600 px-1.5 py-0.2 rounded font-semibold">派工單維運</span>
                        )}
                        {user.permissions.canManageContracts && (
                          <span className="text-[9px] bg-slate-50 border border-slate-150 text-slate-600 px-1.5 py-0.2 rounded font-semibold">開口合約建檔</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Mini action quick actions */}
                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    {/* Switch identity simulation */}
                    {!isActive ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwitchSession(user.id);
                        }}
                        className="px-3 py-1.5 bg-slate-900 text-amber-300 hover:bg-slate-950 rounded-lg text-[10.5px] font-black flex items-center gap-1 transition-all cursor-pointer border border-transparent hover:border-amber-300"
                        title="虛擬化切換為本使用者之權限"
                      >
                        <RefreshCw className="w-3 h-3 text-amber-400" />
                        <span>✨ 模擬切換登入</span>
                      </button>
                    ) : (
                      <span className="text-[10.5px] text-slate-450 bg-slate-100 px-2.5 py-1.5 rounded-lg font-black border border-slate-200 block">
                        👤 已登入
                      </span>
                    )}

                    {/* Delete action */}
                    {!isActive && user.id !== 'usr-admin' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUser(user.id, user.name);
                        }}
                        className="p-1.5 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-lg transition shrink-0 cursor-pointer"
                        title="將使用者帳號除名"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredUsers.length === 0 && (
              <div className="p-12 text-center text-slate-400 py-24">
                <Users className="w-10 h-10 text-slate-250 mx-auto mb-2" />
                <p className="text-xs font-black">在大數據庫中找不到匹配的使用者</p>
              </div>
            )}
          </div>

        </div>

        {/* SIDE B: Live Permission Console Panel */}
        <div className="w-full lg:w-2/5 bg-slate-50 flex flex-col overflow-y-auto p-5 space-y-5 h-1/2 lg:h-full">
          
          {selectedUserForEdit ? (
            <div className="space-y-4">
              
              {/* User overview block */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${selectedUserForEdit.avatarColor} text-white flex items-center justify-center font-black text-xs shrink-0`}>
                    {selectedUserForEdit.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-950 flex items-center gap-2">
                      <span>{selectedUserForEdit.name}</span>
                      <span className="text-[10px] font-semibold text-slate-400">權限修改面板</span>
                    </h4>
                    <p className="text-[10.5px] text-slate-450 font-mono italic">
                      {selectedUserForEdit.email} · {selectedUserForEdit.department}
                    </p>
                  </div>
                </div>

                {/* Role dropdown modification selector */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10.5px] font-black text-slate-500">指派行政與工程角色組 (Role Base)</label>
                    <span className="text-[9px] bg-indigo-50 text-indigo-600 font-black px-1 py-0.2 rounded border border-indigo-150">ROLE ASSIGN</span>
                  </div>
                  <select
                    value={selectedUserForEdit.role}
                    onChange={(e) => handleRoleChange(selectedUserForEdit.id, e.target.value as UserRole)}
                    disabled={!currentUser.permissions.canManageSystemUsers}
                    className="w-full text-xs bg-white border border-slate-250 p-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
                  >
                    <option value="ADMIN">ADMIN - 系統管理員 (全功能)</option>
                    <option value="SUPERVISOR">SUPERVISOR - 稽核/處長主管 (唯讀/審核)</option>
                    <option value="ENGINEER">ENGINEER - 運維工程師 (派工/合約)</option>
                    <option value="SURVEYOR">SURVEYOR - 現場普查員 (諸元回報)</option>
                  </select>
                  <p className="text-[10px] text-slate-400 italic">
                    {roleMeta[selectedUserForEdit.role]?.desc}
                  </p>
                </div>
              </div>

              {/* Six (6) Core Permissions matrix switches */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-sidebar-divider pb-2">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <h5 className="text-[11px] font-black text-slate-900">極度限縮功能權限矩陣 (細粒度)</h5>
                  </div>
                  
                  {!currentUser.permissions.canManageSystemUsers ? (
                    <span className="text-[9px] bg-red-50 text-rose-600 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-rose-100">
                      <Lock className="w-2.5 h-2.5" /> 鎖定
                    </span>
                  ) : (
                    <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-100">
                      <Unlock className="w-2.5 h-2.5" /> 編輯中
                    </span>
                  )}
                </div>

                <div className="divide-y divide-slate-100">
                  {/* P1: canEditIntersections */}
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-800">1. 編輯號誌基本屬性</p>
                      <p className="text-[10px] text-slate-400">允許修改路口IP、時相數、座標與週期參數。</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedUserForEdit.permissions.canEditIntersections}
                      disabled={!currentUser.permissions.canManageSystemUsers}
                      onChange={() => handleTogglePermission(selectedUserForEdit.id, 'canEditIntersections')}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 accent-indigo-600 cursor-pointer disabled:opacity-60"
                    />
                  </div>

                  {/* P2: canManageCases */}
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-800">2. 派工單維運與結案</p>
                      <p className="text-[10px] text-slate-400">允許指派工單、重設修復時間與編列結算金額。</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedUserForEdit.permissions.canManageCases}
                      disabled={!currentUser.permissions.canManageSystemUsers}
                      onChange={() => handleTogglePermission(selectedUserForEdit.id, 'canManageCases')}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 accent-indigo-600 cursor-pointer disabled:opacity-60"
                    />
                  </div>

                  {/* P3: canManageContracts */}
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-800">3. 契約及開口預算管理</p>
                      <p className="text-[10px] text-slate-400">允許建檔、上傳公文契約附件、分配詳細工程經費。</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedUserForEdit.permissions.canManageContracts}
                      disabled={!currentUser.permissions.canManageSystemUsers}
                      onChange={() => handleTogglePermission(selectedUserForEdit.id, 'canManageContracts')}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 accent-indigo-600 cursor-pointer disabled:opacity-60"
                    />
                  </div>

                  {/* P4: canEditSurveyElements */}
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-800">4. 表19調查項目盤點編輯</p>
                      <p className="text-[10px] text-slate-400">允許回報填寫 43 項設施調查與控制器過保資料、上傳竣工圖。</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedUserForEdit.permissions.canEditSurveyElements}
                      disabled={!currentUser.permissions.canManageSystemUsers}
                      onChange={() => handleTogglePermission(selectedUserForEdit.id, 'canEditSurveyElements')}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 accent-indigo-600 cursor-pointer disabled:opacity-60"
                    />
                  </div>

                  {/* P5: canApproveSurvey */}
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-800">5. 諸元稽核與成果核定</p>
                      <p className="text-[10px] text-slate-400">允許簽章認可各承包商上傳的成果或將之列為退回重查。</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedUserForEdit.permissions.canApproveSurvey}
                      disabled={!currentUser.permissions.canManageSystemUsers}
                      onChange={() => handleTogglePermission(selectedUserForEdit.id, 'canApproveSurvey')}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 accent-indigo-600 cursor-pointer disabled:opacity-60"
                    />
                  </div>

                  {/* P6: canManageSystemUsers */}
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-800">6. 使用者帳號與特權配給</p>
                      <p className="text-[10px] text-slate-400">系統最高存取層級。可修改每位使用者之開關與角色。</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedUserForEdit.permissions.canManageSystemUsers}
                      disabled={!currentUser.permissions.canManageSystemUsers}
                      onChange={() => handleTogglePermission(selectedUserForEdit.id, 'canManageSystemUsers')}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 accent-indigo-600 cursor-pointer disabled:opacity-60"
                    />
                  </div>
                </div>

                {!currentUser.permissions.canManageSystemUsers && (
                  <div className="pt-2">
                    <div className="bg-red-50 text-red-800 border border-red-100 p-2.5 rounded-lg text-[9.5px] leading-relaxed flex items-center gap-1.5 font-bold">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>唯讀防盜：當前登入身分缺乏 canManageSystemUsers 授權。欲開啟開關，請在左側輕點【✨ 模擬切換登入】以「陳管理 (系統管理員)」身份測試。</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 border border-slate-200 text-center text-slate-400 py-12 flex flex-col items-center justify-center">
              <Users className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-xs font-black">請在左方清單選擇其中一位維運人員</p>
              <p className="text-[10px]">選取後可在此檢驗其六大核心特權控管開關。</p>
            </div>
          )}

          {/* Audit Trail Box */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-500" />
                <h5 className="text-[11px] font-black text-slate-900">🔒 安全防務與權限稽查日誌 (實時)</h5>
              </div>
              <span className="text-[9px] bg-slate-900 text-slate-300 font-mono font-bold px-1.5 py-0.5 rounded">
                AUDIT LOGS
              </span>
            </div>

            <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
              {auditLogs.map(log => (
                <div key={log.id} className="bg-slate-50 p-2 rounded border border-slate-150 text-[10.5px]">
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono font-bold mb-1">
                    <span>主事者：{log.actorName}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <p className="text-slate-850 font-semibold leading-normal">
                    針對標的 <strong className="text-slate-900">[{log.targetName}]</strong> —— {log.action}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Add System User Modal Popup */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl max-w-md w-full text-left space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-black border-b border-slate-100 pb-3">
              <UserPlus className="w-5 h-5" />
              <h3 className="text-sm font-black text-slate-900">新增花蓮路段維護認證帳戶</h3>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-[11px] font-black text-slate-500 block mb-1">人員真實姓名 *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="例如：王小明"
                  className="w-full text-xs p-2.5 bg-white border border-slate-250 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-500 block mb-1">公用安全電子郵件 *</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="username@gcs.ceci.com.tw"
                  className="w-full text-xs p-2.5 bg-white border border-slate-250 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black text-slate-500 block mb-1">所屬處室部會</label>
                  <input
                    type="text"
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    placeholder="花蓮工務處交通科"
                    className="w-full text-xs p-2.5 bg-white border border-slate-250 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-500 block mb-1">分配初始角色組</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-250 rounded-lg"
                  >
                    <option value="ADMIN">ADMIN (系統管理員)</option>
                    <option value="SUPERVISOR">SUPERVISOR (稽核/處長主管)</option>
                    <option value="ENGINEER">ENGINEER (運維工程師)</option>
                    <option value="SURVEYOR">SURVEYOR (現場普查員)</option>
                  </select>
                </div>
              </div>

              <div className="text-[10.5px] bg-slate-50 p-2 rounded text-slate-500 leading-normal">
                💡 創立新帳號後，系統將依所選角色類別，在 <strong>RBAC MATRIX</strong> 中初始化對應的六類功能閘權，您隨後可在總控台將其額外關閉或加壓開啟。
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-lg shadow-xs cursor-pointer"
                >
                  建置完成並授信
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
