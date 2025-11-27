// Performance monitoring for Electron app
if (typeof window !== 'undefined' && 'electronAPI' in window) {
  // Monitor performance metrics
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (entry.duration > 16) { // Frame drops (60fps = 16.67ms per frame)
        console.warn(`Performance issue detected: ${entry.name} took ${entry.duration}ms`);
      }
    });
  });

  // Start observing performance entries
  observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });

  // Monitor long tasks (jank detection)
  if ('PerformanceObserver' in window) {
    const longTaskObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        console.warn(`Long task detected: ${entry.duration}ms - potential UI freeze`);
      });
    });

    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch {
      // longtask might not be supported in Electron
    }
  }

  // Memory usage monitoring (Chrome/Electron specific)
  const perfWithMemory = performance as Performance & {
    memory?: {
      usedJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  };
  
  if (perfWithMemory.memory) {
    setInterval(() => {
      const memory = perfWithMemory.memory!;
      if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
        console.warn('Memory usage is high:', {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
        });
      }
    }, 30000); // Check every 30 seconds
  }
}

export {};