
import { supabase } from "@/integrations/supabase/client";
import { Client, NewClient } from "@/types/client";
import { Tables } from "@/integrations/supabase/types";

// Helper function to convert database records to Client objects
const mapDbClientToClient = (dbClient: Tables<"clients">): Client => ({
  id: dbClient.id,
  name: dbClient.name,
  email: dbClient.email || "",
  phone: dbClient.phone || "",
  address: dbClient.address || "",
  createdAt: dbClient.created_at || new Date().toISOString(),
  updatedAt: dbClient.updated_at || new Date().toISOString()
});

// Helper function to convert Client objects for insert/update operations
const mapClientToDbClient = (client: NewClient) => ({
  name: client.name,
  email: client.email,
  phone: client.phone,
  address: client.address
});

export async function getClients(): Promise<Client[]> {
  console.log("Fetching clients from Supabase database...");
  
  try {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("name", { ascending: true });
    
    if (error) {
      console.error("Error fetching clients from Supabase:", error);
      throw new Error(`Erro ao buscar clientes: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      console.log("No clients found in database");
      return [];
    }
    
    const clients = data.map(mapDbClientToClient);
    console.log(`Successfully fetched ${clients.length} clients from database`);
    console.log("Client names:", clients.map(c => c.name).join(", "));
    return clients;
  } catch (err) {
    console.error("Exception in getClients:", err);
    throw err;
  }
}

export async function getClient(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) {
    console.error("Error fetching client:", error);
    throw new Error(error.message);
  }
  
  return data ? mapDbClientToClient(data) : null;
}

export async function createClient(client: NewClient): Promise<Client> {
  const dbClient = mapClientToDbClient(client);
  
  const { data, error } = await supabase
    .from("clients")
    .insert(dbClient)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating client:", error);
    throw new Error(error.message);
  }
  
  return mapDbClientToClient(data);
}

export async function updateClient(id: string, client: NewClient): Promise<Client> {
  const dbClient = mapClientToDbClient(client);
  
  const { data, error } = await supabase
    .from("clients")
    .update(dbClient)
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating client:", error);
    throw new Error(error.message);
  }
  
  return mapDbClientToClient(data);
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Error deleting client:", error);
    throw new Error(error.message);
  }
}

export async function bulkCreateClients(clients: NewClient[]): Promise<Client[]> {
  const dbClients = clients.map(mapClientToDbClient);
  
  const { data, error } = await supabase
    .from("clients")
    .insert(dbClients)
    .select();
  
  if (error) {
    console.error("Error bulk creating clients:", error);
    throw new Error(error.message);
  }
  
  return (data || []).map(mapDbClientToClient);
}

export async function bulkDeleteClients(ids: string[]): Promise<void> {
  const { error } = await supabase
    .from("clients")
    .delete()
    .in("id", ids);
  
  if (error) {
    console.error("Error bulk deleting clients:", error);
    throw new Error(error.message);
  }
}
