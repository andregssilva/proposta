import { ContractType, Classification, Equipment, Manager, Opportunity, Proposal, ProposalStatus } from "../types/proposal";

export const managers: Manager[] = [
  { id: "5", name: "Aline" }
];

export const equipments: Equipment[] = [
  { id: "1", name: "Impressora HP LaserJet Pro", defaultValue: 1200 },
  { id: "2", name: "Multifuncional Xerox WorkCentre", defaultValue: 2500 },
  { id: "3", name: "Scanner Epson WorkForce", defaultValue: 800 },
  { id: "4", name: "Impressora Brother MFC", defaultValue: 1500 },
  { id: "5", name: "Plotter HP DesignJet", defaultValue: 3800 }
];

export const contractTypes: ContractType[] = ["Taxa Fixa", "Variável", "Híbrido", "Por Produção"];
export const classifications: Classification[] = ["Novo", "Renovação", "Expansão", "Aditivo"];
export const opportunities: Opportunity[] = ["MPS", "Venda Direta", "Locação", "Outsourcing", "Venda"];
export const proposalStatuses: ProposalStatus[] = ["Em aberto", "Fechada", "Perdida", "Cancelada", "Em negociação", "Aprovada", "Reprovada"];

export const mockProposals: Proposal[] = [
  {
    id: "3",
    number: "PROP-2023-003",
    date: "2023-06-01",
    validUntil: "2023-07-01",
    managerId: "5",
    managerName: "Aline",
    title: "Outsourcing de impressão para escritório jurídico",
    client: "Oliveira & Advogados",
    contact: "Roberto Oliveira",
    contractType: "Taxa Fixa",
    classification: "Novo",
    opportunity: "Outsourcing",
    term: 36,
    status: "Fechada",
    probability: 100,
    observation: "Cliente aprovou a proposta integral",
    items: [
      {
        id: "1",
        equipmentId: "2",
        equipmentName: "Multifuncional Xerox WorkCentre",
        unitValue: 2500,
        quantity: 3,
        monthlyVolumePB: 7000,
        monthlyVolumeColor: 2000,
        costPB: 0.04,
        costColor: 0.15,
        costLabor: 300,
        costParts: 250
      }
    ],
    totals: {
      fixedRateTotal: 7500,
      productionTotal: 580,
      grandTotal: 8080
    }
  },
  {
    id: "4",
    number: "PROP-2023-004",
    date: "2023-06-15",
    validUntil: "2023-07-15",
    managerId: "5",
    managerName: "Aline",
    title: "Locação de impressoras para hospital",
    client: "Hospital São Lucas",
    contact: "Dra. Marta Santos",
    contractType: "Híbrido",
    classification: "Expansão",
    opportunity: "Locação",
    term: 24,
    status: "Em aberto",
    probability: 75,
    observation: "Cliente já possui contrato e está ampliando para novas alas",
    items: [
      {
        id: "1",
        equipmentId: "1",
        equipmentName: "Impressora HP LaserJet Pro",
        unitValue: 1200,
        quantity: 10,
        monthlyVolumePB: 15000,
        monthlyVolumeColor: 0,
        costPB: 0.05,
        costColor: 0,
        costLabor: 400,
        costParts: 300
      }
    ],
    totals: {
      fixedRateTotal: 12000,
      productionTotal: 1450,
      grandTotal: 13450
    }
  },
  {
    id: "5",
    number: "PROP-2023-005",
    date: "2023-07-01",
    validUntil: "2023-08-01",
    managerId: "5",
    managerName: "Aline",
    title: "Serviços de impressão para escola técnica",
    client: "ETEC Profissional",
    contact: "Prof. Carlos Eduardo",
    contractType: "Variável",
    classification: "Novo",
    opportunity: "MPS",
    term: 12,
    status: "Fechada",
    probability: 100,
    observation: "Implementação prevista para o início do próximo semestre",
    items: [
      {
        id: "1",
        equipmentId: "3",
        equipmentName: "Scanner Epson WorkForce",
        unitValue: 800,
        quantity: 2,
        monthlyVolumePB: 0,
        monthlyVolumeColor: 0,
        costPB: 0,
        costColor: 0,
        costLabor: 100,
        costParts: 80
      },
      {
        id: "2",
        equipmentId: "4",
        equipmentName: "Impressora Brother MFC",
        unitValue: 1500,
        quantity: 5,
        monthlyVolumePB: 8000,
        monthlyVolumeColor: 2000,
        costPB: 0.04,
        costColor: 0.12,
        costLabor: 250,
        costParts: 200
      }
    ],
    totals: {
      fixedRateTotal: 9100,
      productionTotal: 560,
      grandTotal: 9660
    }
  },
  {
    id: "6",
    number: "PROP-2023-006",
    date: "2023-07-10",
    validUntil: "2023-08-10",
    managerId: "5",
    managerName: "Aline",
    title: "Outsourcing de impressoras para agência de publicidade",
    client: "Criativa Publicidade",
    contact: "Fernanda Lima",
    contractType: "Taxa Fixa",
    classification: "Novo",
    opportunity: "Outsourcing",
    term: 24,
    status: "Perdida",
    probability: 0,
    observation: "Cliente optou por concorrente com preço menor",
    items: [
      {
        id: "1",
        equipmentId: "5",
        equipmentName: "Plotter HP DesignJet",
        unitValue: 3800,
        quantity: 1,
        monthlyVolumePB: 0,
        monthlyVolumeColor: 500,
        costPB: 0,
        costColor: 0.25,
        costLabor: 200,
        costParts: 150
      },
      {
        id: "2",
        equipmentId: "2",
        equipmentName: "Multifuncional Xerox WorkCentre",
        unitValue: 2500,
        quantity: 2,
        monthlyVolumePB: 4000,
        monthlyVolumeColor: 6000,
        costPB: 0.04,
        costColor: 0.15,
        costLabor: 300,
        costParts: 250
      }
    ],
    totals: {
      fixedRateTotal: 8800,
      productionTotal: 1310,
      grandTotal: 10110
    }
  },
  {
    id: "7",
    number: "PROP-2023-007",
    date: "2023-08-05",
    validUntil: "2023-09-05",
    managerId: "5",
    managerName: "Aline",
    title: "Venda de equipamentos para escritório contábil",
    client: "Contábil Express",
    contact: "Marcelo Souza",
    contractType: "Taxa Fixa",
    classification: "Novo",
    opportunity: "Venda Direta",
    term: 1,
    status: "Em negociação",
    probability: 60,
    observation: "Cliente analisando proposta e outras opções do mercado",
    items: [
      {
        id: "1",
        equipmentId: "1",
        equipmentName: "Impressora HP LaserJet Pro",
        unitValue: 1200,
        quantity: 3,
        monthlyVolumePB: 0,
        monthlyVolumeColor: 0,
        costPB: 0,
        costColor: 0,
        costLabor: 0,
        costParts: 0
      },
      {
        id: "2",
        equipmentId: "3",
        equipmentName: "Scanner Epson WorkForce",
        unitValue: 800,
        quantity: 2,
        monthlyVolumePB: 0,
        monthlyVolumeColor: 0,
        costPB: 0,
        costColor: 0,
        costLabor: 0,
        costParts: 0
      }
    ],
    totals: {
      fixedRateTotal: 5200,
      productionTotal: 0,
      grandTotal: 5200
    }
  }
];
