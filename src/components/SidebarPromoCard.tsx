import React from 'react';
import { Sparkles } from 'lucide-react';

export const SidebarPromoCard: React.FC = () => {
  return (
    <div className="relative w-full h-[250px] rounded-2xl overflow-hidden bg-[#1B2949] border border-white/5 flex flex-col justify-between p-5 select-none shadow-lg">
      {/* Background Mountain Polygonal Artwork */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 240 250"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients for mountain facets */}
          <linearGradient id="skyGrad" x1="120" y1="0" x2="120" y2="250" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1B2949" />
            <stop offset="55%" stopColor="#1C2746" />
            <stop offset="100%" stopColor="#111B33" />
          </linearGradient>

          <linearGradient id="backPeakGrad" x1="60" y1="130" x2="180" y2="230" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2D2B69" />
            <stop offset="100%" stopColor="#1A1B43" />
          </linearGradient>

          <linearGradient id="mainPeakLit" x1="160" y1="140" x2="200" y2="230" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8A76FA" />
            <stop offset="60%" stopColor="#5E49DF" />
            <stop offset="100%" stopColor="#3B2FA0" />
          </linearGradient>

          <linearGradient id="mainPeakShadow" x1="190" y1="140" x2="240" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#302868" />
            <stop offset="100%" stopColor="#171638" />
          </linearGradient>

          <linearGradient id="leftPeakLit" x1="40" y1="170" x2="90" y2="250" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6C55F2" />
            <stop offset="100%" stopColor="#372D85" />
          </linearGradient>

          <linearGradient id="frontRidge" x1="80" y1="200" x2="160" y2="250" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#483B9E" />
            <stop offset="100%" stopColor="#1F1C4E" />
          </linearGradient>
        </defs>

        {/* Base Sky */}
        <rect width="240" height="250" fill="url(#skyGrad)" />

        {/* Distant Stars / Stardust */}
        <circle cx="35" cy="55" r="1" fill="#FFFFFF" fillOpacity="0.4" />
        <circle cx="195" cy="45" r="1.2" fill="#C4B5FD" fillOpacity="0.6" />
        <circle cx="215" cy="85" r="0.8" fill="#FFFFFF" fillOpacity="0.3" />
        <circle cx="165" cy="110" r="1" fill="#A5B4FC" fillOpacity="0.5" />
        <circle cx="50" cy="120" r="0.8" fill="#FFFFFF" fillOpacity="0.25" />

        {/* Far Background Mountain Silhouette (Dark Indigo) */}
        <polygon
          points="0,175 45,150 90,170 145,135 195,165 240,140 240,250 0,250"
          fill="#1E244B"
          fillOpacity="0.9"
        />

        {/* Midground Layer 1 */}
        <polygon
          points="0,205 35,175 75,190 125,155 170,185 240,150 240,250 0,250"
          fill="url(#backPeakGrad)"
        />

        {/* Prominent Right/Center Peak - Shaded Facet */}
        <polygon
          points="185,145 240,195 240,250 170,250"
          fill="url(#mainPeakShadow)"
        />

        {/* Prominent Right/Center Peak - Illuminated Facet */}
        <polygon
          points="185,145 125,210 175,250 215,220"
          fill="url(#mainPeakLit)"
        />

        {/* Ridge Highlight Line for Main Peak */}
        <polyline
          points="185,145 170,250"
          stroke="#C7D2FE"
          strokeOpacity="0.6"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Left Prominent Peak */}
        <polygon
          points="25,180 80,165 110,215 15,245"
          fill="url(#leftPeakLit)"
        />
        <polygon
          points="80,165 130,210 100,250 25,250"
          fill="#2C2462"
          fillOpacity="0.85"
        />

        {/* Foreground Sharp Ridges */}
        <polygon
          points="0,225 60,205 115,225 155,200 210,235 240,215 240,250 0,250"
          fill="url(#frontRidge)"
        />

        {/* Bottom Ambient Glow Blend */}
        <rect y="235" width="240" height="15" fill="#12182E" fillOpacity="0.75" />
      </svg>

      {/* Top Sparkle and Content */}
      <div className="relative z-10">
        <div className="inline-flex items-center justify-center text-[#A78BFA] mb-2.5">
          <Sparkles className="w-[18px] h-[18px]" />
        </div>

        <h3 className="text-white text-[17px] font-bold leading-[1.25] tracking-tight">
          Small notes<br />make big ideas.
        </h3>

        <p className="text-[#8F9EB8] text-[12.5px] leading-[1.38] mt-2 font-normal">
          Capture your thoughts,<br />turn them into progress.
        </p>
      </div>

      {/* Bottom spacer to preserve view of mountain peaks */}
      <div className="h-14 pointer-events-none" />
    </div>
  );
};
