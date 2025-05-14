
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="text-center bg-card border rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-16 w-16 text-destructive" />
        </div>
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-xl text-destructive mb-2">Página não encontrada</p>
        <p className="text-muted-foreground mb-6">
          A URL <span className="font-mono bg-muted-foreground/10 px-1 rounded">
            {location.pathname}
          </span> não existe no sistema.
        </p>
        <div className="flex flex-col gap-2">
          <Link to="/">
            <Button className="w-full" variant="default">
              Voltar para a página inicial
            </Button>
          </Link>
          <Link to="/login">
            <Button className="w-full" variant="outline">
              Ir para a página de login
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-6 text-xs text-muted-foreground">
        Código de erro: NOT_FOUND
      </div>
    </div>
  );
};

export default NotFound;
