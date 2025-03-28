import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Button } from '@/components/ui/button';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchTasks = async () => {
      if (!token) return;
      try {
        const res = await axios.get('https://taskmaster-backend-ceqf.onrender.com/api/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(res.data || []);
      } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
      }
    };
    fetchTasks();
  }, [token]);

  const data = {
    labels: ['Pendentes', 'Concluídas', 'Vencidas'],
    datasets: [
      {
        label: 'Tarefas',
        data: [
          tasks.filter(t => !t.completed).length,
          tasks.filter(t => t.completed).length,
          tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed).length,
        ],
        backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Resumo de Tarefas' } },
  };

  return (
    <div className="p-4 max-w-2xl mx-auto bg-background">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={() => window.location.href = '/home'}>Voltar</Button>
      </div>
      <Bar data={data} options={options} />
    </div>
  );
}

export default Dashboard;