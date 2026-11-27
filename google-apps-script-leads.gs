/**
 * Google Apps Script — Database Leads Online Gratis untuk Nu Fried Chicken & Burger
 * 1. Buka https://sheets.new lalu klik menu Extensions -> Apps Script
 * 2. Hapus kode default, tempel seluruh kode ini, lalu simpan (Ctrl+S)
 * 3. Klik Deploy -> New deployment -> Type: Web app -> Execute as: Me -> Who has access: Anyone -> Deploy
 * 4. Salin Web app URL (https://script.google.com/macros/s/.../exec) dan tempel di Admin Panel tab Calon Mitra (Leads)
 */

function getLeadsSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Leads');
  if (!sheet) {
    sheet = ss.insertSheet('Leads');
    sheet.appendRow(['id', 'name', 'phone', 'city', 'packageName', 'notes', 'status', 'createdAt']);
  }
  return sheet;
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'list';
  if (action === 'list') {
    const sheet = getLeadsSheet_();
    const values = sheet.getDataRange().getValues();
    const leads = [];
    for (let i = values.length - 1; i >= 1; i--) {
      const r = values[i];
      if (!r[0]) continue;
      leads.push({
        id: String(r[0]),
        name: String(r[1] || ''),
        phone: String(r[2] || ''),
        city: String(r[3] || ''),
        packageName: String(r[4] || ''),
        notes: String(r[5] || ''),
        status: String(r[6] || 'Baru'),
        createdAt: String(r[7] || ''),
      });
    }
    return jsonOut_({ ok: true, leads });
  }
  return jsonOut_({ ok: true });
}

function doPost(e) {
  const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  const action = body.action || 'create';
  const sheet = getLeadsSheet_();

  if (action === 'create') {
    const id = body.id || 'lead-' + Date.now();
    const createdAt = body.createdAt || new Date().toISOString();
    sheet.appendRow([
      id,
      body.name || '',
      body.phone || '',
      body.city || '',
      body.packageName || 'Belum Memilih',
      body.notes || '',
      body.status || 'Baru',
      createdAt,
    ]);
    return jsonOut_({ ok: true, id });
  }

  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(body.id)) {
      if (action === 'updateStatus') {
        sheet.getRange(i + 1, 7).setValue(body.status || 'Sudah Dihubungi');
        return jsonOut_({ ok: true });
      }
      if (action === 'delete') {
        sheet.deleteRow(i + 1);
        return jsonOut_({ ok: true });
      }
    }
  }
  return jsonOut_({ ok: false, error: 'Lead not found' });
}
