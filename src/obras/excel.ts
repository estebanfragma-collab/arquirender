import ExcelJS from 'exceljs';
import JSZip from 'jszip';
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
  if (typeof value === 'number' && value > 20_000 && value < 100_000) return new Date(Date.UTC(1899, 11, 30) + value * 86_400_000).toISOString().slice(0, 10);
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

function tasksFromRows(rows: unknown[][]) {
  let header = -1;
  let map: Record<string, number> = {};
  for (let row = 0; row < Math.min(25, rows.length); row += 1) {
    const cells: Record<string, number> = {};
    rows[row].forEach((value, column) => { if (text(value)) cells[normal(value)] = column; });
    const found: Record<string, number> = {};
    Object.entries(aliases).forEach(([key, names]) => { const alias = names.find(name => cells[normal(name)] !== undefined); if (alias) found[key] = cells[normal(alias)]; });
    if (found.name !== undefined && found.start !== undefined && found.end !== undefined) { header = row; map = found; break; }
  }
  if (header < 0) {
    // Some site schedules omit a formal header and begin directly with
    // activity + start + end. Infer that layout instead of rejecting it.
    for (let row = 0; row < Math.min(50, rows.length); row += 1) {
      const current = rows[row] || [];
      for (let nameColumn = 0; nameColumn < Math.min(12, current.length); nameColumn += 1) {
        const name = text(current[nameColumn]);
        if (!name || date(current[nameColumn]) || /^\d+(?:[.,]\d+)?$/.test(name)) continue;
        const dateColumns = current
          .map((value, column) => ({ column, value: date(value) }))
          .filter(item => item.column > nameColumn && item.column <= nameColumn + 8 && item.value)
          .map(item => item.column);
        if (dateColumns.length < 2) continue;
        const [startColumn, endColumn] = dateColumns;
        const matchingRows = rows.slice(row).filter(candidate =>
          text(candidate?.[nameColumn]) && date(candidate?.[startColumn]) && date(candidate?.[endColumn]),
        );
        if (matchingRows.length >= 2) {
          header = row - 1;
          map = { name: nameColumn, start: startColumn, end: endColumn };
          break;
        }
      }
      if (map.name !== undefined) break;
    }
  }
  if (map.name === undefined || map.start === undefined || map.end === undefined) return [];
  const tasks: WorkTask[] = [];
  for (let row = header + 1; row < rows.length && tasks.length < 2000; row += 1) {
    const current = rows[row];
    const name = text(current[map.name]);
    if (!name || normal(name) === 'fuente') continue;
    const start = date(current[map.start]);
    const end = date(current[map.end]);
    if (!start || !end) continue;
    const rawProgress = map.progress === undefined ? 0 : Number(current[map.progress] || 0);
    tasks.push({ id: uid(), name, phase: map.phase === undefined ? 'General' : text(current[map.phase]) || 'General', responsible: map.responsible === undefined ? '' : text(current[map.responsible]), start, end, progress: clamp(rawProgress <= 1 ? rawProgress * 100 : rawProgress, 100), notes: '' });
  }
  return tasks;
}

const columnNumber = (reference: string) => reference.match(/[A-Z]+/i)?.[0].toUpperCase().split('').reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0) || 0;
const elements = (node: Document | Element, name: string) => Array.from(node.getElementsByTagNameNS('*', name));

async function rawRows(buffer: ArrayBuffer) {
  const zip = await JSZip.loadAsync(buffer);
  const sharedFile = zip.file('xl/sharedStrings.xml');
  const shared: string[] = [];
  if (sharedFile) {
    const xml = new DOMParser().parseFromString(await sharedFile.async('text'), 'application/xml');
    elements(xml, 'si').forEach(item => shared.push(elements(item, 't').map(part => part.textContent || '').join('')));
  }
  const sheets = Object.keys(zip.files).filter(name => /^xl\/worksheets\/sheet\d+\.xml$/i.test(name)).sort();
  for (const name of sheets) {
    const file = zip.file(name); if (!file) continue;
    const xml = new DOMParser().parseFromString(await file.async('text'), 'application/xml');
    const rows: unknown[][] = [];
    elements(xml, 'row').forEach(row => {
      const values: unknown[] = [];
      elements(row, 'c').forEach(cell => {
        const column = columnNumber(cell.getAttribute('r') || '') - 1;
        const type = cell.getAttribute('t') || '';
        const raw = elements(cell, 'v')[0]?.textContent ?? elements(cell, 't').map(part => part.textContent || '').join('');
        values[column] = type === 's' ? shared[Number(raw)] || '' : type === 'n' || (!type && raw !== '') ? Number(raw) : raw;
      });
      rows.push(values);
    });
    const tasks = tasksFromRows(rows);
    if (tasks.length) return tasks;
  }
  return [];
}

export async function parseScheduleBuffer(buffer: ArrayBuffer): Promise<WorkTask[]> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    for (const sheet of workbook.worksheets) {
      const rows: unknown[][] = [];
      for (let row = 1; row <= sheet.rowCount; row += 1) {
        const values: unknown[] = [];
        sheet.getRow(row).eachCell({ includeEmpty: true }, (cell, column) => { values[column - 1] = cellValue(cell); });
        rows.push(values);
      }
      const tasks = tasksFromRows(rows);
      if (tasks.length) return tasks;
    }
  } catch { /* Some valid generators use namespace prefixes ExcelJS cannot parse. */ }
  const tasks = await rawRows(buffer);
  if (tasks.length) return tasks;
  throw new Error('No encontramos una tabla con Actividad, Inicio y Fin.');
}

export async function importSchedule(file: File): Promise<WorkTask[]> {
  if (file.size > 15_000_000) throw new Error('El archivo supera 15 MB.');
  return parseScheduleBuffer(await file.arrayBuffer());
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
