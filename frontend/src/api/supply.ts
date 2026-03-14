import api from "./api";


/* PRODUCTS */
export const fetchProducts = () =>
  api.get(`/product/?all=true`);

/* Party / supplier  */
export const fetchSuppliers = (page = 1) =>
  api.get(`/supplier/?page=${page}`);

export const createSupplier = (data:any) =>
  api.post(`/supplier/create`, data);

/* SUPPLY */
export const fetchSupplies = async (page = 1, per_page = 10) => {
  const res = await api.get("/supply/history", {
    params: { page, per_page },
  });
  return res.data;
};

export const createSupply = (data:any) =>
  api.post(`/supply/create`, data);