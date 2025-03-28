import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Tag, Flame, Sprout } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

function Home() {

  // Verifica se o token existe antes de renderizar a página

  
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login';
    return null;
  }

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(null);
  const [tags, setTags] = useState('');
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate-asc');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [reminderOffset, setReminderOffset] = useState('7200000');
  const [userEmail, setUserEmail] = useState('');

  // Função pra calcular tempo restante
  const getTimeRemaining = (dueDate) => {
    const now = new Date();
    const diff = new Date(dueDate) - now;
    if (diff <= 0) return 'Vencida';
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `Faltam ${hours}h ${minutes}min`;
  };
  

  // Fetch inicial de tarefas e usuário
  useEffect(() => {
    const fetchTasks = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await axios.get(`https://taskmaster-backend-ceqf.onrender.com/api/tasks?sort=${sortBy}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(res.data || []);
      } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchUser = async () => {
      try {
        const res = await axios.get('https://taskmaster-backend-ceqf.onrender.com/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserEmail(res.data.email);
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
      }
    };

    fetchTasks();
    fetchUser();
  }, [token, sortBy]);

  // useEffect pra atualizar o contador em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => ({
          ...task,
          timeRemaining: task.dueDate && !task.completed ? getTimeRemaining(task.dueDate) : null,
        }))
      );
    }, 60000); // Atualiza a cada minuto pra não pesar

    return () => clearInterval(interval); // Limpa o interval ao desmontar
  }, [tasks]);

  useEffect(() => {
    if (!token) return;
    const checkOverdue = setInterval(() => {
      tasks.forEach((task) => {
        if (new Date(task.dueDate) < new Date() && !task.completed) {
          toast(`Tarefa "${task.title}" está vencida!`, { icon: '⏰', id: task._id }); // ID pra evitar duplicatas
        }
      });
    }, 60000); // Checa a cada 60s, sem requisições

    return () => clearInterval(checkOverdue);
  }, [tasks, token]); // Só depende de tasks e token

  const handleAddTask = async () => {
    if (!token || title.length < 3) {
      toast.error('Título deve ter pelo menos 3 caracteres');
      return;
    }
    setLoading(true);
    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
      const res = await axios.post(
        'https://taskmaster-backend-ceqf.onrender.com/api/tasks',
        { title, description, priority, dueDate, tags: tagArray, reminderOffset },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prevTasks) => [...prevTasks, res.data]);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate(null);
      setTags('');
      setReminderOffset('7200000');
      toast.success('Tarefa adicionada!');
    } catch (error) {
      toast.error('Erro ao adicionar tarefa');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async () => {
    if (!editTask || !token) return;
    setLoading(true);
    try {
      const tagArray = editTask.tags ? editTask.tags.filter(t => t) : []; // Array direto, sem join
      const res = await axios.put(
        `https://taskmaster-backend-ceqf.onrender.com/api/tasks/${editTask._id}`,
        { ...editTask, tags: tagArray },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prevTasks) => prevTasks.map((t) => (t._id === editTask._id ? res.data : t)));
      setEditTask(null);
      toast.success('Tarefa atualizada!');
    } catch (error) {
      console.error('Erro no frontend:', error.response?.data || error.message);
      toast.error('Erro ao atualizar tarefa');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!token || !deleteTaskId) return;
    setLoading(true);
    try {
      await axios.delete(`https://taskmaster-backend-ceqf.onrender.com/api/tasks/${deleteTaskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prevTasks) => prevTasks.filter((t) => t._id !== deleteTaskId));
      setDeleteTaskId(null);
      toast.success('Tarefa excluída!');
    } catch (error) {
      toast.error('Erro ao excluir tarefa');
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
      setTasks((prevTasks) => prevTasks.map((t) => (t._id === task._id ? res.data : t)));
      toast.success(`Tarefa ${updatedTask.completed ? 'concluída' : 'reaberta'}!`);
    } catch (error) {
      toast.error('Erro ao atualizar status');
    } finally {
      setLoading(false);
    }
  };

  const handleExportTasks = () => {
    const json = JSON.stringify(tasks, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.json'; // String corrigida, sem duplicatas ou erros
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Tarefas exportadas!');
  };

  const handleImportTasks = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedTasks = JSON.parse(event.target.result);
        for (const task of importedTasks) {
          await axios.post(
            'https://taskmaster-backend-ceqf.onrender.com/api/tasks',
            { ...task, user: undefined, _id: undefined },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        const res = await axios.get(`https://taskmaster-backend-ceqf.onrender.com/api/tasks?sort=${sortBy}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(res.data || []);
        toast.success('Tarefas importadas!');
      } catch (error) {
        toast.error('Erro ao importar tarefas');
      }
    };
    reader.readAsText(file);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
    toast.success('Logout realizado!');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const isOverdue = (date, completed) => date && new Date(date) < new Date() && !completed;

  const filteredTasks = useMemo(() => {
    return (tasks || []).filter((task) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'pending' && !task.completed) ||
        (filter === 'completed' && task.completed) ||
        (filter === 'overdue' && isOverdue(task.dueDate, task.completed));
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(search.toLowerCase())) ||
        (task.tags && task.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())));
      return matchesFilter && matchesSearch;
    });
  }, [tasks, filter, search]);

  const overdueCount = filteredTasks.filter((t) => isOverdue(t.dueDate, t.completed)).length;
  const pendingCount = filteredTasks.filter((t) => !t.completed).length;
  const completedCount = filteredTasks.filter((t) => t.completed).length;

  return (
    <div className={`p-4 max-w-2xl mx-auto ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-background'}`}>
      <Toaster />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Minhas Tarefas</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">Logado como: {userEmail}</span>
          <div className="space-x-2">
            <Button variant="outline" onClick={toggleTheme} disabled={loading}>
              {theme === 'light' ? 'Escuro' : 'Claro'}
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/dashboard'} disabled={loading}>
              Dashboard
            </Button>
            <Button variant="outline" onClick={handleLogout} disabled={loading}>
              Logout
            </Button>
          </div>
        </div>
      </div>
      <div className="flex space-x-2 mb-4">
        <Badge variant="secondary">Pendentes: {pendingCount}</Badge>
        <Badge variant="success">Concluídas: {completedCount}</Badge>
        {overdueCount > 0 && <Badge variant="destructive">Vencidas: {overdueCount}</Badge>}
      </div>
      <div className="flex flex-col space-y-2 mb-4 md:flex-row md:space-y-0 md:space-x-2">
        <Input
          placeholder="Nova tarefa"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" disabled={loading}>
              {dueDate ? format(dueDate, 'PPP HH:mm') : 'Data e Hora'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <DatePicker
              selected={dueDate}
              onChange={(date) => setDueDate(date || new Date())}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              inline
            />
          </PopoverContent>
        </Popover>
        <Select value={priority} onValueChange={setPriority} disabled={loading}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Baixa</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
          </SelectContent>
        </Select>
        <Select value={reminderOffset} onValueChange={setReminderOffset} disabled={loading}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Lembrete" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1800000">30 minutos antes</SelectItem>
            <SelectItem value="3600000">1 hora antes</SelectItem>
            <SelectItem value="7200000">2 horas antes</SelectItem>
            <SelectItem value="18000000">5 horas antes</SelectItem>
          </SelectContent>
        </Select>        
        <Button onClick={handleAddTask} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Adicionar'}
        </Button>
      </div>
      <Textarea
        placeholder="Descrição (máx. 500 caracteres)"
        value={description}
        onChange={(e) => setDescription(e.target.value.slice(0, 500))}
        className="mb-4"
        disabled={loading}
      />
      <Input
        placeholder="Tags (separadas por vírgula)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        className="mb-4"
        disabled={loading}
      />
      <div className="flex flex-col space-y-2 mb-4 md:flex-row md:space-y-0 md:space-x-2">
        <Input
          placeholder="Buscar tarefas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={loading}
        />
        <Button variant="outline" onClick={handleExportTasks} disabled={loading}>
          Exportar
        </Button>
        <Button variant="outline" as="label" disabled={loading}>
          Importar
          <input type="file" accept=".json" onChange={handleImportTasks} className="hidden" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')} disabled={loading}>
          Todas
        </Button>
        <Button variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')} disabled={loading}>
          Pendentes
        </Button>
        <Button variant={filter === 'completed' ? 'default' : 'outline'} onClick={() => setFilter('completed')} disabled={loading}>
          Concluídas
        </Button>
        <Button variant={filter === 'overdue' ? 'default' : 'outline'} onClick={() => setFilter('overdue')} disabled={loading}>
          Vencidas
        </Button>
        <Select value={sortBy} onValueChange={setSortBy} disabled={loading}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dueDate-asc">Data (Crescente)</SelectItem>
            <SelectItem value="dueDate-desc">Data (Decrescente)</SelectItem>
            <SelectItem value="priority-asc">Prioridade (Baixa-Alta)</SelectItem>
            <SelectItem value="priority-desc">Prioridade (Alta-Baixa)</SelectItem>
            <SelectItem value="completed-asc">Concluídas Último</SelectItem>
            <SelectItem value="completed-desc">Concluídas Primeiro</SelectItem>
            <SelectItem value="createdAt-asc">Criadas (Crescente)</SelectItem>
            <SelectItem value="createdAt-desc">Criadas (Decrescente)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {loading && (
        <div className="flex justify-center mb-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
      <div className="space-y-2">
    {filteredTasks.map((task) => (
      <Card
        key={task._id}
        className={`flex items-center justify-between animate-in slide-in-from-top-3 duration-500 ${isOverdue(task.dueDate, task.completed) ? 'animate-shake border-destructive' : ''} ${task.priority === 'high' ? 'border-red-500' : task.priority === 'medium' ? 'border-yellow-500' : 'border-green-500'}`}
      >
        <CardContent className="p-4 flex items-center space-x-2 w-full">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => handleToggleComplete(task)}
            disabled={loading}
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              {task.priority === 'high' && <Flame className="h-4 w-4 text-red-500" />}
              {task.priority === 'medium' && <Tag className="h-4 w-4 text-yellow-500" />}
              {task.priority === 'low' && <Sprout className="h-4 w-4 text-green-500" />}
              <span className={task.completed ? 'line-through' : ''}>{task.title}</span>
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
            )}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              {task.dueDate && (
                <span className={isOverdue(task.dueDate, task.completed) ? 'text-destructive' : ''}>
                  Vence: {format(new Date(task.dueDate), 'PPP HH:mm')}
                </span>
              )}
              {task.dueDate && !task.completed && (
                <span className={isOverdue(task.dueDate, task.completed) ? 'text-destructive' : ''}>
                  {' | '}{task.timeRemaining || getTimeRemaining(task.dueDate)}
                </span>
              )}
              {task.dueDate && ' | '}Criada: {format(new Date(task.createdAt), 'PPP HH:mm')}
              {task.completedAt && ` | Concluída: ${format(new Date(task.completedAt), 'PPP HH:mm')}`}
            </div>
          </div> 
            </CardContent>
            <div className="p-4 space-x-2 flex items-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => setEditTask(task)} disabled={loading}>
                    Editar
                  </Button>
                </DialogTrigger>
                {editTask && editTask._id === task._id && (
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
                      <Textarea
                        value={editTask.description || ''}
                        onChange={(e) => setEditTask({ ...editTask, description: e.target.value.slice(0, 500) })}
                        placeholder="Descrição"
                        disabled={loading}
                      />
                      <Input
                        value={editTask.tags ? editTask.tags.join(', ') : ''}
                        onChange={(e) => setEditTask({ ...editTask, tags: e.target.value.split(',').map(t => t.trim()) })}
                        placeholder="Tags (separadas por vírgula)"
                        disabled={loading}
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" disabled={loading}>
                            {editTask.dueDate ? format(new Date(editTask.dueDate), 'PPP') : 'Data'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={editTask.dueDate ? new Date(editTask.dueDate) : null}
                            onSelect={(date) => setEditTask({ ...editTask, dueDate: date })}
                            disabled={loading}
                          />
                        </PopoverContent>
                      </Popover>
                      <Select
                        value={editTask.priority}
                        onValueChange={(value) => setEditTask({ ...editTask, priority: value })}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                        </SelectContent>
                      </Select>
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" onClick={() => setDeleteTaskId(task._id)} disabled={loading}>
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                {deleteTaskId === task._id && (
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir a tarefa "{task.title}"?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeleteTaskId(null)} disabled={loading}>
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteTask} disabled={loading}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                )}
              </AlertDialog>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Home;