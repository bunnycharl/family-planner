import { useApiQuery } from "./useApi";

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
}

export function useCategories() {
  const { data, isLoading, isError, mutate } = useApiQuery<Category[]>("/api/categories", {
    transform: (data) => data || [],
    dedupingInterval: 30000,
  });

  return {
    categories: data,
    isLoading,
    isError,
    mutate,
  };
}
