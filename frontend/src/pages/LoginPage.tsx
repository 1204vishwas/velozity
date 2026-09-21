import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Role } from '../types';
import {
  Layers,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  Loader2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, signup, socialLogin, quickLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('DEVELOPER');
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  // Social Auth Modal State
  const [socialModalProvider, setSocialModalProvider] = useState<'google' | 'facebook' | null>(null);
  const [socialName, setSocialName] = useState('');
  const [socialEmail, setSocialEmail] = useState('');
  const [socialRole, setSocialRole] = useState<Role>('DEVELOPER');

  const from = (location.state as any)?.from?.pathname || '/';

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        await login(trimmedEmail, password);
        setSuccessMsg('Signed in successfully! Redirecting...');
      } else {
        await signup(name.trim(), trimmedEmail, password, role);
        setSuccessMsg('Account created successfully! Preparing dashboard...');
      }
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 400);
    } catch (err: any) {
      setIsSubmitting(false);
      const message =
        err.response?.data?.error?.message ||
        (mode === 'signin'
          ? 'Invalid email or password. Please try again.'
          : 'Could not create account. An account with this email may already exist.');
      setError(message);
    }
  };

  const openSocialLoginModal = (provider: 'google' | 'facebook') => {
    setError(null);
    setSuccessMsg(null);
    setSocialModalProvider(provider);
    if (provider === 'google') {
      setSocialName(name || 'Google User');
      setSocialEmail(email || 'user.google@gmail.com');
    } else {
      setSocialName(name || 'Facebook User');
      setSocialEmail(email || 'user.fb@meta.com');
    }
  };

  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialModalProvider || !socialEmail || !socialName) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const avatarUrl =
        socialModalProvider === 'google'
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
          : 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150';

      await socialLogin(socialModalProvider, socialEmail.trim(), socialName.trim(), avatarUrl, socialRole);
      setSuccessMsg(`Signed in with ${socialModalProvider === 'google' ? 'Google' : 'Facebook'}! Redirecting...`);
      setTimeout(() => {
        setSocialModalProvider(null);
        navigate(from, { replace: true });
      }, 400);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.response?.data?.error?.message || 'Social sign-in failed. Please try again.');
    }
  };

  const handleQuickLogin = async (key: 'ADMIN' | 'PM1' | 'PM2' | 'DEV1' | 'DEV2') => {
    setIsSubmitting(true);
    setError(null);
    try {
      await quickLogin(key);
      setSuccessMsg('Signed in as demo user! Redirecting...');
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 400);
    } catch {
      setIsSubmitting(false);
      setError('Failed to log in with demo account.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative selection:bg-brand-500 selection:text-white overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] bg-brand-600/10 blur-[130px] rounded-full pointer-events-none"></div>

      {/* Brand Header */}
      <div className="w-full max-w-md mx-auto text-center relative z-10 mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-cyan-400 shadow-xl shadow-brand-500/25 mb-3 transition-transform hover:scale-105 duration-200">
          <Layers className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          VELOZITY GLOBAL
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium">
          Client Project Dashboard & Real-Time Activity Platform
        </p>
      </div>

      {/* Card Container */}
      <div className="w-full max-w-md mx-auto relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 py-7 px-5 sm:px-8 shadow-2xl rounded-2xl space-y-6 transition-all">
          
          {/* Mode Tabs (Sign In vs Create Account) */}
          <div className="flex p-1 bg-slate-950/80 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all duration-150 ${
                mode === 'signin'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all duration-150 ${
                mode === 'signup'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Social Sign-In Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Google Sign-In */}
            <button
              type="button"
              onClick={() => openSocialLoginModal('google')}
              className="w-full flex items-center justify-center space-x-2.5 h-11 px-4 bg-slate-950/70 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google</span>
            </button>

            {/* Facebook Sign-In */}
            <button
              type="button"
              onClick={() => openSocialLoginModal('facebook')}
              className="w-full flex items-center justify-center space-x-2.5 h-11 px-4 bg-slate-950/70 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
            >
              <svg className="w-4 h-4 text-[#1877F2] fill-current flex-shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold whitespace-nowrap">
              or use your email
            </span>
            <div className="border-t border-slate-800 w-full"></div>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start space-x-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center space-x-2.5 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Email & Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full h-11 pl-10 pr-4 text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full h-11 pl-10 pr-4 text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                {mode === 'signup' && (
                  <span className="text-[10px] text-slate-500">Min. 6 characters</span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-11 text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full h-11 pl-10 pr-4 text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Account Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full h-11 px-3 text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                  >
                    <option value="DEVELOPER">Developer (Assigned Tasks & Real-Time Feed)</option>
                    <option value="PROJECT_MANAGER">Project Manager (Create & Manage Projects)</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center space-x-2 active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{mode === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Collapsible Demo Accounts Section (Keeps focus on custom email/password while remaining accessible) */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="w-full flex items-center justify-between py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Pre-seeded Assessment Accounts</span>
              </div>
              {showDemoAccounts ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {showDemoAccounts && (
              <div className="pt-2 space-y-2 animate-in fade-in duration-150">
                <p className="text-[11px] text-slate-500">
                  Click to log in as any assessment persona with pre-configured permissions:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('ADMIN')}
                    disabled={isSubmitting}
                    className="p-2.5 text-left rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/60 transition-all text-xs text-purple-200 flex flex-col active:scale-[0.98]"
                  >
                    <strong className="font-semibold text-white">👑 Admin</strong>
                    <span className="text-[10px] text-purple-300">Ravi Sharma (Full Platform)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('PM1')}
                    disabled={isSubmitting}
                    className="p-2.5 text-left rounded-xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/60 transition-all text-xs text-indigo-200 flex flex-col active:scale-[0.98]"
                  >
                    <strong className="font-semibold text-white">📋 PM 1</strong>
                    <span className="text-[10px] text-indigo-300">Sarah Jenkins (Projects 1 & 2)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('PM2')}
                    disabled={isSubmitting}
                    className="p-2.5 text-left rounded-xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/60 transition-all text-xs text-indigo-200 flex flex-col active:scale-[0.98]"
                  >
                    <strong className="font-semibold text-white">📋 PM 2</strong>
                    <span className="text-[10px] text-indigo-300">Michael Chang (Project 3 only)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('DEV1')}
                    disabled={isSubmitting}
                    className="p-2.5 text-left rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 transition-all text-xs text-emerald-200 flex flex-col active:scale-[0.98]"
                  >
                    <strong className="font-semibold text-white">💻 Dev 1</strong>
                    <span className="text-[10px] text-emerald-300">Alex Rivera (Assigned Tasks)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Social Sign-In Modal */}
      {socialModalProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center space-x-2">
                {socialModalProvider === 'google' ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-[#1877F2] fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                )}
                <h3 className="text-sm font-bold text-white capitalize">
                  Continue with {socialModalProvider}
                </h3>
              </div>
              <button
                onClick={() => setSocialModalProvider(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSocialSubmit} className="p-5 space-y-4">
              <div className="p-2.5 rounded-xl bg-brand-950/40 border border-brand-800/60 text-xs text-brand-300 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>Choose your preferred account details to proceed.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={socialName}
                  onChange={(e) => setSocialName(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={socialEmail}
                  onChange={(e) => setSocialEmail(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Account Role
                </label>
                <select
                  value={socialRole}
                  onChange={(e) => setSocialRole(e.target.value as Role)}
                  className="w-full h-10 px-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
                >
                  <option value="DEVELOPER">Developer (Assigned Tasks & Live Feed)</option>
                  <option value="PROJECT_MANAGER">Project Manager (Manage Projects)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSocialModalProvider(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Authenticating...' : 'Confirm & Enter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
