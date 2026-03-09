'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSessionId } from '@/lib/session';
import { cn } from '@/lib/utils';

interface PollOption {
    text: string;
    votes: number;
    percentage: number;
    userVoted: boolean;
}

interface PollWidgetProps {
    postId: string;
    options: PollOption[];
}

export default function PollWidget({ postId, options: initialOptions }: PollWidgetProps) {
    const [options, setOptions] = useState(initialOptions);
    const [voting, setVoting] = useState(false);
    const hasVoted = options.some((o) => o.userVoted);
    const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);

    async function handleVote(index: number) {
        if (voting || hasVoted) return;
        setVoting(true);
        try {
            const sessionId = getSessionId();
            const res = await fetch(`/api/posts/${postId}/poll-vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, optionIndex: index }),
            });
            const data = await res.json();
            if (res.ok) {
                setOptions(data.pollOptions);
            }
        } finally {
            setVoting(false);
        }
    }

    return (
        <div className="space-y-2.5">
            {options.map((option, i) => (
                <div key={i}>
                    {hasVoted ? (
                        // Results view
                        <div className="relative rounded-xl overflow-hidden border border-white/8">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${option.percentage}%` }}
                                transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
                                className={cn(
                                    'absolute inset-y-0 left-0',
                                    option.userVoted
                                        ? 'bg-gradient-to-r from-purple-600/50 to-violet-700/40'
                                        : 'bg-white/5'
                                )}
                            />
                            <div className="relative flex items-center justify-between px-4 py-3">
                                <div className="flex items-center gap-2">
                                    {option.userVoted && (
                                        <span className="text-xs text-purple-400">✓</span>
                                    )}
                                    <span className={cn('text-sm', option.userVoted ? 'text-white font-semibold' : 'text-[var(--text-secondary)]')}>
                                        {option.text}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-[var(--text-muted)]">{option.votes}</span>
                                    <span className={cn('font-bold', option.userVoted ? 'text-purple-400' : 'text-[var(--text-secondary)]')}>
                                        {option.percentage}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Voting view
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleVote(i)}
                            disabled={voting}
                            className="w-full text-left px-4 py-3 rounded-xl border border-white/8 hover:border-purple-500/40 hover:bg-purple-500/10 text-sm text-[var(--text-secondary)] hover:text-white transition-all"
                        >
                            {option.text}
                        </motion.button>
                    )}
                </div>
            ))}
            <p className="text-xs text-[var(--text-muted)] mt-1">
                {totalVotes} vote{totalVotes !== 1 ? 's' : ''}{!hasVoted && ' · tap to vote'}
            </p>
        </div>
    );
}
