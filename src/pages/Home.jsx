import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import axios from 'axios';

function Home() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(res.data);
      } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
      }
    };
    if (token) fetchTasks();
  }, [token]);

  const handleAddTask = async () => {
    try {
      const res = await axios.post(
        'http://localhost:5000/api/tasks',
        { title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks([...tasks, res.data]);
      setTitle('');
    } catch (error) {
      alert('Erro ao adicionar tarefa');
    }
  };

  const handleUpdateTask = async () => {
    if (!editTask) return;
    try {
      const res = await axios.put(
        `http://localhost:5000/api/tasks/${editTask._id}`,
        editTask,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.map((t) => (t._id === editTask._id ? res.data : t)));
      setEditTask(null);
    } catch (error) {
      alert('Erro ao atualizar tarefa');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (error) {
      alert('Erro ao excluir tarefa');
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const updatedTask = { ...task, completed: !task.completed };
      const res = await axios.put(
        `http://localhost:5000/api/tasks/${task._id}`,
        updatedTask,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.map((t) => (t._id === task._id ? res.data : t)));
    } catch (error) {
      alert('Erro ao atualizar status da tarefa');
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true; // all
  });

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Minhas Tarefas</h1>
      <div className="flex space-x-2 mb-4">
        <Input
          placeholder="Nova tarefa"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button onClick={handleAddTask}>Adicionar</Button>
      </div>
      <div className="flex space-x-2 mb-4">
        <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
          Todas
        </Button>
        <Button variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')}>
          Pendentes
        </Button>
        <Button variant={filter === 'completed' ? 'default' : 'outline'} onClick={() => setFilter('completed')}>
          Concluídas
        </Button>
      </div>
      <div className="space-y-2">
        {filteredTasks.map((task) => (
          <Card key={task._id} className="flex items-center justify-between">
            <CardContent className="p-4 flex items-center space-x-2">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => handleToggleComplete(task)}
              />
              <span className={task.completed ? 'line-through' : ''}>{task.title}</span>
            </CardContent>
            <div className="p-4 space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => setEditTask(task)}>
                    Editar
                  </Button>
                </DialogTrigger>
                {editTask && (
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Tarefa</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        value={editTask.title}
                        onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                      />
                      <Checkbox
                        checked={editTask.completed}
                        onCheckedChange={(checked) => setEditTask({ ...editTask, completed: checked })}
                      />
                      <Button onClick={handleUpdateTask}>Salvar</Button>
                    </div>
                  </DialogContent>
                )}
              </Dialog>
              <Button variant="destructive" onClick={() => handleDeleteTask(task._id)}>
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