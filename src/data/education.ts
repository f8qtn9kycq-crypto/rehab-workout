export const educationCards = [
  {
    id: 'start-safely',
    title: '先安全，再訓練',
    bodyArea: 'all',
    summary: '居家訓練只做教育與自我照護輔助，不取代醫療評估。若有紅旗症狀，請先找醫師或物理治療師。',
  },
  {
    id: 'knee-immediate-relief',
    title: '膝痛立即舒緩',
    bodyArea: 'knee',
    summary: '短期可先休息、冰敷、輕度加壓與抬高，避免繼續做會誘發疼痛的活動。',
  },
  {
    id: 'knee-long-term',
    title: '膝痛長期管理',
    bodyArea: 'knee',
    summary: '長期重點是低衝擊肌力訓練、體重管理與逐步恢復活動量。深蹲以淺角度、可控制為主。',
  },
  {
    id: 'knee-doctor',
    title: '什麼時候該就醫',
    bodyArea: 'knee',
    summary: '若突然劇痛或腫脹、無法承重、關節變形、不穩、發燒合併膝痛，請先接受專業評估。',
  },
  {
    id: 'ankle-pillars',
    title: '踝關節四大支柱',
    bodyArea: 'ankle',
    summary: '踝關節穩定來自力量、平衡、本體感覺與活動度。先從可扶穩、慢速度、低風險動作開始。',
  },
  {
    id: 'shoulder-neck-posture',
    title: '肩頸不是只拉筋',
    bodyArea: 'shoulder_neck',
    summary: '肩頸痠痛常需要放鬆、姿勢控制、頸椎穩定與肩胛肌力一起處理，避免只做強拉。',
  },
  {
    id: 'shoulder-hip-routine',
    title: '肩髖訓練節奏',
    bodyArea: 'shoulder',
    summary: '先活動度，再肌力；每一下都慢、穩、可呼吸。樂齡訓練不追求速度，追求可持續。',
  },
];

export const anklePillars = [
  { id: 'strength', title: '力量', description: '強化腳踝周圍肌肉，提供支撐與控制。' },
  { id: 'balance', title: '平衡', description: '提升靜態與動態站立穩定，降低跌倒與扭傷風險。' },
  { id: 'proprioception', title: '本體感覺', description: '讓身體更快感知腳踝位置與地面變化。' },
  { id: 'mobility', title: '活動度', description: '維持足夠的腳踝活動範圍，減少代償。' },
];

export const weeklyRoutines = {
  beginner: {
    title: '初學者 / 日常保健',
    days: [
      { day: '週一', items: ['坐姿腳踝畫圓', '坐姿腳踝字母', '下巴內收'] },
      { day: '週三', items: ['彈力帶腳踝內翻外翻', '肩胛骨收縮運動'] },
      { day: '週五', items: ['單腳站立', '髖關節屈曲運動'] },
    ],
  },
  standard: {
    title: '標準計畫',
    days: [
      { day: '週一', items: ['站姿小腿提踵', '直膝抬腿', '胸大肌伸展'] },
      { day: '週三', items: ['靠牆半蹲', '髖關節外展運動', '頸椎等長收縮'] },
      { day: '週五', items: ['臀橋運動', '單腳站立', '肩關節外旋運動'] },
    ],
  },
  recovery: {
    title: '恢復模式',
    days: [
      { day: '今天', items: ['熱敷與放鬆擺位', '膝蓋急性舒緩 RICE', '坐姿腳踝畫圓'] },
    ],
  },
};
