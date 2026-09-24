export const templateIds = ['editorial', 'inmersiva', 'materialidad', 'sintesis'] as const;
export type TemplateId = typeof templateIds[number];
export function pageTemplate(page: {id?: string; template?: unknown}, legacyTemplate: string = 'editorial'): TemplateId {
  const selected = templateIds.includes(page.template as TemplateId) ? page.template : legacyTemplate;
  return templateIds.includes(selected as TemplateId) ? selected as TemplateId : 'editorial';
}
export function setPageTemplate<T extends {id: string; template?: string}>(pages: T[], active: string, template: TemplateId): T[] {
  return pages.map(page => page.id === active ? {...page, template} : page);
}
export const sheetPrintStyles = `@media print {
  @page { size: 300mm 200mm; margin: 0; }
  @page sheetLandscape { size: 300mm 200mm; margin: 0; }
  @page sheetPortrait { size: 210mm 280mm; margin: 0; }
  .print-document .sheet { page: sheetLandscape; }
  .print-document .sheet.sintesis { page: sheetPortrait; }
}`;
