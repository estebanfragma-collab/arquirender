import { describe, expect, it } from 'vitest';
import { example, totals } from './model';
import { emptySavedBudgets, savedBudget, validSavedBudgets } from './projects';

describe('saved cost projects',()=>{
  it('stores a named snapshot with its PVP total',()=>{
    const budget=example();budget.name='Local Centro';budget.client='Cliente';
    const project=savedBudget(budget,'quote-1');
    const document={...emptySavedBudgets(),selectedId:project.id,projects:[project]};
    expect(project.total).toBe(totals(budget).total);
    expect(project.budget).not.toBe(budget);
    expect(validSavedBudgets(document)).toBe(true);
  });
});
