import { useEffect } from "react";

export function IframeHeightReporter() {
  useEffect(() => {
    if (window.self === window.top) return;
    const report = () => {
      const height = document.body.scrollHeight;
      window.parent.postMessage({ type: "wm-resize", height }, "*");
    };
    const observer = new ResizeObserver(report);
    observer.observe(document.body);
    report();
    return () => observer.disconnect();
  }, []);
  return null;
}
