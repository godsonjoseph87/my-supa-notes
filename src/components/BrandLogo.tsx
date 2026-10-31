import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 32 }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Feather/Quill Vector Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform hover:scale-105 duration-200"
      >
        <defs>
          <linearGradient id="featherGrad" x1="4" y1="32" x2="32" y2="4" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
          <linearGradient id="featherSpine" x1="6" y1="30" x2="30" y2="6" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#E0E7FF" />
          </linearGradient>
          <linearGradient id="featherLight" x1="10" y1="6" x2="26" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Outer Feather Blade (Smooth modern curve) */}
        <path
          d="M6 30C8.5 24 10 16 17 9C23 3 28.5 4 30 5C31.5 6.5 32 12 26 18C19 25 11 26.5 6 30Z"
          fill="url(#featherGrad)"
        />

        {/* Left inner illuminated facet */}
        <path
          d="M6 30C10 24 14 17 21 12C26 8.5 29 7.5 30 5C26 7 18 10 12 17C8.5 21 6.8 26 6 30Z"
          fill="url(#featherLight)"
        />

        {/* Center Quill / Spine with gentle curve */}
        <path
          d="M5.5 30.5C9 25 15 17 29.5 5.5"
          stroke="url(#featherSpine)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Small subtle accent barbs */}
        <path
          d="M14 20L11 22M19 14.5L16 16.5M24 9.5L22 11"
          stroke="#FFFFFF"
          strokeOpacity="0.4"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>

      <span className="text-[21px] font-bold tracking-tight text-white select-none">
        NoteNest
      </span>
    </div>
  );
};

