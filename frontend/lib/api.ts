import axios from "axios";

export const getFiles = async () => {
  try {
    const res = await axios.get("http://localhost:8080/files");
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const deleteFileApi = async (id: string) => {
  try {
    const res = await axios.delete(`http://localhost:8080/delete/${id}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

