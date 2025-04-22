import axios from "axios";
// import * as Network from 'expo-network';

const API_URL = process.env.EXPO_PUBLIC_API_URL1; // Địa chỉ API của bạn
console.log("API_URL: ", API_URL);
// let ipAddress;
// Network.getIpAddressAsync().then(ip => {
//   ipAddress = ip;
//   console.log("IP Address: ", ipAddress);
// }).catch(error => {
//   console.error("Error getting IP address: ", error);
// });

// Hàm lấy thông tin user
export const getData = async () => {
  try {
    const response = await axios.get(`${API_URL}/fetch`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const postData = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/push`, data, {
      headers: {
        "Content-Type": "application/json", // Đảm bảo gửi đúng JSON
      },
    });    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const postAuto = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/auto`, data, {
      headers: {
        "Content-Type": "application/json", // Đảm bảo gửi đúng JSON
      },
    });    console.log("postAuto: ",response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const postLight = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/push`, data, {
      headers: {
        "Content-Type": "application/json", // Đảm bảo gửi đúng JSON
      },
    });
    console.log("postLight: ",response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
}

export const postAutomaticMode = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/push`, data, {
      headers: {
        "Content-Type": "application/json", // Đảm bảo gửi đúng JSON
      },
    });
    console.log("postAutomaticMode: ",response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
}


