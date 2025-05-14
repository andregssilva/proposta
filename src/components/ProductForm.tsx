
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Product, NewProduct } from "@/types/product";
import { createProduct, updateProduct } from "@/services/productService";

interface ProductFormProps {
  initialData?: Product;
  onSave: () => void;
  onCancel: () => void;
}

const ProductForm = ({ initialData, onSave, onCancel }: ProductFormProps) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<NewProduct>({
    name: initialData?.name || "",
    price: initialData?.price || 0,
    category: initialData?.category || "",
    stock: initialData?.stock || 0,
  });
  
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast({
        title: "Produto adicionado",
        description: "O produto foi adicionado com sucesso.",
      });
      onSave();
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar produto",
        description: `${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: NewProduct }) => updateProduct(id, data),
    onSuccess: () => {
      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso.",
      });
      onSave();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar produto",
        description: `${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "number") {
      setFormData(prev => ({ 
        ...prev, 
        [name]: name === "price" ? parseFloat(value) : parseInt(value) 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do produto é obrigatório.",
        variant: "destructive",
      });
      return;
    }
    
    if (initialData) {
      updateProductMutation.mutate({ id: initialData.id, data: formData });
    } else {
      createProductMutation.mutate(formData);
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
          <Label htmlFor="price" className="text-right">
            Preço
          </Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleChange}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">
            Categoria
          </Label>
          <Input
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="stock" className="text-right">
            Estoque
          </Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            value={formData.stock}
            onChange={handleChange}
            className="col-span-3"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={createProductMutation.isPending || updateProductMutation.isPending}>
          {initialData ? 'Atualizar' : 'Adicionar'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ProductForm;
