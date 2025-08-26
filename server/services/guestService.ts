import { v4 as uuidv4 } from 'uuid';
import { storage } from '../storage';

interface DeviceSession {
  id: string;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  platform: 'web' | 'android' | 'ios';
  hasReceivedWelcomeDiamonds: boolean;
  messageDiamonds: number;
  preferredGender: 'male' | 'female' | 'both';
  accessibleCompanionIds: number[];
  createdAt: Date;
}

interface GuestSession {
  id: string;
  sessionId: string;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  platform: 'web' | 'android' | 'ios';
  createdAt: Date;
  messageDiamonds: number;
  preferredGender: 'male' | 'female' | 'both';
  accessibleCompanionIds: number[];
  hasReceivedWelcomeDiamonds: boolean;
}

class GuestService {
  private guestSessions: Map<string, GuestSession> = new Map();
  private deviceSessions: Map<string, DeviceSession> = new Map(); // Maps device fingerprint to device session
  private ipToSessionMap: Map<string, string> = new Map(); // Maps IP to current sessionId
  private availableFemaleCompanionIds: number[] = [];
  private availableMaleCompanionIds: number[] = [];
  
  constructor() {
    this.initializeCompanionIds();
  }
  
  private async initializeCompanionIds() {
    try {
      const companions = await storage.getAllCompanions();
      
      this.availableFemaleCompanionIds = companions
        .filter(c => c.gender === 'female' || (!c.gender && ['Sophia', 'Alex', 'Sanika', 'Ria', 'Emma', 'Ava', 'Lily', 'Maya', 'Amara', 'Yuki', 'Isabella', 'Zara', 'Aaliyah', 'Luna', 'Chen Wei', 'Priya', 'Natasha'].includes(c.name)))
        .map(c => c.id);
        
      this.availableMaleCompanionIds = companions
        .filter(c => c.gender === 'male' || (!c.gender && ['James'].includes(c.name)))
        .map(c => c.id);
        
      console.log(`Initialized guest service with ${this.availableFemaleCompanionIds.length} female and ${this.availableMaleCompanionIds.length} male companions`);
    } catch (error) {
      console.error('Error initializing companion IDs:', error);
      // Fallback to hardcoded IDs
      this.availableFemaleCompanionIds = [1, 2, 3, 5];
      this.availableMaleCompanionIds = [6, 7];
    }
  }
  
  /**
   * Get or create a guest session with device-based tracking to prevent diamond farming
   */
  getOrCreateGuestSessionByDevice(
    sessionId: string, 
    deviceFingerprint: string, 
    ipAddress: string,
    userAgent: string,
    platform: 'web' | 'android' | 'ios'
  ): GuestSession {
    // Check if this device already has a session
    const existingDeviceSession = this.deviceSessions.get(deviceFingerprint);
    
    if (existingDeviceSession) {
      // Update activity and return existing session with preserved diamonds
      existingDeviceSession.ipAddress = ipAddress;
      existingDeviceSession.userAgent = userAgent;
      
      const session: GuestSession = {
        id: uuidv4(),
        sessionId,
        deviceFingerprint,
        ipAddress,
        userAgent,
        platform,
        createdAt: new Date(),
        messageDiamonds: existingDeviceSession.messageDiamonds,
        preferredGender: existingDeviceSession.preferredGender,
        accessibleCompanionIds: existingDeviceSession.accessibleCompanionIds,
        hasReceivedWelcomeDiamonds: existingDeviceSession.hasReceivedWelcomeDiamonds
      };
      
      this.guestSessions.set(sessionId, session);
      return session;
    }
    
    // Check if current sessionId exists
    const currentSession = this.guestSessions.get(sessionId);
    if (currentSession) {
      return currentSession;
    }
    
    // Create new device session with 25 diamonds welcome bonus (only for truly new devices)
    const deviceSession: DeviceSession = {
      id: uuidv4(),
      deviceFingerprint,
      ipAddress,
      userAgent,
      platform,
      hasReceivedWelcomeDiamonds: true,
      messageDiamonds: 25, // Welcome bonus only for new devices
      preferredGender: 'both',
      accessibleCompanionIds: [...this.availableFemaleCompanionIds.slice(0, 3), ...this.availableMaleCompanionIds.slice(0, 2)],
      createdAt: new Date()
    };
    
    const session: GuestSession = {
      id: uuidv4(),
      sessionId,
      deviceFingerprint,
      ipAddress,
      userAgent,
      platform,
      createdAt: new Date(),
      messageDiamonds: deviceSession.messageDiamonds,
      preferredGender: deviceSession.preferredGender,
      accessibleCompanionIds: deviceSession.accessibleCompanionIds,
      hasReceivedWelcomeDiamonds: deviceSession.hasReceivedWelcomeDiamonds
    };
    
    this.deviceSessions.set(deviceFingerprint, deviceSession);
    this.guestSessions.set(sessionId, session);
    this.ipToSessionMap.set(ipAddress, sessionId);
    
    return session;
  }

  /**
   * Get or create a guest session with IP-based tracking to prevent diamond farming (legacy)
   */
  getOrCreateGuestSessionByIP(sessionId: string, ipAddress: string): GuestSession {
    return this.getOrCreateGuestSessionByDevice(sessionId, `ip_${ipAddress}`, ipAddress, 'unknown', 'web');
  }

