import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage;
    try {
      // Try to get JSON error first
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const json = await res.json();
        errorMessage = json.message || json.error || `${res.status}: ${res.statusText}`;
      } else {
        // If it's HTML or plain text, just use status text
        errorMessage = `${res.status}: ${res.statusText}`;
      }
    } catch (e) {
      // If parsing fails, use status text
      errorMessage = `${res.status}: ${res.statusText}`;
    }
    
    // ✅ Enhanced error object with status code for better handling
    const error = new Error(errorMessage);
    (error as any).status = res.status;
    (error as any).statusText = res.statusText;
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    // ✅ Add timeout for requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    // ✅ For auth endpoints, handle errors more gracefully
    if (url.includes('/api/user') || url.includes('/api/login') || url.includes('/api/register')) {
      if (res.status === 401) {
        console.log('🔐 Auth endpoint returned 401 - user not authenticated');
        return res; // Let the calling code handle 401s gracefully
      }
    }
    
    await throwIfResNotOk(res);
    return res;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error(`API Request timeout: ${method} ${url}`);
      throw new Error("Richiesta scaduta. Riprova più tardi.");
    }
    
    // ✅ Enhanced error logging for debugging
    console.error(`API Request failed: ${method} ${url}`, {
      error: error.message,
      status: error.status,
      stack: error.stack,
    });
    
    // ✅ Don't throw network errors that could crash the app
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      const networkError = new Error("Errore di connessione. Verifica la tua connessione internet.");
      (networkError as any).isNetworkError = true;
      throw networkError;
    }
    
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout for queries
      
      const url = queryKey.join("/") as string;
      const res = await fetch(url, {
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // ✅ Enhanced 401 handling
      if (res.status === 401) {
        console.log('🔐 Query returned 401 for:', url);
        if (unauthorizedBehavior === "returnNull") {
          return null;
        }
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn('⏰ Query timeout for:', queryKey.join("/"));
        throw new Error("Richiesta scaduta");
      }
      
      // ✅ Log query errors but don't crash app
      console.warn('⚠️ Query error for:', queryKey.join("/"), error.message);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }), // ✅ Return null for 401s instead of throwing
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
      gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes
      retry: (failureCount, error: any) => {
        // ✅ Smart retry logic
        if (error?.message?.includes("401") || 
            error?.message?.includes("Non autenticato") ||
            error?.status === 401 ||
            error?.isNetworkError) {
          return false; // Don't retry auth or network errors
        }
        return failureCount < 2; // Retry max 2 times for other errors
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // ✅ Exponential backoff
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // ✅ Don't retry mutations that are likely to fail again
        if (error?.status === 400 || 
            error?.status === 401 || 
            error?.status === 403 || 
            error?.status === 422 ||
            error?.isNetworkError) {
          return false;
        }
        return failureCount < 1; // Only retry once for server errors
      },
    },
  },
});

// ✅ Export apiRequest as named export for use in hooks
export { apiRequest as default, apiRequest };
