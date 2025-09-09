import { Stack } from "expo-router";
import { useEffect } from "react";
import FCMService from "../fcm";

export default function RootLayout() {
  useEffect(() => {
    const initializeFCM = async () => {
      try {
        await FCMService.initialize();
      } catch (error) {
        console.error("FCM 초기화 실패:", error);
      }
    };

    initializeFCM();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
