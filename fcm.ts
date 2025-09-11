import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

// 알림 핸들러 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class FCMService {
  private static instance: FCMService;
  private fcmToken: string | null = null;

  private constructor() {}

  // fcmToken getter 추가
  get currentToken(): string | null {
    return this.fcmToken;
  }

  public static getInstance(): FCMService {
    if (!FCMService.instance) {
      FCMService.instance = new FCMService();
    }
    return FCMService.instance;
  }

  // 알림 권한 요청
  async requestUserPermission(): Promise<boolean> {
    if (Platform.OS === "ios") {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log("Authorization status:", authStatus);
        // iOS 배지/알림 권한도 함께 요청 (expo-notifications)
        try {
          await Notifications.requestPermissionsAsync({
            ios: { allowAlert: true, allowSound: true, allowBadge: true },
          });
        } catch (e) {
          console.warn("iOS 알림 권한(배지 포함) 추가 요청 경고:", e);
        }
      }

      return enabled;
    }
    // Android 13+ POST_NOTIFICATIONS 권한 요청 (Expo Notifications 사용)
    try {
      const current = await Notifications.getPermissionsAsync();
      if (current.status === "granted") {
        return true;
      }
      const requested = await Notifications.requestPermissionsAsync();
      return requested.status === "granted";
    } catch (e) {
      console.warn("Android 권한 요청 실패", e);
      return false;
    }
  }

  // FCM 토큰 가져오기 (기존 토큰 반환 또는 새로 가져오기)
  async getFCMToken(): Promise<string | null> {
    if (this.fcmToken) {
      return this.fcmToken;
    }
    return await this.getFCMTokenSimple();
  }

  private async ensureDeviceRegistered(): Promise<void> {
    try {
      await messaging().setAutoInitEnabled(true);
      if (!messaging().isDeviceRegisteredForRemoteMessages) {
        await messaging().registerDeviceForRemoteMessages();
      }
    } catch (e) {
      console.warn("원격 메시지 등록 확인 실패(무시 가능):", e);
    }
  }

  private async getFCMTokenSimple(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      this.fcmToken = token;
      console.log("FCM Token:", token);
      await this.sendTokenToServer(token);
      return token;
    } catch (err: any) {
      console.error("FCM 토큰 가져오기 실패:", err);
      return null;
    }
  }

  // 서버에 토큰 전송 (구현 필요)
  private async sendTokenToServer(token: string): Promise<void> {
    try {
      // TODO: 실제 서버 API 엔드포인트로 토큰 전송
      console.log("서버에 토큰 전송:", token);

      // 예시 코드:
      // await fetch('YOUR_API_ENDPOINT/fcm-token', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ token, userId: 'USER_ID' }),
      // });
    } catch (error) {
      console.error("서버에 토큰 전송 실패:", error);
    }
  }

  // 토큰 새로고침 리스너
  setupTokenRefreshListener(): () => void {
    return messaging().onTokenRefresh((token) => {
      console.log("FCM 토큰 새로고침:", token);
      this.fcmToken = token;
      this.sendTokenToServer(token);
    });
  }

  // 포그라운드 메시지 리스너
  setupForegroundMessageListener(): () => void {
    return messaging().onMessage(async (remoteMessage) => {
      console.log("포그라운드 메시지 수신:", remoteMessage);

      // 로컬 알림 표시
      await this.showLocalNotification(remoteMessage);
    });
  }

  // 백그라운드 메시지 핸들러
  setupBackgroundMessageHandler(): void {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("백그라운드 메시지 수신:", remoteMessage);

      // 백그라운드에서는 로컬 알림을 표시하지 않음
      // Firebase가 자동으로 처리
    });
  }

  // 알림 클릭 이벤트 리스너
  setupNotificationOpenedAppListener(): () => void {
    return messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log("앱이 백그라운드에서 열림:", remoteMessage);

      // TODO: 특정 화면으로 네비게이션하는 로직 추가
      this.handleNotificationNavigation(remoteMessage);
    });
  }

  // 앱이 종료된 상태에서 알림 클릭으로 열린 경우
  async checkInitialNotification(): Promise<void> {
    const remoteMessage = await messaging().getInitialNotification();

    if (remoteMessage) {
      console.log("앱이 종료된 상태에서 알림으로 열림:", remoteMessage);

      // TODO: 특정 화면으로 네비게이션하는 로직 추가
      this.handleNotificationNavigation(remoteMessage);
    }
  }

  // 로컬 알림 표시
  private async showLocalNotification(remoteMessage: any): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification?.title || "새 메시지",
          body: remoteMessage.notification?.body || "메시지 내용",
          data: remoteMessage.data || {},
        },
        trigger: null, // 즉시 표시
      });
    } catch (error) {
      console.error("로컬 알림 표시 실패:", error);
    }
  }

  // 알림 네비게이션 처리
  private handleNotificationNavigation(remoteMessage: any): void {
    const data = remoteMessage.data;

    // TODO: 데이터에 따라 적절한 화면으로 네비게이션
    // 예: data.screen === 'profile'이면 프로필 화면으로 이동
    console.log("알림 데이터로 네비게이션:", data);
  }

  // 초기화
  async initialize(): Promise<void> {
    try {
      // Firebase 네이티브 초기화 확인 로그
      console.log("Firebase 앱 초기화 확인됨");

      // 앱 시작 시 뱃지 초기화 (iOS 시뮬레이터 문제 해결)
      await Notifications.setBadgeCountAsync(0);
      console.log("앱 뱃지 초기화 완료");

      // Android 알림 채널 설정 (없으면 알림 표시 안 될 수 있음)
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          showBadge: true,
        });
      }

      // 권한 요청
      const hasPermission = await this.requestUserPermission();
      if (!hasPermission) {
        console.log("알림 권한이 거부되었습니다.");
        return;
      }

      // 원격 메시지 자동 초기화 및 기기 등록 보장
      await this.ensureDeviceRegistered();

      // 백그라운드 메시지 핸들러 설정
      this.setupBackgroundMessageHandler();

      // FCM 토큰 가져오기
      await this.getFCMTokenSimple();

      // 초기 알림 확인
      await this.checkInitialNotification();

      console.log("FCM 서비스 초기화 완료");
    } catch (error) {
      console.error("FCM 서비스 초기화 실패:", error);
    }
  }

  // 토큰 삭제 (로그아웃 시 사용)
  async deleteToken(): Promise<void> {
    try {
      await messaging().deleteToken();
      this.fcmToken = null;
      console.log("FCM 토큰 삭제 완료");
    } catch (error) {
      console.error("FCM 토큰 삭제 실패:", error);
    }
  }
}

export default FCMService.getInstance();
