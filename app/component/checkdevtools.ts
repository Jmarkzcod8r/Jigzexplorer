// utils/devtoolsDetect.ts
export function detectDevTools() {
    let devtoolsOpen = false;
    const threshold = 160;

    setInterval(() => {
      const start = performance.now();
      debugger;
      const diff = performance.now() - start;
      if (diff > threshold && !devtoolsOpen) {
        devtoolsOpen = true;
        alert("Developer Tools are not allowed!");
        window.location.reload();
      } else if (diff <= threshold) {
        devtoolsOpen = false;
      }
    }, 1000);
  }
