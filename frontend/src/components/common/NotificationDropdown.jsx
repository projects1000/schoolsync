import React, { useState } from 'react';
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotification } from '@/context/NotificationContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = () => {
    // Check if useNotification is available, otherwise use a fallback or return null
    // Since we are wrapping the app with provider, it should be available.
    // However, if the context is not yet fully initialized or if fetchNotifications fails, handles gracefully.

    const notificationContext = useNotification();

    // Guard clause if context is undefined (e.g. forgot provider)
    if (!notificationContext) {
        return (
            <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-gray-500" />
            </Button>
        );
    }

    const { notifications, unreadCount, markAsRead, markAllAsRead } = notificationContext;
    const [isOpen, setIsOpen] = useState(false);

    const getIcon = (type) => {
        switch (type) {
            case 'WARNING': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'ERROR': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 sm:w-96" align="end">
                <div className="flex items-center justify-between px-4 py-2">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-6 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={(e) => {
                                e.preventDefault();
                                markAllAsRead();
                            }}
                        >
                            Mark all read
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />

                <div className="max-h-[70vh] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "flex flex-col items-start gap-1 p-4 cursor-pointer focus:bg-gray-50",
                                    !notification.isRead && "bg-blue-50/50"
                                )}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="flex w-full gap-3">
                                    <div className="mt-0.5 shrink-0">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className={cn("text-sm font-medium leading-none", !notification.isRead && "text-blue-700")}>
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-gray-400">
                                            {notification.createdAt && formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <div className="shrink-0 self-center">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        </div>
                                    )}
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationDropdown;
