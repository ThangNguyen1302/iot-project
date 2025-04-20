import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<
    { message: string; time: string }[]
  >([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const storedData = await AsyncStorage.getItem("notifications");
        if (storedData) {
          setNotifications(JSON.parse(storedData));
        }
      } catch (error) {
        console.error("Lỗi khi tải thông báo:", error);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 10000); // Tải lại thông báo mỗi 10 giây
    return () => clearInterval(interval); // Dọn dẹp interval khi component unmount
  }, []);

  const clearNotifications = async () => {
    await AsyncStorage.removeItem("notifications");
    setNotifications([]);
  };

  return (
    <View className="flex-1 p-4 bg-white rounded-lg mb-8">
      <Text className="text-xl font-bold mb-4">Danh sách thông báo</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View className="p-3 border-b border-gray-300">
            <Text className="font-semibold">{item.message}</Text>
            <Text className="text-gray-500">
              {new Date(item.time).toLocaleString()}
            </Text>
          </View>
        )}
      />
      <TouchableOpacity
        className="bg-red-500 p-3 rounded-md mt-4"
        onPress={clearNotifications}
      >
        <Text className="text-white text-center">Xóa tất cả thông báo</Text>
      </TouchableOpacity>
    </View>
  );
}
