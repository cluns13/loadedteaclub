import { DatabaseMonitor } from '../monitoring';

describe('DatabaseMonitor', () => {
  let monitor: DatabaseMonitor;

  beforeEach(() => {
    // Reset the singleton instance
    (DatabaseMonitor as any).instance = null;
    monitor = DatabaseMonitor.getInstance({ 
      logThreshold: 10,  // Lower threshold for testing
      sampleRate: 1.0    // Always sample for testing
    });
  });

  it('should monitor successful operations', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    const result = await monitor.monitor(
      'test_operation', 
      mockFn, 
      { testContext: 'test' }
    );

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should handle slow operations', async () => {
    const slowFn = () => new Promise(resolve => 
      setTimeout(() => resolve('slow_success'), 20)
    );
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    const result = await monitor.monitor(
      'slow_operation', 
      slowFn
    );

    expect(result).toBe('slow_success');
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('should handle failed operations', async () => {
    const errorFn = () => Promise.reject(new Error('test error'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    await expect(
      monitor.monitor('error_operation', errorFn)
    ).rejects.toThrow('test error');

    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  it('should respect sampling rate', async () => {
    const monitor = DatabaseMonitor.getInstance({ 
      sampleRate: 0  // Never sample
    });

    const mockFn = jest.fn().mockResolvedValue('success');
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    const result = await monitor.monitor(
      'sampled_operation', 
      mockFn
    );

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalled();
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
