'use client';

import { useState } from 'react';
import { Card } from '@/types';
import { Printer, Download, Eye, Settings, Copy } from 'lucide-react';

interface PrintManagerProps {
  card: Card;
}

interface PrintSettings {
  copies: number;
  paperSize: 'A4' | 'Letter' | 'A5' | 'Custom';
  orientation: 'portrait' | 'landscape';
  cardsPerPage: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  includeBleedArea: boolean;
  printQuality: 'draft' | 'normal' | 'high';
}

export function PrintManager({ card }: PrintManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<PrintSettings>({
    copies: 1,
    paperSize: 'A4',
    orientation: 'portrait',
    cardsPerPage: 4,
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    includeBleedArea: false,
    printQuality: 'normal',
  });

  const handlePrint = () => {
    const printContent = generatePrintHTML();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const handlePreview = () => {
    const printContent = generatePrintHTML();
    const previewWindow = window.open('', '_blank');
    if (!previewWindow) return;
    
    previewWindow.document.write(printContent);
    previewWindow.document.close();
  };

  const generatePrintHTML = (): string => {
    const { cardsPerPage, margins, paperSize, orientation } = settings;
    
    const paperSizes = {
      A4: { width: 210, height: 297 },
      Letter: { width: 216, height: 279 },
      A5: { width: 148, height: 210 },
      Custom: { width: 210, height: 297 },
    };
    
    const paper = paperSizes[paperSize];
    const availableWidth = paper.width - margins.left - margins.right;
    const availableHeight = paper.height - margins.top - margins.bottom;
    
    const cols = Math.ceil(Math.sqrt(cardsPerPage));
    const rows = Math.ceil(cardsPerPage / cols);
    
    const cardWidth = availableWidth / cols;
    const cardHeight = availableHeight / rows;
    
    const scaleX = (cardWidth * 3.78) / card.size.width;
    const scaleY = (cardHeight * 3.78) / card.size.height;
    const scale = Math.min(scaleX, scaleY, 1);
    
    const scaledWidth = card.size.width * scale;
    const scaledHeight = card.size.height * scale;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Print Cards - ${card.name}</title>
  <style>
    @page {
      size: ${paperSize} ${orientation};
      margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: white;
    }
    
    .print-container {
      width: 100%;
      height: 100vh;
      display: grid;
      grid-template-columns: repeat(${cols}, 1fr);
      grid-template-rows: repeat(${rows}, 1fr);
      gap: 5mm;
      padding: 0;
    }
    
    .card-container {
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px dashed #ccc;
      position: relative;
    }
    
    .card {
      width: ${scaledWidth}px;
      height: ${scaledHeight}px;
      background: ${card.backgroundColor};
      position: relative;
      border: 1px solid #ddd;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .element {
      position: absolute;
      font-family: inherit;
    }
    
    .name-label {
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      padding: 8px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .text-field {
      border: 1px solid #d1d5db;
      border-radius: 4px;
      padding: 8px;
      background: white;
    }
    
    .text-area {
      border: 1px solid #d1d5db;
      border-radius: 4px;
      padding: 8px;
      background: white;
      resize: none;
    }
    
    .table {
      border-collapse: collapse;
      width: 100%;
    }
    
    .table th,
    .table td {
      border: 1px solid #d1d5db;
      padding: 4px 8px;
      text-align: left;
    }
    
    .table th {
      background: #f9fafb;
      font-weight: 600;
    }
    
    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .qr-code {
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border: 1px solid #000;
    }
    
    @media print {
      .card-container {
        border: none;
      }
      
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="print-container">
    ${Array.from({ length: settings.copies }, (_, copyIndex) => 
      Array.from({ length: cardsPerPage }, (_, cardIndex) => `
        <div class="card-container">
          <div class="card">
            ${card.elements.map(element => {
              const scaledX = element.position.x * scale;
              const scaledY = element.position.y * scale;
              const scaledWidth = element.size.width * scale;
              const scaledHeight = element.size.height * scale;
              
              return `
                <div class="element ${element.type.toLowerCase().replace('_', '-')}" 
                     style="left: ${scaledX}px; top: ${scaledY}px; width: ${scaledWidth}px; height: ${scaledHeight}px; font-size: ${(element.properties.fontSize || 14) * scale}px; color: ${element.properties.color || '#000'};">
                  ${generateElementHTML(element, scale)}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `).join('')
    ).join('')}
  </div>
</body>
</html>
    `;
  };

  const generateElementHTML = (element: any, scale: number): string => {
    switch (element.type) {
      case 'NAME_LABEL':
        return `${element.properties.text || 'Name'}`;
      
      case 'TEXT_FIELD':
        return `<div style="width: 100%; height: 100%; border: none; background: transparent; font-size: inherit; color: inherit; display: flex; align-items: center;">${element.properties.placeholder || 'Enter text...'}</div>`;
      
      case 'TEXT_AREA':
        return `<div style="width: 100%; height: 100%; border: none; background: transparent; font-size: inherit; color: inherit; overflow: hidden;">${element.properties.placeholder || 'Enter text...'}</div>`;
      
      case 'TABLE':
        const rows = element.properties.rows || 2;
        const cols = element.properties.columns || 2;
        return `
          <table class="table" style="width: 100%; height: 100%;">
            ${Array.from({ length: rows }, (_, rowIndex) => `
              <tr>
                ${Array.from({ length: cols }, (_, colIndex) => `
                  <${rowIndex === 0 ? 'th' : 'td'}>${rowIndex === 0 ? `Header ${colIndex + 1}` : ''}</${rowIndex === 0 ? 'th' : 'td'}>
                `).join('')}
              </tr>
            `).join('')}
          </table>
        `;
      
      case 'ICON':
        return `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: ${24 * scale}px;">⭐</div>`;
      
      case 'QR_CODE':
        return `<div style="width: 100%; height: 100%; background: white; border: 2px solid #000; display: flex; align-items: center; justify-content: center; font-size: ${12 * scale}px;">QR CODE<br/>${(element.properties.data || '').substring(0, 20)}...</div>`;
      
      default:
        return `<div>${element.type}</div>`;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <Printer className="w-4 h-4" />
        <span>Print Cards</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Print Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Basic Settings</h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Number of Copies</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={settings.copies}
                      onChange={(e) => setSettings(prev => ({ ...prev, copies: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Paper Size</label>
                    <select
                      value={settings.paperSize}
                      onChange={(e) => setSettings(prev => ({ ...prev, paperSize: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="A4">A4 (210 × 297 mm)</option>
                      <option value="Letter">Letter (8.5 × 11 in)</option>
                      <option value="A5">A5 (148 × 210 mm)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Orientation</label>
                    <select
                      value={settings.orientation}
                      onChange={(e) => setSettings(prev => ({ ...prev, orientation: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Cards per Page</label>
                    <select
                      value={settings.cardsPerPage}
                      onChange={(e) => setSettings(prev => ({ ...prev, cardsPerPage: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="1">1 card per page</option>
                      <option value="2">2 cards per page</option>
                      <option value="4">4 cards per page</option>
                      <option value="6">6 cards per page</option>
                      <option value="9">9 cards per page</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Advanced Settings</h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Margins (mm)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Top"
                        value={settings.margins.top}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          margins: { ...prev.margins, top: parseInt(e.target.value) || 0 }
                        }))}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Right"
                        value={settings.margins.right}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          margins: { ...prev.margins, right: parseInt(e.target.value) || 0 }
                        }))}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Bottom"
                        value={settings.margins.bottom}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          margins: { ...prev.margins, bottom: parseInt(e.target.value) || 0 }
                        }))}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Left"
                        value={settings.margins.left}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          margins: { ...prev.margins, left: parseInt(e.target.value) || 0 }
                        }))}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Print Quality</label>
                    <select
                      value={settings.printQuality}
                      onChange={(e) => setSettings(prev => ({ ...prev, printQuality: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">Draft (Fast)</option>
                      <option value="normal">Normal</option>
                      <option value="high">High Quality</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="includeBleedArea"
                      checked={settings.includeBleedArea}
                      onChange={(e) => setSettings(prev => ({ ...prev, includeBleedArea: e.target.checked }))}
                      className="mr-2"
                    />
                    <label htmlFor="includeBleedArea" className="text-sm">
                      Include bleed area (3mm)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                Total cards: {settings.copies * settings.cardsPerPage}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePreview}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}