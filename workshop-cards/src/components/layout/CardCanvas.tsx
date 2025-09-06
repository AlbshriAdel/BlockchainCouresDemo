'use client';

import { useDroppable } from '@dnd-kit/core';
import { Card, CardElement } from '@/types';
import { CardElementRenderer } from '../card-elements/CardElementRenderer';

interface CardCanvasProps {
  card: Card;
  selectedElement: CardElement | null;
  onSelectElement: (element: CardElement | null) => void;
  onUpdateElement: (elementId: string, updates: Partial<CardElement>) => void;
  onDeleteElement: (elementId: string) => void;
}

export function CardCanvas({
  card,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
}: CardCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'card-canvas',
  });

  const handleElementClick = (element: CardElement, event: React.MouseEvent) => {
    event.stopPropagation();
    onSelectElement(element);
  };

  const handleCanvasClick = () => {
    onSelectElement(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Delete' && selectedElement) {
      onDeleteElement(selectedElement.id);
    }
  };

  return (
    <div className="flex justify-center">
      <div
        ref={setNodeRef}
        id="card-canvas"
        className={`
          relative border-2 border-dashed border-gray-300 rounded-lg
          ${isOver ? 'border-blue-400 bg-blue-50' : 'bg-white'}
        `}
        style={{
          width: card.size.width,
          height: card.size.height,
          backgroundColor: card.backgroundColor,
        }}
        onClick={handleCanvasClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Grid overlay for alignment */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #000 1px, transparent 1px),
              linear-gradient(to bottom, #000 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Render card elements */}
        {card.elements.map((element) => (
          <div
            key={element.id}
            className={`
              absolute cursor-pointer
              ${selectedElement?.id === element.id ? 'ring-2 ring-blue-500' : ''}
            `}
            style={{
              left: element.position.x,
              top: element.position.y,
              width: element.size.width,
              height: element.size.height,
              zIndex: element.zIndex,
            }}
            onClick={(e) => handleElementClick(element, e)}
          >
            <CardElementRenderer
              element={element}
              isSelected={selectedElement?.id === element.id}
              onUpdate={(updates) => onUpdateElement(element.id, updates)}
            />
            
            {/* Selection handles */}
            {selectedElement?.id === element.id && (
              <>
                {/* Corner resize handles */}
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-sw-resize" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize" />
                
                {/* Edge resize handles */}
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-n-resize" />
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-s-resize" />
                <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-w-resize" />
                <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-e-resize" />
              </>
            )}
          </div>
        ))}

        {/* Drop zone indicator */}
        {isOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-blue-100 border-2 border-blue-300 rounded-lg px-4 py-2 text-blue-700 font-medium">
              Drop element here
            </div>
          </div>
        )}

        {/* Empty state */}
        {card.elements.length === 0 && !isOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <div className="text-lg mb-2">Empty Card</div>
              <div className="text-sm">Drag elements from the palette to get started</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}