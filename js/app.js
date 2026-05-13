// ============================================================
// 共通ユーティリティ
// ============================================================

// キャッシュ（マスタデータ）
let _masters = null;

async function getMasters(force = false) {
  if (!_masters || force) _masters = await API.getMasters();
  return _masters;
}

// 日付フォーマット
function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt)) return String(d);
  return dt.getFullYear() + '-' +
    String(dt.getMonth()+1).padStart(2,'0') + '-' +
    String(dt.getDate()).padStart(2,'0');
}

function fmtDateJP(d) {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt)) return String(d);
  return dt.getFullYear() + '年' + (dt.getMonth()+1) + '月' + dt.getDate() + '日';
}

function today() {
  return fmtDate(new Date());
}

// 数値フォーマット
function fmtNum(v, digits = 0) {
  if (v === '' || v === null || v === undefined) return '';
  return Number(v).toLocaleString('ja-JP', { maximumFractionDigits: digits });
}

// ローディング表示
function showLoading(container) {
  if (typeof container === 'string') container = document.getElementById(container);
  if (container) container.innerHTML = `
    <div class="text-center py-5 text-muted">
      <div class="spinner-border spinner-border-sm me-2" role="status"></div>読み込み中...
    </div>`;
}

function showError(container, msg) {
  if (typeof container === 'string') container = document.getElementById(container);
  if (container) container.innerHTML = `
    <div class="alert alert-danger m-3">
      <i class="bi bi-exclamation-triangle me-1"></i>${escHtml(msg)}
    </div>`;
}

// HTML エスケープ
function escHtml(s) {
  return String(s || '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// トースト通知
function showToast(msg, type = 'success') {
  const toastEl = document.getElementById('toast');
  const toastBody = document.getElementById('toastBody');
  if (!toastEl || !toastBody) return;
  toastBody.textContent = msg;
  toastEl.className = `toast align-items-center text-bg-${type} border-0`;
  const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3000 });
  toast.show();
}

// モーダル確認ダイアログ
function confirmDialog(msg) {
  return new Promise(resolve => {
    document.getElementById('confirmMsg').textContent = msg;
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmModal'));
    const btn = document.getElementById('confirmOkBtn');
    const handler = () => { resolve(true); modal.hide(); btn.removeEventListener('click', handler); };
    btn.addEventListener('click', handler);
    document.getElementById('confirmModal').addEventListener('hidden.bs.modal', () => {
      resolve(false);
    }, { once: true });
    modal.show();
  });
}

// ナビバッジ更新
async function updateNavBadges() {
  try {
    const data = await API.getDashboard();
    const overdueBadge = document.getElementById('overdueBadge');
    const lowstockBadge = document.getElementById('lowstockBadge');
    if (overdueBadge) {
      overdueBadge.textContent = data.overdueCount || '';
      overdueBadge.style.display = data.overdueCount > 0 ? '' : 'none';
    }
    if (lowstockBadge) {
      lowstockBadge.textContent = data.lowStockCount || '';
      lowstockBadge.style.display = data.lowStockCount > 0 ? '' : 'none';
    }
  } catch(e) {}
}

// アクティブナビ設定
function setActiveNav() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.classList.toggle('active', el.dataset.nav === path);
  });
}

// セレクトオプション生成
function buildOptions(items, valueKey, labelKey, selectedValue = '') {
  return items.map(item =>
    `<option value="${escHtml(item[valueKey])}"${String(item[valueKey]) === String(selectedValue) ? ' selected' : ''}>${escHtml(item[labelKey])}</option>`
  ).join('');
}

// ページ読み込み時の共通処理
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  updateNavBadges();
});
