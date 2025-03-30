import axios from "axios";


// Hàm lấy thông tin user
export const getData = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/fetch`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const postData = async (data: any) => {
  try {
    const response = await axios.post(`http://localhost:8080/push`, data, {
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
    const response = await axios.post(`http://10.0.2.2:8080/auto`, data, {
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


