// ============================================================
// GAS API 通信モジュール
// ============================================================

const API = {
  // GETリクエスト
  async get(action, params = {}) {
    const url = new URL(GAS_URL);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString(), { redirect: 'follow' });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  },

  // POSTリクエスト
  async post(action, body = {}) {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action, ...body })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  },

  // ダッシュボード
  getDashboard:      ()       => API.get('getDashboard'),
  getMasters:        ()       => API.get('getMasters'),
  getSettings:       ()       => API.get('getSettings'),

  // 機械台帳
  getEquipment:        (p={})                      => API.get('getEquipment', p),
  getEquipmentById:    (id)                        => API.get('getEquipmentById', { id }),
  saveEquipment:       (data)                      => API.post('saveEquipment', { data }),
  deleteEquipment:     (id)                        => API.post('deleteEquipment', { id }),
  saveEquipmentPhoto:  (id, base64, mimeType)      => API.post('saveEquipmentPhoto', { id, base64, mimeType }),

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
