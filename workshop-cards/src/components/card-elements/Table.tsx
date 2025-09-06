'use client';

import { CardElement } from '@/types';

interface TableProps {
  element: CardElement;
  isSelected: boolean;
  onUpdate: (updates: Partial<CardElement>) => void;
}

export function Table({ element }: TableProps) {
  const {
    rows = 3,
    columns = 2,
    headers = ['Column 1', 'Column 2'],
    borderColor = '#d1d5db',
    borderWidth = 1,
    cellPadding = 8,
    headerBackgroundColor = '#f9fafb',
    alternateRowColor = '#f9fafb',
  } = element.properties;

  const renderCell = (content: string, isHeader: boolean = false, rowIndex?: number) => (
    <td
      className="text-xs"
      style={{
        borderColor,
        borderWidth: `${borderWidth}px`,
        borderStyle: 'solid',
        padding: `${cellPadding}px`,
        backgroundColor: isHeader 
          ? headerBackgroundColor 
          : (rowIndex && rowIndex % 2 === 1 ? alternateRowColor : 'transparent'),
        fontWeight: isHeader ? 'bold' : 'normal',
      }}
    >
      {content}
    </td>
  );

  return (
    <div className="w-full h-full overflow-hidden">
      <table className="w-full h-full border-collapse">
        <thead>
          <tr>
            {Array.from({ length: columns }, (_, colIndex) => (
              <th key={colIndex} className="p-0">
                {renderCell(headers[colIndex] || `Column ${colIndex + 1}`, true)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows - 1 }, (_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }, (_, colIndex) => (
                <td key={colIndex} className="p-0">
                  {renderCell('', false, rowIndex)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}