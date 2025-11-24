
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
  promptContext: string; // Context sent to Gemini OR raw text for user presets
  category: 'textbook' | 'structure' | 'fun' | 'literature' | 'user';
}

export const PRESETS: ContentPreset[] = [
  { id: 'custom', name: '自定义输入', promptContext: '', category: 'fun' },
  
  // Textbook (RenJiao Grade 1 Book 1)
  { id: 'ren_jiao_1_1', name: '人教版一年级上册 (第一单元)', promptContext: 'Create a list of characters from the People\'s Education Press (RenJiao) Grade 1 Book 1, Unit 1.', category: 'textbook' },
  { id: 'ren_jiao_1_2', name: '人教版一年级上册 (第二单元)', promptContext: 'Create a list of characters from the People\'s Education Press (RenJiao) Grade 1 Book 1, Unit 2.', category: 'textbook' },
  { id: 'ren_jiao_1_3', name: '人教版一年级上册 (第三单元)', promptContext: 'Create a list of characters from the People\'s Education Press (RenJiao) Grade 1 Book 1, Unit 3.', category: 'textbook' },
  { id: 'ren_jiao_1_4', name: '人教版一年级上册 (第四单元)', promptContext: 'Create a list of characters from the People\'s Education Press (RenJiao) Grade 1 Book 1, Unit 4.', category: 'textbook' },
  { id: 'ren_jiao_1_5', name: '人教版一年级上册 (第五单元)', promptContext: 'Create a list of characters from the People\'s Education Press (RenJiao) Grade 1 Book 1, Unit 5.', category: 'textbook' },
  { id: 'ren_jiao_1_6', name: '人教版一年级上册 (第六单元)', promptContext: 'Create a list of characters from the People\'s Education Press (RenJiao) Grade 1 Book 1, Unit 6.', category: 'textbook' },
  { id: 'ren_jiao_1_7', name: '人教版一年级上册 (第七单元)', promptContext: 'Create a list of characters from the People\'s Education Press (RenJiao) Grade 1 Book 1, Unit 7.', category: 'textbook' },
  { id: 'ren_jiao_1_8', name: '人教版一年级上册 (第八单元)', promptContext: 'Create a list of characters from the People\'s Education Press (RenJiao) Grade 1 Book 1, Unit 8.', category: 'textbook' },
  
  // Literature (Poems & Rhymes)
  { id: 'gushi_simple', name: '必背古诗 (咏鹅/画/静夜思)', promptContext: 'Extract key characters from simple Tang Poems suitable for Grade 1, such as Yong E, Hua, Jing Ye Si. Return distinct characters.', category: 'literature' },
  { id: 'erge_classic', name: '经典儿歌 (小兔子/两只老虎)', promptContext: 'Extract key characters from classic Chinese nursery rhymes like Little Rabbit (Xiao Tu Zi), Two Tigers. Return distinct characters.', category: 'literature' },
  { id: 'sanzijing', name: '国学启蒙 (三字经/百家姓)', promptContext: 'List simple characters from the beginning of San Zi Jing (Three Character Classic) or Bai Jia Xing.', category: 'literature' },

  // Structure
  { id: 'radicals_basic', name: '基础偏旁部首', promptContext: 'List common Chinese radicals (Bu Shou) suitable for beginners.', category: 'structure' },
  { id: 'measure_words', name: '常用量词 (只/个/头/条)', promptContext: 'List common Chinese measure words suitable for Grade 1 students.', category: 'structure' },
  
  // Fun Categories
  { id: 'nature', name: '大自然 (日月水火)', promptContext: 'List simple characters related to nature, elements, and weather.', category: 'fun' },
  { id: 'animals', name: '可爱动物', promptContext: 'List simple characters for animals.', category: 'fun' },
  { id: 'family', name: '我的家人', promptContext: 'List characters for family members and relationships (Baba, Mama, etc).', category: 'fun' },
  { id: 'colors', name: '五颜六色', promptContext: 'List characters for colors and visual descriptions.', category: 'fun' },
];
