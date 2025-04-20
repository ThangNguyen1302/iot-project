import { Slot } from "expo-router";
import { View, TouchableOpacity, Text, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store"; // Import AppDispatch type
import { fetchSensorData } from "../../redux/slices/sensorSlice"; // Import Redux action
export default function FanLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("Favourites");
  const dispatch = useDispatch<AppDispatch>();

  const renderTab = (tab: string) => (
    <TouchableOpacity
      key={tab}
      className={`px-4 py-2 rounded-full ${
        activeTab === tab ? "bg-white" : "bg-gray-200"
      }`}
      onPress={() => setActiveTab(tab)}
    >
      <Text className={`${activeTab === tab ? "text-black" : "text-gray-500"}`}>
        {tab}
      </Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    // Gọi API mỗi 5 giây
    const interval = setInterval(() => {
      dispatch(fetchSensorData());
    }, 10000);

    return () => clearInterval(interval); // cleanup khi unmount
  }, []);
  return (
    <View className="flex-1 bg-gray-100 p-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6 mt-6">
        <Text className="text-lg font-semibold">Welcome home, Thang</Text>
        <Image
          source={require("../../assets/images/cat-6602447_1280.jpg")}
          style={{ width: 40, height: 40, borderRadius: 20 }}
        />
      </View>
      <Slot />
      {/* Bottom Navigation */}

      <View className="flex-row justify-around mt-auto">
        {[
          { name: "Home", route: "/" },
          { name: "Notify", route: "/notifications" },
          { name: "Scripts", route: "/scripts" },
          { name: "Settings", route: "/settings" },
        ].map((tab, index) => (
          <TouchableOpacity
            key={index}
            className="items-center"
            onPress={() => router.push(tab.route as any)}
          >
            <Feather
              name={
                tab.name === "Home"
                  ? "home"
                  : tab.name === "Notify"
                  ? "bell"
                  : tab.name === "Scripts"
                  ? "file-text"
                  : "settings"
              }
              size={24}
              color={pathname === tab.route ? "black" : "gray"}
            />
            <Text
              className={
                pathname === tab.route ? "text-black" : "text-gray-600"
              }
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Floating Button */}
      <TouchableOpacity className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-purple-500 w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
