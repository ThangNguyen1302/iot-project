import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { useState } from "react";
import { Feather } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useNotification } from "@/contexts/NotificationContext";

export default function Home() {
  const [activeTab, setActiveTab] = useState("Kitchen");
  const router = useRouter();
  const { notification } = useNotification(); // Sử dụng Context API

  return (
    <View className="flex-1 p-4">
      {/* {notification && (
        <View className="bg-red-500 p-4 rounded-2xl mb-4">
          <Text className="text-white font-semibold mb-2">Notification</Text>
          <Text className="text-white">
            Có sự cố xảy ra! Nhấn để xem chi tiết.
          </Text>
        </View>
      )} */}
      {/* Energy Usage Card */}
      <View className="bg-purple-500 p-4 rounded-2xl mb-6">
        <Text className="text-white font-semibold mb-2">Energy Usage</Text>
        <View className="flex-row justify-between">
          <View>
            <Text className="text-white">Today</Text>
            <Text className="text-white text-2xl font-bold">30.7 kWh</Text>
          </View>
          <View>
            <Text className="text-white">This month</Text>
            <Text className=" text-white text-2xl font-bold">235.37 kWh</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      {/* <View className="flex-row justify-around mb-6">
        {['Favourites', 'Kitchen', 'Living room'].map(renderTab)}
      </View> */}
      <TouchableOpacity
        className="bg-white p-4 rounded-2xl mb-4 shadow-md"
        onPress={() => router.push("../fan")}
      >
        <View className="flex-row items-center mb-2">
          <MaterialCommunityIcons name="fan" size={32} color="#87CEEB" />
          <Text className="text-black ml-2 text-2xl font-semibold mr-auto">
            Thermostat
          </Text>
          <Feather name="more-vertical" size={24} color="gray" />
        </View>
        <View className="flex-row items-center mt-2">
          <Feather name="droplet" size={18} color="pink" />
          <Text className="text-xl font-semibold ml-2 mr-4 text-gray-700">
            49%
          </Text>
          <Feather name="thermometer" size={18} color="orange" />
          <Text className="text-xl font-semibold ml-2 text-gray-700">29°</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-white p-4 rounded-2xl mb-4 shadow-md"
        onPress={() => router.push("../light")}
      >
        <View className="flex-row items-center mb-2">
          <Feather name="sun" size={32} color="yellow" />
          <Text className="text-black ml-2 text-2xl font-semibold mr-auto">
            Light Control
          </Text>
          <Feather name="more-vertical" size={24} color="gray" />
        </View>
        <View className="flex-row items-center mt-2">
          <Feather name="droplet" size={18} color="pink" />
          <Text className="text-xl font-semibold ml-2 mr-4 text-gray-700">
            49%
          </Text>
          <Feather name="thermometer" size={18} color="orange" />
          <Text className="text-xl font-semibold ml-2 text-gray-700">29°</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
