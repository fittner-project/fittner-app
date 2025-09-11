import useHardwareBack from "@/hooks/useHardwareBack";
import { useRef, useState, useCallback } from "react";
import { WebView } from "react-native-webview";

import OfflineNotice from "@/components/OfflineNotice";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Platform, SafeAreaView, StatusBar, View } from "react-native";
import FCMService from "../fcm";

const INJECTEDJAVASCRIPT = `
  // viewport 설정
  (function(){
    try {
      const meta = document.createElement('meta');
      meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0');
      meta.setAttribute('name', 'viewport');
      document.getElementsByTagName('head')[0].appendChild(meta);
    } catch (e) {}
  })();

  // RN에서 주입한 FCM 토큰을 수신하기 위한 훅
  (function(){
    try {
      // 콜백 함수 (웹 측에서 필요 시 오버라이드 가능)
      window.onNativeFcmToken = function(token){
        try {
          // 1) 커스텀 이벤트 디스패치 (웹이 EventListener로 수신 가능)
          const ev = new CustomEvent('fcm-token', { detail: { token } });
          window.dispatchEvent(ev);
        } catch (_e) {}
      }
    } catch (e) {}
  })();
`;

export default function Index() {
  const webViewRef = useRef<WebView>(null);
  const handleNavigationStateChange = useHardwareBack(webViewRef);
  const isConnected = useNetworkStatus();
  const [isError, setIsError] = useState(false);

  const sendTokenToWeb = useCallback(async () => {
    try {
      const token = await FCMService.getFCMToken();
      if (!token) return;
      // WebView 측으로 토큰 주입
      const js = `window.onNativeFcmToken && window.onNativeFcmToken(${JSON.stringify(
        token
      )}); true;`;
      webViewRef.current?.injectJavaScript(js);
    } catch (e) {
      // noop
    }
  }, []);

  const getUserAgent = () => {
    if (Platform.OS === "ios") {
      return "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1";
    }
    return "Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
  };

  if (!isConnected || isError) {
    return <OfflineNotice />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />

        <WebView
          style={{ flex: 1, backgroundColor: "white" }}
          textZoom={100}
          injectedJavaScript={INJECTEDJAVASCRIPT}
          onNavigationStateChange={handleNavigationStateChange}
          ref={webViewRef}
          source={{ uri: "https://m.fittner.co.kr/" }}
          onError={() => setIsError(true)}
          userAgent={getUserAgent()}
          onLoadEnd={() => {
            // 로드 완료 시 토큰 전송 시도
            sendTokenToWeb();
          }}
        />
      </SafeAreaView>
    </View>
  );
}
