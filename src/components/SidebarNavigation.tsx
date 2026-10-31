import React from 'react';
import { Star, Clock, Trash2 } from 'lucide-react';
import { NavView } from '../types/note';

interface SidebarNavigationProps {
  currentView: NavView;
  selectedCategory: string | null;
  onSelectView: (view: NavView) => void;
  allCount: number;
  favoritesCount: number;
  trashCount: number;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  currentView,
  selectedCategory,
  onSelectView,
  allCount,
  favoritesCount,
  trashCount
}) => {
  // Custom Notebook Icon matching the screenshot's icon exactly
  const NotebookIcon = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-shrink-0"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10" />
      <path d="M6 10h10" />
      <path d="M6 14h6" />
    </svg>
  );

  const navItems = [
    {
      id: 'all' as NavView,
      label: 'All Notes',
      icon: <NotebookIcon />,
      count: allCount,
      showCount: true
    },
    {
      id: 'favorites' as NavView,
      label: 'Favorites',
      icon: <Star className="w-[18px] h-[18px]" />,
      count: favoritesCount,
      showCount: true
    },
    {
      id: 'recent' as NavView,
      label: 'Recent',
      icon: <Clock className="w-[18px] h-[18px]" />,
      count: 0,
      showCount: false
    },
    {
      id: 'trash' as NavView,
      label: 'Trash',
      icon: <Trash2 className="w-[18px] h-[18px]" />,
      count: trashCount,
      showCount: trashCount > 0
    }
  ];

  return (
    <nav className="space-y-1.5" aria-label="Main Navigation">
      {navItems.map((item) => {
        const isActive = currentView === item.id && selectedCategory === null;
        return (
          <button
            key={item.id}
            onClick={() => onSelectView(item.id)}
            className={`w-full h-[46px] px-3.5 rounded-xl flex items-center justify-between text-[14.5px] font-medium transition-colors duration-150 group ${
              isActive
                ? 'bg-[#303B59] text-[#F4F6FF] shadow-sm'
                : 'text-[#C5CEE4] hover:bg-[#1E2B42] hover:text-[#FFFFFF]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`transition-colors ${isActive ? 'text-[#8EA7E9]' : 'text-[#8093BB] group-hover:text-[#C5CEE4]'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>

            {item.showCount && (
              <span
                className={`text-[12px] px-2 py-0.5 rounded-full font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#1C273C] text-[#C5CEE4]'
                    : 'bg-[#182338] text-[#8093BB] group-hover:text-[#C5CEE4]'
                }`}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
