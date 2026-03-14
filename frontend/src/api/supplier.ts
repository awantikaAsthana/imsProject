import api from "./api";

export const getSuppliers = (page = 1, per_page = 10) => {
  return api.get(`/supplier/?page=${page}&per_page=${per_page}`);
};

/* Party / supplier  */
export const fetchSuppliers = (page = 1) =>
  api.get(`/supplier/?page=${page}`);

export const createSupplier = (data:any) =>
  api.post(`/supplier/create`, data);

export const updateSupplier = (id:number,data:any) =>
  api.put(`/supplier/${id}`, data); 

export const deleteSupplier = (id:number) =>
  api.delete(`/supplier/${id}`);  