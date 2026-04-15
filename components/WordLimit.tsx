"use client";

import { useState } from "react";

interface WordLimitProps {
  current: number;
  max: number;
  tier: string;
}

export default function WordLimit({ current, max, tier }: WordLimitProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const pct = Math.min((current / max) * 100, 100);
  const isOver = current > max;
  const barColor = isOver
    ? "bg-red-500"
    : pct > 80
      ? "bg-amber-500"
      : "bg-emerald-500/50";

  return (
    <div className="relative flex items-center gap-2">
      <span className={`text-xs ${isOver ? "text-red-400 font-medium" : "text-slate-600"}`}>
        {current.toLocaleString()}/{max.toLocaleString()} chars
      </span>

      {/* Mini progress bar */}
      <div className="w-16 h-1 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Info icon with tooltip */}
      <div
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="text-[10px] text-slate-600 cursor-help select-none bg-white/5 rounded-full w-4 h-4 inline-flex items-center justify-center">
          ?
        </span>

        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-[#1a1a2e] border border-white/10 rounded-xl text-xs text-slate-300 shadow-xl z-50">
            <div className="font-medium text-white mb-1.5">
              {tier === "free" ? "Free" : tier.charAt(0).toUpperCase() + tier.slice(1)} Plan Limit
            </div>
            <p className="leading-relaxed mb-2">
              Your plan allows up to <span className="text-amber-400 font-medium">{max.toLocaleString()} characters</span> per submission. This limit resets daily at midnight UTC.
            </p>
            {tier !== "max" && (
              <a href="/pricing" className="text-amber-400 hover:underline font-medium">
                Upgrade for more →
              </a>
            )}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a1a2e]" />
          </div>
        )}
      </div>
    </div>
  );
}
