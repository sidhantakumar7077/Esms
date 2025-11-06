import React, { useState, useRef } from "react";
import {
  Linking,
  NativeModules,
  ToastAndroid,
  Alert,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import PaymentHelper from "./PaymentHelper";
const { NdpsAESLibrary } = NativeModules;

function Payment({ route, navigation }) {
  const INJECT_JS =
    'window.ReactNativeWebView.postMessage(document.getElementsByTagName("h5")[0].innerHTML)';
  const htmlPage = route.params.htmlPage;
  const merchantDetails = route.params.merchantDetails;

  // flag to track if current webview url contains mobilesdk/param
  const [isOnMobileSdkParam, setIsOnMobileSdkParam] = useState(false);

  // Optional: keep last known nav url in ref for debugging
  const lastNavUrlRef = useRef("");

  const decryptFinalResponse = async (data) => {
    console.log("decryptFinalResponse", data);
    let splitStr = String(data).split("|");
    let responseToastMsg = "";

    // defensive: ensure splitStr[1] exists
    if (!splitStr[1] || !splitStr[1].includes("encData")) {
      console.warn("No encData token found in payload");
      return;
    }

    let splitEncData = splitStr[1].split("=");
    if (splitEncData[1] === "cancelTransaction") {
      console.log("Transaction has been cancelled");
      responseToastMsg = "Transaction has been cancelled";
    } else {
      try {
        const decryptedStr = await NdpsAESLibrary.ndpsDecrypt(
          splitEncData[1],
          merchantDetails.res_enc_key
        );
        var parsedResponse = JSON.parse(decryptedStr);
        const ndps = new PaymentHelper();
        let signatureStr = ndps.createSigStr(parsedResponse); // create signature string
        const generatedSignatureStr = await NdpsAESLibrary.calculateHMAC(
          signatureStr,
          merchantDetails.response_hash_key
        ); // hashing signature string with native function
        console.log("generatedSignatureStr:", generatedSignatureStr);
        console.log(
          "responseSignature:",
          parsedResponse?.payInstrument?.payDetails?.signature
        );
        if (
          generatedSignatureStr ===
          parsedResponse?.payInstrument?.payDetails?.signature
        ) {
          const statusCode =
            parsedResponse?.payInstrument?.responseDetails?.statusCode;
          if (statusCode == "OTS0000" || statusCode == "OTS0551") {
            console.log("Transaction success");
            responseToastMsg = "Transaction success";
          } else {
            console.log("Transaction failed");
            responseToastMsg = "Transaction failed";
          }
        } else {
          console.log("Signature mismatched ! Transaction failed");
          responseToastMsg = "Transaction failed";
        }
      } catch (e) {
        console.log("unable to decrypt", e);
        responseToastMsg = "Transaction failed";
      }
    }

    // show toast messages as per the transaction status
    if (Platform.OS === "android") {
      ToastAndroid.show(responseToastMsg, ToastAndroid.SHORT);
    } else {
      Alert.alert(responseToastMsg);
    }
    // closing WebView and return to previous screen once transaction response received
    navigation.goBack();
  };

  return (
    <WebView
      style={{ flex: 1 }}
      originWhitelist={["https://*", "upi://*"]}
      source={{ html: htmlPage }}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      renderLoading={this?.LoadingIndicatorView}
      startInLoadingState={true}
      onShouldStartLoadWithRequest={(request) => {
        const url = request.url;
        console.log("onShouldStartLoadWithRequest URL:", url);

        if (url.startsWith("upi:")) {
          Linking.openURL(url).catch((e) => {
            alert(
              "Error occurred !! \nKindly check if you have UPI apps installed or not!"
            );
          });
          return false;
        }

        // If request.url contains mobilesdk/param, update flag
        const found = url.includes("mobilesdk/param");
        if (found) {
          console.log("✅ mobilesdk/param detected in onShouldStartLoadWithRequest:", url);
          setIsOnMobileSdkParam(true);
        } else {
          // optionally reset flag if not present (depends on your flow)
          setIsOnMobileSdkParam(false);
        }

        return true;
      }}
      onNavigationStateChange={(navState) => {
        console.log("onNavigationStateChange URL:", navState.url);
        lastNavUrlRef.current = navState.url || "";

        if ((navState.url || "").includes("mobilesdk/param")) {
          console.log(
            "✅ mobilesdk/param detected via navigation state:",
            navState.url
          );
          setIsOnMobileSdkParam(true);
        } else {
          setIsOnMobileSdkParam(false);
        }
      }}
      onMessage={(event) => {
        const data = String(event.nativeEvent.data || "");
        console.log("onMessage data (len):", data.length);

        // only proceed when encData present AND we are on mobilesdk/param url
        if (data.includes("encData")) {
          if (isOnMobileSdkParam) {
            console.log("encData found and isOnMobileSdkParam is true -> decrypting");
            decryptFinalResponse(data);
          } else {
            console.warn(
              "encData found but mobilesdk/param not detected yet. lastNavUrl:",
              lastNavUrlRef.current
            );
          }
        }
      }}
      injectedJavaScript={INJECT_JS}
      onError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        alert("WebView error: " + JSON.stringify(nativeEvent));
      }}
    />
  );
}

export default Payment;