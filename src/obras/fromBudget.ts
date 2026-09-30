import { Budget, categoryOf, totals } from '../costos/model';
import { addDays as addCalendarDays, newWork, today, uid, Work } from './model';

const phaseOrder = ['OBRA CIVIL','FACHADA Y VIDRIERÍA','VIDRIO Y ALUMINIO','ACABADOS Y GYPSUM','PISOS','ILUMINACIÓN','MOBILIARIO Y MÓDULOS','ROTULACIÓN Y SEÑALÉTICA','VARIOS, TRANSPORTE Y MONTAJE','SIN CLASIFICAR'];

function estimateDays(unit: string, quantity: number) {
  const normalized = unit.toLocaleLowerCase();
  const productivity = /m2|m²/.test(normalized) ? 25 : /ml|mtl|m\/l/.test(normalized) ? 15 : /u|und/.test(normalized) ? 4 : 1;
  return Math.max(1, Math.min(15, Math.ceil(Math.max(1, quantity) / productivity)));
}

export function workFromBudget(budget: Budget, sourceBudgetId: string): Work {
  const start = today();
  let cursor = start;
  const sorted = [...budget.items].sort((a,b) => phaseOrder.indexOf(categoryOf(a)) - phaseOrder.indexOf(categoryOf(b)));
  const tasks = sorted.filter(item => item.description.trim()).map(item => {
    const duration = estimateDays(item.unit, item.quantity);
    const taskStart = cursor;
    const taskEnd = addCalendarDays(taskStart, duration - 1);
    cursor = addCalendarDays(taskEnd, 1);
    return { id:uid(), name:item.description.trim(), phase:categoryOf(item), responsible:'', start:taskStart, end:taskEnd, progress:0, notes:'Duración preliminar generada desde la cotización; revisar antes de iniciar la obra.' };
  });
  const work = newWork({ name:budget.name.trim()||'Obra sin nombre', client:budget.client.trim(), location:'', start, end:tasks.at(-1)?.end||start, budget:totals(budget).total });
  return { ...work, sourceBudgetId, tasks, budgetSource:{ type:'costs', label:`${budget.name.trim()||'Cotización sin nombre'}${budget.client.trim()?` · ${budget.client.trim()}`:''}`, total:totals(budget).total, updatedAt:new Date().toISOString() } };
}
