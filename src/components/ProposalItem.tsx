import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Equipment, ProposalItem as ProposalItemType } from "../types/proposal";
import { formatCurrency, calculateItemTotal, calculateItemProductionMonthly, calculateItemFixedRate } from "../utils/proposalUtils";

interface ProposalItemProps {
  item: ProposalItemType;
  equipments: Equipment[];
  onItemChange: (updatedItem: ProposalItemType) => void;
  onRemoveItem: (itemId: string) => void;
  errors?: Partial<Record<keyof ProposalItemType, boolean>>;
}

const ProposalItem: React.FC<ProposalItemProps> = ({
  item,
  equipments,
  onItemChange,
  onRemoveItem,
  errors = {},
}) => {
  const handleEquipmentChange = (equipmentId: string) => {
    const selectedEquipment = equipments.find((eq) => eq.id === equipmentId);
    if (selectedEquipment) {
      onItemChange({
        ...item,
        equipmentId,
        equipmentName: selectedEquipment.name,
        unitValue: selectedEquipment.defaultValue,
      });
    }
  };

  const handleValueChange = (
    field: keyof ProposalItemType,
    value: string | number
  ) => {
    // Handle number inputs
    if (
      [
        "unitValue",
        "quantity",
        "monthlyVolumePB",
        "monthlyVolumeColor",
        "costPB",
        "costColor",
        "costLabor",
        "costParts",
      ].includes(field)
    ) {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      onItemChange({ ...item, [field]: numValue });
    } else {
      onItemChange({ ...item, [field]: value });
    }
  };

  // Calculate real-time values
  const itemTotal = calculateItemTotal(item);
  const productionMonthly = calculateItemProductionMonthly(item);
  const fixedRate = calculateItemFixedRate(item);

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        {/* Primeira linha com informações essenciais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label 
              htmlFor={`equipment-${item.id}`}
              className={errors.equipmentId ? "text-destructive" : ""}
            >
              Equipamento *
            </Label>
            <Select
              value={item.equipmentId}
              onValueChange={(value) => handleEquipmentChange(value)}
            >
              <SelectTrigger 
                id={`equipment-${item.id}`}
                className={errors.equipmentId ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Selecione o equipamento" />
              </SelectTrigger>
              <SelectContent className="max-w-[80vw] sm:max-w-none">
                {equipments.map((equipment) => (
                  <SelectItem key={equipment.id} value={equipment.id}>
                    {equipment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label 
              htmlFor={`unit-value-${item.id}`}
              className={errors.unitValue ? "text-destructive" : ""}
            >
              Valor unitário *
            </Label>
            <Input
              id={`unit-value-${item.id}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={item.unitValue}
              onChange={(e) => handleValueChange("unitValue", e.target.value)}
              className={errors.unitValue ? "border-destructive" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label 
              htmlFor={`quantity-${item.id}`}
              className={errors.quantity ? "text-destructive" : ""}
            >
              Quantidade *
            </Label>
            <Input
              id={`quantity-${item.id}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={item.quantity}
              onChange={(e) => handleValueChange("quantity", e.target.value)}
              className={errors.quantity ? "border-destructive" : ""}
            />
          </div>

          <div className="flex items-end justify-between sm:justify-start">
            <p className="text-sm font-medium mb-2">
              Total: {formatCurrency(itemTotal)}
            </p>
          </div>
        </div>

        {/* Segunda linha com volumes mensais e custos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor={`volume-pb-${item.id}`}>Volume mensal PB</Label>
            <Input
              id={`volume-pb-${item.id}`}
              type="number"
              inputMode="numeric"
              min="0"
              value={item.monthlyVolumePB}
              onChange={(e) =>
                handleValueChange("monthlyVolumePB", e.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`volume-color-${item.id}`}>Volume mensal Color</Label>
            <Input
              id={`volume-color-${item.id}`}
              type="number"
              inputMode="numeric"
              min="0"
              value={item.monthlyVolumeColor}
              onChange={(e) =>
                handleValueChange("monthlyVolumeColor", e.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`cost-pb-${item.id}`}>Custo PB</Label>
            <Input
              id={`cost-pb-${item.id}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={item.costPB}
              onChange={(e) => handleValueChange("costPB", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`cost-color-${item.id}`}>Custo Color</Label>
            <Input
              id={`cost-color-${item.id}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={item.costColor}
              onChange={(e) => handleValueChange("costColor", e.target.value)}
            />
          </div>
        </div>

        {/* Terceira linha com custos adicionais e botão de remoção */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor={`cost-labor-${item.id}`}>Custo MO</Label>
            <Input
              id={`cost-labor-${item.id}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={item.costLabor}
              onChange={(e) => handleValueChange("costLabor", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`cost-parts-${item.id}`}>Custo de Peças</Label>
            <Input
              id={`cost-parts-${item.id}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={item.costParts}
              onChange={(e) => handleValueChange("costParts", e.target.value)}
            />
          </div>

          <div className="space-y-2 col-span-1">
            <Label>Produção Mensal</Label>
            <p className="py-2 px-3 bg-muted rounded text-sm">
              {formatCurrency(productionMonthly)}
            </p>
          </div>

          <div className="flex items-end justify-end">
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onRemoveItem(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalItem;
