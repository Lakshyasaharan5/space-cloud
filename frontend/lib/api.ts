import axios from "axios";

export const getFiles = async () => {
  try {
    const res = await axios.get("http://localhost:8080/files");
    return res.data;
  } catch (error) {
    throw error;
  }
};
