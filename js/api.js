// ============================================================
// GAS API 通信モジュール（LocalStorageキャッシュ付き）
// ============================================================

const CACHE_TTL = { getDashboard: 60, getMasters: 300, getEquipment: 120,
  getMaintenance: 60, getSchedules: 60, getOperations: 60, getFuel: 60,
  getInventory: 60, getSettings: 300 };

function _cacheGet(key) {
  try {
    const s = localStorage.getItem('api_' + key);
    if (!s) return null;
    const { data, exp } = JSON.parse(s);
    return Date.now() < exp ? data : null;
  } catch(e) { return null; }
}
function _cacheSet(key, data, ttl) {
  try { localStorage.setItem('api_' + key, JSON.stringify({ data, exp: Date.now() + ttl * 1000 })); }
  catch(e) {}
}
function _cacheKey(action, params) {
  return action + (params ? '_' + JSON.stringify(params) : '');
}

const API = {
  // GETリクエスト（キャッシュ付き）
  async get(action, params = {}, forceRefresh = false) {
    const ckey = _cacheKey(action, params);
    if (!forceRefresh) {
      const cached = _cacheGet(ckey);
      if (cached !== null) return cached;
    }
    const url = new URL(GAS_URL);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString(), { redirect: 'follow' });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    const ttl = CACHE_TTL[action] || 60;
    _cacheSet(ckey, data, ttl);
    return data;
  },

  // POSTリクエスト（キャッシュなし・関連キャッシュ削除）
  async post(action, body = {}) {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action, ...body })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    // 書き込み後はキャッシュをクリア
    try {
      Object.keys(localStorage).filter(k => k.startsWith('api_')).forEach(k => localStorage.removeItem(k));
    } catch(e) {}
    return data;
  },

  // ダッシュボード
  getDashboard:      (f)     => API.get('getDashboard', {}, f),
  getMasters:        (f)     => API.get('getMasters', {}, f),
  getSettings:       ()      => API.get('getSettings'),

  // 機械台帳
  getEquipment:        (p={})                 => API.get('getEquipment', p),
  getEquipmentById:    (id)                   => API.get('getEquipmentById', { id }),
  saveEquipment:       (data)                 => API.post('saveEquipment', { data }),
  deleteEquipment:     (id)                   => API.post('deleteEquipment', { id }),

  // 整備記録
  getMaintenance:    (p={})  => API.get('getMaintenance', p),
  getMaintenanceById:(id)    => API.get('getMaintenanceById', { id }),
  saveMaintenance:   (data)  => API.post('saveMaintenance', { data }),
  deleteMaintenance: (id)    => API.post('deleteMaintenance', { id }),

  // スケジュール
  getSchedules:      (p={})  => API.get('getSchedules', p),
  saveSchedule:      (data)  => API.post('saveSchedule', { data }),
  deleteSchedule:    (id)    => API.post('deleteSchedule', { id }),
  completeSchedule:  (id)    => API.post('completeSchedule', { id }),

  // 稼働記録
  getOperations:     (p={})  => API.get('getOperations', p),
  saveOperation:     (data)  => API.post('saveOperation', { data }),
  deleteOperation:   (id)    => API.post('deleteOperation', { id }),

  // 燃料記録
  getFuel:           (p={})  => API.get('getFuel', p),
  saveFuel:          (data)  => API.post('saveFuel', { data }),
  deleteFuel:        (id)    => API.post('deleteFuel', { id }),

  // 在庫
  getInventory:      (p={})  => API.get('getInventory', p),
  getInventoryById:  (id)    => API.get('getInventoryById', { id }),
  saveInventory:     (data)  => API.post('saveInventory', { data }),
  deleteInventory:   (id)    => API.post('deleteInventory', { id }),
  inventoryIn:       (id, quantity, reason) => API.post('inventoryIn', { id, quantity, reason }),
  inventoryOut:      (id, quantity, reason, equipment_id) => API.post('inventoryOut', { id, quantity, reason, equipment_id }),

  // 設定
  saveSetting:       (sheet, data) => API.post('saveSetting', { sheet, data }),
  deleteSetting:     (sheet, id)   => API.post('deleteSetting', { sheet, id }),

  // DB初期化
  initDb:            ()      => API.post('initDb'),
};
