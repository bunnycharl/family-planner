import { useCallback } from "react";
import useSWR, { type SWRConfiguration, type KeyedMutator } from "swr";

// ============================================================================
// Fetcher function for SWR
// ============================================================================

export const fetcher = async <T = unknown>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "Failed to fetch");
    throw new Error(text);
  }
  return res.json();
};

// ============================================================================
// Generic hook for GET requests (queries)
// ============================================================================

export interface UseApiQueryOptions<T> extends SWRConfiguration<T> {
  /**
   * Transform data before returning (e.g., ensure array, set defaults)
   */
  transform?: (data: T | undefined) => T;
}

export interface UseApiQueryResult<T> {
  data: T;
  isLoading: boolean;
  isError: Error | undefined;
  mutate: KeyedMutator<T>;
}

/**
 * Generic hook for fetching data from API endpoints
 *
 * @example
 * ```ts
 * const { data, isLoading, isError, mutate } = useApiQuery<Category[]>('/api/categories', {
 *   transform: (data) => data || [],
 *   dedupingInterval: 30000,
 * });
 * ```
 */
export function useApiQuery<T = unknown>(
  url: string | null,
  options?: UseApiQueryOptions<T>
): UseApiQueryResult<T> {
  const { transform, ...swrOptions } = options || {};

  const { data, error, isLoading, mutate } = useSWR<T>(url, fetcher, swrOptions);

  const transformedData = transform ? transform(data) : data;

  return {
    data: transformedData as T,
    isLoading,
    isError: error,
    mutate,
  };
}

// ============================================================================
// Generic hook for mutations (POST/PUT/DELETE)
// ============================================================================

export type ApiMethod = "POST" | "PUT" | "DELETE" | "PATCH";

export interface ApiMutationOptions {
  /**
   * Callback to revalidate data after mutation
   */
  onSuccess?: () => void | Promise<void>;
  /**
   * Callback on error
   */
  onError?: (error: Error) => void;
}

export interface UseApiMutationResult<TData = unknown, TVariables = unknown> {
  mutate: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
}

/**
 * Generic hook for API mutations (create, update, delete)
 *
 * @example
 * ```ts
 * const { mutate: createCategory, isLoading } = useApiMutation<Category, CreateCategoryInput>(
 *   '/api/categories',
 *   'POST',
 *   {
 *     onSuccess: () => mutateCategories(), // revalidate categories list
 *   }
 * );
 *
 * await createCategory({ name: 'New Category', color: '#FF0000' });
 * ```
 */
export function useApiMutation<TData = unknown, TVariables = unknown>(
  url: string,
  method: ApiMethod,
  options?: ApiMutationOptions
): UseApiMutationResult<TData, TVariables> {
  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(variables),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "Unknown error");
          throw new Error(text);
        }

        const data = await res.json();

        if (options?.onSuccess) {
          await options.onSuccess();
        }

        return data;
      } catch (error) {
        if (options?.onError && error instanceof Error) {
          options.onError(error);
        }
        throw error;
      }
    },
    [url, method, options]
  );

  return {
    mutate,
    isLoading: false, // Could track loading state with useState if needed
  };
}
