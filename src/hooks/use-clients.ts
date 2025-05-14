
import { useQuery } from "@tanstack/react-query";
import { getClients } from "@/services/clientService";
import { Client } from "@/types/client";
import { useToast } from "@/components/ui/use-toast";

export function useClients() {
  const { toast } = useToast();
  
  const { 
    data, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
    staleTime: 1000 * 15, // Cache client data for just 15 seconds to keep data fresh
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    retry: 3, // Retry three times on failure
    refetchOnMount: true, // Always refetch when component mounts
    // Add fallback default value if the query fails to return data
    initialData: [],
  });
  
  // Ensure we always return an array, even if data is undefined
  const safeClients = Array.isArray(data) ? data : [];
  
  return {
    clients: safeClients as Client[],
    isLoading,
    isError,
    error,
    refetch
  };
}
