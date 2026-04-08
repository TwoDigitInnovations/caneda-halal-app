/* eslint-disable prettier/prettier */
import axios from 'axios';
import Constants from './constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConnectionCheck from './ConnectionCheck';
import RNFetchBlob from 'react-native-blob-util';
import { Platform } from 'react-native';
import { navigate, reset } from '../../../navigationRef';

const GetApi = async (url, props) => {
  return new Promise(function (resolve, reject) {
    ConnectionCheck.isConnected().then(
      async connected => {
        console.log(connected);
        if (connected) {
          const user = await AsyncStorage.getItem('userDetail');
          let userDetail = JSON.parse(user);
          console.log(Constants.baseUrl + url);
          console.log(`jwt ${userDetail?.token}`);

          axios
            .get(Constants.baseUrl + url, {
              headers: {
                Authorization: `jwt ${userDetail?.token}`,
              },
            })
            .then(res => {
              // console.log(res.data);
              resolve(res.data);
            })
            .catch(async err => {
              if (err.response) {
                console.log(err.response.status);
                if (err?.response?.status === 401) {
                  // props?.setInitial('Signin');
                  await AsyncStorage.removeItem('userDetail');
                  reset('Auth')
                  reject(err.response);
                }
                resolve(err.response.data);
              } else {
                reject(err);
              }
            });
        } else {
          reject('No internet connection');
        }
      },
      err => {
        reject(err);
      },
    );
  });
};

const Post = async (url, data, props) => {
  return new Promise(function (resolve, reject) {
    ConnectionCheck.isConnected().then(
      async connected => {
        console.log(connected);
        if (connected) {
          const user = await AsyncStorage.getItem('userDetail');
          let userDetail = JSON.parse(user);
          console.log('url===>', Constants.baseUrl + url);
          console.log('token===>', `jwt ${userDetail?.token}`);
          console.log('data=====>', data);
          axios
            .post(Constants.baseUrl + url, data, {
              headers: {
                Authorization: `jwt ${userDetail?.token}`,
              },
            })
            .then(res => {
              // console.log(res.data);
              resolve(res.data);
            })
            .catch(async err => {
              if (err.response) {
                console.log(err.response.status);
                if (err?.response?.status === 401) {
                  // props?.setInitial('Signin');
                  await AsyncStorage.removeItem('userDetail');
                  reset('Auth')
                }
                resolve(err.response.data);
              } else {
                reject(err);
              }
            });
        } else {
          reject('No internet connection');
        }
      },
      err => {
        reject(err);
      },
    );
  });
};

const Postwithimage = async (url, data, props) => {
  return new Promise(function (resolve, reject) {
    ConnectionCheck.isConnected().then(
      async connected => {
        console.log(connected);
        if (connected) {
          const user = await AsyncStorage.getItem('userDetail');
          let userDetail = JSON.parse(user);
          console.log('url===>', Constants.baseUrl + url);
          console.log('token===>', `jwt ${userDetail?.token}`);
          console.log('data=====>', data);
          axios
            .post(Constants.baseUrl + url, data, {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `jwt ${userDetail?.token}`,
              },
            })
            .then(res => {
              console.log(res);
              resolve(res);
            })
            .catch(async err => {
              if (err.response) {
                console.log(err.response.status);
                if (err?.response?.status === 401) {
                  // props?.setInitial('Signin');
                  await AsyncStorage.removeItem('userDetail');
                  props?.navigation?.navigate('SignIn');
                } 
                resolve(err.response.data);
              } else {
                reject(err);
              }
            });
        } else {
          reject('No internet connection');
        }
      },
      err => {
        reject(err);
      },
    );
  });
};

const Put = async (url, data, props) => {
  return new Promise(function (resolve, reject) {
    ConnectionCheck.isConnected().then(
      async connected => {
        console.log(connected);
        if (connected) {
          const user = await AsyncStorage.getItem('userDetail');
          let userDetail = JSON.parse(user);
          console.log(Constants.baseUrl + url);
          console.log(`jwt ${userDetail?.token}`);
          axios
            .put(Constants.baseUrl + url, data, {
              headers: {
                Authorization: `jwt ${userDetail?.token}`,
              },
            })
            .then(res => {
              console.log(res.data);
              resolve(res.data);
            })
            .catch(async err => {
              if (err.response) {
                if (err?.response?.status === 401) {
                  // props?.setInitial('Signin');
                  await AsyncStorage.removeItem('userDetail');
                  reset('Auth')
                }
                resolve(err.response.data);
              } else {
                reject(err);
              }
            });
        } else {
          reject('No internet connection');
        }
      },
      err => {
        reject(err);
      },
    );
  });
};

