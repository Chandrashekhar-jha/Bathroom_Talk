'use client';

import { useEffect, useState, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Trash2, VolumeX, Volume2, UserX, AlertTriangle, Users, Flag } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getSessionId } from '@/lib/session';

interface Member {
    sessionId: string;
    anonymousName: string;
    role: 'creator' | 'member';
    mutedUntil: string | null;
    joinedAt: string;
}

interface Report {
    _id: string;
    postId: string;
    reportedBy: string;
    reason: string;
    createdAt: string;
}

export default function AdminPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [members, setMembers] = useState<Member[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'members' | 'reports'>('members');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [toast, setToast] = useState('');

    const sessionId = typeof window !== 'undefined' ? getSessionId() : '';

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            const [membersRes, reportsRes] = await Promise.all([
                fetch(`/api/groups/${id}/members`, { headers: { 'x-session-id': sessionId } }),
                fetch(`/api/moderation?groupId=${id}`, { headers: { 'x-session-id': sessionId } }),
            ]);
            if (membersRes.ok) {
                const d = await membersRes.json();
                setMembers(d.members);
            }
            if (reportsRes.ok) {
                const d = await reportsRes.json();
                setReports(d.reports);
            }
            setIsLoading(false);
        }
        if (sessionId) load();
    }, [id, sessionId]);

    function showToast(msg: string) {
        setToast(msg);
        setTimeout(() => setToast(''), 2500);
    }

    async function handleModAction(action: string, targetSession: string, muteDurationMs?: number) {
        setActionLoading(`${action}-${targetSession}`);
        try {
            const res = await fetch('/api/moderation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, groupId: id, targetSession, sessionId, muteDurationMs }),
            });
            const data = await res.json();
            if (res.ok) {
                if (action === 'remove') {
                    setMembers((prev) => prev.filter((m) => m.sessionId !== targetSession));
                    showToast('Member removed');
                } else if (action === 'mute') {
                    setMembers((prev) => prev.map((m) =>
                        m.sessionId === targetSession ? { ...m, mutedUntil: data.mutedUntil } : m
                    ));
                    showToast('Member muted for 1 hour');
                } else if (action === 'unmute') {
                    setMembers((prev) => prev.map((m) =>
                        m.sessionId === targetSession ? { ...m, mutedUntil: null } : m
                    ));
                    showToast('Member unmuted');
                }
            }
        } finally {
            setActionLoading(null);
        }
    }

    const isMuted = (m: Member) => m.mutedUntil && new Date(m.mutedUntil) > new Date();

    return (
        <div className="min-h-screen">
            {/* Fixed orb */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 left-1/3 w-72 h-72 rounded-full blur-3xl opacity-10"
                    style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }} />
            </div>

            {/* Navbar */}
            <header className="sticky top-0 z-40 glass border-b border-white/5">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Link href={`/stall/${id}`} className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-white transition-all">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="font-bold text-base">Mod Panel</h1>
                        <p className="text-xs text-[var(--text-muted)]">Manage your stall</p>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6 relative z-10">
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {(['members', 'reports'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${activeTab === tab
                                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                                    : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab === 'members' ? <Users size={14} /> : <Flag size={14} />}
                            {tab}
                            {tab === 'reports' && reports.length > 0 && (
                                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                    {reports.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton h-16 rounded-2xl" />
                        ))}
                    </div>
                ) : activeTab === 'members' ? (
                    <div className="space-y-3">
                        <p className="text-xs text-[var(--text-muted)] mb-4">{members.length} members in this stall</p>
                        <AnimatePresence>
                            {members.map((member) => (
                                <motion.div
                                    key={member.sessionId}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="glass glass-hover rounded-2xl p-4 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-violet-800 flex items-center justify-center text-sm font-bold border border-purple-500/30">
                                            {member.anonymousName[0]}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-purple-300">{member.anonymousName}</span>
                                                {member.role === 'creator' && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">mod</span>
                                                )}
                                                {isMuted(member) && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">muted</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-[var(--text-muted)]">
                                                Joined {new Date(member.joinedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {member.role !== 'creator' && (
                                        <div className="flex items-center gap-2">
                                            {isMuted(member) ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    isLoading={actionLoading === `unmute-${member.sessionId}`}
                                                    onClick={() => handleModAction('unmute', member.sessionId)}
                                                    className="text-teal-400 hover:text-teal-300"
                                                >
                                                    <Volume2 size={13} /> Unmute
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    isLoading={actionLoading === `mute-${member.sessionId}`}
                                                    onClick={() => handleModAction('mute', member.sessionId, 3600000)}
                                                    className="text-yellow-400 hover:text-yellow-300"
                                                >
                                                    <VolumeX size={13} /> Mute
                                                </Button>
                                            )}
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                isLoading={actionLoading === `remove-${member.sessionId}`}
                                                onClick={() => handleModAction('remove', member.sessionId)}
                                            >
                                                <UserX size={13} /> Remove
                                            </Button>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reports.length === 0 ? (
                            <div className="text-center py-12 text-[var(--text-muted)]">
                                <AlertTriangle size={32} className="mx-auto mb-3 opacity-30" />
                                <p>No reports yet</p>
                            </div>
                        ) : (
                            reports.map((report) => (
                                <motion.div
                                    key={report._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass rounded-2xl p-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <Flag size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold mb-1">Post reported</p>
                                            <p className="text-xs text-[var(--text-muted)] mb-1">Reason: {report.reason}</p>
                                            <p className="text-xs text-[var(--text-muted)]">
                                                {new Date(report.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}
            </main>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass px-5 py-3 rounded-2xl text-sm font-semibold text-white shadow-xl border border-green-500/30"
                    >
                        ✓ {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
