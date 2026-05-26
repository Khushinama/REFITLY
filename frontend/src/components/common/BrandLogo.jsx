import React from 'react';
import logo from '../../assets/logo-icon.png';

/**
 * ReFitly Reusable Brand Logo Component
 */
const BrandLogo = ({
  usePublic = false,  // Uses public/assets/logo/logo-icon.png path instead of imported src/assets
  className = '',
  onClick,
  alt = 'ReFitly'
}) => {
  // Select the appropriate source path
  const logoSrc = usePublic ? '/assets/logo/logo-icon.png' : logo;

  // Interactive style class helper
  const interactiveClasses = onClick
    ? 'cursor-pointer transition-all duration-300 ease-out hover:opacity-90 active:scale-[0.98]'
    : 'transition-opacity duration-300';

  return (
    <img
      src={logoSrc}
      alt={alt}
      onClick={onClick}
      className={`w-[85px] md:w-[95px] lg:w-[130px] h-auto object-contain select-none ${interactiveClasses} ${className}`.trim()}
      loading="lazy"
    />
  );
};

export default BrandLogo;
