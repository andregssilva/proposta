
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Loader, Database, ServerCrash, CheckCircle } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const DatabaseMigration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'connecting' | 'creating' | 'complete' | 'error'>('idle');
  const [formData, setFormData] = useState({
    host: '',
    port: '5432',
    database: '',
    username: '',
    password: '',
  });

  // Check if user is admin
  if (!user?.isAdmin) {
    toast({
      title: "Acesso negado",
      description: "Você não tem permissão para acessar esta página.",
      variant: "destructive",
    });
    navigate('/');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const simulateMigration = async () => {
    // This function simulates a database migration process
    setIsLoading(true);
    setMigrationStatus('connecting');
    setProgress(10);

    try {
      // Simulate connection check
      await new Promise(resolve => setTimeout(resolve, 2000));
      setProgress(30);
      
      // Check if all fields are filled
      const requiredFields = ['host', 'database', 'username', 'password'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
      
      if (missingFields.length > 0) {
        throw new Error("Preencha todos os campos obrigatórios");
      }
      
      // Simulate table creation
      setMigrationStatus('creating');
      setProgress(50);
      
      // Simulate table creation (clients table)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(70);
      
      // Simulate table creation (products table)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(90);
      
      // Simulation complete
      setProgress(100);
      setMigrationStatus('complete');
      
      toast({
        title: "Migração concluída com sucesso",
        description: "O banco de dados foi migrado com sucesso para o seu servidor.",
      });
    } catch (error) {
      console.error('Migration error:', error);
      setMigrationStatus('error');
      toast({
        title: "Erro na migração",
        description: error instanceof Error ? error.message : "Ocorreu um erro durante a migração do banco de dados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      host: '',
      port: '5432',
      database: '',
      username: '',
      password: '',
    });
    setProgress(0);
    setMigrationStatus('idle');
  };

  // Migration status animation/display
  const renderMigrationStatus = () => {
    switch (migrationStatus) {
      case 'connecting':
        return (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <Loader className="h-16 w-16 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-medium">Conectando ao servidor...</h3>
            <p className="text-sm text-muted-foreground">Verificando credenciais de acesso</p>
          </div>
        );
      case 'creating':
        return (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <Database className="h-16 w-16 text-primary animate-pulse mb-4" />
            <h3 className="text-lg font-medium">Criando tabelas...</h3>
            <p className="text-sm text-muted-foreground">Configurando estrutura do banco de dados</p>
          </div>
        );
      case 'complete':
        return (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-medium">Migração concluída!</h3>
            <p className="text-sm text-muted-foreground">Seu banco de dados está pronto para uso</p>
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <ServerCrash className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-lg font-medium">Erro na migração</h3>
            <p className="text-sm text-muted-foreground">Verifique as credenciais e tente novamente</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      
      <div className="container mx-auto py-6 px-4 flex-1">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">Migração de Banco de Dados</h1>
          <p className="text-muted-foreground mt-2">
            Configure as credenciais para migrar o banco de dados para seu servidor
          </p>
        </header>

        <Separator className="mb-6" />

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Conexão</CardTitle>
              <CardDescription>
                Preencha os dados de conexão do seu servidor de banco de dados PostgreSQL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="host">Host / Endereço IP*</Label>
                  <Input 
                    id="host" 
                    name="host" 
                    placeholder="localhost ou endereço IP" 
                    value={formData.host}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="port">Porta</Label>
                  <Input 
                    id="port" 
                    name="port" 
                    placeholder="5432" 
                    value={formData.port}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="database">Nome do Banco de Dados*</Label>
                  <Input 
                    id="database" 
                    name="database" 
                    placeholder="nome_do_banco" 
                    value={formData.database}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="username">Usuário*</Label>
                  <Input 
                    id="username" 
                    name="username" 
                    placeholder="postgres" 
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha*</Label>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    placeholder="sua_senha" 
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" disabled={isLoading} onClick={resetForm}>
                Limpar
              </Button>
              <Button disabled={isLoading} onClick={simulateMigration}>
                {isLoading ? "Processando..." : "Iniciar Migração"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status da Migração</CardTitle>
              <CardDescription>
                Acompanhe o progresso da migração do banco de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium mb-2">Progresso da Migração</p>
                  <Progress value={progress} className="h-2 w-full" />
                  <p className="text-xs text-right mt-1 text-muted-foreground">{progress}%</p>
                </div>
                
                <AspectRatio ratio={16/9} className="bg-muted rounded-md overflow-hidden">
                  <div className="h-full w-full flex items-center justify-center">
                    {migrationStatus === 'idle' ? (
                      <div className="text-center p-6">
                        <Database className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Preencha os dados de conexão e inicie a migração
                        </p>
                      </div>
                    ) : (
                      renderMigrationStatus()
                    )}
                  </div>
                </AspectRatio>
                
                <div className="text-sm">
                  <p className="font-medium">O que será migrado:</p>
                  <ul className="list-disc list-inside text-muted-foreground ml-2 mt-2 space-y-1">
                    <li>Tabela de clientes</li>
                    <li>Tabela de produtos</li>
                    <li>Configurações do sistema</li>
                    <li>Estrutura de permissões</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DatabaseMigration;
