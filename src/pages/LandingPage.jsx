import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">Bem-vindo ao TaskMaster</h1>
      <p className="text-lg mb-6 text-center max-w-md">
        Organize suas tarefas com facilidade, acompanhe prazos e aumente sua produtividade!
      </p>
      <div className="flex space-x-4 mb-8">
        <Button onClick={() => window.location.href = '/login'} size="lg">
          Login
        </Button>
        <Button onClick={() => window.location.href = '/login'} variant="outline" size="lg">
          Registrar
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
        <Card className="bg-white text-black">
          <CardHeader>
            <CardTitle>Gerencie Tarefas</CardTitle>
          </CardHeader>
          <CardContent>Crie, edite e organize suas tarefas com prioridades e tags.</CardContent>
        </Card>
        <Card className="bg-white text-black">
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
          </CardHeader>
          <CardContent>Receba lembretes sobre prazos e tarefas vencidas.</CardContent>
        </Card>
        <Card className="bg-white text-black">
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
          </CardHeader>
          <CardContent>Visualize seu progresso com gráficos interativos.</CardContent>
        </Card>
      </div>
    </div>
  );
}

export default LandingPage;