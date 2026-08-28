import { useState, useMemo } from 'react';
import { DIAS_SEMANA } from '@/utils/constantes';
import type { PlanHorario, DiaSemana, ColorAsignatura } from '@/types';

const MAPA_COLORES: Record<ColorAsignatura, string> = {
  blue: 'border-blue-500/50 bg-blue-950/40 text-blue-200',
  emerald: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-200',
  purple: 'border-purple-500/50 bg-purple-950/40 text-purple-200',
  amber: 'border-amber-500/50 bg-amber-950/40 text-amber-200',
  rose: 'border-rose-500/50 bg-rose-950/40 text-rose-200',
  indigo: 'border-indigo-500/50 bg-indigo-950/40 text-indigo-200',
  cyan: 'border-cyan-500/50 bg-cyan-950/40 text-cyan-200',
};

interface Props {
  planActivo: PlanHorario;
}

export function VistaHoy({ planActivo }: Props) {
  const [diaManual, setDiaManual] = useState<DiaSemana | null>(null);

  // obtener día actual
  const diaReal = useMemo<DiaSemana>(() => {
    const mapaDias: Record<number, DiaSemana> = {
      1: 'Lunes',
      2: 'Martes',
      3: 'Miercoles',
      4: 'Jueves',
      5: 'Viernes',
      6: 'Sabado',
    };
    const numDia = new Date().getDay();
    return mapaDias[numDia] || 'Lunes';
  }, []);

  const diaSeleccionado = diaManual || diaReal;

  const clasesDelDia = useMemo(() => {
    const lista: Array<{
      id: string;
      ramo: string;
      codigo?: string;
      color: ColorAsignatura;
      tipo?: string;
      sala?: string;
      horaInicio: string;
      horaFin: string;
    }> = [];

    (planActivo.asignaturas || []).forEach((asig) => {
      (asig.bloques || []).forEach((b) => {
        if (b.dia === diaSeleccionado) {
          lista.push({
            id: `${asig.id}-${b.id}`,
            ramo: asig.nombre,
            codigo: asig.codigo,
            color: asig.color,
            tipo: b.tipo,
            sala: b.sala,
            horaInicio: b.horaInicio,
            horaFin: b.horaFin,
          });
        }
      });
    });

    return lista.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }, [planActivo, diaSeleccionado]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
      {/* selector de dias */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Agenda:
          </span>
          {DIAS_SEMANA.map((dia) => {
            const esHoy = dia === diaReal;
            const esActivo = dia === diaSeleccionado;

            return (
              <button
                key={dia}
                type="button"
                onClick={() => setDiaManual(dia)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  esActivo
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {dia} {esHoy && <span className="text-[10px] opacity-80">(Hoy)</span>}
              </button>
            );
          })}
        </div>

        {diaManual && diaManual !== diaReal && (
          <button
            type="button"
            onClick={() => setDiaManual(null)}
            className="text-[11px] text-indigo-400 hover:underline whitespace-nowrap cursor-pointer"
          >
            Volver a Hoy
          </button>
        )}
      </div>

      {/* tarjetas de Clases */}
      {clasesDelDia.length === 0 ? (
        <div className="py-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
          No tienes clases registradas para el <strong className="text-slate-300">{diaSeleccionado}</strong>.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {clasesDelDia.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 shadow-md ${
                MAPA_COLORES[item.color]
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-xs text-slate-100 line-clamp-1">
                    {item.ramo}
                  </span>
                  {item.tipo && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950/60 border border-white/10 font-mono">
                      {item.tipo}
                    </span>
                  )}
                </div>
                {item.codigo && (
                  <p className="text-[10px] opacity-70 font-mono">{item.codigo}</p>
                )}
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-bold font-mono text-slate-200">
                  {item.horaInicio} - {item.horaFin}
                </div>
                {item.sala ? (
                  <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded bg-slate-950/80 border border-white/10 text-slate-300 font-medium">
                     {item.sala}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">Sin sala</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}