import { useState } from 'react';
import { DIAS_SEMANA, BLOQUES_HORAS } from '@/utils/constantes';
import { TEMAS_PREDEFINIDOS } from '@/utils/temas';
import { useHorarioStore } from '@/store/useHorarioStore';
import { ModalAsignatura } from './ModalAsignatura';
import { ModalImportarPdf } from './ModalImportarPdf';
import { BotonExportar } from './BotonExportar';
import type {
  ColorAsignatura,
  Asignatura,
  DiaSemana,
  TemaHorario,
} from '@/types';

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
  const {
    planes,
    planActivoId,
    getPlanActivo,
    cambiarPlanActivo,
    crearPlan,
    renombrarPlanActivo,
    duplicarPlanActivo,
    eliminarPlan,
    setTemaActivo,
    guardarTemaPersonalizado,
    eliminarTemaPersonalizado,
    temasPersonalizados,
    setLimiteDia,
  } = useHorarioStore();

  const planActivo = getPlanActivo();
  const asignaturas = planActivo.asignaturas || [];
  const temaActivo = planActivo.temaActivo || TEMAS_PREDEFINIDOS[0];
  const nombreHorario = planActivo.nombre || 'Mi Horario';
  const limitesPorDia = planActivo.configGrilla?.limitePorDia || {};

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [asignaturaAEditar, setAsignaturaAEditar] = useState<Asignatura | null>(null);
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState<{
    dia: DiaSemana;
    bloqueHora: string;
  } | null>(null);

  const [editandoTitulo, setEditandoTitulo] = useState(false);
  const [tituloTemporal, setTituloTemporal] = useState(nombreHorario);
  const [mostrarPersonalizar, setMostrarPersonalizar] = useState(false);
  const [mostrarConfigGrilla, setMostrarConfigGrilla] = useState(false);
  const [nombreNuevoTema, setNombreNuevoTema] = useState('');

  const opcionesHoraFin = BLOQUES_HORAS.map((b) => b.split(' - ')[1]);

  const aMinutos = (horaStr: string) => {
    const [h, m] = horaStr.split(':').map(Number);
    return h * 60 + m;
  };

  // 1. Calcular la última hora donde efectivamente hay clases
  let maxFinClaseMinutos = 0;
  asignaturas.forEach((asig) => {
    asig.bloques.forEach((b) => {
      const minFin = aMinutos(b.horaFin);
      if (minFin > maxFinClaseMinutos) {
        maxFinClaseMinutos = minFin;
      }
    });
  });

  // 2. Revisar si el usuario ajustó manualmente horas por día
  const hayLimitesManuales = Object.keys(limitesPorDia).length > 0;
  const maxManualMinutos = hayLimitesManuales
    ? Math.max(...DIAS_SEMANA.map((dia) => aMinutos(limitesPorDia[dia] || '00:00')))
    : 0;

  // 3. Recortar filas vacías finales (Mínimo hasta las 13:15 para ver la mañana completa)
  const limiteCorte = hayLimitesManuales && maxManualMinutos > 0
    ? maxManualMinutos
    : Math.max(maxFinClaseMinutos, aMinutos('13:15'));

  const bloquesVisibles = BLOQUES_HORAS.filter((b) => {
    const horaInicio = b.split(' - ')[0];
    return aMinutos(horaInicio) < limiteCorte;
  });

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
      renombrarPlanActivo(tituloTemporal.trim());
    } else {
      setTituloTemporal(nombreHorario);
    }
    setEditandoTitulo(false);
  };

  const handleGuardarTemaPropio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreNuevoTema.trim()) return;

    const nuevo: TemaHorario = {
      id: crypto.randomUUID(),
      nombre: nombreNuevoTema.trim(),
      esPredefinido: false,
      colorTitulo: temaActivo.colorTitulo,
      colorDias: temaActivo.colorDias,
      colorHoras: temaActivo.colorHoras,
      fondo: temaActivo.fondo || '#090d16',
    };

    guardarTemaPersonalizado(nuevo);
    setNombreNuevoTema('');
  };

  const totalSct = asignaturas.reduce((acc, r) => acc + (r.creditosSct || 0), 0);
  const totalTp = asignaturas.reduce((acc, r) => acc + (r.horasTp || 0), 0);
  const totalTa = asignaturas.reduce((acc, r) => acc + (r.horasTa || 0), 0);
  const totalHorasSemana = totalTp + totalTa;

  let totalChoques = 0;
  DIAS_SEMANA.forEach((dia) => {
    bloquesVisibles.forEach((horaBloque) => {
      const [horaInicio] = horaBloque.split(' - ');
      const ramosEnBloque = asignaturas.filter((ramo) =>
        ramo.bloques.some((b) => b.dia === dia && b.horaInicio === horaInicio)
      );
      if (ramosEnBloque.length > 1) {
        totalChoques += 1;
      }
    });
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-4 pb-20 sm:pb-4">
      {/* Barra de Planes */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
            Planes:
          </span>
          {planes.map((plan) => (
            <div
              key={plan.id}
              className={`flex items-center rounded-lg border text-xs transition-colors ${
                plan.id === planActivoId
                  ? 'bg-indigo-600/30 border-indigo-500 text-white font-medium'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <button
                onClick={() => cambiarPlanActivo(plan.id)}
                className="px-3 py-1.5"
              >
                {plan.nombre}
              </button>
              {planes.length > 1 && (
                <button
                  onClick={() => eliminarPlan(plan.id)}
                  className="pr-2 pl-1 py-1.5 text-slate-500 hover:text-rose-400 text-xs font-bold"
                  title="Eliminar este plan"
                >
                  x
                </button>
              )}
            </div>
          ))}

          <button
            onClick={() => crearPlan(`Plan ${planes.length + 1}`)}
            className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
          >
            + Nuevo Plan
          </button>
        </div>

        <button
          onClick={duplicarPlanActivo}
          className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1.5 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
        >
          Duplicar Plan Actual
        </button>
      </div>

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
                style={{ color: temaActivo.colorTitulo }}
              >
                {nombreHorario}
              </h2>
              <span className="text-slate-500 opacity-0 group-hover:opacity-100 text-xs font-mono">
                [Editar]
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs text-slate-400">
              {asignaturas.length}{' '}
              {asignaturas.length === 1
                ? 'asignatura registrada'
                : 'asignaturas registradas'}
            </p>
            {totalChoques > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full animate-pulse">
                {totalChoques} {totalChoques === 1 ? 'tope detectado' : 'topes detectados'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <BotonExportar
            planActivo={planActivo}
            idAreaExportable="area-horario-exportable"
          />

          <button
            onClick={() => {
              setMostrarConfigGrilla(!mostrarConfigGrilla);
              setMostrarPersonalizar(false);
            }}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
              mostrarConfigGrilla
                ? 'bg-indigo-600/30 border-indigo-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            Ajustar Horas
          </button>

          <button
            onClick={() => {
              setMostrarPersonalizar(!mostrarPersonalizar);
              setMostrarConfigGrilla(false);
            }}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
              mostrarPersonalizar
                ? 'bg-indigo-600/30 border-indigo-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            Temas y Colores
          </button>

          <button
            type="button"
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-200 bg-gradient-to-r from-indigo-900/90 to-purple-900/90 hover:from-indigo-800 hover:to-purple-800 border border-indigo-500/50 rounded-lg transition-all shadow-md shadow-indigo-950/50 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-indigo-300 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Importar PDF (IA)</span>
          </button>

          <button
            onClick={() => abrirModalCrear()}
            className="hidden sm:flex px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-600/20 items-center gap-1"
          >
            <span>+</span> Asignatura
          </button>
        </div>
      </header>

      {/* PANELES SUPERIORES (AJUSTE DE HORAS Y TEMAS) */}
      {mostrarConfigGrilla && (
        <div className="p-4 bg-slate-900/95 border border-slate-800 rounded-xl space-y-3 shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">
              Hora de término manual por día:
            </span>
            <button
              onClick={() => setMostrarConfigGrilla(false)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              ✕ Cerrar
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {DIAS_SEMANA.map((dia) => (
              <div key={dia} className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400 block">
                  {dia}:
                </label>
                <select
                  value={limitesPorDia[dia] || '18:00'}
                  onChange={(e) => setLimiteDia(dia, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {opcionesHoraFin.map((hf) => (
                    <option key={hf} value={hf}>
                      Hasta {hf}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {mostrarPersonalizar && (
        <div className="p-4 bg-slate-900/95 border border-slate-800 rounded-xl space-y-4 text-xs text-slate-300 shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200">Temas Predefinidos:</span>
            <button
              onClick={() => setMostrarPersonalizar(false)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              ✕ Cerrar
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {TEMAS_PREDEFINIDOS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemaActivo(t)}
                className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-2 ${
                  temaActivo.id === t.id
                    ? 'bg-indigo-600/30 border-indigo-500 text-white font-medium'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="flex gap-1">
                  <span
                    className="w-2 h-2 rounded-full border border-white/20"
                    style={{ backgroundColor: t.fondo || '#090d16' }}
                    title="Fondo"
                  />
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: t.colorTitulo }}
                    title="Título"
                  />
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: t.colorDias }}
                    title="Días"
                  />
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: t.colorHoras }}
                    title="Horas"
                  />
                </span>
                {t.nombre}
              </button>
            ))}
          </div>

          {temasPersonalizados.length > 0 && (
            <div>
              <span className="font-semibold text-slate-200 block mb-2">
                Mis Temas Guardados:
              </span>
              <div className="flex flex-wrap gap-2">
                {temasPersonalizados.map((t) => (
                  <div
                    key={t.id}
                    className={`inline-flex items-center gap-1.5 rounded-lg border pl-3 pr-1.5 py-1 ${
                      temaActivo.id === t.id
                        ? 'bg-indigo-600/30 border-indigo-500 text-white font-medium'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <button
                      onClick={() => setTemaActivo(t)}
                      className="flex items-center gap-2"
                    >
                      <span className="flex gap-1">
                        <span
                          className="w-2 h-2 rounded-full border border-white/20"
                          style={{ backgroundColor: t.fondo || '#090d16' }}
                        />
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: t.colorTitulo }}
                        />
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: t.colorDias }}
                        />
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: t.colorHoras }}
                        />
                      </span>
                      {t.nombre}
                    </button>
                    <button
                      onClick={() => eliminarTemaPersonalizado(t.id)}
                      className="text-rose-400 hover:text-rose-300 px-1 font-bold text-xs"
                      title="Eliminar tema"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-5">
              {/* SELECTOR COLOR DE FONDO */}
              <label className="flex items-center gap-2 cursor-pointer bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800">
                <span className="font-medium text-slate-300">Fondo:</span>
                <input
                  type="color"
                  value={temaActivo.fondo || '#090d16'}
                  onChange={(e) =>
                    setTemaActivo({
                      ...temaActivo,
                      id: 'custom',
                      fondo: e.target.value,
                    })
                  }
                  className="w-6 h-6 bg-transparent rounded cursor-pointer border-0"
                />
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800">
                <span className="font-medium text-slate-300">Título:</span>
                <input
                  type="color"
                  value={temaActivo.colorTitulo}
                  onChange={(e) =>
                    setTemaActivo({
                      ...temaActivo,
                      id: 'custom',
                      colorTitulo: e.target.value,
                    })
                  }
                  className="w-6 h-6 bg-transparent rounded cursor-pointer border-0"
                />
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800">
                <span className="font-medium text-slate-300">Días:</span>
                <input
                  type="color"
                  value={temaActivo.colorDias}
                  onChange={(e) =>
                    setTemaActivo({
                      ...temaActivo,
                      id: 'custom',
                      colorDias: e.target.value,
                    })
                  }
                  className="w-6 h-6 bg-transparent rounded cursor-pointer border-0"
                />
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800">
                <span className="font-medium text-slate-300">Horas:</span>
                <input
                  type="color"
                  value={temaActivo.colorHoras}
                  onChange={(e) =>
                    setTemaActivo({
                      ...temaActivo,
                      id: 'custom',
                      colorHoras: e.target.value,
                    })
                  }
                  className="w-6 h-6 bg-transparent rounded cursor-pointer border-0"
                />
              </label>
            </div>

            <form
              onSubmit={handleGuardarTemaPropio}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Nombre del tema..."
                value={nombreNuevoTema}
                onChange={(e) => setNombreNuevoTema(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1 rounded-lg text-xs transition-colors"
              >
                Guardar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ÁREA EXPORTABLE COMPLETA (CARGA ACADÉMICA + GRILLA) */}
      <div
        id="area-horario-exportable"
        className="space-y-4 p-4 rounded-2xl transition-colors duration-300"
        style={{ backgroundColor: temaActivo.fondo || '#090d16' }}
      >
        {/* Carga Académica */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center backdrop-blur-sm">
          <div className="p-2 bg-slate-950/50 rounded-lg border border-indigo-500/20">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Créditos SCT
            </div>
            <div className="text-lg font-bold text-indigo-400">{totalSct} SCT</div>
          </div>
          <div className="p-2 bg-slate-950/50 rounded-lg border border-emerald-500/20">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Presencial (TP)
            </div>
            <div className="text-lg font-bold text-emerald-400">{totalTp} hrs/sem</div>
          </div>
          <div className="p-2 bg-slate-950/50 rounded-lg border border-cyan-500/20">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Autónomo (TA)
            </div>
            <div className="text-lg font-bold text-cyan-400">{totalTa} hrs/sem</div>
          </div>
          <div className="p-2 bg-slate-950/50 rounded-lg border border-purple-500/20">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Carga Total
            </div>
            <div className="text-lg font-bold text-purple-400">
              {totalHorasSemana} hrs/sem
            </div>
          </div>
        </div>

        {/* Grilla Horaria */}
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
                    style={{ color: temaActivo.colorDias }}
                  >
                    {dia}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {bloquesVisibles.map((horaBloque) => {
                const [horaInicio, horaFin] = horaBloque.split(' - ');
                const esAlmuerzo = horaInicio === '13:15';

                return (
                  <tr
                    key={horaBloque}
                    className={`transition-colors ${
                      esAlmuerzo ? 'bg-yellow-500/20 border-y-2 border-yellow-500/50' : 'hover:bg-slate-800/20'
                    }`}
                  >
                    <td
                      className={`p-3 text-center text-xs font-mono transition-colors ${
                        esAlmuerzo ? 'text-yellow-400 font-bold' : 'font-medium'
                      }`}
                      style={{ color: esAlmuerzo ? undefined : temaActivo.colorHoras }}
                    >
                      <div>{horaBloque}</div>
                      {esAlmuerzo && (
                        <div className="text-[10px] uppercase font-black tracking-wider text-yellow-400 mt-1 bg-yellow-500/20 rounded py-0.5">
                          ALMUERZO
                        </div>
                      )}
                    </td>

                    {DIAS_SEMANA.map((dia) => {
                      const limiteDiaMinutos = aMinutos(limitesPorDia[dia] || '18:00');
                      const horaFinBloqueMinutos = aMinutos(horaFin);
                      const estaFueraDeRango =
                        hayLimitesManuales && horaFinBloqueMinutos > limiteDiaMinutos;

                      if (estaFueraDeRango) {
                        return (
                          <td
                            key={`${dia}-${horaBloque}`}
                            className="p-1 border-l border-slate-800/40 min-w-[150px] align-middle text-center bg-slate-950/40"
                          >
                            <span className="text-xs text-slate-600 select-none">
                              —
                            </span>
                          </td>
                        );
                      }

                      const ramosEncontrados = asignaturas.filter((ramo) =>
                        ramo.bloques.some(
                          (b) => b.dia === dia && b.horaInicio === horaInicio
                        )
                      );

                      const hayTope = ramosEncontrados.length > 1;

                      return (
                        <td
                          key={`${dia}-${horaBloque}`}
                          className={`p-1 border-l border-slate-800/60 min-w-[150px] align-top relative group transition-colors ${
                            hayTope ? 'bg-rose-950/20 border-rose-500/40' : ''
                          }`}
                        >
                          {hayTope && (
                            <div className="text-[10px] text-center font-bold text-rose-400 bg-rose-950/80 border border-rose-500/30 rounded py-0.5 mb-1">
                              TOPE ({ramosEncontrados.length})
                            </div>
                          )}

                          <div className="space-y-1">
                            {ramosEncontrados.map((ramo) => {
                              const bloque = ramo.bloques.find(
                                (b) => b.dia === dia && b.horaInicio === horaInicio
                              );

                              return (
                                <button
                                  type="button"
                                  key={ramo.id}
                                  onClick={() => abrirModalEditar(ramo)}
                                  className={`w-full text-left p-2 rounded-lg border text-xs flex flex-col justify-between transition-all shadow-md cursor-pointer hover:brightness-110 active:scale-[0.98] ${
                                    MAPA_COLORES[ramo.color]
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="font-semibold line-clamp-1">
                                        {ramo.nombre}
                                      </span>
                                      {ramo.condicion && ramo.condicion !== 'Al día' && (
                                        <span
                                          className={`text-[9px] px-1 py-0.2 rounded border ${
                                            ramo.condicion === 'Atrasado'
                                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                          }`}
                                        >
                                          {ramo.condicion}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] opacity-75 font-mono">
                                      {ramo.codigo && <span>{ramo.codigo}</span>}
                                      {bloque?.tipo && (
                                        <span className="text-slate-400">
                                          • {bloque.tipo}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between mt-1 text-[10px] opacity-90">
                                    {bloque?.sala ? (
                                      <span className="font-medium bg-slate-950/80 px-1.5 py-0.5 rounded border border-white/10">
                                        {bloque.sala}
                                      </span>
                                    ) : (
                                      <span />
                                    )}
                                    <span className="text-[10px] opacity-50 hover:opacity-100">
                                      Editar
                                    </span>
                                  </div>
                                </button>
                              );
                            })}

                            {ramosEncontrados.length === 0 && (
                              <button
                                type="button"
                                onClick={() => abrirModalCrear(dia as DiaSemana, horaBloque)}
                                className={`w-full h-16 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-800/40 border border-dashed flex items-center justify-center transition-all text-xs ${
                                  esAlmuerzo
                                    ? 'border-yellow-500/50 text-yellow-400/80 hover:text-yellow-300'
                                    : 'border-slate-700/50 text-slate-500 hover:text-indigo-400'
                                }`}
                                title={`Agregar ramo el ${dia} a las ${horaBloque}`}
                              >
                                +
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botón Flotante Móvil */}
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

      <ModalImportarPdf
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />
    </div>
  );
}