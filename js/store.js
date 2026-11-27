/**
 * Store layer for Nu Fried Chicken & Burger
 * Menggabungkan data default Proposal 2026 (NU_DATA) dengan perubahan dari Admin Panel
 * Mendukung backend Node.js (/api/content) maupun fallback localStorage saat dibuka statis.
 */
(function () {
  const LS_KEY = 'nu_site_overrides_v1';
  const LS_LEADS_KEY = 'nu_site_leads_v1';
  const TOKEN_KEY = 'nu_admin_token_v1';

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function mergeContent(base, overrides) {
    const merged = deepClone(base);
    if (!overrides || typeof overrides !== 'object') return merged;

    if (overrides.brand && typeof overrides.brand === 'object') {
      merged.brand = Object.assign({}, merged.brand, overrides.brand);
    }

    if (overrides.media && typeof overrides.media === 'object') {
      merged.media = Object.assign({}, merged.media, overrides.media);
      if (Array.isArray(overrides.media.outletImages)) {
        merged.media.outletImages = overrides.media.outletImages.slice(0, 3);
      }
    }

    if (overrides.promo && typeof overrides.promo === 'object') {
      merged.promo = Object.assign({}, merged.promo, overrides.promo);
    }

    if (Array.isArray(overrides.packages)) {
      const overrideMap = new Map(overrides.packages.map((p) => [p.id, p]));
      merged.packages = merged.packages.map((pkg) => {
        const ov = overrideMap.get(pkg.id);
        if (!ov) return pkg;
        return Object.assign({}, pkg, ov, {
          bep: Object.assign({}, pkg.bep, ov.bep || {}),
          facilities: Array.isArray(ov.facilities) ? ov.facilities : pkg.facilities,
        });
      });
    }

    if (Array.isArray(overrides.menuItems)) {
      merged.menuItems = deepClone(overrides.menuItems);
    }

    if (Array.isArray(overrides.onboardingSteps)) {
      merged.onboardingSteps = deepClone(overrides.onboardingSteps);
    }

    if (Array.isArray(overrides.faqs)) {
      merged.faqs = deepClone(overrides.faqs);
    }

    return merged;
  }

  function getLocalOverrides() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function setLocalOverrides(overrides) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(overrides || {}));
    } catch {
      // ignore quota errors
    }
  }

  async function detectApiAvailable() {
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      return res.ok;
    } catch {
      return false;
    }
  }

  async function loadContent() {
    const base = window.NU_DATA;
    let overrides = {};
    let mode = 'local';

    try {
      const res = await fetch('/api/content', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        overrides = json.overrides || {};
        mode = 'server';
      } else {
        overrides = getLocalOverrides();
      }
    } catch {
      overrides = getLocalOverrides();
    }

    return {
      content: mergeContent(base, overrides),
      overrides,
      mode,
    };
  }

  function getToken() {
    try {
      return sessionStorage.getItem(TOKEN_KEY) || '';
    } catch {
      return '';
    }
  }

  function setToken(token) {
    try {
      if (token) sessionStorage.setItem(TOKEN_KEY, token);
      else sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  }

  function authHeaders(extra = {}) {
    const token = getToken();
    return token ? Object.assign({ Authorization: `Bearer ${token}` }, extra) : extra;
  }

  async function saveOverrides(overrides) {
    setLocalOverrides(overrides);
    const hasApi = await detectApiAvailable();
    if (!hasApi) {
      return { ok: true, mode: 'local' };
    }

    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ overrides }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal menyimpan ke server.');
    }
    return { ok: true, mode: 'server' };
  }

  async function resetOverrides() {
    setLocalOverrides({});
    const hasApi = await detectApiAvailable();
    if (!hasApi) {
      return { ok: true, mode: 'local' };
    }

    const res = await fetch('/api/reset', {
      method: 'POST',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal mereset data di server.');
    }
    return { ok: true, mode: 'server' };
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
      reader.readAsDataURL(file);
    });
  }

  async function uploadImage(file) {
    const dataUrl = await fileToDataUrl(file);
    const hasApi = await detectApiAvailable();
    if (!hasApi) {
      return { url: dataUrl, mode: 'local' };
    }

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        filename: file.name || 'image.jpg',
        dataUrl,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal mengunggah gambar.');
    }
    const json = await res.json();
    return { url: json.url, mode: 'server' };
  }

  function computeBepMap(price, gpPerDailyBirdMonthly) {
    const out = {};
    [10, 20, 50].forEach((birds) => {
      const months = price / (birds * gpPerDailyBirdMonthly);
      out[birds] = `± ${months.toFixed(1).replace('.', ',')} bulan`;
    });
    return out;
  }

  function formatPackagePriceDisplay(price) {
    if (price >= 1000000) {
      const jt = price / 1000000;
      const label = Number.isInteger(jt) ? String(jt) : jt.toFixed(1).replace('.', ',');
      return { priceLabel: label, priceUnit: 'JUTA' };
    }
    return { priceLabel: Math.round(price / 1000).toString(), priceUnit: 'RIBU' };
  }

  async function submitLead(lead) {
    const hasApi = await detectApiAvailable();
    if (!hasApi) {
      const list = JSON.parse(localStorage.getItem(LS_LEADS_KEY) || '[]');
      const entry = {
        ...lead,
        id: `lead-${Date.now()}`,
        status: 'Baru',
        createdAt: new Date().toISOString(),
      };
      list.unshift(entry);
      localStorage.setItem(LS_LEADS_KEY, JSON.stringify(list));
      return { ok: true, lead: entry, mode: 'local' };
    }
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'Gagal mengirim pendaftaran.');
    return { ok: true, lead: json.lead, mode: 'server' };
  }

  async function fetchLeads() {
    const hasApi = await detectApiAvailable();
    if (!hasApi) {
      return JSON.parse(localStorage.getItem(LS_LEADS_KEY) || '[]');
    }
    const res = await fetch('/api/leads', { headers: authHeaders(), cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json().catch(() => ({}));
    return json.leads || [];
  }

  async function updateLeadStatus(id, status) {
    const hasApi = await detectApiAvailable();
    if (!hasApi) {
      const list = JSON.parse(localStorage.getItem(LS_LEADS_KEY) || '[]');
      const idx = list.findIndex((l) => l.id === id);
      if (idx !== -1) list[idx].status = status;
      localStorage.setItem(LS_LEADS_KEY, JSON.stringify(list));
      return true;
    }
    const res = await fetch('/api/leads', {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id, status }),
    });
    return res.ok;
  }

  async function deleteLead(id) {
    const hasApi = await detectApiAvailable();
    if (!hasApi) {
      const list = JSON.parse(localStorage.getItem(LS_LEADS_KEY) || '[]').filter((l) => l.id !== id);
      localStorage.setItem(LS_LEADS_KEY, JSON.stringify(list));
      return true;
    }
    const res = await fetch('/api/leads', {
      method: 'DELETE',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id }),
    });
    return res.ok;
  }

  window.NU_STORE = {
    loadContent,
    saveOverrides,
    resetOverrides,
    uploadImage,
    submitLead,
    fetchLeads,
    updateLeadStatus,
    deleteLead,
    detectApiAvailable,
    getToken,
    setToken,
    authHeaders,
    mergeContent,
    deepClone,
    computeBepMap,
    formatPackagePriceDisplay,
    LOCAL_DEFAULT_USER: 'admin',
    LOCAL_DEFAULT_PASS_SHA256: '31087d54518c3a4ddc91795bcd482e2fbe2cd34665fe2167bd6927c075a5b234', // sha256("nuchicken2026")
  };
})();
