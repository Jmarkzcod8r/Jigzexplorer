import Swal from 'sweetalert2';

interface ReloadOptions {
  title?: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  icon?: 'warning' | 'question' | 'info' | 'success' | 'error';
  clearLocalStorage?: boolean; // New option to control localStorage clearing
  clearKeys?: string[]; // Specific keys to clear (optional)
}

export class ReloadHelper {
  /**
   * Show SweetAlert confirmation before reloading
   */
  static async confirmReload(options: ReloadOptions = {}): Promise<boolean> {
    const {
      title = 'Reload Page?',
      text = 'Are you sure you want to reload this page?',
      confirmButtonText = 'Yes, reload!',
      cancelButtonText = 'Cancel',
      icon = 'question'
    } = options;

    const result = await Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText,
      cancelButtonText,
      background: '#1f2937',
      color: 'white'
    });

    return result.isConfirmed;
  }

  /**
   * Clear localStorage - with options for specific keys or complete clear
   */
  private static clearStorage(options?: ReloadOptions): void {
    const { clearLocalStorage = true, clearKeys } = options || {};

    if (!clearLocalStorage) return;

    try {
      if (clearKeys && clearKeys.length > 0) {
        // Clear only specific keys
        clearKeys.forEach(key => {
          localStorage.removeItem(key);
        });
        console.log(`Cleared localStorage keys: ${clearKeys.join(', ')}`);
      } else {
        // Clear entire localStorage
        localStorage.clear();
        console.log('Cleared all localStorage');
      }
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Execute reload with confirmation and optional localStorage clearing
   */
  static async reloadWithConfirmation(options?: ReloadOptions): Promise<void> {
    const shouldReload = await this.confirmReload(options);
    if (shouldReload) {
      // Clear localStorage before reloading
      this.clearStorage(options);
      window.location.reload();
    }
  }

  /**
   * Force reload with localStorage clearing (no confirmation)
   */
  static forceReloadWithClear(options?: ReloadOptions): void {
    this.clearStorage(options);
    window.location.reload();
  }

  /**
   * Setup browser reload detection (Ctrl+R, F5)
   */
  static setupBrowserReloadDetection(options?: ReloadOptions): () => void {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Detect Ctrl+R or Cmd+R
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        this.reloadWithConfirmation(options);
      }

      // Detect F5
      if (event.key === 'F5') {
        event.preventDefault();
        this.reloadWithConfirmation(options);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Return cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }

  /**
   * Setup beforeunload protection (for browser close/reload buttons)
   */
  static setupBeforeUnloadProtection(message?: string): () => void {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message || 'Are you sure you want to leave? Your changes may not be saved.';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Return cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }

  /**
   * Setup complete reload protection (browser buttons + keyboard)
   */
  static setupCompleteReloadProtection(options?: {
    reloadOptions?: ReloadOptions;
    beforeUnloadMessage?: string;
  }): () => void {
    const cleanupKeyboard = this.setupBrowserReloadDetection(options?.reloadOptions);
    const cleanupBeforeUnload = this.setupBeforeUnloadProtection(options?.beforeUnloadMessage);

    // Return combined cleanup function
    return () => {
      cleanupKeyboard();
      cleanupBeforeUnload();
    };
  }
}

// Convenience standalone functions
export const confirmReload = ReloadHelper.confirmReload.bind(ReloadHelper);
export const reloadWithConfirmation = ReloadHelper.reloadWithConfirmation.bind(ReloadHelper);
export const forceReloadWithClear = ReloadHelper.forceReloadWithClear.bind(ReloadHelper);
export const setupBrowserReloadDetection = ReloadHelper.setupBrowserReloadDetection.bind(ReloadHelper);
export const setupBeforeUnloadProtection = ReloadHelper.setupBeforeUnloadProtection.bind(ReloadHelper);
export const setupCompleteReloadProtection = ReloadHelper.setupCompleteReloadProtection.bind(ReloadHelper);