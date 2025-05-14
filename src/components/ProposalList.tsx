import React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { Proposal, ProposalStatus } from "../types/proposal";
import { formatCurrency } from "../utils/proposalUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";

interface ProposalListProps {
  proposals: Proposal[];
  onEdit: (proposalId: string) => void;
  onDelete?: (proposalId: string) => void;
}

const ProposalList: React.FC<ProposalListProps> = ({ proposals, onEdit, onDelete }) => {
  const isMobile = useIsMobile();
  
  const getStatusBadgeVariant = (status: ProposalStatus) => {
    switch (status) {
      case "Fechada":
      case "Aprovada":
        return "success";
      case "Perdida":
      case "Reprovada":
        return "destructive";
      case "Em negociação":
        return "warning";
      case "Cancelada":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {proposals.length === 0 ? (
          <div className="text-center py-6">
            Nenhuma proposta encontrada
          </div>
        ) : (
          proposals.map((proposal) => (
            <Card key={proposal.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">{proposal.number}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {proposal.client}
                    </div>
                  </div>
                  <Badge
                    variant={getStatusBadgeVariant(proposal.status) as any}
                    className="whitespace-nowrap"
                  >
                    {proposal.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="text-muted-foreground">Data:</div>
                  <div className="text-right">{new Date(proposal.date).toLocaleDateString("pt-BR")}</div>
                  
                  <div className="text-muted-foreground">Gerente:</div>
                  <div className="text-right">{proposal.managerName}</div>
                  
                  <div className="text-muted-foreground">Valor Total:</div>
                  <div className="text-right font-semibold">{formatCurrency(proposal.totals.grandTotal)}</div>
                </div>
                
                <div className="border-t pt-2 flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(proposal.id)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  
                  {onDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-[90vw] w-[350px]">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Confirmar Exclusão
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir a proposta {proposal.number}? 
                            Esta ação não poderá ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => onDelete(proposal.id)} 
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Gerente</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Valor Total</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6">
                Nenhuma proposta encontrada
              </TableCell>
            </TableRow>
          ) : (
            proposals.map((proposal) => (
              <TableRow key={proposal.id}>
                <TableCell className="font-medium">{proposal.number}</TableCell>
                <TableCell>
                  <div>
                    <div>{proposal.client}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-xs">
                      {proposal.title}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(proposal.date).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>{proposal.managerName}</TableCell>
                <TableCell>
                  <Badge
                    variant={getStatusBadgeVariant(proposal.status) as any}
                    className="whitespace-nowrap"
                  >
                    {proposal.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatCurrency(proposal.totals.grandTotal)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(proposal.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {onDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Confirmar Exclusão
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a proposta {proposal.number}? 
                              Esta ação não poderá ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => onDelete(proposal.id)} 
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProposalList;
