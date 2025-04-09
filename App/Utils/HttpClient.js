// import Storage from '@Utils/Storage'
// import { MAIN_BASE_URL } from './EnvVariables';

// import NavigationService from "../Services/Navigation";
import Storage from "./Storage";

// const BASE_URL = `${MAIN_BASE_URL}/api/v1/`;
const BASE_URL = 'https://ctcv2.scriptlab.in/api/student/';

async function getToken() {
    return await Storage.get('token');
}

function get(endpoint, params) {
    return request(endpoint, params);
}

function post(endpoint, params) {
    return request(endpoint, params, "POST");
}

function put(endpoint, params) {
    return request(endpoint, params, "PUT");
}

function Delete(endpoint, params) {
    return request(endpoint, params, null, "DELETE");
}

async function request(endpoint, params = null, method = 'GET') {

    // const dispatch = useDispatch()
    let token = await getToken();
    var xmlRequest = new XMLHttpRequest();
    let url = BASE_URL + endpoint;

    return new Promise((resolve, reject) => {
        xmlRequest.open(method, url, true);

        xmlRequest.setRequestHeader('Accept', '*/*');
        xmlRequest.setRequestHeader('Content-Type', 'application/json');
        console.log('token....', token);
        xmlRequest.setRequestHeader('Authorization', 'Bearer ' + token);

        if (method == 'GET') {
            xmlRequest.send();
        } else {
            xmlRequest.send(JSON.stringify(params));
            // xmlRequest.send(params);
        }

        xmlRequest.onreadystatechange = function () { // Call a function when the state changes.   
            // console.log("xmlRequest.response",xmlRequest.response)  
            if (xmlRequest.readyState === XMLHttpRequest.DONE) {
                if (xmlRequest.status === 200) {
                    resolve(JSON.parse(xmlRequest.response));
                } else {
                    try {
                        let result = JSON.parse(xmlRequest.response);
                        console.log('xmlRequest.response...', result.error);
                        // if (result.error == 'Invalid Token.') {
                        //    NavigationService.navigate('Logout');
                        // }
                        reject(result);
                    } catch (err) {
                        reject({ error: 'Server Error Please try again later !!!', actError: err });
                        console.log('err......', err);
                    }
                }
            }
        }
    })

}

// const request = async (endpoint, params = null, method = 'GET') => {
//     // let token = await AuthService.getToken();
//     let url = BASE_URL + endpoint;

//     const config = {
//       method: method,
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//     };

//     if (method != 'GET') {
//       config['body'] = JSON.stringify(params);
//     }

//     return fetch(url, config).then(response => response.json());
//   };



async function multiupload(endpoint, method, files = [], object_get = {}) {
    // let token = await getToken();

    var xmlRequest = new XMLHttpRequest();
    let url = BASE_URL + endpoint;
    console.log("url", files)

    var data = new FormData();

    let objArray = Object.keys(object_get);
    objArray.forEach((element) => {
        data.append(element, object_get[element]);
    });





    return new Promise((resolve, reject) => {
        xmlRequest.open(method, url, true);

        // xmlRequest.setRequestHeader('Accept', '/');
        xmlRequest.setRequestHeader('Content-Type', 'multipart/form-data');
        // xmlRequest.setRequestHeader('cache-control', 'no-cache');
        // xmlRequest.setRequestHeader('Authorization', token);

        files.forEach(async (element, index) => {
            // console.log("element", element)
            let get_originalname = await getOriginalname(element.path);
            // console.log("element", get_originalname)
            data.append(element.key, {
                uri: element.path,
                type: element.mime,
                name: get_originalname,
            });

            // console.log("data", data)

            if (index == (files.length - 1)) {
                console.log("data", JSON.stringify(data))
                xmlRequest.send(data);

                xmlRequest.onreadystatechange = function () { // Call a function when the state changes.   
                    if (xmlRequest.readyState === XMLHttpRequest.DONE) {
                        console.log("xmlRequest.response", xmlRequest.status)
                        if (xmlRequest.status === 200) {
                            resolve(JSON.parse(xmlRequest.response));
                        } else {
                            try {
                                reject(JSON.parse(xmlRequest.response));
                            } catch (err) {
                                reject({ error: 'Server Error Please try again later !!!', actError: err });
                            }
                        }
                    }
                }
            }
        })

    })
}

async function uplodeImage(image) {
    var formdata = new FormData();
    // formdata.append("signImage", fileInput.files[0], "/C:/Users/webhibe/Downloads/skoolin full.png");
    const newImageUri = "file:///" + image.path.split("file:/").join("");
    let get_originalname = await getOriginalname(image.path);
    console.log({
        uri: newImageUri,
        type: image.mime,
        name: get_originalname,
    });
    formdata.append("signImage", {
        uri: newImageUri,
        type: image.mime,
        name: get_originalname,
    });
    var requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
    };
    return new Promise((resolve, reject) => {
        fetch("https://new.easytodb.com/Background-verification/android_api/signImage.php", requestOptions)
            .then(response => response.json())
            .then(result => resolve(result))
            .catch(error => reject(error));
    })
}

async function getOriginalname(data) {
    let arr = data.split("/");
    let lent = Number(arr.length - 1);
    return arr[lent];
}

const HttpClient = {
    get,
    post,
    put,
    Delete,
    multiupload,
    uplodeImage
}

export default HttpClient