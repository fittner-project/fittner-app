import React from "react";
import { SafeAreaView, StatusBar } from "react-native";
import FCMTest from "../components/FCMTest";

export default function FCMTestScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f5f5f5"
        translucent={false}
      />
      <FCMTest />
    </SafeAreaView>
  );
}
