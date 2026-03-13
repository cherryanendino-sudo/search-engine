import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      titleRef.current,
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power4.out' }
    ).fromTo(
      formRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
      '-=0.5'
    );
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const result = login(username, password);
      if (!result.success) {
        setError(result.error ?? 'Login failed');
        gsap.fromTo(
          formRef.current,
          { x: -8 },
          { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' }
        );
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="noise-bg min-h-screen flex items-center justify-center relative">
      <div className="grid-lines" />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-8 z-50 w-9 h-9 border flex items-center justify-center transition-all"
        style={{ borderColor: 'var(--border-primary)' }}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      <div className="w-full max-w-md px-8">
        {/* Logo / Title */}
        <div className="text-center mb-12">
          <h1
            ref={titleRef}
            className="text-[10vw] md:text-6xl font-light tracking-tighter leading-none mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            UNIVERS
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-px" style={{ background: 'var(--border-secondary)' }} />
            <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>
              STUDENT INFORMATION SYSTEM
            </span>
            <div className="w-12 h-px" style={{ background: 'var(--border-secondary)' }} />
          </div>
        </div>

        {/* Login Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="border p-8" style={{ borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
              <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>
                Sign In
              </span>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mono-tag block mb-2" style={{ color: 'var(--text-quaternary)' }}>
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-4 py-3 text-sm font-light outline-none transition-colors"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label className="mono-tag block mb-2" style={{ color: 'var(--text-quaternary)' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 text-sm font-light outline-none transition-colors"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f87171]" />
                  <span className="mono-tag text-[#f87171]">{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="mt-8 w-full py-3 border mono-tag transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed"
              style={{
                borderColor: 'var(--text-primary)',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                if (!(e.currentTarget as HTMLButtonElement).disabled) {
                  e.currentTarget.style.background = 'var(--text-primary)';
                  e.currentTarget.style.color = 'var(--bg-primary)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>

          {/* Demo credentials hint */}
          <div className="border p-5" style={{ borderColor: 'var(--border-primary)' }}>
            <span className="mono-tag block mb-3" style={{ color: 'var(--text-quaternary)' }}>
              Demo Credentials
            </span>
            <div className="space-y-2">
              {[
                { user: 'admin', pass: 'admin123', role: 'All Roles' },
                { user: 'registrar', pass: 'registrar123', role: 'Registrar' },
                { user: 'adviser', pass: 'adviser123', role: 'Adviser + Teacher' },
                { user: 'teacher', pass: 'teacher123', role: 'Subject Teacher' },
                { user: 'finance', pass: 'finance123', role: 'Finance' },
                { user: 'registrar_adviser', pass: 'regadv123', role: 'Registrar + Adviser' },
              ].map((cred) => (
                <div key={cred.user} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                      {cred.user} / {cred.pass}
                    </span>
                  </div>
                  <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>
                    {cred.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-12 text-center">
          <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>
            &copy; {new Date().getFullYear()} UNIVERS -- K-12 STUDENT INFORMATION SYSTEM
          </span>
        </div>
      </div>
    </div>
  );
}
