import { useState } from 'react';
import { DIAS_SEMANA, BLOQUES_HORAS } from '@/utils/constantes';
import { useHorarioStore } from '@/store/useHorarioStore';
import { ModalAsignatura } from './ModalAsignatura';
import type { ColorAsignatura } from '@/types';

const MAPA_COLORES: Record<ColorAsignatura, string> = {
  blue: 'bg-blue-950/70 text-blue-200 border-blue-500/40 hover:border-blue-400',
  emerald: 'bg-emerald-950/70 text-emerald-200 border-emerald-500/40 hover:border-emerald-400',
  purple: 'bg-purple-950/70 text-purple-200 border-purple-500/40 hover:border-purple-400',
  amber: 'bg-amber-950/70 text-amber-200 border-amber-500/40 hover:border-amber-400',
  rose: 'bg-rose-950/70 text-rose-200 border-rose-500/40 hover:border-rose-400',
  indigo: 'bg-indigo-950/70 text-indigo-200 border-indigo-500/40 hover:border-indigo-400',
  cyan: 'bg-cyan-950/70 text-cyan-200 border-cyan-500/40 hover:border-cyan-400',
};

export function GrillaHorario() {
  const { nombreHorario, asignaturas, eliminarAsignatura } = useHorarioStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calcula la cantidad total de bloques ocupados en la semana
  const totalBloques = asignaturas.reduce(
    (total, ramo) => total + ramo.bloques.length,
    0
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-4">
      <header className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">{nombreHorario}</h2>
          <p className="text-xs text-indigo-400 font-medium mt-1">
            {totalBloques} {totalBloques === 1 ? 'bloque agregado' : 'bloques agregados'}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2"
        >
          <span className="font-bold text-base">+</span>
          <span className="hidden sm:inline">Agregar Asignatura</span>
        </button>
      </header>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50 shadow-xl">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950">
              <th className="p-3 w-32 text-center font-bold text-slate-400 uppercase text-xs tracking-wider">
                Bloque
              </th>
              {DIAS_SEMANA.map((dia) => (
                <th
                  key={dia}
                  className="p-3 text-center font-bold text-indigo-300 border-l border-slate-800/60 uppercase text-xs tracking-wider bg-indigo-950/30"
                >
                  {dia}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {BLOQUES_HORAS.map((horaBloque) => {
              const [horaInicio] = horaBloque.split(' - ');

              return (
                <tr key={horaBloque} className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-2 text-center text-xs font-mono text-cyan-400 font-semibold bg-slate-950/40">
                    {horaBloque}
                  </td>
                  {DIAS_SEMANA.map((dia) => {
                    const ramosEncontrados = asignaturas.filter((ramo) =>
                      ramo.bloques.some(
                        (b) => b.dia === dia && b.horaInicio === horaInicio
                      )
                    );

                    return (
                      <td
                        key={`${dia}-${horaBloque}`}
                        className="p-1 border-l border-slate-800/60 h-20 min-w-[130px] max-w-[160px] align-top overflow-hidden"
                      >
                        {ramosEncontrados.map((ramo) => {
                          const bloque = ramo.bloques.find(
                            (b) => b.dia === dia && b.horaInicio === horaInicio
                          );

                          return (
                            <div
                              key={ramo.id}
                              className={`group relative p-1.5 rounded-md border text-[11px] flex flex-col justify-between h-full w-full overflow-hidden transition-all shadow-md ${MAPA_COLORES[ramo.color]}`}
                            >
                              <div className="overflow-hidden">
                                <div
                                  className="font-semibold leading-tight line-clamp-1 break-words"
                                  title={ramo.nombre}
                                >
                                  {ramo.nombre}
                                </div>
                                {ramo.codigo && (
                                  <div className="text-[9px] opacity-75 font-mono truncate">
                                    {ramo.codigo}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between mt-1 text-[9px] opacity-90 gap-1">
                                {bloque?.sala ? (
                                  <span
                                    className="font-medium bg-slate-950/80 px-1 py-0.5 rounded border border-white/10 truncate max-w-[85%]"
                                    title={bloque.sala}
                                  >
                                    📍 {bloque.sala}
                                  </span>
                                ) : (
                                  <span />
                                )}
                                <button
                                  onClick={() => eliminarAsignatura(ramo.id)}
                                  className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 font-bold px-1 rounded transition-opacity shrink-0"
                                  title="Eliminar ramo"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ModalAsignatura
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}