  /**
   * Get or create a guest session with welcome bonus (legacy method)
   */
  getOrCreateGuestSession(sessionId: string): GuestSession {
    return this.getOrCreateGuestSessionByIP(sessionId, 'unknown');
  }
  
  /**
   * Update guest preferences
   */
  updateGuestPreferences(sessionId: string, preferredGender: 'male' | 'female' | 'both'): GuestSession | null {
    const session = this.guestSessions.get(sessionId);
    if (!session) {
      return null;
    }
    
    // Update preferred gender
    session.preferredGender = preferredGender;
    
    // Update accessible companion IDs based on gender preference
    if (preferredGender === 'female') {
      session.accessibleCompanionIds = this.availableFemaleCompanionIds.slice(0, 3);
    } else if (preferredGender === 'male') {
      session.accessibleCompanionIds = this.availableMaleCompanionIds.slice(0, 2);
    } else {
      // If 'both', give limited access to both genders
      session.accessibleCompanionIds = [
        ...this.availableFemaleCompanionIds.slice(0, 2),
        ...this.availableMaleCompanionIds.slice(0, 1)
      ];
    }
    
    // Update the session in the map
    this.guestSessions.set(sessionId, session);
    
    return session;
  }
  
  /**
   * Use diamonds for message
   */
  useDiamonds(sessionId: string, count: number = 1): { success: boolean, remainingDiamonds?: number, error?: string } {
    const session = this.guestSessions.get(sessionId);
    if (!session) {
      return { success: false, error: "Session not found" };
    }
    
    if (session.messageDiamonds < count) {
      return { 
        success: false, 
        remainingDiamonds: session.messageDiamonds,
        error: "Not enough diamonds"
      };
    }
    
    // Deduct diamonds
    session.messageDiamonds -= count;
    this.guestSessions.set(sessionId, session);
    
    return { 
      success: true, 
      remainingDiamonds: session.messageDiamonds
    };
  }
  
  /**
   * Check if guest can access a specific companion
   */
  canAccessCompanion(sessionId: string, companionId: number): boolean {
    const session = this.guestSessions.get(sessionId);
    if (!session) {
      // If session doesn't exist, create it and check access
      const newSession = this.getOrCreateGuestSession(sessionId);
      return newSession.accessibleCompanionIds.includes(companionId);
    }
    
    return session.accessibleCompanionIds.includes(companionId);
  }
  
  /**
   * Get guest diamonds count
   */
  getDiamondsCount(sessionId: string): number {
    const session = this.guestSessions.get(sessionId);
    if (!session) {
      // If session doesn't exist, create it
      const newSession = this.getOrCreateGuestSession(sessionId);
      return newSession.messageDiamonds;
    }
    
    return session.messageDiamonds;
  }

  /**
   * Get guest session data
   */
  getSession(sessionId: string): GuestSession | null {
    return this.guestSessions.get(sessionId) || null;
  }

  /**
   * Use session diamonds (alias for useDiamonds)
   */
  useSessionDiamonds(sessionId: string, count: number = 1): { success: boolean, remainingDiamonds?: number, error?: string } {
    return this.useDiamonds(sessionId, count);
  }
  
  /**
   * Get guest preferred gender
   */
  getPreferredGender(sessionId: string): 'male' | 'female' | 'both' {
    const session = this.guestSessions.get(sessionId);
    if (!session) {
      return 'both';
    }
    
    return session.preferredGender;
  }
  
  /**
   * Get accessible companion IDs
   */
  getAccessibleCompanionIds(sessionId: string): number[] {
    const session = this.guestSessions.get(sessionId);
    if (!session) {
      return [];
    }
    
    return session.accessibleCompanionIds;
  }
  
  /**
   * Set available companion IDs
   */
  setAvailableCompanions(femaleIds: number[], maleIds: number[]): void {
    this.availableFemaleCompanionIds = femaleIds;
    this.availableMaleCompanionIds = maleIds;
    
    // Update all existing sessions to use the new companion IDs
    this.guestSessions.forEach((session, sessionId) => {
      this.updateGuestPreferences(sessionId, session.preferredGender);
    });
  }
  
  /**
   * Add diamonds to a guest session
   */
  addDiamonds(sessionId: string, count: number): { success: boolean, totalDiamonds?: number, error?: string } {
    const session = this.guestSessions.get(sessionId);
    if (!session) {
      return { success: false, error: "Session not found" };
    }

    session.messageDiamonds += count;
    
    // Also update device session if it exists
    const deviceSession = this.deviceSessions.get(session.deviceFingerprint);
    if (deviceSession) {
      deviceSession.messageDiamonds += count;
    }

    return { success: true, totalDiamonds: session.messageDiamonds };
  }

  /**
   * Clear chat data for a session but preserve diamonds and IP tracking
   */
  clearChatData(sessionId: string): void {
    // Chat data would be cleared from conversation history
    // For now, this is a placeholder as chat data is handled elsewhere
    // The IP-based diamond tracking remains intact
  }

  /**
   * Reset a session (for debugging)
   */
  resetSession(sessionId: string): void {
    const session = this.guestSessions.get(sessionId);
    if (session && session.ipAddress) {
      this.ipToSessionMap.delete(session.ipAddress);
    }
    this.guestSessions.delete(sessionId);
  }
}

export const guestService = new GuestService();