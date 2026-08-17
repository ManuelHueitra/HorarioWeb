import { useState, useEffect } from 'react';
import { DIAS_SEMANA, BLOQUES_HORAS } from '@/utils/constantes';
import { useHorarioStore } from '@/store/useHorarioStore';
import { ModalAsignatura } from './ModalAsignatura';
import type { ColorAsignatura, Asignatura, DiaSemana } from '@/types';

const MAPA_COLORES: Record<ColorAsignatura, string> = {
  blue: 'bg-blue-950/70 text-blue-200 border-blue-500/40 hover:border-blue-400',
  emerald: 'bg-emerald-950/70 text-emerald-200 border-emerald-500/40 hover:border-emerald-400',
  purple: 'bg-purple-950/70 text-purple-200 border-purple-500/40 hover:border-purple-400',
  amber: 'bg-amber-950/70 text-amber-200 border-amber-500/40 hover:border-amber-400',
  rose: 'bg-rose-950/70 text-rose-200 border-rose-500/40 hover:border-rose-400',
  indigo: 'bg-indigo-950/70 text-indigo-200 border-indigo-500/40 hover:border-indigo-400',
  cyan: 'bg-cyan-950/70 text-cyan-200 border-cyan-500/40 hover:border-cyan-400',
};

const COLOR_INICIAL_TITULO = '#f8fafc';
const COLOR_INICIAL_DIAS = '#a5b4fc';
const COLOR_INICIAL_HORAS = '#22d3ee';

