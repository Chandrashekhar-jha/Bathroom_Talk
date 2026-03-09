'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';
import { ArrowLeft, Hash, Sparkles } from 'lucide-react';
import { getSessionId, saveStallSession } from '@/lib/session';

const PREVIEW_NAMES = ['ShadowFox', 'MidnightEcho', 'HiddenTiger', 'GhostNote', 'SilentWolf', 'NeonHaze'];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');

  :root {
    --bg: #0d0d14;
    --bg-card: #1c1c28;
    --violet: #7c5cfc;
    --violet-glow: rgba(124,92,252,0.4);
    --cyan: #22d3ee;
    --text-1: #ffffff;
    --text-2: #e0e0e8;
    --border: rgba(255,255,255,0.4);
    --border-hi: rgba(255,255,255,0.6);
    --font-head: 'Space Grotesk', sans-serif;
    --font-body: 'Inter', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }

  .j-page {
    min-height: 100dvh;
    background: var(--bg);
    color: var(--text-1);
    font-family: var(--font-body);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    position: relative;
    overflow: hidden;
  }

  /* Atmosphere - Brighter Homepage Spot */
  .j-glow {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 50% at 50% 38%, rgba(124,92,252,0.25) 0%, transparent 70%);
    pointer-events: none; z-index: 1;
  }
  .j-glow-2 {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 40% 35% at 50% 55%, rgba(34,211,238,0.18) 0%, transparent 65%);
    pointer-events: none; z-index: 1;
  }

  .j-box {
    position: relative; z-index: 10;
    width: 100%; max-width: 480px;
  }

  .j-back {
    display: inline-flex; align-items: center; gap: 0.5rem;
    color: var(--text-2); text-decoration: none;
    font-size: 0.85rem; font-weight: 500;
    margin-bottom: 2rem; transition: color 0.2s;
  }
  .j-back:hover { color: var(--text-1); }

  .j-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 3rem 2.5rem;
    box-shadow: 0 40px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08);
    text-align: center;
  }

  .j-icon-wrap {
    width: 56px; height: 56px; border-radius: 16px;
    background: rgba(34,211,238,0.1);
    border: 1px solid rgba(34,211,238,0.2);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1.5rem; color: #ffffff;
    background: linear-gradient(135deg, var(--cyan), var(--violet));
  }

  .j-title {
    font-family: var(--font-head); font-size: 1.75rem; font-weight: 700;
    letter-spacing: -0.03em; margin-bottom: 0.5rem;
  }
  .j-sub { color: var(--text-2); font-size: 0.95rem; margin-bottom: 2.5rem; }

  .j-input-wrap { position: relative; margin-bottom: 2rem; }
  .j-input {
    width: 100%; background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 16px;
    color: var(--text-1); font-family: var(--font-mono); font-size: 1.5rem;
    padding: 1.25rem; text-align: center;
    letter-spacing: 0.2em; text-transform: uppercase;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .j-input:focus {
    outline: none; border-color: var(--cyan);
    box-shadow: 0 0 0 4px rgba(34,211,238,0.1);
    transform: scale(1.02);
  }
  .j-input::placeholder { letter-spacing: normal; text-transform: none; font-size: 1rem; opacity: 0.5; color: #ffffff; }

  .j-identity-preview {
    background: rgba(255,255,255,0.02);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1rem; margin-bottom: 2.5rem;
    display: flex; flex-direction: column; gap: 0.4rem;
  }
  .j-id-label {
    font-family: var(--font-mono); font-size: 0.65rem;
    color: var(--text-2); text-transform: uppercase; letter-spacing: 0.05em;
  }
  .j-id-name {
    font-family: var(--font-head); font-size: 1.1rem; font-weight: 600;
    color: var(--violet); min-height: 1.5rem;
  }

  .j-btn {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.6rem;
    background: var(--violet); color: #fff; font-size: 1rem; font-weight: 600;
    padding: 1.1rem; border-radius: 12px; border: none; cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 8px 24px var(--violet-glow);
  }
  .j-btn:hover:not(:disabled) {
    background: #8f6dfd; transform: translateY(-2px);
    box-shadow: 0 12px 32px var(--violet-glow);
  }
  .j-btn:active:not(:disabled) { transform: translateY(0); }
  .j-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .j-footer {
    margin-top: 2rem; font-size: 0.9rem; color: var(--text-2);
  }
  .j-footer a { color: var(--cyan); text-decoration: none; font-weight: 600; }
  .j-footer a:hover { text-decoration: underline; }

  .j-err { color: #f87171; font-size: 0.95rem; margin-top: 1rem; font-weight: 500; }
`;

export default function JoinStall() {
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewName, setPreviewName] = useState(PREVIEW_NAMES[0]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(boxRef.current, { y: 30, opacity: 0 });
      gsap.to(boxRef.current, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', delay: 0.2 });
    });

    // Identity preview loop
    const interval = setInterval(() => {
      setPreviewName(prev => {
        const idx = PREVIEW_NAMES.indexOf(prev);
        return PREVIEW_NAMES[(idx + 1) % PREVIEW_NAMES.length];
      });
    }, 2000);

    return () => {
      ctx.revert();
      clearInterval(interval);
    };
  }, []);

  async function handleJoin() {
    if (!code.trim()) {
      alert("Please enter a room name");
      setError('Please enter an invite code.');
      return;
    }
    setError(''); setLoading(true);

    try {
      const sessionId = getSessionId();
      const res = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: code.trim().toUpperCase(), sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      saveStallSession({
        groupId: data.groupId,
        anonymousName: data.anonymousName,
        name: data.name,
        description: data.description,
        inviteCode: data.inviteCode,
        role: data.role,
      });

      // Immediate redirect to the messages route
      router.push(`/messages/${data.groupId}`);

    } catch (e: any) {
      setError(e.message || 'Access denied. Check your code.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="j-page">
        <div className="j-glow" aria-hidden />
        <div className="j-glow-2" aria-hidden />

        <div className="j-box" ref={boxRef}>
          <Link href="/" className="j-back">
            <ArrowLeft size={16} /> Exit
          </Link>

          <div className="j-card">
            <div className="j-form-view">
              <div className="j-icon-wrap">
                <Hash size={28} />
              </div>
              <h1 className="j-title">Enter a Stall</h1>
              <p className="j-sub">Enter the invite code to unlock the room.</p>

              <div className="j-input-wrap">
                <input
                  className="j-input"
                  placeholder="ABCD1234"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                  maxLength={12}
                  autoFocus
                />
              </div>

              <div className="j-identity-preview">
                <span className="j-id-label">You'll enter as</span>
                <div className="j-id-name">{previewName}</div>
              </div>

              <button className="j-btn" onClick={handleJoin} disabled={loading}>
                {loading ? 'Unlocking...' : 'Unlock Stall'}
                {!loading && <Sparkles size={18} />}
              </button>

              {error && <div className="j-err">{error}</div>}

              <div className="j-footer">
                Don't have a code? <Link href="/create">Create a Stall</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
