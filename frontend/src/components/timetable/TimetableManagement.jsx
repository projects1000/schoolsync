
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, Plus, Edit, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const TimetableForm = ({ timetable, selectedClass, onSave, onCancel }) => {
  const [formData, setFormData] = useState(timetable || []);
  
  const handleCellChange = (rowIndex, day, value) => {
    const updatedData = [...formData];
    updatedData[rowIndex][day.toLowerCase()] = value;
    setFormData(updatedData);
  };

  const addRow = () => {
    setFormData([...formData, { time: '', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '' }]);
  };

  const removeRow = (index) => {
    setFormData(formData.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-xl shadow-2xl w-full max-w-4xl">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Edit Timetable for {selectedClass}</h2>
          <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-5 h-5" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Time</th>
                  <th className="p-2 text-left">Monday</th>
                  <th className="p-2 text-left">Tuesday</th>
                  <th className="p-2 text-left">Wednesday</th>
                  <th className="p-2 text-left">Thursday</th>
                  <th className="p-2 text-left">Friday</th>
                  <th className="p-2 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {formData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b">
                    <td><input value={row.time} onChange={(e) => handleCellChange(rowIndex, 'time', e.target.value)} className="w-full p-2 border rounded-md" placeholder="09:00-09:30" /></td>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                      <td key={day}><input value={row[day.toLowerCase()]} onChange={(e) => handleCellChange(rowIndex, day, e.target.value)} className="w-full p-2 border rounded-md" /></td>
                    ))}
                    <td><Button type="button" variant="ghost" size="icon" onClick={() => removeRow(rowIndex)}><Trash2 className="w-4 h-4 text-red-500" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button type="button" onClick={addRow} variant="outline"><Plus className="w-4 h-4 mr-2" />Add Row</Button>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Save Timetable</Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const TimetableManagement = ({ currentUser }) => {
  const [timetables, setTimetables] = useLocalStorage('timetables', {});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState(null);
  const [selectedClass, setSelectedClass] = useState('Playgroup A');
  const { toast } = useToast();

  const classes = useMemo(() => {
    if (currentUser.role === 'admin') {
      return ['Playgroup A', 'Playgroup B', 'Nursery A', 'Nursery B', 'KG A', 'KG B'];
    }
    return currentUser.classes || [];
  }, [currentUser]);

  const currentTimetable = timetables[selectedClass] || [];

  const handleEdit = () => {
    setEditingTimetable(currentTimetable);
    setIsFormOpen(true);
  };

  const handleSave = (newTimetableData) => {
    setTimetables(prev => ({ ...prev, [selectedClass]: newTimetableData }));
    toast({ title: "Timetable Saved", description: `Timetable for ${selectedClass} has been updated.` });
    setIsFormOpen(false);
    setEditingTimetable(null);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {isFormOpen && <TimetableForm timetable={editingTimetable} selectedClass={selectedClass} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Timetable Management</h1>
            <p className="text-gray-600 mt-1">Manage class schedules and routines</p>
          </div>
          <Button onClick={handleEdit} className="bg-gradient-to-r from-blue-600 to-indigo-600"><Edit className="w-4 h-4 mr-2" />Edit Timetable</Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="relative w-full md:w-1/3">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            {classes.map(cls => (<option key={cls} value={cls}>{cls}</option>))}
          </select>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Weekly Timetable for {selectedClass}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Time', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                  <th key={day} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTimetable.map((slot, index) => (
                <motion.tr key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.1 }}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{slot.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{slot.monday}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{slot.tuesday}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{slot.wednesday}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{slot.thursday}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{slot.friday}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {currentTimetable.length === 0 && (
          <div className="text-center p-12">
            <BookOpen className="mx-auto w-12 h-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-800">No Timetable Found</h3>
            <p className="mt-1 text-sm text-gray-500">Click "Edit Timetable" to create one for this class.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TimetableManagement;
