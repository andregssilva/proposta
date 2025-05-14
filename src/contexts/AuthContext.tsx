
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Proposal } from '@/types/proposal';
import { v4 as uuidv4 } from 'uuid';

// Role type for users
export type UserRole = 'admin' | 'supervisor' | 'manager';

// Interface para usuários
export interface User {
  id: string;
  username: string;
  password: string;
  isAdmin: boolean;
  name: string;
  role: UserRole;
  supervisorId?: string; // ID of the supervisor (for managers)
  teamMembers?: string[]; // IDs of team members (for supervisors)
}

// Lista de usuários predefinidos
const initialUsers: User[] = [
  {
    id: uuidv4(),
    username: 'admin',
    password: 'admin123',
    isAdmin: true,
    name: 'Administrador',
    role: 'admin',
    teamMembers: []
  },
  {
    id: uuidv4(),
    username: 'aline',
    password: 'mudar123',
    isAdmin: false,
    name: 'Aline',
    role: 'manager',
    supervisorId: ''
  },
  {
    id: uuidv4(),
    username: 'supervisor1',
    password: 'mudar123',
    isAdmin: false,
    name: 'Carlos Supervisor',
    role: 'supervisor',
    teamMembers: []
  },
  {
    id: uuidv4(),
    username: 'supervisor2',
    password: 'mudar123',
    isAdmin: false,
    name: 'Maria Supervisora',
    role: 'supervisor',
    teamMembers: []
  },
  {
    id: uuidv4(),
    username: 'vendedor1',
    password: 'mudar123',
    isAdmin: false,
    name: 'João Vendas',
    role: 'manager',
    supervisorId: ''
  },
  {
    id: uuidv4(),
    username: 'vendedor2',
    password: 'mudar123',
    isAdmin: false,
    name: 'Ana Vendas',
    role: 'manager',
    supervisorId: ''
  },
  {
    id: uuidv4(),
    username: 'vendedor3',
    password: 'mudar123',
    isAdmin: false,
    name: 'Pedro Vendas',
    role: 'manager',
    supervisorId: ''
  },
  {
    id: uuidv4(),
    username: 'vendedor4',
    password: 'mudar123',
    isAdmin: false,
    name: 'Lucia Vendas',
    role: 'manager',
    supervisorId: ''
  },
  {
    id: uuidv4(),
    username: 'vendedor5',
    password: 'mudar123',
    isAdmin: false,
    name: 'Roberto Vendas',
    role: 'manager',
    supervisorId: ''
  },
  {
    id: uuidv4(),
    username: 'vendedor6',
    password: 'mudar123',
    isAdmin: false,
    name: 'Camila Vendas',
    role: 'manager',
    supervisorId: ''
  }
];

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  users: User[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  filterProposals: (proposals: Proposal[]) => Proposal[];
  createUser: (newUser: Omit<User, 'id'>) => User;
  deleteUser: (userId: string) => boolean;
  updateUser: (userId: string, userData: Partial<User>) => boolean;
  assignTeamMember: (supervisorId: string, managerId: string) => boolean;
  removeTeamMember: (supervisorId: string, managerId: string) => boolean;
  getSupervisors: () => User[];
  getTeamMembers: (supervisorId: string) => User[];
}

