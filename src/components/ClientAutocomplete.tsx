
import React from "react";
import { Input } from "@/components/ui/input";

interface ClientAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

const ClientAutocomplete: React.FC<ClientAutocompleteProps> = ({
  value,
  onChange,
  error = false,
}) => {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Digite o nome do cliente"
      className={error ? "border-destructive" : ""}
    />
  );
};

export default ClientAutocomplete;
