import { zodResolver } from '@hookform/resolvers/zod';
import { useGoogleLogin } from '@react-oauth/google';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, type FieldError, type UseFormRegisterReturn } from 'react-hook-form';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(8, 'Password must be at least 8 characters.')
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(8, 'Password must be at least 8 characters.')
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;
type AuthMode = 'login' | 'register';

type FieldProps = {
  autoComplete: string;
  error?: FieldError;
  label: string;
  placeholder: string;
  registration: UseFormRegisterReturn;
  type: string;
};

const AuthField = ({ label, type, placeholder, autoComplete, error, registration }: FieldProps) => {
  const inputId = 'auth-' + registration.name;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-black uppercase text-black" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className={`h-[48px] w-full border-2 bg-[#fffaf1] px-4 text-[14px] font-black text-black outline-none transition placeholder:text-[#9a9489] focus:bg-white focus:shadow-[3px_3px_0_#000] ${
          error ? 'border-[#ef4444]' : 'border-black'
        }`}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        {...registration}
      />
      {error ? <p className="text-xs font-bold text-[#dc2626]">{error.message}</p> : null}
    </div>
  );
};

export const LoginPage = () => {
  const { login, register: createAccount, signInWithGoogle, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard';

  const [mode, setMode] = useState<AuthMode>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );
  const [authError, setAuthError] = useState<string | null>(null);
  const googleConfigured = Boolean(
    (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim()
  );

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' }
  });

  useEffect(() => {
    setMode(searchParams.get('mode') === 'register' ? 'register' : 'login');
  }, [searchParams]);

  const onLoginSubmit = async (values: LoginValues) => {
    setAuthError(null);
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Could not sign in. Please try again.');
    }
  };

  const onRegisterSubmit = async (values: RegisterValues) => {
    setAuthError(null);
    try {
      await createAccount(values);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Could not create your account. Please try again.');
    }
  };

  const completeGoogleLogin = async (accessToken: string) => {
    setAuthError(null);
    try {
      await signInWithGoogle(accessToken);
      navigate(from, { replace: true });
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : 'Could not sign in with Google. Please try again.'
      );
    }
  };

  const showGoogleConfigurationError = () => {
    setAuthError('Google sign-in is not configured yet. Add VITE_GOOGLE_CLIENT_ID to enable it.');
  };

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setSearchParams(next === 'register' ? { mode: 'register' } : {});
    setAuthError(null);
    loginForm.clearErrors();
    registerForm.clearErrors();
  };

  const isRegister = mode === 'register';

  return (
    <main className="landed-brutal min-h-dvh bg-[#fbf7ef] font-sans text-black">
      <section className="flex min-h-dvh flex-col overflow-hidden bg-[#fffaf1]">
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b-4 border-black bg-[#fffaf1] px-6 sm:px-10 lg:px-[8%]">
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-transparent text-left"
            >
              <span className="grid h-9 w-9 place-items-center rounded-md border-[3px] border-black bg-[#f97316] text-base font-black text-white shadow-[3px_3px_0_#000]">
                L
              </span>
              <span className="text-[22px] font-black italic">LANDED</span>
            </button>
            <nav className="hidden items-center gap-7 text-[14px] font-black uppercase md:flex">
              <span>Features</span>
              <span>Pricing</span>
              <span>FAQ</span>
            </nav>
          </div>
            <button
              type="button"
              onClick={() => switchMode(isRegister ? 'login' : 'register')}
              className="border-[3px] border-black bg-[#f97316] px-5 py-2.5 text-[13px] font-black uppercase text-white shadow-[4px_4px_0_#000] transition hover:-translate-y-0.5"
            >
              {isRegister ? 'Log in' : 'Create account'}
            </button>
        </header>

        <div className="grid flex-1 lg:grid-cols-2">
          <aside className="flex min-h-[320px] flex-col justify-center border-b-4 border-black bg-[#f97316] px-8 py-10 lg:min-h-0 lg:border-b-0 lg:border-r-4 lg:px-[10%]">
            <div className="max-w-[640px]">
              <h1 className="text-[clamp(60px,4.3vw,84px)] font-black uppercase leading-[0.82] tracking-normal text-black">
                {isRegister ? (
                  <>
                    Start<br />landing
                  </>
                ) : (
                  <>
                    Welcome<br />back
                  </>
                )}
              </h1>
              <p className="mt-8 border-l-4 border-black pl-5 text-[clamp(18px,1.1vw,21px)] font-medium leading-tight text-black">
                {isRegister
                  ? 'Create your workspace for resumes, job links, interview notes, analytics, and every next move.'
                  : 'Jump back into your pipeline with every application, resume version, and follow-up in sight.'}
              </p>
            </div>
          </aside>

          <div className="flex items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-[10%]">
            <div className="w-full max-w-[520px]">
              <h2 className="text-[clamp(28px,1.7vw,34px)] font-black uppercase leading-[0.95] text-[#211715]">
                {isRegister ? 'Create your account' : 'Log in to your account'}
              </h2>
              <p className="mt-3 text-[18px] font-semibold leading-7 text-[#64748b]">
                {isRegister ? 'Enter your details to create your dashboard.' : 'Enter your details to access your dashboard.'}
              </p>

              {authError ? (
                <div className="mt-6 border-[3px] border-[#dc2626] bg-[#fee2e2] px-4 py-3 text-sm font-black text-[#991b1b] shadow-[4px_4px_0_#000]">
                  {authError}
                </div>
              ) : null}

              {isRegister ? (
                <form
                  className="mt-7 flex w-full flex-col gap-4 text-left"
                  onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                  noValidate
                >
                  {googleConfigured ? (
                    <GoogleAuthControl
                      disabled={loading}
                      onCredential={completeGoogleLogin}
                      onError={setAuthError}
                    />
                  ) : (
                    <GoogleAuthButton
                      disabled={loading}
                      loading={false}
                      onClick={showGoogleConfigurationError}
                    />
                  )}
                  <AuthDivider />
                  <AuthField
                    label="Name"
                    type="text"
                    placeholder="Aarav Sharma"
                    autoComplete="name"
                    error={registerForm.formState.errors.name}
                    registration={registerForm.register('name')}
                  />
                  <AuthField
                    label="Email"
                    type="email"
                    placeholder="you@email.com"
                    autoComplete="email"
                    error={registerForm.formState.errors.email}
                    registration={registerForm.register('email')}
                  />
                  <AuthField
                    label="Password"
                    type="password"
                    placeholder="Password"
                    autoComplete="new-password"
                    error={registerForm.formState.errors.password}
                    registration={registerForm.register('password')}
                  />
                  <AuthButton loading={loading} label="Create account" loadingLabel="Creating account..." />
                </form>
              ) : (
                <form
                  className="mt-7 flex w-full flex-col gap-4 text-left"
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  noValidate
                >
                  {googleConfigured ? (
                    <GoogleAuthControl
                      disabled={loading}
                      onCredential={completeGoogleLogin}
                      onError={setAuthError}
                    />
                  ) : (
                    <GoogleAuthButton
                      disabled={loading}
                      loading={false}
                      onClick={showGoogleConfigurationError}
                    />
                  )}
                  <AuthDivider />
                  <AuthField
                    label="Email"
                    type="email"
                    placeholder="you@email.com"
                    autoComplete="email"
                    error={loginForm.formState.errors.email}
                    registration={loginForm.register('email')}
                  />
                  <AuthField
                    label="Password"
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    error={loginForm.formState.errors.password}
                    registration={loginForm.register('password')}
                  />
                  <AuthButton loading={loading} label="Login / sign in" loadingLabel="Signing in..." />
                </form>
              )}

              <p className="mt-7 text-center text-[15px] font-semibold text-[#64748b]">
                {isRegister ? 'Already have an account?' : 'New here?'}{' '}
                <button
                  type="button"
                  onClick={() => switchMode(isRegister ? 'login' : 'register')}
                  className="border-b-[3px] border-[#f97316] bg-transparent pb-0.5 font-black text-black focus:outline-none"
                >
                  {isRegister ? 'Sign in' : 'Create account'}
                </button>
              </p>
              <p className="mt-10 text-center text-[14px] font-semibold text-[#64748b]">
                By continuing, you agree to Landed's{' '}
                <span className="border-b-2 border-[#f97316] font-black text-black">Terms</span> and{' '}
                <span className="border-b-2 border-[#f97316] font-black text-black">Privacy Policy</span>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

const GoogleAuthControl = ({
  disabled,
  onCredential,
  onError
}: {
  disabled: boolean;
  onCredential: (accessToken: string) => Promise<void>;
  onError: (message: string | null) => void;
}) => {
  const [pending, setPending] = useState(false);
  const googleLogin = useGoogleLogin({
    scope: 'openid profile email',
    onSuccess: async (tokenResponse) => {
      try {
        await onCredential(tokenResponse.access_token);
      } finally {
        setPending(false);
      }
    },
    onError: () => {
      setPending(false);
      onError('Google sign-in was not completed. Please try again.');
    },
    onNonOAuthError: (error) => {
      setPending(false);
      if (error.type !== 'popup_closed') {
        onError('Could not open Google sign-in. Check your popup settings and try again.');
      }
    }
  });

  const startGoogleLogin = () => {
    onError(null);
    setPending(true);
    googleLogin();
  };

  return (
    <GoogleAuthButton
      disabled={disabled || pending}
      loading={pending}
      onClick={startGoogleLogin}
    />
  );
};

const GoogleAuthButton = ({
  disabled,
  loading,
  onClick
}: {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}) => (
  <button
    className="inline-flex h-[52px] w-full items-center justify-center gap-3 border-[3px] border-black bg-white px-6 text-[14px] font-black uppercase text-black shadow-[5px_5px_0_#000] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
    type="button"
    onClick={onClick}
    disabled={disabled}
  >
    <GoogleMark />
    {loading ? 'Connecting to Google...' : 'Login with Google'}
  </button>
);

const AuthDivider = () => (
  <div className="flex items-center gap-3 py-0.5 text-[11px] font-black uppercase text-[#64748b]">
    <span className="h-0.5 flex-1 bg-black" aria-hidden="true" />
    <span>Or with email</span>
    <span className="h-0.5 flex-1 bg-black" aria-hidden="true" />
  </div>
);

const GoogleMark = () => (
  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.24c1.9-1.75 2.98-4.33 2.98-7.39Z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.7 0 4.98-.9 6.63-2.38l-3.24-2.53c-.9.6-2.05.96-3.39.96-2.6 0-4.81-1.76-5.6-4.13H3.06v2.61A10 10 0 0 0 12 22Z"
    />
    <path
      fill="#FBBC05"
      d="M6.4 13.92a6.02 6.02 0 0 1 0-3.84V7.47H3.06a10 10 0 0 0 0 9.06l3.34-2.61Z"
    />
    <path
      fill="#EA4335"
      d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.94 5.47l3.34 2.61c.79-2.37 3-4.13 5.6-4.13Z"
    />
  </svg>
);

const AuthButton = ({
  label,
  loading,
  loadingLabel
}: {
  label: string;
  loading: boolean;
  loadingLabel: string;
}) => (
  <button
    className="mt-1 inline-flex h-[52px] items-center justify-center gap-2.5 border-[3px] border-black bg-black px-6 py-2.5 text-[14px] font-black uppercase text-white shadow-[5px_5px_0_#f97316] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
    type="submit"
    disabled={loading}
  >
    {loading ? loadingLabel : label}
    {!loading ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
  </button>
);
