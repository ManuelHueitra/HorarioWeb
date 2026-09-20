import { useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { comprimirPlanParaUrl } from '@/utils/compartir';
import type { PlanHorario } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  planActivo: PlanHorario;
}

export function ModalCompartir({ isOpen, onClose, planActivo }: Props) {
  const [copiado, setCopiado] = useState(false);

  const urlCompartir = useMemo(() => {
    if (!planActivo) return '';
    const hash = comprimirPlanParaUrl(planActivo);
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?importar=${hash}`;
  }, [planActivo]);

  if (!isOpen) return null;

  const handleCopiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(urlCompartir);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleCompartirNativo = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Horario: ${planActivo.nombre}`,
          text: `Te comparto mi horario universitario (${planActivo.nombre}):`,
          url: urlCompartir,
        });
      } catch (err) {
        console.log('Compartir cancelado');
      }
    } else {
      handleCopiarEnlace();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔗</span>
            <h3 className="font-bold text-sm text-slate-100">Compartir Horario</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Escanea el código QR o copia el enlace para compartir tu horario{' '}
          <strong className="text-slate-200">"{planActivo.nombre}"</strong> con tus compañeros.
        </p>

        {/* Código QR */}
        <div className="flex justify-center p-4 bg-white rounded-xl shadow-inner mx-auto w-fit">
          <QRCodeSVG
            value={urlCompartir}
            size={180}
            level="M"
            marginSize={2}
          />
        </div>

        {/* Botones de acción */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              readOnly
              value={urlCompartir}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 font-mono focus:outline-none select-all"
            />
            <button
              type="button"
              onClick={handleCopiarEnlace}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                copiado
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {copiado ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>

          <button
            type="button"
            onClick={handleCompartirNativo}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700"
          >
            <span>💬</span> Compartir por WhatsApp / App
          </button>
        </div>
      </div>
    </div>
  );
}