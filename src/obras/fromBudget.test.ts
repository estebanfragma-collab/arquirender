import { describe, expect, it } from 'vitest';
import { example, totals } from '../costos/model';
import { workFromBudget } from './fromBudget';

describe('quote to work',()=>{
  it('uses the client PVP and creates an editable activity for every priced item',()=>{
    const budget=example();budget.name='Obra San Luis';budget.client='Only';
    const work=workFromBudget(budget,'quote-1');
    expect(work.sourceBudgetId).toBe('quote-1');
    expect(work.budget).toBe(totals(budget).total);
    expect(work.tasks).toHaveLength(budget.items.length);
    expect(work.tasks.every(task=>task.start<=task.end&&task.progress===0)).toBe(true);
  });
});
