import ExcelJS from 'exceljs';
import { clamp, uid, WorkTask } from './model';

const aliases = {
  name: ['actividad', 'tarea', 'nombre', 'descripcion', 'descripción'],
  phase: ['fase', 'capitulo', 'capítulo', 'etapa'],
  responsible: ['responsable', 'encargado'],
  start: ['inicio', 'fecha inicio', 'fecha de inicio'],
  end: ['fin', 'fecha fin', 'fecha de fin', 'fecha limite', 'fecha límite'],
  progress: ['avance', '% avance', 'progreso', '% completado', 'porcentaje completado'],
} as const;

const text = (value: unknown) => String(value ?? '').trim();
const normal = (value: unknown) => text(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9%]+/g, ' ').trim();
const date = (value: unknown) => {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value.toISOString().slice(0, 10);
  const candidate = text(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(candidate)) return candidate.slice(0, 10);
  const match = candidate.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  return match ? `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}` : '';
};
const cellValue = (cell: ExcelJS.Cell) => {
  const value = cell.value;
  if (value && typeof value === 'object' && 'result' in value) return value.result;
  if (value && typeof value === 'object' && 'text' in value) return value.text;
  return value;
};

export async function importSchedule(file: File): Promise<WorkTask[]> {
  if (file.size > 15_000_000) throw new Error('El archivo supera 15 MB.');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  for (const sheet of workbook.worksheets) {
    let header = 0;
    let map: Record<string, number> = {};
    for (let row = 1; row <= Math.min(25, sheet.rowCount); row += 1) {
      const cells: Record<string, number> = {};
      sheet.getRow(row).eachCell((cell, column) => { cells[normal(cellValue(cell))] = column; });
      const found: Record<string, number> = {};
      Object.entries(aliases).forEach(([key, names]) => { const alias = names.find(name => cells[normal(name)]); if (alias) found[key] = cells[normal(alias)]; });
      if (found.name && found.start && found.end) { header = row; map = found; break; }
    }
    if (!header) continue;
    const tasks: WorkTask[] = [];
    for (let row = header + 1; row <= sheet.rowCount && tasks.length < 2000; row += 1) {
      const current = sheet.getRow(row);
      const name = text(cellValue(current.getCell(map.name)));
      if (!name) continue;
      const start = date(cellValue(current.getCell(map.start)));
      const end = date(cellValue(current.getCell(map.end)));
      if (!start || !end) continue;
      const rawProgress = map.progress ? Number(cellValue(current.getCell(map.progress)) || 0) : 0;
      tasks.push({ id: uid(), name, phase: map.phase ? text(cellValue(current.getCell(map.phase))) : 'General', responsible: map.responsible ? text(cellValue(current.getCell(map.responsible))) : '', start, end, progress: clamp(rawProgress <= 1 ? rawProgress * 100 : rawProgress, 100), notes: '' });
    }
    if (tasks.length) return tasks;
  }
  throw new Error('No encontramos una tabla con Actividad, Inicio y Fin.');
}

export async function downloadScheduleTemplate() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Cronograma');
  sheet.columns = [
    { header: 'Actividad', key: 'name', width: 38 }, { header: 'Fase', key: 'phase', width: 22 }, { header: 'Responsable', key: 'responsible', width: 25 },
    { header: 'Inicio', key: 'start', width: 15 }, { header: 'Fin', key: 'end', width: 15 }, { header: '% avance', key: 'progress', width: 14 },
  ];
  sheet.addRow({ name: 'Replanteo y trazado', phase: 'Preliminares', responsible: 'Residente de obra', start: new Date(), end: new Date(Date.now() + 5 * 86_400_000), progress: 0 });
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }; sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF26922' } };
  sheet.getColumn('start').numFmt = 'dd/mm/yyyy'; sheet.getColumn('end').numFmt = 'dd/mm/yyyy';
  const blob = new Blob([await workbook.xlsx.writeBuffer()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'formato-cronograma-arquirender.xlsx'; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
