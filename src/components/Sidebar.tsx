import React from 'react';
import { ChevronDown, Check, User, Shield, LogOut, Cloud } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { SidebarNavigation } from './SidebarNavigation';
import { CategoryList } from './CategoryList';
import { SidebarPromoCard } from './SidebarPromoCard';
import { NavView, NoteCategory } from '../types/note';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentView: NavView;
  selectedCategory: NoteCategory | null;
  onSelectView: (view: NavView) => void;
  onSelectCategory: (category: NoteCategory | null) => void;
  allCount: number;
  favoritesCount: number;
  trashCount: number;
  categoryCounts: Record<NoteCategory, number>;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  selectedCategory,
  onSelectView,
  onSelectCategory,
  allCount,
  favoritesCount,
  trashCount,
  categoryCounts,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const { user, logout, driveConnected, requestDrivePermission } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  // Compute initials fallback
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[284px] bg-[#151F30] border-r border-[#1E2B42]/50 flex flex-col justify-between select-none transition-transform duration-300 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Scrollable upper section */}
        <div className="flex-1 overflow-y-auto px-[22px] pt-[24px] pb-4 custom-scrollbar">
          {/* Brand Logo Row */}
          <div className="mb-8">
            <BrandLogo size={32} />
          </div>

          {/* Navigation Links */}
          <SidebarNavigation
            currentView={currentView}
            selectedCategory={selectedCategory}
            onSelectView={(view) => {
              onSelectView(view);
              onCloseMobile?.();
            }}
            allCount={allCount}
            favoritesCount={favoritesCount}
            trashCount={trashCount}
          />

          {/* Categories */}
          <CategoryList
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              onSelectCategory(cat);
              onCloseMobile?.();
            }}
            categoryCounts={categoryCounts}
          />

          {/* Spacing before Promo Card */}
          <div className="mt-8 mb-4">
            <SidebarPromoCard />
          </div>
        </div>

        {/* User Profile anchored at bottom with Google authenticated user info */}
        <div className="relative px-4 py-3 border-t border-[#1F2D48] bg-[#131C2D]">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#1C273C] transition-colors group"
            aria-label="User Account Menu"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Google Profile Photo with Initials Fallback */}
              {user?.picture && !imageError ? (
                <img
                  src={user.picture}
                  alt={user.name || 'User avatar'}
                  onError={() => setImageError(true)}
                  className="w-[36px] h-[36px] rounded-full object-cover shadow-sm flex-shrink-0 ring-1 ring-white/20"
                />
              ) : (
                <div className="w-[36px] h-[36px] rounded-full bg-[#6654FF] text-white font-bold text-[14px] flex items-center justify-center shadow-sm flex-shrink-0">
                  {getInitials(user?.name)}
                </div>
              )}

              <div className="text-left min-w-0">
                <span className="text-[14px] font-medium text-[#F4F6FF] group-hover:text-white block leading-tight truncate">
                  {user?.name || 'Google User'}
                </span>
                <span className="text-[11px] text-[#8093BB] block leading-tight truncate">
                  {user?.email || 'Google Account'}
                </span>
              </div>
            </div>

            <ChevronDown
              className={`w-4 h-4 text-[#8093BB] transition-transform duration-200 flex-shrink-0 ${
                profileMenuOpen ? 'rotate-180 text-white' : 'group-hover:text-white'
              }`}
            />
          </button>

          {/* Profile Popover Menu */}
          {profileMenuOpen && (
            <div className="absolute bottom-[66px] left-4 right-4 bg-[#1E2B44] border border-[#2D3F63] rounded-xl shadow-2xl p-2 z-50 text-[13px] text-[#C5CEE4] space-y-1 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-[#2D3F63]/80">
                <p className="font-semibold text-white truncate">{user?.name || 'Google Account'}</p>
                <p className="text-[11px] text-[#8093BB] truncate">{user?.email || 'Authenticated via Google'}</p>
              </div>

              <div className="py-1">
                <div className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-[#273858] cursor-default">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#8EA7E9]" />
                    <span>Google Sign-In</span>
                  </div>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>

                <div className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-[#273858] cursor-default">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-[#8EA7E9]" />
                    <span>Account Storage</span>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded">Isolated</span>
                </div>

                <div
                  onClick={!driveConnected ? requestDrivePermission : undefined}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg transition-colors ${
                    !driveConnected ? 'hover:bg-[#273858] cursor-pointer' : 'cursor-default'
                  }`}
                  title={driveConnected ? "Notes auto-sync to 'NoteNest' folder in Google Drive" : "Click to connect Google Drive"}
                >
                  <div className="flex items-center gap-2">
                    <Cloud className="w-3.5 h-3.5 text-[#8EA7E9]" />
                    <span>Google Drive</span>
                  </div>
                  {driveConnected ? (
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded font-medium">Synced</span>
                  ) : (
                    <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded font-medium hover:underline">Connect</span>
                  )}
                </div>
              </div>

              {/* Working Logout Action */}
              <div className="pt-1 border-t border-[#2D3F63]/80">
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 transition-colors cursor-pointer text-left font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out of NoteNest</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
