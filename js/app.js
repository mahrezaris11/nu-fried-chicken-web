/**
 * Interaktivitas Landing Page Kemitraan Nu Fried Chicken & Burger
 * Memuat data dinamis dari NU_STORE (termasuk perubahan dari Admin Panel).
 */
(async function () {
  if (!window.NU_DATA || !window.NU_STORE) return;

  const { content: DATA } = await window.NU_STORE.loadContent();

  function formatIDR(amount) {
    return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
  }

  function buildWaUrl(message) {
    return `https://wa.me/${DATA.brand.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  // ==================== 1. MOBILE DRAWER & DYNAMIC WA LINKS ====================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuIconOpen = document.getElementById('menuIconOpen');
  const menuIconClose = document.getElementById('menuIconClose');

  function closeMobileDrawer() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    mobileMenuBtn?.setAttribute('aria-expanded', 'false');
    menuIconOpen?.classList.remove('hidden');
    menuIconClose?.classList.add('hidden');
  }

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
      menuIconOpen?.classList.toggle('hidden', isOpen);
      menuIconClose?.classList.toggle('hidden', !isOpen);
    });

    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', closeMobileDrawer);
    });
  }

  // Sync dynamic brand WhatsApp links
  const defaultWaMsg = `Halo Tim Kemitraan ${DATA.brand.name}, saya tertarik untuk mendaftar dan konsultasi paket kemitraan.`;
  const mobileStickyWa = document.getElementById('mobileStickyWa');
  const footerWaCtaBtn = document.getElementById('footerWaCtaBtn');
  if (mobileStickyWa) mobileStickyWa.href = buildWaUrl(defaultWaMsg);
  if (footerWaCtaBtn) footerWaCtaBtn.href = buildWaUrl(defaultWaMsg);

  document.querySelectorAll('a[href^="https://wa.me/"]').forEach((a) => {
    if (!['promoCtaBtn', 'calcWaBtn', 'leadWaContinueBtn'].includes(a.id)) {
      a.href = a.href.replace(/https:\/\/wa\.me\/\d+/, `https://wa.me/${DATA.brand.whatsappNumber}`);
    }
  });

  // ==================== 2. LIGHTBOX ZOOM MODAL ====================
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');

  function openLightbox(src, caption) {
    if (!lightboxModal || !lightboxImg || !src) return;
    lightboxImg.src = src;
    lightboxImg.alt = caption || 'Preview Gambar';
    if (lightboxCaption) lightboxCaption.textContent = caption || '';
    lightboxModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  lightboxCloseBtn?.addEventListener('click', closeLightbox);
  lightboxModal?.addEventListener('click', (e) => {
    if (e.target === lightboxModal) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal?.classList.contains('open')) {
      closeLightbox();
    }
  });

  // ==================== 3. DYNAMIC MEDIA & HERO CAPITAL ====================
  const heroMainImg = document.getElementById('heroMainImg');
  if (heroMainImg && DATA.media?.heroImage) heroMainImg.src = DATA.media.heroImage;

  const aboutImgEls = [
    document.getElementById('aboutImg0'),
    document.getElementById('aboutImg1'),
    document.getElementById('aboutImg2'),
  ];
  if (Array.isArray(DATA.media?.outletImages)) {
    aboutImgEls.forEach((el, idx) => {
      if (el && DATA.media.outletImages[idx]) el.src = DATA.media.outletImages[idx];
    });
  }

  const areaMitraMapImg = document.getElementById('areaMitraMapImg');
  if (areaMitraMapImg && DATA.media?.mapImage) areaMitraMapImg.src = DATA.media.mapImage;

  document.querySelector('[data-lightbox-trigger="map"]')?.addEventListener('click', () => {
    openLightbox(areaMitraMapImg?.src, 'Peta Sebaran Area Mitra Nu Fried Chicken & Burger');
  });

  const minPackage = [...DATA.packages].sort((a, b) => a.price - b.price)[0];
  if (minPackage) {
    const minText = `Rp ${minPackage.priceLabel} ${minPackage.priceUnit.charAt(0) + minPackage.priceUnit.slice(1).toLowerCase()}`;
    const heroMinEl = document.getElementById('heroMinCapital');
    const statMinEl = document.getElementById('statMinCapital');
    if (heroMinEl) heroMinEl.textContent = minText;
    if (statMinEl) statMinEl.textContent = minText;
  }

  // ==================== 4. PROMO KEMITRAAN ====================
  const promoSection = document.getElementById('promoSection');
  if (promoSection && DATA.promo) {
    if (!DATA.promo.active) {
      promoSection.classList.add('hidden');
    } else {
      promoSection.classList.remove('hidden');
      const setTxt = (id, val) => {
        const el = document.getElementById(id);
        if (el && val !== undefined) el.textContent = val;
      };
      setTxt('promoBadge', DATA.promo.badge);
      setTxt('promoHighlight', DATA.promo.highlightLabel);
      setTxt('promoTitle', DATA.promo.title);
      setTxt('promoSubtitle', DATA.promo.subtitle);
      setTxt('promoValidUntil', DATA.promo.validUntil ? `• ${DATA.promo.validUntil}` : '');
      setTxt('promoCtaText', DATA.promo.ctaText);

      const promoImg = document.getElementById('promoImg');
      const promoImgWrap = document.getElementById('promoImgWrap');
      if (promoImg && promoImgWrap) {
        if (DATA.promo.image) {
          promoImg.src = DATA.promo.image;
          promoImgWrap.classList.remove('hidden');
          document.querySelector('[data-lightbox-trigger="promo"]')?.addEventListener('click', () => {
            openLightbox(promoImg.src, DATA.promo.title || 'Promo Kemitraan');
          });
        } else {
          promoImgWrap.classList.add('hidden');
        }
      }

      const promoCtaBtn = document.getElementById('promoCtaBtn');
      if (promoCtaBtn) {
        promoCtaBtn.href = buildWaUrl(DATA.promo.waMessage || DATA.promo.title);
      }
    }
  }

  // ==================== 5. PARTNER AREAS ====================
  const partnerAreasGrid = document.getElementById('partnerAreasGrid');
  if (partnerAreasGrid) {
    partnerAreasGrid.innerHTML = DATA.partnerAreas
      .map(
        (area) => `
        <div class="p-3.5 rounded-2xl bg-white border border-zinc-200/80">
          <p class="font-bold text-nu-red text-xs uppercase tracking-wider mb-1.5">${area.region}</p>
          <ul class="space-y-1 text-xs text-zinc-700">
            ${area.outlets
              .map(
                (outlet) => `
              <li class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-nu-orange shrink-0"></span>
                <span>${outlet}</span>
              </li>`
              )
              .join('')}
          </ul>
        </div>`
      )
      .join('');
  }

  // ==================== 6. MENU SEARCH, FILTER TABS & CATALOG ====================
  const menuTabsEl = document.getElementById('menuTabs');
  const menuGridEl = document.getElementById('menuGrid');
  const menuSearchInput = document.getElementById('menuSearchInput');
  let activeCategory = 'all';
  let menuQuery = '';

  const BADGE_CLASSES = {
    red: 'bg-nu-redSoft text-nu-red border-red-200',
    orange: 'bg-orange-50 text-nu-orange border-orange-200',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  function renderMenuTabs() {
    if (!menuTabsEl) return;
    menuTabsEl.innerHTML = DATA.menuCategories
      .map((cat) => {
        const isActive = cat.id === activeCategory;
        return `
          <button
            type="button"
            role="tab"
            aria-selected="${isActive}"
            data-category="${cat.id}"
            class="menu-tab-btn px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-200 whitespace-nowrap ${
              isActive
                ? 'active'
                : 'bg-white text-zinc-700 border-zinc-200 hover:border-nu-red hover:text-nu-red'
            }"
          >
            ${cat.label}
          </button>`;
      })
      .join('');

    menuTabsEl.querySelectorAll('.menu-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.category;
        renderMenuTabs();
        renderMenuCards();
      });
    });
  }

  function renderMenuCards() {
    if (!menuGridEl) return;
    const filtered = DATA.menuItems.filter((item) => {
      const catMatch = activeCategory === 'all' || item.category === activeCategory;
      if (!catMatch) return false;
      if (!menuQuery) return true;
      const haystack = `${item.name} ${item.description} ${item.badge} ${(item.variants || [])
        .map((v) => v.label)
        .join(' ')}`.toLowerCase();
      return haystack.includes(menuQuery);
    });

    if (filtered.length === 0) {
      menuGridEl.innerHTML = `
        <div class="col-span-full text-center py-12 px-6 bg-white rounded-3xl border border-zinc-200">
          <p class="text-base font-bold text-nu-ink mb-1">Menu tidak ditemukan</p>
          <p class="text-xs sm:text-sm text-zinc-500">Coba kata kunci lain atau pilih tab "Semua Menu".</p>
        </div>`;
      return;
    }

    menuGridEl.innerHTML = filtered
      .map(
        (item, idx) => `
        <article class="nu-card animate-fade-up bg-white rounded-3xl border border-zinc-200/80 overflow-hidden flex flex-col justify-between" style="animation-delay:${Math.min(idx * 35, 210)}ms">
          <div>
            <button
              type="button"
              data-zoom-menu="${idx}"
              aria-label="Perbesar foto ${item.name}"
              class="menu-img-stage relative w-full h-52 p-4 flex items-center justify-center border-b border-zinc-100 cursor-zoom-in group"
            >
              <img
                src="${item.image}"
                alt="${item.name}"
                loading="lazy"
                class="max-h-full max-w-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
              />
              <span class="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                BADGE_CLASSES[item.badgeColor] || BADGE_CLASSES.red
              }">
                ${item.badge}
              </span>
            </button>

            <div class="p-6">
              <div class="flex items-start justify-between gap-2 mb-2">
                <h3 class="text-lg font-bold text-nu-ink leading-snug">${item.name}</h3>
                <span class="shrink-0 text-xs font-bold text-nu-red bg-nu-redSoft px-2.5 py-1 rounded-lg">
                  Mulai ${item.priceStart}
                </span>
              </div>
              <p class="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-4">
                ${item.description}
              </p>

              <div class="space-y-2 border-t border-zinc-100 pt-3.5">
                ${item.variants
                  .map(
                    (v) => `
                  <div class="flex items-baseline justify-between gap-2 text-xs">
                    <span class="font-medium text-zinc-700">${v.label}</span>
                    <span class="font-bold text-nu-ink text-right shrink-0">${v.price}</span>
                  </div>`
                  )
                  .join('')}
              </div>
            </div>
          </div>
        </article>`
      )
      .join('');

    menuGridEl.querySelectorAll('[data-zoom-menu]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = filtered[Number(btn.dataset.zoomMenu)];
        if (item) openLightbox(item.image, `${item.name} — Mulai ${item.priceStart}`);
      });
    });
  }

  menuSearchInput?.addEventListener('input', (e) => {
    menuQuery = e.target.value.trim().toLowerCase();
    renderMenuCards();
  });

  renderMenuTabs();
  renderMenuCards();

  // ==================== 7. PAKET KEMITRAAN CARDS & TABLE ====================
  const packagesGridEl = document.getElementById('packagesGrid');
  if (packagesGridEl) {
    packagesGridEl.innerHTML = DATA.packages
      .map((pkg, idx) => {
        const waMsg = `Halo Tim Kemitraan Nu Fried Chicken & Burger, saya tertarik dengan ${pkg.name} (Rp ${pkg.priceLabel} ${pkg.priceUnit}). Mohon info ketersediaan dan langkah pendaftarannya.`;
        const isPopular = pkg.popular;

        return `
          <div class="nu-card reveal relative rounded-3xl p-6 flex flex-col justify-between border ${
            isPopular
              ? 'bg-nu-cream border-2 border-nu-red shadow-glow'
              : 'bg-white border-zinc-200/90 shadow-card'
          }" style="transition-delay:${idx * 70}ms">
            ${
              isPopular
                ? `<div class="badge-shimmer absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-md whitespace-nowrap">
                    ★ ${pkg.badge}
                  </div>`
                : `<div class="inline-flex self-start px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-bold uppercase tracking-wider mb-3">
                    ${pkg.badge}
                  </div>`
            }

            <div class="${isPopular ? 'pt-2' : ''}">
              <h3 class="text-xl font-extrabold text-nu-ink">${pkg.name}</h3>
              <p class="text-xs text-zinc-600 mt-1.5 min-h-[36px] leading-relaxed">${pkg.tagline}</p>

              <div class="my-4 flex items-baseline gap-1.5">
                <span class="text-sm font-bold text-zinc-500">Rp</span>
                <span class="text-4xl font-extrabold text-nu-red tracking-tight">${pkg.priceLabel}</span>
                <span class="text-base font-extrabold text-nu-ink">${pkg.priceUnit}</span>
              </div>

              <button
                type="button"
                data-zoom-pkg="${idx}"
                aria-label="Perbesar desain ${pkg.name}"
                class="w-full rounded-2xl bg-white border border-zinc-100 p-3 h-44 flex items-center justify-center mb-5 overflow-hidden cursor-zoom-in group relative"
              >
                <img
                  src="${pkg.image}"
                  alt="${pkg.name} Nu Fried Chicken & Burger"
                  loading="lazy"
                  class="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <span class="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-zinc-900/75 text-white text-[10px] font-semibold">
                  Zoom 🔍
                </span>
              </button>

              <div class="space-y-3.5 text-xs mb-5">
                ${pkg.facilities
                  .map(
                    (f) => `
                  <div>
                    <p class="font-bold text-nu-ink uppercase tracking-wide text-[11px] mb-1">${f.group}</p>
                    <ul class="space-y-1 text-zinc-600">
                      ${f.items
                        .map(
                          (line) => `
                        <li class="flex items-start gap-2">
                          <svg class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                          <span>${line}</span>
                        </li>`
                        )
                        .join('')}
                    </ul>
                  </div>`
                  )
                  .join('')}
              </div>
            </div>

            <div class="pt-4 border-t border-zinc-200/80 space-y-3">
              <div class="rounded-xl bg-zinc-50 p-3 text-[11px]">
                <p class="font-bold text-nu-ink mb-1">Estimasi BEP (Proposal):</p>
                <div class="grid grid-cols-3 gap-1 text-center">
                  <div class="bg-white rounded-lg p-1.5 border border-zinc-100">
                    <span class="block text-zinc-500">10 ekor/hr</span>
                    <strong class="text-nu-ink">${pkg.bep[10]}</strong>
                  </div>
                  <div class="bg-white rounded-lg p-1.5 border border-zinc-100">
                    <span class="block text-zinc-500">20 ekor/hr</span>
                    <strong class="text-nu-red">${pkg.bep[20]}</strong>
                  </div>
                  <div class="bg-white rounded-lg p-1.5 border border-zinc-100">
                    <span class="block text-zinc-500">50 ekor/hr</span>
                    <strong class="text-emerald-600">${pkg.bep[50]}</strong>
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <a
                  href="${buildWaUrl(waMsg)}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition ${
                    isPopular
                      ? 'bg-nu-red hover:bg-nu-redDark text-white shadow-glow'
                      : 'bg-nu-ink hover:bg-nu-red text-white'
                  }"
                >
                  <span>Pilih ${pkg.name}</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                </a>
                <button
                  type="button"
                  data-sim-pkg="${pkg.id}"
                  class="sim-pkg-trigger w-full py-2 px-3 rounded-xl text-xs font-semibold text-nu-red hover:bg-nu-redSoft transition whitespace-nowrap"
                >
                  Simulasikan Paket Ini ↓
                </button>
              </div>
            </div>
          </div>`;
      })
      .join('');

    packagesGridEl.querySelectorAll('[data-zoom-pkg]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pkg = DATA.packages[Number(btn.dataset.zoomPkg)];
        if (pkg) openLightbox(pkg.image, `${pkg.name} — Rp ${pkg.priceLabel} ${pkg.priceUnit} (${pkg.dimensions})`);
      });
    });
  }

  // Dynamic Comparison Table Body
  const packagesTableBodyEl = document.getElementById('packagesTableBody');
  if (packagesTableBodyEl) {
    const tdCls = (pkg, extra = '') =>
      `py-3.5 px-5 ${pkg.popular ? 'bg-red-50/40 ' : ''}${extra}`;
    packagesTableBodyEl.innerHTML = `
      <tr>
        <td class="py-3.5 px-5 font-semibold text-nu-ink">Harga Investasi</td>
        ${DATA.packages
          .map(
            (p) =>
              `<td class="${tdCls(
                p,
                p.popular ? 'font-extrabold text-nu-red' : 'font-bold'
              )}">Rp ${p.priceLabel} ${p.priceUnit.charAt(0) + p.priceUnit.slice(1).toLowerCase()}</td>`
          )
          .join('')}
      </tr>
      <tr>
        <td class="py-3.5 px-5 font-semibold text-nu-ink">Unit / Material</td>
        ${DATA.packages
          .map((p) => `<td class="${tdCls(p)}">${p.unitName} (${p.material})</td>`)
          .join('')}
      </tr>
      <tr>
        <td class="py-3.5 px-5 font-semibold text-nu-ink">Dimensi</td>
        ${DATA.packages
          .map((p) => `<td class="${tdCls(p)}">${p.dimensions}</td>`)
          .join('')}
      </tr>
      <tr>
        <td class="py-3.5 px-5 font-semibold text-nu-ink">Peralatan &amp; Bahan Baku Awal</td>
        ${DATA.packages
          .map((p) => `<td class="${tdCls(p, 'text-emerald-600 font-semibold')}">✓ Lengkap</td>`)
          .join('')}
      </tr>
      <tr>
        <td class="py-3.5 px-5 font-semibold text-nu-ink">Branding &amp; Media Promo</td>
        ${DATA.packages
          .map((p) =>
            p.hasBrandingPromo
              ? `<td class="${tdCls(p, 'text-emerald-600 font-semibold')}">✓ Balon, Banner, Brosur GO, Foto &amp; Design</td>`
              : `<td class="${tdCls(p, 'text-zinc-400')}">Standar Unit</td>`
          )
          .join('')}
      </tr>
      <tr>
        <td class="py-3.5 px-5 font-semibold text-nu-ink">BEP (10 ekor/hari)</td>
        ${DATA.packages
          .map((p) => `<td class="${tdCls(p, 'font-semibold')}">${p.bep[10]}</td>`)
          .join('')}
      </tr>
      <tr>
        <td class="py-3.5 px-5 font-semibold text-nu-ink">BEP (20 ekor/hari)</td>
        ${DATA.packages
          .map((p) => `<td class="${tdCls(p, 'font-semibold')}">${p.bep[20]}</td>`)
          .join('')}
      </tr>
      <tr>
        <td class="py-3.5 px-5 font-semibold text-nu-ink">BEP (50 ekor/hari)</td>
        ${DATA.packages
          .map((p) => `<td class="${tdCls(p, 'font-semibold text-emerald-600')}">${p.bep[50]}</td>`)
          .join('')}
      </tr>
    `;
  }

  // ==================== 8. BEP & GROSS PROFIT CALCULATOR ====================
  const calcPkgBtnsEl = document.getElementById('calcPackageButtons');
  const dailyBirdsRange = document.getElementById('dailyBirdsRange');
  const dailyBirdsValue = document.getElementById('dailyBirdsValue');
  const opexInput = document.getElementById('opexInput');
  const toggleOpexDetailBtn = document.getElementById('toggleOpexDetailBtn');
  const opexDetailBox = document.getElementById('opexDetailBox');
  const calcSelectedPkgName = document.getElementById('calcSelectedPkgName');
  const calcSelectedPkgPrice = document.getElementById('calcSelectedPkgPrice');
  const calcGrossProfit = document.getElementById('calcGrossProfit');
  const calcNetRow = document.getElementById('calcNetRow');
  const calcNetProfit = document.getElementById('calcNetProfit');
  const calcBepMonths = document.getElementById('calcBepMonths');
  const calcWaBtn = document.getElementById('calcWaBtn');

  let selectedPkgId = 'medium';
  let dailyBirds = 20;

  function triggerPop(el) {
    if (!el) return;
    el.classList.remove('num-pop');
    void el.offsetWidth;
    el.classList.add('num-pop');
  }

  toggleOpexDetailBtn?.addEventListener('click', () => {
    const isHidden = opexDetailBox?.classList.toggle('hidden');
    if (toggleOpexDetailBtn) {
      toggleOpexDetailBtn.textContent = isHidden ? '+ Rincikan Biaya' : '− Sembunyikan Rincian';
    }
  });

  document.querySelectorAll('.opex-part').forEach((partInput) => {
    partInput.addEventListener('input', () => {
      const rent = Math.max(0, Number(document.getElementById('opexRent')?.value) || 0);
      const staff = Math.max(0, Number(document.getElementById('opexStaff')?.value) || 0);
      const utility = Math.max(0, Number(document.getElementById('opexUtility')?.value) || 0);
      if (opexInput) {
        opexInput.value = String(rent + staff + utility);
        updateCalculator();
      }
    });
  });

  function renderCalcPackageButtons() {
    if (!calcPkgBtnsEl) return;
    calcPkgBtnsEl.innerHTML = DATA.packages
      .map((pkg) => {
        const active = pkg.id === selectedPkgId;
        return `
          <button
            type="button"
            data-pkg-id="${pkg.id}"
            class="calc-pkg-btn p-3 rounded-2xl border text-left transition-all ${
              active
                ? 'border-nu-red bg-nu-redSoft ring-2 ring-nu-red/20'
                : 'border-zinc-200 bg-white hover:border-nu-red'
            }"
          >
            <span class="block text-[11px] font-semibold text-zinc-500">${pkg.unitName}</span>
            <span class="block text-sm font-extrabold ${active ? 'text-nu-red' : 'text-nu-ink'}">${pkg.priceLabel} ${pkg.priceUnit}</span>
          </button>`;
      })
      .join('');

    calcPkgBtnsEl.querySelectorAll('.calc-pkg-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedPkgId = btn.dataset.pkgId;
        renderCalcPackageButtons();
        updateCalculator();
      });
    });
  }

  function updatePresetButtons() {
    document.querySelectorAll('.preset-bird-btn').forEach((btn) => {
      const val = parseInt(btn.dataset.birds, 10);
      const isMatch = val === dailyBirds;
      btn.classList.toggle('border-nu-red', isMatch);
      btn.classList.toggle('bg-nu-redSoft', isMatch);
      btn.classList.toggle('text-nu-red', isMatch);
      btn.classList.toggle('border-zinc-200', !isMatch);
      btn.classList.toggle('text-zinc-700', !isMatch);
    });
  }

  function updateCalculator() {
    const pkg = DATA.packages.find((p) => p.id === selectedPkgId) || DATA.packages[1];
    const opex = Math.max(0, parseInt(opexInput?.value || '0', 10) || 0);

    const grossProfit = dailyBirds * DATA.gpPerDailyBirdMonthly;
    const netProfit = grossProfit - opex;
    const effectiveProfitForBep = opex > 0 ? netProfit : grossProfit;

    if (dailyBirdsValue) dailyBirdsValue.textContent = `${dailyBirds} ekor / hari`;
    if (calcSelectedPkgName) calcSelectedPkgName.textContent = pkg.name;
    if (calcSelectedPkgPrice) calcSelectedPkgPrice.textContent = formatIDR(pkg.price);
    if (calcGrossProfit) {
      calcGrossProfit.textContent = formatIDR(grossProfit);
      triggerPop(calcGrossProfit);
    }

    if (calcNetRow && calcNetProfit) {
      if (opex > 0) {
        calcNetRow.classList.remove('hidden');
        calcNetProfit.textContent = formatIDR(netProfit);
        triggerPop(calcNetProfit);
      } else {
        calcNetRow.classList.add('hidden');
      }
    }

    let bepText = '';
    if (effectiveProfitForBep <= 0) {
      bepText = 'Biaya melebihi GP';
    } else if (opex === 0 && pkg.bep[dailyBirds]) {
      bepText = pkg.bep[dailyBirds];
    } else {
      const months = pkg.price / effectiveProfitForBep;
      bepText = `± ${months.toFixed(1).replace('.', ',')} bulan`;
    }

    if (calcBepMonths) {
      calcBepMonths.textContent = bepText;
      triggerPop(calcBepMonths);
    }

    if (calcWaBtn) {
      const waSummary = `Halo Tim Nu Fried Chicken & Burger, saya sudah mencoba simulasi untuk ${pkg.name} (${formatIDR(pkg.price)}) dengan target ${dailyBirds} ekor/hari (Gross Profit ${formatIDR(grossProfit)}/bln, estimasi BEP ${bepText}). Saya ingin konsultasi lebih lanjut.`;
      calcWaBtn.href = buildWaUrl(waSummary);
    }

    updatePresetButtons();
  }

  if (dailyBirdsRange) {
    dailyBirdsRange.addEventListener('input', (e) => {
      dailyBirds = parseInt(e.target.value, 10) || 20;
      updateCalculator();
    });
  }

  opexInput?.addEventListener('input', updateCalculator);

  document.querySelectorAll('.preset-bird-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      dailyBirds = parseInt(btn.dataset.birds, 10);
      if (dailyBirdsRange) dailyBirdsRange.value = String(dailyBirds);
      updateCalculator();
    });
  });

  document.querySelectorAll('.sim-pkg-trigger').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedPkgId = btn.dataset.simPkg;
      renderCalcPackageButtons();
      updateCalculator();
      document.getElementById('simulasi')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  renderCalcPackageButtons();
  updateCalculator();

  // ==================== 9. ALUR PENDAFTARAN MITRA & FAQ ====================
  const onboardingGridEl = document.getElementById('onboardingGrid');
  if (onboardingGridEl) {
    onboardingGridEl.innerHTML = DATA.onboardingSteps
      .map(
        (s, idx) => `
        <div class="nu-card reveal p-7 rounded-3xl bg-zinc-50 border border-zinc-200/80 relative overflow-hidden" style="transition-delay:${idx * 60}ms">
          <span class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-nu-red text-white font-extrabold text-lg shadow-sm mb-5">
            ${s.step}
          </span>
          <h3 class="text-lg font-bold text-nu-ink mb-2">${s.title}</h3>
          <p class="text-sm text-zinc-600 leading-relaxed">${s.desc}</p>
        </div>`
      )
      .join('');
  }

  const faqListEl = document.getElementById('faqList');
  if (faqListEl) {
    faqListEl.innerHTML = DATA.faqs
      .map(
        (faq, idx) => `
        <div class="faq-item rounded-2xl border border-zinc-200 bg-white overflow-hidden transition-colors ${
          idx === 0 ? 'open border-red-200 bg-nu-cream/40' : ''
        }">
          <button
            type="button"
            class="faq-toggle w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left font-bold text-sm sm:text-base text-nu-ink hover:text-nu-red transition"
            aria-expanded="${idx === 0 ? 'true' : 'false'}"
          >
            <span>${faq.q}</span>
            <svg class="faq-chevron w-5 h-5 text-nu-red shrink-0 transition-transform duration-300" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div class="faq-content">
            <div class="faq-inner">
              <p class="px-5 sm:px-6 pb-5 sm:pb-6 text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3">
                ${faq.a}
              </p>
            </div>
          </div>
        </div>`
      )
      .join('');

    faqListEl.querySelectorAll('.faq-toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(isOpen));
      });
    });
  }

  // ==================== 10. LEAD CAPTURE FORM ====================
  const leadPackageSel = document.getElementById('leadPackage');
  if (leadPackageSel) {
    leadPackageSel.innerHTML =
      DATA.packages
        .map((p) => `<option value="${p.name} (Rp ${p.priceLabel} ${p.priceUnit})">${p.name} — Rp ${p.priceLabel} ${p.priceUnit}</option>`)
        .join('') + `<option value="Belum Memilih (Konsultasi Dulu)">Belum Memilih (Konsultasi Dulu)</option>`;
  }

  const leadForm = document.getElementById('leadForm');
  const leadSuccessBox = document.getElementById('leadSuccessBox');
  const leadWaContinueBtn = document.getElementById('leadWaContinueBtn');

  leadForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('leadName').value.trim();
    const phone = document.getElementById('leadPhone').value.trim();
    const city = document.getElementById('leadCity').value.trim();
    const packageName = leadPackageSel ? leadPackageSel.value : '';
    const notes = document.getElementById('leadNotes').value.trim();

    try {
      await window.NU_STORE.submitLead({ name, phone, city, packageName, notes });
      const waText = `Halo Tim Kemitraan Nu Fried Chicken & Burger, saya ${name} (${phone}) dari ${city}. Saya berminat dengan ${packageName}.${notes ? ' Catatan: ' + notes : ''}`;
      if (leadWaContinueBtn) leadWaContinueBtn.href = buildWaUrl(waText);
      leadSuccessBox?.classList.remove('hidden');
      leadForm.reset();
    } catch (err) {
      alert(err.message || 'Gagal mengirim formulir.');
    }
  });

  // ==================== 11. SCROLL-SPY, SCROLL-REVEAL & STICKY BARS ====================
  const backToTopBtn = document.getElementById('backToTopBtn');
  const mobileStickyBar = document.getElementById('mobileStickyBar');
  const navbar = document.getElementById('navbar');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const observedSections = ['beranda', 'tentang', 'menu', 'paket', 'alur', 'kontak']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function updateScrollUi() {
    const y = window.scrollY;
    navbar?.classList.toggle('shadow-md', y > 20);

    if (backToTopBtn) {
      const showTop = y > 400;
      backToTopBtn.classList.toggle('hidden', !showTop);
      backToTopBtn.classList.toggle('inline-flex', showTop);
    }

    if (mobileStickyBar) {
      mobileStickyBar.classList.toggle('hidden', y < 500);
    }

    // Active Scroll-Spy
    let currentId = 'beranda';
    for (const sec of observedSections) {
      if (y + 140 >= sec.offsetTop) {
        currentId = sec.id;
      }
    }
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  }

  window.addEventListener('scroll', updateScrollUi, { passive: true });
  updateScrollUi();

  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // IntersectionObserver for Scroll-Reveal
  const revealTargets = document.querySelectorAll('.reveal, section h2, .nu-card');
  revealTargets.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('reveal-visible'));
  }
})();
