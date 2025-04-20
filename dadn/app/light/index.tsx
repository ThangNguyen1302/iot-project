import { View, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { postLight } from "@/services/api";

export default function LightControl() {
  const [isLightOn, setIsLightOn] = useState(false);

  const toggleLight = async () => {
    const lightData = {
      value: isLightOn ? "0" : "1",
      feed: "relay-sensor",
    };
    try {
      const response = await postLight(lightData);
      console.log("Light control response:", response);
    }
    catch (error) {
      console.error("Error toggling light:", error);
    }
    setIsLightOn(!isLightOn);
  };
  const router = useRouter();
  return (
    <View className="flex-1 p-4">
      <View className="flex-1 items-center justify-center">
        <TouchableOpacity
          onPress={toggleLight}
          className={`w-52 h-52 rounded-full flex items-center justify-center shadow-lg ${
            isLightOn ? "bg-yellow-300" : "bg-gray-300"
          }`}
        >
          <Feather name="sun" size={72} color={isLightOn ? "white" : "gray"} />
        </TouchableOpacity>
        <Text className="text-lg mt-4 text-gray-600">
          Light is {isLightOn ? "ON" : "OFF"}
        </Text>
      </View>
    </View>
  );
}
