import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import { parseScheduleBuffer } from './excel';

describe('schedule import', () => {
  it('reads prefixed spreadsheet XML and Excel serial dates', async () => {
    const zip = new JSZip();
    zip.file('xl/worksheets/sheet1.xml', `<?xml version="1.0"?><x:worksheet xmlns:x="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><x:sheetData>
      <x:row r="1"><x:c r="A1" t="str"><x:v>ACTIVIDAD</x:v></x:c><x:c r="B1" t="str"><x:v>INICIO</x:v></x:c><x:c r="C1" t="str"><x:v>FIN</x:v></x:c></x:row>
      <x:row r="2"><x:c r="A2" t="str"><x:v>INSTALACIÓN DE MOBILIARIO</x:v></x:c><x:c r="B2" t="n"><x:v>47394</x:v></x:c><x:c r="C2" t="n"><x:v>47400</x:v></x:c></x:row>
    </x:sheetData></x:worksheet>`);
    const generated = await zip.generateAsync({ type: 'arraybuffer' });
    const tasks = await parseScheduleBuffer(generated);
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({ name: 'INSTALACIÓN DE MOBILIARIO', start: '2029-10-03', end: '2029-10-09' });
  });
});
