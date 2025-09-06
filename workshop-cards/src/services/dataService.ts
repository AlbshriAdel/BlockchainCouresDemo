import { Card, CardElement } from '@/types';

export interface WorkshopSession {
  id: string;
  name: string;
  description: string;
  cardTemplate: Card;
  participants: Participant[];
  responses: ParticipantResponse[];
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'active' | 'completed';
}

export interface Participant {
  id: string;
  name: string;
  email?: string;
  joinedAt: Date;
}

export interface ParticipantResponse {
  id: string;
  participantId: string;
  sessionId: string;
  cardId: string;
  elementResponses: ElementResponse[];
  scannedAt: Date;
  processedAt?: Date;
}

export interface ElementResponse {
  elementId: string;
  elementType: string;
  originalValue: any;
  scannedValue?: string;
  processedValue?: any;
  confidence?: number;
}

export interface CardTemplate {
  id: string;
  name: string;
  description: string;
  card: Card;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
}

class DataService {
  private readonly STORAGE_KEYS = {
    CARD_TEMPLATES: 'workshop-cards-templates',
    WORKSHOP_SESSIONS: 'workshop-cards-sessions',
    CURRENT_SESSION: 'workshop-cards-current-session',
    APP_SETTINGS: 'workshop-cards-settings',
  };

