// API utilities for handling local APK vs web mode

export const getApiUrl = (endpoint: string): string => {
  // Check if running in Capacitor (Android APK)
  if (typeof window !== 'undefined' && (window as any).Capacitor) {
    // APK mode: use deployed server for API calls
    return `https://6d0066b5-eaa9-45f0-abdb-87c99a46727e-00-ffblkw237ocq.kirk.replit.dev${endpoint}`;
  }
  // Web mode: use relative URLs (same origin)
  return endpoint;
};

// Helper function for making API calls with proper URL handling
export const fetchApi = async (endpoint: string, options?: RequestInit): Promise<Response> => {
  const url = getApiUrl(endpoint);
  return fetch(url, {
    credentials: 'include',
    ...options,
  });
};