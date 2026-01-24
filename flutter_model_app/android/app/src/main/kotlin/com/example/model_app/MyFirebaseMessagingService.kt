package com.example.model_app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.graphics.BitmapFactory
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import java.net.URL

class MyFirebaseMessagingService : FirebaseMessagingService() {
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        // Create notification channel
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channelId = "model_app_notifications"
            val channelName = "Model App Notifications"
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(channelId, channelName, importance)
            
            // Set custom sound
            val audioUri = Uri.parse("android.resource://$packageName/${R.raw.file}")
            val audioAttributes = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .build()
            
            channel.setSound(audioUri, audioAttributes)
            channel.enableVibration(true)
            
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }

        // Build notification
        val title = remoteMessage.notification?.title ?: "Notification"
        val body = remoteMessage.notification?.body ?: ""
        val imageUrl = remoteMessage.data["image_url"] ?: ""
        val channelId = "model_app_notifications"

        val builder = NotificationCompat.Builder(this, channelId)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)

        // Set large icon if image URL provided
        if (imageUrl.isNotEmpty()) {
            try {
                val bitmap = BitmapFactory.decodeStream(
                    URL(imageUrl).openConnection().getInputStream()
                )
                builder.setLargeIcon(bitmap)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        // Set custom sound
        val audioUri = Uri.parse("android.resource://$packageName/${R.raw.file}")
        builder.setSound(audioUri)

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(System.currentTimeMillis().toInt(), builder.build())
    }
}
