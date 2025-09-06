'use client';

import { CardElement } from '@/types';
import QRCodeReact from 'react-qr-code';

interface QRCodeProps {
  element: CardElement;
  isSelected: boolean;
  onUpdate: (updates: Partial<CardElement>) => void;
}

export function QRCode({ element }: QRCodeProps) {
  const {
    data = 'https://example.com',
    backgroundColor = '#ffffff',
    foregroundColor = '#000000',
    errorCorrectionLevel = 'M',
    includeMargin = true,
  } = element.properties;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <QRCodeReact
        value={data}
        size={Math.min(element.size.width, element.size.height) - (includeMargin ? 16 : 0)}
        bgColor={backgroundColor}
        fgColor={foregroundColor}
        level={errorCorrectionLevel}
        includeMargin={includeMargin}
      />
    </div>
  );
}