
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Calculator, Save, AlertTriangle, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProposalItem from "./ProposalItem";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Proposal,
  ProposalItem as ProposalItemType,
  Manager,
  ContractType,
  Classification,
  Opportunity,
  ProposalStatus,
  Equipment,
} from "../types/proposal";
import {
  generateProposalNumber,
  calculateProposalTotals,
  formatCurrency,
  validateProposal,
  validateProposalItem,
} from "../utils/proposalUtils";
import {
  managers,
  equipments,
  contractTypes,
  classifications,
  opportunities,
  proposalStatuses,
} from "../data/mockData";
import ClientAutocomplete from "./ClientAutocomplete";
import { useClients } from "@/hooks/use-clients";

interface ProposalFormProps {
  initialProposal?: Proposal;
  onSave: (proposal: Proposal) => void;
  onCancel: () => void;
}

const ProposalForm: React.FC<ProposalFormProps> = ({
  initialProposal,
  onSave,
  onCancel,
}) => {
  const { toast } = useToast();
  const [proposal, setProposal] = useState<Proposal>(() => {
    if (initialProposal) {
      return { ...initialProposal };
    }

    const today = new Date().toISOString().split("T")[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    return {
      id: uuidv4(),
      number: generateProposalNumber(),
      date: today,
      validUntil: nextMonth.toISOString().split("T")[0],
      managerId: "",
      managerName: "",
      title: "",
      client: "",
      contact: "",
      contractType: "Taxa Fixa" as ContractType,
      classification: "Novo" as Classification,
      opportunity: "MPS" as Opportunity,
      term: 12,
      status: "Em aberto" as ProposalStatus,
      probability: 50,
      observation: "",
      items: [],
      totals: {
        fixedRateTotal: 0,
        productionTotal: 0,
        grandTotal: 0,
      },
    };
  });
  
  const { clients, isLoading: clientsLoading } = useClients();
  const [errors, setErrors] = useState<Partial<Record<keyof Proposal, boolean>>>({});
  const [itemErrors, setItemErrors] = useState<Record<string, Partial<Record<keyof ProposalItemType, boolean>>>>({});

  const handleFieldChange = (field: keyof Proposal, value: any) => {
    setProposal((prev) => ({ ...prev, [field]: value }));
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleManagerChange = (managerId: string) => {
    const selectedManager = managers.find((m) => m.id === managerId);
    if (selectedManager) {
      setProposal((prev) => ({
        ...prev,
        managerId,
        managerName: selectedManager.name,
      }));
      
      // Clear managerId error if it exists
      if (errors.managerId) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.managerId;
          return newErrors;
        });
      }
    }
  };

  const handleAddItem = () => {
    const newItem: ProposalItemType = {
      id: uuidv4(),
      equipmentId: "",
      equipmentName: "",
      unitValue: 0,
      quantity: 1,
      monthlyVolumePB: 0,
      monthlyVolumeColor: 0,
      costPB: 0.05,
      costColor: 0.15,
      costLabor: 0,
      costParts: 0,
    };

    setProposal((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleItemChange = (updatedItem: ProposalItemType) => {
    setProposal((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      ),
    }));
    
    // Clear errors for this item if they exist
    if (itemErrors[updatedItem.id]) {
      setItemErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[updatedItem.id];
        return newErrors;
      });
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setProposal((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
    
    // Remove errors for this item if they exist
    if (itemErrors[itemId]) {
      setItemErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[itemId];
        return newErrors;
      });
    }
  };

  const calculateTotals = () => {
    // Validate proposal
    const { valid: proposalValid, errors: proposalErrors } = validateProposal(proposal);
    setErrors(proposalErrors);
    
    if (!proposalValid) {
      toast({
        title: "Campos obrigatórios não preenchidos",
        description: "Preencha todos os campos obrigatórios marcados em vermelho",
        variant: "destructive",
      });
      return;
    }
    
    // Validate all items
    let allItemsValid = true;
    const newItemErrors: Record<string, Partial<Record<keyof ProposalItemType, boolean>>> = {};
    
    proposal.items.forEach(item => {
      const { valid, errors } = validateProposalItem(item);
      if (!valid) {
        allItemsValid = false;
        newItemErrors[item.id] = errors;
      }
    });
    
    setItemErrors(newItemErrors);
    
    if (!allItemsValid) {
      toast({
        title: "Itens com campos inválidos",
        description: "Corrija os campos marcados em vermelho nos itens da proposta",
        variant: "destructive",
      });
      return;
    }
    
    const totals = calculateProposalTotals(proposal.items, proposal.term);
    setProposal((prev) => ({
      ...prev,
      totals,
    }));
    
    toast({
      title: "Totais calculados",
      description: "Os valores totais da proposta foram atualizados",
    });
  };

  const handleSave = () => {
    // Form validation
    const { valid, errors: validationErrors } = validateProposal(proposal);
    setErrors(validationErrors);
    
    if (!valid) {
      toast({
        title: "Campos obrigatórios não preenchidos",
        description: "Preencha todos os campos obrigatórios marcados em vermelho",
        variant: "destructive",
      });
      return;
    }

    // Calculate totals before saving
    const totals = calculateProposalTotals(proposal.items, proposal.term);
    const updatedProposal = {
      ...proposal,
      totals,
    };

    // Save the proposal
    onSave(updatedProposal);
  };

  // Auto-calculate totals when items change or term changes
  useEffect(() => {
    const totals = calculateProposalTotals(proposal.items, proposal.term);
    setProposal((prev) => ({
      ...prev,
      totals,
    }));
  }, [proposal.items, proposal.term]);
  
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      toast({
        title: "Erro ao imprimir",
        description: "Não foi possível abrir a janela de impressão. Verifique se os pop-ups estão permitidos.",
        variant: "destructive",
      });
      return;
    }
    
    // Get current date formatted
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    // Generate print content with styling
    const printContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Proposta ${proposal.number}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            line-height: 1.5;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-weight: bold;
            font-size: 24px;
            margin-bottom: 10px;
          }
          .proposal-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .info-section {
            margin-bottom: 20px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .info-item {
            margin-bottom: 8px;
          }
          .info-label {
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          .totals {
            margin-top: 30px;
            text-align: right;
          }
          .total-row {
            margin-bottom: 5px;
          }
          .grand-total {
            font-weight: bold;
            font-size: 16px;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .observation {
            margin-top: 20px;
            padding: 10px;
            border: 1px solid #ddd;
            background-color: #f9f9f9;
          }
          .page-break {
            page-break-after: always;
          }
          @media print {
            body {
              margin: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Gestão de Propostas - MPS</div>
          <div>Data de Impressão: ${currentDate}</div>
        </div>
        
        <div class="proposal-title">
          ${proposal.title}
        </div>
        
        <div class="info-section">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Número da Proposta:</span> ${proposal.number}
            </div>
            <div class="info-item">
              <span class="info-label">Data da Proposta:</span> ${new Date(proposal.date).toLocaleDateString('pt-BR')}
            </div>
            <div class="info-item">
              <span class="info-label">Data de Validade:</span> ${new Date(proposal.validUntil).toLocaleDateString('pt-BR')}
            </div>
            <div class="info-item">
              <span class="info-label">Gerente da Conta:</span> ${proposal.managerName}
            </div>
            <div class="info-item">
              <span class="info-label">Cliente:</span> ${proposal.client}
            </div>
            <div class="info-item">
              <span class="info-label">Contato:</span> ${proposal.contact || "-"}
            </div>
            <div class="info-item">
              <span class="info-label">Tipo de Contrato:</span> ${proposal.contractType}
            </div>
            <div class="info-item">
              <span class="info-label">Classificação:</span> ${proposal.classification}
            </div>
            <div class="info-item">
              <span class="info-label">Oportunidade:</span> ${proposal.opportunity}
            </div>
            <div class="info-item">
              <span class="info-label">Prazo:</span> ${proposal.term} meses
            </div>
            <div class="info-item">
              <span class="info-label">Status:</span> ${proposal.status}
            </div>
            <div class="info-item">
              <span class="info-label">Probabilidade:</span> ${proposal.probability}%
            </div>
          </div>
        </div>
        
        <h3>Itens da Proposta</h3>
        
        <table>
          <thead>
            <tr>
              <th>Equipamento</th>
              <th>Valor Unitário</th>
              <th>Quantidade</th>
              <th>Volume PB</th>
              <th>Volume Color</th>
            </tr>
          </thead>
          <tbody>
            ${proposal.items.map(item => `
              <tr>
                <td>${item.equipmentName}</td>
                <td>R$ ${item.unitValue.toFixed(2).replace('.', ',')}</td>
                <td>${item.quantity}</td>
                <td>${item.monthlyVolumePB.toLocaleString('pt-BR')}</td>
                <td>${item.monthlyVolumeColor.toLocaleString('pt-BR')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <div class="total-row">
            <span class="info-label">Taxa Fixa Total:</span> 
            ${formatCurrency(proposal.totals.fixedRateTotal)}
          </div>
          <div class="total-row">
            <span class="info-label">Produção Total (${proposal.term} meses):</span> 
            ${formatCurrency(proposal.totals.productionTotal)}
          </div>
          <div class="total-row grand-total">
            <span class="info-label">Total Geral:</span> 
            ${formatCurrency(proposal.totals.grandTotal)}
          </div>
        </div>
        
        ${proposal.observation ? `
          <div class="observation">
            <div class="info-label">Observação:</div>
            <div>${proposal.observation}</div>
          </div>
        ` : ''}
        
        <div class="footer">
          <p>Proposta gerada pelo sistema de Gestão de Propostas - MPS</p>
          <p>© 2025 - Todos os direitos reservados</p>
        </div>
      </body>
      </html>
    `;
    
    // Write content to the new window and trigger print
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load and then print
    printWindow.onload = function() {
      printWindow.print();
      // No need to close the window - user can decide to close after printing
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl sm:text-3xl font-bold tracking-tight">
          {initialProposal ? "Editar Proposta" : "Nova Proposta"}
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onCancel} size="sm" className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button variant="outline" onClick={handlePrint} size="sm" className="w-full sm:w-auto">
            <Printer className="h-4 w-4 mr-1 sm:mr-2" /> 
            <span>Imprimir</span>
          </Button>
          <Button onClick={handleSave} size="sm" className="w-full sm:w-auto">
            <Save className="h-4 w-4 mr-1 sm:mr-2" /> 
            <span>Salvar</span>
          </Button>
        </div>
      </div>

      <Separator />

      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Por favor, preencha todos os campos obrigatórios destacados em vermelho.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <Label htmlFor="proposal-number" className="block text-sm font-medium mb-1">
                Número da Proposta
              </Label>
              <Input
                id="proposal-number"
                value={proposal.number}
                disabled
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="proposal-date" className="block text-sm font-medium mb-1">
                Data da Proposta
              </Label>
              <Input
                id="proposal-date"
                type="date"
                value={proposal.date}
                onChange={(e) => handleFieldChange("date", e.target.value)}
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="valid-until" className="block text-sm font-medium mb-1">
                Data de Validade
              </Label>
              <Input
                id="valid-until"
                type="date"
                value={proposal.validUntil}
                onChange={(e) => handleFieldChange("validUntil", e.target.value)}
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="manager" className={`block text-sm font-medium mb-1 ${errors.managerId ? "text-destructive" : ""}`}>
                Gerente da Conta *
              </Label>
              <Select
                value={proposal.managerId}
                onValueChange={handleManagerChange}
              >
                <SelectTrigger id="manager" className={errors.managerId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Selecione um gerente" />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="title" className={`block text-sm font-medium mb-1 ${errors.title ? "text-destructive" : ""}`}>
                Título da Proposta *
              </Label>
              <Input
                id="title"
                value={proposal.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                className={errors.title ? "border-destructive" : ""}
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="client" className={`block text-sm font-medium mb-1 ${errors.client ? "text-destructive" : ""}`}>
                Cliente (Empresa) *
              </Label>
              <ClientAutocomplete 
                value={proposal.client}
                onChange={(value) => handleFieldChange("client", value)}
                error={!!errors.client}
              />
            </div>

            {/* Continue with the rest of the form */}
            <div className="space-y-2.5">
              <Label htmlFor="contact" className="block text-sm font-medium mb-1">
                Contato
              </Label>
              <Input
                id="contact"
                value={proposal.contact}
                onChange={(e) => handleFieldChange("contact", e.target.value)}
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="contract-type" className="block text-sm font-medium mb-1">
                Tipo de Contrato
              </Label>
              <Select
                value={proposal.contractType}
                onValueChange={(value) =>
                  handleFieldChange("contractType", value as ContractType)
                }
              >
                <SelectTrigger id="contract-type">
                  <SelectValue placeholder="Selecione o tipo de contrato" />
                </SelectTrigger>
                <SelectContent>
                  {contractTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="classification" className="block text-sm font-medium mb-1">
                Classificação
              </Label>
              <Select
                value={proposal.classification}
                onValueChange={(value) =>
                  handleFieldChange("classification", value as Classification)
                }
              >
                <SelectTrigger id="classification">
                  <SelectValue placeholder="Selecione a classificação" />
                </SelectTrigger>
                <SelectContent>
                  {classifications.map((classification) => (
                    <SelectItem key={classification} value={classification}>
                      {classification}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="opportunity" className="block text-sm font-medium mb-1">
                Oportunidade
              </Label>
              <Select
                value={proposal.opportunity}
                onValueChange={(value) =>
                  handleFieldChange("opportunity", value as Opportunity)
                }
              >
                <SelectTrigger id="opportunity">
                  <SelectValue placeholder="Selecione a oportunidade" />
                </SelectTrigger>
                <SelectContent>
                  {opportunities.map((opportunity) => (
                    <SelectItem key={opportunity} value={opportunity}>
                      {opportunity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="term" className={`block text-sm font-medium mb-1 ${errors.term ? "text-destructive" : ""}`}>
                Prazo (meses) *
              </Label>
              <Input
                id="term"
                type="number"
                min="1"
                value={proposal.term}
                onChange={(e) =>
                  handleFieldChange("term", parseInt(e.target.value) || 0)
                }
                className={errors.term ? "border-destructive" : ""}
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="status" className="block text-sm font-medium mb-1">
                Status
              </Label>
              <Select
                value={proposal.status}
                onValueChange={(value) =>
                  handleFieldChange("status", value as ProposalStatus)
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {proposalStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="probability" className="block text-sm font-medium mb-1">
                Probabilidade (%)
              </Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={proposal.probability}
                onChange={(e) =>
                  handleFieldChange(
                    "probability",
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2.5">
              <Label htmlFor="observation" className="block text-sm font-medium mb-1">
                Observação
              </Label>
              <Textarea
                id="observation"
                rows={3}
                value={proposal.observation}
                onChange={(e) =>
                  handleFieldChange("observation", e.target.value)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-xl font-bold">Itens da Proposta</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={calculateTotals}
            size="sm"
            className="w-full sm:w-auto"
          >
            <Calculator className="h-4 w-4 mr-1 sm:mr-2" /> 
            <span>Calcular Totais</span>
          </Button>
          <Button onClick={handleAddItem} size="sm" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-1 sm:mr-2" /> 
            <span>Incluir Item</span>
          </Button>
        </div>
      </div>

      {Object.keys(itemErrors).length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Corrija os campos destacados em vermelho nos itens da proposta.
          </AlertDescription>
        </Alert>
      )}

      {proposal.items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex justify-center items-center py-10">
            <p className="text-muted-foreground">
              Nenhum item adicionado. Clique em "Incluir Item na Proposta" para
              adicionar um item.
            </p>
          </CardContent>
        </Card>
      ) : (
        proposal.items.map((item) => (
          <ProposalItem
            key={item.id}
            item={item}
            equipments={equipments}
            onItemChange={handleItemChange}
            onRemoveItem={handleRemoveItem}
            errors={itemErrors[item.id] || {}}
          />
        ))
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end">
            <div className="w-full max-w-md">
              <div className="flex justify-between mb-2">
                <p className="font-medium">Taxa Fixa Total:</p>
                <p className="font-bold">
                  {formatCurrency(proposal.totals.fixedRateTotal)}
                </p>
              </div>
              <div className="flex justify-between mb-2">
                <p className="font-medium">Produção Total ({proposal.term} meses):</p>
                <p className="font-bold">
                  {formatCurrency(proposal.totals.productionTotal)}
                </p>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg">
                <p className="font-medium">Total Geral:</p>
                <p className="font-bold">
                  {formatCurrency(proposal.totals.grandTotal)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalForm;
