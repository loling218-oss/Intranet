import { useState, useEffect } from 'react';
import { Building2, Landmark, Gem, Shield, ChevronDown, ArrowRight, Eye, EyeOff, User, Lock, LogOut, Bell, FileText, Laptop, Palmtree, Award, ClipboardCheck } from 'lucide-react';
import { societies, SocietyTheme } from './themes';
import { validUsers, mockDocuments, mockDevices, mockVacations, mockCertificates, mockExams, UserRole } from './mockData';
import DocumentsCard from './DocumentsCard';
import DevicesCard from './DevicesCard';
import VacationsCard from './VacationsCard';
import CertificatesCard from './CertificatesCard';
import ExamsCard from './ExamsCard';
import AdminPanel from './AdminPanel';
import RRHHPanel from './RRHHPanel';

const iconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
  'building-2': Building2,
  landmark: Landmark,
  gem: Gem,
  shield: Shield,
};

type AppView = 'login' | 'admin' | 'rrhh' | 'dashboard';

interface SessionState {
  email: string;
  role: UserRole;
  societyId: string | null;
  view: AppView;
  activeSocietyId: string | null;
}

export default function LoginPage() {
  const [selectedId, setSelectedId] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [session, setSession] = useState<SessionState | null>(null);

  const selected = societies.find((s) => s.id === selectedId) ?? null;

  useEffect(() => {
    if (selectedId) {
      setIsTransitioning(true);
      const timer = setTimeout(() => setIsTransitioning(false), 600);
      return () => clearTimeout(timer);
    }
  }, [selectedId]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.society-dropdown')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogin = () => {
    setLoginError('');
    const user = validUsers.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password
    );
    if (!user) {
      setLoginError('Credenciales incorrectas. Verifica tu correo y contrasena.');
      return;
    }

    let initialView: AppView;
    if (user.role === 'admin') {
      initialView = 'admin';
    } else if (user.role === 'rrhh') {
      initialView = 'rrhh';
    } else {
      initialView = 'dashboard';
      setSelectedId(user.societyId ?? '');
    }

    setSession({
      email: user.email,
      role: user.role,
      societyId: user.societyId,
      view: initialView,
      activeSocietyId: user.societyId,
    });
  };

  const handleLogout = () => {
    setSession(null);
    setSelectedId('');
    setEmail('');
    setPassword('');
    setLoginError('');
  };

  const handleNavigate = (view: 'admin' | 'rrhh' | 'society', societyId?: string) => {
    if (!session) return;
    if (view === 'society' && societyId) {
      setSelectedId(societyId);
      setSession({ ...session, view: 'dashboard', activeSocietyId: societyId });
    } else if (view === 'admin') {
      setSession({ ...session, view: 'admin' });
    } else if (view === 'rrhh') {
      setSession({ ...session, view: 'rrhh' });
    }
  };

  // Route to the right panel
  if (session) {
    if (session.view === 'admin') {
      return (
        <AdminPanel
          email={session.email}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      );
    }

    if (session.view === 'rrhh') {
      return (
        <RRHHPanel
          email={session.email}
          onLogout={handleLogout}
          onNavigateAdmin={session.role === 'admin' ? () => handleNavigate('admin') : undefined}
          isAdmin={session.role === 'admin'}
        />
      );
    }

    if (session.view === 'dashboard') {
      const theme = societies.find((s) => s.id === session.activeSocietyId) ?? null;
      if (theme) {
        return (
          <Dashboard
            theme={theme}
            onLogout={handleLogout}
            email={session.email}
            isAdmin={session.role === 'admin'}
            onNavigateAdmin={session.role === 'admin' ? () => handleNavigate('admin') : undefined}
          />
        );
      }
    }
  }

  // Login form - admin/rrhh users don't need society selector
  const isPrivilegedUser = email.trim().toLowerCase() === 'admin@empresa.com' ||
    email.trim().toLowerCase() === 'rrhh@empresa.com';
  const canLogin = isPrivilegedUser ? (email.trim() && password) : (selected && email && password);

  return (
    <div
      className="min-h-screen flex transition-all duration-700 ease-out"
      style={{ backgroundColor: selected?.bg ?? '#F8FAFC' }}
    >
      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-[45%] relative overflow-hidden transition-all duration-700 ease-out"
        style={{
          background: selected
            ? `linear-gradient(135deg, ${selected.gradientFrom}, ${selected.gradientTo})`
            : 'linear-gradient(135deg, #334155, #1E293B)',
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full border-2 border-white/20" />
          <div className="absolute bottom-32 right-16 w-96 h-96 rounded-full border border-white/10" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full border border-white/15" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full px-16">
          <div className={`transition-all duration-500 ${isTransitioning ? 'scale-90 opacity-0' : 'scale-100 opacity-100'}`}>
            <div className="flex items-center justify-center mb-10">
              <div
                className="w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                {selected ? (
                  <span className="text-5xl font-bold text-white tracking-tight">{selected.logoLetter}</span>
                ) : (
                  <Building2 size={56} className="text-white/60" />
                )}
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white text-center mb-3 tracking-tight">
              {selected ? selected.name : 'Portal del Empleado'}
            </h1>
            <p className="text-white/70 text-center text-lg max-w-sm mx-auto leading-relaxed">
              {selected ? 'Accede a tu espacio de trabajo y gestiona tus recursos empresariales' : 'Selecciona tu sociedad para comenzar'}
            </p>
          </div>

          <div className="mt-14 space-y-4 w-full max-w-sm">
            {['Gestion de nominas y documentos', 'Solicitudes y aprobaciones', 'Directorio y comunicados'].map((text, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selected?.accent ?? '#F59E0B' }} />
                <span className="text-white/80 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500"
              style={{
                backgroundColor: selected ? `${selected.primary}15` : '#F1F5F9',
                border: selected ? `2px solid ${selected.primary}30` : '2px solid #E2E8F0',
              }}
            >
              {selected ? (
                <span className="text-2xl font-bold transition-colors duration-500" style={{ color: selected.primary }}>{selected.logoLetter}</span>
              ) : (
                <Building2 size={28} className="text-gray-400" />
              )}
            </div>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-2xl font-bold tracking-tight transition-colors duration-500" style={{ color: selected?.textPrimary ?? '#1E293B' }}>
              Iniciar Sesion
            </h2>
            <p className="mt-2 text-sm transition-colors duration-500" style={{ color: selected?.textSecondary ?? '#64748B' }}>
              Introduce tus credenciales para acceder
            </p>
          </div>

          {/* Society Selector — hidden for admin/rrhh users */}
          {!isPrivilegedUser && (
            <div className="mb-6 relative society-dropdown">
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider transition-colors duration-500" style={{ color: selected?.textSecondary ?? '#64748B' }}>
                Sociedad
              </label>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left transition-all duration-300 cursor-pointer"
                style={{
                  backgroundColor: selected ? selected.primaryLight : '#F8FAFC',
                  border: `1.5px solid ${selected ? selected.border : '#E2E8F0'}`,
                  color: selected ? selected.textPrimary : '#334155',
                }}
              >
                <div className="flex items-center gap-3">
                  {selected ? (
                    <>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${selected.primary}18` }}>
                        {(() => { const Icon = iconMap[selected.logoIcon]; return Icon ? <Icon size={16} style={{ color: selected.primary }} /> : null; })()}
                      </div>
                      <span className="font-medium">{selected.name}</span>
                    </>
                  ) : (
                    <span className="text-gray-400">Selecciona una sociedad...</span>
                  )}
                </div>
                <ChevronDown size={18} className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} style={{ color: selected?.textSecondary ?? '#94A3B8' }} />
              </button>

              {dropdownOpen && (
                <div className="absolute z-50 w-full mt-2 rounded-xl overflow-hidden shadow-xl" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                  {societies.map((society) => {
                    const Icon = iconMap[society.logoIcon];
                    return (
                      <button
                        key={society.id}
                        onClick={() => { setSelectedId(society.id); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-200 hover:bg-gray-50 cursor-pointer"
                        style={{ backgroundColor: selectedId === society.id ? society.primaryLight : 'transparent' }}
                      >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${society.primary}15` }}>
                          {Icon ? <Icon size={18} style={{ color: society.primary }} /> : null}
                        </div>
                        <div>
                          <div className="font-medium text-sm" style={{ color: society.textPrimary }}>{society.name}</div>
                          <div className="text-xs" style={{ color: society.textSecondary }}>Portal {society.logoLetter}</div>
                        </div>
                        {selectedId === society.id && <div className="ml-auto w-2 h-2 rounded-full" style={{ backgroundColor: society.primary }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Admin access hint */}
          {isPrivilegedUser && (
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl mb-6"
              style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}
            >
              <Shield size={14} style={{ color: '#DC2626' }} />
              <span className="text-xs font-medium" style={{ color: '#DC2626' }}>
                Acceso privilegiado detectado &mdash; no se requiere sociedad
              </span>
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider transition-colors duration-500" style={{ color: selected?.textSecondary ?? '#64748B' }}>
              Correo electronico
            </label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-500" style={{ color: selected?.textSecondary ?? '#94A3B8' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setLoginError(''); }}
                placeholder="tu@empresa.com"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-300"
                style={{
                  backgroundColor: selected ? selected.primaryLight : '#F8FAFC',
                  border: `1.5px solid ${loginError ? '#EF4444' : selected ? selected.border : '#E2E8F0'}`,
                  color: selected?.textPrimary ?? '#1E293B',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider transition-colors duration-500" style={{ color: selected?.textSecondary ?? '#64748B' }}>
              Contrasena
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-500" style={{ color: selected?.textSecondary ?? '#94A3B8' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
                placeholder="Introduce tu contrasena"
                className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm outline-none transition-all duration-300"
                style={{
                  backgroundColor: selected ? selected.primaryLight : '#F8FAFC',
                  border: `1.5px solid ${loginError ? '#EF4444' : selected ? selected.border : '#E2E8F0'}`,
                  color: selected?.textPrimary ?? '#1E293B',
                }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: selected?.textSecondary ?? '#94A3B8' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {loginError && (
            <p className="text-xs text-red-500 mb-4 mt-2 pl-1">{loginError}</p>
          )}

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between mb-8 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="w-4 h-4 rounded border transition-all duration-300 flex items-center justify-center" style={{ borderColor: selected?.border ?? '#CBD5E1', backgroundColor: selected?.primaryLight ?? '#F8FAFC' }}>
                <input type="checkbox" className="sr-only" />
              </div>
              <span className="text-xs transition-colors duration-500" style={{ color: selected?.textSecondary ?? '#64748B' }}>Recordarme</span>
            </label>
            <button className="text-xs font-medium transition-colors duration-500 cursor-pointer" style={{ color: selected?.primary ?? '#475569' }}>
              Olvidaste tu contrasena?
            </button>
          </div>

          {/* Submit */}
          <button
            onClick={handleLogin}
            disabled={!canLogin}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-300 cursor-pointer disabled:cursor-not-allowed"
            style={{
              backgroundColor: selected ? selected.primary : isPrivilegedUser && email && password ? '#0F172A' : '#CBD5E1',
              opacity: canLogin ? 1 : 0.6,
              boxShadow: selected ? `0 4px 14px ${selected.primary}40` : isPrivilegedUser ? '0 4px 14px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            Entrar
            <ArrowRight size={16} />
          </button>

          <p className="text-center mt-6 text-xs transition-colors duration-500" style={{ color: selected?.textSecondary ?? '#94A3B8' }}>
            Problemas para acceder? Contacta al departamento de TI
          </p>
        </div>
      </div>
    </div>
  );
}

function Dashboard({
  theme,
  onLogout,
  email,
  isAdmin,
  onNavigateAdmin,
}: {
  theme: SocietyTheme;
  onLogout: () => void;
  email: string;
  isAdmin?: boolean;
  onNavigateAdmin?: () => void;
}) {
  const Icon = iconMap[theme.logoIcon];
  const [activeTab, setActiveTab] = useState('resumen');

  const docs = mockDocuments[theme.id] ?? [];
  const devices = mockDevices[theme.id] ?? [];
  const vacations = mockVacations[theme.id] ?? { balance: { total: 0, used: 0, pending: 0 }, requests: [] };
  const certificates = mockCertificates[theme.id] ?? [];
  const exams = mockExams[theme.id] ?? [];

  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: FileText },
    { id: 'certificados', label: 'Mis Certificados', icon: Award },
    { id: 'examenes', label: 'Mis Examenes', icon: ClipboardCheck },
  ];

  return (
    <div className="min-h-screen transition-all duration-700" style={{ backgroundColor: theme.bg }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 transition-all duration-700"
        style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/15 backdrop-blur-sm border border-white/20">
              {Icon ? <Icon size={20} className="text-white" /> : null}
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight">{theme.name}</h1>
              <p className="text-white/60 text-xs">Portal del Empleado</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && onNavigateAdmin && (
              <button
                onClick={onNavigateAdmin}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200"
                style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                <Shield size={12} />
                Admin
              </button>
            )}
            <button className="relative p-2 rounded-lg cursor-pointer" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <Bell size={18} className="text-white/80" />
              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: theme.accent }}>
                3
              </div>
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-white text-sm font-medium">{email || 'empleado@empresa.com'}</p>
              <p className="text-white/60 text-xs">{isAdmin ? 'Administrador' : 'Empleado'}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Cerrar Sesion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: theme.textPrimary }}>
              Bienvenido, {email.split('@')[0]}
            </h2>
            <p className="mt-1 text-sm" style={{ color: theme.textSecondary }}>
              Resumen de tus recursos y solicitudes
            </p>
          </div>
          {isAdmin && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ backgroundColor: theme.primaryLight, color: theme.primary, border: `1px solid ${theme.border}` }}
            >
              <Shield size={12} />
              Vista de admin
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div
          className="flex gap-1 p-1 rounded-xl mb-8"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.border}`,
          }}
        >
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer"
                style={{
                  backgroundColor: isActive ? theme.primary : 'transparent',
                  color: isActive ? '#FFFFFF' : theme.textSecondary,
                  boxShadow: isActive ? `0 2px 8px ${theme.primary}30` : 'none',
                }}
              >
                <TabIcon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'resumen' && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Documentos', value: docs.length, color: theme.primary },
                { label: 'Dispositivos', value: devices.filter((d) => d.active).length, color: '#22C55E' },
                { label: 'Dias usados', value: vacations.balance.used, color: '#F59E0B' },
                { label: 'Certificados', value: certificates.length, color: theme.primary },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4 transition-all duration-300"
                  style={{
                    backgroundColor: theme.bgCard,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Main Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <DocumentsCard documents={docs} theme={theme} />
              <DevicesCard devices={devices} theme={theme} />
              <VacationsCard balance={vacations.balance} requests={vacations.requests} theme={theme} />
            </div>
          </>
        )}

        {activeTab === 'certificados' && (
          <CertificatesCard certificates={certificates} theme={theme} />
        )}

        {activeTab === 'examenes' && (
          <ExamsCard exams={exams} theme={theme} />
        )}
      </main>
    </div>
  );
}
