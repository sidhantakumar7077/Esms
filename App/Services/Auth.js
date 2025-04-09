import HttpClient from "../Utils/HttpClient"
import Storage from "../Utils/Storage";

// const login = async (data) => {
//     return HttpClient.post('login', data);
// }




// async function uplodeImage(image) {
//     var formdata = new FormData();
//     // formdata.append("signImage", fileInput.files[0], "/C:/Users/webhibe/Downloads/skoolin full.png");
//     const newImageUri = "file:///" + image.path.split("file:/").join("");
//     let get_originalname = await getOriginalname(image.path);
//     console.log({
//         uri: newImageUri,
//         type: image.mime,
//         name: get_originalname,
//     });
//     formdata.append("cv", {
//         uri: newImageUri,
//         type: image.mime,
//         name: get_originalname,
//     });
//     var requestOptions = {
//         method: 'POST',
//         body: formdata,
//         redirect: 'follow'
//     };
//     return new Promise((resolve, reject) => {
//         fetch("https://ctcv2.scriptlab.in/api/student/upload-cv", requestOptions)
//             .then(response => response.json())
//             .then(result => resolve(result))
//             .catch(error => reject(error));
//     })
// }

// async function getOriginalname(data) {
//     let arr = data.split("/");
//     let lent = Number(arr.length - 1);
//     return arr[lent];
// }


// const sendNotification = async (
//     device_token,
//     message_body,
//     title,
//     messagedata,
// ) => {
//     const serverKey = 'AAAA5zPFoTg:APA91bEHrdD-EWprtqVt32jRIwhFqBcKyvtiAuvyGO39R2oqL2v_spKEujp8f8kyQ9FQuNE-vBun7jec-u6sUNEkMTkbHH704LUdvHSklKzLwO2Cmf_K9FLtQxbRp-T6YrC8vFznCWyr';
//     const registrationToken = device_token; // Replace with the actual device token

//     const fcmEndpoint = 'https://fcm.googleapis.com/fcm/send';

//     const payload = {
//         notification: {
//             title: title,
//             body: message_body,
//         },
//         to: registrationToken,
//     };

//     const headers = {
//         'Content-Type': 'application/json',
//         'Authorization': `key=${serverKey}`,
//     };

//     fetch(fcmEndpoint, {
//         method: 'POST',
//         headers: headers,
//         body: JSON.stringify(payload),
//     })
//         .then(response => response.json())
//         .then(data => {
//             console.log('Successfully sent message:', data);
//         })
//         .catch(error => {
//             console.error('Error sending message:', error);
//         });

// }

const setToken = async (data) => {
    return Storage.set('token', data);
}
const setFCMToken = async (data) => {
    return Storage.set('fcmtoken', data);
}
const getFCMToken = async () => {
    return Storage.get('fcmtoken');
}
const setRegNum = async (data) => {
    return Storage.set('regnum', data);
}
const getToken = async () => {
    return Storage.get('token');
}
const getRegNum = async () => {
    return Storage.get('regnum');
}


// const UploadImage = (image)=>{
//      return HttpClient.singleFileUpload('uploadimage','',image);
// }
// const updateProfile = async (data) => {
//     return HttpClient.put('update', data);
// }

const AuthService = {
    // login,
    setToken,
    getToken,
    setFCMToken,
    getFCMToken,
    setRegNum,
    getRegNum,
   
    // uplodeImage,
    // sendNotification
}

export default AuthService;