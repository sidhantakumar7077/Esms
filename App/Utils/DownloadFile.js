import React from "react";
import { Alert, Platform, ToastAndroid } from "react-native";
import RNFS from "react-native-fs";
import RNFetchBlob from "rn-fetch-blob"; // ✅ Import this for media refresh
import { requestStoragePermission } from "./Permission";

const openAppSettings = () => {
  Alert.alert(
    "Permission Required",
    "Storage permission is required. Please enable it in settings.",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Open Settings", onPress: () => Linking.openSettings() },
    ],
    { cancelable: false }
  );
};

export const downloadFile = async (fileUrl) => {
  const hasPermission = await requestStoragePermission();
  if (!hasPermission) {
    Alert.alert(
      "Permission Denied",
      "Cannot download file without storage permission. Open Settings",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => openAppSettings() },
      ]
    );
    return;
  }

  try {
    const now = new Date();
    const timestamp = `${now.getFullYear()}${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now
    .getHours()
    .toString()
    .padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now
    .getSeconds()
    .toString()
    .padStart(2, '0')}`;
    const fileName = timestamp+fileUrl.split('/').pop().toLowerCase();
    // const fileName_pdf = fileUrl.split('/').pop().toLowerCase();
    
    // const fileName = fileUrl.split("/").pop();
    const fileExtension = fileName.split(".").pop().toLowerCase();

    let downloadDir;

    if (Platform.OS === "android") {
      // ✅ Use public directories
      const downloadPath = RNFS.DownloadDirectoryPath;
      const picturesPath = RNFS.PicturesDirectoryPath;
      const documentsPath = RNFS.ExternalStorageDirectoryPath + "/Documents";

      // ✅ Choose directory based on file type
      if (fileExtension === "pdf") {
        downloadDir = documentsPath;
      } else if (["jpg", "jpeg", "png"].includes(fileExtension)) {
        downloadDir = picturesPath;
      } else {
        downloadDir = downloadPath;
      }

      // ✅ Ensure the directory exists
      const folderExists = await RNFS.exists(downloadDir);
      if (!folderExists) {
        await RNFS.mkdir(downloadDir);
      }
    } else {
      downloadDir = RNFS.DocumentDirectoryPath; // iOS default
    }

    const downloadPath = `${downloadDir}/${fileName}`;
    // console.log("Downloading to:", downloadPath);

    // ✅ Download file
    const downloadResult = await RNFS.downloadFile({
      fromUrl: fileUrl,
      toFile: downloadPath,
    }).promise;

    if (downloadResult.statusCode === 200) {
      ToastAndroid.show(
        `Download Success. File saved to: ${downloadPath}`,
        ToastAndroid.LONG
      );

      // ✅ Refresh Media Store so file appears in file manager
      if (Platform.OS === "android") {
        RNFetchBlob.fs.scanFile([{ path: downloadPath, mime: "application/pdf" }])
          // .then(() => console.log("Media scanner refreshed"))
          // .catch(err => console.log("Media scanner error", err));
      }
    } else {
      // console.log("Download failed:", downloadResult);
    }
  } catch (error) {
    console.log("RNFS Error", error);
    Alert.alert(
      "Download Failed",
      "An error occurred while downloading the file."
    );
  }
};
// 📌Saves to Public Folders

// PDFs → Documents
// Images → Pictures
// Other files → Downloads