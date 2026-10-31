import React from 'react';

interface EditorCalloutProps {
  question?: string;
  supportingText?: string;
}

export const EditorCallout: React.FC<EditorCalloutProps> = ({
  question = 'Which one should I build first?',
  supportingText = "Let's decide based on your interest and available time!"
}) => {
  return (
    <div className="mt-8 p-4 px-5 rounded-2xl bg-[#F0F4FC] dark:bg-[#1D2640] border border-[#DFE7F5] dark:border-[#2C3A5E] flex items-center gap-3.5 select-none shadow-sm">
      <span className="text-[22px] flex-shrink-0 select-none">💡</span>
      <p className="text-[14px] leading-relaxed">
        <strong className="font-bold italic text-[#142039] dark:text-[#F1F5F9] mr-1.5">
          {question}
        </strong>
        <span className="italic text-[#42577D] dark:text-[#94A3B8]">
          {supportingText}
        </span>
      </p>
    </div>
  );
};

