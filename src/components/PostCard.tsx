'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ThumbsUp, ThumbsDown, Trash2, Flag,
    MoreHorizontal, MessageSquare, Ghost,
    Lock, BarChart2, HelpCircle, Flame,
    CheckCircle2, AlertTriangle, ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSessionId } from '@/lib/session';
import PollWidget from './PollWidget';

export interface Post {
    _id: string;
    groupId: string;
    authorSession: string;
    anonymousName: string;
    content: string;
    type: 'post' | 'confession' | 'poll' | 'question';
    upvotes: string[];
    downvotes: string[];
    pollOptions: { text: string; votes: number; percentage: number; userVoted: boolean }[];
    userVote: number;
    isDeleted: boolean;
    createdAt: string;
}

interface PostCardProps {
    post: Post;
    isAdmin: boolean;
    onDelete: (id: string) => void;
    onVoteUpdate: (id: string, upvotes: number, downvotes: number, userVote: number) => void;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
}

export default function PostCard({ post, isAdmin, onDelete, onVoteUpdate }: PostCardProps) {
    const [voting, setVoting] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [reported, setReported] = useState(false);

    const sessionId = typeof window !== 'undefined' ? getSessionId() : '';
    const isOwn = post.authorSession === sessionId;
    const score = post.upvotes.length - post.downvotes.length;

    async function handleVote(value: 1 | -1) {
        if (voting) return;
        setVoting(true);
        try {
            const res = await fetch(`/api/posts/${post._id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, value }),
            });
            const data = await res.json();
            if (res.ok) {
                onVoteUpdate(post._id, data.upvotes, data.downvotes, data.userVote);
            }
        } finally {
            setVoting(false);
        }
    }

    async function handleReport() {
        if (reported) return;
        await fetch(`/api/posts/${post._id}/report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, reason: 'Reported by user' }),
        });
        setReported(true);
        setShowMenu(false);
    }

    async function handleDelete() {
        if (!confirm('Flush this note? This cannot be undone.')) return;
        await fetch(`/api/posts/${post._id}`, {
            method: 'DELETE',
            headers: { 'x-session-id': sessionId },
        });
        onDelete(post._id);
        setShowMenu(false);
    }

    // Type markers
    const typeLabel = {
        post: { icon: Ghost, text: 'Note', color: 'text-blue-400', bg: 'bg-blue-400/10' },
        confession: { icon: Lock, text: 'Confession', color: 'text-violet-400', bg: 'bg-violet-400/10' },
        poll: { icon: BarChart2, text: 'Poll', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        question: { icon: HelpCircle, text: 'Question', color: 'text-amber-400', bg: 'bg-amber-400/10' },
    }[post.type || 'post'];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            className="group relative bg-[#111118] border border-white/15 rounded-2xl p-5 hover:border-white/30 transition-all duration-300 shadow-lg"
        >
            {/* Header: Identity Chip */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-[#0a0a0f] border border-white/5 flex items-center justify-center text-[#f3f3f3]">
                            <Ghost size={20} className={typeLabel.color} />
                        </div>
                        {isOwn && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-[#111118]" title="You" />
                        )}
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-[#ffffff]">{post.anonymousName}</span>
                            <span className="text-[10px] text-[#d1d1e0]">• {timeAgo(post.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                            <typeLabel.icon size={10} className={typeLabel.color} />
                            <span className={cn("text-[9px] font-bold uppercase tracking-widest text-opacity-100", typeLabel.color)}>
                                {typeLabel.text}
                            </span>
                            {score >= 10 && (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-400 text-[9px] font-bold">
                                    <Flame size={8} /> TRENDING
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions Menu */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 rounded-lg hover:bg-white/5 text-[#b0b0c0] opacity-0 group-hover:opacity-100 transition-all"
                    >
                        <MoreHorizontal size={16} />
                    </button>

                    <AnimatePresence>
                        {showMenu && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 5 }}
                                className="absolute right-5 top-12 z-20 bg-[#16161f] border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[140px]"
                                onMouseLeave={() => setShowMenu(false)}
                            >
                                {(isOwn || isAdmin) && (
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center gap-2 w-full px-4 py-3 text-xs text-red-400 hover:bg-red-400/10 transition-all"
                                    >
                                        <Trash2 size={14} /> Flush Note
                                    </button>
                                )}
                                <button
                                    onClick={handleReport}
                                    className="flex items-center gap-2 w-full px-4 py-3 text-xs text-[#e0e0e8] hover:bg-white/5 transition-all"
                                >
                                    <Flag size={14} /> {reported ? 'Reported' : 'Report Note'}
                                </button>
                                <button
                                    className="flex items-center gap-2 w-full px-4 py-3 text-xs text-[#e0e0e8] hover:bg-white/5 transition-all"
                                >
                                    <ShieldAlert size={14} /> Moderation
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Content Body */}
            <div className="text-sm text-[#ffffff] opacity-100 leading-relaxed mb-5 whitespace-pre-wrap font-body selection:bg-violet-500/30">
                {post.content}
            </div>

            {/* Specialized Content (Polls) */}
            {post.type === 'poll' && post.pollOptions && (
                <div className="mb-5 bg-[#0a0a0f] p-4 rounded-xl border border-white/5">
                    <PollWidget postId={post._id} options={post.pollOptions} />
                </div>
            )}

            {/* Interactions Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <div className="flex bg-[#0a0a0f] rounded-lg border border-white/5 p-1">
                        <button
                            onClick={() => handleVote(1)}
                            disabled={voting}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                                post.userVote === 1
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                    : "text-[#b0b0c0] hover:text-[#f3f3f3]"
                            )}
                        >
                            <ThumbsUp size={14} />
                            <span>{post.upvotes.length}</span>
                        </button>

                        <div className="w-[1px] bg-white/5 mx-1" />

                        <button
                            onClick={() => handleVote(-1)}
                            disabled={voting}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                                post.userVote === -1
                                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                                    : "text-[#b0b0c0] hover:text-[#f3f3f3]"
                            )}
                        >
                            <ThumbsDown size={14} />
                            <span>{post.downvotes.length}</span>
                        </button>
                    </div>

                    <div className={cn(
                        "text-[10px] font-mono font-bold px-2 py-1 rounded",
                        score > 0 ? "text-blue-400" : score < 0 ? "text-red-400" : "text-[#b0b0c0]"
                    )}>
                        {score > 0 ? "+" : ""}{score}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-[10px] font-bold text-[#b0b0c0] hover:text-[#f3f3f3] transition-all">
                        <MessageSquare size={14} />
                        <span>REPLIES</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
