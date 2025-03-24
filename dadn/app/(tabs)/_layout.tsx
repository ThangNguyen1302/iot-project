import { Slot } from "expo-router";
import { View, TouchableOpacity, Text, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function FanLayout() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Favourites");
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
  return (
    <View className="flex-1 bg-gray-100 p-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-lg font-semibold">Welcome home, Thang</Text>
        <Image
          source={require("../../assets/images/cat-6602447_1280.jpg")}
          style={{ width: 40, height: 40, borderRadius: 20 }}
        />
      </View>
      
      <Slot />

      {/* Bottom Navigation */}
      <View className="flex-row justify-around mt-auto">
        {["Home", "Notify", "Scripts", "Settings"].map((icon, index) => (
          <TouchableOpacity key={index} className="items-center">
            <Feather
              name={
                icon === "Home"
                  ? "home"
                  : icon === "Notify"
                  ? "bell"
                  : icon === "Scripts"
                  ? "file-text"
                  : "settings"
              }
              size={24}
              color={icon === "Home" ? "black" : "gray"}
            />
            <Text className="text-gray-600">{icon}</Text>
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
