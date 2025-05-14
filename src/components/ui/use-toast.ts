
import { useToast as useHookToast, toast as hookToast } from "@/hooks/use-toast";

// Re-export the hooks with the same names
export const useToast = useHookToast;
export const toast = hookToast;
