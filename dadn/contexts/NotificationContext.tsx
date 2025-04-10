import React, { createContext, useContext, useEffect, useState } from "react";
import { showMessage } from "react-native-flash-message";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";

interface NotificationContextProps {
  notification: boolean;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(
  undefined
);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notification, setNotification] = useState(false);
  const router = useRouter();
  const data = useSelector((state: any) => state.sensor.data);

  useEffect(() => {
    const pirSensorValue = data?.["pir-sensor"]?.value;

    if (pirSensorValue === "1") {
      if (!notification) {
        setNotification(true);
        showMessage({
          message: "Cảnh báo!",
          description: "Cảm biến phát hiện chuyển động trong khu vực!",
          type: "warning",
          icon: "warning",
          duration: 5000,
          onPress: () => router.push("../notifications"),
        });
        saveNotification("Có vật thể di chuyển");
      }
    } else {
      setNotification(false); // reset nếu không còn báo động
    }
  }, [data]);

  const MAX_NOTIFICATIONS = 50;

  const saveNotification = async (message: string) => {
    try {
      const now = new Date().toISOString();
      const newNotification = { message, time: now };

      const existingData = await AsyncStorage.getItem("notifications");
      let notifications = existingData ? JSON.parse(existingData) : [];

      notifications.unshift(newNotification);

      if (notifications.length > MAX_NOTIFICATIONS) {
        notifications = notifications.slice(0, MAX_NOTIFICATIONS);
      }

      await AsyncStorage.setItem("notifications", JSON.stringify(notifications));
    } catch (error) {
      console.error("Lỗi khi lưu thông báo:", error);
    }
  };

  return (
    <NotificationContext.Provider value={{ notification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification phải được dùng trong NotificationProvider");
  }
  return context;
};
