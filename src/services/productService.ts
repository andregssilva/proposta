
import { supabase } from "@/integrations/supabase/client";
import { Product, NewProduct } from "@/types/product";
import { Tables } from "@/integrations/supabase/types";

// Helper function to convert database records to Product objects
const mapDbProductToProduct = (dbProduct: Tables<"products">): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  price: dbProduct.price || 0,
  category: dbProduct.category || "",
  stock: dbProduct.stock || 0,
  createdAt: dbProduct.created_at || new Date().toISOString(),
  updatedAt: dbProduct.updated_at || new Date().toISOString()
});

// Helper function to convert Product objects for insert/update operations
const mapProductToDbProduct = (product: NewProduct) => ({
  name: product.name,
  price: product.price,
  category: product.category,
  stock: product.stock
});

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true });
  
  if (error) {
    console.error("Error fetching products:", error);
    throw new Error(error.message);
  }
  
  return (data || []).map(mapDbProductToProduct);
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) {
    console.error("Error fetching product:", error);
    throw new Error(error.message);
  }
  
  return data ? mapDbProductToProduct(data) : null;
}

export async function createProduct(product: NewProduct): Promise<Product> {
  const dbProduct = mapProductToDbProduct(product);
  
  const { data, error } = await supabase
    .from("products")
    .insert(dbProduct)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating product:", error);
    throw new Error(error.message);
  }
  
  return mapDbProductToProduct(data);
}

export async function updateProduct(id: string, product: NewProduct): Promise<Product> {
  const dbProduct = mapProductToDbProduct(product);
  
  const { data, error } = await supabase
    .from("products")
    .update(dbProduct)
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating product:", error);
    throw new Error(error.message);
  }
  
  return mapDbProductToProduct(data);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Error deleting product:", error);
    throw new Error(error.message);
  }
}

export async function bulkCreateProducts(products: NewProduct[]): Promise<Product[]> {
  const dbProducts = products.map(mapProductToDbProduct);
  
  const { data, error } = await supabase
    .from("products")
    .insert(dbProducts)
    .select();
  
  if (error) {
    console.error("Error bulk creating products:", error);
    throw new Error(error.message);
  }
  
  return (data || []).map(mapDbProductToProduct);
}

export async function bulkDeleteProducts(ids: string[]): Promise<void> {
  const { error } = await supabase
    .from("products")
    .delete()
    .in("id", ids);
  
  if (error) {
    console.error("Error bulk deleting products:", error);
    throw new Error(error.message);
  }
}
