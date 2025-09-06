export interface CardElement {
  id: string;
  type: 'name-label' | 'text-field' | 'text-area' | 'table' | 'icon' | 'qr-code';
  position: { x: number; y: number };
  size: { width: number; height: number };
  properties: Record<string, any>;
  zIndex: number;
}

export interface NameLabelProperties {
  text: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'semibold';
  color: string;
  backgroundColor?: string;
  borderRadius: number;
  padding: number;
}

export interface TextFieldProperties {
  placeholder: string;
  label?: string;
  fontSize: number;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  padding: number;
  backgroundColor: string;
}

export interface TextAreaProperties {
  placeholder: string;
  label?: string;
  rows: number;
  fontSize: number;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  padding: number;
  backgroundColor: string;
}

export interface TableProperties {
  rows: number;
  columns: number;
  headers: string[];
  borderColor: string;
  borderWidth: number;
  cellPadding: number;
  headerBackgroundColor: string;
  alternateRowColor?: string;
}

export interface IconProperties {
  iconName: string;
  size: number;
  color: string;
  backgroundColor?: string;
  borderRadius: number;
  padding: number;
}

export interface QRCodeProperties {
  data: string;
  size: number;
  backgroundColor: string;
  foregroundColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  includeMargin: boolean;
}

export interface Card {
  id: string;
  name: string;
  elements: CardElement[];
  size: { width: number; height: number };
  backgroundColor: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workshop {
  id: string;
  name: string;
  description: string;
  cards: Card[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ScannedData {
  id: string;
  cardId: string;
  workshopId: string;
  qrData: string;
  scannedText?: string;
  handwrittenData?: Record<string, string>;
  scannedAt: Date;
  participantId?: string;
}

export interface DragItem {
  type: string;
  elementType: CardElement['type'];
}

export interface DropResult {
  position: { x: number; y: number };
}