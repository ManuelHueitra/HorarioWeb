import { useState, useEffect } from 'react';
import { useHorarioStore } from '@/store/useHorarioStore';
import { DIAS_SEMANA, BLOQUES_HORAS } from '@/utils/constantes';
import type {
  ColorAsignatura,
  DiaSemana,
  BloqueHorario,
  Asignatura,
  TipoClase,
  CondicionAsignatura,
} from '@/types';

interface ModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly asignaturaEditar?: Asignatura | null;
  readonly bloqueInicial?: { dia: DiaSemana; bloqueHora: string } | null;
}

interface BloqueForm {
  id: string;
  dia: DiaSemana;
  bloqueHora: string;
  sala: string;
  tipo: TipoClase;
}

const PALETA_COLORES: { valor: ColorAsignatura; etiqueta: string; bg: string }[] = [
  { valor: 'blue', etiqueta: 'Azul', bg: 'bg-blue-600' },
  { valor: 'emerald', etiqueta: 'Verde', bg: 'bg-emerald-600' },
  { valor: 'purple', etiqueta: 'Purpura', bg: 'bg-purple-600' },
  { valor: 'amber', etiqueta: 'Amarillo', bg: 'bg-amber-600' },
  { valor: 'rose', etiqueta: 'Rojo', bg: 'bg-rose-600' },
  { valor: 'indigo', etiqueta: 'Indigo', bg: 'bg-indigo-600' },
  { valor: 'cyan', etiqueta: 'Cian', bg: 'bg-cyan-600' },
];

const TIPOS_CLASE: TipoClase[] = ['Catedra', 'Taller', 'Laboratorio', 'Ayudantia'];
const CONDICIONES: CondicionAsignatura[] = ['Regular', 'Arrastre', 'Adelanto'];

