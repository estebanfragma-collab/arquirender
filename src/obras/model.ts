export type WorkStatus = 'planning' | 'active' | 'paused' | 'completed';
export type TaskStatus = 'planned' | 'active' | 'late' | 'completed';
export type RiskStatus = 'open' | 'controlled' | 'closed';
export type MovementType = 'expense' | 'payment';

export type WorkTask = {
  id: string;
  name: string;
  phase: string;
  responsible: string;
  start: string;
  end: string;
  progress: number;
  notes: string;
};

export type TeamMember = { id: string; name: string; role: string; email: string; phone: string };
export type WorkRisk = { id: string; title: string; category: string; probability: number; impact: number; owner: string; response: string; status: RiskStatus };
export type WorkMovement = { id: string; date: string; type: MovementType; category: string; description: string; amount: number };
export type WorkLog = { id: string; date: string; title: string; note: string; taskId: string; progress?: number; image?: string };
export type WorkBudgetSource = { type: 'manual' | 'costs'; label: string; total: number; updatedAt: string };
export type Work = {
  id: string;
  name: string;
  client: string;
  location: string;
  description: string;
  start: string;
  end: string;
  budget: number;
  budgetSource?: WorkBudgetSource;
  sourceBudgetId?: string;
  status: WorkStatus;
  tasks: WorkTask[];
  team: TeamMember[];
  risks: WorkRisk[];
  movements: WorkMovement[];
  logs: WorkLog[];
  createdAt: string;
};

export type WorksDocument = { version: 1; selectedId: string; works: Work[] };

export const WORKS_KEY = 'arquirender-works-v1';
export const today = () => new Date().toISOString().slice(0, 10);
export const money = (value: number) => new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(value || 0);
export const clamp = (value: number, max = 1_000_000_000) => Number.isFinite(value) ? Math.min(max, Math.max(0, value)) : 0;
export const uid = () => crypto.randomUUID();

export function emptyDocument(): WorksDocument { return { version: 1, selectedId: '', works: [] }; }

export function newWork(input: Pick<Work, 'name' | 'client' | 'location' | 'start' | 'end' | 'budget'>): Work {
  return { id: uid(), ...input, budgetSource: input.budget > 0 ? { type:'manual', label:'Ingresado al crear la obra', total:input.budget, updatedAt:new Date().toISOString() } : undefined, description: '', status: 'planning', tasks: [], team: [], risks: [], movements: [], logs: [], createdAt: new Date().toISOString() };
}

const day = 86_400_000;
export function dateNumber(value: string) { const n = Date.parse(`${value}T12:00:00`); return Number.isFinite(n) ? n : 0; }
export function addDays(value: string, amount: number) { return new Date(dateNumber(value) + amount * day).toISOString().slice(0, 10); }
export function duration(task: Pick<WorkTask, 'start' | 'end'>) { return Math.max(1, Math.round((dateNumber(task.end) - dateNumber(task.start)) / day) + 1); }
export function taskStatus(task: WorkTask, current = today()): TaskStatus {
  if (task.progress >= 100) return 'completed';
  if (task.end && task.end < current) return 'late';
  if (task.start && task.start <= current) return 'active';
  return 'planned';
}

export function workProgress(work: Pick<Work, 'tasks'>) {
  const weight = work.tasks.reduce((sum, task) => sum + duration(task), 0);
  if (!weight) return 0;
  return Math.round(work.tasks.reduce((sum, task) => sum + clamp(task.progress, 100) * duration(task), 0) / weight);
}

export function finances(work: Pick<Work, 'budget' | 'movements'>) {
  const expenses = work.movements.filter(row => row.type === 'expense').reduce((sum, row) => sum + clamp(row.amount), 0);
  const payments = work.movements.filter(row => row.type === 'payment').reduce((sum, row) => sum + clamp(row.amount), 0);
  return { expenses, payments, pendingPayment: Math.max(0, work.budget - payments), budgetBalance: work.budget - expenses, cashBalance: payments - expenses };
}

export function riskScore(risk: Pick<WorkRisk, 'probability' | 'impact'>) { return clamp(risk.probability, 5) * clamp(risk.impact, 5); }
export function riskLevel(score: number) { return score >= 15 ? 'crítico' : score >= 8 ? 'alto' : score >= 4 ? 'medio' : 'bajo'; }

function validDate(value: unknown) { return typeof value === 'string' && (!value || /^\d{4}-\d{2}-\d{2}$/.test(value)); }
function validNumber(value: unknown, max = 1_000_000_000) { return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max; }
function validText(value: unknown, max = 20_000) { return typeof value === 'string' && value.length <= max; }
function validImage(value: unknown) { return value === undefined || (typeof value === 'string' && value.length <= 500_000 && /^data:image\/(?:jpeg|png|webp);base64,/.test(value)); }

export function validWorksDocument(value: unknown): value is WorksDocument {
  if (!value || typeof value !== 'object') return false;
  const document = value as WorksDocument;
  if (document.version !== 1 || !validText(document.selectedId, 100) || !Array.isArray(document.works) || document.works.length > 200) return false;
  return document.works.every(work => work && validText(work.id, 100) && validText(work.name, 500) && validText(work.client, 500) && validText(work.location, 500) && validText(work.description) && validDate(work.start) && validDate(work.end) && validNumber(work.budget) && (work.sourceBudgetId === undefined || validText(work.sourceBudgetId, 100)) && (work.budgetSource === undefined || (work.budgetSource && ['manual','costs'].includes(work.budgetSource.type) && validText(work.budgetSource.label, 1000) && validNumber(work.budgetSource.total) && validText(work.budgetSource.updatedAt, 100))) && ['planning', 'active', 'paused', 'completed'].includes(work.status) && validText(work.createdAt, 100)
    && Array.isArray(work.tasks) && work.tasks.length <= 2000 && work.tasks.every(task => task && validText(task.id, 100) && validText(task.name, 1000) && validText(task.phase, 500) && validText(task.responsible, 500) && validDate(task.start) && validDate(task.end) && validNumber(task.progress, 100) && validText(task.notes))
    && Array.isArray(work.team) && work.team.length <= 500 && work.team.every(person => person && validText(person.id, 100) && validText(person.name, 500) && validText(person.role, 500) && validText(person.email, 500) && validText(person.phone, 100))
    && Array.isArray(work.risks) && work.risks.length <= 1000 && work.risks.every(risk => risk && validText(risk.id, 100) && validText(risk.title, 1000) && validText(risk.category, 500) && validNumber(risk.probability, 5) && validNumber(risk.impact, 5) && validText(risk.owner, 500) && validText(risk.response) && ['open', 'controlled', 'closed'].includes(risk.status))
    && Array.isArray(work.movements) && work.movements.length <= 5000 && work.movements.every(row => row && validText(row.id, 100) && validDate(row.date) && ['expense', 'payment'].includes(row.type) && validText(row.category, 500) && validText(row.description, 1000) && validNumber(row.amount))
    && Array.isArray(work.logs) && work.logs.length <= 1000 && work.logs.every(log => log && validText(log.id, 100) && validDate(log.date) && validText(log.title, 1000) && validText(log.note) && validText(log.taskId, 100) && (log.progress === undefined || validNumber(log.progress, 100)) && validImage(log.image)));
}
