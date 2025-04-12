import axios from "axios";
import { API_URL,API_URL_WEB  } from "@env"; 


const API_URL_ = API_URL;

// Hàm lấy thông tin user
export const getData = async () => {
  try {
    const response = await axios.get(`${API_URL_}/fetch`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const postData = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL_}/push`, data, {
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
    const response = await axios.post(`${API_URL_}/auto`, data, {
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


