
import { useEffect, useRef } from 'react';

// Debounce function for input handlers
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Lazy load images
export function useLazyLoad(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              observer.unobserve(img);
            }
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (ref.current) {
      const images = ref.current.querySelectorAll('img[data-src]');
      images.forEach((img) => observer.observe(img));
    }

    return () => observer.disconnect();
  }, [ref]);
}

// Memoize expensive computations
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[]
): T {
  const ref = useRef<T>(callback);
  
  useEffect(() => {
    ref.current = callback;
  }, [callback, ...dependencies]);
  
  return useCallback((...args: any[]) => ref.current(...args), []) as T;
}
