import { Proposal, ProposalItem } from '../types/proposal';
import { Client } from "@/types/client";
import { Product } from "@/types/product";

export function generateProposalNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PROP-${year}-${randomNum}`;
}

export function calculateItemTotal(item: ProposalItem): number {
  return item.unitValue * item.quantity;
}

export function calculateItemProductionMonthly(item: ProposalItem): number {
  return (item.monthlyVolumePB * item.costPB) + (item.monthlyVolumeColor * item.costColor);
}

export function calculateItemFixedRate(item: ProposalItem): number {
  return item.costPB + item.costColor + item.costLabor + item.costParts;
}

export function calculateProposalTotals(items: ProposalItem[], contractMonths: number = 1): {
  fixedRateTotal: number;
  productionTotal: number;
  grandTotal: number;
} {
  const fixedRateTotal = items.reduce((sum, item) => sum + calculateItemFixedRate(item), 0);
  
  const monthlyProduction = items.reduce((sum, item) => {
    return sum + calculateItemProductionMonthly(item);
  }, 0);
  
  const productionTotal = monthlyProduction * contractMonths;
  const grandTotal = fixedRateTotal + productionTotal;
  
  return {
    fixedRateTotal,
    productionTotal,
    grandTotal
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function validateProposalItem(item: ProposalItem): {
  valid: boolean;
  errors: Partial<Record<keyof ProposalItem, boolean>>;
} {
  const errors: Partial<Record<keyof ProposalItem, boolean>> = {};
  
  if (!item.equipmentId) errors.equipmentId = true;
  if (item.unitValue <= 0) errors.unitValue = true;
  if (item.quantity <= 0) errors.quantity = true;
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateProposal(proposal: Proposal): {
  valid: boolean;
  errors: Partial<Record<keyof Proposal, boolean>>;
} {
  const errors: Partial<Record<keyof Proposal, boolean>> = {};
  
  if (!proposal.title) errors.title = true;
  if (!proposal.client) errors.client = true;
  if (!proposal.managerId) errors.managerId = true;
  if (proposal.term <= 0) errors.term = true;
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

// Add a utility function to format clients for select options
export function formatClientsForSelect(clients: Client[]) {
  return clients.map(client => ({
    id: client.id,
    name: client.name,
    value: client.id,
    label: client.name
  }));
}

// Add a utility function to format products for select options
export function formatProductsForSelect(products: Product[]) {
  return products.map(product => ({
    id: product.id,
    name: product.name,
    value: product.id,
    label: product.name,
    price: product.price
  }));
}
