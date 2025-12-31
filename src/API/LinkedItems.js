import axios from "axios";

const LinkedAPI = axios.create({
  baseURL: "https://pmtoolapidev.digitaly.live/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

LinkedAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}
);



export const createLink = async (payload) => {
  const res = await LinkedAPI.post(`/links`, payload);
  return res.data;
};

export const getLinksByItemId = async (itemId) => {
  const res = await LinkedAPI.get(`/links`, {
    params: { item_id: itemId },
  });
  return res.data;
};

export const getLinkById = async (linkId) => {
  const res = await LinkedAPI.get(`/links/${linkId}`);
  return res.data;
};



export const deleteLinkById = async (linkId) => {
  const res = await LinkedAPI.delete(`/links/${linkId}`);
  return res.data;
};



