import axios from "axios";

const server = axios.create({
  baseURL: "https://ecdsa-node-y4l8.onrender.com/", //"http://localhost:3042",
});

export default server;
