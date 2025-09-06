'use client';

import { Card, CardElement } from '@/types';
import { HexColorPicker } from 'react-colorful';
import { useState } from 'react';
import { Trash2, ChevronDown, ChevronRight } from 'lucide-react';

interface PropertiesPanelProps {
  selectedElement: CardElement | null;
  onUpdateElement: (elementId: string, updates: Partial<CardElement>) => void;
  card: Card;
  onUpdateCard: (card: Card) => void;
}

export function PropertiesPanel({
  selectedElement,
  onUpdateElement,
  card,
  onUpdateCard,
}: PropertiesPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    position: true,
    appearance: true,
    content: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!selectedElement) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">Card Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Card Name</label>
              <input
                type="text"
                value={card.name}
                onChange={(e) => onUpdateCard({ ...card, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Width</label>
                <input
                  type="number"
                  value={card.size.width}
                  onChange={(e) => onUpdateCard({
                    ...card,
                    size: { ...card.size, width: parseInt(e.target.value) || 400 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Height</label>
                <input
                  type="number"
                  value={card.size.height}
                  onChange={(e) => onUpdateCard({
                    ...card,
                    size: { ...card.size, height: parseInt(e.target.value) || 600 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Background Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={card.backgroundColor}
                  onChange={(e) => onUpdateCard({ ...card, backgroundColor: e.target.value })}
                  className="w-8 h-8 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={card.backgroundColor}
                  onChange={(e) => onUpdateCard({ ...card, backgroundColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center text-gray-500 text-sm">
          Select an element to edit its properties
        </div>
      </div>
    );
  }

  const updateProperty = (key: string, value: any) => {
    onUpdateElement(selectedElement.id, {
      properties: { ...selectedElement.properties, [key]: value }
    });
  };

  const updatePosition = (axis: 'x' | 'y', value: number) => {
    onUpdateElement(selectedElement.id, {
      position: { ...selectedElement.position, [axis]: value }
    });
  };

  const updateSize = (dimension: 'width' | 'height', value: number) => {
    onUpdateElement(selectedElement.id, {
      size: { ...selectedElement.size, [dimension]: value }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Element Properties</h3>
        <button
          onClick={() => {/* Handle delete */}}
          className="p-1 text-red-600 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Position & Size */}
      <div className="border rounded-lg">
        <button
          onClick={() => toggleSection('position')}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
        >
          <span className="font-medium">Position & Size</span>
          {expandedSections.position ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {expandedSections.position && (
          <div className="p-3 border-t space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">X</label>
                <input
                  type="number"
                  value={selectedElement.position.x}
                  onChange={(e) => updatePosition('x', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Y</label>
                <input
                  type="number"
                  value={selectedElement.position.y}
                  onChange={(e) => updatePosition('y', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Width</label>
                <input
                  type="number"
                  value={selectedElement.size.width}
                  onChange={(e) => updateSize('width', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Height</label>
                <input
                  type="number"
                  value={selectedElement.size.height}
                  onChange={(e) => updateSize('height', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Element-specific properties */}
      {renderElementProperties(selectedElement, updateProperty, expandedSections, toggleSection)}
    </div>
  );
}

function renderElementProperties(
  element: CardElement,
  updateProperty: (key: string, value: any) => void,
  expandedSections: Record<string, boolean>,
  toggleSection: (section: string) => void
) {
  switch (element.type) {
    case 'name-label':
      return (
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('content')}
            className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
          >
            <span className="font-medium">Content</span>
            {expandedSections.content ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {expandedSections.content && (
            <div className="p-3 border-t space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Text</label>
                <input
                  type="text"
                  value={element.properties.text || ''}
                  onChange={(e) => updateProperty('text', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Font Size</label>
                <input
                  type="number"
                  value={element.properties.fontSize || 16}
                  onChange={(e) => updateProperty('fontSize', parseInt(e.target.value) || 16)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Font Weight</label>
                <select
                  value={element.properties.fontWeight || 'normal'}
                  onChange={(e) => updateProperty('fontWeight', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="normal">Normal</option>
                  <option value="semibold">Semibold</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Text Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={element.properties.color || '#000000'}
                    onChange={(e) => updateProperty('color', e.target.value)}
                    className="w-8 h-8 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={element.properties.color || '#000000'}
                    onChange={(e) => updateProperty('color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      );

    case 'qr-code':
      return (
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('content')}
            className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
          >
            <span className="font-medium">QR Code Settings</span>
            {expandedSections.content ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {expandedSections.content && (
            <div className="p-3 border-t space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Data/URL</label>
                <textarea
                  value={element.properties.data || ''}
                  onChange={(e) => updateProperty('data', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Error Correction</label>
                <select
                  value={element.properties.errorCorrectionLevel || 'M'}
                  onChange={(e) => updateProperty('errorCorrectionLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="text-center text-gray-500 text-sm">
          Properties for {element.type} coming soon
        </div>
      );
  }
}