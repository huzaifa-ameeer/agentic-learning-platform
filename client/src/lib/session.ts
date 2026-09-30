const SESSION_EVENT = "mentaura:session-change";

export function notifySessionChange() {
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function onSessionChange(handler: () => void) {
  window.addEventListener(SESSION_EVENT, handler);

  return () => window.removeEventListener(SESSION_EVENT, handler);
}