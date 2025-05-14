
import { useQuery } from "@tanstack/react-query";
import { getClient } from "@/services/clientService";

export function useClientQuery(clientId: string | null) {
  const { 
    data: client, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => clientId ? getClient(clientId) : null,
    enabled: !!clientId
  });
  
  return {
    client,
    isLoading,
    isError,
    error
  };
}
