import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getData } from "../../services/api";

export const fetchSensorData = createAsyncThunk(
  "sensor/fetchSensorData",
  async () => {
    try {
      const res = await getData();
      console.log("Dữ liệu từ API sensorData:", res);
      return res;
    } catch (error) {
      console.error("Lỗi khi gọi API(redux/slices/sensorSlice):", error);
      throw error;
    }
  }
);

const sensorSlice = createSlice({
  name: "sensor",
  initialState: {
    data: null,
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSensorData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSensorData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSensorData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      });
  },
});

export default sensorSlice.reducer;
