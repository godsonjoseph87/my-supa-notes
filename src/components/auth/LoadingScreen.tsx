import React from 'react';
import { BrandLogo } from '../BrandLogo';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#151F30] text-white select-none">
      <div className="flex flex-col items-center gap-6 animate-pulse">
        <BrandLogo size={48} />
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#6654FF] animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-[#8A76FA] animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-[#C4B5FD] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-[#8093BB] text-[13px] tracking-wide font-medium">
          Verifying session...
        </p>
      </div>
    </div>
  );
};

