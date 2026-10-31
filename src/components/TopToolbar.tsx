import React from 'react';
import { Sun, Moon, Bell, Menu } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { NotificationsPopover } from './NotificationsPopover';
import { NotificationItem } from '../types/note';

interface TopToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  notifications: NotificationItem[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onClearNotifications: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement>;
  onToggleSidebarMobile?: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  searchQuery,
  onSearchChange,
  theme,
  onToggleTheme,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onClearNotifications,
  searchInputRef,
  onToggleSidebarMobile
}) => {
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="relative h-[72px] bg-white dark:bg-[#1A233A] border-b border-[#E9EDF5] dark:border-[#283655] px-6 flex items-center justify-between gap-4 z-30 transition-colors">
      <div className="flex items-center gap-3 flex-1 max-w-[620px]">
        {/* Mobile menu button */}
        <button
          onClick={onToggleSidebarMobile}
          className="p-2 -ml-2 text-[#42577D] hover:text-[#142039] lg:hidden rounded-lg hover:bg-[#F6F8FC] dark:text-[#94A3B8] dark:hover:text-white"
          aria-label="Toggle Sidebar Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search input field */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          inputRef={searchInputRef}
        />
      </div>

      {/* Right Utility Controls */}
      <div className="flex items-center gap-2 relative">
        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#42577D] dark:text-[#C5CEE4] hover:bg-[#F6F8FC] dark:hover:bg-[#253255] transition-colors"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          aria-label="Toggle theme mode"
        >
          {theme === 'light' ? (
            <Sun className="w-[20px] h-[20px] text-[#42577D] hover:text-[#142039] transition-colors" />
          ) : (
            <Moon className="w-[20px] h-[20px] text-[#A78BFA] transition-colors" />
          )}
        </button>

        {/* Notifications Button */}
        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="relative w-10 h-10 rounded-xl flex items-center justify-center text-[#42577D] dark:text-[#C5CEE4] hover:bg-[#F6F8FC] dark:hover:bg-[#253255] transition-colors"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-[20px] h-[20px]" />
          {/* Red notification dot */}
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#EF4444] ring-2 ring-white dark:ring-[#1A233A]" />
          )}
        </button>

        {/* Notifications Popover Dropdown */}
        <NotificationsPopover
          notifications={notifications}
          onMarkAsRead={onMarkNotificationAsRead}
          onMarkAllAsRead={onMarkAllNotificationsAsRead}
          onClearAll={onClearNotifications}
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
        />
      </div>
    </header>
  );
};

