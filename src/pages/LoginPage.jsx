import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post('https://taskmaster-backend-ceqf.onrender.com/api/auth/login', {
        email,
        password,
      });
      localStorage.setItem('token', res.data.token);
      console.log('Token recebido:', res.data.token);
      window.location.href = '/home';
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post('https://taskmaster-backend-ceqf.onrender.com/api/auth/register', {
        email,
        password,
      });
      handleLogin();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao registrar');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="p-6 bg-card rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">TaskMaster</h1>
        {error && <p className="text-destructive mb-4">{error}</p>}
        <Input
          type="email"
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
        <Button onClick={handleLogin} className="w-full mb-2">
          Login
        </Button>
        <Button onClick={handleRegister} variant="outline" className="w-full">
          Registrar
        </Button>
      </div>
    </div>
  );
}

export default LoginPage;