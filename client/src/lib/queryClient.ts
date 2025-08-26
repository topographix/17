import { QueryClient, QueryFunction } from "@tanstack/react-query";

// API Configuration for local APK with server API calls
const getApiBaseUrl = () => {
  // Check if running in Capacitor (Android APK)
  if (typeof window !== 'undefined' && (window as any).Capacitor) {
    // APK mode: use deployed server for API calls
    return 'https://6d0066b5-eaa9-45f0-abdb-87c99a46727e-00-ffblkw237ocq.kirk.replit.dev';
  }
  // Web mode: use relative URLs (same origin)
  return '';
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Import device fingerprinting
  const { getDeviceInfo } = await import('./deviceFingerprint');
  const deviceInfo = getDeviceInfo();
  
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  // Add device fingerprinting headers for guest endpoints
  if (url.includes('/api/guest/')) {
    headers['x-device-fingerprint'] = deviceInfo.fingerprint;
    headers['x-platform'] = deviceInfo.platform;
  }
  
  const fullUrl = getApiBaseUrl() + url;
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const headers: Record<string, string> = {};
    
    // Add device fingerprinting headers for guest endpoints
    if (url.includes('/api/guest/')) {
      try {
        const { getDeviceInfo } = await import('./deviceFingerprint');
        const deviceInfo = getDeviceInfo();
        headers['x-device-fingerprint'] = deviceInfo.fingerprint;
        headers['x-platform'] = deviceInfo.platform;
      } catch (e) {
        // Device fingerprinting not available, continue without it
      }
    }
    
    const fullUrl = getApiBaseUrl() + url;
    const res = await fetch(fullUrl, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
