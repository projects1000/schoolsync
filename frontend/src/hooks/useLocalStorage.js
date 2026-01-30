
import { useState, useEffect } from 'react';

const initialUsers = [
  { id: 1, name: 'Admin User', email: 'admin@littlesteps.com', password: '123', role: 'admin', status: 'active' },
  { id: 2, name: 'Emily Davis', email: 'teacher@littlesteps.com', password: '123', role: 'teacher', status: 'active' },
  { id: 101, name: 'Sarah Wilson', email: 'parent@littlesteps.com', password: '123', phone: '+1 234-567-8901', role: 'parent', status: 'active' },
  { id: 102, name: 'Michael Johnson', email: 'mjohnson@example.com', phone: '+1 234-567-8902', role: 'parent', status: 'active', password: 'parent2263' },
  { id: 103, name: 'Emily Parent', email: 'edavis@example.com', phone: '+1 234-567-8903', role: 'parent', status: 'active', password: '123' },
  { id: 104, name: 'James Brown', email: 'jbrown@example.com', phone: '+1 234-567-8904', role: 'parent', status: 'active', password: 'parent8904' },
];

const initialTeachers = [
  { id: 2, employeeId: 'EMP002', name: 'Emily Davis', email: 'teacher@littlesteps.com', phone: '+1 234-567-8902', department: 'Playgroup', qualification: 'M.Ed in Child Development', experience: '8 years', classes: ['Playgroup A', 'Playgroup B'], status: 'Active', joinDate: '2016-03-20' },
  { id: 3, employeeId: 'EMP003', name: 'Michael Brown', email: 'michael.brown@littlesteps.com', phone: '+1 234-567-8903', department: 'Kindergarten', qualification: 'B.A in Child Psychology', experience: '3 years', classes: ['KG A'], status: 'Active', joinDate: '2021-01-10' },
  { id: 4, employeeId: 'EMP004', name: 'Lisa Wilson', email: 'lisa.wilson@littlesteps.com', phone: '+1 234-567-8904', department: 'Activities', qualification: 'B.F.A in Arts & Crafts', experience: '4 years', classes: ['Art & Craft', 'Music'], status: 'Active', joinDate: '2020-06-01' }
];

const initialTimetables = {
  'Playgroup A': [
    { time: '09:00 - 09:30', monday: 'Circle Time', tuesday: 'Free Play', wednesday: 'Story Time', thursday: 'Music & Movement', friday: 'Art & Craft' },
    { time: '09:30 - 10:00', monday: 'Sensory Play', tuesday: 'Puzzles', wednesday: 'Singing', thursday: 'Blocks', friday: 'Outdoor Play' },
    { time: '10:00 - 10:30', monday: 'Snack Time', tuesday: 'Snack Time', wednesday: 'Snack Time', thursday: 'Snack Time', friday: 'Snack Time' },
  ],
  'Nursery A': [
    { time: '09:00 - 09:30', monday: 'Alphabet Fun', tuesday: 'Number Games', wednesday: 'Rhyme Time', thursday: 'Science Corner', friday: 'Show & Tell' },
    { time: '09:30 - 10:00', monday: 'Creative Writing', tuesday: 'Shapes & Colors', wednesday: 'Group Activity', thursday: 'Nature Walk', friday: 'Role Play' },
    { time: '10:00 - 10:30', monday: 'Snack Time', tuesday: 'Snack Time', wednesday: 'Snack Time', thursday: 'Snack Time', friday: 'Snack Time' },
  ]
};

function getInitialValue(key, initialValue) {
  if (key === 'users' && !localStorage.getItem('users')) {
    return initialUsers;
  }
  if (key === 'teachers' && !localStorage.getItem('teachers')) {
    return initialTeachers;
  }
  if (key === 'timetables' && !localStorage.getItem('timetables')) {
    return initialTimetables;
  }
  try {
    const localValue = window.localStorage.getItem(key);
    return localValue ? JSON.parse(localValue) : initialValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return initialValue;
  }
}

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => getInitialValue(key, initialValue));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
}
