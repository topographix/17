import { db } from '../db';
import { deviceSessions, guestSessions, chatMessages } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export interface DeviceSession {
  id: number;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent?: string | null;
  platform?: string | null;
  hasReceivedWelcomeDiamonds: boolean;
  messageDiamonds: number;
  preferredGender: string;
  accessibleCompanionIds: number[];
  createdAt: Date;
  lastActivity: Date;
}

export interface ChatMessage {
  id: number;
  deviceFingerprintId: number | null;
  companionId: number;
  messageContent: string;
  sender: 'user' | 'companion';
  timestamp: Date;
  emotionType?: string | null;
  emotionIntensity?: string | null;
  imageUrl?: string | null;
}

class DeviceDiamondService {
  
  // Create or get device session with persistent diamond storage
  async getOrCreateDeviceSession(
    deviceFingerprint: string, 
    ipAddress: string, 
    userAgent?: string, 
    platform: 'web' | 'android' | 'ios' = 'web'
  ): Promise<DeviceSession> {
    try {
      // Try to find existing device session
      const [existingDevice] = await db
        .select()
        .from(deviceSessions)
        .where(eq(deviceSessions.deviceFingerprint, deviceFingerprint))
        .limit(1);

      if (existingDevice) {
        // Update last activity
        const [updated] = await db
          .update(deviceSessions)
          .set({ 
            lastActivity: new Date(),
            ipAddress: ipAddress // Update IP in case it changed
          })
          .where(eq(deviceSessions.id, existingDevice.id))
          .returning();
        
        return {
          ...updated,
          hasReceivedWelcomeDiamonds: updated.hasReceivedWelcomeDiamonds ?? false,
          messageDiamonds: updated.messageDiamonds ?? 0,
          preferredGender: updated.preferredGender ?? 'both',
          accessibleCompanionIds: Array.isArray(updated.accessibleCompanionIds) 
            ? updated.accessibleCompanionIds as number[]
            : [1, 3, 8, 2, 5], // Default companions
          createdAt: updated.createdAt ?? new Date(),
          lastActivity: updated.lastActivity ?? new Date(),
        };
      }

      // Create new device session with welcome diamonds
      const [newDevice] = await db
        .insert(deviceSessions)
        .values({
          deviceFingerprint,
          ipAddress,
          userAgent,
          platform,
          hasReceivedWelcomeDiamonds: true,
          messageDiamonds: 25, // Welcome bonus
          preferredGender: 'both',
          accessibleCompanionIds: [1, 3, 8, 2, 5], // Default accessible companions
        })
        .returning();

      return {
        ...newDevice,
        hasReceivedWelcomeDiamonds: newDevice.hasReceivedWelcomeDiamonds ?? false,
        messageDiamonds: newDevice.messageDiamonds ?? 0,
        preferredGender: newDevice.preferredGender ?? 'both',
        accessibleCompanionIds: Array.isArray(newDevice.accessibleCompanionIds) 
          ? newDevice.accessibleCompanionIds as number[]
          : [1, 3, 8, 2, 5],
        createdAt: newDevice.createdAt ?? new Date(),
        lastActivity: newDevice.lastActivity ?? new Date(),
      };
    } catch (error) {
      console.error('Error in getOrCreateDeviceSession:', error);
      throw new Error('Failed to get or create device session');
    }
  }

  // Get device session by fingerprint
  async getDeviceSession(deviceFingerprint: string): Promise<DeviceSession | null> {
    try {
      const [device] = await db
        .select()
        .from(deviceSessions)
        .where(eq(deviceSessions.deviceFingerprint, deviceFingerprint))
        .limit(1);

      if (!device) {
        return null;
      }

      return {
        ...device,
        hasReceivedWelcomeDiamonds: device.hasReceivedWelcomeDiamonds ?? false,
        messageDiamonds: device.messageDiamonds ?? 0,
        preferredGender: device.preferredGender ?? 'both',
        accessibleCompanionIds: Array.isArray(device.accessibleCompanionIds) 
          ? device.accessibleCompanionIds as number[]
          : [1, 3, 8, 2, 5],
        createdAt: device.createdAt ?? new Date(),
        lastActivity: device.lastActivity ?? new Date(),
      };
    } catch (error) {
      console.error('Error getting device session:', error);
      return null;
    }
  }

  // Update diamond count for a device
  async updateDiamonds(deviceFingerprint: string, newDiamondCount: number): Promise<boolean> {
    try {
      const result = await db
        .update(deviceSessions)
        .set({ 
          messageDiamonds: newDiamondCount,
          lastActivity: new Date()
        })
        .where(eq(deviceSessions.deviceFingerprint, deviceFingerprint));

      return true;
    } catch (error) {
      console.error('Error updating diamonds:', error);
      return false;
    }
  }

