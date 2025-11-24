
import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore - Importing from CDN via importmap
import HanziWriter from 'hanzi-writer';
import { Play, PenTool, CheckCircle, XCircle, MessageCircleHeart, Loader2, Palette } from 'lucide-react';
import { generateHandwritingFeedback } from '../services/geminiService';

interface HanziWriterPlayerProps {
  char: string;
  gridColor: string;
}

const RAINBOW_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

export const HanziWriterPlayer: React.FC<HanziWriterPlayerProps> = ({ char, gridColor }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<any>(null);
  const [mode, setMode] = useState<'demo' | 'quiz'>('demo');
  const [feedback, setFeedback] = useState<string>('');
  const [score, setScore] = useState<number | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [strokeCount, setStrokeCount] = useState<number>(0);
  const [isRainbow, setIsRainbow] = useState<boolean>(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup previous instance
    containerRef.current.innerHTML = '';
    setFeedback('');
    setScore(null);
    setIsEvaluating(false);

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
      onLoadCharDataSuccess: (data: any) => {
        setStrokeCount(data.strokes.length);
      }
    });

    writerRef.current = writer;

    // Initial animation
    writer.animateCharacter();

    return () => {
      // Cleanup logic if library supports it, otherwise clearing innerHTML does most work
    };
  }, [char]);

  const handleAnimate = async () => {
    if (!writerRef.current) return;
    const writer = writerRef.current;
    
    setMode('demo');
    setFeedback('');
    setScore(null);
    setIsEvaluating(false);

    if (isRainbow && strokeCount > 0) {
        // Rainbow Mode: Manual stroke-by-stroke animation with color updates
        writer.hideCharacter();
        writer.showOutline();
        
        for (let i = 0; i < strokeCount; i++) {
            // "Chameleon Effect": Update the global ink color for each stroke.
            // This changes previously drawn strokes too, creating a fun dynamic color shift.
            const color = RAINBOW_COLORS[i % RAINBOW_COLORS.length];
            writer.updateColor('strokeColor', color);
            
            // Animate specific stroke and wait for it
            await writer.animateStroke(i);
        }
        
        // Optional: Reset to standard color at the end? 
        // Let's keep the last color as it looks cool, or reset to black after a delay.
        // writer.updateColor('strokeColor', '#333333');
        
    } else {
        // Standard Mode
        writer.updateColor('strokeColor', '#333333');
        writer.showCharacter();
        writer.showOutline();
        writer.animateCharacter();
    }
  };

  const handleQuiz = () => {
    if (!writerRef.current) return;
    setMode('quiz');
    setFeedback('请拿起“笔”开始描红吧...');
    setScore(null);
    setIsEvaluating(false);
    
    // Ensure color is standard for quiz
    writerRef.current.updateColor('strokeColor', '#333333');
    
    // Hide the main character guide for quiz mode
    writerRef.current.hideCharacter();
    writerRef.current.showOutline();

    writerRef.current.quiz({
      onMistake: function(strokeData: any) {
        // Real-time simple feedback
        // We don't update main feedback state here to avoid distracting the user too much
      },
      onCorrectStroke: function(strokeData: any) {
        // Optional: play sound or subtle visual cue
      },
      onComplete: async function(summaryData: any) {
        const mistakes = summaryData.totalMistakes;
        
        // Calculate score (simple algorithm)
        const finalScore = Math.max(0, 100 - (mistakes * 5));
        setScore(finalScore);

        // Start Detailed Evaluation
        setFeedback(''); // Clear prompt
        setIsEvaluating(true);
        
        // Extract mistake data
        // summaryData.mistakesOnStroke is an object: { strokeIndex: count }
        const mistakesOnStroke = summaryData.mistakesOnStroke || {};
        const missedIndices = Object.keys(mistakesOnStroke)
            .map(Number)
            .filter(i => mistakesOnStroke[i] > 0);

        try {
            const detailedComment = await generateHandwritingFeedback(char, mistakes, missedIndices);
            setFeedback(detailedComment);
        } catch (e) {
            setFeedback(mistakes === 0 ? "写得真棒！笔画非常流畅。" : "继续加油，注意笔顺哦！");
        } finally {
            setIsEvaluating(false);
        }
      }
    });
  };

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full">
      <div className="flex justify-between w-full items-center mb-4">
        <h3 className="text-2xl font-kaiti font-bold text-slate-800">
            汉字演示: <span className="text-red-600 text-3xl">{char}</span>
        </h3>
        {score !== null && (
            <div className={`flex items-center gap-1 font-bold animate-pulse ${score > 80 ? 'text-green-600' : 'text-orange-500'}`}>
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

      {/* Feedback Section */}
      <div className="w-full min-h-[4rem] mb-4 bg-yellow-50 rounded-xl p-3 border border-yellow-100 flex items-start gap-3">
         <div className="mt-0.5 text-yellow-600">
             {isEvaluating ? <Loader2 size={20} className="animate-spin" /> : <MessageCircleHeart size={20} />}
         </div>
         <div className="flex-1">
             <h4 className="text-xs font-bold text-yellow-700 uppercase mb-0.5">老师点评</h4>
             <p className="text-sm text-slate-700 font-medium leading-relaxed">
                 {isEvaluating ? "老师正在仔细看你的字..." : (feedback || (mode === 'quiz' ? "加油！认真写好每一笔。" : "点击“演示笔顺”观看动画"))}
             </p>
         </div>
      </div>
      
      {/* Controls */}
      <div className="w-full space-y-3">
        {/* Rainbow Toggle */}
        <div className="flex justify-end">
            <button 
                onClick={() => setIsRainbow(!isRainbow)}
                className={`text-xs flex items-center gap-1.5 px-2 py-1 rounded-full transition-colors ${isRainbow ? 'bg-purple-100 text-purple-700' : 'text-slate-400 hover:bg-slate-100'}`}
                title="开启彩虹笔顺演示"
            >
                <Palette size={14} />
                {isRainbow ? '彩虹笔顺: 开启' : '彩虹笔顺: 关闭'}
            </button>
        </div>

        <div className="flex gap-4 w-full">
            <button
            onClick={handleAnimate}
            disabled={isEvaluating}
            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition font-semibold text-sm ${
                mode === 'demo' 
                ? 'bg-slate-800 text-white shadow-lg ring-2 ring-slate-800 ring-offset-2' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            >
            <Play size={18} fill="currentColor" />
            演示
            </button>
            <button
            onClick={handleQuiz}
            disabled={isEvaluating}
            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition font-semibold text-sm ${
                mode === 'quiz' 
                ? 'bg-red-500 text-white shadow-lg ring-2 ring-red-500 ring-offset-2' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            >
            <PenTool size={18} />
            描红
            </button>
        </div>
      </div>
    </div>
  );
};
