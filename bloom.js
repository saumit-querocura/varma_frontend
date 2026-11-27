'use strict';
(()=>{
  const inputs=['a','b','c'].map(id=>document.getElementById('obs-'+id));
  const answer=document.getElementById('pip-answer');
  const buttons=[...document.querySelectorAll('[data-pip]')];
  const fmt=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:6,useGrouping:false}).format(n);
  let selected='summary';
  function render(){
    const values=inputs.map(input=>input.valueAsNumber);
    if(!inputs.every((input,i)=>input.validity.valid&&Number.isFinite(values[i])&&values[i]>=0&&values[i]<=100)){
      answer.textContent='I need three valid numbers from 0 to 100. Fix the observations above and I will recalculate.';return;
    }
    const [a,b,c]=values, sorted=[...values].sort((x,y)=>x-y), sum=a+b+c, mean=sum/3, range=sorted[2]-sorted[0];
    const variance=values.reduce((s,v)=>s+(v-mean)**2,0)/2;
    const pairwise=((a-b)**2+(a-c)**2+(b-c)**2)/6;
    const agrees=Math.abs(variance-pairwise)<=1e-10*Math.max(1,variance,pairwise);
    const explanations={
      summary:'The mean is '+fmt(mean)+' and the range is '+fmt(range)+'.\nThe median is '+fmt(sorted[1])+'. These describe only your three example observations.',
      spread:'Range = '+fmt(sorted[2])+' − '+fmt(sorted[0])+' = '+fmt(range)+'.\nSample standard deviation = '+fmt(Math.sqrt(variance))+'. This uses n − 1 = 2; it does not establish uncertainty about a larger population.',
      median:'Sorted observations: '+sorted.map(fmt).join(', ')+'.\nThe middle value is '+fmt(sorted[1])+', so that is your median.',
      check:'Sum = '+fmt(sum)+'. Mean = '+fmt(sum)+' / 3 ≈ '+fmt(mean)+'.\nSample variance: '+fmt(variance)+'. Independent pairwise-difference formula: '+fmt(pairwise)+'. '+(agrees?'Both variance formulas agree within numerical tolerance.':'The variance formulas do not agree within tolerance.')+' Values are rounded for display.'
    };
    answer.textContent=explanations[selected];
  }
  buttons.forEach(button=>button.addEventListener('click',()=>{selected=button.dataset.pip;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render()}));
  inputs.forEach(input=>input.addEventListener('input',render));
  ['desk-example','desk-reset'].forEach(id=>document.getElementById(id).addEventListener('click',render));
  window.addEventListener('pageshow',render);
  render();
})();