  // Deduct diamonds for message sending
  async deductDiamonds(deviceFingerprint: string, amount: number = 1): Promise<{ success: boolean, remainingDiamonds: number }> {
    try {
      const [device] = await db
        .select()
        .from(deviceSessions)
        .where(eq(deviceSessions.deviceFingerprint, deviceFingerprint))
        .limit(1);

      if (!device) {
        return { success: false, remainingDiamonds: 0 };
      }

      const currentDiamonds = device.messageDiamonds ?? 0;
      
      if (currentDiamonds < amount) {
        return { success: false, remainingDiamonds: currentDiamonds };
      }

      const newDiamondCount = currentDiamonds - amount;
      
      await db
        .update(deviceSessions)
        .set({ 
          messageDiamonds: newDiamondCount,
          lastActivity: new Date()
        })
        .where(eq(deviceSessions.id, device.id));

      return { success: true, remainingDiamonds: newDiamondCount };
    } catch (error) {
      console.error('Error deducting diamonds:', error);
      return { success: false, remainingDiamonds: 0 };
    }
  }

  // Get diamond count for a device
  async getDiamondCount(deviceFingerprint: string): Promise<number> {
    try {
      const [device] = await db
        .select({ messageDiamonds: deviceSessions.messageDiamonds })
        .from(deviceSessions)
        .where(eq(deviceSessions.deviceFingerprint, deviceFingerprint))
        .limit(1);

      return device?.messageDiamonds || 0;
    } catch (error) {
      console.error('Error getting diamond count:', error);
      return 0;
    }
  }

  // Save chat message to database
  async saveChatMessage(
    deviceFingerprint: string,
    companionId: number,
    messageContent: string,
    sender: 'user' | 'companion',
    emotionType?: string,
    emotionIntensity?: string,
    imageUrl?: string
  ): Promise<ChatMessage | null> {
    try {
      // Get device session
      const [device] = await db
        .select({ id: deviceSessions.id })
        .from(deviceSessions) 
        .where(eq(deviceSessions.deviceFingerprint, deviceFingerprint))
        .limit(1);

      if (!device) {
        console.error('Device session not found for saving chat message');
        return null;
      }

      const [message] = await db
        .insert(chatMessages)
        .values({
          deviceFingerprintId: device.id,
          companionId,
          messageContent,
          sender,
          emotionType,
          emotionIntensity,
          imageUrl
        })
        .returning();

      return message;
    } catch (error) {
      console.error('Error saving chat message:', error);
      return null;
    }
  }

  // Get chat history for a device and companion
  async getChatHistory(deviceFingerprint: string, companionId: number): Promise<ChatMessage[]> {
    try {
      const messages = await db
        .select()
        .from(chatMessages)
        .innerJoin(deviceSessions, eq(chatMessages.deviceFingerprintId, deviceSessions.id))
        .where(
          and(
            eq(deviceSessions.deviceFingerprint, deviceFingerprint),
            eq(chatMessages.companionId, companionId)
          )
        )
        .orderBy(chatMessages.timestamp);

      return messages.map(row => row.chat_messages);
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  // Clear chat history for a device (refresh functionality)
  async clearChatHistory(deviceFingerprint: string): Promise<boolean> {
    try {
      const [device] = await db
        .select({ id: deviceSessions.id })
        .from(deviceSessions)
        .where(eq(deviceSessions.deviceFingerprint, deviceFingerprint))
        .limit(1);

      if (!device) {
        return false;
      }

      await db
        .delete(chatMessages)
        .where(eq(chatMessages.deviceFingerprintId, device.id));

      return true;
    } catch (error) {
      console.error('Error clearing chat history:', error);
      return false;
    }
  }

  // Link guest session to device
  async linkGuestSessionToDevice(sessionId: string, deviceFingerprint: string): Promise<boolean> {
    try {
      const [device] = await db
        .select({ id: deviceSessions.id })
        .from(deviceSessions)
        .where(eq(deviceSessions.deviceFingerprint, deviceFingerprint))
        .limit(1);

      if (!device) {
        return false;
      }

      await db
        .insert(guestSessions)
        .values({
          sessionId,
          deviceFingerprintId: device.id
        })
        .onConflictDoUpdate({
          target: guestSessions.sessionId,
          set: {
            deviceFingerprintId: device.id,
            lastActivity: new Date()
          }
        });

      return true;
    } catch (error) {
      console.error('Error linking guest session to device:', error);
      return false;
    }
  }
}

export const deviceDiamondService = new DeviceDiamondService();