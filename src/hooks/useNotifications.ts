import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSocket } from "@/src/context/socketProvider";
import { addNotification, setUnreadCount, INotification } from "@/src/redux/features/notification/notificationSlice";
import { useGetUnreadNotificationCountQuery } from "@/src/redux/features/notification/notificationApi";

/**
 * Real-time notification hook that:
 * - Connects to Socket.IO notifications
 * - Updates Redux store with new notifications
 * - Syncs unread count
 */
export const useNotifications = () => {
  const socket = useSocket();
  const dispatch = useDispatch();
  const { data: unreadData } = useGetUnreadNotificationCountQuery(undefined, {
    pollingInterval: 60000, // Fallback: poll every minute
  });

  // Sync unread count from API
  useEffect(() => {
    if (unreadData?.data?.count !== undefined) {
      dispatch(setUnreadCount(unreadData.data.count));
    }
  }, [unreadData, dispatch]);

  // Real-time notification listener
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notification: INotification) => {
      dispatch(addNotification(notification));

      // Play sound or show browser notification (optional)
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.body || undefined,
          icon: notification.actor?.image || "/logo/logo.png",
          tag: notification._id,
        });
      }
    };

    socket.on("notification received", handleNotification);

    return () => {
      socket.off("notification received", handleNotification);
    };
  }, [socket, dispatch]);

  // Request browser notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);
};
