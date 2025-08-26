import axios from "axios";

const flatAxios = axios.create({
  baseURL: "https://api.flat.io/v2",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: process.env.NEXT_PUBLIC_FLAT_KEY as string,
  },
});

export default flatAxios;
