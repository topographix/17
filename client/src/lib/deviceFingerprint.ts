/**
 * Device fingerprinting utility to track users across sessions and prevent diamond farming
 * Works across web, Android, and iOS platforms
 */

interface DeviceInfo {
  fingerprint: string;
  platform: 'web' | 'android' | 'ios';
  userAgent: string;
}

/**
 * Generate a unique device fingerprint based on browser/device characteristics
 */
export function generateDeviceFingerprint(): DeviceInfo {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Canvas fingerprinting
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint test', 2, 2);
  }
  const canvasFingerprint = canvas.toDataURL();
  
  // Screen information
  const screen = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  
  // Timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Language
  const language = navigator.language || 'unknown';
  
  // Platform detection
  const userAgent = navigator.userAgent;
  let platform: 'web' | 'android' | 'ios' = 'web';
  
  if (/Android/i.test(userAgent)) {
    platform = 'android';
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    platform = 'ios';
  }
  
  // WebGL fingerprinting
  let webglFingerprint = '';
  try {
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && 'getExtension' in gl) {
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        webglFingerprint = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) + 
                          (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }
  } catch (e) {
    // WebGL not available
  }
  
  // Hardware concurrency
  const hardwareConcurrency = navigator.hardwareConcurrency || 0;
  
  // Check for Capacitor (mobile app)
  const isCapacitor = !!(window as any).Capacitor;
  if (isCapacitor) {
    platform = (window as any).Capacitor.platform === 'ios' ? 'ios' : 'android';
  }
  
  // Combine all fingerprint components
  const fingerprintData = [
    canvasFingerprint,
    screen,
    timezone,
    language,
    webglFingerprint,
    hardwareConcurrency.toString(),
    platform,
    isCapacitor ? 'capacitor' : 'browser'
  ].join('|');
  
  // Generate hash of fingerprint data
  const fingerprint = btoa(fingerprintData).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  
  return {
    fingerprint,
    platform,
    userAgent
  };
}

/**
 * Get or create persistent device ID stored in localStorage
 */
export function getDeviceId(): string {
  const stored = localStorage.getItem('device_id');
  if (stored) {
    return stored;
  }
  
  const deviceInfo = generateDeviceFingerprint();
  const deviceId = `${deviceInfo.platform}_${deviceInfo.fingerprint}_${Date.now()}`;
  
  localStorage.setItem('device_id', deviceId);
  return deviceId;
}

/**
 * Check if user has received welcome diamonds on this device
 */
export function hasReceivedWelcomeDiamonds(): boolean {
  return localStorage.getItem('welcome_diamonds_received') === 'true';
}

/**
 * Mark that user has received welcome diamonds on this device
 */
export function markWelcomeDiamondsReceived(): void {
  localStorage.setItem('welcome_diamonds_received', 'true');
}

/**
 * Get device information for API calls
 */
export function getDeviceInfo(): DeviceInfo {
  return generateDeviceFingerprint();
}