const AUTH_STORAGE_KEY = 'mps_auth_state';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  
  // Carrega usuários e estado de autenticação do localStorage na inicialização
  useEffect(() => {
    const loadUsersAndAuth = () => {
      // Carrega usuários
      const savedUsers = localStorage.getItem('users');
      
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      } else {
        setUsers(initialUsers);
        localStorage.setItem('users', JSON.stringify(initialUsers));
      }
      
      // Carrega estado de autenticação
      const authState = localStorage.getItem(AUTH_STORAGE_KEY);
      if (authState) {
        try {
          const { user: savedUser } = JSON.parse(authState);
          if (savedUser) {
            console.log('Restaurando sessão do usuário:', savedUser.username);
            setUser(savedUser);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Erro ao restaurar a sessão:', error);
          // Em caso de erro, limpa o localStorage
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    };

    loadUsersAndAuth();
  }, []);

  // Persiste o estado de autenticação sempre que mudar
  useEffect(() => {
    if (isAuthenticated && user) {
      const authState = JSON.stringify({ user });
      localStorage.setItem(AUTH_STORAGE_KEY, authState);
      console.log('Sessão salva para:', user.username);
    } else if (!isAuthenticated) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      console.log('Sessão removida');
    }
  }, [isAuthenticated, user]);

  const login = (username: string, password: string): boolean => {
    // Log para debug
    console.log('Tentativa de login:', username);
    
    const foundUser = users.find(
      u => u.username === username && u.password === password
    );

    if (foundUser) {
      setUser(foundUser);
      setIsAuthenticated(true);
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const createUser = (newUser: Omit<User, 'id'>): User => {
    const userWithId = { ...newUser, id: uuidv4() };
    const updatedUsers = [...users, userWithId];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    return userWithId;
  };

  const updateUser = (userId: string, userData: Partial<User>): boolean => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;
    
    const updatedUsers = [...users];
    updatedUsers[userIndex] = { ...updatedUsers[userIndex], ...userData };
    
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Update current user if this is the logged in user
    if (user && user.id === userId) {
      setUser({ ...user, ...userData });
    }
    
    return true;
  };

  const deleteUser = (userId: string): boolean => {
    // Não permite excluir o próprio usuário logado
    if (user?.id === userId) return false;
    
    // Não permite excluir o usuário admin original
    const isOriginalAdmin = users.find(u => u.id === userId && u.username === 'admin');
    if (isOriginalAdmin) return false;

    // Remove from supervisor's team if applicable
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.role === 'manager' && userToDelete.supervisorId) {
      const supervisor = users.find(u => u.id === userToDelete.supervisorId);
      if (supervisor && supervisor.teamMembers) {
        const updatedSupervisor = {
          ...supervisor,
          teamMembers: supervisor.teamMembers.filter(id => id !== userId)
        };
        updateUser(supervisor.id, updatedSupervisor);
      }
    }

    // If supervisor, remove supervisor references from managers
    if (userToDelete?.role === 'supervisor') {
      users.forEach(u => {
        if (u.role === 'manager' && u.supervisorId === userId) {
          updateUser(u.id, { supervisorId: undefined });
        }
      });
    }

    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    return true;
  };

  // Get all supervisors
  const getSupervisors = (): User[] => {
    return users.filter(u => u.role === 'supervisor' || u.role === 'admin');
  };

  // Get team members for a supervisor
  const getTeamMembers = (supervisorId: string): User[] => {
    const supervisor = users.find(u => u.id === supervisorId);
    if (!supervisor || !supervisor.teamMembers) return [];
    
    return users.filter(u => supervisor.teamMembers?.includes(u.id));
  };

  // Assign a manager to a supervisor's team
  const assignTeamMember = (supervisorId: string, managerId: string): boolean => {
    const supervisor = users.find(u => u.id === supervisorId);
    const manager = users.find(u => u.id === managerId);
    
    if (!supervisor || !manager || manager.role !== 'manager') return false;
    
    // If manager already has a different supervisor, remove from that team
    if (manager.supervisorId && manager.supervisorId !== supervisorId) {
      const currentSupervisor = users.find(u => u.id === manager.supervisorId);
      if (currentSupervisor && currentSupervisor.teamMembers) {
        updateUser(currentSupervisor.id, {
          teamMembers: currentSupervisor.teamMembers.filter(id => id !== managerId)
        });
      }
    }
    
    // Add to new supervisor's team
    const teamMembers = supervisor.teamMembers || [];
    if (!teamMembers.includes(managerId)) {
      updateUser(supervisorId, {
        teamMembers: [...teamMembers, managerId]
      });
    }
    
    // Update manager's supervisor reference
    updateUser(managerId, { supervisorId });
    
    return true;
  };

  // Remove a manager from a supervisor's team
  const removeTeamMember = (supervisorId: string, managerId: string): boolean => {
    const supervisor = users.find(u => u.id === supervisorId);
    const manager = users.find(u => u.id === managerId);
    
    if (!supervisor || !manager || !supervisor.teamMembers) return false;
    
    // Remove from supervisor's team
    updateUser(supervisorId, {
      teamMembers: supervisor.teamMembers.filter(id => id !== managerId)
    });
    
    // Remove supervisor reference from manager
    updateUser(managerId, { supervisorId: undefined });
    
    return true;
  };

  // Função para filtrar propostas com base no tipo de usuário
  const filterProposals = (proposals: Proposal[]): Proposal[] => {
    if (!user) return [];
    
    // Admins veem todas as propostas
    if (user.isAdmin || user.role === 'admin') return proposals;
    
    // Supervisores veem propostas da sua equipe e próprias
    if (user.role === 'supervisor') {
      const teamIds = user.teamMembers || [];
      const teamManagerNames = users
        .filter(u => teamIds.includes(u.id))
        .map(u => u.name.toLowerCase());
      
      return proposals.filter(proposal => 
        proposal.managerName.toLowerCase().includes(user.name.toLowerCase()) ||
        teamManagerNames.some(name => 
          proposal.managerName.toLowerCase().includes(name)
        )
      );
    }
    
    // Usuários comuns (gerentes) veem apenas propostas onde são gerentes
    return proposals.filter(proposal => 
      proposal.managerName.toLowerCase().includes(user.name.toLowerCase())
    );
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      users,
      login,
      logout,
      filterProposals,
      createUser,
      deleteUser,
      updateUser,
      assignTeamMember,
      removeTeamMember,
      getSupervisors,
      getTeamMembers
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
