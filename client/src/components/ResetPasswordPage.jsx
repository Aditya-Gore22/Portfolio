import React, { useState, useEffect } from 'react';
import { apiUrl } from '../utils/api';
import { FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaSpinner, FaCheckCircle, FaTimesCircle, FaKey } from 'react-icons/fa';
import './ResetPasswordPage.css';

const ResetPasswordPage = ({ token, onNavigate }) => {
  const [phase, setPhase] = useState('verifying'); // verifying | ready | success | error | expired
  const [username, setUsername] = useState('');
  const [minutesLeft, setMinutesLeft] = useState(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // On mount: verify the token is valid
  useEffect(() => {
    if (!token) {
      setPhase('expired');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(apiUrl(`/api/auth/verify-reset-token/${token}`));
        const json = await res.json();
        if (json.success) {
          setUsername(json.username || 'Admin');
          setMinutesLeft(json.expiresInMinutes);
          setPhase('ready');
        } else {
          setErrorMsg(json.message || 'This reset link is invalid or has expired.');
          setPhase('expired');
        }
      } catch {
        setErrorMsg('Could not connect to the server. Make sure your backend is running.');
        setPhase('expired');
      }
    };

    verify();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(apiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setPhase('success');
        // Clear the hash after a short delay so the URL is clean
        setTimeout(() => { window.location.hash = ''; }, 2000);
      } else {
        setErrorMsg(json.message || 'Reset failed. The link may have expired.');
        setPhase('expired');
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Password strength meter
  const getStrength = (pwd) => {
    if (pwd.length === 0) return { score: 0, label: '', color: 'transparent' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const levels = [
      { score: 0, label: '', color: 'transparent' },
      { score: 1, label: 'Very Weak', color: '#ef4444' },
      { score: 2, label: 'Weak', color: '#f97316' },
      { score: 3, label: 'Fair', color: '#eab308' },
      { score: 4, label: 'Strong', color: '#22c55e' },
      { score: 5, label: 'Very Strong', color: '#0ea5e9' }
    ];
    return levels[Math.min(score, 5)];
  };

  const strength = getStrength(newPassword);

  return (
    <div className="rp-root">
      {/* Ambient glow */}
      <div className="rp-glow rp-glow-cyan" />
      <div className="rp-glow rp-glow-purple" />

      <div className="rp-card-wrap">
        <div className="rp-card">

          {/* ── Brand Header ── */}
          <div className="rp-brand">
            <div className="rp-brand-icon">
              <FaShieldAlt />
            </div>
            <div>
              <div className="rp-brand-title">PORTFOLIO ADMIN</div>
              <div className="rp-brand-sub">Security Console</div>
            </div>
          </div>

          {/* ── PHASE: VERIFYING ── */}
          {phase === 'verifying' && (
            <div className="rp-state-block">
              <FaSpinner className="rp-spin-icon" />
              <p className="rp-state-text">Verifying reset link...</p>
            </div>
          )}

          {/* ── PHASE: READY (show form) ── */}
          {phase === 'ready' && (
            <>
              <div className="rp-heading-block">
                <FaKey className="rp-key-icon" />
                <div>
                  <h1 className="rp-title">Reset Your Password</h1>
                  <p className="rp-subtitle">
                    Hi <span className="rp-username">{username}</span>! Choose a strong new password.
                    {minutesLeft !== null && (
                      <span className="rp-timer"> · Link expires in <strong>{minutesLeft} min</strong></span>
                    )}
                  </p>
                </div>
              </div>

              <form className="rp-form" onSubmit={handleSubmit} autoComplete="off">

                {/* New Password */}
                <div className="rp-field">
                  <label className="rp-label">
                    <FaLock className="rp-label-icon" />
                    New Password
                  </label>
                  <div className="rp-input-wrap">
                    <input
                      type={showNew ? 'text' : 'password'}
                      className="rp-input"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="rp-eye-btn"
                      onClick={() => setShowNew(v => !v)}
                      tabIndex="-1"
                      aria-label={showNew ? 'Hide password' : 'Show password'}
                    >
                      {showNew ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {newPassword.length > 0 && (
                    <div className="rp-strength">
                      <div className="rp-strength-bar">
                        {[1,2,3,4,5].map(i => (
                          <div
                            key={i}
                            className="rp-strength-seg"
                            style={{ background: i <= strength.score ? strength.color : '#1e293b' }}
                          />
                        ))}
                      </div>
                      <span className="rp-strength-label" style={{ color: strength.color }}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="rp-field">
                  <label className="rp-label">
                    <FaLock className="rp-label-icon" />
                    Confirm Password
                  </label>
                  <div className="rp-input-wrap">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      className={`rp-input ${confirmPassword && newPassword !== confirmPassword ? 'rp-input-error' : confirmPassword && newPassword === confirmPassword ? 'rp-input-ok' : ''}`}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="rp-eye-btn"
                      onClick={() => setShowConfirm(v => !v)}
                      tabIndex="-1"
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="rp-mismatch">Passwords do not match</p>
                  )}
                  {confirmPassword && newPassword === confirmPassword && (
                    <p className="rp-match"><FaCheckCircle /> Passwords match</p>
                  )}
                </div>

                {/* Error message */}
                {errorMsg && (
                  <div className="rp-error-banner">
                    <FaTimesCircle />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="rp-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <><FaSpinner className="rp-spin-icon-sm" /> Resetting Password...</>
                  ) : (
                    <>🔑 Set New Password</>
                  )}
                </button>
              </form>

              <button
                type="button"
                className="rp-back-link"
                onClick={() => onNavigate && onNavigate('admin')}
              >
                ← Back to Admin Login
              </button>
            </>
          )}

          {/* ── PHASE: SUCCESS ── */}
          {phase === 'success' && (
            <div className="rp-state-block rp-success-block">
              <div className="rp-success-icon-wrap">
                <FaCheckCircle className="rp-success-icon" />
              </div>
              <h2 className="rp-success-title">Password Reset!</h2>
              <p className="rp-success-msg">
                Your admin password has been updated successfully.<br />
                You can now log in with your new password.
              </p>
              <button
                type="button"
                className="rp-submit-btn rp-go-login-btn"
                onClick={() => onNavigate && onNavigate('admin')}
              >
                → Go to Admin Login
              </button>
            </div>
          )}

          {/* ── PHASE: EXPIRED / ERROR ── */}
          {phase === 'expired' && (
            <div className="rp-state-block rp-expired-block">
              <div className="rp-expired-icon-wrap">
                <FaTimesCircle className="rp-expired-icon" />
              </div>
              <h2 className="rp-expired-title">Link Invalid or Expired</h2>
              <p className="rp-expired-msg">
                {errorMsg || 'This password reset link has expired or already been used. Reset links are valid for 15 minutes.'}
              </p>
              <button
                type="button"
                className="rp-submit-btn"
                onClick={() => onNavigate && onNavigate('admin')}
              >
                ← Go to Admin Login &amp; Request New Link
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
