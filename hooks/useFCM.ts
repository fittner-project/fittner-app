import { useEffect, useState, useCallback } from "react";
import FCMService from "../fcm";

export interface FCMToken {
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface FCMNotification {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export const useFCM = () => {
  const [token, setToken] = useState<FCMToken>({
    token: null,
    isLoading: true,
    error: null,
  });

  const [hasPermission, setHasPermission] = useState<boolean>(false);

  // FCM 초기화
  const initializeFCM = useCallback(async () => {
    try {
      setToken((prev) => ({ ...prev, isLoading: true, error: null }));

      // FCM 서비스 초기화 (권한 체크 및 토큰 가져오기 포함)
      await FCMService.initialize();

      // 초기화 후 현재 상태 확인
      const fcmToken = FCMService.currentToken; // getter 사용
      const permission = await FCMService.requestUserPermission();

      setToken({
        token: fcmToken,
        isLoading: false,
        error: null,
      });

      setHasPermission(permission);
    } catch (error) {
      setToken((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      }));
    }
  }, []);

  // 토큰 새로고침
  const refreshToken = useCallback(async () => {
    try {
      setToken((prev) => ({ ...prev, isLoading: true, error: null }));

      const fcmToken = await FCMService.getFCMToken();

      setToken({
        token: fcmToken,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setToken((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "토큰 새로고침에 실패했습니다.",
      }));
    }
  }, []);

  // 토큰 삭제 (로그아웃 시 사용)
  const deleteToken = useCallback(async () => {
    try {
      await FCMService.deleteToken();
      setToken({
        token: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("토큰 삭제 실패:", error);
    }
  }, []);

  // 권한 재요청
  const requestPermission = useCallback(async () => {
    try {
      const permission = await FCMService.requestUserPermission();
      setHasPermission(permission);
      return permission;
    } catch (error) {
      console.error("권한 요청 실패:", error);
      return false;
    }
  }, []);

  // 컴포넌트 마운트 시 FCM 초기화
  useEffect(() => {
    initializeFCM();
  }, [initializeFCM]);

  return {
    token: token.token,
    isLoading: token.isLoading,
    error: token.error,
    hasPermission,
    refreshToken,
    deleteToken,
    requestPermission,
    initializeFCM,
  };
};
