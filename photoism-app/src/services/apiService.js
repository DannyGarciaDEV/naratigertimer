import axios from "axios";

const API_URL = "/api"; // matches your Express routes

export const getState = async () => {
  const response = await axios.get(`${API_URL}/state`);
  return response.data;
};

export const addUser = async (name) => {
  await axios.post(`${API_URL}/addUser`, { name });
};

export const startNext = async () => {
  await axios.post(`${API_URL}/startNext`);
};

export const startTimer = async () => {
  await axios.post(`${API_URL}/startTimer`);
};

export const pauseTimer = async () => {
  await axios.post(`${API_URL}/pauseTimer`);
};
