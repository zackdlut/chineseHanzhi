
import React from 'react';
import { GridType, PracticeMode } from '../types';

interface GridCellProps {
  char: string;
  pinyin: string;
  gridType: GridType;
  gridColor: string;
  charColor: string;
  mode: PracticeMode;
  isHeader?: boolean;
  showPinyinGrid?: boolean;
}

export const GridCell: React.FC<GridCellProps> = ({
  char,
  pinyin,
  gridType,
  gridColor,
  charColor,
  mode,
  isHeader = false,
  showPinyinGrid = false,
}) => {
  
  // --- Hanzi Logic ---
  // Trace: Show character, but lighter
  // Copy: Show character only if it's the header
  const showChar = isHeader || mode === PracticeMode.Trace;
  const charOpacity = (!isHeader && mode === PracticeMode.Trace) ? 0.3 : 1;
  const displayChar = (mode === PracticeMode.Copy && !isHeader) ? '' : char;

  // --- Pinyin Logic ---
  // If Grid is ON:
  // - Header: Show Pinyin (Dark)
  // - Trace: Show Pinyin (Light)
  // - Copy: Hide Pinyin (Empty Lines)
  // If Grid is OFF:
  // - Header: Show Pinyin (Dark)
  // - Trace/Copy: Hide Pinyin (Clean look)
  
  const showPinyinText = isHeader || (showPinyinGrid && mode === PracticeMode.Trace);
  const pinyinOpacity = (!isHeader && mode === PracticeMode.Trace) ? 0.3 : 1;
  const displayPinyin = showPinyinText ? pinyin : '';

  return (
    <div className="flex flex-col items-center" style={{ width: '80px' }}>
      
      {/* Pinyin Area */}
      {showPinyinGrid ? (
        // Four-Line Three-Space Grid (四线三格)
        <div className="w-full h-10 relative mb-1 flex items-center justify-center overflow-visible">
           {/* Lines */}
           <div className="absolute top-0 w-full border-t" style={{ borderColor: gridColor, opacity: 0.6 }}></div>
           <div className="absolute top-[33%] w-full border-t border-dashed" style={{ borderColor: gridColor, opacity: 0.4 }}></div>
           <div className="absolute top-[66%] w-full border-t border-dashed" style={{ borderColor: gridColor, opacity: 0.4 }}></div>
           <div className="absolute bottom-0 w-full border-t" style={{ borderColor: gridColor, opacity: 0.6 }}></div>
           
           {/* Text - Positioned to sit mainly in middle row, but font metrics vary */}
           <span 
             className="font-sans text-lg relative z-10 -mt-1 tracking-wider" 
             style={{ color: charColor, opacity: pinyinOpacity }}
           >
             {displayPinyin}
           </span>
        </div>
      ) : (
        // Simple Text Label (Old behavior)
        <div className="h-6 w-full flex items-end justify-center text-sm font-sans mb-0.5 text-gray-600">
           {isHeader ? pinyin : ''}
        </div>
      )}

      {/* Grid Box */}
      <div 
        className="relative w-[80px] h-[80px] border-2 flex items-center justify-center overflow-hidden"
        style={{ borderColor: gridColor }}
      >
        {/* Grid Lines */}
        <div className="absolute inset-0 pointer-events-none">
            {/* Horizontal Center */}
            <div className="absolute top-1/2 left-0 w-full border-t border-dashed" style={{ borderColor: gridColor, opacity: 0.5 }}></div>
            {/* Vertical Center */}
            <div className="absolute left-1/2 top-0 h-full border-l border-dashed" style={{ borderColor: gridColor, opacity: 0.5 }}></div>
            
            {gridType === GridType.MiZiGe && (
              <>
                {/* Diagonals */}
                <svg className="absolute inset-0 w-full h-full" style={{ stroke: gridColor, strokeOpacity: 0.5 }}>
                  <line x1="0" y1="0" x2="100%" y2="100%" strokeDasharray="4" strokeWidth="1" />
                  <line x1="100%" y1="0" x2="0" y2="100%" strokeDasharray="4" strokeWidth="1" />
                </svg>
              </>
            )}
        </div>

        {/* Character */}
        {displayChar && (
            <span 
                className="font-kaiti text-6xl leading-none z-10 relative select-none"
                style={{ 
                    color: charColor, 
                    opacity: charOpacity,
                    // Fine-tuning font centering for standard Chinese fonts
                    marginTop: '-4px' 
                }}
            >
                {displayChar}
            </span>
        )}
      </div>
    </div>
  );
};
