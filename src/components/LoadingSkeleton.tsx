'use client';

export default function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="skeleton w-9 h-9 rounded-full" />
                        <div className="space-y-2">
                            <div className="skeleton w-28 h-4 rounded" />
                            <div className="skeleton w-16 h-3 rounded" />
                        </div>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="skeleton w-full h-4 rounded" />
                        <div className="skeleton w-4/5 h-4 rounded" />
                        <div className="skeleton w-3/5 h-4 rounded" />
                    </div>
                    <div className="flex gap-3 pt-3 border-t border-white/5">
                        <div className="skeleton w-16 h-8 rounded-xl" />
                        <div className="skeleton w-16 h-8 rounded-xl" />
                    </div>
                </div>
            ))}
        </div>
    );
}
