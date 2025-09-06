'use client';

import { useDraggable } from '@dnd-kit/core';
import { 
  Type, 
  FileText, 
  AlignLeft, 
  Table, 
  Star, 
  QrCode,
  GripVertical 
} from 'lucide-react';
import { CardElement } from '@/types';

interface DraggableElementProps {
  elementType: CardElement['type'];
  icon: React.ReactNode;
  label: string;
  description: string;
}

function DraggableElement({ elementType, icon, label, description }: DraggableElementProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${elementType}`,
    data: {
      elementType,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        flex items-center p-3 border rounded-lg cursor-grab hover:bg-gray-50 transition-colors
        ${isDragging ? 'opacity-50' : ''}
      `}
    >
      <div className="flex items-center space-x-3 flex-1">
        <div className="text-gray-600">
          {icon}
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm">{label}</div>
          <div className="text-xs text-gray-500">{description}</div>
        </div>
      </div>
      <GripVertical className="w-4 h-4 text-gray-400" />
    </div>
  );
}

export function ElementPalette() {
  const elements: DraggableElementProps[] = [
    {
      elementType: 'name-label',
      icon: <Type className="w-5 h-5" />,
      label: 'Name Label',
      description: 'Participant name field',
    },
    {
      elementType: 'text-field',
      icon: <FileText className="w-5 h-5" />,
      label: 'Text Field',
      description: 'Single line input',
    },
    {
      elementType: 'text-area',
      icon: <AlignLeft className="w-5 h-5" />,
      label: 'Text Area',
      description: 'Multi-line input',
    },
    {
      elementType: 'table',
      icon: <Table className="w-5 h-5" />,
      label: 'Table',
      description: 'Data table',
    },
    {
      elementType: 'icon',
      icon: <Star className="w-5 h-5" />,
      label: 'Icon',
      description: 'Visual icon',
    },
    {
      elementType: 'qr-code',
      icon: <QrCode className="w-5 h-5" />,
      label: 'QR Code',
      description: 'Scannable QR code',
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 mb-4">
        Drag elements onto the card to add them
      </p>
      {elements.map((element) => (
        <DraggableElement
          key={element.elementType}
          {...element}
        />
      ))}
    </div>
  );
}