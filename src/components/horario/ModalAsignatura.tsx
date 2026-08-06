import { useState } from 'react';
import { useHorarioStore } from '@/store/useHorarioStore';
import { DIAS_SEMANA, BLOQUES_HORAS } from '@/utils/constantes';
import type { ColorAsignatura, DiaSemana } from '@/types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PALETA_COLORES: { valor: ColorAsignatura; etiqueta: string; bg: string }[] = [
  { valor: 'blue', etiqueta: 'Azul', bg: 'bg-blue-600' },
  { valor: 'emerald', etiqueta: 'Verde', bg: 'bg-emerald-600' },
  { valor: 'purple', etiqueta: 'Púrpura', bg: 'bg-purple-600' },
  { valor: 'amber', etiqueta: 'Amarillo', bg: 'bg-amber-600' },
  { valor: 'rose', etiqueta: 'Rojo', bg: 'bg-rose-600' },
  { valor: 'indigo', etiqueta: 'Índigo', bg: 'bg-indigo-600' },
  { valor: 'cyan', etiqueta: 'Cian', bg: 'bg-cyan-600' },
];

export function ModalAsignatura({ isOpen, onClose }: ModalProps) {
  const { agregarAsignatura } = useHorarioStore();

  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [profesor, setProfesor] = useState('');
  const [sala, setSala] = useState('');
  const [color, setColor] = useState<ColorAsignatura>('blue');
  const [dia, setDia] = useState<DiaSemana>('Lunes');
  const [bloqueHora, setBloqueHora] = useState(BLOQUES_HORAS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    // Separar la hora de inicio y fin desde la cadena del bloque "08:30 - 09:15"
    const [horaInicio, horaFin] = bloqueHora.split(' - ');

    agregarAsignatura({
      id: crypto.randomUUID(),
      nombre,
      codigo: codigo || undefined,
      profesor: profesor || undefined,
      color,
      bloques: [
        {
          id: crypto.randomUUID(),
          dia,
          horaInicio,
          horaFin,
          sala: sala || undefined,
        },
      ],
    });

    // Limpiar campos y cerrar
    setNombre('');
    setCodigo('');
    setProfesor('');
    setSala('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-xl font-semibold text-slate-100">Agregar Asignatura</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            ✕
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
                Código (Opcional)
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
                Sala (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: LABPIND / SALA 202"
                value={sala}
                onChange={(e) => setSala(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Día</label>
              <select
                value={dia}
                onChange={(e) => setDia(e.target.value as DiaSemana)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {DIAS_SEMANA.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Bloque Horario</label>
              <select
                value={bloqueHora}
                onChange={(e) => setBloqueHora(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {BLOQUES_HORAS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Color Distintivo</label>
            <div className="flex gap-2">
              {PALETA_COLORES.map((item) => (
                <button
                  type="button"
                  key={item.valor}
                  onClick={() => setColor(item.valor)}
                  className={`w-7 h-7 rounded-full ${item.bg} transition-transform ${
                    color === item.valor ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={item.etiqueta}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
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
              Guardar Ramo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}