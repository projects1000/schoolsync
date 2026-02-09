
import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell, Search, LogOut, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useParent } from '@/context/ParentContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Header = ({ currentUser, onLogout, onToggleSidebar, sidebarOpen }) => {
  const { toast } = useToast();
  const { selectedChild, setSelectedChild, childrenList } = useParent();

  const handleNotificationClick = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  const handleSearchClick = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  const isParent = currentUser?.role === 'parent';

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white shadow-sm border-b border-gray-200 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold text-gray-800">
              Welcome back, {currentUser?.name}!
            </h1>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Center/Right Side child Selector for Parents */}
        <div className="flex-1 flex justify-center px-4">
          {isParent && childrenList.length > 1 && selectedChild && (
            <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 shadow-sm">
              <div className="hidden sm:flex items-center gap-2 text-indigo-700 font-medium text-sm">
                <Users className="w-4 h-4" />
                <span>Switch Profile:</span>
              </div>
              <Select
                value={selectedChild.id}
                onValueChange={(value) => {
                  const child = childrenList.find(c => c.id === value);
                  setSelectedChild(child);
                  toast({
                    title: "Profile Switched",
                    description: `Now viewing dashboard for ${child.name}`,
                  });
                }}
              >
                <SelectTrigger className="w-[160px] sm:w-[200px] h-9 border-indigo-200 bg-white rounded-full">
                  <SelectValue placeholder="Select Child" />
                </SelectTrigger>
                <SelectContent>
                  {childrenList.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search - Hidden on small screens if child selector is present */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSearchClick}
            className={`hover:bg-gray-100 ${isParent ? 'hidden xl:inline-flex' : ''}`}
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNotificationClick}
            className="hover:bg-gray-100 relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </Button>

          {/* User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-800 truncate max-w-[100px]">{currentUser?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
            </div>

            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-semibold text-sm">
                {currentUser?.name?.charAt(0)}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
