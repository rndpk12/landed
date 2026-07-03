import { zodResolver } from '@hookform/resolvers/zod';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, type FieldError, type UseFormRegisterReturn } from 'react-hook-form';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../services/authApi';

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

const partners = ['LinkedIn', 'Indeed', 'Workday', 'Greenhouse', 'Instahyre', 'Lever', 'Ashby', 'Naukri'];

const AuthField = ({ label, type, placeholder, autoComplete, error, registration }: FieldProps) => {
  const inputId = 'auth-' + registration.name;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[12px] font-black uppercase text-black" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className={`h-11 w-full border-[3px] bg-[#fffaf1] px-4 text-sm font-black text-black outline-none transition placeholder:text-[#9a9489] focus:bg-white focus:shadow-[4px_4px_0_#000] ${
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
  const [googleSignInAvailable, setGoogleSignInAvailable] = useState(false);

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

  useEffect(() => {
    let isMounted = true;

    authApi.isGoogleSignInConfigured().then((isConfigured) => {
      if (isMounted) {
        setGoogleSignInAvailable(isConfigured);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

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

  const onGoogleSignIn = async (credentialResponse: CredentialResponse) => {
    setAuthError(null);
    if (!credentialResponse.credential) {
      setAuthError('Google did not return a sign-in credential.');
      return;
    }

    try {
      await signInWithGoogle(credentialResponse.credential);
      navigate(from, { replace: true });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Could not sign in with Google. Please try again.');
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

  const AuthDivider = () => (
    <div className="flex items-center gap-3 text-center text-[11px] font-black uppercase text-[#6f685f]">
      <span className="h-[3px] flex-1 bg-black" />
      or
      <span className="h-[3px] flex-1 bg-black" />
    </div>
  );

  const GoogleSignInButton = () => (
    <div className={loading ? 'pointer-events-none opacity-70' : undefined}>
      <GoogleLogin
        onSuccess={onGoogleSignIn}
        onError={() => setAuthError('Google login failed. Please try again.')}
        shape="rectangular"
        size="large"
        text="signin_with"
        theme="outline"
        width="360"
      />
    </div>
  );

  return (
    <main className="landed-brutal brutal-grid min-h-dvh bg-[#fbf7ef] p-2 font-sans text-black sm:p-3">
      <section className="grid min-h-[calc(100dvh-16px)] overflow-hidden border-[4px] border-black bg-[#fffaf1] shadow-[8px_8px_0_#000] sm:min-h-[calc(100dvh-24px)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex min-h-0 flex-col">
          <div className="flex h-[64px] shrink-0 items-center justify-between border-b-[4px] border-black px-5 sm:h-[68px] sm:px-8">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-transparent text-left"
            >
              <span className="grid h-10 w-10 place-items-center border-[3px] border-black bg-[#f97316] font-black text-white shadow-[4px_4px_0_#000]">
                L
              </span>
              <span className="text-[22px] font-black italic">LANDED</span>
            </button>
            <button
              type="button"
              onClick={() => switchMode(isRegister ? 'login' : 'register')}
              className="border-[3px] border-black bg-white px-4 py-2 text-[12px] font-black uppercase shadow-[4px_4px_0_#000] transition hover:-translate-y-0.5"
            >
              {isRegister ? 'Log in' : 'Join free'}
            </button>
          </div>

          <div className="flex flex-1 flex-col justify-center px-5 py-5 sm:px-10 sm:py-6 lg:px-[12%]">
            <div className="w-full max-w-[430px]">
              <div className="mb-4 inline-flex items-center gap-2 border-2 border-[#f3d8b9] bg-[#fff6e8] px-4 py-2 text-[12px] font-black uppercase text-[#7a3515] shadow-[3px_3px_0_rgba(0,0,0,0.12)]">
                <Sparkles className="h-4 w-4 text-[#f97316]" />
                {isRegister ? 'Start landing today' : 'Welcome back'}
              </div>
              <h1 className="text-[clamp(36px,5.2vw,60px)] font-black uppercase leading-[0.95]">
                {isRegister ? 'Create your account.' : 'Sign in to Landed.'}
              </h1>
              <p className="mt-4 text-[15px] font-bold leading-6 text-[#555]">
                {isRegister
                  ? 'Build one workspace for resumes, job links, interview notes, analytics, and every next move.'
                  : 'Jump back into your pipeline with every application, resume version, and follow-up in sight.'}
              </p>

              {authError ? (
                <div className="mt-5 border-[3px] border-[#dc2626] bg-[#fee2e2] px-4 py-3 text-sm font-black text-[#991b1b] shadow-[4px_4px_0_#000]">
                  {authError}
                </div>
              ) : null}

              {isRegister ? (
                <form
                  className="mt-5 flex w-full flex-col gap-3 text-left"
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
                  {googleSignInAvailable ? (
                    <>
                      <AuthDivider />
                      <GoogleSignInButton />
                    </>
                  ) : null}
                </form>
              ) : (
                <form
                  className="mt-5 flex w-full flex-col gap-3 text-left"
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
                  {googleSignInAvailable ? (
                    <>
                      <AuthDivider />
                      <GoogleSignInButton />
                    </>
                  ) : null}
                </form>
              )}

              <p className="mt-4 text-sm font-bold text-[#555]">
                {isRegister ? 'Already have an account?' : 'New here?'}{' '}
                <button
                  type="button"
                  onClick={() => switchMode(isRegister ? 'login' : 'register')}
                  className="border-b-[3px] border-[#f97316] bg-transparent pb-0.5 font-black text-black focus:outline-none"
                >
                  {isRegister ? 'Sign in' : 'Create account'}
                </button>
              </p>
            </div>
          </div>

          <div className="shrink-0 border-t-[4px] border-black px-5 py-4 sm:px-8">
            <p className="text-[11px] font-black uppercase text-[#555]">Works on top job platforms like</p>
            <div className="relative mt-4 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
              <div className="flex w-max animate-[platform-marquee_22s_linear_infinite] items-center gap-10 text-lg font-black text-[#b9b3a8]">
                {[...partners, ...partners].map((partner, index) => (
                  <span key={`${partner}-${index}`} className="shrink-0">
                    {partner}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative hidden min-h-0 overflow-hidden border-l-[4px] border-black bg-[#09090b] text-white lg:block">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:44px_44px]" />
          <nav className="relative z-20 grid h-[68px] grid-cols-5 border-b-[4px] border-black bg-[#f97316] text-[12px] font-black uppercase text-white">
            {['Roles', 'Resumes', 'Stages', 'Notes', 'Analytics'].map((item) => (
              <span key={item} className="flex items-center justify-center border-r-[3px] border-black last:border-r-0">
                {item}
              </span>
            ))}
          </nav>

          <div className="relative z-10 mx-auto mt-10 w-[74%] rotate-[-2deg] border-[4px] border-black bg-[#fffaf1] p-6 text-black shadow-[10px_10px_0_#000] xl:mt-14">
            <div className="mb-5 flex items-center gap-2 border-b-[3px] border-black pb-4">
              <span className="h-3 w-3 border-2 border-black bg-[#ef4444]" />
              <span className="h-3 w-3 border-2 border-black bg-[#facc15]" />
              <span className="h-3 w-3 border-2 border-black bg-[#22c55e]" />
              <span className="ml-3 flex-1 border-2 border-black bg-white px-3 py-1 text-center text-[11px] font-black text-[#555]">
                app.landed.dev/dashboard
              </span>
            </div>
            <h2 className="text-[42px] font-black uppercase leading-none">Pipeline clarity</h2>
            <p className="mt-4 text-[15px] font-bold leading-7 text-[#555]">
              Applications, versions, stages, and follow-ups stay visible as the search gets busy.
            </p>
            <div className="mt-8 grid gap-3">
              {['Resume vault synced', 'Interview loop active', 'Follow-up due Friday'].map((item) => (
                <div className="flex items-center gap-3 border-[3px] border-black bg-white p-3" key={item}>
                  <span className="grid h-7 w-7 place-items-center border-2 border-black bg-[#96d35f]">
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="text-[13px] font-black uppercase">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-8 left-8 z-20 border-[4px] border-black bg-[#5dd6e4] px-5 py-4 text-black shadow-[7px_7px_0_#000]">
            <p className="text-[13px] font-black uppercase">3x more callbacks tracked</p>
          </div>
          <div className="absolute bottom-8 right-8 z-20 border-[4px] border-black bg-[#f9d44a] px-5 py-4 text-black shadow-[7px_7px_0_#000]">
            <p className="text-[13px] font-black uppercase">No spreadsheet drift</p>
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
    className="mt-1 inline-flex h-[48px] items-center justify-center gap-3 border-[3px] border-black bg-black px-7 py-3 text-sm font-black uppercase text-white shadow-[6px_6px_0_#f97316] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
    type="submit"
    disabled={loading}
  >
    {loading ? loadingLabel : label}
    {!loading ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
  </button>
);
