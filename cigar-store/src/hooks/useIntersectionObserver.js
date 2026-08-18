import { useEffect, useState, useRef } from 'react';

export function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef(null);
  const threshold = options.threshold ?? 0.1;
  const rootMargin = options.rootMargin ?? '0px 0px -50px 0px';

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [targetRef, isIntersecting];
}
