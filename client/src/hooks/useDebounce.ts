import { useEffect, useState } from 'react';

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

// Hook for debounced search
export function useDebouncedSearch<T>(
  searchTerm: string,
  searchFn: (term: string) => Promise<T>,
  delay: number = 500
) {
  const [results, setResults] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      setResults(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    searchFn(debouncedSearchTerm)
      .then(results => {
        setResults(results);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [debouncedSearchTerm, searchFn]);

  return { results, loading, error };
}