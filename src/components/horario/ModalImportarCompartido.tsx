import { useState, useEffect } from 'react';
import { descomprimirPlanDesdeUrl } from '@/utils/compartir';
import { useHorarioStore } from '@/store/useHorarioStore';
import { TEMAS_PREDEFINIDOS } from '@/utils/temas';
import type { PlanHorario } from '@/types';

export function ModalImportarCompartido() {
  const [planAImportar, setPlanAImportar] = useState<Partial<PlanHorario> | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dataHash = params.get('importar');

    if (dataHash) {
      const plan = descomprimirPlanDesdeUrl(dataHash);
      if (plan && plan.asignaturas) {
        setPlanAImportar(plan);
        setIsOpen(true);
      }
    }
  }, []);

  const limpiarUrl = () => {
    const urlLimpia = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, urlLimpia);
  };

  const handleDescartar = () => {
    setIsOpen(false);
    limpiarUrl();
  };

  const handleGuardarPlan = () => {
    if (!planAImportar) return;

    const nuevoId = crypto.randomUUID();
    const nuevoPlan: PlanHorario = {
      id: nuevoId,
      nombre: planAImportar.nombre ? `${planAImportar.nombre} (Importado)` : 'Horario Compartido',
      asignaturas: planAImportar.asignaturas || [],
      temaActivo: planAImportar.temaActivo || TEMAS_PREDEFINIDOS[0],
      configGrilla: planAImportar.configGrilla || {},
    };

    useHorarioStore.setState((state) => ({
      planes: [...state.planes, nuevoPlan],
      planActivoId: nuevoId,
    }));

    setIsOpen(false);
    limpiarUrl();
  };

  if (!isOpen || !planAImportar) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl text-slate-200">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <span className="text-xl">📥</span>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Horario Compartido Recibido</h3>
            <p className="text-[11px] text-slate-400">Alguien te ha compartido su horario</p>
          </div>
        </div>

        <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400">
            Nombre: <strong className="text-slate-200">{planAImportar.nombre || 'Mi Horario'}</strong>
          </div>
          <div className="text-xs text-slate-400">
            Total de asignaturas: <strong className="text-indigo-400">{planAImportar.asignaturas?.length || 0}</strong>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          ¿Deseas guardar este horario como un nuevo plan en tu lista?
        </p>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleDescartar}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Descartar
          </button>
          <button
            type="button"
            onClick={handleGuardarPlan}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            Guardar en mis Planes
          </button>
        </div>
      </div>
    </div>
  );
}