import { useState, useEffect } from 'react';
import { Film, Image as ImageIcon, Video, CheckCircle2, MoreVertical, Plus, Calendar as CalendarIcon, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

const initialColumns = [
  { id: 'raw', title: 'Raw Footage', color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400' },
  { id: 'editing', title: 'In Editing', color: 'text-[#003366]', bg: 'bg-[#003366]/10', dot: 'bg-[#003366]' },
  { id: 'color', title: 'Color Grading', color: 'text-purple-600', bg: 'bg-purple-100', dot: 'bg-purple-500' },
  { id: 'review', title: 'Client Review', color: 'text-orange-600', bg: 'bg-orange-100', dot: 'bg-orange-500' },
  { id: 'delivered', title: 'Delivered', color: 'text-emerald-600', bg: 'bg-emerald-100', dot: 'bg-emerald-500' },
];

export default function Deliverables() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', type: 'Cinematic Film', due_date: '', editor_id: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [deliverablesRes, teamRes] = await Promise.all([
      supabase.from('deliverables').select(`
        *,
        editor:team_members(name)
      `).order('created_at', { ascending: false }),
      supabase.from('team_members').select('*')
    ]);

    if (deliverablesRes.data) setTasks(deliverablesRes.data);
    if (teamRes.data) setTeamMembers(teamRes.data);
  };

  const getIcon = (type: string) => {
    if (type.includes('Photo')) return <ImageIcon className="w-3.5 h-3.5" />;
    if (type.includes('Video') || type.includes('Film')) return <Film className="w-3.5 h-3.5" />;
    return <Video className="w-3.5 h-3.5" />;
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = async (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: statusId } : t));
    
    // Database update
    try {
      await supabase.from('deliverables').update({ status: statusId }).eq('id', taskId);
    } catch (error) {
      console.error("Error updating task status", error);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.editor_id) {
      alert("Title and Editor are required");
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('deliverables').insert([{
        title: newTask.title,
        type: newTask.type,
        due_date: newTask.due_date || null,
        editor_id: newTask.editor_id,
        status: 'raw'
      }]).select(`*, editor:team_members(name)`).single();
      
      if (error) throw error;
      if (data) {
        setTasks([data, ...tasks]);
        setIsModalOpen(false);
        setNewTask({ title: '', type: 'Cinematic Film', due_date: '', editor_id: '' });
      }
    } catch (err: any) {
      alert(`Error creating task: ${err.message}`);
    }
    setIsLoading(false);
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    setTasks(tasks.filter(t => t.id !== id));
    await supabase.from('deliverables').delete().eq('id', id);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-8rem)] flex flex-col font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Post-Production</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Track and manage deliverables pipeline.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#003366] hover:bg-[#002244] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-[#003366]/20 flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          New Task
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-5 overflow-x-auto pb-4 flex-1 items-start hide-scrollbar">
        {initialColumns.map(column => {
          const columnTasks = tasks.filter(t => t.status === column.id);
          
          return (
            <div 
              key={column.id} 
              className="min-w-[340px] w-[340px] h-full bg-[#f8fafc] border border-slate-200/60 rounded-2xl flex flex-col shadow-sm"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              
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
                  <div 
                    key={task.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-[#003366]/40 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
                  >
                    
                    {/* Tags & Options */}
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded border flex items-center gap-1.5
                        ${task.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-200'}
                      `}>
                        {getIcon(task.type)}
                        {task.type}
                      </span>
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded-md"
                        title="Delete Task"
                      >
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
                        {task.due_date ? new Date(task.due_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'No date'}
                      </div>
                      
                      {/* Editor Assignment */}
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{task.editor?.name?.split(' ')[0] || 'Unassigned'}</span>
                      </div>

                    </div>
                  </div>
                ))}
                
                {columnTasks.length === 0 && (
                  <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Drop here</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Create New Task</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Task Title</label>
                <input 
                  type="text" 
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#003366] transition-colors"
                  placeholder="e.g. Rahul Wedding Highlight"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Type</label>
                  <select 
                    value={newTask.type}
                    onChange={e => setNewTask({...newTask, type: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#003366] transition-colors bg-white"
                  >
                    <option>Cinematic Film</option>
                    <option>Traditional Video</option>
                    <option>Teaser Video</option>
                    <option>Photo Album</option>
                    <option>Raw Photos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Due Date</label>
                  <input 
                    type="date" 
                    value={newTask.due_date}
                    onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#003366] transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Assign Editor</label>
                <select 
                  value={newTask.editor_id}
                  onChange={e => setNewTask({...newTask, editor_id: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#003366] transition-colors bg-white"
                >
                  <option value="">Select Team Member...</option>
                  {teamMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateTask}
                disabled={isLoading}
                className="flex-1 bg-[#003366] hover:bg-[#002244] text-white px-4 py-2.5 rounded-xl font-bold transition-colors shadow-md disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
