
export interface ProposalTotals {
  fixedRateTotal: number;
  productionTotal: number;
  grandTotal: number;
}

export type Manager = {
  id: string;
  name: string;
};

export type ContractType = "Taxa Fixa" | "Variável" | "Híbrido" | "Por Produção";
export type Classification = "Novo" | "Renovação" | "Expansão" | "Aditivo";
export type Opportunity = "MPS" | "Venda Direta" | "Locação" | "Outsourcing" | "Venda";
export type ProposalStatus = "Em aberto" | "Fechada" | "Perdida" | "Cancelada" | "Em negociação" | "Aprovada" | "Reprovada";

export type Equipment = {
  id: string;
  name: string;
  defaultValue: number;
  monthlyCost?: number;
};

import { Client } from "./client";
import { Product } from "./product";

export interface Proposal {
  id: string;
  number: string;
  date: string;
  validUntil: string;
  managerId: string;
  managerName: string;
  clientId?: string; // Reference to a Client
  title: string;
  client: string;
  contact: string;
  contractType: ContractType;
  classification: Classification;
  opportunity: Opportunity;
  term: number;
  status: ProposalStatus;
  probability: number;
  observation: string;
  items: ProposalItem[];
  totals: ProposalTotals;
}

export interface ProposalItem {
  id: string;
  equipmentId: string;
  equipmentName: string;
  productId?: string; // Reference to a product
  unitValue: number;
  quantity: number;
  monthlyVolumePB: number;
  monthlyVolumeColor: number;
  costPB: number;
  costColor: number;
  costLabor: number;
  costParts: number;
}
