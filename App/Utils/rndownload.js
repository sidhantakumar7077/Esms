import RNFetchBlob from 'rn-fetch-blob';
import Toast from 'react-native-simple-toast';

const rndownloadFile = (url) => {
  if (!url) {
    console.error('Invalid URL');
    return;
  }

  let arr = url.split('.');
  let ext = arr[arr.length - 1];
  let { config, fs } = RNFetchBlob;
  const date = new Date();
  

  const filePath =
    fs.dirs.DownloadDir +
    '/download_' +
    Math.floor(date.getDate() + date.getSeconds() / 2) +
    '.' +
    ext;

  config({
    addAndroidDownloads: {
      useDownloadManager: true,
      notification: true,
      path: filePath,
      description: 'Downloading file...',
    },
  })
    .fetch('GET', url, {})
    .then(res => {
      console.log('The file saved to ', res.path());
      Toast.show('Successfully Downloaded!');
    })
    .catch(error => {
      console.error('Download error:', error);
      Toast.show('Download failed!')
    });
};

export default rndownloadFile;