export function ModalAsignatura({
  isOpen,
  onClose,
  asignaturaEditar,
  bloqueInicial,
}: ModalProps) {
  const { agregarAsignatura, actualizarAsignatura, eliminarAsignatura } =
    useHorarioStore();

  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [profesor, setProfesor] = useState('');
  const [color, setColor] = useState<ColorAsignatura>('blue');
  const [condicion, setCondicion] = useState<CondicionAsignatura>('Regular');

  const [creditosSct, setCreditosSct] = useState<number | ''>('');
  const [horasTp, setHorasTp] = useState<number | ''>('');
  const [horasTa, setHorasTa] = useState<number | ''>('');

  const [bloquesForm, setBloquesForm] = useState<BloqueForm[]>([
    {
      id: crypto.randomUUID(),
      dia: 'Lunes',
      bloqueHora: BLOQUES_HORAS[0],
      sala: '',
      tipo: 'Catedra',
    },
  ]);

  useEffect(() => {
    if (asignaturaEditar) {
      setNombre(asignaturaEditar.nombre);
      setCodigo(asignaturaEditar.codigo || '');
      setProfesor(asignaturaEditar.profesor || '');
      setColor(asignaturaEditar.color);
      setCondicion(asignaturaEditar.condicion || 'Regular');
      setCreditosSct(asignaturaEditar.creditosSct ?? '');
      setHorasTp(asignaturaEditar.horasTp ?? '');
      setHorasTa(asignaturaEditar.horasTa ?? '');

      if (asignaturaEditar.bloques && asignaturaEditar.bloques.length > 0) {
        setBloquesForm(
          asignaturaEditar.bloques.map((b) => ({
            id: b.id || crypto.randomUUID(),
            dia: (b.dia as DiaSemana) || 'Lunes',
            bloqueHora: `${b.horaInicio} - ${b.horaFin}`,
            sala: b.sala || '',
            tipo: b.tipo || 'Catedra',
          }))
        );
      }
    } else {
      setNombre('');
      setCodigo('');
      setProfesor('');
      setColor('blue');
      setCondicion('Regular');
      setCreditosSct('');
      setHorasTp('');
      setHorasTa('');
      setBloquesForm([
        {
          id: crypto.randomUUID(),
          dia: bloqueInicial ? bloqueInicial.dia : 'Lunes',
          bloqueHora: bloqueInicial ? bloqueInicial.bloqueHora : BLOQUES_HORAS[0],
          sala: '',
          tipo: 'Catedra',
        },
      ]);
    }
  }, [asignaturaEditar, bloqueInicial, isOpen]);

  if (!isOpen) return null;

  const agregarNuevoBloque = () => {
    setBloquesForm((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        dia: 'Lunes',
        bloqueHora: BLOQUES_HORAS[0],
        sala: '',
        tipo: 'Catedra',
      },
    ]);
  };

  const eliminarBloqueForm = (id: string) => {
    if (bloquesForm.length === 1) return;
    setBloquesForm((prev) => prev.filter((b) => b.id !== id));
  };

  const actualizarBloqueForm = (
    id: string,
    campo: keyof BloqueForm,
    valor: string
  ) => {
    setBloquesForm((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [campo]: valor } : b))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const bloquesMapeados: BloqueHorario[] = bloquesForm.map((b) => {
      const [horaInicio, horaFin] = b.bloqueHora.split(' - ');
      return {
        id: b.id,
        dia: b.dia,
        horaInicio,
        horaFin,
        sala: b.sala.trim() || undefined,
        tipo: b.tipo,
      };
    });

    const datosAsignatura: Asignatura = {
      id: asignaturaEditar ? asignaturaEditar.id : crypto.randomUUID(),
      nombre: nombre.trim(),
      codigo: codigo.trim() || undefined,
      profesor: profesor.trim() || undefined,
      color,
      condicion,
      creditosSct: creditosSct !== '' ? Number(creditosSct) : 0,
      horasTp: horasTp !== '' ? Number(horasTp) : 0,
      horasTa: horasTa !== '' ? Number(horasTa) : 0,
      bloques: bloquesMapeados,
    };

    if (asignaturaEditar) {
      actualizarAsignatura(datosAsignatura);
    } else {
      agregarAsignatura(datosAsignatura);
    }

    onClose();
  };

  const handleEliminar = () => {
    if (asignaturaEditar) {
      eliminarAsignatura(asignaturaEditar.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-xl font-semibold text-slate-100">
            {asignaturaEditar ? 'Editar Asignatura' : 'Agregar Asignatura'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors font-mono"
          >
            X
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Nombre de la Asignatura *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Estructura de Datos"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Codigo (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: FDICI03"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Condicion
              </label>
              <select
                value={condicion}
                onChange={(e) => setCondicion(e.target.value as CondicionAsignatura)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {CONDICIONES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Profesor (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Lucas Almonacid"
              value={profesor}
              onChange={(e) => setProfesor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                SCT (Creditos)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Ej: 5"
                value={creditosSct}
                onChange={(e) =>
                  setCreditosSct(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Horas TP
              </label>
              <input
                type="number"
                min="0"
                placeholder="Ej: 4"
                value={horasTp}
                onChange={(e) =>
                  setHorasTp(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Horas TA
              </label>
              <input
                type="number"
                min="0"
                placeholder="Ej: 4"
                value={horasTa}
                onChange={(e) =>
                  setHorasTa(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">
                Bloques de Horario
              </label>
              <button
                type="button"
                onClick={agregarNuevoBloque}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                + Agregar otro bloque
              </button>
            </div>

            {bloquesForm.map((b, index) => (
              <div
                key={b.id}
                className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 relative"
              >
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Bloque {index + 1}</span>
                  {bloquesForm.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarBloqueForm(b.id)}
                      className="text-rose-400 hover:text-rose-300 text-xs font-bold"
                    >
                      Quitar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <select
                      value={b.dia}
                      onChange={(e) =>
                        actualizarBloqueForm(b.id, 'dia', e.target.value)
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {DIAS_SEMANA.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={b.bloqueHora}
                      onChange={(e) =>
                        actualizarBloqueForm(b.id, 'bloqueHora', e.target.value)
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {BLOQUES_HORAS.map((hora) => (
                        <option key={hora} value={hora}>
                          {hora}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={b.tipo}
                      onChange={(e) =>
                        actualizarBloqueForm(b.id, 'tipo', e.target.value)
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {TIPOS_CLASE.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Sala / Lab de este bloque (Opcional)"
                    value={b.sala}
                    onChange={(e) =>
                      actualizarBloqueForm(b.id, 'sala', e.target.value)
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Color Distintivo
            </label>
            <div className="flex gap-2">
              {PALETA_COLORES.map((item) => (
                <button
                  type="button"
                  key={item.valor}
                  onClick={() => setColor(item.valor)}
                  className={`w-7 h-7 rounded-full ${item.bg} transition-transform ${
                    color === item.valor
                      ? 'ring-2 ring-white scale-110'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  title={item.etiqueta}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {asignaturaEditar ? (
              <button
                type="button"
                onClick={handleEliminar}
                className="px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors border border-rose-900/50"
              >
                Eliminar Asignatura
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
              >
                {asignaturaEditar ? 'Guardar Cambios' : 'Guardar Ramo'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}