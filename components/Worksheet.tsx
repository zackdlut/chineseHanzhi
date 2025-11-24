
import React from 'react';
import { CharacterData, SheetSettings, PracticeMode } from '../types';
import { GridCell } from './GridCell';

interface WorksheetProps {
  data: CharacterData[];
  settings: SheetSettings;
}

export const Worksheet: React.FC<WorksheetProps> = ({ data, settings }) => {
  // A4 paper logic
  // Grid size is 80px. 
  // Height calculation with Pinyin Grid (h-10 = 40px):
  // Row Height: 80px (box) + 40px (pinyin) + 16px (gap) = ~136px
  // Available height for rows: ~232mm
  // 136px is approx 36mm.
  // 232 / 36 = ~6.4.
  // We reduce rows per page to 6 to fit the new Pinyin grid comfortably.
  
  const COLUMNS = 8;
  const ROWS_PER_PAGE = 6; 

  // Helper to chunk data
  const chunkArray = <T,>(array: T[], size: number): T[][] => {
    if (array.length === 0) return [];
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  const pages: CharacterData[][] = data.length > 0 ? chunkArray(data, ROWS_PER_PAGE) : [[]];

  return (
    <div id="worksheet-container" className="w-full flex flex-col items-center gap-8 print:block print:gap-0">
      {pages.map((pageData, pageIndex) => (
        <div 
          key={pageIndex}
          className="bg-white shadow-xl print:shadow-none mx-auto relative page-break-container" 
          style={{ 
             width: '210mm', 
             minHeight: '297mm', 
             padding: '15mm',
             boxSizing: 'border-box',
             breakAfter: 'page', // Modern syntax
             pageBreakAfter: 'always' // Legacy syntax fallback
          }}
        >
          
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
          <div className="flex flex-col gap-6">
            {pageData.length === 0 && pageIndex === 0 && (
               <div className="text-center text-gray-300 py-20 font-kaiti text-xl border-2 border-dashed border-gray-200 rounded-xl m-8">
                 在此处预览字帖内容... <br/>
                 (请在左侧输入文字或选择预设)
               </div>
            )}

            {pageData.map((item, index) => (
              <div key={`${item.char}-${index}`} className="flex flex-row justify-between items-end">
                 {/* Render Columns */}
                 {Array.from({ length: COLUMNS }).map((_, colIndex) => {
                   const isHeader = colIndex === 0;
                   
                   let cellMode = settings.mode;
                   
                   // Logic for "Fill" mode: First 3 are trace, rest empty
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
                       showPinyinGrid={settings.showPinyinGrid}
                     />
                   );
                 })}
              </div>
            ))}
          </div>

          {/* Page Footer */}
          <div className="absolute bottom-6 left-0 w-full text-center text-xs text-gray-400 font-sans print:text-gray-500">
             第 {pageIndex + 1} 页 / 共 {pages.length} 页
          </div>
        </div>
      ))}
      
      {/* Screen-only styling for the gap/background */}
      <style>{`
        @media print {
          @page {
            margin: 0;
            size: A4 portrait;
          }
          body {
            background: white;
          }
          .page-break-container {
            margin: 0;
            box-shadow: none;
            border: none;
            width: 100%;
            height: 297mm; /* Force full height to ensure even breaks */
            overflow: hidden;
          }
        }
      `}</style>
    </div>
  );
};