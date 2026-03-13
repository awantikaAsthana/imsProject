import api from "./api";

export const getProductData = async (page = 1, per_page = 10) => {
  const res = await api.get("/product/", {
    params: { page, per_page },
  });

  return res.data.data;
};

export const getAllProducts = () => {
  return api.get("/product/?all=true");
};

export const createProduct = (data:any) =>
  api.post("/product/create", data);

export const updateProduct = (id:number,data:any) =>
  api.put(`/product/${id}`, data);

export const deleteProduct = (id:number) =>
  api.delete(`/product/${id}`);