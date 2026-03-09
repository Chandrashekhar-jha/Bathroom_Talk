'use client';

import { useEffect, useState, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import {
    Users, Copy, Check, Settings, ArrowLeft,
    MessageSquare, Shield, Flame, Trash2,
    Search, Bell, Plus, Ghost, Info,
    Smile, Hash, PlusCircle, Bookmark,
    TrendingUp, HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { getSessionId, getStallSession, StallSession } from '@/lib/session';
import PostCard, { Post } from '@/components/PostCard';
import CreatePost from '@/components/CreatePost';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

  :root {
    --bg: #0a0a0f;
    --bg-side: #0e0e14;
    --bg-card: #111118;
    --violet: #7c5cfc;
    --violet-glow: rgba(124,92,252,0.1);
    --cyan: #22d3ee;
    --cyan-glow: rgba(34,211,238,0.1);
    --text-1: #f3f3f3;
    --text-2: #e0e0e8;
    --text-3: #b0b0c0;
    --border: rgba(255,255,255,0.1);
    --border-hi: rgba(255,255,255,0.25);
    --font-head: 'Space Grotesk', sans-serif;
    --font-body: 'Inter', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    --sidebar-w: 280px;
    --right-w: 320px;
  }

  .s-layout {
    display: grid;
    grid-template-columns: var(--sidebar-w) 1fr var(--right-w);
    height: 100dvh;
    background: var(--bg);
    color: var(--text-1);
    font-family: var(--font-body);
    overflow: hidden;
  }

  @media (max-width: 1200px) {
    .s-layout { grid-template-columns: 80px 1fr 0px; }
    .s-right { display: none; }
  }

  @media (max-width: 768px) {
    .s-layout { grid-template-columns: 1fr; }
    .s-sidebar { display: none; }
  }

  /* Components */
  .s-sidebar {
    background: var(--bg-side);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
  }

  .s-nav-item {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.75rem 1rem; border-radius: 12px;
    color: var(--text-2); text-decoration: none;
    font-size: 0.9rem; font-weight: 500;
    transition: all 0.2s; margin-bottom: 0.25rem;
  }
  .s-nav-item:hover { background: rgba(255,255,255,0.03); color: var(--text-1); }
  .s-nav-item.active { background: var(--violet-glow); color: var(--violet); }

  .s-nav-label {
    font-family: var(--font-mono); font-size: 0.65rem;
    color: var(--text-3); text-transform: uppercase;
    letter-spacing: 0.1em; margin: 1.5rem 0 0.75rem 1rem;
  }

  .s-feed {
    display: flex; flex-direction: column;
    height: 100%; position: relative;
    background: var(--bg);
  }

  .s-topbar {
    height: 72px; padding: 0 2rem;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(10,10,15,0.8); backdrop-filter: blur(12px);
    z-index: 20;
  }

  .s-stall-info { display: flex; align-items: center; gap: 1rem; }
  .s-stall-name { font-family: var(--font-head); font-weight: 700; font-size: 1.1rem; }
  .s-mood-badge {
    display: flex; align-items: center; gap: 0.4rem;
    padding: 0.3rem 0.6rem; border-radius: 20px;
    background: rgba(255,255,255,0.03); border: 1px solid var(--border);
    font-size: 0.75rem; color: var(--text-2);
  }

  .s-presence { display: flex; align-items: center; gap: 1rem; font-size: 0.8rem; color: var(--text-2); }
  .s-online-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 8px #22c55e; }

  .s-scroll-area {
    flex: 1; overflow-y: auto; padding: 2rem;
    display: flex; flex-direction: column; align-items: center;
    scroll-behavior: smooth;
  }
  .s-scroll-area::-webkit-scrollbar { width: 6px; }
  .s-scroll-area::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }

  .s-feed-container { width: 100%; max-width: 680px; }

  .s-composer-wrap {
    padding: 1.5rem 2rem; border-top: 1px solid var(--border);
    background: var(--bg); z-index: 20;
  }

  .s-right {
    background: var(--bg-side);
    border-left: 1px solid var(--border);
    padding: 1.5rem; overflow-y: auto;
  }

  .s-card {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 16px; padding: 1.25rem; margin-bottom: 1.5rem;
  }
  .s-card-title {
    font-family: var(--font-head); font-size: 0.9rem; font-weight: 700;
    margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;
  }

  .s-user-item {
    display: flex; align-items: center; gap: 0.75rem;
    margin-bottom: 0.75rem; font-size: 0.85rem;
  }
  .s-user-avatar {
    width: 32px; height: 32px; border-radius: 10px;
    background: linear-gradient(135deg, var(--violet), var(--cyan));
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; color: #fff;
  }

  .s-trend-item {
    padding: 0.75rem; border-radius: 10px;
    background: rgba(255,255,255,0.02); margin-bottom: 0.5rem;
    font-size: 0.8rem; border: 1px solid transparent;
    transition: 0.2s; cursor: pointer;
  }
  .s-trend-item:hover { border-color: var(--border-hi); background: rgba(255,255,255,0.04); }

  /* Identity Chip */
  .s-id-chip {
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.4rem 0.8rem; border-radius: 10px;
    background: var(--violet-glow); border: 1px solid rgba(124,92,252,0.2);
    font-family: var(--font-mono); font-size: 0.75rem; color: var(--violet);
    margin-bottom: 1.5rem;
  }
  
  .s-noise {
    position: fixed; inset: 0; pointer-events: none; z-index: 1; opacity: 0.02;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  .s-typing {
    font-size: 0.75rem; color: var(--text-3); font-style: italic;
    margin-top: 0.5rem; display: flex; align-items: center; gap: 0.4rem;
  }
  .s-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--text-3); animation: bounce 1.4s infinite ease-in-out; }
  .s-dot:nth-child(2) { animation-delay: 0.2s; }
  .s-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
