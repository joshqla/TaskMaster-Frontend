import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Novo
import { format } from 'date-fns';
import axios from 'axios';

function Home() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate-asc'); // Novo: padrão por data crescente
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchTasks = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await axios.get('https://taskmaster-backend-ceqf.onrender.com/api/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(res.data);
      } catch (error) {
        console.error('Erro ao buscar tarefas:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchTasks();
  }, [token]);

  const handleAddTask = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.post(
        'https://taskmaster-backend-ceqf.onrender.com/api/tasks',
        { title, dueDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks([...tasks, res.data]);
      setTitle('');
      setDueDate(null);
    } catch (error) {
      alert('Erro ao adicionar tarefa: ' + (error.response?.data?.error || 'Tente novamente'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async () => {
    if (!editTask || !token) return;
    setLoading(true);
    try {
      const res = await axios.put(
        `https://taskmaster-backend-ceqf.onrender.com/api/tasks/${editTask._id}`,
        editTask,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.map((t) => (t._id === editTask._id ? res.data : t)));
      setEditTask(null);
    } catch (error) {
      alert('Erro ao atualizar tarefa');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!token) return;
    setLoading(true);
    try {
      await axios.delete(`https://taskmaster-backend-ceqf.onrender.com/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (error) {
      alert('Erro ao excluir tarefa');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (task) => {
    if (!token) return;
    setLoading(true);
    try {
      const updatedTask = { ...task, completed: !task.completed };
      const res = await axios.put(
        `https://taskmaster-backend-ceqf.onrender.com/api/tasks/${task._id}`,
        updatedTask,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.map((t) => (t._id === task._id ? res.data : t)));
    } catch (error) {
      alert('Erro ao atualizar status da tarefa');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate-asc') {
      const dateA = a.dueDate ? new Date(a.dueDate) : Infinity;
      const dateB = b.dueDate ? new Date(b.dueDate) : Infinity;
      return dateA - dateB;
    }
    if (sortBy === 'dueDate-desc') {
      const dateA = a.dueDate ? new Date(a.dueDate) : -Infinity;
      const dateB = b.dueDate ? new Date(b.dueDate) : -Infinity;
      return dateB - dateA;
    }
    if (sortBy === 'completed-asc') return a.completed ? 1 : -1;
    if (sortBy === 'completed-desc') return a.completed ? -1 : 1;
    return 0;
  });

  const isOverdue = (date, completed) => date && new Date(date) < new Date() && !completed;

  return (
    <div className="p-4 max-w-2xl mx-auto bg-background">
      <h1 className="text-2xl font-bold mb-4">Minhas Tarefas</h1>
      <div className="flex space-x-2 mb-4">
        <Input
          placeholder="Nova tarefa"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" disabled={loading}>
              {dueDate ? format(dueDate, 'PPP') : 'Data'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              disabled={loading}
            />
          </PopoverContent>
        </Popover>
        <Button onClick={handleAddTask} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Adicionar'}
        </Button>
      </div>
      <div className="flex space-x-2 mb-4">
        <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')} disabled={loading}>
          Todas
        </Button>
        <Button variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')} disabled={loading}>
          Pendentes
        </Button>
        <Button variant={filter === 'completed' ? 'default' : 'outline'} onClick={() => setFilter('completed')} disabled={loading}>
          Concluídas
        </Button>
        <Select value={sortBy} onValueChange={setSortBy} disabled={loading}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dueDate-asc">Data (Crescente)</SelectItem>
            <SelectItem value="dueDate-desc">Data (Decrescente)</SelectItem>
            <SelectItem value="completed-asc">Concluídas Último</SelectItem>
            <SelectItem value="completed-desc">Concluídas Primeiro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {loading && (
        <div className="flex justify-center mb-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
      <div className="space-y-2">
        {sortedTasks.map((task) => (
          <Card key={task._id} className="flex items-center justify-between animate-in slide-in-from-top-3 duration-500">
            <CardContent className="p-4 flex items-center space-x-2">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => handleToggleComplete(task)}
                disabled={loading}
              />
              <div>
                <span className={task.completed ? 'line-through' : ''}>{task.title}</span>
                {task.dueDate && (
                  <p className={`text-sm ${isOverdue(task.dueDate, task.completed) ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {format(new Date(task.dueDate), 'PPP')}
                  </p>
                )}
              </div>
            </CardContent>
            <div className="p-4 space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => setEditTask(task)} disabled={loading}>
                    Editar
                  </Button>
                </DialogTrigger>
                {editTask && (
                  <DialogContent className="animate-in zoom-in-75 duration-300">
                    <DialogHeader>
                      <DialogTitle>Editar Tarefa</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        value={editTask.title}
                        onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                        disabled={loading}
                      />
                      <Popover>
                        <SelectTrigger asChild>
                          <Button variant="outline" disabled={loading}>
                            {editTask.dueDate ? format(new Date(editTask.dueDate), 'PPP') : 'Data'}
                          </Button>
                        </SelectTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={editTask.dueDate ? new Date(editTask.dueDate) : null}
                            onSelect={(date) => setEditTask({ ...editTask, dueDate: date })}
                            disabled={loading}
                          />
                        </PopoverContent>
                      </Popover>
                      <Checkbox
                        checked={editTask.completed}
                        onCheckedChange={(checked) => setEditTask({ ...editTask, completed: checked })}
                        disabled={loading}
                      />
                      <Button onClick={handleUpdateTask} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
                      </Button>
                    </div>
                  </DialogContent>
                )}
              </Dialog>
              <Button variant="destructive" onClick={() => handleDeleteTask(task._id)} disabled={loading}>
                Excluir
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Home;