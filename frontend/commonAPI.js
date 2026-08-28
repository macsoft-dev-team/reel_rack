// const APIURL = import.meta.env.VITE_API_URL;

// const getApi = async (params) => {
//   const { endPoint, filter } = params;
//   try {
//     const response = await axios.get(`${APIURL}/${endPoint}`, {
//       params: filter,
//     });
//     return response.data;
//   } catch (error) {
//     console.log(error);
//   }
// };

// const postApi = async (params) => {
//   const { endPoint, data } = params;
//   try {
//     const response = await axios.post(`${APIURL}/${endPoint}`, data);
//     return response.data;
//   } catch (error) {
//     console.log(error);
//   }
// };

// const putApi = async (params) => {
//   const { endPoint, data, id } = params;
//   try {
//     const response = await axios.put(`${APIURL}/${endPoint}/${id}`, data);
//     return response.data;
//   } catch (error) {
//     console.log(error);
//   }
// };

// const deleteApi = async (params) => {
//   const { endPoint, id } = params;
//   try {
//     const response = await axios.delete(`${APIURL}/${endPoint}/${id}`);
//     return response.data;
//   } catch (error) {
//     console.log(error);
//   }
// };
