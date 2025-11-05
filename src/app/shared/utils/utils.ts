import {SERVER_URL} from '../../config/api';

export function debounceAsync<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let pendingReject: ((reason?: any) => void) | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
      if (pendingReject) {
        pendingReject({canceled: true});
        pendingReject = null;
      }
    }

    return new Promise<ReturnType<T>>((resolve, reject) => {
      pendingReject = reject;
      timeout = setTimeout(async () => {
        try {
          const res = await fn(...args);
          resolve(res as ReturnType<T>);
        } catch (err) {
          reject(err);
        } finally {
          timeout = null;
          pendingReject = null;
        }
      }, wait);
    });
  };
}



export function getImageUrl(imagePath: string | null): string {
  if (!imagePath) {
    return 'https://placehold.co/600x400';
  }
  // If it's already a full URL, return it
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  // Otherwise, construct the full URL
  return `${SERVER_URL}${imagePath}`;
}
