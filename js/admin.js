/* =========================================================
   POTI JTI — Admin Panel
   Satu file JS untuk semua halaman. Halaman dikenali dari
   <body data-page="dashboard | pengurus | produk | mitra">.

   Data tabel disimpan di localStorage supaya tetap ada setelah
   di-refresh. Nanti tinggal ganti fungsi load() / save() dengan
   fetch() ke backend (PHP / Node / Laravel, dsb).
   ========================================================= */
(() => {
  'use strict';
  window.__potiAdminLoaded = true;

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const page = document.body.dataset.page;

  /* ---------------------------------------------------------
     1. Sidebar (jadi drawer di layar kecil)
     --------------------------------------------------------- */
  const menuToggle = $('.menu-toggle');
  const scrim = $('[data-scrim]');

  const setNav = (open) => {
    document.body.classList.toggle('nav-open', open);
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    }
  };
  if (menuToggle) menuToggle.addEventListener('click', () => setNav(!document.body.classList.contains('nav-open')));
  if (scrim) scrim.addEventListener('click', () => setNav(false));
  $$('.nav__link').forEach((a) => a.addEventListener('click', () => setNav(false)));
  const desktopMQ = window.matchMedia('(min-width: 961px)');
  const onDesktop = (e) => { if (e.matches) setNav(false); };
  if (desktopMQ.addEventListener) desktopMQ.addEventListener('change', onDesktop);
  else if (desktopMQ.addListener) desktopMQ.addListener(onDesktop); // Safari lama
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });

  /* ---------------------------------------------------------
     2. Dashboard: angka naik dari 0
     --------------------------------------------------------- */
  if (page === 'dashboard') {
    $$('[data-count]').forEach((el, i) => {
      const target = Number(el.dataset.count) || 0;
      if (reduceMotion) { el.textContent = target; return; }

      const duration = 900;
      el.textContent = '0';
      setTimeout(() => {
        let start = null;
        const tick = (now) => {
          if (start === null) start = now;
          const p = Math.min((now - start) / duration, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, 350 + i * 100);
    });
    return;
  }

  /* ---------------------------------------------------------
     3. Konfigurasi tiap halaman CRUD
     --------------------------------------------------------- */
  const rupiah = (n) => 'Rp. ' + Number(n).toLocaleString('id-ID');
  const onlyDigits = (v) => String(v).replace(/\D/g, '');

  const PAGES = {
    pengurus: {
      entity: 'Pengurus',
      storageKey: 'poti-jti:pengurus',
      columns: [{ key: 'nama' }, { key: 'jabatan' }, { key: 'username' }],
      fields: [
        { key: 'nama', label: 'Nama Pengurus', type: 'text', span: 2 },
        {
          key: 'jabatan', label: 'Jabatan', type: 'select', span: 2,
          options: ['Ketua', 'Wakil Ketua', 'Sekretaris', 'Bendahara', 'Divisi KWU'],
        },
        { key: 'username', label: 'Username', type: 'text', span: 1, autocomplete: 'off' },
        // Password TIDAK disimpan di localStorage. Kirim ke backend dan hash di server.
        {
          key: 'password', label: 'Password', type: 'password', span: 1,
          persist: false, optionalOnEdit: true, autocomplete: 'new-password',
        },
      ],
      seed: [{ nama: 'Bambang Sugiarto', jabatan: 'Divisi KWU', username: '#_bambang' }],
    },

    produk: {
      entity: 'Produk Jajanan',
      storageKey: 'poti-jti:produk-jajanan',
      columns: [{ key: 'nama' }, { key: 'kategori' }, { key: 'harga', format: rupiah }],
      fields: [
        { key: 'nama', label: 'Nama Produk Jajanan', type: 'text', span: 2 },
        { key: 'kategori', label: 'Kategori', type: 'text', span: 2 },
        { key: 'harga', label: 'Harga', type: 'currency', span: 2 },
      ],
      seed: [{ nama: 'Mie Ayam', kategori: 'Makanan', harga: 8000 }],
    },

    mitra: {
      entity: 'Mitra',
      storageKey: 'poti-jti:mitra-inventaris',
      columns: [{ key: 'nama' }, { key: 'produk' }, { key: 'harga', format: rupiah }],
      fields: [
        { key: 'nama', label: 'Nama Mitra', type: 'text', span: 2 },
        { key: 'produk', label: 'Produk Jajanan yang dibawa', type: 'text', span: 2 },
        { key: 'harga', label: 'Harga yang mitra kasih', type: 'currency', span: 2 },
      ],
      seed: [{ nama: 'Purnomo', produk: 'Mie Ayam', harga: 7000 }],
    },
  };

  const cfg = PAGES[page];
  if (!cfg) return;

  /* ---------------------------------------------------------
     4. Helper DOM + data
     --------------------------------------------------------- */
  const h = (tag, attrs = {}, ...kids) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === false || v == null) continue;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else node.setAttribute(k, v === true ? '' : v);
    }
    [].concat.apply([], kids).forEach((c) => { if (c != null) node.appendChild(c); });
    return node;
  };
  const icon = (id) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'ic');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#' + id);
    svg.append(use);
    return svg;
  };
  const uid = () => ((window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 8));

  function load() {
    try {
      const raw = localStorage.getItem(cfg.storageKey);
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) return data;
      }
    } catch (_) { /* localStorage tidak tersedia, pakai data awal */ }
    return cfg.seed.map((r) => ({ id: uid(), ...r }));
  }
  function save() {
    try { localStorage.setItem(cfg.storageKey, JSON.stringify(rows)); } catch (_) { /* abaikan */ }
  }

  let rows = load();
  let flashId = null;
  let editingId = null;
  let pendingDeleteId = null;

  /* ---------------------------------------------------------
     5. Tabel: render + cari
     --------------------------------------------------------- */
  const tbody = $('#tbody');
  const search = $('#search');
  const cellText = (row, col) => (col.format ? col.format(row[col.key]) : String(row[col.key] == null ? '' : row[col.key]));

  function buildRow(row, index) {
    const label = String(row[cfg.columns[0].key] == null ? '' : row[cfg.columns[0].key]);
    const tr = h('tr', { 'data-id': row.id, class: row.id === flashId ? 'is-flash' : null });
    tr.append(h('td', { text: String(index + 1) }));
    cfg.columns.forEach((c) => tr.append(h('td', { text: cellText(row, c) })));
    tr.append(
      h('td', {},
        h('div', { class: 'actions' },
          h('button', { type: 'button', class: 'icon-btn icon-btn--edit', 'data-action': 'edit', 'aria-label': `Ubah data ${label}` }, icon('i-edit')),
          h('button', { type: 'button', class: 'icon-btn icon-btn--delete', 'data-action': 'delete', 'aria-label': `Hapus data ${label}` }, icon('i-trash')),
        ),
      ),
    );
    return tr;
  }

  function render() {
    const q = search.value.trim().toLowerCase();
    const visible = rows.filter((r) => !q || cfg.columns.some((c) => cellText(r, c).toLowerCase().includes(q)));

    while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
    if (!visible.length) {
      tbody.append(h('tr', { class: 'is-empty' },
        h('td', { colspan: String(cfg.columns.length + 2), text: q ? 'Data tidak ditemukan' : 'Belum ada data' })));
    } else {
      visible.forEach((r, i) => tbody.append(buildRow(r, i)));
    }
    flashId = null;
  }
  search.addEventListener('input', render);

  /* ---------------------------------------------------------
     6. Overlay (modal): buka, tutup, fokus, Escape
     --------------------------------------------------------- */
  const openStack = [];

  function openOverlay(overlay, focusTarget) {
    overlay._returnFocus = document.activeElement;
    overlay.inert = false;
    overlay.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('is-locked');
    void overlay.offsetWidth; // paksa reflow supaya transisi jalan
    overlay.classList.add('is-open');
    openStack.push(overlay);
    setTimeout(() => { if (focusTarget) focusTarget.focus({ preventScroll: true }); }, reduceMotion ? 0 : 80);
  }

  function closeOverlay(overlay) {
    overlay.classList.remove('is-open');
    overlay.inert = true;
    overlay.setAttribute('aria-hidden', 'true');
    const i = openStack.indexOf(overlay);
    if (i > -1) openStack.splice(i, 1);
    if (!openStack.length) document.documentElement.classList.remove('is-locked');
    if (overlay._returnFocus && overlay._returnFocus.focus) overlay._returnFocus.focus({ preventScroll: true });
  }

  document.addEventListener('keydown', (e) => {
    const top = openStack[openStack.length - 1];
    if (!top) return;
    if (e.key === 'Escape') { e.preventDefault(); closeOverlay(top); return; }
    if (e.key !== 'Tab') return;

    const focusable = $$('button:not([disabled]), input:not([disabled]), select:not([disabled])', top)
      .filter((el) => el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------------------------------------------------------
     7. Modal form Tambah / Ubah Data
     --------------------------------------------------------- */
  const hasTwoCols = cfg.fields.some((f) => f.span === 1);

  const form = h('form', {
    class: 'dialog dialog--form' + (hasTwoCols ? '' : ' is-single'),
    role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'formTitle', novalidate: true, tabindex: '-1',
  });
  const formTitle = h('h2', { class: 'dialog__title', id: 'formTitle' });
  const grid = h('div', { class: 'form-grid' });

  cfg.fields.forEach((f) => {
    const id = 'field-' + f.key;
    let control;
    if (f.type === 'select') {
      control = h('select', { id, name: f.key, required: true },
        h('option', { value: '', disabled: true, selected: true, hidden: true, text: '-- Select --' }),
        f.options.map((o) => h('option', { value: o, text: o })));
    } else {
      control = h('input', {
        id, name: f.key,
        type: f.type === 'currency' ? 'text' : f.type,
        inputmode: f.type === 'currency' ? 'numeric' : null,
        maxlength: f.type === 'currency' ? '15' : '100',
        autocomplete: f.autocomplete || 'off',
      });
    }
    grid.append(
      h('div', { class: 'field' + (f.span === 2 ? ' field--full' : ''), 'data-key': f.key },
        h('label', { for: id, text: f.label }),
        control,
        h('p', { class: 'field__error', role: 'alert', 'aria-live': 'polite' }),
      ),
    );
  });

  const btnBack = h('button', { type: 'button', class: 'btn btn--ghost btn--wide', text: 'Kembali' });
  const btnSave = h('button', { type: 'submit', class: 'btn btn--primary btn--wide', text: 'Simpan' });
  form.append(formTitle, grid, h('div', { class: 'dialog__actions' }, btnBack, btnSave));

  const formOverlay = h('div', { class: 'overlay', 'aria-hidden': 'true', inert: true }, form);
  document.body.append(formOverlay);

  // harga: hanya angka, otomatis diberi titik ribuan (8000 -> 8.000)
  cfg.fields.filter((f) => f.type === 'currency').forEach((f) => {
    const input = form.elements[f.key];
    input.addEventListener('input', () => {
      const digitsBeforeCaret = onlyDigits(input.value.slice(0, input.selectionStart)).length;
      const d = onlyDigits(input.value).replace(/^0+(?=\d)/, '').slice(0, 12);
      input.value = d ? Number(d).toLocaleString('id-ID') : '';
      let seen = 0, pos = 0;
      while (pos < input.value.length && seen < digitsBeforeCaret) {
        if (/\d/.test(input.value[pos])) seen++;
        pos++;
      }
      input.setSelectionRange(pos, pos);
    });
  });

  const fieldBox = (key) => $(`.field[data-key="${key}"]`, form);
  function setError(key, message) {
    const box = fieldBox(key);
    box.classList.toggle('has-error', Boolean(message));
    $('.field__error', box).textContent = message || '';
    form.elements[key].setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function openForm(row = null) {
    editingId = row ? row.id : null;
    formTitle.textContent = `${row ? 'Ubah' : 'Tambah'} Data ${cfg.entity}`;
    form.reset();

    cfg.fields.forEach((f) => {
      setError(f.key, '');
      const input = form.elements[f.key];
      input.placeholder = '';

      if (f.persist === false) {
        if (row && f.optionalOnEdit) input.placeholder = 'Kosongkan jika tidak diubah';
        return;
      }
      if (!row) return;

      const value = row[f.key];
      if (f.type === 'select' && ![...input.options].some((o) => o.value === value)) {
        input.append(h('option', { value, text: value })); // jaga nilai lama yang tidak ada di daftar
      }
      input.value = f.type === 'currency' ? Number(value).toLocaleString('id-ID') : value;
    });

    openOverlay(formOverlay, form); // fokus ke dialog; Tab pertama masuk ke input pertama
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {};
    let firstInvalid = null;

    cfg.fields.forEach((f) => {
      const input = form.elements[f.key];
      let value = input.value.trim();
      if (f.type === 'currency') value = onlyDigits(value);

      const required = !(editingId && f.optionalOnEdit);
      const empty = required && !value;
      setError(f.key, empty ? 'Wajib diisi' : '');
      if (empty && !firstInvalid) firstInvalid = input;

      if (f.persist !== false) data[f.key] = f.type === 'currency' ? Number(value) : value;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      form.classList.remove('is-shaking');
      void form.offsetWidth;
      form.classList.add('is-shaking');
      return;
    }

    if (editingId) {
      rows = rows.map((r) => (r.id === editingId ? { ...r, ...data } : r));
      flashId = editingId;
    } else {
      const row = { id: uid(), ...data };
      rows.push(row);
      flashId = row.id;
    }
    save();
    search.value = '';
    closeOverlay(formOverlay);
    render();
  });
  form.addEventListener('animationend', () => form.classList.remove('is-shaking'));
  btnBack.addEventListener('click', () => closeOverlay(formOverlay));

  /* ---------------------------------------------------------
     8. Alert hapus
     --------------------------------------------------------- */
  const btnNo  = h('button', { type: 'button', class: 'btn btn--ghost', text: 'Tidak' });
  const btnYes = h('button', { type: 'button', class: 'btn btn--primary', text: 'Ya' });
  const alertBox = h('div', {
    class: 'dialog dialog--alert', role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': 'alertText',
  },
    h('div', { class: 'alert__icon' }, icon('i-help')),
    h('p', { class: 'alert__text', id: 'alertText', text: 'Apakah anda yakin ingin menghapus data ini ?' }),
    h('div', { class: 'dialog__actions' }, btnNo, btnYes),
  );
  const alertOverlay = h('div', { class: 'overlay', 'aria-hidden': 'true', inert: true }, alertBox);
  document.body.append(alertOverlay);

  btnNo.addEventListener('click', () => closeOverlay(alertOverlay));
  btnYes.addEventListener('click', () => {
    const id = pendingDeleteId;
    closeOverlay(alertOverlay);
    if (!id) return;

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      rows = rows.filter((r) => r.id !== id);
      save();
      render();
    };

    const tr = $$('tr', tbody).find((el) => el.dataset.id === id);
    if (tr && !reduceMotion) {
      tr.classList.add('is-leaving');
      tr.addEventListener('animationend', finish, { once: true });
      setTimeout(finish, 600); // jaga-jaga kalau animationend tidak terpanggil
    } else {
      finish();
    }
    pendingDeleteId = null;
  });

  // klik area gelap di luar kotak = tutup
  [formOverlay, alertOverlay].forEach((ov) =>
    ov.addEventListener('mousedown', (e) => { if (e.target === ov) closeOverlay(ov); }));

  /* ---------------------------------------------------------
     9. Tombol Tambah Data + aksi Edit / Hapus di tabel
     --------------------------------------------------------- */
  $('#btnAdd').addEventListener('click', () => openForm());

  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = btn.closest('tr').dataset.id;

    if (btn.dataset.action === 'edit') {
      const row = rows.find((r) => r.id === id);
      if (row) openForm(row);
    } else {
      pendingDeleteId = id;
      openOverlay(alertOverlay, btnNo);
    }
  });

  render();
})();
