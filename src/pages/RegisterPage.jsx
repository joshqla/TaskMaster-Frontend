import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      await axios.post('https://taskmaster-backend-ceqf.onrender.com/api/auth/register', { email, password });
      alert('Usuário registrado! Faça login.');
      window.location.href = '/login';
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao registrar');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="p-6 bg-card rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Registrar no TaskMaster</h2>
        {error && <p className="text-destructive mb-4">{error}</p>}
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4"
        />
        <div className="relative mb-4">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <Button onClick={handleRegister} className="w-full mb-2">Registrar</Button>
        <p className="text-center text-sm">
          Já tem conta? <a href="/login" className="text-blue-500 hover:underline">Faça login</a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;