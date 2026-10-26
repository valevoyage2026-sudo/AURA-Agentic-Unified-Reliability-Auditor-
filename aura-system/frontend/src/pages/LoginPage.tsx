import React, { useState } from 'react';
import { auraStore, DEMO_OFFICER, DEMO_STUDENT } from '../store/useAuraStore';
import { ShieldCheck, GraduationCap, ArrowRight, Lock, Mail, User, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'officer' | 'user'>('officer');
  const [fullName, setFullName] = useState(DEMO_OFFICER.name);
  const [email, setEmail] = useState(DEMO_OFFICER.email);
  const [department, setDepartment] = useState(DEMO_OFFICER.department);
  const [password, setPassword] = useState('aurademo');

  const onLogin = (e: React.FormEvent) => {
    e.preventDefault();
    auraStore.loginWithProfile({
      name: fullName,
      email,
      role: selectedRole,
      department: department || (selectedRole === 'officer' ? 'University Registrar' : 'Computer Science'),
    });
  };

  const handleSelectDemo = (role: 'officer' | 'user') => {
    auraStore.loginAs(role);
  };

  const onBack = () => {
    auraStore.setViewState('landing');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans" style={{ background: 'var(--bg)', color: 'var(--txt)' }}>
      {/* Left Editorial Section */}
      <div
        className="flex-1 p-8 lg:p-12 flex flex-col justify-between hidden md:flex border-r"
        style={{ borderColor: 'var(--line)', background: 'var(--card)' }}
      >
        <div className="flex items-center gap-3">
          <img src="/assets/aura/logo.svg" alt="AURA" className="w-7 h-7" />
          <b className="tracking-widest text-lg font-semibold" style={{ color: 'var(--ink)' }}>AURA</b>
          <small className="border-l pl-3 text-xs tracking-wider uppercase font-mono" style={{ borderColor: 'var(--line)', color: 'var(--mut)' }}>
            Compliance & Verification Console
          </small>
        </div>

        <div className="max-w-md my-auto py-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider mb-4" style={{ background: 'rgba(217, 86, 11, 0.1)', color: 'var(--or)' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--or)' }}></span>
            Account-Based Role Architecture
          </div>

          <h1 className="text-3xl font-bold leading-tight mb-3" style={{ color: 'var(--ink)' }}>
            Enterprise compliance auditing with deterministic provenance.
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--mut)' }}>
            Dedicated workspaces for university officers and academic advisors. Cross-verify prerequisite claims, ingest canonical policy handbooks, and generate certified reliability audits.
          </p>

          {/* Quick Demo Access Cards */}
          <div className="flex flex-col gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--ink)' }}>
              Instant Demo Access Profiles:
            </div>

            <button
              type="button"
              onClick={() => handleSelectDemo('officer')}
              className="p-3.5 rounded-lg border text-left transition-all hover:translate-x-1 cursor-pointer flex items-center justify-between group"
              style={{ background: 'var(--bg)', borderColor: 'var(--line)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ background: 'var(--nav)', color: '#fff' }}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-xs" style={{ color: 'var(--ink)' }}>
                    Dr. Aris Thorne <span className="font-normal opacity-70">— University Registrar</span>
                  </div>
                  <div className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--mut)' }}>
                    Role: Officer • Knowledge Vault & Policy Indexing
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" style={{ color: 'var(--or)' }} />
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemo('user')}
              className="p-3.5 rounded-lg border text-left transition-all hover:translate-x-1 cursor-pointer flex items-center justify-between group"
              style={{ background: 'var(--bg)', borderColor: 'var(--line)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ background: '#e3f3e8', color: 'var(--ok)' }}>
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-xs" style={{ color: 'var(--ink)' }}>
                    Sarah Jenkins <span className="font-normal opacity-70">— Student / Advisor</span>
                  </div>
                  <div className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--mut)' }}>
                    Role: Student • Advisory AI & Draft Policy Audits
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" style={{ color: 'var(--or)' }} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-4 border-t" style={{ borderColor: 'var(--line)', color: 'var(--mut)' }}>
          <span>Agentic Unified Reliability Auditor</span>
          <span>Trust • Transparency • Reliability</span>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex-none w-full md:w-[480px] flex items-center justify-center p-6 md:p-10 relative overflow-y-auto">
        <div className="w-full max-w-[380px]">
          <button
            type="button"
            onClick={onBack}
            className="text-xs mb-6 flex items-center gap-1.5 transition-colors cursor-pointer"
            style={{ color: 'var(--mut)' }}
          >
            &larr; Back to Landing Page
          </button>

          {/* Mode Tabs */}
          <div className="flex border-b mb-6" style={{ borderColor: 'var(--line)' }}>
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className="flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-colors cursor-pointer"
              style={{
                borderColor: !isSignUp ? 'var(--or)' : 'transparent',
                color: !isSignUp ? 'var(--or)' : 'var(--mut)',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className="flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-colors cursor-pointer"
              style={{
                borderColor: isSignUp ? 'var(--or)' : 'transparent',
                color: isSignUp ? 'var(--or)' : 'var(--mut)',
              }}
            >
              Create Account
            </button>
          </div>

          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--ink)' }}>
            {isSignUp ? 'Register AURA Account' : 'Sign in to your Workspace'}
          </h2>
          <p className="text-xs mb-6" style={{ color: 'var(--mut)' }}>
            {isSignUp
              ? 'Select your institutional role to access authorized compliance tools.'
              : 'Sign in with your university credentials or select a demo profile below.'}
          </p>

          {/* Role Selector Card */}
          <div className="mb-4">
            <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--ink)' }}>
              Select Institutional Role:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('officer');
                  setFullName(DEMO_OFFICER.name);
                  setEmail(DEMO_OFFICER.email);
                  setDepartment(DEMO_OFFICER.department);
                }}
                className={`p-2.5 rounded border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  selectedRole === 'officer' ? 'ring-1' : ''
                }`}
                style={{
                  background: selectedRole === 'officer' ? 'var(--card)' : 'transparent',
                  borderColor: selectedRole === 'officer' ? 'var(--nav)' : 'var(--line)',
                  boxShadow: selectedRole === 'officer' ? '0 1px 4px rgba(18, 48, 90, 0.1)' : 'none',
                }}
              >
                <div className="flex items-center justify-between">
                  <ShieldCheck className="w-4 h-4" style={{ color: 'var(--nav)' }} />
                  {selectedRole === 'officer' && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--or)' }} />}
                </div>
                <div className="font-bold text-xs" style={{ color: 'var(--ink)' }}>Registrar Officer</div>
                <div className="text-[10px]" style={{ color: 'var(--mut)' }}>Policy & Vault Admin</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('user');
                  setFullName(DEMO_STUDENT.name);
                  setEmail(DEMO_STUDENT.email);
                  setDepartment(DEMO_STUDENT.department);
                }}
                className={`p-2.5 rounded border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  selectedRole === 'user' ? 'ring-1' : ''
                }`}
                style={{
                  background: selectedRole === 'user' ? 'var(--card)' : 'transparent',
                  borderColor: selectedRole === 'user' ? 'var(--nav)' : 'var(--line)',
                  boxShadow: selectedRole === 'user' ? '0 1px 4px rgba(18, 48, 90, 0.1)' : 'none',
                }}
              >
                <div className="flex items-center justify-between">
                  <GraduationCap className="w-4 h-4" style={{ color: 'var(--ok)' }} />
                  {selectedRole === 'user' && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--or)' }} />}
                </div>
                <div className="font-bold text-xs" style={{ color: 'var(--ink)' }}>Student / Advisor</div>
                <div className="text-[10px]" style={{ color: 'var(--mut)' }}>Auditing & Advisory</div>
              </button>
            </div>
          </div>

          <form onSubmit={onLogin} className="flex flex-col gap-3.5">
            {isSignUp && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium" style={{ color: 'var(--ink)' }}>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Dr. Aris Thorne"
                  required
                  className="p-2.5 rounded border text-xs outline-none transition-colors"
                  style={{ background: 'var(--card)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: 'var(--ink)' }}>University Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                required
                className="p-2.5 rounded border text-xs outline-none transition-colors"
                style={{ background: 'var(--card)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              />
            </div>

            {isSignUp && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium" style={{ color: 'var(--ink)' }}>Department / Faculty</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g., University Registrar"
                  required
                  className="p-2.5 rounded border text-xs outline-none transition-colors"
                  style={{ background: 'var(--card)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: 'var(--ink)' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="p-2.5 rounded border text-xs outline-none transition-colors"
                style={{ background: 'var(--card)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded text-xs font-semibold text-white transition-all cursor-pointer mt-2 shadow-xs"
              style={{
                background: 'linear-gradient(90deg, #c94a05, #f08a2c)',
                boxShadow: '0 4px 10px rgba(217, 86, 11, 0.25)',
              }}
            >
              {isSignUp ? 'Create Authorized Account' : `Sign in as ${selectedRole === 'officer' ? 'Registrar' : 'Student'}`}
            </button>

            {/* Quick Demo Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleSelectDemo('officer')}
                className="py-2 px-2.5 rounded border text-[11px] font-semibold text-center transition-colors cursor-pointer"
                style={{ borderColor: 'var(--line)', background: 'var(--card)', color: 'var(--ink)' }}
              >
                Sign in as Registrar
              </button>
              <button
                type="button"
                onClick={() => handleSelectDemo('user')}
                className="py-2 px-2.5 rounded border text-[11px] font-semibold text-center transition-colors cursor-pointer"
                style={{ borderColor: 'var(--line)', background: 'var(--card)', color: 'var(--ink)' }}
              >
                Sign in as Student
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
