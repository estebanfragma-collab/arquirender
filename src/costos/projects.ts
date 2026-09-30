import { Budget, totals, validBudget } from './model';

export const SAVED_BUDGETS_KEY = 'arquirender-saved-budgets-v1';

export type SavedBudgetProject = {
  id: string;
  name: string;
  client: string;
  total: number;
  itemCount: number;
  updatedAt: string;
  budget: Budget;
};

export type SavedBudgetsDocument = { version: 1; selectedId: string; projects: SavedBudgetProject[] };

export const emptySavedBudgets = (): SavedBudgetsDocument => ({ version: 1, selectedId: '', projects: [] });

export function savedBudget(budget: Budget, id = crypto.randomUUID()): SavedBudgetProject {
  return { id, name: budget.name.trim() || 'Cotización sin nombre', client: budget.client.trim(), total: totals(budget).total, itemCount: budget.items.length, updatedAt: new Date().toISOString(), budget: structuredClone(budget) };
}

export function validSavedBudgets(value: unknown): value is SavedBudgetsDocument {
  if (!value || typeof value !== 'object') return false;
  const document = value as SavedBudgetsDocument;
  return document.version === 1 && typeof document.selectedId === 'string' && Array.isArray(document.projects) && document.projects.length <= 500 && document.projects.every(project => project && typeof project.id === 'string' && typeof project.name === 'string' && typeof project.client === 'string' && typeof project.total === 'number' && Number.isFinite(project.total) && project.total >= 0 && typeof project.itemCount === 'number' && Number.isInteger(project.itemCount) && project.itemCount >= 0 && typeof project.updatedAt === 'string' && validBudget(project.budget));
}
