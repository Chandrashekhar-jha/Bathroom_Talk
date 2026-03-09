'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';
import { ArrowLeft, Sparkles, Check, Copy } from 'lucide-react';
import { getSessionId, saveStallSession } from '@/lib/session';
import { v4 as uuidv4 } from 'uuid';

const CATEGORIES = ['College', 'Office', 'Friends', 'Community', 'Confession', 'Private'];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

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

  /* Base */
  .c-page {
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
  .c-glow {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 50% at 50% 38%, rgba(124,92,252,0.25) 0%, transparent 70%);
    pointer-events: none; z-index: 1;
  }
  .c-glow-2 {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 40% 35% at 50% 55%, rgba(34,211,238,0.18) 0%, transparent 65%);
    pointer-events: none; z-index: 1;
  }

  /* Container */
  .c-box {
    position: relative; z-index: 10;
    width: 100%; max-width: 520px;
  }

  /* Nav */
  .c-back {
    display: inline-flex; align-items: center; gap: 0.5rem;
    color: var(--text-2); text-decoration: none;
    font-size: 0.85rem; font-weight: 500;
    margin-bottom: 2rem; transition: color 0.2s;
  }
  .c-back:hover { color: var(--text-1); }

  /* Card */
  .c-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 2.5rem;
    box-shadow: 0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08);
  }

  /* Header */
  .c-header { margin-bottom: 2.5rem; }
  .c-title {
    font-family: var(--font-head); font-size: 1.8rem; font-weight: 700;
    letter-spacing: -0.03em; margin-bottom: 0.25rem;
  }
  .c-sub { color: var(--text-2); font-size: 0.9rem; }

  /* Forms */
  .c-group { margin-bottom: 1.5rem; }
  .c-label {
    display: block; font-family: var(--font-mono); font-size: 0.72rem;
    color: #4ade80; text-transform: uppercase; letter-spacing: 0.05em;
    margin-bottom: 0.6rem; font-weight: 600;
  }
  .c-input, .c-textarea {
    width: 100%; background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text-1); font-family: var(--font-body); font-size: 0.95rem;
    padding: 0.85rem 1rem;
    transition: all 0.2s;
  }
  .c-input:focus, .c-textarea:focus {
    outline: none; border-color: rgba(124,92,252,0.5);
    box-shadow: 0 0 0 3px var(--violet-glow);
  }
  .c-textarea { resize: vertical; min-height: 80px; }
  
  /* Category Pills */
  .c-pills { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .c-pill {
    background: transparent; border: 1px solid var(--border);
    border-radius: 8px; padding: 0.4rem 0.8rem;
    color: var(--text-2); font-size: 0.8rem; cursor: pointer;
    transition: all 0.2s;
  }
  .c-pill:hover { border-color: var(--border-hi); color: var(--text-1); }
  .c-pill.active {
    background: var(--violet-glow); border-color: var(--violet); color: var(--text-1);
  }

  /* Toggles */
  .c-toggles { display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem; }
  .c-toggle-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.75rem 1rem; background: var(--bg);
    border: 1px solid var(--border); border-radius: 10px;
    cursor: pointer; transition: border-color 0.2s;
  }
  .c-toggle-row:hover { border-color: var(--border-hi); }
  .c-toggle-text { font-size: 0.85rem; font-weight: 500; }
  .c-switch {
    width: 36px; height: 20px; background: rgba(255,255,255,0.1);
    border-radius: 20px; position: relative; transition: background 0.3s;
  }
  .c-switch.on { background: var(--violet); }
  .c-knob {
    width: 14px; height: 14px; background: #fff; border-radius: 50%;
    position: absolute; top: 3px; left: 3px; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .c-switch.on .c-knob { transform: translateX(16px); }

  /* Button */
  .c-btn {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    background: var(--violet); color: #fff; font-size: 0.95rem; font-weight: 600;
    padding: 1rem; border-radius: 10px; border: none; cursor: pointer;
    margin-top: 2.5rem; transition: background 0.2s, transform 0.15s;
  }
  .c-btn:hover:not(:disabled) { background: #8f6dfd; transform: translateY(-1px); }
  .c-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  /* Success State */
  .c-success { text-align: center; }
  .c-icon-wrap {
    width: 64px; height: 64px; border-radius: 20px;
    background: linear-gradient(135deg, var(--violet), #22d3ee);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1.5rem;
  }
  .c-code-box {
    background: var(--bg); border: 1px dashed var(--border-hi);
    border-radius: 12px; padding: 1.5rem; margin: 2rem 0;
  }
  .c-code-val {
    font-family: var(--font-mono); font-size: 2.5rem; font-weight: 700;
    letter-spacing: 0.1em; color: #ffffff; margin-bottom: 0.5rem;
    text-shadow: 0 0 20px rgba(34,211,238,0.3);
  }
  .c-id-text {
    font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-2);
  }
  .c-id-text span { color: var(--text-1); font-weight: 500; }
  
  .c-err {
    color: #f87171; font-size: 0.85rem; margin-top: 1rem; text-align: center;
  }
`;

export default function CreateStall() {
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('College');
  const [desc, setDesc] = useState('');

  const [toggles, setToggles] = useState({ reactions: true, polls: true, confessions: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(boxRef.current, { y: 20, opacity: 0 });
      gsap.to(boxRef.current, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 });
    });
    return () => ctx.revert();
  }, []);

  async function handleCreate() {
    if (!name.trim()) {
      alert("Please enter a room name");
      setError('Stall name is required.');
      return;
    }
    setError(''); setLoading(true);

    try {
      const sessionId = getSessionId();
      const groupId = uuidv4();
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const anonymousName = `Ghost_${Math.floor(Math.random() * 9000) + 1000}`;

      saveStallSession({
        groupId,
        anonymousName,
        name,
        description: desc,
        inviteCode,
        role: 'creator',
      });

      // Immediate redirect to the messages route
      router.push(`/messages/${groupId}`);

    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="c-page">
        <div className="c-glow" aria-hidden />
        <div className="c-glow-2" aria-hidden />

        <div className="c-box" ref={boxRef}>
          <Link href="/" className="c-back">
            <ArrowLeft size={16} /> Back
          </Link>

          <div className="c-card">
            <div className="c-form-view">
              <div className="c-header">
                <h1 className="c-title">Create a Stall</h1>
                <p className="c-sub">Configure a secure, anonymous room.</p>
              </div>

              <div className="c-group">
                <label className="c-label">Stall Name</label>
                <input
                  className="c-input"
                  placeholder="e.g. Design Team Confessions"
                  value={name} onChange={e => setName(e.target.value)}
                  maxLength={50}
                />
              </div>

              <div className="c-group">
                <label className="c-label">Environment</label>
                <div className="c-pills">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      className={`c-pill ${category === c ? 'active' : ''}`}
                      onClick={() => setCategory(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="c-group">
                <label className="c-label">Description (Optional)</label>
                <textarea
                  className="c-textarea"
                  placeholder="What happens in this stall stays in this stall."
                  value={desc} onChange={e => setDesc(e.target.value)}
                  maxLength={160}
                />
              </div>

              <div className="c-toggles">
                {Object.entries(toggles).map(([key, val]) => (
                  <div className="c-toggle-row" key={key} onClick={() => setToggles(prev => ({ ...prev, [key]: !val }))}>
                    <span className="c-toggle-text">Allow {key}</span>
                    <div className={`c-switch ${val ? 'on' : ''}`}>
                      <div className="c-knob" />
                    </div>
                  </div>
                ))}
              </div>

              {error && <div className="c-err">{error}</div>}

              <button className="c-btn" onClick={handleCreate} disabled={loading}>
                {loading ? 'Configuring Space...' : 'Create Secure Stall'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
