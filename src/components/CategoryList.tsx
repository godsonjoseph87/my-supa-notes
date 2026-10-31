import React from 'react';
import { NoteCategory } from '../types/note';

interface CategoryListProps {
  selectedCategory: NoteCategory | null;
  onSelectCategory: (category: NoteCategory | null) => void;
  categoryCounts: Record<NoteCategory, number>;
}

export const CATEGORY_CONFIG: Record<
  NoteCategory,
  { dotColor: string; bgClass: string; textClass: string; darkBgClass: string }
> = {
  Work: {
    dotColor: '#1E88E5',
    bgClass: 'bg-[#DCEAFF]',
    textClass: 'text-[#1769E8]',
    darkBgClass: 'dark:bg-blue-950/60 dark:text-blue-300'
  },
  Personal: {
    dotColor: '#2ED18C',
    bgClass: 'bg-[#D6F8E7]',
    textClass: 'text-[#14844F]',
    darkBgClass: 'dark:bg-emerald-950/60 dark:text-emerald-300'
  },
  Ideas: {
    dotColor: '#9850FF',
    bgClass: 'bg-[#EBDDFF]',
    textClass: 'text-[#783DE8]',
    darkBgClass: 'dark:bg-purple-950/60 dark:text-purple-300'
  },
  Learning: {
    dotColor: '#FFA343',
    bgClass: 'bg-[#FFE8CC]',
    textClass: 'text-[#B85D00]',
    darkBgClass: 'dark:bg-amber-950/60 dark:text-amber-300'
  },
  Others: {
    dotColor: '#8E9EB5',
    bgClass: 'bg-[#E5EAF4]',
    textClass: 'text-[#3C4D6B]',
    darkBgClass: 'dark:bg-slate-800 dark:text-slate-300'
  }
};

export const CategoryList: React.FC<CategoryListProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts
}) => {
  const categories: NoteCategory[] = ['Work', 'Personal', 'Ideas', 'Learning', 'Others'];

  return (
    <div className="mt-7">
      <div className="px-3.5 mb-2.5">
        <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-[#7183A6]">
          Categories
        </h4>
      </div>

      <div className="space-y-1">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const config = CATEGORY_CONFIG[cat];
          const count = categoryCounts[cat] || 0;

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(isSelected ? null : cat)}
              className={`w-full h-[40px] px-3.5 rounded-xl flex items-center justify-between text-[14px] font-medium transition-colors duration-150 group ${
                isSelected
                  ? 'bg-[#303B59] text-[#F4F6FF]'
                  : 'text-[#C5CEE4] hover:bg-[#1E2B42] hover:text-[#FFFFFF]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: config.dotColor }}
                />
                <span>{cat}</span>
              </div>

              <span
                className={`text-[12px] px-2 py-0.5 rounded-full font-semibold transition-colors ${
                  isSelected
                    ? 'bg-[#1C273C] text-[#C5CEE4]'
                    : 'bg-[#182338] text-[#8093BB] group-hover:text-[#C5CEE4]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
