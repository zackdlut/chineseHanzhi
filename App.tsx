import React, { useState, useEffect, useCallback } from 'react';
import { getPinyinForText, generateGrade1Content } from './services/geminiService';
import { Worksheet } from './components/Worksheet';
import { HanziWriterPlayer } from './components/HanziWriterPlayer';
import { CharacterData, SheetSettings, GridType, PracticeMode, DifficultyLevel, PRESETS } from './types';
import { Printer, Settings, Wand2, Type, Eraser, BookOpen, MonitorPlay, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [inputText, setInputText] = useState<string>('你好世界');
  const [charData, setCharData] = useState<CharacterData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // App View Mode
  const [activeTab, setActiveTab] = useState<'print' | 'interactive'>('print');
  // Interactive Mode State
  const [interactiveCharIndex, setInteractiveCharIndex] = useState<number>(0);

  // Generation Settings
  const [selectedPresetId, setSelectedPresetId] = useState<string>('custom');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.Any);

  const [settings, setSettings] = useState<SheetSettings>({
    gridType: GridType.MiZiGe,
    gridColor: '#ef4444', // red-500
    charColor: '#1f2937', // gray-800
    title: '一年级语文生字练习',
    mode: PracticeMode.Trace,
  });

  const processText = useCallback(async (text: string) => {
    if (!text) {
      setCharData([]);
      return;
    }
    setLoading(true);
    try {
      const result = await getPinyinForText(text);
      setCharData(result);
      setInteractiveCharIndex(0); // Reset interactive view to first char
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle Preset Change
  const handlePresetChange = async (presetId: string) => {
    setSelectedPresetId(presetId);
    if (presetId === 'custom') {
        setInputText('');
        return;
    }

    const preset = PRESETS.find(p => p.id === presetId);
    if (preset) {
        setLoading(true);
        const text = await generateGrade1Content(preset.promptContext, difficulty);
        setInputText(text);
        await processText(text);
        setLoading(false);
    }
  };

  // Handle Difficulty Change (Regenerate if not custom)
  const handleDifficultyChange = async (level: DifficultyLevel) => {
    setDifficulty(level);
    if (selectedPresetId !== 'custom') {
        // Debounce or immediate? Let's do immediate for responsiveness but carefully
        const preset = PRESETS.find(p => p.id === selectedPresetId);
        if (preset) {
            setLoading(true);
            const text = await generateGrade1Content(preset.promptContext, level);
            setInputText(text);
            await processText(text);
            setLoading(false);
        }
    }
  };

  // Initial load
  useEffect(() => {
    processText(inputText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleSmartGenerate = async () => {
    setLoading(true);
    // Even in custom mode, we use a generic prompt with the difficulty
    const text = await generateGrade1Content("Generate random interesting words", difficulty);
    setInputText(text);
    await processText(text);
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* Sidebar Controls - Hidden on Print */}
      <aside className="no-print w-full md:w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 h-auto md:h-screen overflow-y-auto sticky top-0 shadow-lg z-20">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span className="bg-red-500 text-white p-1 rounded">笔</span>
            字帖生成器
          </h1>
          <p className="text-xs text-slate-400 mt-1">Grade 1 Chinese Practice</p>
        </div>

        {/* View Toggles */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
             <button
               onClick={() => setActiveTab('print')}
               className={`flex-1 py-1.5 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition ${
                 activeTab === 'print' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               <Printer size={14} /> 打印视图
             </button>
             <button
               onClick={() => setActiveTab('interactive')}
               className={`flex-1 py-1.5 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition ${
                 activeTab === 'interactive' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               <MonitorPlay size={14} /> 互动练习
             </button>
        </div>

        {/* Content Configuration */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
             <BookOpen size={16} />
             内容设置
          </div>

          {/* Preset Selector */}
          <div>
            <label className="text-xs text-slate-500 block mb-1">选择教材/分类</label>
            <select 
               value={selectedPresetId}
               onChange={(e) => handlePresetChange(e.target.value)}
               disabled={loading}
               className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
                <optgroup label="自由输入">
                    {PRESETS.filter(p => p.id === 'custom').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </optgroup>
                <optgroup label="教材同步">
                    {PRESETS.filter(p => p.category === 'textbook').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </optgroup>
                <optgroup label="趣味分类">
                    {PRESETS.filter(p => p.category !== 'textbook' && p.id !== 'custom').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </optgroup>
            </select>
          </div>

          {/* Difficulty Selector */}
          <div>
             <label className="text-xs text-slate-500 block mb-1">难度/筛选</label>
             <select
                value={difficulty}
                onChange={(e) => handleDifficultyChange(e.target.value as DifficultyLevel)}
                disabled={loading}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
             >
                <option value={DifficultyLevel.Any}>混合难度 (默认)</option>
                <option value={DifficultyLevel.Simple}>简单 (5画以内)</option>
                <option value={DifficultyLevel.Medium}>进阶 (5-8画)</option>
                <option value={DifficultyLevel.Complex}>挑战 (9画以上)</option>
                <option value={DifficultyLevel.StrokeFocus}>专项: 撇捺练习</option>
             </select>
          </div>

          {/* Custom Input */}
          {selectedPresetId === 'custom' && (
            <div className="space-y-2">
                <label className="text-xs text-slate-500 block">自定义内容</label>
                <textarea
                    className="w-full h-24 p-2 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-400 outline-none resize-none font-kaiti"
                    placeholder="输入汉字..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onBlur={() => processText(inputText)}
                />
                 <div className="flex gap-2">
                    <button 
                        onClick={() => processText(inputText)}
                        disabled={loading}
                        className="flex-1 bg-slate-800 text-white py-1.5 rounded hover:bg-slate-700 transition text-sm"
                    >
                        {loading ? '生成中...' : '更新'}
                    </button>
                    <button 
                        onClick={handleSmartGenerate}
                        disabled={loading}
                        className="px-3 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                        title="AI 帮我想几个字"
                    >
                        <Sparkles size={16} />
                    </button>
                </div>
            </div>
          )}
        </div>

        <hr className="border-slate-100" />

        {/* Visual Settings (Only relevant for Print mode usually, but grid affects both) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
             <Settings size={16} />
             外观设置
          </div>
          
          {/* Grid Type */}
          <div className="grid grid-cols-3 gap-2">
            {[
                { id: GridType.MiZiGe, label: '米字格' },
                { id: GridType.TianZiGe, label: '田字格' },
                { id: GridType.Square, label: '方格' },
            ].map(type => (
                <button
                key={type.id}
                onClick={() => setSettings({...settings, gridType: type.id})}
                className={`text-xs py-1.5 rounded border ${
                    settings.gridType === type.id 
                    ? 'bg-red-50 border-red-500 text-red-700 font-medium' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                >
                {type.label}
                </button>
            ))}
          </div>

          {activeTab === 'print' && (
             <>
                 {/* Print Specific: Mode & Title */}
                 <div>
                    <label className="text-xs text-slate-500 block mb-1">字帖标题</label>
                    <input 
                    type="text" 
                    value={settings.title}
                    onChange={(e) => setSettings({...settings, title: e.target.value})}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                    />
                </div>
                <div>
                    <label className="text-xs text-slate-500 block mb-1">练习模式</label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                        { id: PracticeMode.Trace, label: '描红' },
                        { id: PracticeMode.Fill, label: '渐隐' },
                        { id: PracticeMode.Copy, label: '临摹' },
                        ].map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => setSettings({...settings, mode: mode.id})}
                            className={`text-xs py-1.5 rounded border ${
                            settings.mode === mode.id 
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {mode.label}
                        </button>
                        ))}
                    </div>
                </div>
             </>
          )}

           {/* Colors */}
           <div className="flex gap-4">
            <div className="flex-1">
               <label className="text-xs text-slate-500 block mb-1">格线颜色</label>
               <div className="flex gap-2">
                  {['#ef4444', '#22c55e', '#3b82f6', '#94a3b8'].map(c => (
                     <button 
                       key={c} 
                       onClick={() => setSettings({...settings, gridColor: c})}
                       className={`w-6 h-6 rounded-full border-2 ${settings.gridColor === c ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                       style={{ backgroundColor: c }}
                     />
                  ))}
               </div>
            </div>
          </div>
        </div>

        {activeTab === 'print' && (
            <div className="mt-auto pt-6">
            <button 
                onClick={handlePrint}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition transform active:scale-95"
            >
                <Printer size={20} />
                打印字帖
            </button>
            </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-100 p-4 md:p-8 overflow-auto flex justify-center items-start">
         
         {activeTab === 'print' ? (
             <Worksheet data={charData} settings={settings} />
         ) : (
             /* Interactive Mode View */
             <div className="w-full max-w-4xl flex flex-col items-center">
                 {charData.length > 0 ? (
                     <div className="flex flex-col md:flex-row gap-8 items-start w-full">
                         {/* Selection List */}
                         <div className="w-full md:w-1/3 bg-white rounded-xl shadow p-4 max-h-[600px] overflow-y-auto">
                             <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <BookOpen size={18} /> 选择生字
                             </h3>
                             <div className="grid grid-cols-4 gap-2">
                                 {charData.map((item, idx) => (
                                     <button
                                        key={`${item.char}-${idx}`}
                                        onClick={() => setInteractiveCharIndex(idx)}
                                        className={`aspect-square flex flex-col items-center justify-center rounded border-2 text-xl font-kaiti transition ${
                                            interactiveCharIndex === idx 
                                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold transform scale-105' 
                                            : 'border-transparent hover:bg-slate-50 text-slate-600'
                                        }`}
                                     >
                                        <span className="text-xs text-gray-400 font-sans">{item.pinyin}</span>
                                        {item.char}
                                     </button>
                                 ))}
                             </div>
                         </div>

                         {/* Player Area */}
                         <div className="flex-1 flex flex-col items-center justify-center w-full">
                            <HanziWriterPlayer 
                                char={charData[interactiveCharIndex].char} 
                                gridColor={settings.gridColor}
                            />
                            <div className="mt-6 text-slate-500 text-sm max-w-md text-center">
                                小提示：点击“演示笔顺”观看动画，点击“描红练习”可以直接在屏幕上书写哦！
                            </div>
                         </div>
                     </div>
                 ) : (
                     <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                         <Wand2 size={48} className="mb-4 text-slate-300" />
                         <p>请先在左侧输入或生成生字内容...</p>
                     </div>
                 )}
             </div>
         )}
      </main>

      {/* Floating Action Button for Mobile Print */}
      {activeTab === 'print' && (
        <button 
            onClick={handlePrint}
            className="md:hidden fixed bottom-6 right-6 bg-red-600 text-white p-4 rounded-full shadow-2xl z-50 no-print"
        >
            <Printer size={24} />
        </button>
      )}

    </div>
  );
};

export default App;