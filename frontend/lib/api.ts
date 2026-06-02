import axios, { AxiosRequestConfig } from "axios";

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

export const searchApi = async (query: string) => {
  try {
    const config: AxiosRequestConfig = {
      params: {
        q: query
      }
    }
    const res = await axios.post("http://localhost:8080/files/search", null, config)
    console.log(res);
    return res.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}
