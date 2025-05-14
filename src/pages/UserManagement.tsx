import React, { useState, useEffect } from 'react';
import { useAuth, User, UserRole } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash, User as UserIcon, Users, UserPlus, UserX } from 'lucide-react';

const UserManagement = () => {
  const { 
    users, 
    createUser, 
    deleteUser, 
    updateUser,
    assignTeamMember,
    removeTeamMember,
    getSupervisors,
    user: currentUser 
  } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>("");
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
    username: '',
    password: '',
    name: '',
    isAdmin: false,
    role: 'manager',
    supervisorId: undefined,
    teamMembers: [],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Reset selected supervisor when tab changes
  useEffect(() => {
    if (activeTab === "teams") {
      const supervisors = getSupervisors();
      if (supervisors.length > 0 && !selectedSupervisorId) {
        setSelectedSupervisorId(supervisors[0].id);
      }
    }
  }, [activeTab, getSupervisors, selectedSupervisorId]);

  const handleCreateUser = () => {
    // Validação básica
    const validationErrors: Record<string, string> = {};
    
    if (!newUser.username) validationErrors.username = 'Usuário é obrigatório';
    if (!newUser.password) validationErrors.password = 'Senha é obrigatória';
    if (!newUser.name) validationErrors.name = 'Nome é obrigatório';
    if (!newUser.role) validationErrors.role = 'Função é obrigatória';
    
    // Verificar se o nome de usuário já existe
    if (users.some(u => u.username === newUser.username)) {
      validationErrors.username = 'Este nome de usuário já está em uso';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Preparar o usuário para criação
    const userToCreate = { ...newUser };
    
    // Create default team members array for supervisors
    if (userToCreate.role === 'supervisor' && !userToCreate.teamMembers) {
      userToCreate.teamMembers = [];
    }

    // Set default isAdmin based on role
    userToCreate.isAdmin = userToCreate.role === 'admin';

    try {
      // Criar o novo usuário
      createUser(userToCreate);
      
      // Limpar o formulário e fechar o diálogo
      setNewUser({
        username: '',
        password: '',
        name: '',
        isAdmin: false,
        role: 'manager',
        supervisorId: undefined,
        teamMembers: [],
      });
      setErrors({});
      setIsDialogOpen(false);
      
      toast({
        title: 'Usuário criado',
        description: `O usuário ${userToCreate.name} foi criado com sucesso.`
      });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      toast({
        title: 'Erro ao criar usuário',
        description: 'Ocorreu um erro ao criar o usuário. Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteUser = (userId: string, username: string) => {
    // Verificar se é possível excluir o usuário
    const result = deleteUser(userId);
    
    if (result) {
      toast({
        title: 'Usuário excluído',
        description: `O usuário ${username} foi excluído com sucesso.`
      });
    } else {
      toast({
        title: 'Não foi possível excluir',
        description: 'Não é possível excluir o usuário admin original ou seu próprio usuário.',
        variant: 'destructive'
      });
    }
  };

  const handleAddTeamMember = () => {
    if (selectedSupervisorId && selectedManagerId) {
      const manager = users.find(u => u.id === selectedManagerId);
      const supervisor = users.find(u => u.id === selectedSupervisorId);
      
      if (manager && supervisor) {
        assignTeamMember(selectedSupervisorId, selectedManagerId);
        
        toast({
          title: 'Equipe atualizada',
          description: `${manager.name} adicionado à equipe de ${supervisor.name}.`
        });
        
        setIsTeamDialogOpen(false);
        setSelectedManagerId('');
      }
    }
  };

  const handleRemoveTeamMember = (supervisorId: string, managerId: string) => {
    const manager = users.find(u => u.id === managerId);
    const supervisor = users.find(u => u.id === supervisorId);
    
    if (manager && supervisor) {
      removeTeamMember(supervisorId, managerId);
      
      toast({
        title: 'Membro removido',
        description: `${manager.name} removido da equipe de ${supervisor.name}.`
      });
    }
  };

  const getAvailableManagers = () => {
    return users.filter(u => 
      u.role === 'manager' && 
      (!u.supervisorId || u.supervisorId !== selectedSupervisorId)
    );
  };

  const getTeamMembers = (supervisorId: string) => {
    const supervisor = users.find(u => u.id === supervisorId);
    if (!supervisor || !supervisor.teamMembers) return [];
    
    return users.filter(u => supervisor.teamMembers?.includes(u.id));
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'supervisor': return 'Supervisor de Vendas';
      case 'manager': return 'Gerente de Vendas';
      default: return 'Usuário';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      
      <div className="container mx-auto py-6 px-4 flex-1">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground mt-2">
            Administre os usuários e equipes do sistema
          </p>
        </header>

        <Separator className="mb-6" />

        <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="teams">Equipes</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight">
                Usuários
              </h2>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Novo Usuário
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Supervisor</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const supervisorName = user.supervisorId ? 
                      users.find(u => u.id === user.supervisorId)?.name || '-' : 
                      '-';
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{getRoleLabel(user.role)}</TableCell>
                        <TableCell>{supervisorName}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            disabled={user.username === 'admin' || user.id === currentUser?.id}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="teams">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">
                  Gerenciamento de Equipes
                </h2>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Supervisores</CardTitle>
                    <CardDescription>
                      Selecione um supervisor para gerenciar sua equipe
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select 
                      value={selectedSupervisorId}
                      onValueChange={setSelectedSupervisorId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um supervisor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {getSupervisors().map(supervisor => (
                            <SelectItem key={supervisor.id} value={supervisor.id}>
                              {supervisor.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {selectedSupervisorId && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Membros da Equipe</CardTitle>
                      <CardDescription>
                        Gerentes de vendas vinculados a este supervisor
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-500">
                          {getTeamMembers(selectedSupervisorId).length} membros na equipe
                        </span>
                        <Button
                          size="sm"
                          onClick={() => setIsTeamDialogOpen(true)}
                          disabled={getAvailableManagers().length === 0}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Adicionar Membro
                        </Button>
                      </div>
                      
                      {getTeamMembers(selectedSupervisorId).length > 0 ? (
                        <ul className="space-y-2">
                          {getTeamMembers(selectedSupervisorId).map(member => (
                            <li key={member.id} className="flex justify-between items-center p-2 border rounded">
                              <div className="flex items-center">
                                <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{member.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveTeamMember(selectedSupervisorId, member.id)}
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="p-4 text-center border rounded bg-muted/40">
                          <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm text-gray-500">
                            Este supervisor não tem membros na equipe
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogo para criar novo usuário */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo para criar um novo usuário no sistema.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="username">Nome de Usuário</Label>
              <Input
                id="username"
                value={newUser.username}
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
              />
              {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Função</Label>
              <Select
                value={newUser.role}
                onValueChange={(value: UserRole) => setNewUser({...newUser, role: value})}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="supervisor">Supervisor de Vendas</SelectItem>
                  <SelectItem value="manager">Gerente de Vendas</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
            </div>
            
            {newUser.role === 'manager' && (
              <div className="grid gap-2">
                <Label htmlFor="supervisor">Supervisor</Label>
                <Select
                  value={newUser.supervisorId || ''}
                  onValueChange={(value) => setNewUser({...newUser, supervisorId: value || undefined})}
                >
                  <SelectTrigger id="supervisor">
                    <SelectValue placeholder="Selecione um supervisor (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {getSupervisors().map(supervisor => (
                      <SelectItem key={supervisor.id} value={supervisor.id}>
                        {supervisor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser}>
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para adicionar membro à equipe */}
      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Membro à Equipe</DialogTitle>
            <DialogDescription>
              Selecione um gerente de vendas para adicionar à equipe do supervisor.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="manager">Gerente de Vendas</Label>
              <Select
                value={selectedManagerId}
                onValueChange={setSelectedManagerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um gerente" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableManagers().map(manager => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTeamDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddTeamMember}>
              Adicionar à Equipe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
