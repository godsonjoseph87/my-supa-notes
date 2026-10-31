import React from 'react';
import { Bell, Trash2, Info, Lightbulb, CheckCircle2 } from 'lucide-react';
import { NotificationItem } from '../types/note';

interface NotificationsPopoverProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  isOpen,
  onClose
}) => {
  const popoverRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div
      ref={popoverRef}
      className="absolute top-[62px] right-6 w-[340px] max-w-[92vw] bg-white dark:bg-[#1A233A] border border-[#E9EDF5] dark:border-[#283655] rounded-2xl shadow-popover z-50 p-3.5 animate-in fade-in slide-in-from-top-2 duration-150 select-none"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#E9EDF5] dark:border-[#283655]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#5145FF]" />
          <h3 className="text-[14.5px] font-bold text-[#142039] dark:text-white">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="text-[11px] font-semibold bg-[#5145FF] text-white px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-[12px] text-[#5145FF] hover:underline font-medium px-1.5 py-0.5 rounded transition-colors"
              title="Mark all as read"
            >
              Mark read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="p-1 text-[#8E9EB5] hover:text-rose-500 rounded transition-colors"
              title="Clear all notifications"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto divide-y divide-[#E9EDF5]/60 dark:divide-[#283655]/60 py-1">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-[#8E9EB5] text-[13px]">
            No notifications right now
          </div>
        ) : (
          notifications.map((item) => {
            const getIcon = () => {
              if (item.type === 'tip') return <Lightbulb className="w-4 h-4 text-amber-500" />;
              if (item.type === 'success') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
              return <Info className="w-4 h-4 text-[#5145FF]" />;
            };

            return (
              <div
                key={item.id}
                onClick={() => onMarkAsRead(item.id)}
                className={`py-2.5 px-2 rounded-xl transition-colors cursor-pointer flex items-start gap-2.5 ${
                  item.read
                    ? 'opacity-70 hover:opacity-100 hover:bg-[#F6F8FC] dark:hover:bg-[#151F30]'
                    : 'bg-[#F0EDFF]/50 dark:bg-[#1E2845] hover:bg-[#F0EDFF] dark:hover:bg-[#253255]'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">{getIcon()}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-[13px] font-semibold text-[#142039] dark:text-[#F1F5F9] truncate">
                      {item.title}
                    </h4>
                    <span className="text-[11px] text-[#8E9EB5] flex-shrink-0">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#42577D] dark:text-[#94A3B8] leading-relaxed mt-0.5">
                    {item.message}
                  </p>
                </div>
                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-[#5145FF] mt-1.5 flex-shrink-0" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
