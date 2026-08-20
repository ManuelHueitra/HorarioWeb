import { useState } from 'react';
import { useHorarioStore } from '@/store/useHorarioStore';
import { extraerTextoCompletoDePdf, procesarHorarioConIA } from '@/utils/pdfParser';
import type { Asignatura } from '@/types';

interface Props {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function ModalImportarPdf({ isOpen, onClose }: Props) {
  const { agregarMultiplesAsignaturas } = useHorarioStore();

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [asignaturasDetectadas, setAsignaturasDetectadas] = useState<Asignatura[]>([]);
  const [seleccionados, setSeleccionados] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleProcesarArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (archivo.type !== 'application/pdf') {
      setError('Por favor selecciona un archivo PDF válido.');
      return;
    }

    try {
      setCargando(true);
      setError(null);

      const texto = await extraerTextoCompletoDePdf(archivo);
      const resultado = await procesarHorarioConIA(texto);

      if (resultado.length === 0) {
        setError('No se detectaron asignaturas en el documento.');
      } else {
        setAsignaturasDetectadas(resultado);
        const inicial: Record<string, boolean> = {};
        resultado.forEach((a) => {
          inicial[a.id] = true;
        });
        setSeleccionados(inicial);
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al procesar el horario.');
    } finally {
      setCargando(false);
    }
  };

  const toggleSeleccion = (id: string) => {
    setSeleccionados((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const seleccionarTodos = (marcar: boolean) => {
    const nuevo: Record<string, boolean> = {};
    asignaturasDetectadas.forEach((a) => {
      nuevo[a.id] = marcar;
    });
    setSeleccionados(nuevo);
  };

  const handleImportar = () => {
    const aImportar = asignaturasDetectadas.filter((a) => seleccionados[a.id]);
    if (aImportar.length > 0) {
      agregarMultiplesAsignaturas(aImportar);
    }
    onClose();
    setAsignaturasDetectadas([]);
  };

  const totalSeleccionados = Object.values(seleccionados).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-100">
              Importar Horario desde PDF
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Procesamiento automático inteligente de asignaturas, salas y docentes
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors font-mono"
          >
            X
          </button>
        </div>

        {asignaturasDetectadas.length === 0 ? (
          <div className="space-y-4 py-6">
            <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-8 text-center transition-colors">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleProcesarArchivo}
                disabled={cargando}
                id="input-pdf"
                className="hidden"
              />
              <label
                htmlFor="input-pdf"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <span className="text-sm font-medium text-slate-200">
                  {cargando
                    ? 'La IA está extrayendo los ramos y horarios del PDF...'
                    : 'Haz clic aquí para seleccionar tu PDF de horario'}
                </span>
                <span className="text-xs text-slate-500">
                  Soporta horarios de cualquier nivel y carrera
                </span>
              </label>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-lg">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">
                Asignaturas detectadas ({asignaturasDetectadas.length}):
              </span>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => seleccionarTodos(true)}
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Marcar todas
                </button>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => seleccionarTodos(false)}
                  className="text-slate-400 hover:text-slate-200 font-medium"
                >
                  Desmarcar todas
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {asignaturasDetectadas.map((asig) => (
                <div
                  key={asig.id}
                  onClick={() => toggleSeleccion(asig.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    seleccionados[asig.id]
                      ? 'bg-slate-950 border-indigo-500/60 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800 opacity-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!seleccionados[asig.id]}
                    onChange={() => toggleSeleccion(asig.id)}
                    className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                  />

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-100">
                        {asig.nombre}
                      </span>
                      {asig.codigo && (
                        <span className="text-[11px] font-mono font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/30">
                          {asig.codigo}
                        </span>
                      )}
                    </div>

                    {asig.profesor && (
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span className="text-slate-500">Docente:</span>
                        <span className="text-slate-300 font-medium">{asig.profesor}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {asig.bloques.map((b) => (
                        <span
                          key={b.id}
                          className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 text-[11px] flex items-center gap-1"
                        >
                          <strong className="text-indigo-400 font-medium">{b.dia}</strong>
                          <span>{b.horaInicio} - {b.horaFin}</span>
                          {b.sala && <span className="text-slate-500">• {b.sala}</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancelar
          </button>

          {asignaturasDetectadas.length > 0 && (
            <button
              type="button"
              onClick={handleImportar}
              disabled={totalSeleccionados === 0}
              className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
            >
              Importar {totalSeleccionados}{' '}
              {totalSeleccionados === 1 ? 'asignatura' : 'asignaturas'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}