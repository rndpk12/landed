import { zodResolver } from '@hookform/resolvers/zod';
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
    <div className="flex flex-col gap-2">
      <label className="text-[14px] font-black uppercase text-black" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className={`h-[56px] w-full border-[3px] bg-[#fffaf1] px-5 text-[16px] font-black text-black outline-none transition placeholder:text-[#9a9489] focus:bg-white focus:shadow-[4px_4px_0_#000] ${
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
  const { login, register: createAccount, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard';

  const [mode, setMode] = useState<AuthMode>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );
  const [authError, setAuthError] = useState<string | null>(null);

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

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

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
        <header className="flex h-[88px] shrink-0 items-center justify-between border-b-[5px] border-black bg-[#fffaf1] px-6 sm:px-10 lg:px-[8%]">
          <div className="flex items-center gap-10">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-transparent text-left"
            >
              <span className="grid h-11 w-11 place-items-center rounded-md border-[4px] border-black bg-[#f97316] text-lg font-black text-white shadow-[4px_4px_0_#000]">
                L
              </span>
              <span className="text-[28px] font-black italic">LANDED</span>
            </button>
            <nav className="hidden items-center gap-8 text-[18px] font-black uppercase md:flex">
              <span>Features</span>
              <span>Pricing</span>
              <span>FAQ</span>
            </nav>
          </div>
            <button
              type="button"
              onClick={() => switchMode(isRegister ? 'login' : 'register')}
              className="border-[4px] border-black bg-[#f97316] px-6 py-3 text-[16px] font-black uppercase text-white shadow-[5px_5px_0_#000] transition hover:-translate-y-0.5"
            >
              {isRegister ? 'Log in' : 'Create account'}
            </button>
        </header>

        <div className="grid flex-1 lg:grid-cols-2">
          <aside className="flex min-h-[360px] flex-col justify-center border-b-[5px] border-black bg-[#f97316] px-8 py-12 lg:min-h-0 lg:border-b-0 lg:border-r-[5px] lg:px-[10%]">
            <div className="max-w-[760px]">
              <h1 className="text-[clamp(76px,7.2vw,132px)] font-black uppercase leading-[0.82] tracking-normal text-black">
                {isRegister ? 'Start landing' : 'Welcome back'}
              </h1>
              <p className="mt-10 border-l-[5px] border-black pl-6 text-[clamp(24px,1.65vw,30px)] font-medium leading-tight text-black">
                {isRegister
                  ? 'Create your workspace for resumes, job links, interview notes, analytics, and every next move.'
                  : 'Jump back into your pipeline with every application, resume version, and follow-up in sight.'}
              </p>
            </div>
          </aside>

          <div className="flex items-center justify-center bg-white px-6 py-12 sm:px-10 lg:px-[10%]">
            <div className="w-full max-w-[620px]">
              <h2 className="text-[clamp(36px,2.55vw,50px)] font-black uppercase leading-[0.95] text-[#211715]">
                {isRegister ? 'Create your account' : 'Log in to your account'}
              </h2>
              <p className="mt-5 text-[22px] font-semibold leading-8 text-[#64748b]">
                {isRegister ? 'Enter your details to create your dashboard.' : 'Enter your details to access your dashboard.'}
              </p>

              {authError ? (
                <div className="mt-8 border-[4px] border-[#dc2626] bg-[#fee2e2] px-5 py-4 text-base font-black text-[#991b1b] shadow-[5px_5px_0_#000]">
                  {authError}
                </div>
              ) : null}

              {isRegister ? (
                <form
                  className="mt-9 flex w-full flex-col gap-5 text-left"
                  onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                  noValidate
                >
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
                  className="mt-9 flex w-full flex-col gap-5 text-left"
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  noValidate
                >
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

              <p className="mt-9 text-center text-[18px] font-semibold text-[#64748b]">
                {isRegister ? 'Already have an account?' : 'New here?'}{' '}
                <button
                  type="button"
                  onClick={() => switchMode(isRegister ? 'login' : 'register')}
                  className="border-b-[4px] border-[#f97316] bg-transparent pb-0.5 font-black text-black focus:outline-none"
                >
                  {isRegister ? 'Sign in' : 'Create account'}
                </button>
              </p>
              <p className="mt-14 text-center text-[16px] font-semibold text-[#64748b]">
                By continuing, you agree to Landed's{' '}
                <span className="border-b-[3px] border-[#f97316] font-black text-black">Terms</span> and{' '}
                <span className="border-b-[3px] border-[#f97316] font-black text-black">Privacy Policy</span>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

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
    className="mt-1 inline-flex h-[62px] items-center justify-center gap-3 border-[3px] border-black bg-black px-8 py-3 text-[16px] font-black uppercase text-white shadow-[6px_6px_0_#f97316] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
    type="submit"
    disabled={loading}
  >
    {loading ? loadingLabel : label}
    {!loading ? <ArrowRight className="h-5 w-5" aria-hidden="true" /> : null}
  </button>
);
