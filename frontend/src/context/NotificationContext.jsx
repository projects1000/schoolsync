import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children, currentUser }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        if (!currentUser || !currentUser.token) return;
        try {
            const response = await axios.get("http://localhost:8082/api/notifications", {
                headers: { Authorization: `Bearer ${currentUser.token}` },
            });
            setNotifications(response.data);
            setUnreadCount(response.data.filter((n) => !n.isRead).length); // Backend uses isRead
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const markAsRead = async (id) => {
        if (!currentUser || !currentUser.token) return;
        try {
            await axios.put(`http://localhost:8082/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${currentUser.token}` },
            });
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
            await axios.put(`http://localhost:8082/api/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${currentUser.token}` },
            });
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
