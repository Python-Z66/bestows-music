import axios from 'axios';

const service=axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  timeout: 10000,
})

service.interceptors.response.use(
  (response)=>{
    return response.data;
  },
  (error)=>{
    return Promise.reject(error);
  }
);
export default service;
