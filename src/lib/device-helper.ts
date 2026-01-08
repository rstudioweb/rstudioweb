/**
 * Generate a device fingerprint from user-agent and screen resolution
 * Returns { deviceId, deviceName }
 */
export function generateDeviceFingerprint(): { deviceId: string; deviceName: string } {
  const ua = navigator.userAgent;
  const screenRes = `${window.screen.width}x${window.screen.height}`;
  
  // Simple hash of UA + screen
  const combined = ua + screenRes;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const deviceId = `device_${Math.abs(hash).toString(36)}`;
  
  // Extract browser and OS
  let deviceName = 'Unknown Device';
  if (ua.includes('Chrome')) deviceName = 'Chrome';
  else if (ua.includes('Firefox')) deviceName = 'Firefox';
  else if (ua.includes('Safari')) deviceName = 'Safari';
  else if (ua.includes('Edge')) deviceName = 'Edge';
  
  if (ua.includes('Windows')) deviceName += ' on Windows';
  else if (ua.includes('Mac')) deviceName += ' on macOS';
  else if (ua.includes('Linux')) deviceName += ' on Linux';
  else if (ua.includes('iPhone') || ua.includes('iPad')) deviceName += ' on iOS';
  else if (ua.includes('Android')) deviceName += ' on Android';
  
  return { deviceId, deviceName };
}