`;

interface GroupInfo {
    _id: string;
    name: string;
    description: string;
    inviteCode: string;
    memberCount: number;
    creatorSession: string;
    category?: string;
    currentMember: {
        anonymousName: string;
        role: 'creator' | 'member';
        mutedUntil: string | null;
    };
}

export default function StallPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    // States
    const [group, setGroup] = useState<GroupInfo | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [stallSession, setStallSession] = useState<StallSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [mood, setMood] = useState('🍿 Curious');

    const scrollRef = useRef<HTMLDivElement>(null);
    const sessionId = typeof window !== 'undefined' ? getSessionId() : '';

    // Setup layout view
    useEffect(() => {
        const session = getStallSession(id);
        setStallSession(session);

        // Fetch group info & posts
        const load = async () => {
            try {
                const [gRes, pRes] = await Promise.all([
                    fetch(`/api/groups/${id}`, { headers: { 'x-session-id': sessionId } }),
                    fetch(`/api/posts?groupId=${id}`, { headers: { 'x-session-id': sessionId } })
                ]);

                if (gRes.status === 403) { router.push(`/join?code=${id}`); return; }

                const gData = await gRes.json();
                const pData = await pRes.json();

                if (gRes.ok) setGroup(gData);
                if (pRes.ok) setPosts(pData.posts);
            } catch (e) {
                setError('Failed to sync with stall.');
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, [id, sessionId, router]);

    // Socket.io Placeholder (Will integrate soon)
    useEffect(() => {
        setIsConnected(true);
    }, []);

    const isAdmin = group?.currentMember?.role === 'creator';
    const myName = stallSession?.anonymousName || group?.currentMember?.anonymousName || 'Ghost';

    if (isLoading) return <div className="h-screen bg-[#0a0a0f] flex items-center justify-center font-mono text-cyan-400">Syncing Stalls...</div>;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: styles }} />
            <div className="s-noise" />

            <div className="s-layout">
                {/* Sidebar */}
                <aside className="s-sidebar">
                    <Link href="/" className="mb-10 block">
                        <div className="font-head font-black tracking-tighter text-xl">BATHROOM</div>
                    </Link>

                    <nav>
                        <div className="s-nav-label">Navigation</div>
                        <a href="#" className="s-nav-item active">
                            <MessageSquare size={18} /> Community Feed
                        </a>
                        <a href="#" className="s-nav-item">
                            <Flame size={18} /> Hot Whispers
                        </a>
                        <a href="#" className="s-nav-item">
                            <Bookmark size={18} /> Pinned Notes
                        </a>

                        <div className="s-nav-label">Stalls</div>
                        <div className="s-nav-item" style={{ cursor: 'pointer' }}>
                            <PlusCircle size={18} /> Join New
                        </div>
                        {/* List of other joined stalls could go here */}
                    </nav>

                    <div style={{ marginTop: 'auto' }}>
                        <div className="s-nav-label">Global</div>
                        <a href="#" className="s-nav-item">
                            <Shield size={18} /> Safety Center
                        </a>
                        <a href="#" className="s-nav-item">
                            <Settings size={18} /> Settings
                        </a>
                    </div>
                </aside>

                {/* Main Feed */}
                <main className="s-feed">
                    <header className="s-topbar">
                        <div className="s-stall-info">
                            <Link href="/" className="md:hidden mr-2">
                                <ArrowLeft size={20} />
                            </Link>
                            <div>
                                <div className="s-stall-name">{group?.name}</div>
                                <div className="s-mood-badge">
                                    <span>Current Mood:</span>
                                    <span style={{ color: 'var(--text-1)' }}>{mood}</span>
                                </div>
                            </div>
                        </div>

                        <div className="s-presence">
                            <div className="s-online-dot" />
                            <span>{group?.memberCount} inside right now</span>
                            <button className="md:hidden p-2 rounded-lg bg-white/5"><Plus size={18} /></button>
                        </div>
                    </header>

                    <div className="s-scroll-area" ref={scrollRef}>
                        <div className="s-feed-container">
                            <div className="s-id-chip">
                                <Ghost size={14} />
                                <span>You are {myName}</span>
                            </div>

                            <div className="space-y-6">
                                {posts.map(post => (
                                    <PostCard
                                        key={post._id}
                                        post={post}
                                        isAdmin={isAdmin}
                                        onDelete={id => setPosts(p => p.filter(x => x._id !== id))}
                                        onVoteUpdate={() => { }}
                                    />
                                ))}

                                {posts.length === 0 && (
                                    <div className="text-center py-20 opacity-30">
                                        <Ghost size={48} className="mx-auto mb-4" />
                                        <p className="font-head text-lg font-bold">The stall is silent.</p>
                                        <p className="text-sm mt-1">Be the first to leave a note.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="s-composer-wrap">
                        <div className="s-feed-container mx-auto">
                            <CreatePost
                                groupId={id}
                                anonymousName={myName}
                                onPostCreated={p => setPosts(prev => [p as Post, ...prev])}
                            />
                            <div className="s-typing">
                                <div className="s-dot" />
                                <div className="s-dot" />
                                <div className="s-dot" />
                                <span>MidnightEcho is typing...</span>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Right Info Panel */}
                <aside className="s-right">
                    <div className="s-card">
                        <div className="s-card-title"><Info size={16} color="var(--cyan)" /> About Stall</div>
                        <p className="text-xs text-[var(--text-2)] leading-relaxed mb-4">
                            {group?.description || 'No description provided. Keep it anonymous, keep it real.'}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <span className="text-[10px] text-[var(--text-3)] font-mono">CODE: {group?.inviteCode}</span>
                            <button className="text-[10px] text-[var(--cyan)] font-bold hover:underline">COPY INVITE</button>
                        </div>
                    </div>

                    <div className="s-card">
                        <div className="s-card-title"><Users size={16} color="var(--violet)" /> Live Members</div>
                        <div className="s-user-item">
                            <div className="s-user-avatar" style={{ background: '#7c5cfc' }}>GF</div>
                            <div className="flex-1 text-sm font-mono">GhostFox <span className="text-[var(--text-3)] text-[10px] ml-1">ADMIN</span></div>
                            <div className="s-online-dot" />
                        </div>
                        <div className="s-user-item">
                            <div className="s-user-avatar" style={{ background: '#3b82f6' }}>ST</div>
                            <div className="flex-1 text-sm font-mono">SilentTiger</div>
                            <div className="s-online-dot" />
                        </div>
                        <div className="s-user-item opacity-50">
                            <div className="s-user-avatar" style={{ background: '#64748b' }}>ME</div>
                            <div className="flex-1 text-sm font-mono">MidnightEcho</div>
                        </div>
                        <button className="w-full text-[10px] text-[var(--text-3)] hover:text-white pt-2">+ 12 others</button>
                    </div>

                    <div className="s-card">
                        <div className="s-card-title"><TrendingUp size={16} color="#f59e0b" /> Top Notes</div>
                        <div className="s-trend-item">"The coffee in office is getting worse every day..."</div>
                        <div className="s-trend-item">"Who else is dreading the Monday stand-up?"</div>
                    </div>

                    <div className="s-card" style={{ borderStyle: 'dashed', borderColor: 'var(--violet)' }}>
                        <div className="s-card-title"><HelpCircle size={16} color="var(--violet)" /> Daily Prompt</div>
                        <p className="text-sm italic text-white mb-3">"What's one thing you'd change about our workspace if you were the CEO for a day?"</p>
                        <button className="text-[10px] font-bold text-[var(--violet)] uppercase tracking-widest">Answer Anonymously</button>
                    </div>
                </aside>
            </div>
        </>
    );
}
