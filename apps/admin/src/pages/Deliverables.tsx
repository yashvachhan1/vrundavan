import { useState } from 'react';
import { Film, Image as ImageIcon, Video, CheckCircle2, MoreVertical, Plus, Calendar as CalendarIcon, User } from 'lucide-react';

const initialColumns = [
  { id: 'raw', title: 'Raw Footage', color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400' },
  { id: 'editing', title: 'In Editing', color: 'text-[#003366]', bg: 'bg-[#003366]/10', dot: 'bg-[#003366]' },
  { id: 'color', title: 'Color Grading', color: 'text-purple-600', bg: 'bg-purple-100', dot: 'bg-purple-500' },
  { id: 'review', title: 'Client Review', color: 'text-orange-600', bg: 'bg-orange-100', dot: 'bg-orange-500' },
  { id: 'delivered', title: 'Delivered', color: 'text-emerald-600', bg: 'bg-emerald-100', dot: 'bg-emerald-500' },
];

const mockTasks = [
  { id: 1, title: 'Rahul & Sneha Wedding', type: 'Cinematic Film', status: 'editing', date: 'Aug 25', editor: 'Amit P.' },
  { id: 2, title: 'Priya Maternity Shoot', type: 'Photo Album', status: 'raw', date: 'Aug 20', editor: 'Unassigned' },
  { id: 3, title: 'Corporate Event Video', type: 'Highlight Reel', status: 'color', date: 'Aug 22', editor: 'Sanjay K.' },
  { id: 4, title: 'Amit Pre-Wedding', type: 'Teaser Video', status: 'review', date: 'Aug 18', editor: 'Amit P.' },
  { id: 5, title: 'Neha & Raj Reception', type: 'Full Coverage', status: 'delivered', date: 'Aug 15', editor: 'Priya S.' },
];

export default function Deliverables() {
  const [tasks] = useState(mockTasks);

  const getIcon = (type: string) => {
    if (type.includes('Photo')) return <ImageIcon className="w-3.5 h-3.5" />;
    if (type.includes('Video') || type.includes('Film')) return <Film className="w-3.5 h-3.5" />;
    return <Video className="w-3.5 h-3.5" />;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-8rem)] flex flex-col font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Post-Production</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Track and manage deliverables pipeline.</p>
        </div>
        <button className="bg-[#003366] hover:bg-[#002244] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-[#003366]/20 flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" strokeWidth={3} />
          New Task
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-5 overflow-x-auto pb-4 flex-1 items-start hide-scrollbar">
        {initialColumns.map(column => {
          const columnTasks = tasks.filter(t => t.status === column.id);
          
          return (
            <div key={column.id} className="min-w-[340px] w-[340px] h-full bg-[#f8fafc] border border-slate-200/60 rounded-2xl flex flex-col shadow-sm">
              
              {/* Column Header */}
              <div className="p-4 border-b border-slate-200/60 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${column.dot}`}></span>
                  <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">{column.title}</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${column.bg} ${column.color}`}>
                  {columnTasks.length}
                </span>
              </div>

              {/* Column Body / Tasks */}
              <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                {columnTasks.map(task => (
                  <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-[#003366]/40 hover:shadow-md transition-all cursor-grab group">
                    
                    {/* Tags & Options */}
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded border flex items-center gap-1.5
                        ${task.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-200'}
                      `}>
                        {getIcon(task.type)}
                        {task.type}
                      </span>
                      <button className="text-slate-400 hover:text-slate-900 transition-colors opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded-md">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Title */}
                    <h4 className="font-bold text-slate-900 text-[15px] leading-tight mb-4">{task.title}</h4>
                    
                    {/* Footer Info */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      
                      {/* Date */}
                      <div className={`flex items-center gap-1.5 text-xs font-bold ${task.status === 'delivered' ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {task.status === 'delivered' ? <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={3} /> : <CalendarIcon className="w-3.5 h-3.5" strokeWidth={2.5} />}
                        {task.date}
                      </div>
                      
                      {/* Editor Assignment */}
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{task.editor}</span>
                      </div>

                    </div>
                  </div>
                ))}

                {/* Empty State */}
                {columnTasks.length === 0 && (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl h-28 flex flex-col items-center justify-center text-slate-400 text-sm font-bold bg-slate-50/50">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
