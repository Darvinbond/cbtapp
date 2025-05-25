// components/SecureExamGuard.tsx
import { useEffect, ReactNode } from 'react';

interface SecureExamGuardProps {
  /** Called on any suspicious action (blur, refresh, tab-switch, …) */
  onIncident: () => void;
  /** Your real exam UI */
  children: ReactNode;
}

/**
 * Wrap your whole CBT page in <SecureExamGuard onIncident={…}> … </SecureExamGuard>
 */
export default function SecureExamGuard({
  onIncident,
  children,
}: SecureExamGuardProps) {
  useEffect(() => {
    /* ---------- enter full-screen (must be inside a user-gesture call chain) */
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        // Some browsers block without a user gesture — ignore
        console.warn('Could not enter fullscreen:', err);
      }
    };
    enterFullscreen();

    /* ---------- one central wrapper so we call the callback only once */
    let fired = false;
    const trigger = () => {
      if (!fired) {
        fired = true;
        onIncident();
      }
    };

    /* ---------- listeners */
    const handleBlur           = () => trigger();
    const handleVis            = () => document.hidden && trigger();
    const handleFsChange       = () =>
      !document.fullscreenElement && trigger();
    const handleBeforeUnload   = (e: BeforeUnloadEvent) => {
      trigger();
      e.preventDefault();           // Ask “Leave site?” popup
      e.returnValue = '';           // Chrome / Edge
    };

    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVis);
    document.addEventListener('fullscreenchange', handleFsChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVis);
      document.removeEventListener('fullscreenchange', handleFsChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [onIncident]);

  /* ---------- simple full-screen layout wrapper */
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'auto',
        background: 'white',
      }}
    >
      {children}
    </div>
  );
}
