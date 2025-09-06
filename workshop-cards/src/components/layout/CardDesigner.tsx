'use client';

import { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { ElementPalette } from './ElementPalette';
import { CardCanvas } from './CardCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { TemplateManager } from './TemplateManager';
import { PrintManager } from '../print/PrintManager';
import { QRScanner } from '../scanner/QRScanner';
import { DataVisualization } from '../visualization/DataVisualization';
import { Card, CardElement } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export function CardDesigner() {
  const [activeCard, setActiveCard] = useState<Card>({
    id: uuidv4(),
    name: 'New Card',
    elements: [],
    size: { width: 400, height: 600 },
    backgroundColor: '#ffffff',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [selectedElement, setSelectedElement] = useState<CardElement | null>(null);
  const [draggedElement, setDraggedElement] = useState<any>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setDraggedElement(event.active.data.current);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.id === 'card-canvas') {
      const elementType = active.data.current?.elementType;
      if (elementType) {
        const rect = document.getElementById('card-canvas')?.getBoundingClientRect();
        if (rect) {
          const x = event.delta.x;
          const y = event.delta.y;
          
          const newElement: CardElement = {
            id: uuidv4(),
            type: elementType,
            position: { x: Math.max(0, x), y: Math.max(0, y) },
            size: getDefaultSize(elementType),
            properties: getDefaultProperties(elementType),
            zIndex: activeCard.elements.length,
          };

          setActiveCard(prev => ({
            ...prev,
            elements: [...prev.elements, newElement],
            updatedAt: new Date(),
          }));
        }
      }
    }
    
    setDraggedElement(null);
  }, [activeCard.elements.length]);

  const updateElement = useCallback((elementId: string, updates: Partial<CardElement>) => {
    setActiveCard(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === elementId ? { ...el, ...updates } : el
      ),
      updatedAt: new Date(),
    }));
    
    // Update selected element if it's the one being updated
    if (selectedElement && selectedElement.id === elementId) {
      setSelectedElement(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedElement]);

  const deleteElement = useCallback((elementId: string) => {
    setActiveCard(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== elementId),
      updatedAt: new Date(),
    }));
    setSelectedElement(null);
  }, []);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-[calc(100vh-200px)] gap-6">
        {/* Element Palette */}
        <div className="w-64 bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-lg font-semibold mb-4">Elements</h2>
          <ElementPalette />
        </div>

        {/* Card Canvas */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Card Design</h2>
            <div className="flex items-center space-x-4">
              <TemplateManager
                currentCard={activeCard}
                onLoadTemplate={setActiveCard}
                onSaveTemplate={() => {}}
              />
              <PrintManager card={activeCard} />
              <QRScanner 
                onScanComplete={(data) => console.log('Scanned:', data)}
              />
              <DataVisualization />
              <span className="text-sm text-gray-600">
                {activeCard.size.width} × {activeCard.size.height}px
              </span>
            </div>
          </div>
          <CardCanvas
            card={activeCard}
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
            onUpdateElement={updateElement}
            onDeleteElement={deleteElement}
          />
        </div>

        {/* Properties Panel */}
        <div className="w-80 bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-lg font-semibold mb-4">Properties</h2>
          <PropertiesPanel
            selectedElement={selectedElement}
            onUpdateElement={updateElement}
            card={activeCard}
            onUpdateCard={setActiveCard}
          />
        </div>
      </div>

      <DragOverlay>
        {draggedElement ? (
          <div className="bg-blue-100 border-2 border-blue-300 rounded p-2 text-sm">
            {draggedElement.elementType}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function getDefaultSize(elementType: CardElement['type']) {
  switch (elementType) {
    case 'name-label':
      return { width: 120, height: 30 };
    case 'text-field':
      return { width: 200, height: 40 };
    case 'text-area':
      return { width: 200, height: 80 };
    case 'table':
      return { width: 250, height: 150 };
    case 'icon':
      return { width: 40, height: 40 };
    case 'qr-code':
      return { width: 100, height: 100 };
    default:
      return { width: 100, height: 40 };
  }
}

function getDefaultProperties(elementType: CardElement['type']) {
  switch (elementType) {
    case 'name-label':
      return {
        text: 'Name',
        fontSize: 16,
        fontWeight: 'semibold',
        color: '#000000',
        backgroundColor: '#f3f4f6',
        borderRadius: 4,
        padding: 8,
      };
    case 'text-field':
      return {
        placeholder: 'Enter text...',
        label: 'Text Field',
        fontSize: 14,
        borderColor: '#d1d5db',
        borderWidth: 1,
        borderRadius: 4,
        padding: 8,
        backgroundColor: '#ffffff',
      };
    case 'text-area':
      return {
        placeholder: 'Enter text...',
        label: 'Text Area',
        rows: 3,
        fontSize: 14,
        borderColor: '#d1d5db',
        borderWidth: 1,
        borderRadius: 4,
        padding: 8,
        backgroundColor: '#ffffff',
      };
    case 'table':
      return {
        rows: 3,
        columns: 2,
        headers: ['Column 1', 'Column 2'],
        borderColor: '#d1d5db',
        borderWidth: 1,
        cellPadding: 8,
        headerBackgroundColor: '#f9fafb',
        alternateRowColor: '#f9fafb',
      };
    case 'icon':
      return {
        iconName: 'star',
        size: 24,
        color: '#6b7280',
        backgroundColor: 'transparent',
        borderRadius: 0,
        padding: 8,
      };
    case 'qr-code':
      return {
        data: 'https://example.com',
        size: 100,
        backgroundColor: '#ffffff',
        foregroundColor: '#000000',
        errorCorrectionLevel: 'M',
        includeMargin: true,
      };
    default:
      return {};
  }
}