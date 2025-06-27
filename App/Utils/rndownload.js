import RNFS from 'react-native-fs';
import { Platform, Alert } from 'react-native';
import Toast from 'react-native-simple-toast';
import { requestStoragePermission } from '../Utils/Permission';

const rndownloadFile = async (url) => {
  if (!url) {
    console.error('Invalid URL');
    Toast.show('Invalid URL');
    return;
  }

  const granted = await requestStoragePermission();
  if (!granted) {
    Alert.alert('Permission Denied', 'Storage permission is required to download the file.');
    return;
  }

  const date = new Date();
  const ext = url.split('.').pop().split(/\#|\?/)[0]; // handles URLs with query params
  const fileName = `download_${date.getTime()}.${ext}`;

  // Use safe directory for all Android versions
  let filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

  // Optional: For Android 10 and below, try saving to public Downloads folder
  if (Platform.OS === 'android' && Platform.Version < 30) {
    filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
  }

  const downloadOptions = {
    fromUrl: url,
    toFile: filePath,
    begin: () => {
      console.log('Download started');
    },
    progress: (res) => {
      const progress = Math.floor((res.bytesWritten / res.contentLength) * 100);
      console.log(`Downloading: ${progress}%`);
    },
  };

  try {
    const result = await RNFS.downloadFile(downloadOptions).promise;

    if (result.statusCode === 200) {
      console.log('File saved to:', filePath);
      Toast.show('Successfully Downloaded!');
    } else {
      console.warn('Failed with status code', result.statusCode);
      Toast.show('Download failed!');
    }
  } catch (error) {
    console.error('Download error:', error);
    Toast.show('Download failed!');
  }
};

export default rndownloadFile;






// import RNFetchBlob from 'rn-fetch-blob';
// import Toast from 'react-native-simple-toast';

// const rndownloadFile = (url) => {
//   if (!url) {
//     console.error('Invalid URL');
//     return;
//   }

//   let arr = url.split('.');
//   let ext = arr[arr.length - 1];
//   let { config, fs } = RNFetchBlob;
//   const date = new Date();
  

//   const filePath =
//     fs.dirs.DownloadDir +
//     '/download_' +
//     Math.floor(date.getDate() + date.getSeconds() / 2) +
//     '.' +
//     ext;

//   config({
//     addAndroidDownloads: {
//       useDownloadManager: true,
//       notification: true,
//       path: filePath,
//       description: 'Downloading file...',
//     },
//   })
//     .fetch('GET', url, {})
//     .then(res => {
//       console.log('The file saved to ', res.path());
//       Toast.show('Successfully Downloaded!');
//     })
//     .catch(error => {
//       console.error('Download error:', error);
//       Toast.show('Download failed!')
//     });
// };

// export default rndownloadFile;
