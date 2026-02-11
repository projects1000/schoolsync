import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/services/api";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children, currentUser }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        if (!currentUser || !currentUser.token) return;
        try {
            const response = await api.get("/notifications");
            setNotifications(response.data);
            setUnreadCount(response.data.filter((n) => !n.isRead).length); // Backend uses isRead
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const markAsRead = async (id) => {
        if (!currentUser || !currentUser.token) return;
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const markAllAsRead = async () => {
        if (!currentUser || !currentUser.token) return;
        try {
            await api.put(`/notifications/read-all`);
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [currentUser]);

    return (
        <NotificationContext.Provider
            value={{ notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
