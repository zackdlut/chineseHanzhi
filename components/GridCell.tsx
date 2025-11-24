import React from 'react';
import { GridType, PracticeMode } from '../types';

interface GridCellProps {
  char: string;
  pinyin: string;
  gridType: GridType;
  gridColor: string;
  charColor: string;
  mode: PracticeMode;
  isHeader?: boolean; // If true, always show character fully
}

export const GridCell: React.FC<GridCellProps> = ({
  char,
  pinyin,
  gridType,
  gridColor,
  charColor,
  mode,
  isHeader = false,
}) => {
  
  // Determine visibility based on mode
  // Trace: Show character, but lighter (handled by opacity in render)
  // Copy: Show character only if it's the header, otherwise empty
  // Fill: (Logic usually handled by parent to pass empty char, but here we can handle styling)
  
  const showChar = isHeader || mode === PracticeMode.Trace;
  const opacity = (!isHeader && mode === PracticeMode.Trace) ? 0.3 : 1;
  const displayChar = (mode === PracticeMode.Copy && !isHeader) ? '' : char;

  return (
    <div className="flex flex-col items-center" style={{ width: '80px' }}>
      {/* Pinyin Area */}
      <div className="h-6 w-full flex items-end justify-center text-sm font-sans mb-0.5 text-gray-600">
        {isHeader ? pinyin : ''} 
        {/* We generally only show pinyin on the first column/header in strict copybooks, 
            but for this generator, let's keep it clean: Show pinyin if char is shown or always? 
            Let's show pinyin only on the header to reduce clutter for writing. */}
      </div>

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
                    opacity: opacity,
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
