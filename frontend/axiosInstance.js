import axios from 'axios';

//refrence https://medium.com/@velja/token-refresh-with-axios-interceptors-for-a-seamless-authentication-experience-854b06064bde

const axiosInstance = axios.create({
    baseURL:'http://localhost:4000/'
});

//adding the access token to every outgoing req
axiosInstance.interceptors.request.use(
    (config) =>{ //Axios request configuration object. It contains everything Axios uses to make the request, such as: url,method,params, header
       const token = localStorage.getItem('access_token');
       if(token) {
         config.headers.Authorization = `Bearer ${token}`;
       }

       return config;
    },
    (error) => Promise.reject(error)
);

//This interceptor will catch 401 errors, indicative of expired tokens, and initiate the token refresh process.
axiosInstance.interceptors.response.use(
    (response) => response, //directly return response if successful
    async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry) {
      //mark req as retired
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const res = await axios.post('http://localhost:4000/token', {
          refreshToken,
        });
        localStorage.setItem('access_token', res.data.accessToken);
        localStorage.setItem('refresh_token', res.data.refreshToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return axiosInstance(originalRequest); //retry original req
      }
      catch(refreshError){
        console.error('Token refresh failed', refreshError);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
    }
);

export default axiosInstance;