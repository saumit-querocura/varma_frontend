'use strict';
(() => {
  const get = id => document.getElementById(id);
  const viewer = createViewer(get('model'));
  const titles = { explorer: 'Molecular explorer', library: 'Compound library', desk: 'Research notebook', studio: 'Evidence studio', journey: 'Research lifecycle' };
  const aliases = { top: 'explorer', platform: 'library', bloom: 'desk' };
  const rail = get('rail');
  const menu = get('menu');
  const guide = get('guide');
  const stage = get('viewer');
  const subscript = value => value.replace(/\d/g, digit => '₀₁₂₃₄₅₆₇₈₉'[digit]);
  menu.setAttribute('aria-controls', 'rail');

  function closeMenu() {
    rail.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  }

  function selectCompound(compound) {
    get('compound-id').textContent = 'PUBCHEM  /  CID ' + compound.cid;
    get('profile-name').textContent = get('compound-name').textContent = compound.name;
    get('family').textContent = compound.family;
    get('profile-description').textContent = compound.description;
    get('source').href = 'https://pubchem.ncbi.nlm.nih.gov/compound/' + compound.cid;
    get('model').setAttribute('aria-label', compound.name + ' three-dimensional structure. Drag or use arrow keys to rotate.');
    const properties = [
      ['Molecular formula', subscript(compound.formula)],
      ['Molecular weight', compound.mass, ' g/mol'],
      ['XLogP', compound.logP],
      ['H-bond donors', compound.donors],
      ['H-bond acceptors', compound.acceptors]
    ];
    get('properties').replaceChildren(...properties.map(([name, value, unit]) => {
      const row = document.createElement('div');
      row.className = 'property';
      const term = document.createElement('dt'), detail = document.createElement('dd');
      term.textContent = name; detail.textContent = value;
      if (unit) { const small = document.createElement('small'); small.textContent = unit; detail.append(small); }
      row.append(term, detail);
      return row;
    }));
    const symbols = new Set(compound['3d'].atoms.map(([el]) => el));
    get('legend').replaceChildren(...Object.keys(elements).filter(el => symbols.has(el)).map(el => {
      const entry = document.createElement('span'), dot = document.createElement('i');
      dot.className = 'el-' + el;
      entry.append(dot, elements[el].name);
      return entry;
    }));
    const position = compounds.indexOf(compound);
    const previous = compounds[(position + compounds.length - 1) % compounds.length];
    const next = compounds[(position + 1) % compounds.length];
    get('previous-compound').href = '#explorer/' + previous.cid;
    get('previous-compound').textContent = '← ' + previous.name;
    get('next-compound').href = '#explorer/' + next.cid;
    get('next-compound').textContent = next.name + ' →';
    get('compound-position').textContent = (position + 1) + ' / ' + compounds.length + ' reference compounds';
    viewer.setCompound(compound);
  }

  function card(compound) {
    const link = document.createElement('a');
    link.className = 'compound-card ' + compound.tint;
    link.href = '#explorer/' + compound.cid;
    link.setAttribute('aria-label', 'Explore ' + compound.name);
    link.innerHTML = '<span class="card-art"><img alt=""><span class="card-cid"></span></span><span class="card-info"><span><strong></strong><span class="card-type"></span></span><svg class="icon" aria-hidden="true"><use href="#i-up-right"/></svg></span>';
    link.querySelector('img').src = 'assets/compound-' + compound.cid + '.png';
    link.querySelector('.card-cid').textContent = 'CID ' + compound.cid;
    link.querySelector('strong').textContent = compound.name;
    link.querySelector('.card-type').textContent = compound.family;
    link.addEventListener('click', () => { if (location.hash === link.hash) window.scrollTo(0, 0); });
    return link;
  }

  function filterCollection() {
    const query = get('library-query').value.trim().toLowerCase();
    const results = compounds.filter(c => [c.name, c.family, c.formula, c.cid].join(' ').toLowerCase().includes(query));
    get('result-count').textContent = results.length ? results.length + ' compound' + (results.length === 1 ? '' : 's') : 'No compounds match. Try a name, formula or PubChem CID.';
    get('collection').replaceChildren(...results.map(card));
  }

  function route() {
    const [hash, cid] = location.hash.slice(1).split('/');
    if (hash === 'main') { get('main').focus(); return; }
    const page = aliases[hash] || (Object.hasOwn(titles, hash) ? hash : 'explorer');
    document.querySelectorAll('[data-page]').forEach(section => { section.hidden = section.dataset.page !== page; });
    document.querySelectorAll('[data-nav]').forEach(link => {
      if (link.dataset.nav === page) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    if (page === 'explorer') selectCompound(compounds.find(c => c.cid === Number(cid)) || compounds[0]);
    get('breadcrumb').textContent = titles[page];
    document.title = titles[page] + ' · Varma';
    closeMenu();
    if (hash === 'bloom') get('bloom').scrollIntoView();
    else window.scrollTo(0, 0);
  }

  document.querySelectorAll('[data-nav]').forEach(link => {
    link.setAttribute('aria-label', link.textContent.trim());
    link.title = link.textContent.trim();
  });
  document.querySelector('.skip-link').addEventListener('click', event => {
    event.preventDefault();
    get('main').focus();
  });
  get('featured').replaceChildren(...compounds.slice(0, 3).map(card));
  filterCollection();
  get('library-query').addEventListener('input', filterCollection);
  get('representation').addEventListener('change', event => viewer.setMode(event.target.value));
  get('zoom-in').addEventListener('click', () => viewer.zoomBy(1.16));
  get('zoom-out').addEventListener('click', () => viewer.zoomBy(1 / 1.16));
  get('reset-view').addEventListener('click', viewer.reset);
  function updateExpand() {
    const expanded = !!document.fullscreenElement || stage.classList.contains('expanded');
    const label = expanded ? 'Exit expanded view' : 'Expand structure viewer';
    get('expand').setAttribute('aria-label', label);
    get('expand').title = label;
    get('expand').setAttribute('aria-pressed', expanded);
  }
  get('expand').addEventListener('click', async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (stage.classList.contains('expanded')) stage.classList.remove('expanded');
    else {
      try { await stage.requestFullscreen(); }
      catch { stage.classList.add('expanded'); }
    }
    updateExpand();
  });
  document.addEventListener('fullscreenchange', updateExpand);
  document.querySelectorAll('[data-guide]').forEach(button => button.addEventListener('click', () => guide.showModal()));
  get('close-guide').addEventListener('click', () => guide.close());
  menu.addEventListener('click', () => menu.setAttribute('aria-expanded', rail.classList.toggle('open')));
  rail.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('click', event => {
    if (!rail.contains(event.target) && !menu.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { closeMenu(); stage.classList.remove('expanded'); updateExpand(); }
  });
  window.addEventListener('hashchange', route);
  route();
})();
