import api from "./api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "superadmin" | "user";
  status: "active" | "suspended";
  created_at: string;
}

export const getUsers = async (
  page = 1,
  limit = 10,
  search = ""
) => {
  const res = await api.get("/auth/users", {
    params: { page, limit, search },
  });
  return res.data.data;
};

export const createAdmin = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const res = await api.post("/auth/admin/create", data);
  return res.data;
};

export const updateUserStatus = async (
  userId: number,
  status: "active" | "suspended"
) => {
  const res = await api.patch(`/auth/users/${userId}/status`, {
    status,
  });

  return res.data;
};