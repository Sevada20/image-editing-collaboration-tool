import axios from "axios";

const API_URL = "http://localhost:5000/api";

const handleErrors = (error) => {
  console.error("API Error:", error);
  if (error.response) {
    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      "Server error";
    throw new Error(message);
  }
  throw new Error("Network error - please check your connection");
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getImages = async () => {
  try {
    const response = await api.get("/images");
    return response.data;
  } catch (error) {
    console.error("Error fetching images:", error);
    handleErrors(error);
  }
};

export const uploadImage = async (formData) => {
  try {
    const response = await api.post("/images/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    handleErrors(error);
  }
};

export const deleteImage = async (imageId) => {
  try {
    const response = await api.delete(`/images/${imageId}`);
    return response.data;
  } catch (error) {
    handleErrors(error);
  }
};

export const editImage = async (imageId, editData) => {
  try {
    const response = await api.put(`/images/${imageId}/edit`, editData);
    return response.data;
  } catch (error) {
    handleErrors(error);
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    handleErrors(error);
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    handleErrors(error);
  }
};

export const saveImageEdit = async (imageData) => {
  try {
    const response = await api.post("/images/edit", imageData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    handleErrors(error);
  }
};

export const setupWebSocket = (token, onMessageCallback) => {
  const socket = new WebSocket(
    `ws://localhost:5000/collaborate?token=${token}`
  );

  socket.onopen = () => {
    console.log("WebSocket connection established");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessageCallback(data);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("WebSocket connection closed");
  };

  return socket;
};

export const sendToWebSocket = (socket, data) => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  } else {
    console.error("WebSocket is not open");
  }
};

export const saveImageChanges = async (imageId, imageData) => {
  try {
    const response = await api.post(`/images/${imageId}/save`, imageData);
    return response.data;
  } catch (error) {
    console.error("Error in saveImageChanges:", error);
    handleErrors(error);
  }
};

export const getImage = async (imageId) => {
  try {
    const response = await api.get(`/images/${imageId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching image:", error);
    handleErrors(error);
  }
};
