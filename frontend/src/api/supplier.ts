import api from "./api";

export const getSuppliers = (page = 1, per_page = 10) => {
  return api.get(`/supplier/?page=${page}&per_page=${per_page}`);
};

export const createSupplier = (data: {
  name: string;
  address: string;
  gst: string;
}) => {
  return api.post("/supplier/create", data);
};