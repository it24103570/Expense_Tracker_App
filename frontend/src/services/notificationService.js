import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications should be handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
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
   * Schedule a repeating daily reminder (repeats every 24 hours from now).
   */
  async scheduleDailyReminder() {
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
          type: 'timeInterval',
          seconds:  24 * 60 * 60, // 24 hours in seconds
          repeats: true,
        },
      });

      console.log(`Daily reminder scheduled (ID: ${id}) to repeat every 24 hours`);
      return id;
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
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

  /**
   * Example: Send a notification after a specified delay (in seconds).
   * @param {number} delayInSeconds - How many seconds to wait before triggering
   */
  async sendDelayedNotification(delayInSeconds = 10) {
    try {
      await this.requestPermissions();
      
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "⏱️ Time's up!",
          body: `This notification was triggered after ${delayInSeconds} seconds.`,
          sound: true,
        },
        trigger: {
          type: 'timeInterval',
          seconds: delayInSeconds,
          repeats: false,
        },
      });
      console.log(`Delayed notification scheduled (ID: ${id})`);
      return id;
    } catch (error) {
      console.error('Error scheduling delayed notification:', error);
    }
  }
}

export default new NotificationService();
