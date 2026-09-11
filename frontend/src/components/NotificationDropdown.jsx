import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Calendar,
  Sparkles,
  Info,
  ExternalLink,
} from 'lucide-react';
import { notificationsAPI } from '../services/api';

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchUnread = async () => {
    if (!token) return;
    try {
      const res = await notificationsAPI.getUnreadCount();
      setUnreadCount(res.unread_count || 0);
    } catch {
      // ignore
    }
  };

  const fetchNotifications = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const list = await notificationsAPI.getMyNotifications(20);
      setNotifications(Array.isArray(list) ? list : []);
      fetchUnread();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // refresh count every 30s
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationsAPI.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      fetchUnread();
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.is_read) {
      notificationsAPI.markAsRead(notif.id).catch(() => {});
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'interview':
        return <Calendar className="w-4 h-4 text-purple-400" />;
      case 'application_status':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (!token) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-black ring-2 ring-[#070b13] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0f172a] border border-gray-800 shadow-2xl z-50 overflow-hidden animate-[fadeIn_0.15s_ease-out]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/80 bg-[#0a0f1a]/80">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-white text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            {notifications.some((n) => !n.is_read) && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-gray-400 hover:text-emerald-400 flex items-center space-x-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-800/50">
            {loading ? (
              <div className="p-6 text-center text-sm text-gray-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2 opacity-50" />
                No notifications yet
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 flex items-start space-x-3 transition-colors cursor-pointer group ${
                    notif.is_read
                      ? 'bg-transparent hover:bg-white/[0.03]'
                      : 'bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08]'
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-gray-800/80 border border-gray-700/50 flex-shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-xs font-semibold truncate ${
                          notif.is_read ? 'text-gray-300' : 'text-white'
                        }`}
                      >
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">
                        {formatTime(notif.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {!notif.is_read && (
                      <button
                        onClick={(e) => handleMarkRead(notif.id, e)}
                        className="p-1 text-gray-400 hover:text-emerald-400 rounded transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(notif.id, e)}
                      className="p-1 text-gray-400 hover:text-red-400 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