const Delete = async (url, data, props) => {
  return new Promise(function (resolve, reject) {
    ConnectionCheck.isConnected().then(
      async connected => {
        console.log(connected);
        if (connected) {
          const user = await AsyncStorage.getItem('userDetail');
          let userDetail = JSON.parse(user);
          console.log(Constants.baseUrl + url);
          console.log(`jwt ${userDetail?.token}`);
          axios
            .delete(Constants.baseUrl + url, {
              headers: {
                Authorization: `jwt ${userDetail?.token}`,
              },
            })
            .then(res => {
              console.log(res.data);
              resolve(res.data);
            })
            .catch(async err => {
              if (err.response) {
                if (err?.response?.status === 401) {
                  // props?.setInitial('Signin');
                  await AsyncStorage.removeItem('userDetail');
                  reset('Auth')
                }
                resolve(err.response.data);
              } else {
                reject(err);
              }
            });
        } else {
          reject('No internet connection');
        }
      },
      err => {
        reject(err);
      },
    );
  });
};


const ApiFormData = async (img) => {
  console.log('asddsdsada', img);
  const user = await AsyncStorage.getItem('userDetail');
  let userDetail = JSON.parse(user);
  return new Promise((resolve, reject) => {
    try {
      RNFetchBlob.fetch(
        'POST',
        `${Constants.baseUrl}user/fileupload`,
        {
          'Content-Type': 'multipart/form-data',
          // Authorization: `jwt ${userDetail.token}`,
        },
        [
          {
            // name: 'file',
            // filename: img.path.toString(),
            // type: img.mime,
            // data: RNFetchBlob.wrap(img.path),
            name: 'file',
            filename: img.fileName,
            type: img.type,
            data: RNFetchBlob.wrap(Platform.OS === 'ios' ? img.uri.replace('file:///', '') : img.uri),
          },
        ],
      )
        .then(resp => {
          // console.log('res============>', resp);
          resolve(JSON.parse(resp.data));
        })
        .catch(err => {
          console.log(err);
          reject(err);
        });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};
// const ApiFormData = async (url, data) => {
//   // console.log(img);
//   const user = await AsyncStorage.getItem('userDetail');
//   let userDetail = JSON.parse(user);
//   return new Promise((resolve, reject) => {
//     try {
//       RNFetchBlob.fetch(
//         'POST',
//         `${Constants.baseUrl}${url}`,
//         {
//           'Content-Type': 'multipart/form-data',
//           Authorization: `jwt ${userDetail.token}`,
//         },
//         data,

//       )
//         .then(resp => {
//           // console.log('res============>', resp);
//           resolve(JSON.parse(resp.data));
//         })
//         .catch(err => {
//           console.log(err);
//           reject(err);
//         });
//     } catch (err) {
//       console.log(err);
//       reject(err);
//     }
//   });
// };
// function getDefaultOffDays(year){ 
//   let offdays=new Array();
//  let i=0;
//   for(month=0;month<12;month++) { 
//      let tdays=new Date(year, month, 0).getDate(); 
//       for(date=1;date<=tdays;date++)     {
//           smonth=(month<9)?"0"+(month+1):(month+1);
//           sdate=(date<10)?"0"+date:date;
//           dd=year+"-"+smonth+"-"+sdate;
//           var day=new Date(year,month,date);
//           if(day.getDay() == 0 )              {
//               offdays[i++]=dd;
//           }
//         }
//       }
//       return offdays; 
//     }

// const Api = async (method, url, data) => {
//   return new Promise(function (resolve, reject) {
//     ConnectionCheck.isConnected().then(async connected => {
//       console.log(connected);
//       if (connected) {
//         const user = await AsyncStorage.getItem('userDetail');
//         let userDetail = JSON.parse(user);
//         axios({
//           method,
//           url: Constants.baseUrl + url,
//           data,
//           headers: {Authorization: `jwt ${userDetail?.token}`},
//         }).then(
//           res => {
//             resolve(res);
//           },
//           err => {
//             if (err.response) {
//               resolve(err.response.data);
//             } else {
//               resolve(err);
//             }
//           },
//         );
//       } else {
//         reject('No internet connection');
//       }
//     });
//   });
// };

// const Services = async (url, method, props, data) => {
//   return new Promise(function (resolve, reject) {
//     ConnectionCheck.isConnected().then(async connected => {
//       console.log(connected);
//       if (connected) {
//         const user = await AsyncStorage.getItem('userDetail');
//         let userDetail = JSON.parse(user);
//         console.log(Constants.baseUrl + url);
//         console.log(`jwt ${userDetail?.token}`);
//         axios[method](Constants.baseUrl + url, data, {
//           headers: {
//             Authorization: `jwt ${userDetail?.token}`,
//           },
//         })
//           .then(res => {
//             console.log(res.data);
//             resolve(res.data);
//           })
//           .catch(err => {
//             if (err.response) {
//               console.log(err.response.status);
//               if (err?.response?.status === 401) {
//                 props.setInitial('Signin');
//                 props?.navigation?.navigate('Signin');
//               }
//               resolve(err.response.data);
//             } else {
//               reject(err);
//             }
//           });
//       } else {
//         reject('No internet connection');
//       }
//     });
//   });
// };

export { Post, Put, GetApi, Delete, ApiFormData,Postwithimage };
