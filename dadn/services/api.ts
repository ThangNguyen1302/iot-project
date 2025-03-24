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

// Xuất instance API để tái sử dụng
export default getData;
