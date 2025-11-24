
export interface CharacterData {
  char: string;
  pinyin: string;
}

export enum GridType {
  TianZiGe = 'tian', // 田字格
  MiZiGe = 'mi',     // 米字格
  Square = 'square', // 方格
}

export enum PracticeMode {
  Trace = 'trace', // 描红 (Light gray character)
  Copy = 'copy',   // 临摹 (Empty box)
  Fill = 'fill',   // 填充 (First char visible, rest empty)
}

export interface SheetSettings {
  gridType: GridType;
  gridColor: string;
  charColor: string;
  title: string;
  mode: PracticeMode;
  showPinyinGrid: boolean; // New setting for Pinyin lines
}

export enum DifficultyLevel {
  Any = 'any',
  Simple = 'simple', // < 5 strokes
  Medium = 'medium', // 5-8 strokes
  Complex = 'complex', // > 8 strokes
  StrokeFocus = 'stroke_focus' // Specific stroke types
}

export interface ContentPreset {
  id: string;
  name: string;
  promptContext: string; // Context sent to Gemini
  category: 'textbook' | 'structure' | 'fun';
}

export const PRESETS: ContentPreset[] = [
  { id: 'custom', name: '自定义输入', promptContext: '', category: 'fun' },
  { id: 'ren_jiao_1_1', name: '人教版一年级上册 (第一单元)', promptContext: 'Create a list of characters from the People\'s Education Press (RenJiao) Grade 1 Book 1, Unit 1.', category: 'textbook' },
  { id: 'ren_jiao_1_2', name: '人教版一年级上册 (第二单元)', promptContext: 'Create a list of characters from the People\'s Education Press (RenJiao) Grade 1 Book 1, Unit 2.', category: 'textbook' },
  { id: 'ren_jiao_1_3', name: '人教版一年级上册 (第三单元)', promptContext: 'Create a list of characters from the People\'s Education Press (RenJiao) Grade 1 Book 1, Unit 3.', category: 'textbook' },
  { id: 'ren_jiao_1_4', name: '人教版一年级上册 (第四单元)', promptContext: 'Create a list of characters from the People\'s Education Press (RenJiao) Grade 1 Book 1, Unit 4.', category: 'textbook' },
  { id: 'radicals_basic', name: '基础偏旁部首', promptContext: 'List common Chinese radicals (Bu Shou) suitable for beginners.', category: 'structure' },
  { id: 'measure_words', name: '常用量词 (Common Measure Words)', promptContext: 'List common Chinese measure words suitable for Grade 1 students.', category: 'structure' },
  { id: 'nature', name: '大自然 (日月水火)', promptContext: 'List simple characters related to nature, elements, and weather.', category: 'fun' },
  { id: 'animals', name: '可爱动物', promptContext: 'List simple characters for animals.', category: 'fun' },
];
