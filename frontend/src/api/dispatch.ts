import api from "./api";

export interface DispatchRecord {
  id: number;
  product_id: number;
  quantity: number;
  recipient: string;
  date_dispatched: string;
}

export const createDispatch = async (data: {
  product_id: number;
  quantity: number;
  recipient: string;
  party_id:number;
}) => {
  const res = await api.post("/dispatch/create", data);
  return res.data;
};

export const getDispatchHistory = async (page = 1, per_page = 20) => {
  const res = await api.get("/dispatch/history", {
    params: { page, per_page },
  });

  return res.data.data;
};