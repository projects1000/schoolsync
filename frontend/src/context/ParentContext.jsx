import React, { createContext, useContext, useState, useEffect } from 'react';
import parentService from '@/services/parentService';
import { useToast } from '@/components/ui/use-toast';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const ParentContext = createContext();

export const useParent = () => {
    const context = useContext(ParentContext);
    // Return empty state if not within a provider or not a parent
    return context || { childrenList: [], selectedChild: null, isLoading: false };
};

// Key for localStorage
const SELECTED_CHILD_KEY = 'schoolsync_selected_child';

export const ParentProvider = ({ children: routeChildren, currentUser }) => {
    const { toast } = useToast();
    const [childrenList, setChildrenList] = useState([]);
    const [selectedChild, setSelectedChild] = useState(() => {
        // Initialize from localStorage
        const stored = localStorage.getItem(SELECTED_CHILD_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                return null;
            }
        }
        return null;
    });
    const [isLoading, setIsLoading] = useState(false);

    const isParent = currentUser?.role === 'parent';

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                setIsLoading(true);
                const data = await parentService.getMyChildren();
                setChildrenList(data);

                // If there's a stored selection, verify it's still valid
                const storedChild = localStorage.getItem(SELECTED_CHILD_KEY);
                if (storedChild) {
                    try {
                        const parsed = JSON.parse(storedChild);
                        const isValid = data.some(c => c.id === parsed.id);
                        if (isValid) {
                            // Update with fresh data
                            const freshChild = data.find(c => c.id === parsed.id);
                            setSelectedChild(freshChild);
                        } else {
                            // Clear invalid selection
                            localStorage.removeItem(SELECTED_CHILD_KEY);
                            setSelectedChild(null);
                        }
                    } catch (e) {
                        localStorage.removeItem(SELECTED_CHILD_KEY);
                        setSelectedChild(null);
                    }
                } else if (data.length === 1) {
                    // Auto-select if only one child
                    setSelectedChild(data[0]);
                    localStorage.setItem(SELECTED_CHILD_KEY, JSON.stringify(data[0]));
                }
            } catch (error) {
                console.error('Error fetching children:', error);
                toast({
                    title: "Error",
                    description: "Failed to load children profiles",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (isParent) {
            fetchChildren();
        }
    }, [isParent, toast]);

    const handleChildSelect = (child) => {
        setSelectedChild(child);
        // Persist to localStorage
        localStorage.setItem(SELECTED_CHILD_KEY, JSON.stringify(child));
    };

    // Function to change child (can be used in header/sidebar)
    const changeChild = () => {
        localStorage.removeItem(SELECTED_CHILD_KEY);
        setSelectedChild(null);
    };

    // If not a parent, just render children
    if (!isParent) {
        return (
            <ParentContext.Provider value={{ childrenList: [], selectedChild: null, isLoading: false }}>
                {routeChildren}
            </ParentContext.Provider>
        );
    }

    // Global Selection Interface - only show if no child is selected AND there are multiple children
    if (!isLoading && !selectedChild && childrenList.length > 1) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-gray-50">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome, {currentUser?.name}!</h1>
                    <p className="text-lg text-gray-600">Please select a child to view their dashboard</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl w-full">
                    {childrenList.map(child => (
                        <motion.div
                            key={child.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleChildSelect(child)}
                            className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer border-2 border-transparent hover:border-purple-500 transition-all flex flex-col items-center text-center space-y-6"
                        >
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center shadow-inner">
                                <User className="w-12 h-12 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{child.name}</h3>
                                <div className="mt-2 space-y-1">
                                    <p className="text-gray-500 font-medium">Class {child.className}-{child.section}</p>
                                    <p className="text-gray-400 text-sm">Roll No: {child.rollNo}</p>
                                </div>
                            </div>
                            <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg py-6 shadow-md rounded-xl">
                                View Profile
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    // Loading state for initial fetch
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    // Fallback if no children
    if (!isLoading && childrenList.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center p-10 bg-white rounded-2xl shadow-lg max-w-md">
                    <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Profiles Found</h2>
                    <p className="text-gray-600">No students are linked to your parent account.</p>
                    <p className="text-gray-500 text-sm mt-4">Please contact the school administration.</p>
                </div>
            </div>
        );
    }

    return (
        <ParentContext.Provider value={{
            childrenList,
            selectedChild,
            setSelectedChild: handleChildSelect,
            changeChild,
            isLoading
        }}>
            {routeChildren}
        </ParentContext.Provider>
    );
};

export default ParentContext;
