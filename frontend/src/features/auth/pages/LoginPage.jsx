import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../store';
import { ROLE_PRESETS } from '../../../config/roles';
import { ShieldCheck, ArrowRight, KeyRound, Mail, Lock, UserCheck } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { toast } from 'sonner';
import { backend } from '../../../services/api/backend';
import { BrandLogo } from '../../../components/domain/BrandLogo';

const DEMO_OTP = '123456';

export function LoginPage() {
  const navigate = useNavigate();
  const loginAsRole = useAppStore((state) => state.loginAsRole);
  const refreshFromBackend = useAppStore((state) => state.refreshFromBackend);

  const [step, setStep] = useState('CREDENTIALS'); // 'CREDENTIALS' or 'OTP'
  const [selectedPreset, setSelectedPreset] = useState(ROLE_PRESETS[0]);
  const [email, setEmail] = useState(ROLE_PRESETS[0].email);
  const [password, setPassword] = useState('password123');
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [loading, setLoading] = useState(false);

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setEmail(preset.email);
  };

  // Django backend: real JWT login; the server decides whether an OTP step is needed.
  const backendLogin = async (otpCode) => {
    setLoading(true);
    try {
      const res = await backend.login(email.trim(), password, otpCode);
      if (res.otpRequired) {
        setOtp(['', '', '', '', '', '']);
        setStep('OTP');
        toast.info('Enter the 6-digit OTP sent to your registered mobile.');
        return;
      }
      if (!(await refreshFromBackend())) throw new Error('Signed in, but loading data from the server failed.');
      toast.success(`Welcome back, ${res.user?.name || email}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsSubmit = (e) => {
    e.preventDefault();
    if (backend.enabled()) {
      backendLogin();
      return;
    }
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (selectedPreset.twoFactorRequired) {
        setStep('OTP');
        toast.info(`Mock 2FA OTP sent to registered mobile for ${selectedPreset.name}: Use 123456`);
      } else {
        loginAsRole(selectedPreset.id);
        toast.success(`Welcome back, ${selectedPreset.name}!`);
        navigate('/');
      }
    }, 400);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (backend.enabled()) {
      backendLogin(code);
      return;
    }
    if (code !== DEMO_OTP) {
      toast.error(`Invalid OTP. Use the demo code ${DEMO_OTP}.`);
      return;
    }
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      loginAsRole(selectedPreset.id);
      toast.success(`2FA Verified! Logged in as ${selectedPreset.role}`);
      navigate('/');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <BrandLogo className="w-16 h-16 rounded-2xl shadow-lg shadow-blue-500/20" />
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white">
          AKASH Bajaj
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Enterprise Dealership Management & Workshop Service Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-surface py-8 px-6 shadow-dialog rounded-card border border-border sm:px-10">
          {step === 'CREDENTIALS' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-text-main mb-1.5">
                  Sign in with Demo Persona
                </label>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {ROLE_PRESETS.slice(0, 4).map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-2 rounded-button border text-left transition-all ${
                        selectedPreset.id === preset.id
                          ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary'
                          : 'border-border bg-surface-subtle text-text-main hover:bg-surface-muted'
                      }`}
                    >
                      <div className="text-xs truncate">{preset.name}</div>
                      <div className="text-[10px] text-text-muted truncate">{preset.role}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-input border border-border bg-surface-subtle text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-input border border-border bg-surface-subtle text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {selectedPreset.twoFactorRequired && (
                <div className="flex items-center gap-2 p-2.5 rounded bg-amber-50 border border-amber-200 text-status-amber text-[11px]">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>2FA Security required for {selectedPreset.role} persona</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={loading}
                iconRight={ArrowRight}
              >
                {selectedPreset.twoFactorRequired ? 'Proceed to 2FA Verification' : 'Access Showroom Terminal'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-text-main">Enter 6-Digit Security OTP</h3>
                <p className="text-xs text-text-muted mt-1">
                  Sent to registered mobile for <strong>{selectedPreset.name}</strong>
                </p>
              </div>

              <div className="flex justify-center gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const newOtp = [...otp];
                      newOtp[idx] = e.target.value;
                      setOtp(newOtp);
                    }}
                    className="w-10 h-12 text-center font-mono text-base font-bold rounded-input border border-border bg-surface-subtle text-text-main focus:ring-2 focus:ring-primary"
                  />
                ))}
              </div>

              <div className="space-y-2">
                <Button type="submit" variant="primary" className="w-full" loading={loading}>
                  Verify & Enter ERP
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep('CREDENTIALS')}
                >
                  Back to Persona Selection
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
