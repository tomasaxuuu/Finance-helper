import axios from "axios";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export const api = axios.create({
  baseURL: "http://localhost:8000/api", // базовый путь
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const logout = () => api.post("/logout");

export const login = (data: LoginData) => {
  return api.post("/login", data);
};

export const register = (data: RegisterData) => {
  return api.post("/register", data);
};

export const getUser = (token: string) => {
  return api.get("/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
