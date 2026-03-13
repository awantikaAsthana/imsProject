import api from "./api";


/* PRODUCTS */
export const fetchProducts = (page = 1) =>
  api.get(`/product/?page=${page}`);


/* SUPPLIERS */
export const fetchSuppliers = (page = 1) =>
  api.get(`/supplier/?page=${page}`);

export const createSupplier = (data:any) =>
  api.post(`/supplier/create`, data);


/* SUPPLY */
export const fetchSupplies = (page = 1) =>
  api.get(`/supply/history?page=${page}`);

export const createSupply = (data:any) =>
  api.post(`/supply/create`, data);