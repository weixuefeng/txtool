"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type NotificationType = "info" | "success" | "error";

interface NotificationProps {
  message: string;
  type?: NotificationType;
  duration?: number;
  onClose?: () => void;
}

export const Notification: React.FC<NotificationProps> = ({
  message,
  type = "info",
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        "notification",
        type,
        isVisible ? "animate-fadeIn" : "animate-fadeOut"
      )}
    >
      <span>{message}</span>
      <button
        className="notification-close"
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => {
            onClose?.();
          }, 300);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
};

interface NotificationContainerProps {
  children: React.ReactNode;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  children,
}) => {
  return <div className="notification-container">{children}</div>;
};

interface UseNotificationOptions {
  duration?: number;
}

interface NotificationState {
  id: string;
  message: string;
  type: NotificationType;
  duration: number;
}

export const useNotification = (options: UseNotificationOptions = {}) => {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  const addNotification = (
    message: string,
    type: NotificationType = "info",
    duration = options.duration || 5000
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [
      ...prev,
      { id, message, type, duration },
    ]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const notificationElements = (
    <NotificationContainer>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </NotificationContainer>
  );

  return {
    notifications,
    addNotification,
    removeNotification,
    notificationElements,
    showSuccess: (message: string, duration?: number) =>
      addNotification(message, "success", duration),
    showError: (message: string, duration?: number) =>
      addNotification(message, "error", duration),
    showInfo: (message: string, duration?: number) =>
      addNotification(message, "info", duration),
  };
};