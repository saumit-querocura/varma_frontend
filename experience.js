'use strict';
(()=>{
  const ids=['a','b','c'];
  const inputs=ids.map(id=>document.getElementById('obs-'+id));
  const get=id=>document.getElementById(id);
  const output=document.querySelector('.desk-output');
  const fmt=value=>new Intl.NumberFormat('en-US',{maximumFractionDigits:4,useGrouping:false}).format(value);
  function setValues(values){inputs.forEach((input,i)=>{input.value=String(values[i])});update()}
  function update(){
    const values=inputs.map(input=>input.valueAsNumber);
    const valid=inputs.every((input,i)=>input.validity.valid&&Number.isFinite(values[i])&&values[i]>=0&&values[i]<=100);
    output.dataset.valid=String(valid);
    get('desk-error').textContent=valid?'':'Enter all three observations as numbers between 0 and 100.';
    if(!valid){['desk-mean','desk-range','desk-n'].forEach(id=>get(id).textContent='—');get('desk-formula').textContent='Waiting for valid observations';get('desk-chart').setAttribute('aria-label','Chart unavailable: invalid observations');return}
    const mean=values.reduce((sum,v)=>sum+v,0)/values.length;
    get('desk-mean').textContent=fmt(mean);get('desk-range').textContent=fmt(Math.max(...values)-Math.min(...values));get('desk-n').textContent=String(values.length);
    get('desk-formula').textContent='('+values.map(fmt).join(' + ')+') / 3 = '+fmt(mean);
    const y=v=>160-1.4*v;
    ids.forEach((id,i)=>{const bar=get('bar-'+id);bar.setAttribute('y',String(y(values[i])));bar.setAttribute('height',String(1.4*values[i]))});
    get('desk-meanline').setAttribute('d','M34 '+y(mean)+'H346');
    get('desk-chart').setAttribute('aria-label','Observations: '+ids.map((id,i)=>id.toUpperCase()+' '+fmt(values[i])).join(', ')+'. Mean '+fmt(mean));
  }
  inputs.forEach(input=>input.addEventListener('input',update));
  let next=0;
  const examples=[[15,45,30],[80,20,50],[32.5,61.5,56]];
  get('desk-example').addEventListener('click',()=>{setValues(examples[next]);next=(next+1)%examples.length});
  const note=get('desk-note');
  function count(){get('note-count').textContent=note.value.length+' / 300'}
  note.addEventListener('input',count);
  get('desk-reset').addEventListener('click',()=>{next=0;setValues([24,48,72]);note.value='';count()});
  window.addEventListener('pageshow',()=>{setValues([24,48,72]);note.value='';count()});
  update();count();
})();
