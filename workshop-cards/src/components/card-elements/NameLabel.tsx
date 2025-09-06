'use client';

import { CardElement } from '@/types';

interface NameLabelProps {
  element: CardElement;
  isSelected: boolean;
  onUpdate: (updates: Partial<CardElement>) => void;
}

export function NameLabel({ element }: NameLabelProps) {
  const {
    text = 'Name',
    fontSize = 16,
    fontWeight = 'semibold',
    color = '#000000',
    backgroundColor = '#f3f4f6',
    borderRadius = 4,
    padding = 8,
  } = element.properties;

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        backgroundColor,
        borderRadius: `${borderRadius}px`,
        padding: `${padding}px`,
      }}
    >
      <span
        style={{
          fontSize: `${fontSize}px`,
          fontWeight,
          color,
        }}
        className="text-center truncate"
      >
        {text}
      </span>
    </div>
  );
}