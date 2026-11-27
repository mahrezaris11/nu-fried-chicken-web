/**
 * Admin Login & CMS Dashboard Logic — Nu Fried Chicken & Burger
 */
(async function () {
  const STORE = window.NU_STORE;
  const BASE = window.NU_DATA;
  if (!STORE || !BASE) return;

  const loginView = document.getElementById('loginView');
  const dashboardView = document.getElementById('dashboardView');
  const loginForm = document.getElementById('loginForm');
  const loginUsername = document.getElementById('loginUsername');
  const loginPassword = document.getElementById('loginPassword');
  const loginError = document.getElementById('loginError');
  const togglePassBtn = document.getElementById('togglePassBtn');
  const loginModeHint = document.getElementById('loginModeHint');
  const storageBadge = document.getElementById('storageBadge');
  const adminToast = document.getElementById('adminToast');

  let state = null; // merged full content used as editable working state
  let menuSearchTerm = '';
  let serverAvailable = await STORE.detectApiAvailable();

  if (loginModeHint) {
    loginModeHint.textContent = serverAvailable ? 'Server API Aktif' : 'Mode Browser Lokal';
  }
  if (storageBadge) {
    storageBadge.textContent = serverAvailable
      ? 'Mode: Server Tersambung (Permanen)'
      : 'Mode: Penyimpanan Browser Lokal';
  }

  function showToast(msg, isError = false) {
    if (!adminToast) return;
    adminToast.textContent = msg;
    adminToast.className = `fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-bold text-white transition-all ${
      isError ? 'bg-red-700' : 'bg-emerald-600'
    }`;
    adminToast.classList.remove('hidden');
    clearTimeout(window.__nuToastTimer);
    window.__nuToastTimer = setTimeout(() => adminToast.classList.add('hidden'), 3500);
  }

  async function sha256Hex(str) {
    const buf = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Toggle password visibility
  if (togglePassBtn && loginPassword) {
    togglePassBtn.addEventListener('click', () => {
      const isPass = loginPassword.type === 'password';
      loginPassword.type = isPass ? 'text' : 'password';
      togglePassBtn.textContent = isPass ? 'Sembunyi' : 'Lihat';
    });
  }

  // Verify existing session on load
  async function checkExistingSession() {
    const token = STORE.getToken();
    if (!token) return false;
    if (!serverAvailable) {
      return token === 'local-session-ok';
    }
    try {
      const res = await fetch('/api/auth/me', { headers: STORE.authHeaders() });
      return res.ok;
    } catch {
      return false;
    }
  }

  async function enterDashboard() {
    const loaded = await STORE.loadContent();
    state = STORE.deepClone(loaded.content);
    loginView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    renderAllPanels();
  }

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginError.classList.add('hidden');
      const username = loginUsername.value.trim();
      const password = loginPassword.value;

      try {
        serverAvailable = await STORE.detectApiAvailable();
        if (serverAvailable) {
          const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || 'Login gagal.');
          STORE.setToken(data.token);
        } else {
          const hex = await sha256Hex(password);
          if (username !== STORE.LOCAL_DEFAULT_USER || hex !== STORE.LOCAL_DEFAULT_PASS_SHA256) {
            throw new Error('Username atau password salah.');
          }
          STORE.setToken('local-session-ok');
        }
        await enterDashboard();
      } catch (err) {
        loginError.textContent = err.message;
        loginError.classList.remove('hidden');
      }
    });
  }

  // Handle Logout
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    STORE.setToken('');
    dashboardView.classList.add('hidden');
    loginView.classList.remove('hidden');
    loginPassword.value = '';
  });

  // Tab Switching
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const panels = document.querySelectorAll('.admin-panel');

  function activateTab(tabName) {
    tabBtns.forEach((b) => {
      const active = b.dataset.adminTab === tabName;
      b.classList.toggle('active', active);
      b.classList.toggle('bg-nu-red', active);
      b.classList.toggle('text-white', active);
      b.classList.toggle('border-nu-red', active);
      b.classList.toggle('bg-white', !active);
      b.classList.toggle('text-zinc-700', !active);
      b.classList.toggle('border-zinc-200', !active);
    });
    panels.forEach((p) => {
      p.classList.toggle('hidden', p.id !== `tab-${tabName}`);
    });
  }

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => activateTab(btn.dataset.adminTab));
  });
  activateTab('promo');

  // ==================== RENDER PANELS ====================
  function renderPromoPanel() {
    const p = state.promo;
    const map = {
      promoActiveInput: ['checked', Boolean(p.active)],
      promoBadgeInput: ['value', p.badge || ''],
      promoHighlightInput: ['value', p.highlightLabel || ''],
      promoTitleInput: ['value', p.title || ''],
      promoSubtitleInput: ['value', p.subtitle || ''],
      promoValidInput: ['value', p.validUntil || ''],
      promoCtaInput: ['value', p.ctaText || ''],
      promoWaInput: ['value', p.waMessage || ''],
      promoImageInput: ['value', p.image || ''],
    };

    Object.entries(map).forEach(([id, [prop, val]]) => {
      const el = document.getElementById(id);
      if (el) el[prop] = val;
    });

    const syncPreview = () => {
      p.active = document.getElementById('promoActiveInput').checked;
      p.badge = document.getElementById('promoBadgeInput').value;
      p.highlightLabel = document.getElementById('promoHighlightInput').value;
      p.title = document.getElementById('promoTitleInput').value;
      p.subtitle = document.getElementById('promoSubtitleInput').value;
      p.validUntil = document.getElementById('promoValidInput').value;
      p.ctaText = document.getElementById('promoCtaInput').value;
      p.waMessage = document.getElementById('promoWaInput').value;
      p.image = document.getElementById('promoImageInput').value.trim();

      document.getElementById('prevPromoBadge').textContent = p.badge || 'Promo';
      document.getElementById('prevPromoHighlight').textContent = p.highlightLabel || '';
      document.getElementById('prevPromoTitle').textContent = p.title || '';
      document.getElementById('prevPromoSubtitle').textContent = p.subtitle || '';
      document.getElementById('prevPromoValid').textContent = p.validUntil || '';
      document.getElementById('prevPromoCta').textContent = p.ctaText || 'Konsultasi';

      const prevImgWrap = document.getElementById('prevPromoImgWrap');
      const prevImg = document.getElementById('prevPromoImg');
      if (prevImgWrap && prevImg) {
        if (p.image) {
          prevImg.src = p.image;
          prevImgWrap.classList.remove('hidden');
        } else {
          prevImgWrap.classList.add('hidden');
        }
      }

      document.getElementById('promoPreviewBox').style.opacity = p.active ? '1' : '0.45';
    };

    Object.keys(map).forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.oninput = syncPreview;
    });

    const uploadPromoEl = document.getElementById('uploadPromoImg');
    if (uploadPromoEl) {
      uploadPromoEl.onchange = async () => {
        const file = uploadPromoEl.files?.[0];
        if (!file) return;
        try {
          const { url } = await STORE.uploadImage(file);
          p.image = url;
          document.getElementById('promoImageInput').value = url;
          syncPreview();
          showToast('Gambar promo berhasil diunggah. Klik "Simpan Semua Perubahan" untuk menerbitkan.');
        } catch (err) {
          showToast(err.message, true);
        }
      };
    }

    syncPreview();
  }

  function renderPackagesPanel() {
    const grid = document.getElementById('adminPackagesGrid');
    if (!grid) return;

    grid.innerHTML = state.packages
      .map(
        (pkg, idx) => `
      <div class="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <span class="text-[11px] font-bold uppercase tracking-wider text-nu-red">${pkg.unitName}</span>
            <h3 class="text-lg font-extrabold text-nu-ink">${pkg.name}</h3>
          </div>
          <label class="inline-flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
            <input type="checkbox" data-pkg-field="popular" data-idx="${idx}" ${pkg.popular ? 'checked' : ''} class="w-4 h-4 accent-red-600" />
            <span>Highlight Populer</span>
          </label>
        </div>

        <div class="flex items-center gap-4 p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
          <img id="pkgPreviewImg-${idx}" src="${pkg.image}" alt="${pkg.name}" class="w-24 h-24 object-contain bg-white rounded-xl border border-zinc-200 p-1 shrink-0" />
          <div class="flex-1 space-y-2">
            <label class="block text-[11px] font-bold text-zinc-600">Path / URL Gambar Booth</label>
            <input type="text" data-pkg-field="image" data-idx="${idx}" value="${pkg.image}" class="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white" />
            <label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-nu-ink hover:bg-nu-red text-white text-[11px] font-bold cursor-pointer transition">
              <span>Upload Gambar Baru</span>
              <input type="file" accept="image/png,image/jpeg,image/webp" data-upload-pkg="${idx}" class="hidden" />
            </label>
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-zinc-700 mb-1">Harga Investasi (Rp)</label>
            <input type="number" step="500000" min="1000000" data-pkg-field="price" data-idx="${idx}" value="${pkg.price}" class="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-sm font-bold text-nu-red" />
          </div>
          <div>
            <label class="block text-xs font-bold text-zinc-700 mb-1">Badge Paket</label>
            <input type="text" data-pkg-field="badge" data-idx="${idx}" value="${pkg.badge}" class="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-sm font-medium" />
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-zinc-700 mb-1">Material</label>
            <input type="text" data-pkg-field="material" data-idx="${idx}" value="${pkg.material}" class="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-medium" />
          </div>
          <div>
            <label class="block text-xs font-bold text-zinc-700 mb-1">Dimensi</label>
            <input type="text" data-pkg-field="dimensions" data-idx="${idx}" value="${pkg.dimensions}" class="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-medium" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-zinc-700 mb-1">Tagline Singkat</label>
          <input type="text" data-pkg-field="tagline" data-idx="${idx}" value="${pkg.tagline}" class="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs" />
        </div>

        <div class="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-nu-ink">Estimasi BEP (Otomatis terhitung dari harga):</span>
            <button type="button" data-recalc-bep="${idx}" class="text-[11px] font-bold text-nu-red hover:underline">Hitung Ulang BEP</button>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <span class="block text-[10px] text-zinc-500">10 ekor/hr</span>
              <input type="text" data-pkg-bep="10" data-idx="${idx}" value="${pkg.bep[10]}" class="w-full px-2 py-1 rounded border border-zinc-200 bg-white text-xs font-semibold" />
            </div>
            <div>
              <span class="block text-[10px] text-zinc-500">20 ekor/hr</span>
              <input type="text" data-pkg-bep="20" data-idx="${idx}" value="${pkg.bep[20]}" class="w-full px-2 py-1 rounded border border-zinc-200 bg-white text-xs font-semibold" />
            </div>
            <div>
              <span class="block text-[10px] text-zinc-500">50 ekor/hr</span>
              <input type="text" data-pkg-bep="50" data-idx="${idx}" value="${pkg.bep[50]}" class="w-full px-2 py-1 rounded border border-zinc-200 bg-white text-xs font-semibold" />
            </div>
          </div>
        </div>

        <div class="space-y-2 pt-2 border-t border-zinc-100">
          <span class="block text-xs font-bold text-nu-ink">Rincian Fasilitas Paket (1 baris = 1 poin):</span>
          ${pkg.facilities
            .map(
              (f, fIdx) => `
            <div>
              <span class="block text-[11px] font-semibold text-zinc-600 mb-0.5">${f.group}</span>
              <textarea rows="2" data-pkg-fac="${idx}:${fIdx}" class="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs">${f.items.join('\n')}</textarea>
            </div>`
            )
            .join('')}
        </div>
      </div>`
      )
      .join('');

    // Listeners
    grid.querySelectorAll('[data-pkg-field]').forEach((el) => {
      el.addEventListener('input', () => {
        const i = Number(el.dataset.idx);
        const f = el.dataset.pkgField;
        if (f === 'popular') {
          state.packages[i].popular = el.checked;
        } else if (f === 'price') {
          const val = Math.max(0, Number(el.value) || 0);
          state.packages[i].price = val;
          const disp = STORE.formatPackagePriceDisplay(val);
          state.packages[i].priceLabel = disp.priceLabel;
          state.packages[i].priceUnit = disp.priceUnit;
          state.packages[i].bep = STORE.computeBepMap(val, state.gpPerDailyBirdMonthly);
          [10, 20, 50].forEach((b) => {
            const bepEl = grid.querySelector(`[data-pkg-bep="${b}"][data-idx="${i}"]`);
            if (bepEl) bepEl.value = state.packages[i].bep[b];
          });
        } else {
          state.packages[i][f] = el.value;
          if (f === 'image') {
            const img = document.getElementById(`pkgPreviewImg-${i}`);
            if (img) img.src = el.value;
          }
        }
      });
    });

    grid.querySelectorAll('[data-pkg-bep]').forEach((el) => {
      el.addEventListener('input', () => {
        const i = Number(el.dataset.idx);
        const k = el.dataset.pkgBep;
        state.packages[i].bep[k] = el.value;
      });
    });

    grid.querySelectorAll('[data-pkg-fac]').forEach((el) => {
      el.addEventListener('input', () => {
        const [i, fi] = el.dataset.pkgFac.split(':').map(Number);
        state.packages[i].facilities[fi].items = el.value
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);
      });
    });

    grid.querySelectorAll('[data-recalc-bep]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.recalcBep);
        state.packages[i].bep = STORE.computeBepMap(state.packages[i].price, state.gpPerDailyBirdMonthly);
        renderPackagesPanel();
      });
    });

    grid.querySelectorAll('[data-upload-pkg]').forEach((input) => {
      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (!file) return;
        const i = Number(input.dataset.uploadPkg);
        try {
          const { url } = await STORE.uploadImage(file);
          state.packages[i].image = url;
          renderPackagesPanel();
          showToast('Gambar paket berhasil diunggah. Klik "Simpan Semua Perubahan" untuk menerbitkan.');
        } catch (err) {
          showToast(err.message, true);
        }
      });
    });
  }

  function renderMenuPanel() {
    const grid = document.getElementById('adminMenuGrid');
    if (!grid) return;

    const categoryOpts = state.menuCategories
      .filter((c) => c.id !== 'all')
      .map((c) => `<option value="${c.id}">${c.label}</option>`)
      .join('');

    const filtered = state.menuItems
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => !menuSearchTerm || item.name.toLowerCase().includes(menuSearchTerm));

    grid.innerHTML = filtered
      .map(
        ({ item, idx }) => `
      <div class="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4">
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-bold text-zinc-500 uppercase tracking-wider">Item Menu #${idx + 1}</span>
          <button type="button" data-del-menu="${idx}" class="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-nu-red text-nu-red hover:text-white text-[11px] font-bold transition">
            Hapus Menu
          </button>
        </div>
        <div class="flex items-center gap-4 p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
          <img id="menuPrevImg-${idx}" src="${item.image}" alt="${item.name}" class="w-20 h-20 object-contain bg-white rounded-xl border border-zinc-200 p-1 shrink-0" />
          <div class="flex-1 space-y-2">
            <input type="text" data-menu-field="image" data-idx="${idx}" value="${item.image}" class="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white" />
            <label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-nu-ink hover:bg-nu-red text-white text-[11px] font-bold cursor-pointer transition">
              <span>Upload Foto Menu</span>
              <input type="file" accept="image/png,image/jpeg,image/webp" data-upload-menu="${idx}" class="hidden" />
            </label>
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-zinc-700 mb-1">Nama Menu</label>
            <input type="text" data-menu-field="name" data-idx="${idx}" value="${item.name}" class="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm font-bold" />
          </div>
          <div>
            <label class="block text-xs font-bold text-zinc-700 mb-1">Mulai Harga (Tampil di Badge)</label>
            <input type="text" data-menu-field="priceStart" data-idx="${idx}" value="${item.priceStart}" class="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm font-bold text-nu-red" />
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-zinc-700 mb-1">Kategori</label>
            <select data-menu-field="category" data-idx="${idx}" class="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-semibold bg-white">
              ${categoryOpts}
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-zinc-700 mb-1">Badge Label</label>
            <input type="text" data-menu-field="badge" data-idx="${idx}" value="${item.badge}" class="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-semibold" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-zinc-700 mb-1">Deskripsi</label>
          <textarea rows="2" data-menu-field="description" data-idx="${idx}" class="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs">${item.description}</textarea>
        </div>

        <div class="space-y-2 pt-2 border-t border-zinc-100">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-nu-ink">Daftar Harga Varian:</span>
            <button type="button" data-add-variant="${idx}" class="text-[11px] font-bold text-nu-red hover:underline">+ Tambah Varian</button>
          </div>
          <div class="space-y-2">
            ${item.variants
              .map(
                (v, vIdx) => `
              <div class="flex items-center gap-2">
                <input type="text" data-var-label="${idx}:${vIdx}" value="${v.label}" placeholder="Nama varian" class="flex-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs" />
                <input type="text" data-var-price="${idx}:${vIdx}" value="${v.price}" placeholder="Harga" class="w-36 px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold text-nu-ink" />
                <button type="button" data-del-variant="${idx}:${vIdx}" title="Hapus varian" class="px-2 py-1.5 rounded-lg bg-red-50 text-nu-red text-xs font-bold hover:bg-nu-red hover:text-white">×</button>
              </div>`
              )
              .join('')}
          </div>
        </div>
      </div>`
      )
      .join('');

    // Set selected category
    filtered.forEach(({ item, idx }) => {
      const sel = grid.querySelector(`select[data-menu-field="category"][data-idx="${idx}"]`);
      if (sel) sel.value = item.category;
    });

    grid.querySelectorAll('[data-menu-field]').forEach((el) => {
      const handler = () => {
        const i = Number(el.dataset.idx);
        const f = el.dataset.menuField;
        state.menuItems[i][f] = el.value;
        if (f === 'image') {
          const img = document.getElementById(`menuPrevImg-${i}`);
          if (img) img.src = el.value;
        }
      };
      el.addEventListener('input', handler);
      el.addEventListener('change', handler);
    });

    grid.querySelectorAll('[data-var-label]').forEach((el) => {
      el.addEventListener('input', () => {
        const [i, vi] = el.dataset.varLabel.split(':').map(Number);
        state.menuItems[i].variants[vi].label = el.value;
      });
    });

    grid.querySelectorAll('[data-var-price]').forEach((el) => {
      el.addEventListener('input', () => {
        const [i, vi] = el.dataset.varPrice.split(':').map(Number);
        state.menuItems[i].variants[vi].price = el.value;
      });
    });

    grid.querySelectorAll('[data-add-variant]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.addVariant);
        state.menuItems[i].variants.push({ label: 'Varian Baru', price: 'Rp 10.000' });
        renderMenuPanel();
      });
    });

    grid.querySelectorAll('[data-del-variant]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const [i, vi] = btn.dataset.delVariant.split(':').map(Number);
        state.menuItems[i].variants.splice(vi, 1);
        renderMenuPanel();
      });
    });

    grid.querySelectorAll('[data-del-menu]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.delMenu);
        if (confirm(`Hapus menu "${state.menuItems[i].name}"?`)) {
          state.menuItems.splice(i, 1);
          renderMenuPanel();
          showToast('Menu dihapus. Klik "Simpan Semua Perubahan" untuk menerapkan.');
        }
      });
    });

    grid.querySelectorAll('[data-upload-menu]').forEach((input) => {
      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (!file) return;
        const i = Number(input.dataset.uploadMenu);
        try {
          const { url } = await STORE.uploadImage(file);
          state.menuItems[i].image = url;
          renderMenuPanel();
          showToast('Foto menu berhasil diunggah. Klik "Simpan Semua Perubahan" untuk menerbitkan.');
        } catch (err) {
          showToast(err.message, true);
        }
      });
    });
  }

  document.getElementById('adminMenuSearch')?.addEventListener('input', (e) => {
    menuSearchTerm = e.target.value.trim().toLowerCase();
    renderMenuPanel();
  });

  document.getElementById('addNewMenuBtn')?.addEventListener('click', () => {
    state.menuItems.unshift({
      id: `menu-custom-${Date.now()}`,
      category: 'fried-chicken',
      name: 'Menu Baru Nu Chicken',
      badge: 'Baru',
      badgeColor: 'red',
      priceStart: 'Rp 12.000',
      image: './assets/images/menu-fried-chicken.jpg',
      description: 'Deskripsi singkat menu baru.',
      variants: [{ label: 'Porsi Reguler', price: 'Rp 12.000' }],
    });
    menuSearchTerm = '';
    const searchEl = document.getElementById('adminMenuSearch');
    if (searchEl) searchEl.value = '';
    renderMenuPanel();
    showToast('Menu baru ditambahkan di paling atas. Edit detail lalu simpan.');
  });

  function renderMediaPanel() {
    const grid = document.getElementById('adminMediaGrid');
    if (!grid) return;

    const slots = [
      { key: 'heroImage', label: 'Gambar Utama Hero (Ayam & Burger)', src: state.media.heroImage },
      { key: 'outlet0', label: 'Foto Outlet #1 (Grand Opening)', src: state.media.outletImages[0] },
      { key: 'outlet1', label: 'Foto Outlet #2 (Suasana Outlet)', src: state.media.outletImages[1] },
      { key: 'outlet2', label: 'Foto Outlet #3 (Antrean Pelanggan)', src: state.media.outletImages[2] },
      { key: 'mapImage', label: 'Peta Sebaran Area Mitra', src: state.media.mapImage },
    ];

    grid.innerHTML = slots
      .map(
        (s) => `
      <div class="bg-white rounded-3xl border border-zinc-200 p-5 shadow-sm space-y-3">
        <p class="text-sm font-bold text-nu-ink">${s.label}</p>
        <div class="h-44 rounded-2xl bg-zinc-50 border border-zinc-100 overflow-hidden flex items-center justify-center p-2">
          <img id="mediaImg-${s.key}" src="${s.src}" alt="${s.label}" class="max-h-full max-w-full object-contain rounded-xl" />
        </div>
        <input type="text" data-media-key="${s.key}" value="${s.src}" class="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs" />
        <label class="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-nu-ink hover:bg-nu-red text-white text-xs font-bold cursor-pointer transition">
          <span>Upload Gambar Pengganti</span>
          <input type="file" accept="image/png,image/jpeg,image/webp" data-upload-media="${s.key}" class="hidden" />
        </label>
      </div>`
      )
      .join('');

    const assignMedia = (key, val) => {
      if (key === 'heroImage') state.media.heroImage = val;
      else if (key === 'mapImage') state.media.mapImage = val;
      else if (key.startsWith('outlet')) {
        const idx = Number(key.replace('outlet', ''));
        state.media.outletImages[idx] = val;
      }
    };

    grid.querySelectorAll('[data-media-key]').forEach((el) => {
      el.addEventListener('input', () => {
        assignMedia(el.dataset.mediaKey, el.value);
        const img = document.getElementById(`mediaImg-${el.dataset.mediaKey}`);
        if (img) img.src = el.value;
      });
    });

    grid.querySelectorAll('[data-upload-media]').forEach((input) => {
      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (!file) return;
        const key = input.dataset.uploadMedia;
        try {
          const { url } = await STORE.uploadImage(file);
          assignMedia(key, url);
          renderMediaPanel();
          showToast('Gambar berhasil diunggah. Klik "Simpan Semua Perubahan" untuk menerbitkan.');
        } catch (err) {
          showToast(err.message, true);
        }
      });
    });
  }

  async function renderLeadsPanel() {
    const listEl = document.getElementById('adminLeadsList');
    if (!listEl) return;
    const leads = await STORE.fetchLeads();

    if (!leads.length) {
      listEl.innerHTML = `
        <div class="bg-white rounded-3xl border border-zinc-200 p-8 text-center text-sm text-zinc-500">
          Belum ada calon mitra yang mendaftar melalui formulir website.
        </div>`;
      return;
    }

    listEl.innerHTML = leads
      .map((l) => {
        const dateStr = l.createdAt ? new Date(l.createdAt).toLocaleString('id-ID') : '';
        const isDone = l.status === 'Sudah Dihubungi';
        const cleanPhone = String(l.phone || '').replace(/^0/, '62').replace(/\D/g, '');
        return `
        <div class="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-extrabold text-nu-ink text-base">${l.name}</span>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isDone ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }">${l.status || 'Baru'}</span>
              <span class="text-[11px] text-zinc-400">${dateStr}</span>
            </div>
            <p class="text-xs text-zinc-600">
              <strong>WA:</strong> ${l.phone} • <strong>Lokasi:</strong> ${l.city} • <strong>Paket:</strong> ${l.packageName}
            </p>
            ${l.notes ? `<p class="text-xs text-zinc-500 italic">"${l.notes}"</p>` : ''}
          </div>
          <div class="flex flex-wrap items-center gap-2 shrink-0">
            <a href="https://wa.me/${cleanPhone}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition">
              Chat WA
            </a>
            <button type="button" data-toggle-lead="${l.id}" data-next-status="${isDone ? 'Baru' : 'Sudah Dihubungi'}" class="px-3 py-1.5 rounded-xl border border-zinc-200 hover:border-nu-red text-xs font-bold text-zinc-700 transition">
              ${isDone ? 'Tandai Baru' : 'Tandai Dihubungi'}
            </button>
            <button type="button" data-del-lead="${l.id}" class="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-nu-red text-nu-red hover:text-white text-xs font-bold transition">
              Hapus
            </button>
          </div>
        </div>`;
      })
      .join('');

    listEl.querySelectorAll('[data-toggle-lead]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await STORE.updateLeadStatus(btn.dataset.toggleLead, btn.dataset.nextStatus);
        await renderLeadsPanel();
      });
    });

    listEl.querySelectorAll('[data-del-lead]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (confirm('Hapus data calon mitra ini?')) {
          await STORE.deleteLead(btn.dataset.delLead);
          await renderLeadsPanel();
        }
      });
    });
  }

  document.getElementById('refreshLeadsBtn')?.addEventListener('click', renderLeadsPanel);

  function renderKontenPanel() {
    const waNumEl = document.getElementById('brandWaNumInput');
    const waDispEl = document.getElementById('brandWaDispInput');
    if (waNumEl) {
      waNumEl.value = state.brand.whatsappNumber || '';
      waNumEl.oninput = () => (state.brand.whatsappNumber = waNumEl.value.trim());
    }
    if (waDispEl) {
      waDispEl.value = state.brand.whatsappDisplay || '';
      waDispEl.oninput = () => (state.brand.whatsappDisplay = waDispEl.value.trim());
    }

    const onbEl = document.getElementById('adminOnboardingList');
    if (onbEl) {
      onbEl.innerHTML = state.onboardingSteps
        .map(
          (s, idx) => `
        <div class="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
          <span class="text-xs font-extrabold text-nu-red">Langkah ${s.step}</span>
          <input type="text" data-onb-title="${idx}" value="${s.title}" class="w-full px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-bold" />
          <textarea rows="2" data-onb-desc="${idx}" class="w-full px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs">${s.desc}</textarea>
        </div>`
        )
        .join('');

      onbEl.querySelectorAll('[data-onb-title]').forEach((el) => {
        el.oninput = () => (state.onboardingSteps[Number(el.dataset.onbTitle)].title = el.value);
      });
      onbEl.querySelectorAll('[data-onb-desc]').forEach((el) => {
        el.oninput = () => (state.onboardingSteps[Number(el.dataset.onbDesc)].desc = el.value);
      });
    }

    const faqEl = document.getElementById('adminFaqList');
    if (faqEl) {
      faqEl.innerHTML = state.faqs
        .map(
          (f, idx) => `
        <div class="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-zinc-500">FAQ #${idx + 1}</span>
            <button type="button" data-del-faq="${idx}" class="text-xs font-bold text-nu-red hover:underline">Hapus</button>
          </div>
          <input type="text" data-faq-q="${idx}" value="${f.q}" class="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-xs font-bold" />
          <textarea rows="2" data-faq-a="${idx}" class="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-xs">${f.a}</textarea>
        </div>`
        )
        .join('');

      faqEl.querySelectorAll('[data-faq-q]').forEach((el) => {
        el.oninput = () => (state.faqs[Number(el.dataset.faqQ)].q = el.value);
      });
      faqEl.querySelectorAll('[data-faq-a]').forEach((el) => {
        el.oninput = () => (state.faqs[Number(el.dataset.faqA)].a = el.value);
      });
      faqEl.querySelectorAll('[data-del-faq]').forEach((btn) => {
        btn.onclick = () => {
          state.faqs.splice(Number(btn.dataset.delFaq), 1);
          renderKontenPanel();
        };
      });
    }
  }

  document.getElementById('addFaqBtn')?.addEventListener('click', () => {
    state.faqs.push({ q: 'Pertanyaan baru...', a: 'Jawaban kemitraan...' });
    renderKontenPanel();
  });

  function renderAllPanels() {
    renderPromoPanel();
    renderPackagesPanel();
    renderMenuPanel();
    renderMediaPanel();
    renderLeadsPanel();
    renderKontenPanel();
  }

  // ==================== SAVE ALL & RESET & PASSWORD ====================
  document.getElementById('saveAllBtn')?.addEventListener('click', async () => {
    try {
      const overrides = {
        brand: state.brand,
        media: state.media,
        promo: state.promo,
        packages: state.packages,
        menuItems: state.menuItems,
        onboardingSteps: state.onboardingSteps,
        faqs: state.faqs,
      };
      const result = await STORE.saveOverrides(overrides);
      showToast(
        result.mode === 'server'
          ? 'Berhasil disimpan ke server! Perubahan langsung tayang di website.'
          : 'Disimpan di browser lokal! Jalankan server Node untuk menyimpan permanen.'
      );
    } catch (err) {
      showToast(err.message, true);
    }
  });

  document.getElementById('resetAllBtn')?.addEventListener('click', async () => {
    if (!confirm('Yakin ingin mengembalikan semua harga, menu, gambar, dan promo ke data Proposal 2026?')) {
      return;
    }
    try {
      await STORE.resetOverrides();
      const loaded = await STORE.loadContent();
      state = STORE.deepClone(loaded.content);
      renderAllPanels();
      showToast('Semua data berhasil direset ke Proposal Kemitraan 2026.');
    } catch (err) {
      showToast(err.message, true);
    }
  });

  document.getElementById('changePasswordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!serverAvailable) {
      showToast('Ganti password membutuhkan server Node.js (node server.js).', true);
      return;
    }
    const currentPassword = document.getElementById('curPassInput').value;
    const newPassword = document.getElementById('newPassInput').value;
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: STORE.authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Gagal mengganti password.');
      document.getElementById('curPassInput').value = '';
      document.getElementById('newPassInput').value = '';
      showToast('Password admin berhasil diperbarui!');
    } catch (err) {
      showToast(err.message, true);
    }
  });

  // Auto-restore dashboard if session token is already valid
  if (await checkExistingSession()) {
    await enterDashboard();
  }
})();
