// Preserve links shared before the standalone workspace entry point was introduced.
function openLegacyWorkspaceLink() {
  const workspaceHash = /^#(?:explorer(?:\/\d+)?|library|desk|studio|journey|bloom|platform|top)$/;
  if (workspaceHash.test(location.hash)) location.replace('workspace.html' + location.hash);
}
openLegacyWorkspaceLink();
window.addEventListener('hashchange', openLegacyWorkspaceLink);

const displayFormula = formula => formula.replace(/\d/g, digit => '₀₁₂₃₄₅₆₇₈₉'[digit]);
const fieldNotes = {
  2519: {
    question: 'Can you spot the two joined rings?',
    answer: 'The five- and six-membered rings share a bond.',
    key: ['Five-membered ring', 'Six-membered ring'],
    finish: 'polished green and silver'
  },
  2244: {
    question: 'Where do the four oxygens sit?',
    answer: 'Two oxygens belong to the acid and two to the ester.',
    key: ['Carboxylic acid', 'Ester'],
    finish: 'polished lilac and rose'
  },
  3672: {
    question: 'Which end can donate a hydrogen bond?',
    answer: 'The acid has an OH donor. The branched tail has only carbon and hydrogen.',
    key: ['Carboxylic acid', 'Branched tail'],
    finish: 'polished amber and teal'
  }
};

function setupSpecimen() {
  const hero = document.querySelector('.hero');
  const specimen = document.getElementById('featured-specimen');
  const art = specimen.querySelector('.specimen-art');
  const caption = specimen.querySelector('figcaption');
  const reveal = document.getElementById('reveal');
  const key = document.getElementById('specimen-key');
  const picker = document.querySelector('.specimen-picker');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let compound;
  const turn = document.getElementById('turn');
  const canvas = document.getElementById('turn-model');
  const viewer = canvas.getContext('2d') ? createViewer(canvas) : null;
  turn.hidden = !viewer;
  let mode = 'studio';
  let entrance;

  function render(animate) {
    const note = fieldNotes[compound.cid];
    const revealed = mode === 'diagram';
    const turning = mode === 'turn';
    const slug = compound.name.toLowerCase();
    hero.dataset.specimen = slug;
    specimen.classList.toggle('revealed', revealed);
    canvas.hidden = !turning;
    art.hidden = turning;
    turn.textContent = turning ? 'Studio view' : 'Turn in 3D';
    turn.setAttribute('aria-pressed', String(turning));
    document.getElementById('turn-hint').hidden = !turning;
    canvas.setAttribute('aria-label', 'Interactive 3D model of ' + compound.name);
    art.src = 'assets/' + slug + (revealed ? '-features.webp' : '-studio.webp');
    art.alt = revealed ? compound.name + '. ' + note.answer + ' Mint outlines mark the ' + note.key[0].toLowerCase() + ' and pink outlines mark the ' + note.key[1].toLowerCase() + '.' :
      'Molecular model of ' + compound.name + ' rendered in ' + note.finish + '.';
    document.getElementById('field-question').textContent = revealed ? note.answer : note.question;
    key.hidden = !revealed;
    [...key.children].forEach((item, index) => { item.textContent = note.key[index]; });
    reveal.firstChild.nodeValue = revealed ? 'Back to model ' : 'Show me ';
    reveal.setAttribute('aria-expanded', String(revealed));
    document.getElementById('featured-name').textContent = compound.name;
    caption.querySelector('.tiny').textContent = 'PubChem CID ' + compound.cid;
    caption.querySelector('strong span').textContent = displayFormula(compound.formula);
    const link = caption.querySelector('a');
    link.href = 'workspace.html#explorer/' + compound.cid;
    link.title = 'Inspect ' + compound.name + ' in the explorer';
    link.setAttribute('aria-label', link.title);
    document.querySelector('.launch').href = link.href;
    entrance?.cancel();
    if (animate && !turning && !reduced.matches) {
      entrance = art.animate([{ opacity: .15, transform: 'translateY(7px) scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'ease-out' });
    }
  }

  function select(animate) {
    compound = compounds.find(item => item.cid === Number(picker.querySelector(':checked').value));
    mode = 'studio';
    viewer?.setCompound(compound);
    render(animate);
  }
  picker.addEventListener('change', () => select(true));
  reveal.addEventListener('click', () => {
    mode = mode === 'diagram' ? 'studio' : 'diagram';
    render(true);
  });
  turn.addEventListener('click', () => {
    mode = mode === 'turn' ? 'studio' : 'turn';
    render(true);
    if (mode === 'turn') canvas.focus({ preventScroll: true });
  });
  select(false);
}

function setupComparison() {
  const first = document.getElementById('compare-a');
  const second = document.getElementById('compare-b');
  for (const select of [first, second]) {
    for (const compound of compounds) select.add(new Option(compound.name, compound.cid));
  }
  first.value = '2519'; second.value = '5429';

  function compare() {
    const selected = [first, second].map(select => compounds.find(item => item.cid === Number(select.value)));
    const [a, b] = selected;
    for (const option of first.options) option.disabled = option.value === second.value;
    for (const option of second.options) option.disabled = option.value === first.value;
    selected.forEach((compound, i) => {
      const side = i === 0 ? 'a' : 'b';
      const image = document.getElementById('sketch-' + side);
      image.src = 'assets/compound-' + compound.cid + '.png';
      image.alt = 'Skeletal structure of ' + compound.name;
      document.getElementById('name-' + side).textContent = compound.name;
    });
    const props = [
      ['Formula', compound => displayFormula(compound.formula)],
      ['Weight (g/mol)', compound => compound.mass],
      ['XLogP', compound => compound.logP],
      ['H-bond donors', compound => compound.donors],
      ['H-bond acceptors', compound => compound.acceptors]
    ];
    const rows = props.map(([label, value]) => {
      const row = document.createElement('tr');
      const title = document.createElement('th');
      title.scope = 'row'; title.textContent = label; row.append(title);
      for (const compound of selected) row.insertCell().textContent = value(compound);
      return row;
    });
    document.getElementById('property-rows').replaceChildren(...rows);
    const heavier = Number(a.mass) >= Number(b.mass) ? a : b;
    const lighter = heavier === a ? b : a;
    const difference = Math.abs(Number(a.mass) - Number(b.mass));
    let note = difference < .005 ? 'These compounds have the same molecular weight at the precision shown. Compare their formulas and functional groups.' :
      heavier.name + ' is ' + difference.toFixed(2) + ' g/mol heavier than ' + lighter.name.toLowerCase() + '.';
    if (selected.every(item => item.cid === 2519 || item.cid === 5429)) note = 'Caffeine has one more methyl group in place of a hydrogen. That adds 14.03 g/mol and removes theobromine’s hydrogen bond donor.';
    document.getElementById('comparison-note').textContent = note;
  }
  first.addEventListener('change', compare);
  second.addEventListener('change', compare);
  compare();
}

setupSpecimen();
setupComparison();
document.querySelectorAll('[data-enhanced]').forEach(item => { item.hidden = false; });
