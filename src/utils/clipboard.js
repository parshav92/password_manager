// Clipboard utilities with auto-clear

let clearTimer = null;

/**
 * Copy text to clipboard with optional auto-clear
 * @param {string} text - Text to copy
 * @param {number} autoClearSeconds - Auto-clear after N seconds (0 = no auto-clear)
 * @returns {Promise<boolean>} Success
 */
export async function copyToClipboard(text, autoClearSeconds = 30) {
  try {
    await navigator.clipboard.writeText(text);

    // Clear any existing timer
    if (clearTimer) {
      clearTimeout(clearTimer);
      clearTimer = null;
    }

    // Set up auto-clear
    if (autoClearSeconds > 0) {
      clearTimer = setTimeout(async () => {
        try {
          // Only clear if clipboard still has our text
          const current = await navigator.clipboard.readText();
          if (current === text) {
            await navigator.clipboard.writeText('');
          }
        } catch {
          // Clipboard read might fail if tab is not focused — that's OK
        }
        clearTimer = null;
      }, autoClearSeconds * 1000);
    }

    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
}
