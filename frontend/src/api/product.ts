import api from "./api";

export const getProductData = () => api.get("/product/");

export const createProduct = (data:any) =>
  api.post("/product/create", data);

export const updateProduct = (id:number,data:any) =>
  api.put(`/product/${id}`, data);

export const deleteProduct = (id:number) =>
  api.delete(`/product/${id}`);