export const qrService = {
  generateUserQR(userId: string): string {
    return JSON.stringify({
      type: 'luxury_auto_wash_user',
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  parseUserQR(qrData: string): { userId: string; timestamp: string } | null {
    try {
      const parsed = JSON.parse(qrData);
      if (parsed.type === 'luxury_auto_wash_user' && parsed.userId) {
        return {
          userId: parsed.userId,
          timestamp: parsed.timestamp,
        };
      }
      return null;
    } catch (error) {
      console.error('Error parsing QR code:', error);
      return null;
    }
  },
};
