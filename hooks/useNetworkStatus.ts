import { useState, useEffect } from "react";
import * as Network from "expo-network";

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      const networkState = await Network.getNetworkStateAsync();
      setIsConnected(networkState.isConnected ?? true);
    };

    const interval = setInterval(checkConnection, 1000);
    checkConnection();

    return () => clearInterval(interval);
  }, []);

  return isConnected;
};
