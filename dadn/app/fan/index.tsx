import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { Slider } from "@miblanchard/react-native-slider";
import { Feather } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { getData, postData } from "@/services/api";
// import { useSWR } from "swr";

export default function Thermostat() {
  const [temperature, setTemperature] = useState(22);
  const [isActive, setIsActive] = useState(false);
  const [data, setData] = useState<{ value: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getData();
        console.log("get data: ",response);
        setData(response);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 5000000);
    return () => clearInterval(interval);
  }, []);

  const handlePress = () => {
    setIsActive(!isActive);
  };

  const handleTemperatureChange = (value: number) => {
    const pushDocument = {
      value: String(value),
    };
    console.log("pushDocument: ", pushDocument);
    postData( pushDocument );
  };

  return (
    <View className="flex-1 p-4">
      {/* Thermostat Dial */}
      <View className="items-center mb-6">
        <View className="w-52 h-52 rounded-full border-8 border-gray-200 justify-center items-center bg-white">
          <Text className="text-lg text-gray-500">POWER</Text>
          <Text className="text-6xl font-bold text-gray-800">
            {temperature}
          </Text>
          <MaterialCommunityIcons name="fan" size={24} color="#87CEEB" />
        </View>
        <View className="w-2/4 h-6 mt-4">
          <Slider
            value={temperature}
            onValueChange={(value) => setTemperature(Math.round(value[0]))} // Cập nhật UI ngay khi trượt
            onSlidingComplete={(value) => handleTemperatureChange(value[0])} // Gửi API khi thả ra            minimumValue={0}
            maximumValue={100}
            step={1}
            thumbTintColor="#9b59b6"
            minimumTrackTintColor="#9b59b6"
            trackStyle={{ height: 6 }} // Tăng độ dày của thanh trượt
            thumbStyle={{ width: 18, height: 18 }} // Tăng kích thước nút trượt
          />
        </View>
      </View>

      {/* Device Selector */}
      <View className="mb-6 flex justify-center items-center">
        <TouchableOpacity
          onPress={handlePress}
          className={`min-w-1/4 rounded-full  justify-center items-center shadow-md ${
            isActive
              ? "bg-purple-500 border-purple-500"
              : "bg-white border-gray-200"
          }`}
        >
          <Text className={`${isActive ? "text-white" : "text-gray-600"} p-4`}>
            Auto Mode
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Cards */}
      <View className="flex-row justify-around mb-8">
        <View className="bg-white p-4 rounded-2xl w-36 items-center shadow-md">
          <Feather name="droplet" size={24} color="pink" />
          <Text className="text-gray-600 mt-2">Inside humidity</Text>
          <Text className="text-xl font-semibold">49%</Text>
        </View>
        <View className="bg-white p-4 rounded-2xl w-36 items-center shadow-md">
          <Feather name="thermometer" size={24} color="orange" />
          <Text className="text-gray-600 mt-2">Outside Temp.</Text>
          <Text className="text-xl font-semibold">{data[0] ? `${data[0].value}°` : "N/A"}</Text>
        </View>
      </View>
    </View>
  );
}
