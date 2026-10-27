import { api } from './api';

let deferredPrompt: any = null;

export function initPwaListeners(onInstallableChange?: (canInstall: boolean) => void) {
  window.addEventListener('beforeinstallprompt', (e: any) => {
    e.preventDefault();
    deferredPrompt = e;
    if (onInstallableChange) onInstallableChange(true);
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    if (onInstallableChange) onInstallableChange(false);
    // Report installed status to server
    syncDeviceWithServer(true, 'appinstalled-event');
  });
}

export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

export function isIosDevice(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

export function getDetectedDeviceInfo() {
  const ua = navigator.userAgent;
  let platform = 'Unknown OS';
  if (/Android/i.test(ua)) platform = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) platform = 'iOS';
  else if (/Windows/i.test(ua)) platform = 'Windows';
  else if (/Macintosh|Mac OS/i.test(ua)) platform = 'macOS';
  else if (/Linux/i.test(ua)) platform = 'Linux';

  let browser = 'Browser';
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';

  let deviceType = 'Desktop';
  if (/Mobi|Android/i.test(ua)) deviceType = 'Mobile';
  if (/iPad|Tablet/i.test(ua)) deviceType = 'Tablet';

  const isPwa = isStandalone();

  return {
    platform,
    browser,
    deviceType,
    isPwaInstalled: isPwa,
    deviceName: `${platform} ${deviceType}`,
  };
}

export async function promptPwaInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    return false;
  }
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  if (outcome === 'accepted') {
    await syncDeviceWithServer(true, 'prompt-accepted');
    return true;
  }
  return false;
}

export async function syncDeviceWithServer(isInstalledOverride?: boolean, method?: string) {
  const token = localStorage.getItem('tilshunos_token');
  if (!token) return;

  const info = getDetectedDeviceInfo();
  try {
    await api.post('/devices/register', {
      deviceName: info.deviceName,
      deviceType: info.deviceType,
      platform: info.platform,
      browser: info.browser,
      isPwaInstalled: isInstalledOverride !== undefined ? isInstalledOverride : info.isPwaInstalled,
      installMethod: method || (info.isPwaInstalled ? 'standalone' : 'browser'),
    });
  } catch (err) {
    console.error('Failed to sync device with backend', err);
  }
}
