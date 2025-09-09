import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useFCM } from "../hooks/useFCM";

export default function FCMTest() {
  const {
    token,
    isLoading,
    error,
    hasPermission,
    refreshToken,
    deleteToken,
    requestPermission,
  } = useFCM();

  const handleRefreshToken = () => {
    Alert.alert("토큰 새로고침", "FCM 토큰을 새로고침하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "확인", onPress: refreshToken },
    ]);
  };

  const handleDeleteToken = () => {
    Alert.alert(
      "토큰 삭제",
      "FCM 토큰을 삭제하시겠습니까? (로그아웃 시 사용)",
      [
        { text: "취소", style: "cancel" },
        { text: "삭제", onPress: deleteToken, style: "destructive" },
      ]
    );
  };

  const handleRequestPermission = () => {
    requestPermission().then((granted) => {
      if (granted) {
        Alert.alert("성공", "알림 권한이 허용되었습니다.");
      } else {
        Alert.alert("실패", "알림 권한이 거부되었습니다.");
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>FCM 테스트</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>권한 상태</Text>
        <Text style={styles.statusText}>
          알림 권한: {hasPermission ? "허용됨" : "거부됨"}
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleRequestPermission}
        >
          <Text style={styles.buttonText}>권한 요청</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FCM 토큰</Text>
        {isLoading ? (
          <Text style={styles.statusText}>로딩 중...</Text>
        ) : error ? (
          <Text style={styles.errorText}>오류: {error}</Text>
        ) : token ? (
          <View>
            <Text style={styles.statusText}>토큰이 설정되었습니다</Text>
            <Text style={styles.tokenText} numberOfLines={3}>
              {token}
            </Text>
          </View>
        ) : (
          <Text style={styles.statusText}>토큰이 없습니다</Text>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.buttonHalf]}
            onPress={handleRefreshToken}
          >
            <Text style={styles.buttonText}>토큰 새로고침</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonHalf, styles.deleteButton]}
            onPress={handleDeleteToken}
          >
            <Text style={styles.buttonText}>토큰 삭제</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>사용법</Text>
        <Text style={styles.instructionText}>
          1. 권한 요청 버튼을 눌러 알림 권한을 허용하세요{"\n"}
          2. FCM 토큰이 자동으로 생성됩니다{"\n"}
          3. 이 토큰을 서버에 전송하여 푸시메시지를 받을 수 있습니다{"\n"}
          4. 로그아웃 시 토큰 삭제 버튼을 사용하세요
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  section: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
  statusText: {
    fontSize: 16,
    marginBottom: 15,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    marginBottom: 15,
    color: "#e74c3c",
  },
  tokenText: {
    fontSize: 12,
    fontFamily: "monospace",
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    color: "#495057",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonHalf: {
    flex: 1,
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666",
  },
});
