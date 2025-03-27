import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post('https://taskmaster-backend-ceqf.onrender.com/api/auth/login', { email, password }, { timeout: 30000 });
      const token = res.data.token;
      console.log('Token recebido:', token); // Novo log
      localStorage.setItem('token', token);
      alert('Login bem-sucedido!');
      onLoginSuccess();
    } catch (error) {
      console.error('Erro ao fazer login:', error.response?.data || error.message);
      alert('Erro ao fazer login: ' + (error.response?.data?.error || 'Tente novamente'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login - TaskMaster</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button onClick={handleLogin} className="w-full" disabled={loading}>
              {loading ? 'Carregando...' : 'Entrar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;