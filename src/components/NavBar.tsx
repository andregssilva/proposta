
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, RefreshCw, User, Users, ChartBar, Menu, X, FileSpreadsheet, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout, user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso."
    });
    navigate('/login');
  };

  const handleRefresh = () => {
    // Ativa a animação
    setIsRefreshing(true);
    
    // Simula um tempo de carregamento para a atualização
    toast({
      title: "Atualizando sistema",
      description: "Aguarde enquanto os dados são atualizados..."
    });
    
    // Após 1.5 segundos, desativa a animação e mostra mensagem de sucesso
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Sistema atualizado",
        description: "Todos os dados foram atualizados com sucesso!",
        variant: "default",
      });
    }, 1500);
  };

  // Navegação para versão mobile com menu lateral
  const MobileMenu = () => (
    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Menu</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex flex-col gap-4">
            <Link 
              to="/" 
              className="text-sm font-medium flex items-center gap-2 p-2 hover:bg-accent rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Início
            </Link>
            
            {user?.isAdmin && (
              <>
                <Link 
                  to="/usuarios" 
                  className="text-sm font-medium flex items-center gap-2 p-2 hover:bg-accent rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Users className="h-4 w-4" />
                  Gerenciar Usuários
                </Link>
                <Link 
                  to="/dashboard" 
                  className="text-sm font-medium flex items-center gap-2 p-2 hover:bg-accent rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ChartBar className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link 
                  to="/importacao" 
                  className="text-sm font-medium flex items-center gap-2 p-2 hover:bg-accent rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Importar Dados
                </Link>
                <Link 
                  to="/migracao" 
                  className="text-sm font-medium flex items-center gap-2 p-2 hover:bg-accent rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Database className="h-4 w-4" />
                  Migração de BD
                </Link>
              </>
            )}
          </div>
          
          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-4 text-sm">
              <User className="h-4 w-4" />
              {user?.name} ({user?.isAdmin ? 'Administrador' : 'Usuário'})
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <nav className="bg-background border-b py-3 px-4 flex justify-between items-center">
      {/* Parte esquerda - Logo e links de navegação */}
      <div className="flex items-center gap-4">
        {isMobile && <MobileMenu />}
        
        <Link to="/" className={`text-xl font-semibold hover:text-primary transition-colors ${isMobile ? 'text-base' : ''}`}>
          MPS
        </Link>
        
        {!isMobile && (
          <>
            {user?.isAdmin && (
              <>
                <Link to="/usuarios" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Users className="h-4 w-4" /> 
                  Gerenciar Usuários
                </Link>
                <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <ChartBar className="h-4 w-4" /> 
                  Dashboard
                </Link>
                <Link to="/importacao" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <FileSpreadsheet className="h-4 w-4" /> 
                  Importar Dados
                </Link>
                <Link to="/migracao" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Database className="h-4 w-4" /> 
                  Migração de BD
                </Link>
              </>
            )}
          </>
        )}
      </div>
      
      {/* Parte direita - Usuário e botões */}
      <div className="flex items-center gap-2">
        {!isMobile && (
          <div className="flex items-center gap-2 text-sm mr-2">
            <User className="h-4 w-4" />
            <span>
              {user?.name} ({user?.isAdmin ? 'Admin' : 'Usuário'})
            </span>
          </div>
        )}
        
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          size={isMobile ? "sm" : "default"}
          className={`${isRefreshing ? 'animate-spin' : ''} ${isMobile ? 'px-3 py-1' : ''}`}
        >
          <RefreshCw className="h-4 w-4" /> 
          {!isMobile && (isRefreshing ? 'Atualizando...' : 'Atualizar')}
        </Button>
          
        <Button 
          variant="destructive" 
          onClick={handleLogout}
          size={isMobile ? "sm" : "default"}
          className={isMobile ? 'px-3 py-1' : ''}
        >
          <LogOut className="h-4 w-4" /> 
          {!isMobile && 'Logout'}
        </Button>
      </div>
    </nav>
  );
};

export default NavBar;
