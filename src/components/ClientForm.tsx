
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Client, NewClient } from "@/types/client";
import { createClient, updateClient } from "@/services/clientService";

interface ClientFormProps {
  initialData?: Client;
  onSave: () => void;
  onCancel: () => void;
}

const ClientForm = ({ initialData, onSave, onCancel }: ClientFormProps) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<NewClient>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
  });
  
  const createClientMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      toast({
        title: "Cliente adicionado",
        description: "O cliente foi adicionado com sucesso.",
      });
      onSave();
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar cliente",
        description: `${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: NewClient }) => updateClient(id, data),
    onSuccess: () => {
      toast({
        title: "Cliente atualizado",
        description: "O cliente foi atualizado com sucesso.",
      });
      onSave();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar cliente",
        description: `${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do cliente é obrigatório.",
        variant: "destructive",
      });
      return;
    }
    
    if (initialData) {
      updateClientMutation.mutate({ id: initialData.id, data: formData });
    } else {
      createClientMutation.mutate(formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Nome *
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="col-span-3"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="phone" className="text-right">
            Telefone
          </Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="address" className="text-right">
            Endereço
          </Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="col-span-3"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={createClientMutation.isPending || updateClientMutation.isPending}>
          {initialData ? 'Atualizar' : 'Adicionar'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ClientForm;
