
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, UserPlus, Calendar, CreditCard, FileText, MessageSquare, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { MODULE_TO_PATH } from '@/routeConfig';

const QuickActions = ({ currentUser }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAction = (actionName, module) => {
    if (module && MODULE_TO_PATH[module]) {
      navigate(MODULE_TO_PATH[module]);
    } else {
      toast({
        title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
      });
    }
  };

  const superAdminActions = [
    { icon: Shield, label: 'Super Admin Panel', color: 'from-emerald-600 to-emerald-600', module: 'super-admin' },
    { icon: UserPlus, label: 'Add Student', color: 'from-blue-500 to-blue-600', module: 'students' },
    { icon: Plus, label: 'Add Teacher', color: 'from-green-500 to-green-600', module: 'teachers' },
    { icon: Calendar, label: 'Mark Attendance', color: 'from-emerald-500 to-emerald-600', module: 'attendance' },
    { icon: CreditCard, label: 'Generate Invoice', color: 'from-orange-500 to-orange-600', module: 'fees' },
    { icon: MessageSquare, label: 'Send Notice', color: 'from-amber-500 to-amber-600', module: null }
  ];

  const adminActions = [
    { icon: UserPlus, label: 'Add Student', color: 'from-blue-500 to-blue-600', module: 'students' },
    { icon: Plus, label: 'Add Teacher', color: 'from-green-500 to-green-600', module: 'teachers' },
    { icon: Calendar, label: 'Mark Attendance', color: 'from-emerald-500 to-emerald-600', module: 'attendance' },
    { icon: CreditCard, label: 'Generate Invoice', color: 'from-orange-500 to-orange-600', module: 'fees' },
    { icon: FileText, label: 'View Reports', color: 'from-emerald-500 to-emerald-600', module: null },
    { icon: MessageSquare, label: 'Send Notice', color: 'from-amber-500 to-amber-600', module: null }
  ];

  const teacherActions = [
    { icon: Calendar, label: 'Mark Attendance', color: 'from-emerald-500 to-emerald-600', module: 'attendance' },
    { icon: FileText, label: 'View Students', color: 'from-blue-500 to-blue-600', module: 'students' },
    { icon: MessageSquare, label: 'Message Parents', color: 'from-green-500 to-green-600', module: null },
    { icon: Plus, label: 'Add Activity', color: 'from-orange-500 to-orange-600', module: null }
  ];

  const parentActions = [
    { icon: FileText, label: 'View Progress', color: 'from-blue-500 to-blue-600', module: 'parent-portal' },
    { icon: CreditCard, label: 'Pay Fees', color: 'from-green-500 to-green-600', module: 'parent-portal' },
    { icon: MessageSquare, label: 'Message Teacher', color: 'from-emerald-500 to-emerald-600', module: 'parent-portal' },
    { icon: Calendar, label: 'View Schedule', color: 'from-orange-500 to-orange-600', module: 'parent-portal' }
  ];

  const getActions = () => {
    const userRole = currentUser?.role?.toLowerCase();

    switch (userRole) {
      case 'superadmin':
        return superAdminActions;
      case 'admin':
        return adminActions;
      case 'teacher':
        return teacherActions;
      case 'parent':
        return parentActions;
      default:
        return adminActions; // Default fallback
    }
  };

  const actions = getActions();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;

          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                onClick={() => handleAction(action.label, action.module)}
                className={`w-full h-20 bg-gradient-to-r ${action.color} hover:scale-105 transition-all duration-200 flex flex-col items-center justify-center space-y-2 text-white border-0`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
