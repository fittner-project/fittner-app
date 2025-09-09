// React Native Firebase는 네이티브 설정 파일로 자동 초기화됩니다.
// 별도의 JS 초기화가 필요하지 않습니다.

import analytics from "@react-native-firebase/analytics";
import messaging from "@react-native-firebase/messaging";
import app from "@react-native-firebase/app";

// Firebase 네이티브 초기화 확인 로그 (필수는 아님)
console.log("Firebase 앱 초기화 확인됨");

export { analytics, messaging, app };
