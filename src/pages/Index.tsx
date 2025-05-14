
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import ProposalForm from "@/components/ProposalForm";
import ProposalList from "@/components/ProposalList";
import NavBar from "@/components/NavBar";
import { Proposal } from "@/types/proposal";
import { mockProposals } from "@/data/mockData";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { toast } = useToast();
  const { filterProposals, user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>(mockProposals);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);

  // Filtra as propostas baseado no tipo de usuário
  const visibleProposals = filterProposals(proposals);

  const handleSaveProposal = (proposal: Proposal) => {
    if (editingProposalId) {
      // Update existing proposal
      setProposals(proposals.map(p => p.id === proposal.id ? proposal : p));
      toast({
        title: "Proposta atualizada",
        description: `A proposta ${proposal.number} foi atualizada com sucesso.`
      });
    } else {
      // Add new proposal
      setProposals([proposal, ...proposals]);
      toast({
        title: "Proposta criada",
        description: `A proposta ${proposal.number} foi criada com sucesso.`
      });
    }
    
    setIsCreating(false);
    setEditingProposalId(null);
  };

  const handleEditProposal = (proposalId: string) => {
    setEditingProposalId(proposalId);
    setIsCreating(true);
  };

  const handleCancelEdit = () => {
    setIsCreating(false);
    setEditingProposalId(null);
  };

  const handleDeleteProposal = (proposalId: string) => {
    // Remove a proposta da lista
    setProposals(proposals.filter(p => p.id !== proposalId));
    
    // Exibe mensagem de confirmação
    toast({
      title: "Proposta excluída",
      description: "A proposta foi excluída com sucesso.",
      variant: "default",
    });
  };

  const editingProposal = editingProposalId 
    ? proposals.find(p => p.id === editingProposalId)
    : undefined;

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      
      <div className="container mx-auto py-6 px-4 flex-1">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">Gestão de Propostas</h1>
          <p className="text-muted-foreground mt-2">
            Sistema de gerenciamento de propostas comerciais
          </p>
          {!user?.isAdmin && (
            <p className="text-sm mt-1 text-muted-foreground">
              Visualizando apenas propostas gerenciadas por {user?.name}
            </p>
          )}
        </header>

        <Separator className="mb-6" />

        {isCreating ? (
          <ProposalForm 
            initialProposal={editingProposal}
            onSave={handleSaveProposal} 
            onCancel={handleCancelEdit}
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Propostas
              </h2>
              <Button onClick={() => setIsCreating(true)} size="sm" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 sm:mr-2" /> 
                <span className="hidden sm:inline">Nova Proposta</span>
                <span className="inline sm:hidden">Adicionar</span>
              </Button>
            </div>

            <ProposalList 
              proposals={visibleProposals} 
              onEdit={handleEditProposal}
              onDelete={handleDeleteProposal}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
