export function trackHotjarEvent(eventName: string) {
  if (typeof window === "undefined") return;

  const w = window as any;
  if (typeof w.hj === "function") {
    w.hj("event", eventName);
  }
}
