
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell, Search, LogOut, Users, KeyRound } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationDropdown from '@/components/common/NotificationDropdown';
import ChangePasswordDialog from '@/components/common/ChangePasswordDialog';
import CommandPalette from '@/components/common/CommandPalette';

const Header = ({ currentUser, onLogout, onToggleSidebar, sidebarOpen }) => {
  const { toast } = useToast();
  const { selectedChild, setSelectedChild, childrenList } = useParent();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const isParent = currentUser?.role === 'parent';

  // Detect platform for shortcut hint (⌘K on Mac, Ctrl+K elsewhere)
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const shortcutHint = isMac ? '⌘K' : 'Ctrl+K';

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-30"
      >
        <div className="flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="block">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate max-w-[150px] sm:max-w-xs">
                <span className="sm:hidden">{currentUser?.name?.split(' ')[0] || 'Hi'}</span>
                <span className="hidden sm:inline">{currentUser?.name ? `Welcome, ${currentUser.name.split(' ')[0]}` : 'Welcome'}</span>
              </h1>
              {/* On mobile, show role under the welcome text */}
              {currentUser?.role && (
                <p className="text-xs text-gray-500 capitalize sm:hidden">
                  {currentUser.role}
                </p>
              )}
              <p className="hidden sm:block text-sm text-gray-500">
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
          <div className="flex-1 flex justify-center px-2 sm:px-4">
            {isParent && childrenList.length > 1 && selectedChild && (
              <div className="flex items-center gap-2 sm:gap-3 bg-emerald-50 px-2 sm:px-4 py-1 sm:py-2 rounded-full border border-emerald-100 shadow-sm max-w-[200px] sm:max-w-none">
                <div className="hidden md:flex items-center gap-2 text-emerald-700 font-medium text-sm">
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
                  <SelectTrigger className="w-full sm:w-[200px] h-8 sm:h-9 border-emerald-200 bg-white rounded-full text-xs sm:text-sm px-2">
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
          <div className="flex items-center space-x-1 sm:space-x-4">
            {/* Search Button — opens Command Palette */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 group cursor-pointer"
            >
              <Search className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              <span className="text-[13px] text-gray-400 group-hover:text-gray-600 hidden md:inline">Search...</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-medium text-gray-400 shadow-sm">
                {shortcutHint}
              </kbd>
            </button>

            {/* Mobile search icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="hover:bg-gray-100 sm:hidden"
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <NotificationDropdown />

            {/* User Menu with Dropdown */}
            <div className="flex items-center space-x-2 sm:space-x-3 ml-1 sm:ml-0">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-800 truncate max-w-[100px]">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center shrink-0 cursor-pointer hover:ring-2 hover:ring-emerald-300 hover:ring-offset-2 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2">
                    <span className="text-white font-semibold text-sm">
                      {currentUser?.name?.charAt(0)}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{currentUser?.name}</p>
                      <p className="text-xs text-gray-500">{currentUser?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowChangePassword(true)}
                    className="cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 mr-2" />
                    Change Password
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.header>

      <ChangePasswordDialog
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
      />

      {/* Command Palette (Global Search) */}
      <CommandPalette
        open={searchOpen}
        onOpenChange={setSearchOpen}
        currentUser={currentUser}
      />
    </>
  );
};

export default Header;
