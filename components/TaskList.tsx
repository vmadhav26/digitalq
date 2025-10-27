import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { PlusCircleIcon, TrashIcon, ClipboardListIcon } from './icons';

interface TaskListProps {
  userId: string;
}

const TaskList: React.FC<TaskListProps> = ({ userId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');

  const storageKey = `inspector_tasks_${userId}`;

  // Load tasks from local storage on mount
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem(storageKey);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
        console.error("Failed to load tasks from local storage", error);
    }
  }, [storageKey]);

  // Save tasks to local storage whenever they change
  useEffect(() => {
    try {
        localStorage.setItem(storageKey, JSON.stringify(tasks));
    } catch (error) {
        console.error("Failed to save tasks to local storage", error);
    }
  }, [tasks, storageKey]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim() === '') return;
    const newTask: Task = {
      id: Date.now(),
      text: newTaskText.trim(),
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setNewTaskText('');
  };

  const handleToggleTask = (id: number) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <ClipboardListIcon className="w-6 h-6 text-cyan-400" />
        My Tasks
      </h2>
      <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTaskText}
          onChange={e => setNewTaskText(e.target.value)}
          placeholder="Add a new task..."
          className="flex-grow bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-sm p-2"
        />
        <button
          type="submit"
          className="p-2 bg-cyan-600 hover:bg-cyan-700 rounded-md text-white transition-colors flex-shrink-0"
          aria-label="Add Task"
        >
          <PlusCircleIcon className="w-5 h-5" />
        </button>
      </form>
      <div className="flex-grow overflow-y-auto space-y-2 pr-2 -mr-2">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-md"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleTask(task.id)}
                className="w-5 h-5 rounded bg-gray-600 border-gray-500 text-cyan-500 focus:ring-cyan-600 cursor-pointer flex-shrink-0"
              />
              <span
                className={`flex-grow text-sm break-words ${
                  task.completed ? 'line-through text-gray-500' : 'text-gray-300'
                }`}
              >
                {task.text}
              </span>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="text-gray-500 hover:text-red-400 transition-colors ml-auto flex-shrink-0"
                aria-label="Delete Task"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-gray-500 py-4">No tasks yet. Add one above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
