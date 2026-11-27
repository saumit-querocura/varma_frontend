'use strict';
const researchCases = Object.freeze({
  methylation: Object.freeze({a:2519,b:5429,question:'Could the methylation affect molecular interactions? A target-specific study and appropriate experimental evidence would be needed.'}),
  lipophilicity: Object.freeze({a:3672,b:2244,question:'Could the estimated partitioning difference affect behavior in a particular experimental system? Consider ionisation, pH and measured solubility before drawing conclusions.'}),
  'hydrogen-bonding': Object.freeze({a:1983,b:2519,question:'Would the differing donor and acceptor counts matter for a particular binding site? Geometry, protonation and experimental binding data are needed.'})
});
function buildResearchCase(key, data) {
  if (!Object.hasOwn(researchCases,key) || !Array.isArray(data)) return null;
  const preset=researchCases[key], a=data.find(x=>x.cid===preset.a), b=data.find(x=>x.cid===preset.b);
  if (!a || !b || a.cid===b.cid) return null;
  const definitions=[['Mass (g/mol)','mass',2],['XLogP estimate','logP',1],['H-bond donors','donors',0],['H-bond acceptors','acceptors',0]];
  const rows=definitions.map(([label,field,digits])=>{
    const valid=v=>(typeof v==='number'||typeof v==='string'&&v.trim()!=='')&&Number.isFinite(Number(v));
    if(!valid(a[field])||!valid(b[field])) return null;
    const x=Number(a[field]),y=Number(b[field]),delta=Number((x-y).toFixed(digits));
    if(!Number.isFinite(delta)) return null;
    const format=n=>n.toFixed(digits).replace('-', '−');
    return {label,a:format(x),b:format(y),delta:(delta>0?'+':'')+format(delta),value:delta};
  });
  if(rows.some(row=>row===null)) return null;
  const [mass,logP,donors,acceptors]=rows;
  let observation;
  if(key==='methylation') observation=a.name+' has an additional methyl group replacing a hydrogen. Mass difference (A−B): '+mass.delta+' g/mol; donor count difference: '+donors.delta+'.';
  else if(key==='lipophilicity') observation='The recorded XLogP estimates are '+logP.a+' for '+a.name+' and '+logP.b+' for '+b.name+'. Difference: '+logP.delta+'. These are estimates, not measured solubilities.';
  else observation='The donor count difference (A−B) is '+donors.delta+' and acceptor count difference is '+acceptors.delta+'. These counts do not establish actual binding interactions.';
  return {a,b,rows,observation,hypothesis:preset.question};
}
function mountResearchCase(doc,data) {
  const get=id=>doc.getElementById(id);
  const select=get('case-preset'), controls=get('case-controls');
  if(!select||!controls) return;
  const formula=value=>String(value).replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[d]);
  function render() {
    const result=buildResearchCase(select.value,data);
    if(!result) return false;
    for(const side of ['a','b']){
      const c=result[side];
      get('case-name-'+side).textContent=c.name;
      get('case-formula-'+side).textContent=formula(c.formula);
      const image=get('case-art-'+side);
      image.src='assets/compound-'+c.cid+'.png';
      image.alt='Skeletal structure of '+c.name;
      get('case-explore-'+side).href='workspace.html#explorer/'+c.cid;
      get('case-source-'+side).href='https://pubchem.ncbi.nlm.nih.gov/compound/'+c.cid;
    }
    const rows=result.rows.map(row=>{
      const tr=doc.createElement('tr'), th=doc.createElement('th');
      th.scope='row'; th.textContent=row.label; tr.append(th);
      for(const value of [row.a,row.b,row.delta]) tr.insertCell().textContent=value;
      return tr;
    });
    get('case-rows').replaceChildren(...rows);
    get('case-observation').textContent=result.observation;
    get('case-hypothesis').textContent=result.hypothesis;
    return true;
  }
  if(render()){
    controls.hidden=false;
    let last=select.value;
    select.addEventListener('change',()=>{if(render())last=select.value;else select.value=last;});
  }
}
if(typeof document!=='undefined'&&typeof compounds!=='undefined') mountResearchCase(document,compounds);
