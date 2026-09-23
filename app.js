'use strict';
const L=window.MATLogic;
const STORAGE_KEY='ubuildos-meeting-action-tracker-v1';
const SAMPLE=[
  {id:'MAT-0001',text:'Send revised proposal to Northstar Office Park',owner:'Avery',dueDate:'2026-09-20',completed:false,createdAt:'2026-09-18T14:00:00Z',completedAt:null},
  {id:'MAT-0002',text:'Confirm installation window with facilities lead',owner:'Jordan',dueDate:'2026-09-23',completed:false,createdAt:'2026-09-18T14:02:00Z',completedAt:null},
  {id:'MAT-0003',text:'Archive signed scope and meeting notes',owner:'Morgan',dueDate:'2026-09-25',completed:true,createdAt:'2026-09-18T14:04:00Z',completedAt:'2026-09-19T16:10:00Z'}
];
let actions=[]; let editingId=null;
const $=s=>document.querySelector(s);
function load(){
  try{ const raw=localStorage.getItem(STORAGE_KEY); actions=raw?JSON.parse(raw):SAMPLE.map(x=>({...x})); L.assertUnique(actions); }
  catch(_){ actions=SAMPLE.map(x=>({...x})); }
}
function save(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(actions)); }
function message(text,type='ok'){ const n=$('#message'); n.textContent=text; n.dataset.type=type; }
function today(){ return L.todayLocal(new Date()); }
function render(){
  const list=$('#action-list'); list.innerHTML=''; const sorted=L.sortActions(actions,today());
  $('#count-open').textContent=String(actions.filter(a=>!a.completed).length);
  $('#count-overdue').textContent=String(actions.filter(a=>L.isOverdue(a,today())).length);
  $('#count-done').textContent=String(actions.filter(a=>a.completed).length);
  for(const a of sorted){
    const card=document.createElement('article'); card.className='action-card'; card.dataset.status=L.status(a,today()).toLowerCase();
    const top=document.createElement('div'); top.className='action-top';
    const title=document.createElement('h3'); title.textContent=a.text;
    const badge=document.createElement('span'); badge.className='badge'; badge.textContent=L.status(a,today());
    top.append(title,badge);
    const meta=document.createElement('p'); meta.className='meta'; meta.textContent=`${a.id} • Owner: ${a.owner} • Due: ${a.dueDate}`;
    const controls=document.createElement('div'); controls.className='card-controls';
    const toggle=document.createElement('button'); toggle.type='button'; toggle.textContent=a.completed?'Reopen':'Complete'; toggle.addEventListener('click',()=>{actions=L.setCompleted(actions,a.id,!a.completed);save();render();message(a.completed?'Action reopened.':'Action completed.');});
    const edit=document.createElement('button'); edit.type='button'; edit.className='secondary'; edit.textContent='Edit'; edit.addEventListener('click',()=>beginEdit(a));
    controls.append(toggle,edit); card.append(top,meta,controls); list.append(card);
  }
  if(!sorted.length){ const e=document.createElement('p'); e.className='empty'; e.textContent='No actions yet. Add the first owned, dated action above.'; list.append(e); }
}
function beginEdit(a){ editingId=a.id; $('#action-text').value=a.text; $('#action-owner').value=a.owner; $('#action-due').value=a.dueDate; $('#save-action').textContent='Save changes'; $('#cancel-edit').hidden=false; $('#form-title').textContent=`Edit ${a.id}`; $('#action-text').focus(); }
function resetForm(){ editingId=null; $('#action-form').reset(); $('#save-action').textContent='Add action'; $('#cancel-edit').hidden=true; $('#form-title').textContent='Add an action'; }
$('#action-form').addEventListener('submit',e=>{ e.preventDefault(); const input={text:$('#action-text').value,owner:$('#action-owner').value,dueDate:$('#action-due').value}; try{ if(editingId){actions=L.editAction(actions,editingId,input);message('Action updated.');}else{const r=L.createAction(actions,input);actions=r.actions;message(`${r.action.id} created.`);} save();resetForm();render(); }catch(err){message(err.message,'error');} });
$('#cancel-edit').addEventListener('click',()=>{resetForm();message('Edit cancelled.');});
$('#reset-sample').addEventListener('click',()=>{actions=SAMPLE.map(x=>({...x}));save();resetForm();render();message('Original synthetic sample data restored.');});
$('#export-csv').addEventListener('click',()=>{ const csv=L.toCSV(actions,today()); const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); const u=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=u;a.download='meeting-action-tracker-export.csv';document.body.append(a);a.click();a.remove();URL.revokeObjectURL(u);message('CSV export created locally.'); });
function runSelfTest(){
  try{
    let a=[]; let r=L.createAction(a,{text:'Test action',owner:'Tester',dueDate:'2026-09-20'},'2026-09-19T10:00:00Z'); a=r.actions; const id=r.action.id;
    a=L.editAction(a,id,{text:'Edited action',owner:'Tester 2',dueDate:'2026-09-21'}); if(a[0].id!==id) throw new Error('identity drift');
    if(!L.isOverdue(a[0],'2026-09-23')) throw new Error('overdue false');
    a=L.setCompleted(a,id,true,'2026-09-22T10:00:00Z'); if(L.isOverdue(a[0],'2026-09-23')) throw new Error('completed overdue');
    const csv=L.toCSV(a,'2026-09-23'); if(!csv.includes('Edited action')||!csv.includes(id)) throw new Error('export');
    $('#selftest-output').textContent='SELFTEST:PASS';
  }catch(e){ $('#selftest-output').textContent='SELFTEST:FAIL '+e.message; }
}
load();render();
if(new URLSearchParams(location.search).get('selftest')==='1') runSelfTest();
