// Debounce utility to limit the rate of function calls
export function debounce<F extends (...args: any[]) => any>(
  func: F, 
  delay: number
): (...args: Parameters<F>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<F>) => {
    // If no arguments are provided, throw an error
    if (args.length === 0) {
      throw new Error('Debounce function requires at least one argument');
    }

    // Clear previous timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    // Set a new timeout
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}