export function GrillaHorario() {
  const { nombreHorario, setNombreHorario, asignaturas } = useHorarioStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [asignaturaAEditar, setAsignaturaAEditar] = useState<Asignatura | null>(null);
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState<{
    dia: DiaSemana;
    bloqueHora: string;
  } | null>(null);

  const [editandoTitulo, setEditandoTitulo] = useState(false);
  const [tituloTemporal, setTituloTemporal] = useState(nombreHorario);
  const [mostrarPersonalizar, setMostrarPersonalizar] = useState(false);

  const [colorTitulo, setColorTitulo] = useState(
    () => localStorage.getItem('hw_color_titulo') || COLOR_INICIAL_TITULO
  );
  const [colorDias, setColorDias] = useState(
    () => localStorage.getItem('hw_color_dias') || COLOR_INICIAL_DIAS
  );
  const [colorHoras, setColorHoras] = useState(
    () => localStorage.getItem('hw_color_horas') || COLOR_INICIAL_HORAS
  );

  useEffect(() => {
    localStorage.setItem('hw_color_titulo', colorTitulo);
  }, [colorTitulo]);

  useEffect(() => {
    localStorage.setItem('hw_color_dias', colorDias);
  }, [colorDias]);

  useEffect(() => {
    localStorage.setItem('hw_color_horas', colorHoras);
  }, [colorHoras]);

  const restablecerColores = () => {
    setColorTitulo(COLOR_INICIAL_TITULO);
    setColorDias(COLOR_INICIAL_DIAS);
    setColorHoras(COLOR_INICIAL_HORAS);
    localStorage.removeItem('hw_color_titulo');
    localStorage.removeItem('hw_color_dias');
    localStorage.removeItem('hw_color_horas');
  };

  const abrirModalCrear = (dia?: DiaSemana, bloqueHora?: string) => {
    setAsignaturaAEditar(null);
    if (dia && bloqueHora) {
      setBloqueSeleccionado({ dia, bloqueHora });
    } else {
      setBloqueSeleccionado(null);
    }
    setIsModalOpen(true);
  };

  const abrirModalEditar = (asignatura: Asignatura) => {
    setBloqueSeleccionado(null);
    setAsignaturaAEditar(asignatura);
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setAsignaturaAEditar(null);
    setBloqueSeleccionado(null);
  };

  const guardarTitulo = () => {
    if (tituloTemporal.trim()) {
      setNombreHorario(tituloTemporal.trim());
    } else {
      setTituloTemporal(nombreHorario);
    }
    setEditandoTitulo(false);
  };

  // Cálculos de carga académica
  const totalSct = asignaturas.reduce((acc, r) => acc + (r.creditosSct || 0), 0);
  const totalTp = asignaturas.reduce((acc, r) => acc + (r.horasTp || 0), 0);
  const totalTa = asignaturas.reduce((acc, r) => acc + (r.horasTa || 0), 0);
  const totalHorasSemana = totalTp + totalTa;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-4 pb-20 sm:pb-4">
      <header className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-800 pb-4">
        <div>
          {editandoTitulo ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tituloTemporal}
                onChange={(e) => setTituloTemporal(e.target.value)}
                onBlur={guardarTitulo}
                onKeyDown={(e) => e.key === 'Enter' && guardarTitulo()}
                autoFocus
                className="text-2xl font-bold bg-slate-900 border border-indigo-500 rounded px-2 py-0.5 text-slate-100 focus:outline-none"
              />
              <button
                onClick={guardarTitulo}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded"
              >
                Listo
              </button>
            </div>
          ) : (
            <div
              onClick={() => {
                setTituloTemporal(nombreHorario);
                setEditandoTitulo(true);
              }}
              className="group flex items-center gap-2 cursor-pointer"
            >
              <h2
                className="text-2xl font-bold transition-colors group-hover:opacity-80"
                style={{ color: colorTitulo }}
              >
                {nombreHorario}
              </h2>
              <span className="text-slate-500 opacity-0 group-hover:opacity-100 text-xs">
                ✏️
              </span>
            </div>
          )}
          <p className="text-xs text-slate-400 mt-1">
            {asignaturas.length}{' '}
            {asignaturas.length === 1
              ? 'asignatura registrada'
              : 'asignaturas registradas'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMostrarPersonalizar(!mostrarPersonalizar)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            🎨 Personalizar Colores
          </button>

          <button
            onClick={() => abrirModalCrear()}
            className="hidden sm:flex px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-600/20 items-center gap-2"
          >
            <span>+</span> Agregar Asignatura
          </button>
        </div>
      </header>

      {/* Widget de Carga Académica */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
        <div className="p-2 bg-slate-950/50 rounded-lg border border-indigo-500/20">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Créditos SCT</div>
          <div className="text-lg font-bold text-indigo-400">{totalSct} SCT</div>
        </div>
        <div className="p-2 bg-slate-950/50 rounded-lg border border-emerald-500/20">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Presencial (TP)</div>
          <div className="text-lg font-bold text-emerald-400">{totalTp} hrs/sem</div>
        </div>
        <div className="p-2 bg-slate-950/50 rounded-lg border border-cyan-500/20">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Autónomo (TA)</div>
          <div className="text-lg font-bold text-cyan-400">{totalTa} hrs/sem</div>
        </div>
        <div className="p-2 bg-slate-950/50 rounded-lg border border-purple-500/20">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Carga Total</div>
          <div className="text-lg font-bold text-purple-400">{totalHorasSemana} hrs/sem</div>
        </div>
      </div>

      {/* Panel de Colores */}
      {mostrarPersonalizar && (
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="font-medium">Título:</span>
              <input
                type="color"
                value={colorTitulo}
                onChange={(e) => setColorTitulo(e.target.value)}
                className="w-7 h-7 bg-transparent rounded cursor-pointer border-0"
              />
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <span className="font-medium">Días:</span>
              <input
                type="color"
                value={colorDias}
                onChange={(e) => setColorDias(e.target.value)}
                className="w-7 h-7 bg-transparent rounded cursor-pointer border-0"
              />
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <span className="font-medium">Horas:</span>
              <input
                type="color"
                value={colorHoras}
                onChange={(e) => setColorHoras(e.target.value)}
                className="w-7 h-7 bg-transparent rounded cursor-pointer border-0"
              />
            </label>
          </div>

          <button
            onClick={restablecerColores}
            className="text-[11px] text-slate-400 hover:text-rose-400 underline transition-colors"
          >
            Restablecer por defecto
          </button>
        </div>
      )}

      {/* grilla de Horario */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50 shadow-xl">
        <table className="w-full border-collapse text-left text-sm text-slate-300">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80">
              <th className="p-3 w-32 text-center font-semibold text-slate-400">
                Bloque
              </th>
              {DIAS_SEMANA.map((dia) => (
                <th
                  key={dia}
                  className="p-3 text-center font-semibold border-l border-slate-800/60 transition-colors"
                  style={{ color: colorDias }}
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
                <tr
                  key={horaBloque}
                  className="hover:bg-slate-800/20 transition-colors"
                >
                  <td
                    className="p-3 text-center text-xs font-mono font-medium transition-colors"
                    style={{ color: colorHoras }}
                  >
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
                        className="p-1 border-l border-slate-800/60 h-20 min-w-[150px] align-top relative group"
                      >
                        {ramosEncontrados.length > 0 ? (
                          ramosEncontrados.map((ramo) => {
                            const bloque = ramo.bloques.find(
                              (b) => b.dia === dia && b.horaInicio === horaInicio
                            );

                            return (
                              <button
                                type="button"
                                key={ramo.id}
                                onClick={() => abrirModalEditar(ramo)}
                                className={`w-full text-left p-2 rounded-lg border text-xs flex flex-col justify-between h-full transition-all shadow-md cursor-pointer hover:brightness-110 active:scale-[0.98] ${MAPA_COLORES[ramo.color]}`}
                              >
                                <div>
                                  <div className="font-semibold line-clamp-1">
                                    {ramo.nombre}
                                  </div>
                                  {ramo.codigo && (
                                    <div className="text-[10px] opacity-75 font-mono">
                                      {ramo.codigo}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between mt-1 text-[10px] opacity-90">
                                  {bloque?.sala ? (
                                    <span className="font-medium bg-slate-950/80 px-1.5 py-0.5 rounded border border-white/10">
                                      📍 {bloque.sala}
                                    </span>
                                  ) : (
                                    <span />
                                  )}
                                  <span className="text-[10px] opacity-50 hover:opacity-100">
                                    ✏️
                                  </span>
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          /* Celda vacía clickeable */
                          <button
                            type="button"
                            onClick={() => abrirModalCrear(dia as DiaSemana, horaBloque)}
                            className="w-full h-full min-h-[4.5rem] rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-800/40 border border-dashed border-slate-700/50 flex items-center justify-center text-slate-500 hover:text-indigo-400 transition-all text-xs"
                            title={`Agregar ramo el ${dia} a las ${horaBloque}`}
                          >
                            +
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* boton flotante para celular */}
      <button
        onClick={() => abrirModalCrear()}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl font-bold z-50 border-2 border-indigo-400/30 active:scale-95 transition-transform"
        aria-label="Agregar asignatura"
      >
        +
      </button>

      <ModalAsignatura
        isOpen={isModalOpen}
        onClose={cerrarModal}
        asignaturaEditar={asignaturaAEditar}
        bloqueInicial={bloqueSeleccionado}
      />
    </div>
  );
}