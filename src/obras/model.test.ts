import { describe, expect, it } from 'vitest';
import { finances, riskLevel, taskStatus, validWorksDocument, workProgress, Work } from './model';

const work: Work = { id:'w', name:'Casa', client:'Ana', location:'Quito', description:'', start:'2026-09-01', end:'2026-09-30', budget:1000, status:'active', createdAt:'2026-09-01T00:00:00Z', team:[], risks:[], logs:[], movements:[{id:'m1',date:'2026-09-05',type:'payment',category:'Anticipo',description:'',amount:500},{id:'m2',date:'2026-09-06',type:'expense',category:'Materiales',description:'',amount:200}], tasks:[{id:'t1',name:'Uno',phase:'General',responsible:'',start:'2026-09-01',end:'2026-09-02',progress:100,notes:''},{id:'t2',name:'Dos',phase:'General',responsible:'',start:'2026-09-03',end:'2026-09-04',progress:50,notes:''}] };

describe('obras model', () => {
  it('weights progress by duration', () => expect(workProgress(work)).toBe(75));
  it('separates contract, expenses and payments', () => expect(finances(work)).toEqual({expenses:200,payments:500,pendingPayment:500,budgetBalance:800,cashBalance:300}));
  it('marks overdue and completed tasks', () => { expect(taskStatus(work.tasks[0],'2026-09-10')).toBe('completed'); expect(taskStatus({...work.tasks[1],progress:20},'2026-09-10')).toBe('late'); });
  it('classifies risk exposure', () => { expect(riskLevel(20)).toBe('crítico'); expect(riskLevel(6)).toBe('medio'); });
  it('validates the persisted document', () => expect(validWorksDocument({version:1,selectedId:'w',works:[work]})).toBe(true));
});
