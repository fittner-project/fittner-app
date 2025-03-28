import useHardwareBack from "@/hooks/useHardwareBack";
import { useRef, useState } from "react";
import { WebView } from "react-native-webview";

import OfflineNotice from "@/components/OfflineNotice";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Platform } from "react-native";

const INJECTEDJAVASCRIPT = `const meta = document.createElement('meta'); meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `;

export default function Index() {
  const webViewRef = useRef<WebView>(null);
  const handleNavigationStateChange = useHardwareBack(webViewRef);
  const isConnected = useNetworkStatus();
  const [isError, setIsError] = useState(false);

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
    <WebView
      style={{ flex: 1 }}
      textZoom={100}
      injectedJavaScript={INJECTEDJAVASCRIPT}
      onNavigationStateChange={handleNavigationStateChange}
      ref={webViewRef}
      source={{ uri: "https://m.fittner.co.kr/" }}
      onError={() => setIsError(true)}
      userAgent={getUserAgent()}
    />
  );
}
