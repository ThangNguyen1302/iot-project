import axios from "axios";

const API_URL = "http://10.0.101.182:8080"; // Địa chỉ API của bạn
// const API_URL = "http://localhost:8080"; // Địa chỉ API của bạn

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


