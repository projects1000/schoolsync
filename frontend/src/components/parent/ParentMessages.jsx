import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useParent } from '@/context/ParentContext';
import api from '@/services/api';

const ParentMessages = ({ currentUser }) => {
    const { toast } = useToast();
    const { selectedChild } = useParent();
    const [messages, setMessages] = useState([]);

    const messagesQuery = useQuery({
        queryKey: ['parent', 'messages', selectedChild?.id],
        queryFn: () => api.get(`/parent/messages/${selectedChild.id}`),
        enabled: Boolean(selectedChild?.id),
        staleTime: 1000 * 60,
    });

    useEffect(() => {
        if (!messagesQuery.data) return;
        setMessages(messagesQuery.data.data || []);
    }, [messagesQuery.data]);

    useEffect(() => {
        if (!messagesQuery.error) return;
        console.error('Error fetching messages:', messagesQuery.error);
        toast({
            title: 'Error',
            description: 'Failed to load messages',
            variant: 'destructive'
        });
        setMessages([]);
    }, [messagesQuery.error, toast]);

    const isLoading = messagesQuery.isLoading || messagesQuery.isFetching;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    if (!selectedChild) {
        return null; // ParentProvider handles selection screen
    }

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="h-7 bg-gray-200 rounded w-40 mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-64" />
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-36 mb-1" />
                                    <div className="h-3 bg-gray-100 rounded w-24" />
                                </div>
                                <div className="h-3 bg-gray-100 rounded w-16" />
                            </div>
                            <div className="ml-13 h-12 bg-gray-50 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
                        <p className="text-gray-600 mt-1">Communicate with {selectedChild.name}'s teacher</p>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Inbox</h3>
                    {messages.length === 0 ? (
                        <div className="text-center py-10">
                            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p className="text-gray-500">No messages yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                                <MessageSquare className="w-4 h-4 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{message.senderName || 'Teacher'}</p>
                                                <p className="text-xs text-gray-500">{formatDate(message.createdAt)}</p>
                                            </div>
                                        </div>
                                        {message.recipientId === 'ALL' && (
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                Broadcast
                                            </span>
                                        )}
                                    </div>
                                    <div className="ml-10">
                                        {message.subject && (
                                            <p className="font-semibold text-gray-900 text-sm mb-1">
                                                {message.subject}
                                            </p>
                                        )}
                                        <p className="text-gray-700 text-sm">{message.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ParentMessages;
