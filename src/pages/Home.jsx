import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from '@/components/ui/alert-dialog'; // Corrigido
import { format } from 'date-fns';
import axios from 'axios';

function Home() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate-asc');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchTasks = async () => {
      if (!token) return;
      setLoading(true);
      try {
        console.log('[1] Buscando tarefas com sort:', sortBy); // Log 1: Ordenação
        const res = await axios.get(`https://taskmaster-backend-ceqf.onrender.com/api/tasks?sort=${sortBy}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(res.data || []);
      } catch (error) {
        console.error('Erro ao buscar tarefas:', error.response?.data || error.message);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [token, sortBy]);

  const handleAddTask = async () => {
    if (!token) return;
    setLoading(true);
    try {
      console.log('[2] Adicionando tarefa:', { title, description, priority, dueDate }); // Log 2: Descrição
      const res = await axios.post(
        'https://taskmaster-backend-ceqf.onrender.com/api/tasks',
        { title, description, priority, dueDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prevTasks) => [...prevTasks, res.data]);
      setTitle('');
      setDescription('');
      setPriority('medium');
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
      console.log('[3] Atualizando tarefa:', editTask); // Log 3: Edição
      const res = await axios.put(
        `https://taskmaster-backend-ceqf.onrender.com/api/tasks/${editTask._id}`,
        editTask,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prevTasks) => prevTasks.map((t) => (t._id === editTask._id ? res.data : t)));
      setEditTask(null);
    } catch (error) {
      alert('Erro ao atualizar tarefa');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!token || !deleteTaskId) return;
    setLoading(true);
    try {
      console.log('[6] Excluindo tarefa com ID:', deleteTaskId); // Log 6: Confirmação de exclusão
      await axios.delete(`https://taskmaster-backend-ceqf.onrender.com/api/tasks/${deleteTaskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prevTasks) => prevTasks.filter((t) => t._id !== deleteTaskId));
      setDeleteTaskId(null);
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
      console.log('[10] Alterando status da tarefa:', task._id, 'para', !task.completed); // Log 10: Datas de conclusão
      const updatedTask = { ...task, completed: !task.completed };
      const res = await axios.put(
        `https://taskmaster-backend-ceqf.onrender.com/api/tasks/${task._id}`,
        updatedTask,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prevTasks) => prevTasks.map((t) => (t._id === task._id ? res.data : t)));
    } catch (error) {
      alert('Erro ao atualizar status da tarefa');
    } finally {
      setLoading(false);
    }
  };

  const handleExportTasks = () => {
    console.log('[5] Exportando tarefas:', tasks.length); // Log 5: Exportar
    const json = JSON.stringify(tasks, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportTasks = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedTasks = JSON.parse(event.target.result);
        console.log('[5] Importando tarefas:', importedTasks.length); // Log 5: Importar
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
        alert('Tarefas importadas com sucesso!');
      } catch (error) {
        alert('Erro ao importar tarefas: ' + (error.response?.data?.error || 'Formato inválido'));
      }
    };
    reader.readAsText(file);
  };

  const handleLogout = () => {
    console.log('[7] Logout realizado'); // Log 7: Logout
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const isOverdue = (date, completed) => date && new Date(date) < new Date() && !completed;

  const filteredTasks = (tasks || []).filter((task) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'pending' && !task.completed) ||
      (filter === 'completed' && task.completed) ||
      (filter === 'overdue' && isOverdue(task.dueDate, task.completed));
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(search.toLowerCase()));
    console.log('[4] Filtrando tarefa:', task.title, 'matchesFilter:', matchesFilter, 'matchesSearch:', matchesSearch); // Log 4: Busca
    return matchesFilter && matchesSearch;
  });

  const overdueCount = (tasks || []).filter((t) => isOverdue(t.dueDate, t.completed)).length;
  const pendingCount = (tasks || []).filter((t) => !t.completed).length;
  const completedCount = (tasks || []).filter((t) => t.completed).length;
  console.log('[3] Contagem de tarefas - Vencidas:', overdueCount, 'Pendentes:', pendingCount, 'Concluídas:', completedCount); // Log 3: Notificações

  return (
    <div className="p-4 max-w-2xl mx-auto bg-background">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Minhas Tarefas</h1>
        <Button variant="outline" onClick={handleLogout} disabled={loading}>
          Logout
        </Button>
      </div>
      <div className="flex space-x-2 mb-4">
        <Badge variant="secondary">Pendentes: {pendingCount}</Badge>
        <Badge variant="success">Concluídas: {completedCount}</Badge>
        {overdueCount > 0 && <Badge variant="destructive">Vencidas: {overdueCount}</Badge>}
      </div>
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
            <Calendar mode="single" selected={dueDate} onSelect={setDueDate} disabled={loading} />
          </PopoverContent>
        </Popover>
        <Select value={priority} onValueChange={(val) => { setPriority(val); console.log('[2] Prioridade alterada para:', val); }} disabled={loading}> {/* Log 2: Prioridade */}
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Baixa</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleAddTask} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Adicionar'}
        </Button>
      </div>
      <Textarea
        placeholder="Descrição (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mb-4"
        disabled={loading}
      />
      <div className="flex space-x-2 mb-4">
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
            className={`flex items-center justify-between animate-in slide-in-from-top-3 duration-500 ${isOverdue(task.dueDate, task.completed) ? 'animate-shake border-destructive' : ''} ${task.priority === 'high' ? 'border-red-500' : task.priority === 'medium' ? 'border-yellow-500' : 'border-green-500'}`} // Log 8: Melhorias visuais implícitas
          >
            <CardContent className="p-4 flex items-center space-x-2 w-full">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => handleToggleComplete(task)}
                disabled={loading}
              />
              <div className="flex-1">
                <span className={task.completed ? 'line-through' : ''}>{task.title}</span>
                {task.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                )}
                <div className="text-xs text-muted-foreground">
                  {task.dueDate && (
                    <span className={isOverdue(task.dueDate, task.completed) ? 'text-destructive' : ''}>
                      Vence: {format(new Date(task.dueDate), 'PPP')}
                    </span>
                  )}
                  {task.dueDate && ' | '}Criada: {format(new Date(task.createdAt), 'PPP')}
                  {task.completedAt && ` | Concluída: ${format(new Date(task.completedAt), 'PPP')}`}
                </div>
              </div>
            </CardContent>
            <div className="p-4 space-x-2">
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
                        onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                        placeholder="Descrição"
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