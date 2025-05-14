
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import NavBar from "@/components/NavBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parseExcel, downloadTemplate } from "@/utils/spreadsheetUtils";
import { FileSpreadsheet, Upload, Download, FileCheck, Save, Trash2, Edit, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Client, NewClient } from "@/types/client";
import { Product, NewProduct } from "@/types/product";
import { getClients, bulkCreateClients, deleteClient, bulkDeleteClients } from "@/services/clientService";
import { getProducts, bulkCreateProducts, deleteProduct, bulkDeleteProducts } from "@/services/productService";
import { Checkbox } from "@/components/ui/checkbox";
import ClientForm from "@/components/ClientForm";
import ProductForm from "@/components/ProductForm";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption
} from "@/components/ui/table";

const DataImport = () => {
  const [activeTab, setActiveTab] = useState("clientes");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Client | Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Amostra de dados para templates
  const clientesSample = [
    { nome: "João Silva", email: "joao@exemplo.com", telefone: "(11) 99999-8888", endereco: "Rua Exemplo, 123" },
    { nome: "Maria Oliveira", email: "maria@exemplo.com", telefone: "(11) 97777-6666", endereco: "Av. Modelo, 456" },
  ];

  const produtosSample = [
    { nome: "Produto A", preco: 29.90, categoria: "Eletrônicos", estoque: 100 },
    { nome: "Produto B", preco: 49.90, categoria: "Informática", estoque: 50 },
  ];
  
  // Queries
  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: getClients
  });
  
  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });
  
  // Mutations
  const importClientsMutation = useMutation({
    mutationFn: (clients: NewClient[]) => bulkCreateClients(clients),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Clientes importados com sucesso!",
        description: `${previewData.length} clientes foram importados para o sistema.`,
      });
      setImportSuccess(true);
      resetUploadState();
    },
    onError: (error: any) => {
      console.error("Import clients error:", error);
      toast({
        title: "Erro ao importar clientes",
        description: error?.message || "Ocorreu um erro ao importar os clientes.",
        variant: "destructive",
      });
    }
  });
  
  const importProductsMutation = useMutation({
    mutationFn: (products: NewProduct[]) => bulkCreateProducts(products),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Produtos importados com sucesso!",
        description: `${previewData.length} produtos foram importados para o sistema.`,
      });
      setImportSuccess(true);
      resetUploadState();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao importar produtos",
        description: error?.message || "Ocorreu um erro ao importar os produtos.",
        variant: "destructive",
      });
    }
  });
  
  const deleteClientMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso.",
      });
    }
  });
  
  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso.",
      });
    }
  });
  
  const bulkDeleteClientsMutation = useMutation({
    mutationFn: bulkDeleteClients,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Clientes excluídos",
        description: `${selectedIds.length} clientes foram excluídos com sucesso.`,
      });
      setSelectedIds([]);
    }
  });
  
  const bulkDeleteProductsMutation = useMutation({
    mutationFn: bulkDeleteProducts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Produtos excluídos",
        description: `${selectedIds.length} produtos foram excluídos com sucesso.`,
      });
      setSelectedIds([]);
    }
  });

  const resetUploadState = () => {
    setUploadedFile(null);
    setPreviewData([]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    setIsUploading(true);
    setUploadedFile(file);
    console.log("File selected:", file.name);

    try {
      // Processar o arquivo
      const data = await parseExcel(file);
      console.log("Data parsed:", data.length, "records");
      setPreviewData(data);
      
      toast({
        title: "Arquivo carregado com sucesso",
        description: `${data.length} registros encontrados em ${file.name}`,
      });
    } catch (error: any) {
      console.error("Erro ao processar arquivo:", error);
      toast({
        title: "Erro ao processar arquivo",
        description: error?.message || "Verifique se o formato está correto e tente novamente.",
        variant: "destructive",
      });
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImport = async () => {
    console.log("Import button clicked");
    
    if (!previewData.length) {
      console.log("No data to import");
      toast({
        title: "Sem dados para importar",
        description: "Carregue um arquivo primeiro.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (activeTab === "clientes") {
        console.log("Importing clients...");
        // Mapear dados para o formato esperado pelo serviço
        const clientsToImport = previewData.map(item => ({
          name: item.nome || "",
          email: item.email || "",
          phone: item.telefone || "",
          address: item.endereco || ""
        }));
        
        console.log("Clients to import:", clientsToImport);
        await importClientsMutation.mutateAsync(clientsToImport);
      } else {
        console.log("Importing products...");
        // Mapear dados para o formato esperado pelo serviço
        const productsToImport = previewData.map(item => ({
          name: item.nome || "",
          price: parseFloat(item.preco) || 0,
          category: item.categoria || "",
          stock: parseInt(item.estoque) || 0
        }));
        
        console.log("Products to import:", productsToImport);
        await importProductsMutation.mutateAsync(productsToImport);
      }
    } catch (error) {
      console.error("Import error:", error);
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = activeTab === "clientes" ? clientesSample : produtosSample;
    const filename = `template_${activeTab}.xlsx`;
    
    downloadTemplate(filename, templateData);
    
    toast({
      title: "Template gerado",
      description: `O modelo de planilha para ${activeTab} foi baixado.`,
    });
  };
  
  const handleSelectItem = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };
  
  const handleSelectAll = () => {
    const currentData = activeTab === "clientes" 
      ? clientsQuery.data || []
      : productsQuery.data || [];
    
    if (selectedIds.length === currentData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentData.map(item => item.id));
    }
  };
  
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    
    if (activeTab === "clientes") {
      bulkDeleteClientsMutation.mutate(selectedIds);
    } else {
      bulkDeleteProductsMutation.mutate(selectedIds);
    }
  };
  
  const handleEditItem = (item: Client | Product) => {
    setEditingItem(item);
    setIsEditing(true);
    if ('email' in item) {
      setIsAddingClient(true);
    } else {
      setIsAddingProduct(true);
    }
  };
  
  const handleDeleteItem = (id: string) => {
    if (activeTab === "clientes") {
      deleteClientMutation.mutate(id);
    } else {
      deleteProductMutation.mutate(id);
    }
  };
  
  const filteredData = useCallback(() => {
    const query = searchQuery.toLowerCase();
    
    if (activeTab === "clientes") {
      return (clientsQuery.data || []).filter((client: Client) => 
        client.name.toLowerCase().includes(query) || 
        client.email.toLowerCase().includes(query) ||
        client.phone.toLowerCase().includes(query)
      );
    } else {
      return (productsQuery.data || []).filter((product: Product) => 
        product.name.toLowerCase().includes(query) || 
        product.category.toLowerCase().includes(query)
      );
    }
  }, [activeTab, searchQuery, clientsQuery.data, productsQuery.data]);
  
  const renderTableRows = () => {
    const data = filteredData();
    
    if (activeTab === "clientes") {
      return (data as Client[]).map((client: Client) => (
        <TableRow key={client.id}>
          <TableCell className="px-4 py-2">
            <Checkbox 
              checked={selectedIds.includes(client.id)}
              onCheckedChange={() => handleSelectItem(client.id)}
              aria-label={`Select ${client.name}`}
            />
          </TableCell>
          <TableCell className="px-4 py-2">{client.name}</TableCell>
          <TableCell className="px-4 py-2">{client.email}</TableCell>
          <TableCell className="px-4 py-2">{client.phone}</TableCell>
          <TableCell className="px-4 py-2">{client.address}</TableCell>
          <TableCell className="px-4 py-2 text-right">
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleEditItem(client)}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDeleteItem(client.id)}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ));
    } else {
      return (data as Product[]).map((product: Product) => (
        <TableRow key={product.id}>
          <TableCell className="px-4 py-2">
            <Checkbox 
              checked={selectedIds.includes(product.id)}
              onCheckedChange={() => handleSelectItem(product.id)}
              aria-label={`Select ${product.name}`}
            />
          </TableCell>
          <TableCell className="px-4 py-2">{product.name}</TableCell>
          <TableCell className="px-4 py-2">R$ {product.price.toFixed(2)}</TableCell>
          <TableCell className="px-4 py-2">{product.category}</TableCell>
          <TableCell className="px-4 py-2">{product.stock}</TableCell>
          <TableCell className="px-4 py-2 text-right">
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleEditItem(product)}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDeleteItem(product.id)}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ));
    }
  };
  
  const renderLoadingOrEmptyState = () => {
    if (activeTab === "clientes" ? clientsQuery.isLoading : productsQuery.isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="px-4 py-4 text-center">
            {activeTab === "clientes" ? "Carregando clientes..." : "Carregando produtos..."}
          </TableCell>
        </TableRow>
      );
    } else if (filteredData().length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="px-4 py-4 text-center">
            {searchQuery ? `Nenhum ${activeTab === "clientes" ? "cliente" : "produto"} encontrado para sua busca.` : 
            `Nenhum ${activeTab === "clientes" ? "cliente" : "produto"} cadastrado.`}
          </TableCell>
        </TableRow>
      );
    }
    return null;
  };
  
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Importação e Gerenciamento de Dados</h1>
        
        <Tabs defaultValue="clientes" value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          setSelectedIds([]);
          setSearchQuery("");
        }}>
          <TabsList className="mb-4">
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="clientes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Importar Clientes
                </CardTitle>
                <CardDescription>
                  Importe dados de clientes a partir de uma planilha Excel ou CSV.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      variant="outline" 
                      onClick={handleDownloadTemplate}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Modelo de Planilha
                    </Button>
                    
                    <div>
                      <input
                        type="file"
                        id="cliente-file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <Button
                        variant="secondary"
                        onClick={() => document.getElementById("cliente-file")?.click()}
                        disabled={isUploading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? "Carregando..." : "Carregar Arquivo"}
                      </Button>
                    </div>
                  </div>
                  
                  {uploadedFile && (
                    <div className="mt-4">
                      <div className="bg-muted p-2 rounded-md flex items-center mb-4">
                        <FileCheck className="h-5 w-5 mr-2 text-primary" />
                        <span className="text-sm font-medium">{uploadedFile.name}</span>
                      </div>
                      
                      {previewData.length > 0 && (
                        <div className="mt-4">
                          <h3 className="font-medium mb-2">Pré-visualização:</h3>
                          <div className="overflow-x-auto">
                            <table className="min-w-full border border-border rounded-md">
                              <thead className="bg-muted">
                                <tr>
                                  {Object.keys(previewData[0]).map((key) => (
                                    <th key={key} className="py-2 px-3 text-left text-sm">{key}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {previewData.slice(0, 10).map((row, i) => (
                                  <tr key={i} className="border-t border-border">
                                    {Object.values(row).map((value, j) => (
                                      <td key={j} className="py-2 px-3 text-sm">{String(value)}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="mt-4 text-sm text-muted-foreground">
                            Exibindo até 10 registros de um total de {previewData.length}.
                          </div>
                        </div>
                      )}
                      
                      <Separator className="my-4" />
                      
                      <Button 
                        variant="default"
                        className="mt-2" 
                        onClick={handleImport}
                        disabled={importClientsMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {importClientsMutation.isPending ? "Importando..." : "Importar Dados"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between items-center mt-6 mb-4">
              <h2 className="text-xl font-bold">Lista de Clientes</h2>
              <div className="flex gap-2">
                <Dialog open={isAddingClient} onOpenChange={setIsAddingClient}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingItem(null);
                      setIsEditing(false);
                      setIsAddingClient(true);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Cliente
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>{isEditing ? "Editar" : "Adicionar"} Cliente</DialogTitle>
                      <DialogDescription>
                        Preencha os dados do cliente abaixo.
                      </DialogDescription>
                    </DialogHeader>
                    <ClientForm 
                      initialData={isEditing && editingItem && 'email' in editingItem ? editingItem as Client : undefined} 
                      onSave={() => {
                        setIsAddingClient(false);
                        setIsEditing(false);
                        setEditingItem(null);
                        queryClient.invalidateQueries({ queryKey: ['clients'] });
                      }}
                      onCancel={() => {
                        setIsAddingClient(false);
                        setIsEditing(false);
                        setEditingItem(null);
                      }}
                    />
                  </DialogContent>
                </Dialog>
                
                {selectedIds.length > 0 && (
                  <Button variant="destructive" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Selecionados ({selectedIds.length})
                  </Button>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <Input 
                placeholder="Buscar clientes..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table className="mt-6">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-4 py-3">
                          <div className="flex items-center">
                            <Checkbox 
                              checked={clientsQuery.data && 
                                      clientsQuery.data.length > 0 && 
                                      selectedIds.length === clientsQuery.data.length}
                              onCheckedChange={handleSelectAll}
                              aria-label="Select all"
                            />
                          </div>
                        </TableHead>
                        <TableHead className="px-4 py-3">Nome</TableHead>
                        <TableHead className="px-4 py-3">Email</TableHead>
                        <TableHead className="px-4 py-3">Telefone</TableHead>
                        <TableHead className="px-4 py-3">Endereço</TableHead>
                        <TableHead className="px-4 py-3 text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {renderLoadingOrEmptyState() || renderTableRows()}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="produtos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Importar Produtos
                </CardTitle>
                <CardDescription>
                  Importe dados de produtos a partir de uma planilha Excel ou CSV.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      variant="outline" 
                      onClick={handleDownloadTemplate}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Modelo de Planilha
                    </Button>
                    
                    <div>
                      <input
                        type="file"
                        id="produto-file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <Button
                        variant="secondary"
                        onClick={() => document.getElementById("produto-file")?.click()}
                        disabled={isUploading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? "Carregando..." : "Carregar Arquivo"}
                      </Button>
                    </div>
                  </div>
                  
                  {uploadedFile && (
                    <div className="mt-4">
                      <div className="bg-muted p-2 rounded-md flex items-center mb-4">
                        <FileCheck className="h-5 w-5 mr-2 text-primary" />
                        <span className="text-sm font-medium">{uploadedFile.name}</span>
                      </div>
                      
                      {previewData.length > 0 && (
                        <div className="mt-4">
                          <h3 className="font-medium mb-2">Pré-visualização:</h3>
                          <div className="overflow-x-auto">
                            <table className="min-w-full border border-border rounded-md">
                              <thead className="bg-muted">
                                <tr>
                                  {Object.keys(previewData[0]).map((key) => (
                                    <th key={key} className="py-2 px-3 text-left text-sm">{key}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {previewData.slice(0, 10).map((row, i) => (
                                  <tr key={i} className="border-t border-border">
                                    {Object.values(row).map((value, j) => (
                                      <td key={j} className="py-2 px-3 text-sm">{String(value)}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="mt-4 text-sm text-muted-foreground">
                            Exibindo até 10 registros de um total de {previewData.length}.
                          </div>
                        </div>
                      )}
                      
                      <Separator className="my-4" />
                      
                      <Button 
                        variant="default"
                        className="mt-2" 
                        onClick={handleImport}
                        disabled={importProductsMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {importProductsMutation.isPending ? "Importando..." : "Importar Dados"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between items-center mt-6 mb-4">
              <h2 className="text-xl font-bold">Lista de Produtos</h2>
              <div className="flex gap-2">
                <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingItem(null);
                      setIsEditing(false);
                      setIsAddingProduct(true);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Produto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>{isEditing ? "Editar" : "Adicionar"} Produto</DialogTitle>
                      <DialogDescription>
                        Preencha os dados do produto abaixo.
                      </DialogDescription>
                    </DialogHeader>
                    <ProductForm 
                      initialData={isEditing && editingItem && 'price' in editingItem ? editingItem as Product : undefined} 
                      onSave={() => {
                        setIsAddingProduct(false);
                        setIsEditing(false);
                        setEditingItem(null);
                        queryClient.invalidateQueries({ queryKey: ['products'] });
                      }}
                      onCancel={() => {
                        setIsAddingProduct(false);
                        setIsEditing(false);
                        setEditingItem(null);
                      }}
                    />
                  </DialogContent>
                </Dialog>
                
                {selectedIds.length > 0 && (
                  <Button variant="destructive" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Selecionados ({selectedIds.length})
                  </Button>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <Input 
                placeholder="Buscar produtos..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table className="mt-6">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-4 py-3">
                          <div className="flex items-center">
                            <Checkbox 
                              checked={productsQuery.data && 
                                      productsQuery.data.length > 0 && 
                                      selectedIds.length === productsQuery.data.length}
                              onCheckedChange={handleSelectAll}
                              aria-label="Select all"
                            />
                          </div>
                        </TableHead>
                        <TableHead className="px-4 py-3">Nome</TableHead>
                        <TableHead className="px-4 py-3">Preço</TableHead>
                        <TableHead className="px-4 py-3">Categoria</TableHead>
                        <TableHead className="px-4 py-3">Estoque</TableHead>
                        <TableHead className="px-4 py-3 text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {renderLoadingOrEmptyState() || renderTableRows()}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DataImport;
