import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

export default function Login() {
  const { login } = useAppStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    // Trigger entrance animations
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success) {
        login(data.user);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Connection failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .login-page {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: hsl(153, 50%, 3%);
        }

        /* ── Mesh gradient background ── */
        .login-bg-mesh {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 50% at 20% 80%, hsla(153, 60%, 25%, 0.15), transparent),
            radial-gradient(ellipse 60% 60% at 80% 20%, hsla(170, 50%, 20%, 0.12), transparent),
            radial-gradient(ellipse 50% 80% at 50% 50%, hsla(140, 40%, 15%, 0.08), transparent);
        }

        /* ── Grid lines ── */
        .login-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(hsla(153, 60%, 45%, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, hsla(153, 60%, 45%, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 70%);
        }

        /* ── Floating orbs ── */
        .login-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0;
          animation: orbFloat 20s ease-in-out infinite, orbFadeIn 1.5s ease-out forwards;
        }
        .login-orb-1 {
          width: 400px;
          height: 400px;
          background: hsla(153, 70%, 40%, 0.12);
          top: -10%;
          right: -5%;
          animation-delay: 0s;
        }
        .login-orb-2 {
          width: 300px;
          height: 300px;
          background: hsla(170, 60%, 35%, 0.10);
          bottom: -5%;
          left: -5%;
          animation-delay: -7s;
        }
        .login-orb-3 {
          width: 200px;
          height: 200px;
          background: hsla(140, 50%, 50%, 0.08);
          top: 40%;
          left: 60%;
          animation-delay: -14s;
        }

        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -40px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.95); }
          75% { transform: translate(15px, 30px) scale(1.05); }
        }
        @keyframes orbFadeIn {
          to { opacity: 1; }
        }

        /* ── Particles ── */
        .login-particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: hsla(153, 60%, 50%, 0.4);
          border-radius: 50%;
          animation: particleRise linear infinite;
        }
        @keyframes particleRise {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) scale(0); opacity: 0; }
        }

        /* ── Card ── */
        .login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          margin: 0 1rem;
          background: hsla(153, 40%, 6%, 0.65);
          backdrop-filter: blur(40px) saturate(1.5);
          -webkit-backdrop-filter: blur(40px) saturate(1.5);
          border: 1px solid hsla(153, 40%, 30%, 0.15);
          border-radius: 24px;
          padding: 48px 40px 40px;
          box-shadow:
            0 0 0 1px hsla(153, 40%, 30%, 0.05),
            0 20px 60px -15px hsla(153, 50%, 10%, 0.5),
            0 0 100px -20px hsla(153, 60%, 40%, 0.08);
          transform: translateY(40px) scale(0.95);
          opacity: 0;
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .login-card.mounted {
          transform: translateY(0) scale(1);
          opacity: 1;
        }

        /* ── Card glow border on hover ── */
        .login-card::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 25px;
          background: linear-gradient(
            135deg,
            hsla(153, 60%, 45%, 0.2),
            transparent 40%,
            transparent 60%,
            hsla(170, 50%, 45%, 0.15)
          );
          z-index: -1;
          opacity: 0;
          transition: opacity 0.6s ease;
        }
        .login-card:hover::before {
          opacity: 1;
        }

        /* ── Brand logo ── */
        .login-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 36px;
          transform: translateY(20px);
          opacity: 0;
          transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
        }
        .login-brand.mounted {
          transform: translateY(0);
          opacity: 1;
        }

        .login-logo-wrap {
          position: relative;
          width: 64px;
          height: 64px;
          margin-bottom: 20px;
        }
        .login-logo-ring {
          position: absolute;
          inset: -4px;
          border-radius: 20px;
          border: 2px solid transparent;
          background: linear-gradient(135deg, hsla(153, 60%, 45%, 0.3), hsla(170, 50%, 45%, 0.1)) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: logoRingSpin 8s linear infinite;
        }
        @keyframes logoRingSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .login-logo-bg {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: linear-gradient(135deg, hsla(153, 60%, 40%, 0.2), hsla(170, 50%, 35%, 0.1));
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-logo-bg svg {
          color: hsl(153, 60%, 50%);
        }

        .login-title {
          font-size: 1.625rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: hsl(153, 20%, 95%);
          margin-bottom: 6px;
        }
        .login-subtitle {
          font-size: 0.875rem;
          color: hsl(153, 15%, 50%);
          font-weight: 400;
        }

        /* ── Form fields ── */
        .login-field {
          margin-bottom: 20px;
          transform: translateY(20px);
          opacity: 0;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .login-field.mounted {
          transform: translateY(0);
          opacity: 1;
        }
        .login-field:nth-child(1) { transition-delay: 0.35s; }
        .login-field:nth-child(2) { transition-delay: 0.45s; }

        .login-label {
          display: block;
          font-size: 0.8125rem;
          font-weight: 500;
          color: hsl(153, 15%, 60%);
          margin-bottom: 8px;
          letter-spacing: 0.02em;
          transition: color 0.3s ease;
        }
        .login-label.focused {
          color: hsl(153, 60%, 55%);
        }

        .login-input-wrap {
          position: relative;
        }
        .login-input-wrap .login-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: hsl(153, 15%, 35%);
          transition: color 0.3s ease;
          pointer-events: none;
          z-index: 2;
        }
        .login-input-wrap.focused .login-input-icon {
          color: hsl(153, 60%, 50%);
        }

        .login-input {
          width: 100%;
          height: 48px;
          padding: 0 16px 0 44px;
          border-radius: 14px;
          border: 1.5px solid hsla(153, 30%, 25%, 0.3);
          background: hsla(153, 40%, 8%, 0.5);
          color: hsl(153, 20%, 92%);
          font-size: 0.9375rem;
          font-family: 'Inter', system-ui, sans-serif;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          outline: none;
          box-sizing: border-box;
        }
        .login-input::placeholder {
          color: hsl(153, 15%, 32%);
        }
        .login-input:hover {
          border-color: hsla(153, 40%, 35%, 0.4);
          background: hsla(153, 40%, 8%, 0.7);
        }
        .login-input:focus {
          border-color: hsla(153, 60%, 45%, 0.5);
          background: hsla(153, 40%, 8%, 0.8);
          box-shadow:
            0 0 0 4px hsla(153, 60%, 45%, 0.08),
            0 0 20px -5px hsla(153, 60%, 45%, 0.15);
        }

        /* ── Animated focus glow line ── */
        .login-input-glow {
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 80%;
          height: 2px;
          background: linear-gradient(90deg, transparent, hsl(153, 60%, 45%), transparent);
          border-radius: 2px;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .login-input-wrap.focused .login-input-glow {
          transform: translateX(-50%) scaleX(1);
        }

        /* ── Error message ── */
        .login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 12px;
          background: hsla(0, 60%, 20%, 0.2);
          border: 1px solid hsla(0, 50%, 40%, 0.2);
          color: hsl(0, 80%, 68%);
          font-size: 0.8125rem;
          margin-bottom: 20px;
          animation: errorShake 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(2px); }
        }

        /* ── Submit button ── */
        .login-btn-wrap {
          transform: translateY(20px);
          opacity: 0;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.55s;
        }
        .login-btn-wrap.mounted {
          transform: translateY(0);
          opacity: 1;
        }
        .login-btn {
          position: relative;
          width: 100%;
          height: 50px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, hsl(153, 60%, 38%), hsl(160, 55%, 32%));
          color: hsl(0, 0%, 100%);
          font-size: 0.9375rem;
          font-weight: 600;
          font-family: 'Inter', system-ui, sans-serif;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          letter-spacing: 0.01em;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 8px 30px -8px hsla(153, 60%, 40%, 0.4),
            0 0 0 1px hsla(153, 60%, 45%, 0.2);
          background: linear-gradient(135deg, hsl(153, 65%, 42%), hsl(160, 60%, 36%));
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ── Button shimmer ── */
        .login-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            transparent 40%,
            hsla(0, 0%, 100%, 0.12) 45%,
            hsla(0, 0%, 100%, 0.15) 50%,
            hsla(0, 0%, 100%, 0.12) 55%,
            transparent 60%
          );
          transform: translateX(-100%);
          animation: btnShimmer 3s ease-in-out infinite;
        }
        @keyframes btnShimmer {
          0% { transform: translateX(-100%); }
          60%, 100% { transform: translateX(200%); }
        }

        /* ── Loading spinner ── */
        .login-spinner {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .login-spinner-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: white;
          animation: spinnerPulse 1.2s ease-in-out infinite;
        }
        .login-spinner-dot:nth-child(2) { animation-delay: 0.15s; }
        .login-spinner-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes spinnerPulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }

        /* ── Footer ── */
        .login-footer {
          text-align: center;
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid hsla(153, 30%, 25%, 0.15);
          transform: translateY(20px);
          opacity: 0;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.65s;
        }
        .login-footer.mounted {
          transform: translateY(0);
          opacity: 1;
        }
        .login-footer-text {
          font-size: 0.75rem;
          color: hsl(153, 15%, 35%);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .login-footer-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: hsl(153, 60%, 45%);
          animation: footerDotPulse 2s ease-in-out infinite;
        }
        @keyframes footerDotPulse {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        /* ── Responsive ── */
        @media (max-width: 480px) {
          .login-card {
            padding: 36px 24px 28px;
            border-radius: 20px;
            margin: 0 0.75rem;
          }
          .login-title { font-size: 1.375rem; }
        }
      `}</style>

      <div className="login-page">
        {/* Background layers */}
        <div className="login-bg-mesh" />
        <div className="login-grid" />

        {/* Floating orbs */}
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />

        {/* Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="login-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${60 + Math.random() * 40}%`,
              animationDuration: `${6 + Math.random() * 10}s`,
              animationDelay: `${Math.random() * 8}s`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
            }}
          />
        ))}

        {/* Login card */}
        <div className={`login-card ${mounted ? 'mounted' : ''}`}>
          {/* Brand */}
          <div className={`login-brand ${mounted ? 'mounted' : ''}`}>
            <div className="login-logo-wrap">
              <div className="login-logo-ring" />
              <div className="login-logo-bg">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5Z" />
                  <path d="m2 17 10 5 10-5" />
                  <path d="m2 12 10 5 10-5" />
                </svg>
              </div>
            </div>
            <h1 className="login-title">Welcome back</h1>
            <p className="login-subtitle">Sign in to your Omnitrack account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            {/* Username field */}
            <div className={`login-field ${mounted ? 'mounted' : ''}`}>
              <label
                htmlFor="login-username"
                className={`login-label ${focusedField === 'username' ? 'focused' : ''}`}
              >
                Username
              </label>
              <div className={`login-input-wrap ${focusedField === 'username' ? 'focused' : ''}`}>
                <svg
                  className="login-input-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
                <input
                  id="login-username"
                  className="login-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />
                <div className="login-input-glow" />
              </div>
            </div>

            {/* Password field */}
            <div className={`login-field ${mounted ? 'mounted' : ''}`}>
              <label
                htmlFor="login-password"
                className={`login-label ${focusedField === 'password' ? 'focused' : ''}`}
              >
                Password
              </label>
              <div className={`login-input-wrap ${focusedField === 'password' ? 'focused' : ''}`}>
                <svg
                  className="login-input-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="login-password"
                  className="login-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <div className="login-input-glow" />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="login-error">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit button */}
            <div className={`login-btn-wrap ${mounted ? 'mounted' : ''}`}>
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? (
                  <span className="login-spinner">
                    <span className="login-spinner-dot" />
                    <span className="login-spinner-dot" />
                    <span className="login-spinner-dot" />
                    <span style={{ marginLeft: 4 }}>Authenticating</span>
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className={`login-footer ${mounted ? 'mounted' : ''}`}>
            <p className="login-footer-text">
              <span className="login-footer-dot" />
              Omnitrack Hotel Management System
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
