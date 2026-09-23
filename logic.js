(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MATLogic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  function clean(v){ return String(v == null ? '' : v).trim(); }
  function validISODate(v){
    if(!DATE_RE.test(v)) return false;
    const [y,m,d]=v.split('-').map(Number);
    const dt=new Date(Date.UTC(y,m-1,d));
    return dt.getUTCFullYear()===y && dt.getUTCMonth()===m-1 && dt.getUTCDate()===d;
  }
  function normalizeInput(input){
    const text=clean(input.text), owner=clean(input.owner), dueDate=clean(input.dueDate);
    const errors=[];
    if(!text) errors.push('Action is required.');
    if(!owner) errors.push('Owner is required.');
    if(!dueDate) errors.push('Due date is required.');
    else if(!validISODate(dueDate)) errors.push('Due date must be a valid YYYY-MM-DD date.');
    if(errors.length){ const e=new Error(errors.join(' ')); e.code='INVALID_INPUT'; e.errors=errors; throw e; }
    return {text,owner,dueDate};
  }
  function nextId(actions){
    const max=(actions||[]).reduce((n,a)=>{
      const m=/^MAT-(\d+)$/.exec(String(a.id||'')); return m?Math.max(n,Number(m[1])):n;
    },0);
    return `MAT-${String(max+1).padStart(4,'0')}`;
  }
  function assertUnique(actions){
    const ids=new Set();
    for(const a of actions||[]){ if(!a.id || ids.has(a.id)) throw new Error('Duplicate or missing action identity.'); ids.add(a.id); }
    return true;
  }
  function createAction(actions,input,createdAt){
    const cur=(actions||[]).map(a=>({...a})); assertUnique(cur);
    const v=normalizeInput(input); const id=nextId(cur);
    const action={id,...v,completed:false,createdAt:createdAt||new Date().toISOString(),completedAt:null};
    return {actions:[...cur,action], action};
  }
  function editAction(actions,id,input){
    const v=normalizeInput(input); let found=false;
    const out=(actions||[]).map(a=>{ if(a.id!==id) return {...a}; found=true; return {...a,...v,id:a.id}; });
    if(!found) throw new Error('Action not found.'); assertUnique(out); return out;
  }
  function setCompleted(actions,id,completed,completedAt){
    let found=false;
    const out=(actions||[]).map(a=>{ if(a.id!==id) return {...a}; found=true; return {...a,completed:Boolean(completed),completedAt:completed?(completedAt||new Date().toISOString()):null}; });
    if(!found) throw new Error('Action not found.'); return out;
  }
  function isOverdue(action,todayISO){
    const today=clean(todayISO); if(!validISODate(today)) throw new Error('todayISO must be YYYY-MM-DD.');
    return !action.completed && validISODate(action.dueDate) && action.dueDate < today;
  }
  function status(action,todayISO){ return action.completed?'Completed':(isOverdue(action,todayISO)?'Overdue':'Open'); }
  function todayLocal(d){ const x=d||new Date(); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`; }
  function csvEscape(v){ const s=String(v==null?'':v); return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s; }
  function toCSV(actions,todayISO){
    assertUnique(actions||[]); const head=['id','action','owner','due_date','status','overdue'];
    const rows=(actions||[]).map(a=>[a.id,a.text,a.owner,a.dueDate,status(a,todayISO),isOverdue(a,todayISO)?'true':'false']);
    return [head,...rows].map(r=>r.map(csvEscape).join(',')).join('\n')+'\n';
  }
  function sortActions(actions,todayISO){
    return [...(actions||[])].sort((a,b)=>{
      const rank=x=>x.completed?2:(isOverdue(x,todayISO)?0:1);
      return rank(a)-rank(b) || a.dueDate.localeCompare(b.dueDate) || a.id.localeCompare(b.id);
    });
  }
  return {clean,validISODate,normalizeInput,nextId,assertUnique,createAction,editAction,setCompleted,isOverdue,status,todayLocal,toCSV,sortActions};
});
