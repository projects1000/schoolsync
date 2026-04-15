import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, ArrowRight, Command, CornerDownLeft,
  LayoutDashboard, Users, GraduationCap, Calendar, CreditCard,
  UserCheck, School, Heart, MessageSquare, FileText, BookOpen,
  UserPlus, Crown, Shield, Activity, UserCog, Database,
  Building, Box, User, TrendingUp, Bell, ArrowUpCircle, Trash2,
  Hash
} from 'lucide-react';
import { MODULE_TO_PATH } from '@/routeConfig';

// Icon mapping for menu items — same icons used in the sidebar
const ICON_MAP = {
  'super-admin-dashboard': Crown,
  'school-management': School,
  'super-admin': Users,
  'academic-settings': BookOpen,
  'fee-settings': CreditCard,
  'security-logs': Shield,
  'system-health': Activity,
  'superadmin-trash': Trash2,
  'superadmin-communications': MessageSquare,
  'dashboard': LayoutDashboard,
  'teacher-dashboard': LayoutDashboard,
  'teacher-classes': GraduationCap,
  'attendance': Calendar,
  'teacher-assignments': FileText,
  'teacher-communications': MessageSquare,
  'teacher-course-handouts': FileText,
  'teacher-resources': BookOpen,
  'teacher-promotions': ArrowUpCircle,
  'teachers': UserCheck,
  'students': GraduationCap,
  'communications': MessageSquare,
  'parents': Heart,
  'school-profile': Building,
  'classes': Box,
  'academics': GraduationCap,
  'fees': CreditCard,
  'timetable': BookOpen,
  'notification-management': Bell,
  'admin-trash': Trash2,
  'parent-overview': LayoutDashboard,
  'parent-student-profile': User,
  'parent-academics': GraduationCap,
  'parent-attendance': Calendar,
  'parent-messages': MessageSquare,
  'parent-assignments': FileText,
  'parent-study-materials': BookOpen,
  'parent-course-handouts': TrendingUp,
  'parent-fees': CreditCard,
  'teacher-profile': User,
};

// Human-readable labels for every module — used for search + display
const MODULE_LABELS = {
  'super-admin-dashboard': 'Command Center',
  'school-management': 'School Management',
  'super-admin': 'Admin Management',
  'academic-settings': 'Academic Settings',
  'fee-settings': 'Fee Settings',
  'security-logs': 'Security & Logs',
  'system-health': 'System Health',
  'superadmin-trash': 'Trash',
  'superadmin-communications': 'Communication',
  'dashboard': 'Dashboard',
  'teacher-dashboard': 'Dashboard',
  'teacher-classes': 'My Classes',
  'attendance': 'Attendance',
  'teacher-assignments': 'Assignments',
  'teacher-communications': 'Messages',
  'teacher-course-handouts': 'Course Handouts',
  'teacher-resources': 'Resources',
  'teacher-promotions': 'Promotions',
  'teachers': 'Teachers',
  'students': 'Students',
  'communications': 'Communication',
  'parents': 'Parents',
  'school-profile': 'School Profile',
  'classes': 'Class Management',
  'academics': 'Academics',
  'fees': 'Fees & Billing',
  'timetable': 'Timetable',
  'notification-management': 'Notifications',
  'admin-trash': 'Trash',
  'parent-overview': 'Dashboard',
  'parent-student-profile': 'Student Profile',
  'parent-academics': 'Academic Details',
  'parent-attendance': 'Attendance',
  'parent-messages': 'Messages',
  'parent-assignments': 'Assignments',
  'parent-study-materials': 'Study Materials',
  'parent-course-handouts': 'Course Progress',
  'parent-fees': 'Fees',
  'teacher-profile': 'My Profile',
};

