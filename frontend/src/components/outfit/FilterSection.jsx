import React from 'react';

const FilterSection = ({ title, children, isCollapsible = false }) => {
  return (
    <div className="mb-8 last:mb-0">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 px-1">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  );
};

export default FilterSection;
