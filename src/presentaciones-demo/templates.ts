export const templateIds = ['editorial', 'inmersiva', 'materialidad', 'sintesis', 'portada', 'comparativa', 'planos', 'cierre', 'galeria', 'cuadricula', 'mosaico', 'triptico', 'serif', 'tipografica', 'seccion', 'estudio', 'enfoque'] as const;
export type TemplateId = typeof templateIds[number];
export function pageTemplate(page: {id?: string; template?: unknown}, legacyTemplate: string = 'editorial'): TemplateId {
  const selected = templateIds.includes(page.template as TemplateId) ? page.template : legacyTemplate;
  return templateIds.includes(selected as TemplateId) ? selected as TemplateId : 'editorial';
}
export function setPageTemplate<T extends {id: string; template?: string}>(pages: T[], active: string, template: TemplateId): T[] {
  return pages.map(page => page.id === active ? {...page, template} : page);
}
export type PresentationFormat = '16:9' | '9:16';
export function documentFormat(value: unknown): PresentationFormat { return value === '9:16' ? '9:16' : '16:9'; }
export function sheetPrintStyles(format: PresentationFormat) {
 const size = format === '9:16' ? '180mm 320mm' : '320mm 180mm';
 const [width,height] = size.split(' ');
 return `@media print {
 @page { size: ${size}; margin: 0; }
 @page presentation { size: ${size}; margin: 0; }
 html, body, #root, .studio { margin:0!important; padding:0!important; height:auto!important; overflow:visible!important; }
 .studio .print-document { display:block!important; position:static!important; width:${width}!important; }
 .studio .print-document .sheet { page:presentation!important; width:${width}!important; height:${height}!important; max-width:none!important; min-height:0!important; margin:0!important; padding:0; box-sizing:border-box; break-inside:avoid!important; break-after:page!important; }
 .studio .print-document .sheet:last-child { break-after:auto!important; }
 }`;
}
