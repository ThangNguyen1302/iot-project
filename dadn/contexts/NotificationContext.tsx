import React, { createContext, useState, useEffect, useContext } from "react";
import { showMessage } from "react-native-flash-message";
import { getData } from "@/services/api";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface NotificationContextProps {
  notification: boolean;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(
  undefined
);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notification, setNotification] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getData();
        console.log("API Response:", response);

        // Lấy giá trị `pir-sensor.value`
        const pirSensorValue = response?.["pir-sensor"]?.value || "0";
        const pirSensorValue1 = "1"
        // Kiểm tra nếu cảm biến phát hiện chuyển động (value = "1")
        if (pirSensorValue === "1") {
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
      } catch (error) {
        console.error("Lỗi API:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Gọi API mỗi 10 giây

    return () => clearInterval(interval);
  }, []);
  const MAX_NOTIFICATIONS = 50; // Giới hạn số lượng thông báo lưu trữ

  const saveNotification = async (message: string) => {
    try {
      const now = new Date().toISOString();
      const newNotification = { message, time: now };

      const existingData = await AsyncStorage.getItem("notifications");
      let notifications = existingData ? JSON.parse(existingData) : [];

      notifications.unshift(newNotification); // Thêm vào đầu danh sách

      // Nếu vượt quá số lượng tối đa, xóa thông báo cũ nhất
      if (notifications.length > MAX_NOTIFICATIONS) {
        notifications = notifications.slice(0, MAX_NOTIFICATIONS);
      }

      await AsyncStorage.setItem(
        "notifications",
        JSON.stringify(notifications)
      );
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
    throw new Error(
      "useNotification phải được dùng trong NotificationProvider"
    );
  }
  return context;
};
