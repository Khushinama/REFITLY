import React from 'react';
import { Sparkles } from 'lucide-react';
import { formatScore } from '../../utils/formatters';

const MatchScoreBadge = ({ score }) => {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[rgba(129,166,198,0.2)] shadow-sm">
      <Sparkles className="w-3.5 h-3.5 text-[#81A6C6]" />
      <span className="text-xs font-bold text-[#81A6C6] uppercase tracking-wider">
        {formatScore(score)} Match
      </span>
    </div>
  );
};

export default MatchScoreBadge;
