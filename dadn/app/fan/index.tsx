import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { Slider } from "@miblanchard/react-native-slider";
import { Feather } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { getData, postData, postAuto } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Thermostat() {
  const [temperature, setTemperature] = useState(22);
  const [isActive, setIsActive] = useState(false);
  interface SensorData {
    TimeDownload: string;
    created_at: string;
    id: string;
    value: string; // Dữ liệu từ API trả về là string, không phải number
  }
  const [data, setData] = useState<{ [key: string]: SensorData }>({});
    interface AutoData {
    hum: number;
    temperature: number;
    prediction: string;
  }

  const [autoData, setAutoData] = useState<AutoData | null>(null);
  const [fanLevel, setFanLevel] = useState(0);
  const [fanLevelAPI, setFanLevelAPI] = useState(0);

  // Lấy dữ liệu khi mở lại ứng dụng
  useEffect(() => {
    const loadFanLevel = async () => {
      const savedLevel = await AsyncStorage.getItem("fanLevel");
      if (savedLevel) {
        setFanLevel(parseInt(savedLevel, 10));
      }
      const saveMode = await AsyncStorage.getItem("isActive");
      if (saveMode) {
        setIsActive(saveMode === "true");
      }
    };
    loadFanLevel();
  }, []);

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
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await postAuto({ feed: `${isActive ? "ON" : "OFF"}` });
        console.log("fan level data",response);
        setAutoData(response); // Assuming response has a 'success' boolean field
        setFanLevelAPI(parseInt(response.prediction, 10));
        const fanLevelValue = parseInt(response.prediction, 10);
        setFanLevel(fanLevelValue);
        await AsyncStorage.setItem("fanLevel", fanLevelValue.toString());

      }
      catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };

    if (isActive) {
      const interval = setInterval(() => {
        fetchData();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  const handlePress = async () => {
    const newState = !isActive;
    setIsActive(newState);
    await AsyncStorage.setItem("isActive", newState.toString());
  };

  const handleFanLevelChange = async (value: number) => {
    const newValue = Math.round(value);
    setFanLevel(newValue);
    await AsyncStorage.setItem("fanLevel", newValue.toString());

    const pushDocument = {
      value: String(value),
      feed: "fan-level",
      feed: "fan-level",
    };
    console.log("pushDocument: ", pushDocument);
    await postData( pushDocument );
  };

  return (
    <View className="flex-1 p-4">
      {/* Thermostat Dial */}
      <View className="items-center mb-6">
        <View className="w-52 h-52 rounded-full border-8 border-gray-200 justify-center items-center bg-white">
          <Text className="text-lg text-gray-500">POWER</Text>
          <Text className="text-6xl font-bold text-gray-800">
            {fanLevel}
          </Text>
          <MaterialCommunityIcons name="fan" size={24} color="#87CEEB" />
        </View>
        <View className="w-2/4 h-6 mt-4">
          <Slider
            value={fanLevel}
            onValueChange={(value) => setFanLevel(Math.round(value[0]))} // Cập nhật UI ngay khi trượt
            onSlidingComplete={(value) => handleFanLevelChange(value[0])} // Gửi API khi thả ra            minimumValue={0}
            maximumValue={100}
            step={1}
            thumbTintColor={isActive ? "#d3d3d3" : "#9b59b6"} // Làm mờ màu khi bị vô hiệu            
            minimumTrackTintColor={isActive ? "#d3d3d3" : "#9b59b6"} 
            trackStyle={{ height: 6 }} // Tăng độ dày của thanh trượt
            thumbStyle={{ width: 18, height: 18 }} // Tăng kích thước nút trượt
            disabled={isActive} // Vô hiệu hóa khi Auto Mode bật
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
          <Text className="text-xl font-semibold">{data["bbc-hum"] ? `${data["bbc-hum"].value}°` : "N/A"}</Text>
        </View>
        <View className="bg-white p-4 rounded-2xl w-36 items-center shadow-md">
          <Feather name="thermometer" size={24} color="orange" />
          <Text className="text-gray-600 mt-2">Inside Temp.</Text>
          <Text className="text-xl font-semibold">{data["iot-project"] ? `${data["iot-project"].value}°` : "N/A"}</Text>
        </View>
      </View>
    </View>
  );
}