// Role metadata for categorized display
const ROLE_META = {
  superadmin: { label: 'Super Admin', color: 'text-violet-600 bg-violet-50 border-violet-200' },
  admin: { label: 'Admin', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  teacher: { label: 'Teacher', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  parent: { label: 'Parent', color: 'text-amber-600 bg-amber-50 border-amber-200' },
};

// Which roles can see each module
const MODULE_ROLES = {
  'super-admin-dashboard': ['superadmin'],
  'school-management': ['superadmin'],
  'super-admin': ['superadmin'],
  'academic-settings': ['superadmin'],
  'fee-settings': ['superadmin'],
  'security-logs': ['superadmin'],
  'system-health': ['superadmin'],
  'superadmin-trash': ['superadmin'],
  'superadmin-communications': ['superadmin'],
  'dashboard': ['admin'],
  'teacher-dashboard': ['teacher'],
  'teacher-classes': ['teacher'],
  'attendance': ['admin', 'teacher'],
  'teacher-assignments': ['teacher'],
  'teacher-communications': ['teacher'],
  'teacher-course-handouts': ['teacher'],
  'teacher-resources': ['teacher'],
  'teacher-promotions': ['teacher'],
  'teachers': ['admin'],
  'students': ['admin'],
  'communications': ['admin'],
  'parents': ['admin'],
  'school-profile': ['admin'],
  'classes': ['admin'],
  'academics': ['admin'],
  'fees': ['superadmin', 'admin'],
  'timetable': ['admin', 'teacher'],
  'notification-management': ['superadmin', 'admin'],
  'admin-trash': ['admin'],
  'parent-overview': ['parent'],
  'parent-student-profile': ['parent'],
  'parent-academics': ['parent'],
  'parent-attendance': ['parent'],
  'parent-messages': ['parent'],
  'parent-assignments': ['parent'],
  'parent-study-materials': ['parent'],
  'parent-course-handouts': ['parent'],
  'parent-fees': ['parent'],
  'teacher-profile': ['teacher'],
};

// Keyword aliases for better search experience
const SEARCH_ALIASES = {
  'students': ['student', 'enroll', 'admission', 'child', 'pupil'],
  'teachers': ['teacher', 'staff', 'faculty', 'instructor'],
  'parents': ['parent', 'guardian', 'family', 'mom', 'dad'],
  'attendance': ['attend', 'present', 'absent', 'roll call', 'mark'],
  'fees': ['fee', 'billing', 'payment', 'invoice', 'money', 'pay'],
  'dashboard': ['home', 'overview', 'main', 'stats'],
  'communications': ['message', 'chat', 'send', 'announce', 'notice'],
  'timetable': ['schedule', 'time', 'period', 'slot', 'routine'],
  'classes': ['class', 'section', 'grade', 'division'],
  'academics': ['academic', 'subject', 'course', 'curriculum'],
  'school-profile': ['school', 'profile', 'info', 'about', 'address'],
  'notification-management': ['notify', 'alert', 'reminder', 'notification'],
  'teacher-assignments': ['assignment', 'homework', 'task'],
  'teacher-resources': ['resource', 'material', 'upload', 'document'],
  'teacher-course-handouts': ['handout', 'course', 'syllabus'],
  'parent-study-materials': ['material', 'resource', 'download'],
  'parent-course-handouts': ['course', 'progress', 'handout'],
  'security-logs': ['security', 'audit', 'log', 'activity'],
  'system-health': ['health', 'backup', 'system', 'server'],
  'admin-trash': ['trash', 'deleted', 'restore', 'recycle'],
  'superadmin-trash': ['trash', 'deleted', 'restore', 'recycle'],
  'teacher-promotions': ['promote', 'promotion', 'upgrade', 'next class'],
};

// Simple fuzzy match — checks if all query chars appear in order within the target
function fuzzyMatch(query, target) {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t.includes(q)) return { match: true, score: t.indexOf(q) === 0 ? 3 : 2 };

  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return { match: qi === q.length, score: 1 };
}

const CommandPalette = ({ open, onOpenChange, currentUser }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  // Build the searchable items for the current user's role
  const searchItems = useMemo(() => {
    const role = currentUser?.role;
    if (!role) return [];

    return Object.entries(MODULE_TO_PATH)
      .filter(([moduleId]) => {
        const roles = MODULE_ROLES[moduleId];
        return roles && roles.includes(role);
      })
      .map(([moduleId, path]) => ({
        id: moduleId,
        label: MODULE_LABELS[moduleId] || moduleId,
        path,
        icon: ICON_MAP[moduleId] || Hash,
        aliases: SEARCH_ALIASES[moduleId] || [],
      }));
  }, [currentUser?.role]);

  // Filter results based on query
  const results = useMemo(() => {
    if (!query.trim()) return searchItems;

    const scored = searchItems
      .map(item => {
        // Match against label
        const labelMatch = fuzzyMatch(query, item.label);
        // Match against aliases
        const aliasMatch = item.aliases.reduce((best, alias) => {
          const m = fuzzyMatch(query, alias);
          return m.match && m.score > best.score ? m : best;
        }, { match: false, score: 0 });
        // Match against path
        const pathMatch = fuzzyMatch(query, item.path);

        const bestScore = Math.max(
          labelMatch.match ? labelMatch.score : 0,
          aliasMatch.match ? aliasMatch.score : 0,
          pathMatch.match ? pathMatch.score : 0,
        );

        return { ...item, score: bestScore, matched: bestScore > 0 };
      })
      .filter(item => item.matched)
      .sort((a, b) => b.score - a.score);

    return scored;
  }, [query, searchItems]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Global keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        onOpenChange(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onOpenChange]);

  // Navigate to a result
  const handleSelect = useCallback((item) => {
    navigate(item.path);
    onOpenChange(false);
  }, [navigate, onOpenChange]);

  // Keyboard navigation within the palette
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  }, [results, selectedIndex, handleSelect]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const item = listRef.current.children[selectedIndex];
      if (item) item.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            onClick={() => onOpenChange(false)}
          />

          {/* Centering wrapper — uses flexbox so Framer Motion transforms don't conflict */}
          <div
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[560px] max-h-[80vh] rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden flex flex-col pointer-events-auto"
            >
            {/* Search input */}
            <div className="flex items-center px-3 sm:px-4 border-b border-gray-100 shrink-0">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search pages, features..."
                className="w-full py-3.5 sm:py-4 px-3 text-[15px] text-gray-900 placeholder-gray-400 bg-transparent outline-none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onOpenChange(false)}
                className="ml-1 shrink-0 px-2 py-1 rounded-md bg-gray-100 text-[11px] font-medium text-gray-500 border border-gray-200 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              className="max-h-[50vh] sm:max-h-[360px] overflow-y-auto py-2 px-2"
              role="listbox"
            >
              {results.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">No results found</p>
                  <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                </div>
              ) : (
                results.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors duration-100 group ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          isSelected ? 'text-purple-900' : 'text-gray-800'
                        }`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{item.path}</p>
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] text-purple-500 font-medium">Go</span>
                          <CornerDownLeft className="w-3.5 h-3.5 text-purple-400" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer — simplified on mobile, keyboard hints on desktop */}
            <div className="px-3 sm:px-4 py-2 sm:py-2.5 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between shrink-0">
              {/* Keyboard hints — hidden on mobile since there's no physical keyboard */}
              <div className="hidden sm:flex items-center gap-3 text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-500 font-medium shadow-sm">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-500 font-medium shadow-sm">↓</kbd>
                  <span className="ml-0.5">Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-500 font-medium shadow-sm">↵</kbd>
                  <span className="ml-0.5">Open</span>
                </span>
              </div>
              {/* Mobile: show tap hint */}
              <p className="sm:hidden text-[11px] text-gray-400">Tap to navigate</p>
              <p className="text-[11px] text-gray-400">{results.length} result{results.length !== 1 ? 's' : ''}</p>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
