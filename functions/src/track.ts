import {
    onDocumentCreated,
    FirestoreEvent,
    QueryDocumentSnapshot
} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();

const ADMIN_PHONE = "+15627262681";

// --- Activity Tracking (FCM push to admin) ---

export const onEventCreated = onDocumentCreated(
    { document: "events/{eventId}", region: "asia-southeast1" },
    async (
        event: FirestoreEvent<
            QueryDocumentSnapshot | undefined,
            { eventId: string }
        >
    ) => {
        const data = event.data?.data();
        if (!data) return;

        try {
            const adminUser = await admin
                .auth()
                .getUserByPhoneNumber(ADMIN_PHONE);
            if (data.uid === adminUser.uid) return;
            const adminDoc = await admin
                .firestore()
                .doc(`users/${adminUser.uid}`)
                .get();
            const fcmToken = adminDoc.data()?.fcmToken;
            if (!fcmToken) return;

            let who: string;
            const counterId = (data.uid as string) ?? (data.deviceId as string);
            if (data.uid) {
                const user = await admin.auth().getUser(data.uid as string);
                who =
                    user.phoneNumber ??
                    `uid:${(data.uid as string).slice(0, 8)}`;
            } else {
                who = `device:${(data.deviceId as string).slice(0, 8)}`;
            }

            const counterRef = admin.firestore().doc(`counters/${counterId}`);
            await counterRef.set(
                { count: admin.firestore.FieldValue.increment(1) },
                { merge: true }
            );
            const counterSnap = await counterRef.get();
            const count = counterSnap.data()?.count ?? 1;

            const details = data.data
                ? " • " + Object.values(data.data).join(", ")
                : "";

            const ua = (data.userAgent as string) ?? "";
            const device = /Mobile|Android/i.test(ua) ? "📱" : "💻";
            const location = (data.location as string) ?? "Unknown Location";

            await admin.messaging().send({
                token: fcmToken,
                notification: {
                    title: `🔔 ${count} • ${who} • ${location}`,
                    body: `${device} ${data.event + details} • ${ua}`
                }
            });
        } catch (error) {
            console.error("Failed to send activity notification:", error);
        }
    }
);
