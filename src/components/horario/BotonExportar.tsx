import { useState, useRef, useEffect } from 'react';
import {
  exportarComoPdf,
  exportarComoImagen,
} from '@/utils/exportador';
import type { PlanHorario } from '@/types';

interface Props {
  planActivo: PlanHorario;
  idAreaExportable: string;
}

export function BotonExportar({ planActivo, idAreaExportable }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [exportando, setExportando] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const nombreArchivo = (planActivo.nombre || 'horario')
    .toLowerCase()
    .replace(/\s+/g, '_');

  const colorFondo = planActivo.temaActivo?.fondo || '#090d16';

  useEffect(() => {
    function handleClickAfuera(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickAfuera);
    return () => document.removeEventListener('mousedown', handleClickAfuera);
  }, []);

  const handleExportar = async (tipo: 'pdf' | 'jpg' | 'png') => {
    setAbierto(false);
    setExportando(true);

    try {
      const nodo = document.getElementById(idAreaExportable);
      if (!nodo) {
        alert('No se encontró el elemento para exportar.');
        return;
      }

      if (tipo === 'pdf') {
        await exportarComoPdf(nodo, nombreArchivo, colorFondo);
      } else if (tipo === 'jpg' || tipo === 'png') {
        await exportarComoImagen(nodo, nombreArchivo, tipo, colorFondo);
      }
    } catch (err) {
      console.error(err);
      alert('Hubo un error al exportar.');
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        disabled={exportando}
        onClick={() => setAbierto(!abierto)}
        className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
      >
        <span></span>
        <span>{exportando ? 'Exportando...' : 'Exportar'}</span>
        <span className="text-[9px] text-slate-400">▼</span>
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 py-1 divide-y divide-slate-800 animate-in fade-in zoom-in-95 duration-100">
          <div className="py-1">
            <button
              onClick={() => handleExportar('pdf')}
              className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-indigo-600 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span></span> Guardar como <strong>PDF</strong>
            </button>
            <button
              onClick={() => handleExportar('png')}
              className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-indigo-600 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span></span> Imagen <strong>PNG</strong>
            </button>
            <button
              onClick={() => handleExportar('jpg')}
              className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-indigo-600 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span></span> Imagen <strong>JPG</strong>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}