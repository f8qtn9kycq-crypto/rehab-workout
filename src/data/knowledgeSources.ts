export type KnowledgeSourceType = 'expert_video' | 'hospital_professional' | 'systematic_review';
export type KnowledgeEvidenceTier = 'expert_education' | 'institutional_rehab' | 'higher_level_evidence';
export type KnowledgeEvidenceStatus = 'supported' | 'supported_with_modification' | 'expert_opinion_only';

export interface KnowledgeSource {
  sourceId: string;
  sourceType: KnowledgeSourceType;
  title: string;
  creator: string;
  credentials: string;
  organization: string;
  url: string;
  language: 'zh-TW' | 'en';
  topics: string[];
  evidenceTier: KnowledgeEvidenceTier;
  evidenceStatus: KnowledgeEvidenceStatus;
  safetyNotes: string[];
  contentNotes: string;
}

export const knowledgeSources: KnowledgeSource[] = [
  {
    sourceId: 'juicept-fascia-8',
    sourceType: 'expert_video',
    title: '8 個動作解放你緊繃的筋膜',
    creator: '啾C',
    credentials: '物理治療師身分可由公開專業資料交叉核對；本筆記不推導影片未逐項驗證的動作。',
    organization: '啾C物理治療',
    url: 'https://www.youtube.com/watch?v=fAgAZusLVwI',
    language: 'zh-TW',
    topics: ['肩頸舒緩', '活動度', '放鬆'],
    evidenceTier: 'expert_education',
    evidenceStatus: 'expert_opinion_only',
    safetyNotes: ['影片不取代書面步驟與停止規則', '頭痛或神經症狀不建立自動運動推薦'],
    contentNotes: '僅作為 expert-video mobility/relaxation reference；未取得可靠逐字稿與完整動作清單。',
  },
  {
    sourceId: 'vghtc-turtle-neck-pt',
    sourceType: 'hospital_professional',
    title: '你也有烏龜頸嗎？3 個在家就能做的姿勢調整動作',
    creator: '徐銘君治療師',
    credentials: '物理治療師',
    organization: '臺中榮民總醫院',
    url: 'https://www.vghtc.gov.tw/News_Video_Content_D/426/8673',
    language: 'zh-TW',
    topics: ['頭部前傾', '肩頸活動', '姿勢教育'],
    evidenceTier: 'institutional_rehab',
    evidenceStatus: 'supported_with_modification',
    safetyNotes: ['持續不適應尋求專業評估', '不把姿勢視為疼痛唯一原因'],
    contentNotes: '醫院衛教影片；作為繁中 cue 與教育語境參考。',
  },
  {
    sourceId: 'vghtc-cervical-home-exercise',
    sourceType: 'hospital_professional',
    title: '骨科物理治療運動處方：頸部居家運動',
    creator: '臺中榮民總醫院物理治療團隊',
    credentials: '醫院物理治療衛教內容',
    organization: '臺中榮民總醫院',
    url: 'https://www.vghtc.gov.tw/News_Content/2127/5111',
    language: 'zh-TW',
    topics: ['頸部活動度', '胸椎活動', '頸部居家運動'],
    evidenceTier: 'institutional_rehab',
    evidenceStatus: 'supported_with_modification',
    safetyNotes: ['採舒服且可控制的幅度', '出現頭暈、麻木、無力或放射症狀時停止並評估'],
    contentNotes: '支持胸椎活動與溫和頸部活動類別；App 版本不照搬未必要的頸部後仰。',
  },
  {
    sourceId: 'juicept-serratus-anterior',
    sourceType: 'expert_video',
    title: '前鋸肌訓練：強化肩膀最重要的肌肉',
    creator: '啾C',
    credentials: '物理治療師身分可由公開專業資料交叉核對',
    organization: '啾C物理治療',
    url: 'https://juicept.net/%E5%BC%B7%E5%8C%96%E8%82%A9%E8%86%80%E6%9C%80%E9%87%8D%E8%A6%81%E7%9A%84%E8%82%8C%E8%82%89%E3%80%8C%E5%89%8D%E9%8B%B8%E8%82%8C%E3%80%8D-%E5%95%BEc%E7%89%A9%E7%90%86%E6%B2%BB%E7%99%82%E5%B8%AB/',
    language: 'zh-TW',
    topics: ['前鋸肌', '肩胛控制', '肩部肌力'],
    evidenceTier: 'expert_education',
    evidenceStatus: 'supported_with_modification',
    safetyNotes: ['本 PR 只採牆面支撐與低負荷版本', '避免疼痛終端角度與激烈過頭負荷'],
    contentNotes: '只作為保守 active-aging subset 的 expert demonstration reference。',
  },
  {
    sourceId: 'starteredu-scapulohumeral-rhythm',
    sourceType: 'expert_video',
    title: '肩胛肱骨節律／肩關節的定期保養',
    creator: '啾C',
    credentials: '物理治療師身分可由公開專業資料交叉核對',
    organization: 'Starter Education',
    url: 'https://www.starteredu.com.tw/article/ZZcVa7MFYO',
    language: 'zh-TW',
    topics: ['肩胛肱骨節律', '肩部控制', '旋轉肌袖'],
    evidenceTier: 'expert_education',
    evidenceStatus: 'expert_opinion_only',
    safetyNotes: ['不新增與既有 wall slide 或 rotator-cuff entries 重複的動作'],
    contentNotes: '作為 shoulder-control reference，不單獨決定 exercise truth。',
  },
  {
    sourceId: 'juicept-headache-neck-education',
    sourceType: 'expert_video',
    title: '頭痛找不到原因？可能是頸椎或姿勢問題',
    creator: '啾C',
    credentials: '物理治療師身分可由公開專業資料交叉核對',
    organization: '啾C物理治療',
    url: 'https://juicept.net/%E4%B8%89%E4%B8%8D%E4%BA%94%E6%99%82%E5%B0%B1%E9%A0%AD%E7%97%9B%EF%BC%8C%E5%8F%AF%E8%83%BD%E6%98%AF%E9%80%99%E5%80%8B%E5%8E%9F%E5%9B%A0%EF%BD%9C%E5%95%BEc%E7%89%A9%E7%90%86%E6%B2%BB%E7%99%82%E5%B8%AB/',
    language: 'zh-TW',
    topics: ['頭痛教育', '肩頸症狀'],
    evidenceTier: 'expert_education',
    evidenceStatus: 'expert_opinion_only',
    safetyNotes: ['僅作教育來源', '不診斷頭痛、不建立 headache → exercise logic'],
    contentNotes: '頭痛內容保留教育邊界，神經或急性警訊依 App safety rules 處理。',
  },
  {
    sourceId: 'sunguts-team',
    sourceType: 'expert_video',
    title: 'SunGuts 肩頸自我照護與肩胛控制內容',
    creator: 'SunGuts 三個字物理治療團隊',
    credentials: '團隊頁公開列出物理治療系學歷與物理治療相關經歷',
    organization: 'SunGuts 三個字物理治療所',
    url: 'https://www.sunguts.tw/team',
    language: 'zh-TW',
    topics: ['肩頸自我照護', '下巴內收', '胸椎活動', '肩胛控制'],
    evidenceTier: 'expert_education',
    evidenceStatus: 'expert_opinion_only',
    safetyNotes: ['與既有 exercise 去重', '避免把姿勢敘事寫成單一因果'],
    contentNotes: '補充專業團隊與繁中教學來源，不直接決定新增動作。',
  },
  {
    sourceId: 'pubmed-neck-resistance-motor-control-37339388',
    sourceType: 'systematic_review',
    title: 'Resistance and motor-control exercise for chronic nonspecific neck pain',
    creator: 'PubMed-indexed research authors',
    credentials: 'Systematic review / higher-level evidence anchor',
    organization: 'PubMed',
    url: 'https://pubmed.ncbi.nlm.nih.gov/37339388/',
    language: 'en',
    topics: ['頸部肌力', 'motor control', '慢性非特異性頸痛'],
    evidenceTier: 'higher_level_evidence',
    evidenceStatus: 'supported',
    safetyNotes: ['支持運動類別，不自行推導個人化最佳劑量'],
    contentNotes: '用於支持 resistance/motor-control 類別，不取代臨床評估。',
  },
  {
    sourceId: 'pubmed-craniocervical-flexion-39700104',
    sourceType: 'systematic_review',
    title: 'Craniocervical-flexion training and neck neuromuscular adaptation',
    creator: 'PubMed-indexed research authors',
    credentials: 'PubMed-indexed research evidence anchor',
    organization: 'PubMed',
    url: 'https://pubmed.ncbi.nlm.nih.gov/39700104/',
    language: 'en',
    topics: ['深層頸屈肌', '頸部神經肌肉控制'],
    evidenceTier: 'higher_level_evidence',
    evidenceStatus: 'supported',
    safetyNotes: ['不自行發明固定劑量或診斷規則'],
    contentNotes: '用於支持頸部 motor-control 研究方向；既有 chin tuck / isometric 已覆蓋主要缺口。',
  },
];
