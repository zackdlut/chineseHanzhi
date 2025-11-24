import React from 'react';
import { CharacterData, SheetSettings, PracticeMode } from '../types';
import { GridCell } from './GridCell';

interface WorksheetProps {
  data: CharacterData[];
  settings: SheetSettings;
}

export const Worksheet: React.FC<WorksheetProps> = ({ data, settings }) => {
  // A4 paper logic
  // A standard A4 is roughly 210mm x 297mm. 
  // In screen pixels (96dpi), that's ~794px x 1123px.
  // We use a fixed width container to simulate A4.

  // Rows per page calculation is tricky with dynamic content. 
  // We will generate a flex/grid layout that wraps.
  
  // We want to organize by "Rows". 
  // Each character from the input becomes a "Row" on the paper if we follow standard practice style:
  // [Char] [Copy] [Copy] [Copy] [Copy] ...
  
  // Grid size is 80px. A4 printable width with margins is approx 700px.
  // 700 / 80 = ~8 boxes per row.
  const COLUMNS = 8;
  const ROWS_PER_PAGE = 10; // 80px * 10 = 800px height + margins + title fit nicely on A4.

  // Chunk data into pages if needed, but for MVP we'll render one continuous scrollable area 
  // and let the print dialogue handle page breaks or limit input.
  // For a better UX, let's treat the entire `data` list as the source. 
  // Logic: For each character in `data`, render ONE row of practice.
  
  return (
    <div className="print-area bg-white mx-auto shadow-xl print:shadow-none" 
         style={{ 
             width: '210mm', 
             minHeight: '297mm', 
             padding: '15mm',
             boxSizing: 'border-box'
         }}>
      
      {/* Title Header */}
      <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
        <h1 className="text-3xl font-kaiti font-bold tracking-widest text-slate-900">
          {settings.title || "一年级语文生字练习"}
        </h1>
        <div className="flex justify-between mt-2 text-sm text-slate-500 font-sans">
            <span>班级: __________</span>
            <span>姓名: __________</span>
            <span>日期: __________</span>
            <span>评分: __________</span>
        </div>
      </div>

      {/* Grid Rows */}
      <div className="flex flex-col gap-4">
        {data.length === 0 && (
           <div className="text-center text-gray-300 py-20">
             在此处预览字帖内容... (请输入文字)
           </div>
        )}

        {data.map((item, index) => (
          <div key={`${item.char}-${index}`} className="flex flex-row justify-between items-end">
             {/* Render Columns */}
             {Array.from({ length: COLUMNS }).map((_, colIndex) => {
               // First column is the "Header" (Model character)
               const isHeader = colIndex === 0;
               
               // Logic for "Fill" mode: First 3 are trace, rest empty? 
               // Or let's stick to the settings.mode strictly.
               // Actually, usually headers are always fully visible.
               
               let cellMode = settings.mode;
               
               // If it's Fill mode, maybe first 3 are tracing, rest empty?
               if (settings.mode === PracticeMode.Fill) {
                 if (colIndex < 3) cellMode = PracticeMode.Trace;
                 else cellMode = PracticeMode.Copy;
               }

               return (
                 <GridCell
                   key={colIndex}
                   char={item.char}
                   pinyin={item.pinyin}
                   gridType={settings.gridType}
                   gridColor={settings.gridColor}
                   charColor={settings.charColor}
                   mode={cellMode}
                   isHeader={isHeader}
                 />
               );
             })}
          </div>
        ))}
      </div>
      
      {/* Footer / Page Number helper (optional) */}
      <div className="mt-8 text-center text-xs text-gray-300 print:hidden">
        —— 预览结束 ——
      </div>
    </div>
  );
};
