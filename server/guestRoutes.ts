import express, { Request, Response } from 'express';
import { guestService } from './services/guestService';

const router = express.Router();

// Get guest session with device fingerprinting to prevent diamond farming
router.get('/session', (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionID;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    if (!sessionId) {
      return res.status(400).json({ message: "No session available" });
    }
    
    // Get device fingerprint from request body if provided (for device tracking)
    const deviceFingerprint = req.headers['x-device-fingerprint'] as string;
    const platform = req.headers['x-platform'] as string || 'web';
    
    const guestSession = guestService.getOrCreateGuestSessionByDevice(
      sessionId, 
      deviceFingerprint || `${ipAddress}_${userAgent}`, 
      ipAddress,
      userAgent,
      platform as 'web' | 'android' | 'ios'
    );
    
    console.log(`Guest session for ${sessionId} (Device: ${deviceFingerprint || 'auto'}, IP: ${ipAddress}): ${guestSession.messageDiamonds} diamonds`);
    
    res.json({
      sessionId: guestSession.sessionId,
      preferredGender: guestSession.preferredGender,
      messageDiamonds: guestSession.messageDiamonds,
      accessibleCompanionIds: guestSession.accessibleCompanionIds,
      hasReceivedWelcomeDiamonds: guestSession.hasReceivedWelcomeDiamonds
    });
  } catch (error) {
    console.error("Error getting guest session:", error);
    res.status(500).json({ message: "Failed to get guest session" });
  }
});

// Refresh guest session (clears chat data but preserves IP-based diamonds)
router.post('/refresh', (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionID;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    
    if (!sessionId) {
      return res.status(400).json({ message: "No session available" });
    }
    
    // Clear chat data but keep IP-based diamond tracking
    guestService.clearChatData(sessionId);
    const guestSession = guestService.getOrCreateGuestSessionByIP(sessionId, ipAddress);
    
    console.log(`Refreshed guest session for ${sessionId} (IP: ${ipAddress}) - chat cleared, diamonds preserved: ${guestSession.messageDiamonds}`);
    
    res.json({
      sessionId: guestSession.sessionId,
      preferredGender: guestSession.preferredGender,
      messageDiamonds: guestSession.messageDiamonds,
      accessibleCompanionIds: guestSession.accessibleCompanionIds
    });
  } catch (error) {
    console.error("Error refreshing guest session:", error);
    res.status(500).json({ message: "Failed to refresh guest session" });
  }
});

// Update guest preferences
router.patch('/preferences', (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionID;
    if (!sessionId) {
      return res.status(400).json({ message: "No session available" });
    }
    
    const { preferredGender } = req.body;
    
    // Validate gender preference
    if (preferredGender && ['male', 'female', 'both'].includes(preferredGender)) {
      const updatedSession = guestService.updateGuestPreferences(
        sessionId, 
        preferredGender as 'male' | 'female' | 'both'
      );
      
      if (!updatedSession) {
        return res.status(404).json({ message: "Guest session not found" });
      }
      
      return res.json({
        sessionId: updatedSession.sessionId,
        preferredGender: updatedSession.preferredGender,
        messageDiamonds: updatedSession.messageDiamonds,
        accessibleCompanionIds: updatedSession.accessibleCompanionIds
      });
    }
    
    return res.status(400).json({ message: "Invalid preferred gender" });
  } catch (error) {
    console.error("Error updating guest preferences:", error);
    res.status(500).json({ message: "Failed to update guest preferences" });
  }
});

// Check diamond balance for a guest
router.get('/diamonds', (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionID;
    if (!sessionId) {
      return res.status(400).json({ message: "No session available" });
    }
    
    const diamondCount = guestService.getDiamondsCount(sessionId);
    
    res.json({ diamonds: diamondCount });
  } catch (error) {
    console.error("Error getting diamond count:", error);
    res.status(500).json({ message: "Failed to get diamond count" });
  }
});

// Use diamonds (for messaging)
router.post('/diamonds/use', (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionID;
    if (!sessionId) {
      return res.status(400).json({ message: "No session available" });
    }
    
    const { count = 1 } = req.body;
    
    const result = guestService.useDiamonds(sessionId, count);
    
    if (!result.success) {
      return res.status(400).json({ 
        message: result.error || "Failed to use diamonds",
        remainingDiamonds: result.remainingDiamonds
      });
    }
    
    res.json({ 
      success: true,
      remainingDiamonds: result.remainingDiamonds
    });
  } catch (error) {
    console.error("Error using diamonds:", error);
    res.status(500).json({ message: "Failed to use diamonds" });
  }
});

// Check if guest can access a specific companion
router.get('/can-access/:companionId', (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionID;
    if (!sessionId) {
      return res.status(400).json({ message: "No session available" });
    }
    
    const companionId = parseInt(req.params.companionId);
    if (isNaN(companionId)) {
      return res.status(400).json({ message: "Invalid companion ID" });
    }
    
    const canAccess = guestService.canAccessCompanion(sessionId, companionId);
    
    res.json({ canAccess });
  } catch (error) {
    console.error("Error checking companion access:", error);
    res.status(500).json({ message: "Failed to check companion access" });
  }
});

export default router;