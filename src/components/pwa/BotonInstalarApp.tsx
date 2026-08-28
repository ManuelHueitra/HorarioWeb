import { useState, useEffect } from 'react';

export function BotonInstalarApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [mostrarBoton, setMostrarBoton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setMostrarBoton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstalarClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setMostrarBoton(false);
    }
    setDeferredPrompt(null);
  };

  if (!mostrarBoton) return null;

  return (
    <button
      type="button"
      onClick={handleInstalarClick}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition-all animate-bounce cursor-pointer border border-indigo-400/40"
    >
      <span>📲</span>
      <span>Instalar App</span>
    </button>
  );
}