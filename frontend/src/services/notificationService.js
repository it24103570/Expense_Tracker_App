import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications should be handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * NotificationService
 * Logic for handling Expo local notifications (not push).
 */
class NotificationService {
  /**
   * Request notification permissions from the user.
   * Required for iOS and Android 13+.
   */
  async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get notification permissions');
      return false;
    }

    // Android specific channel configuration
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  }

  /**
   * Schedule a repeating daily reminder at a specific time.
   * @param {number} hour - 0-23
   * @param {number} minute - 0-59
   */
  async scheduleDailyReminder(hour, minute) {
    try {
      // 1. Request permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      // 2. Cancel existing reminder to avoid duplicates
      await this.cancelDailyReminders();

      // 3. Schedule the new daily notification
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "💰 Don't forget to track!",
          body: "Take a moment to record your expenses for today.",
          data: { screen: 'Home' },
          sound: true,
        },
        trigger: {
          hour: hour,
          minute: minute,
          repeats: true,
        },
      });

      console.log(`Daily reminder scheduled (ID: ${id}) for ${hour}:${minute}`);
      return id;
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
    }
  }

  /**
   * Send an instant local notification for budget alerts.
   * @param {string} category - The category name
   * @param {number} spent - Amount spent
   * @param {number} limit - Budget limit
   */
  async sendBudgetAlert(category, spent, limit) {
    try {
      // Request permissions (non-intrusive if already granted)
      await this.requestPermissions();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⚠️ Budget Exceeded!",
          body: `You've spent ${spent} in ${category}, which exceeds your limit of ${limit}!`,
          data: { screen: 'Budget' },
          color: '#FF0000',
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending budget alert:', error);
    }
  }

  /**
   * Cancel all scheduled notifications.
   */
  async cancelDailyReminders() {
    try {
      // This cancels ALL scheduled notifications. 
      // If you had other types, you'd need to filter by ID.
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All scheduled notifications cancelled.');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }
}

export default new NotificationService();
