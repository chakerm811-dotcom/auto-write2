import React, { useState } from 'react';
import { Calendar, Plus, Clock, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { ScheduledTask } from '../types';

interface SchedulerProps {
  tasks: ScheduledTask[];
  onSchedule: (titles: string[], scheduledAt: string, category: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isScheduling: boolean;
}

export default function Scheduler({ tasks, onSchedule, onDelete, isScheduling }: SchedulerProps) {
  const [titles, setTitles] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!titles.trim() || !scheduledAt || !category) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    const titlesArray = titles.split('\n').filter(t => t.trim() !== '');
    await onSchedule(titlesArray, scheduledAt, category);
    setTitles('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">جدولة المقالات</h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <textarea
          value={titles}
          onChange={(e) => setTitles(e.target.value)}
          placeholder="أدخل عناوين المقالات (كل عنوان في سطر)"
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="التصنيف"
            className="p-3 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        
        {error && <p className="text-red-500 text-xs">{error}</p>}
        
        <button
          type="submit"
          disabled={isScheduling}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isScheduling ? <Loader2 className="animate-spin w-4 h-4" /> : <Calendar className="w-4 h-4" />}
          جدولة المهام
        </button>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <h3 className="p-4 border-b font-bold text-gray-900">المهام المجدولة</h3>
        {tasks.length === 0 ? (
          <p className="p-6 text-center text-gray-500 text-sm">لا توجد مهام مجدولة حالياً.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-[10px]">
              <tr>
                <th className="p-4">العناوين</th>
                <th className="p-4">وقت الجدول</th>
                <th className="p-4">التصنيف</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="p-4 text-gray-900 font-medium">{task.titles.length} مقال</td>
                  <td className="p-4 text-gray-500">{new Date(task.scheduledAt).toLocaleString('ar-EG')}</td>
                  <td className="p-4">{task.category}</td>
                  <td className="p-4 capitalize">{task.status}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => onDelete(task.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
