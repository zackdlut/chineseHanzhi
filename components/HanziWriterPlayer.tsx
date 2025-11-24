import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore - Importing from CDN via importmap
import HanziWriter from 'hanzi-writer';
import { Play, RotateCcw, PenTool, CheckCircle, XCircle } from 'lucide-react';

interface HanziWriterPlayerProps {
  char: string;
  gridColor: string;
}

export const HanziWriterPlayer: React.FC<HanziWriterPlayerProps> = ({ char, gridColor }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<any>(null);
  const [mode, setMode] = useState<'demo' | 'quiz'>('demo');
  const [feedback, setFeedback] = useState<string>('');
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup previous instance
    containerRef.current.innerHTML = '';
    setFeedback('');
    setScore(null);

    const writer = HanziWriter.create(containerRef.current, char, {
      width: 260,
      height: 260,
      padding: 10,
      showOutline: true,
      strokeAnimationSpeed: 1, // 1x speed
      delayBetweenStrokes: 200, // ms
      strokeColor: '#333333',
      radicalColor: '#166534', // Green for radicals
      outlineColor: '#DDD',
      drawingWidth: 20, // Thicker for kids
      showCharacter: true,
      showHintAfterMisses: 3,
      highlightOnComplete: true,
    });

    writerRef.current = writer;

    // Initial animation
    writer.animateCharacter();

    return () => {
      // Cleanup logic if library supports it, otherwise clearing innerHTML does most work
    };
  }, [char]);

  const handleAnimate = () => {
    if (!writerRef.current) return;
    setMode('demo');
    setFeedback('');
    setScore(null);
    writerRef.current.showCharacter();
    writerRef.current.showOutline();
    writerRef.current.animateCharacter();
  };

  const handleQuiz = () => {
    if (!writerRef.current) return;
    setMode('quiz');
    setFeedback('请开始描红...');
    setScore(null);
    
    // Hide the main character guide for quiz mode
    writerRef.current.hideCharacter();
    writerRef.current.showOutline();

    writerRef.current.quiz({
      onMistake: function(strokeData: any) {
        setFeedback('笔顺错误或出格了，再试一次！');
      },
      onCorrectStroke: function(strokeData: any) {
        setFeedback('很棒！继续下一笔。');
      },
      onComplete: function(summaryData: any) {
        setFeedback('完成！');
        // Simple scoring based on total mistakes
        const mistakes = summaryData.totalMistakes;
        const finalScore = Math.max(0, 100 - (mistakes * 10));
        setScore(finalScore);
      }
    });
  };

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between w-full items-center mb-4">
        <h3 className="text-2xl font-kaiti font-bold text-slate-800">
            汉字演示: <span className="text-red-600 text-3xl">{char}</span>
        </h3>
        {score !== null && (
            <div className={`flex items-center gap-1 font-bold ${score > 80 ? 'text-green-600' : 'text-orange-500'}`}>
                {score > 80 ? <CheckCircle size={20} /> : <XCircle size={20} />}
                {score}分
            </div>
        )}
      </div>

      <div 
        className="relative bg-slate-50 border-2 rounded-lg mb-6 shadow-inner"
        style={{ borderColor: gridColor }}
      >
        {/* Background Grid CSS (TianZiGe) */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
             <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-red-500"></div>
             <div className="absolute left-1/2 top-0 h-full border-l border-dashed border-red-500"></div>
             <svg className="absolute inset-0 w-full h-full" style={{ stroke: 'red', strokeWidth: 1 }}>
                  <line x1="0" y1="0" x2="100%" y2="100%" strokeDasharray="4" />
                  <line x1="100%" y1="0" x2="0" y2="100%" strokeDasharray="4" />
             </svg>
        </div>
        
        {/* Hanzi Writer Container */}
        <div ref={containerRef} className="hanzi-target" />
      </div>

      <div className="w-full text-center h-8 mb-2 font-medium text-slate-600">
         {feedback}
      </div>

      <div className="flex gap-4 w-full">
        <button
          onClick={handleAnimate}
          className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition ${
             mode === 'demo' 
             ? 'bg-slate-800 text-white shadow-md' 
             : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Play size={18} />
          演示笔顺
        </button>
        <button
          onClick={handleQuiz}
          className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition ${
             mode === 'quiz' 
             ? 'bg-red-600 text-white shadow-md' 
             : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <PenTool size={18} />
          描红练习
        </button>
      </div>
    </div>
  );
};
