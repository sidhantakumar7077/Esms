const UseApi = () => {
  const BASE_URL = 'https://esmsv2.scriptlab.in/api/apicontroller/';
  const imageBaseUrl = 'https://esmsv2.scriptlab.in/';

  const Request = async (endpoint, method = 'GET', params = null) => {
    var xmlRequest = new XMLHttpRequest();
    // xmlRequest.withCredentials = true;
    let url = BASE_URL + endpoint;

    return new Promise((resolve, reject) => {
      xmlRequest.open(method, url, true);

      // xmlRequest.setRequestHeader('Accept', '*/*');
      xmlRequest.setRequestHeader('X-API-Key', '123123');
      // xmlRequest.setRequestHeader('Content-Type', 'application/json');
      // xmlRequest.setRequestHeader('Content-Type', 'multipart/form-data');
      // console.log('token....', token);
      // xmlRequest.setRequestHeader('Authorization', 'Bearer ' + token);

      if (method == 'GET') {
        xmlRequest.send();
      } else {
        let formdata = new FormData();
        let data = params;
        for (const name in data) {
          formdata.append(name, data[name]);
        }
        xmlRequest.send(formdata);
      }

      xmlRequest.onreadystatechange = function () {
        // Call a function when the state changes.
        if (xmlRequest.readyState === XMLHttpRequest.DONE) {
          // console.log('xmlRequest?.response...', xmlRequest?.response);
          let resultData;
          if (xmlRequest?.response) {
            resultData = JSON.parse(xmlRequest?.response);
            if (xmlRequest.status === 200 && resultData) {
              resolve(resultData);
            } else {
              try {
                let result = resultData;
                // let result = JSON.parse(xmlRequest.response);
                console.log('input param data...', params);
                console.log('result.error...', result.error);
                // if (result.error == 'Invalid Token.') {
                //    NavigationService.navigate('Logout');
                // }
                reject(result);
              } catch (err) {
                reject({
                  error: 'Server Error Please try again later !!!',
                  actError: err,
                });
                console.log('err......', err);
              }
            }
          } else {
            reject({error: 'Something went wrong !'});
          }
        }
      };
    });
  };

  return {Request,imageBaseUrl};
};

export default UseApi;
