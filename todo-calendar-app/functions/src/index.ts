import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

/**
 * Cloud Function to send scheduled FCM notifications for exam reminders
 * 
 * This function:
 * 1. Checks examNotificationSchedules collection for notifications due to be sent
 * 2. Gets all FCM tokens from fcmTokens collection
 * 3. Sends FCM notifications to all devices
 * 4. Marks schedules as sent
 * 
 * Runs every hour automatically via Cloud Scheduler
 */
export const sendScheduledNotifications = functions.pubsub
  .schedule("every 1 hours")
  .onRun(async (context) => {
    console.log("Starting scheduled notification check...");

    try {
      const now = admin.firestore.Timestamp.now();
      
      // Find all notification schedules that are due and not yet sent
      const schedulesQuery = await db
        .collection("examNotificationSchedules")
        .where("sent", "==", false)
        .where("notificationDate", "<=", now)
        .get();

      if (schedulesQuery.empty) {
        console.log("No notifications due to be sent.");
        return null;
      }

      console.log(`Found ${schedulesQuery.size} notification(s) due to be sent.`);

      // Get all FCM tokens
      const tokensSnapshot = await db.collection("fcmTokens").get();
      
      if (tokensSnapshot.empty) {
        console.log("No FCM tokens found. Skipping notifications.");
        // Still mark schedules as sent to avoid retrying
        const markAsSentPromises = schedulesQuery.docs.map((doc) =>
          doc.ref.update({ sent: true })
        );
        await Promise.all(markAsSentPromises);
        return null;
      }

      const tokens = tokensSnapshot.docs.map((doc) => doc.id);
      console.log(`Found ${tokens.length} FCM token(s).`);

      // Process each schedule
      const notificationPromises = schedulesQuery.docs.map(async (scheduleDoc) => {
        const schedule = scheduleDoc.data();
        
        // Calculate days until exam
        const examDate = schedule.examDate.toDate();
        const notificationDate = schedule.notificationDate.toDate();
        const daysBefore = schedule.daysBefore || 0;
        
        // Create notification message
        let messageBody = "";
        if (daysBefore === 0) {
          messageBody = `${schedule.examTitle}${schedule.examSubject ? ` (${schedule.examSubject})` : ""} is today!`;
        } else if (daysBefore === 1) {
          messageBody = `${schedule.examTitle}${schedule.examSubject ? ` (${schedule.examSubject})` : ""} is tomorrow!`;
        } else {
          messageBody = `${schedule.examTitle}${schedule.examSubject ? ` (${schedule.examSubject})` : ""} is in ${daysBefore} days!`;
        }

        // Prepare FCM message
        const message = {
          notification: {
            title: "Exam Reminder",
            body: messageBody,
          },
          data: {
            examId: schedule.examId,
            examTitle: schedule.examTitle,
            examSubject: schedule.examSubject || "",
            daysBefore: daysBefore.toString(),
            type: "exam_reminder",
          },
          tokens: tokens, // Send to all devices
        };

        try {
          // Send to all tokens
          const response = await admin.messaging().sendEachForMulticast(message);
          
          console.log(
            `Notification sent for exam "${schedule.examTitle}" (${daysBefore} days before). ` +
            `Success: ${response.successCount}, Failed: ${response.failureCount}`
          );

          // Handle failed tokens (remove invalid tokens)
          if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
              if (!resp.success) {
                failedTokens.push(tokens[idx]);
                console.error(`Failed to send to token ${tokens[idx]}: ${resp.error}`);
              }
            });

            // Remove invalid tokens from Firestore
            const deletePromises = failedTokens.map((token) =>
              db.collection("fcmTokens").doc(token).delete()
            );
            await Promise.all(deletePromises);
            console.log(`Removed ${failedTokens.length} invalid FCM token(s).`);
          }

          // Mark schedule as sent
          await scheduleDoc.ref.update({
            sent: true,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          return { success: true, scheduleId: scheduleDoc.id };
        } catch (error) {
          console.error(`Error sending notification for schedule ${scheduleDoc.id}:`, error);
          // Don't mark as sent if there was an error
          return { success: false, scheduleId: scheduleDoc.id, error };
        }
      });

      const results = await Promise.all(notificationPromises);
      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.filter((r) => !r.success).length;

      console.log(
        `Notification check complete. Success: ${successCount}, Failed: ${failureCount}`
      );

      return null;
    } catch (error) {
      console.error("Error in sendScheduledNotifications:", error);
      throw error;
    }
  });

/**
 * Manual trigger function for testing
 * You can call this from Firebase Console or via HTTP
 */
export const sendScheduledNotificationsManual = functions.https.onRequest(
  async (req, res) => {
    console.log("Manual trigger: Starting scheduled notification check...");

    try {
      const now = admin.firestore.Timestamp.now();
      
      const schedulesQuery = await db
        .collection("examNotificationSchedules")
        .where("sent", "==", false)
        .where("notificationDate", "<=", now)
        .get();

      if (schedulesQuery.empty) {
        res.json({ message: "No notifications due to be sent.", count: 0 });
        return;
      }

      const tokensSnapshot = await db.collection("fcmTokens").get();
      
      if (tokensSnapshot.empty) {
        res.json({ message: "No FCM tokens found.", count: 0 });
        return;
      }

      const tokens = tokensSnapshot.docs.map((doc) => doc.id);

      const notificationPromises = schedulesQuery.docs.map(async (scheduleDoc) => {
        const schedule = scheduleDoc.data();
        const daysBefore = schedule.daysBefore || 0;
        
        let messageBody = "";
        if (daysBefore === 0) {
          messageBody = `${schedule.examTitle}${schedule.examSubject ? ` (${schedule.examSubject})` : ""} is today!`;
        } else if (daysBefore === 1) {
          messageBody = `${schedule.examTitle}${schedule.examSubject ? ` (${schedule.examSubject})` : ""} is tomorrow!`;
        } else {
          messageBody = `${schedule.examTitle}${schedule.examSubject ? ` (${schedule.examSubject})` : ""} is in ${daysBefore} days!`;
        }

        const message = {
          notification: {
            title: "Exam Reminder",
            body: messageBody,
          },
          data: {
            examId: schedule.examId,
            examTitle: schedule.examTitle,
            examSubject: schedule.examSubject || "",
            daysBefore: daysBefore.toString(),
            type: "exam_reminder",
          },
          tokens: tokens,
        };

        try {
          const response = await admin.messaging().sendEachForMulticast(message);
          
          await scheduleDoc.ref.update({
            sent: true,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          return { success: true, response };
        } catch (error) {
          console.error(`Error:`, error);
          return { success: false, error };
        }
      });

      const results = await Promise.all(notificationPromises);
      
      res.json({
        message: "Notifications processed",
        schedulesFound: schedulesQuery.size,
        tokensFound: tokens.length,
        results: results,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

