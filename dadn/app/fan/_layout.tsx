import { Slot } from "expo-router";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function FanLayout() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-100 p-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <Feather
          name="chevron-left"
          size={24}
          color="gray"
          onPress={() => router.push("../")}
        />
        <Text className="text-lg font-semibold">Thermostat</Text>
        <Feather name="settings" size={24} color="gray" />
      </View>
      <Slot />
      {/* Bottom Controls */}
      <View className="flex-row justify-around mt-auto">
        <TouchableOpacity className="items-center">
          <Feather name="zap" size={24} color="purple" />
          <Text className="text-gray-600">MODE</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Feather name="sun" size={24} color="gray" />
          <Text className="text-gray-600">ECO</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Feather name="calendar" size={24} color="gray" />
          <Text className="text-gray-600">SCHEDULE</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Feather name="clock" size={24} color="gray" />
          <Text className="text-gray-600">HISTORY</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