  // Card Template Management
  async saveCardTemplate(template: Omit<CardTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<CardTemplate> {
    const templates = this.getCardTemplates();
    const newTemplate: CardTemplate = {
      ...template,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    templates.push(newTemplate);
    this.saveToStorage(this.STORAGE_KEYS.CARD_TEMPLATES, templates);
    return newTemplate;
  }

  getCardTemplates(): CardTemplate[] {
    return this.getFromStorage(this.STORAGE_KEYS.CARD_TEMPLATES, []);
  }

  getCardTemplate(id: string): CardTemplate | null {
    const templates = this.getCardTemplates();
    return templates.find(t => t.id === id) || null;
  }

  updateCardTemplate(id: string, updates: Partial<CardTemplate>): CardTemplate | null {
    const templates = this.getCardTemplates();
    const index = templates.findIndex(t => t.id === id);
    
    if (index === -1) return null;
    
    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    this.saveToStorage(this.STORAGE_KEYS.CARD_TEMPLATES, templates);
    return templates[index];
  }

  deleteCardTemplate(id: string): boolean {
    const templates = this.getCardTemplates();
    const filteredTemplates = templates.filter(t => t.id !== id);
    
    if (filteredTemplates.length === templates.length) return false;
    
    this.saveToStorage(this.STORAGE_KEYS.CARD_TEMPLATES, filteredTemplates);
    return true;
  }

  // Workshop Session Management
  async createWorkshopSession(session: Omit<WorkshopSession, 'id' | 'createdAt' | 'updatedAt' | 'participants' | 'responses'>): Promise<WorkshopSession> {
    const sessions = this.getWorkshopSessions();
    const newSession: WorkshopSession = {
      ...session,
      id: this.generateId(),
      participants: [],
      responses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    sessions.push(newSession);
    this.saveToStorage(this.STORAGE_KEYS.WORKSHOP_SESSIONS, sessions);
    return newSession;
  }

  getWorkshopSessions(): WorkshopSession[] {
    return this.getFromStorage(this.STORAGE_KEYS.WORKSHOP_SESSIONS, []);
  }

  getWorkshopSession(id: string): WorkshopSession | null {
    const sessions = this.getWorkshopSessions();
    return sessions.find(s => s.id === id) || null;
  }

  updateWorkshopSession(id: string, updates: Partial<WorkshopSession>): WorkshopSession | null {
    const sessions = this.getWorkshopSessions();
    const index = sessions.findIndex(s => s.id === id);
    
    if (index === -1) return null;
    
    sessions[index] = {
      ...sessions[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    this.saveToStorage(this.STORAGE_KEYS.WORKSHOP_SESSIONS, sessions);
    return sessions[index];
  }

  deleteWorkshopSession(id: string): boolean {
    const sessions = this.getWorkshopSessions();
    const filteredSessions = sessions.filter(s => s.id !== id);
    
    if (filteredSessions.length === sessions.length) return false;
    
    this.saveToStorage(this.STORAGE_KEYS.WORKSHOP_SESSIONS, filteredSessions);
    return true;
  }

  // Current Session Management
  setCurrentSession(sessionId: string): void {
    this.saveToStorage(this.STORAGE_KEYS.CURRENT_SESSION, sessionId);
  }

  getCurrentSession(): WorkshopSession | null {
    const sessionId = this.getFromStorage(this.STORAGE_KEYS.CURRENT_SESSION, null);
    return sessionId ? this.getWorkshopSession(sessionId) : null;
  }

  clearCurrentSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEYS.CURRENT_SESSION);
    }
  }

  // Participant Management
  addParticipant(sessionId: string, participant: Omit<Participant, 'id' | 'joinedAt'>): Participant | null {
    const session = this.getWorkshopSession(sessionId);
    if (!session) return null;

    const newParticipant: Participant = {
      ...participant,
      id: this.generateId(),
      joinedAt: new Date(),
    };

    session.participants.push(newParticipant);
    this.updateWorkshopSession(sessionId, { participants: session.participants });
    return newParticipant;
  }

  // Response Management
  addParticipantResponse(response: Omit<ParticipantResponse, 'id' | 'scannedAt'>): ParticipantResponse | null {
    const session = this.getWorkshopSession(response.sessionId);
    if (!session) return null;

    const newResponse: ParticipantResponse = {
      ...response,
      id: this.generateId(),
      scannedAt: new Date(),
    };

    session.responses.push(newResponse);
    this.updateWorkshopSession(response.sessionId, { responses: session.responses });
    return newResponse;
  }

  getSessionResponses(sessionId: string): ParticipantResponse[] {
    const session = this.getWorkshopSession(sessionId);
    return session?.responses || [];
  }

  // Alias methods for compatibility
  getAllSessions(): WorkshopSession[] {
    return this.getWorkshopSessions();
  }

  getResponsesBySession(sessionId: string): ParticipantResponse[] {
    return this.getSessionResponses(sessionId);
  }

  // QR Code Data Management
  generateQRData(sessionId: string, cardId: string, elementId?: string): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const qrData = {
      type: 'workshop-card',
      sessionId,
      cardId,
      elementId,
      timestamp: Date.now(),
    };
    
    return `${baseUrl}/scan?data=${encodeURIComponent(JSON.stringify(qrData))}`;
  }

  parseQRData(qrString: string): any {
    try {
      const url = new URL(qrString);
      const dataParam = url.searchParams.get('data');
      return dataParam ? JSON.parse(decodeURIComponent(dataParam)) : null;
    } catch {
      // If it's not our format, return the raw string
      return { type: 'external', data: qrString };
    }
  }

  // Export/Import functionality
  exportSession(sessionId: string): string {
    const session = this.getWorkshopSession(sessionId);
    if (!session) throw new Error('Session not found');
    
    return JSON.stringify(session, null, 2);
  }

  exportAllData(): string {
    const data = {
      templates: this.getCardTemplates(),
      sessions: this.getWorkshopSessions(),
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<{ templates: number; sessions: number }> {
    try {
      const data = JSON.parse(jsonData);
      let templatesImported = 0;
      let sessionsImported = 0;

      if (data.templates && Array.isArray(data.templates)) {
        const existingTemplates = this.getCardTemplates();
        const newTemplates = [...existingTemplates];
        
        for (const template of data.templates) {
          if (!existingTemplates.find(t => t.id === template.id)) {
            newTemplates.push(template);
            templatesImported++;
          }
        }
        
        this.saveToStorage(this.STORAGE_KEYS.CARD_TEMPLATES, newTemplates);
      }

      if (data.sessions && Array.isArray(data.sessions)) {
        const existingSessions = this.getWorkshopSessions();
        const newSessions = [...existingSessions];
        
        for (const session of data.sessions) {
          if (!existingSessions.find(s => s.id === session.id)) {
            newSessions.push(session);
            sessionsImported++;
          }
        }
        
        this.saveToStorage(this.STORAGE_KEYS.WORKSHOP_SESSIONS, newSessions);
      }

      return { templates: templatesImported, sessions: sessionsImported };
    } catch (error) {
      throw new Error('Invalid data format');
    }
  }

  // Utility methods
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveToStorage(key: string, data: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  private getFromStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  // Clear all data (for development/testing)
  clearAllData(): void {
    if (typeof window !== 'undefined') {
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    }
  }
}

export const dataService = new DataService();