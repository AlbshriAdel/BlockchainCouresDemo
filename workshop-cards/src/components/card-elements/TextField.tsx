'use client';

import { CardElement } from '@/types';

interface TextFieldProps {
  element: CardElement;
  isSelected: boolean;
  onUpdate: (updates: Partial<CardElement>) => void;
}

export function TextField({ element }: TextFieldProps) {
  const {
    placeholder = 'Enter text...',
    label,
    fontSize = 14,
    borderColor = '#d1d5db',
    borderWidth = 1,
    borderRadius = 4,
    padding = 8,
    backgroundColor = '#ffffff',
  } = element.properties;

  return (
    <div className="w-full h-full">
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type="text"
        placeholder={placeholder}
        className="w-full h-full outline-none"
        style={{
          fontSize: `${fontSize}px`,
          borderColor,
          borderWidth: `${borderWidth}px`,
          borderStyle: 'solid',
          borderRadius: `${borderRadius}px`,
          padding: `${padding}px`,
          backgroundColor,
        }}
        readOnly
      />
    </div>
  );
}