import React from 'react';

const ReasonsList = ({ reasons, limit = 5 }) => {
  if (!reasons || reasons.length === 0) return null;

  const displayReasons = reasons.slice(0, limit);

  return (
    <ul className="space-y-3">
      {displayReasons.map((reason, index) => (
        <li
          key={index}
          className="flex items-start gap-3 text-sm leading-relaxed text-[#5B6475]"
        >
          <span className="mt-1 text-emerald-500 select-none">
            ✦
          </span>
          <span className="flex-1 break-words">
            {reason}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default ReasonsList;
