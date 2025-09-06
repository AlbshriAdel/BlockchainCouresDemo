'use client';

import { CardElement } from '@/types';
import { NameLabel } from './NameLabel';
import { TextField } from './TextField';
import { TextArea } from './TextArea';
import { Table } from './Table';
import { Icon } from './Icon';
import { QRCode } from './QRCode';

interface CardElementRendererProps {
  element: CardElement;
  isSelected: boolean;
  onUpdate: (updates: Partial<CardElement>) => void;
}

export function CardElementRenderer({ element, isSelected, onUpdate }: CardElementRendererProps) {
  const commonProps = {
    element,
    isSelected,
    onUpdate,
  };

  switch (element.type) {
    case 'name-label':
      return <NameLabel {...commonProps} />;
    case 'text-field':
      return <TextField {...commonProps} />;
    case 'text-area':
      return <TextArea {...commonProps} />;
    case 'table':
      return <Table {...commonProps} />;
    case 'icon':
      return <Icon {...commonProps} />;
    case 'qr-code':
      return <QRCode {...commonProps} />;
    default:
      return (
        <div className="w-full h-full bg-gray-200 border border-gray-400 rounded flex items-center justify-center text-xs text-gray-600">
          Unknown: {element.type}
        </div>
      );
  }
}