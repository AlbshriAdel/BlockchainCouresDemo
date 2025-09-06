'use client';

import { CardElement } from '@/types';
import { Star, Heart, Circle, Square, Triangle, Zap, Sun, Moon } from 'lucide-react';

interface IconProps {
  element: CardElement;
  isSelected: boolean;
  onUpdate: (updates: Partial<CardElement>) => void;
}

const iconMap = {
  star: Star,
  heart: Heart,
  circle: Circle,
  square: Square,
  triangle: Triangle,
  zap: Zap,
  sun: Sun,
  moon: Moon,
};

export function Icon({ element }: IconProps) {
  const {
    iconName = 'star',
    size = 24,
    color = '#6b7280',
    backgroundColor = 'transparent',
    borderRadius = 0,
    padding = 8,
  } = element.properties;

  const IconComponent = iconMap[iconName as keyof typeof iconMap] || Star;

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        backgroundColor,
        borderRadius: `${borderRadius}px`,
        padding: `${padding}px`,
      }}
    >
      <IconComponent
        size={size}
        color={color}
      />
    </div>
  );
}