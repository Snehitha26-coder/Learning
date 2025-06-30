import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import axiosInstance from "../../Helpers/axiosinstance";

// Safely parse localStorage "data"
let parsedData = {};
try {
  const rawData = localStorage.getItem("data");
  if (rawData && rawData !== "undefined") {
    parsedData = JSON.parse(rawData);
  }
} catch (err) {
  console.error("Error parsing localStorage data:", err);
}

const initialState = {
  isLoggedIn: typeof window !== "undefined" && localStorage.getItem("isLoggedIn") === "true",
  role: typeof window !== "undefined" ? localStorage.getItem("role") || "" : "",
  data: parsedData,
};

// ------------------ Async Thunks ------------------

const creatAccount = createAsyncThunk("/auth/signup", async (data) => {
  try {
    const res = axiosInstance.post("user/register", data);
    toast.promise(res, {
      loading: "Creating your account...",
      success: (data) => data?.data?.message,
      error: "Failed to create account",
    });
    return (await res).data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
});

const login = createAsyncThunk("/auth/login", async (data) => {
  try {
    const res = axiosInstance.post("user/login", data);
    toast.promise(res, {
      loading: "Authenticating...",
      success: (data) => data?.data?.message,
      error: "Failed to login",
    });
    return (await res).data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
});

const logout = createAsyncThunk("/auth/logout", async () => {
  try {
    const res = axiosInstance.post("user/logout");
    toast.promise(res, {
      loading: "Logging out...",
      success: (data) => data?.data?.message,
      error: "Failed to logout",
    });
    return (await res).data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
});

const updateProfile = createAsyncThunk("/user/update/profile", async (data) => {
  try {
    const res = axiosInstance.put(`user/update`, data);
    toast.promise(res, {
      loading: "Updating profile...",
      success: (data) => data?.data?.message,
      error: "Failed to update profile",
    });
    return (await res).data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
});

const getuserData = createAsyncThunk("/user/details", async () => {
  try {
    const res = axiosInstance.get("user/me");
    return (await res).data;
  } catch (error) {
    toast.error(error?.message);
  }
});

const forgetPassword = createAsyncThunk("/auth/forget-password", async (data) => {
  try {
    const res = axiosInstance.post("user/reset", data);
    toast.promise(res, {
      loading: "Sending reset email...",
      success: (data) => data?.data?.message,
      error: "Failed to process password reset",
    });
    return (await res).data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
});

const changePassword = createAsyncThunk("/auth/changePassword", async (userPassword) => {
  try {
    const res = axiosInstance.post("/user/change-password", userPassword);
    toast.promise(res, {
      loading: "Changing password...",
      success: (data) => data?.data?.message,
      error: "Failed to change password",
    });
    return (await res).data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
});

const resetPassword = createAsyncThunk("/user/reset", async (data) => {
  try {
    const res = axiosInstance.post(`/user/reset/${data.resetToken}`, { password: data.password });
    toast.promise(res, {
      loading: "Resetting password...",
      success: (data) => data?.data?.message,
      error: "Failed to reset password",
    });
    return (await res).data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
});

// ------------------ Slice ------------------

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(creatAccount.fulfilled, (state, action) => {
        localStorage.setItem("data", JSON.stringify(action?.payload?.user));
        localStorage.setItem("isLoggedIn", true);
        localStorage.setItem("role", action?.payload?.user?.role);
        state.data = action?.payload?.user;
        state.role = action?.payload?.user?.role;
        state.isLoggedIn = true;
      })

      .addCase(login.fulfilled, (state, action) => {
        localStorage.setItem("data", JSON.stringify(action?.payload?.user));
        localStorage.setItem("isLoggedIn", true);
        localStorage.setItem("role", action?.payload?.user?.role);
        state.data = action?.payload?.user;
        state.role = action?.payload?.user?.role;
        state.isLoggedIn = true;
      })

      .addCase(logout.fulfilled, (state) => {
        localStorage.clear();
        state.data = {};
        state.isLoggedIn = false;
        state.role = "";
      })

      .addCase(getuserData.fulfilled, (state, action) => {
        if (!action?.payload?.user) return;
        localStorage.setItem("data", JSON.stringify(action?.payload?.user));
        localStorage.setItem("isLoggedIn", true);
        localStorage.setItem("role", action?.payload?.user?.role);
        state.isLoggedIn = true;
        state.data = action?.payload?.user;
        state.role = action?.payload?.user?.role;
      });
  },
});

// ------------------ Exports ------------------

export {
  creatAccount,
  login,
  logout,
  updateProfile,
  getuserData,
  forgetPassword,
  changePassword,
  resetPassword,
};

export default authSlice.reducer;
