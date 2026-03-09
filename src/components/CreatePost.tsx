'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Lock, BarChart2, HelpCircle,
    Plus, X, Send, Smile, Image as ImageIcon,
    Ghost, Sparkles
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { getSessionId } from '@/lib/session';

type PostType = 'post' | 'confession' | 'poll' | 'question';

interface CreatePostProps {
    groupId: string;
    anonymousName: string;
    onPostCreated: (post: unknown) => void;
}

const tabs: { type: PostType; label: string; icon: React.ElementType; color: string; glow: string }[] = [
    { type: 'post', label: 'Note', icon: FileText, color: 'text-blue-400', glow: 'rgba(59,130,246,0.1)' },
    { type: 'confession', label: 'Confession', icon: Lock, color: 'text-violet-400', glow: 'rgba(124,92,252,0.1)' },
    { type: 'poll', label: 'Poll', icon: BarChart2, color: 'text-emerald-400', glow: 'rgba(16,185,129,0.1)' },
    { type: 'question', label: 'Question', icon: HelpCircle, color: 'text-amber-400', glow: 'rgba(245,158,11,0.1)' },
];

export default function CreatePost({ groupId, anonymousName, onPostCreated }: CreatePostProps) {
    const [activeTab, setActiveTab] = useState<PostType>('post');
    const [content, setContent] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    async function handleSubmit() {
        if (!content.trim()) { setError('Write something first...'); return; }
        if (activeTab === 'poll' && pollOptions.filter(o => o.trim()).length < 2) {
            setError('Polls need at least 2 options.');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            const sessionId = getSessionId();
            const body: Record<string, unknown> = { groupId, content: content.trim(), type: activeTab, sessionId };
            if (activeTab === 'poll') {
                body.pollOptions = pollOptions.filter(o => o.trim());
            }
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            onPostCreated(data);
            setContent('');
            setPollOptions(['', '']);
            setIsExpanded(false);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to send note.');
        } finally {
            setIsLoading(false);
        }
    }

    const currentTab = tabs.find(t => t.type === activeTab)!;

    return (
        <div className={cn(
            "bg-[#111118] border border-white/15 rounded-2xl overflow-hidden transition-all duration-300",
            isExpanded ? "ring-1 ring-white/30 shadow-2xl" : "shadow-lg"
        )}>
            {/* Tabs Selector */}
            <div className="flex bg-[#0a0a0f] border-b border-white/5">
                {tabs.map((tab) => (
                    <button
                        key={tab.type}
                        onClick={() => { setActiveTab(tab.type); setIsExpanded(true); }}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2',
                            activeTab === tab.type
                                ? `${tab.color} border-current bg-white/5`
                                : 'text-[#b0b0c0] border-transparent hover:text-[#e0e0e8] hover:bg-white/2'
                        )}
                    >
                        <tab.icon size={14} />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Input Wrapper */}
            <div className="p-5">
                {/* Header: User & Context */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                            <Ghost size={16} className={currentTab.color} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-mono font-bold text-[#ffffff]">{anonymousName}</span>
                            <span className="text-[10px] text-[#d1d1e0]">Posting as Anonymous</span>
                        </div>
                    </div>
                    {activeTab === 'confession' && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold text-violet-400">
                            <Lock size={10} />
                            ENCRYPTED CONFESSION
                        </div>
                    )}
                </div>

                {/* Textarea */}
                <textarea
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value);
                        if (error) setError('');
                    }}
                    onFocus={() => setIsExpanded(true)}
                    placeholder={
                        activeTab === 'post' ? "Write what you can't say out loud..." :
                            activeTab === 'confession' ? "Spill a secret that nobody knows..." :
                                activeTab === 'poll' ? "What does the room think about..." :
                                    "Ask a question to the collective..."
                    }
                    rows={isExpanded ? 4 : 2}
                    className="w-full bg-transparent text-sm text-[#ffffff] placeholder-[#d1d1e0] resize-none outline-none leading-relaxed font-body"
                />

                {/* Poll Options Builder */}
                <AnimatePresence>
                    {isExpanded && activeTab === 'poll' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="mt-4 space-y-2 border-t border-white/5 pt-4"
                        >
                            {pollOptions.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2 group">
                                    <div className="w-6 text-[10px] font-mono text-[#b0b0c0]">{i + 1}</div>
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                            const updated = [...pollOptions];
                                            updated[i] = e.target.value;
                                            setPollOptions(updated);
                                        }}
                                        placeholder={`Option ${i + 1}`}
                                        className="flex-1 bg-[#0a0a0f] border border-white/5 rounded-lg px-3 py-2 text-xs text-[#f3f3f3] focus:border-emerald-500/50 outline-none transition-all"
                                    />
                                    {i >= 2 && (
                                        <button
                                            onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))}
                                            className="p-2 text-[#b0b0c0] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {pollOptions.length < 5 && (
                                <button
                                    onClick={() => setPollOptions([...pollOptions, ''])}
                                    className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors ml-8 pt-1"
                                >
                                    <PlusCircle size={12} /> ADD OPTION
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Controls Footer */}
                <div className={cn(
                    "flex items-center justify-between mt-4 pt-4 border-t border-white/5 transition-all",
                    !isExpanded && "opacity-50 grayscale pointer-events-none"
                )}>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-white/5 text-[#b0b0c0] hover:text-[#f3f3f3] transition-all">
                            <Smile size={18} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/5 text-[#b0b0c0] hover:text-[#f3f3f3] transition-all">
                            <ImageIcon size={18} />
                        </button>
                        {error && <span className="text-[10px] text-red-400 font-bold ml-2">{error.toUpperCase()}</span>}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { setIsExpanded(false); setContent(''); setError(''); }}
                            className="px-4 py-2 text-[10px] font-bold text-[#b0b0c0] hover:text-[#f3f3f3] transition-all"
                        >
                            CANCEL
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !content.trim()}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-bold transition-all transform active:scale-95",
                                activeTab === 'post' ? "bg-blue-600 hover:bg-blue-500" :
                                    activeTab === 'confession' ? "bg-violet-600 hover:bg-violet-500" :
                                        activeTab === 'poll' ? "bg-emerald-600 hover:bg-emerald-500" :
                                            "bg-amber-600 hover:bg-amber-500",
                                "disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-xl shadow-black/50"
                            )}
                        >
                            {isLoading ? "SENDING..." : (
                                <>
                                    <span>SEND {activeTab.toUpperCase()}</span>
                                    <Send size={12} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper mock
function PlusCircle({ size, className }: { size?: number, className?: string }) {
    return <Plus size={size} className={className} />
}
