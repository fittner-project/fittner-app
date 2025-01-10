import useHardwareBack from "@/hooks/useHardwareBack";
import { useRef } from "react";
import { WebView } from "react-native-webview";

const INJECTEDJAVASCRIPT = `const meta = document.createElement('meta'); meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `;

export default function Index() {
  const webViewRef = useRef<WebView>(null);
  const handleNavigationStateChange = useHardwareBack(webViewRef);

  return (
    <WebView
      style={{ flex: 1 }}
      textZoom={100}
      injectedJavaScript={INJECTEDJAVASCRIPT}
      onNavigationStateChange={handleNavigationStateChange}
      ref={webViewRef}
      source={{ uri: "https://m.fittner.co.kr/" }}
    />
  );
}
