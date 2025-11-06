class PaymentHelper {
  // Build the JSON exactly as the NDPS sample expects
  getJsonData(merchantDetails) {
    const {
      merchantId,
      password,
      merchTxnId,
      txnDate,
      amount,
      productId,
      custFirstName,
      custEmailId,
      custMobileNumber,
      udf1,
      udf2,
      udf3,
      udf4,
      udf5,
      paymentMode, // optional
    } = merchantDetails;

    const base = {
      payInstrument: {
        headDetails: { version: 'OTSv1.1', api: 'AUTH', platform: 'FLASH' },
        merchDetails: {
          merchId: String(merchantId),
          userId: '', // per sample
          password: String(password),
          merchTxnId: String(merchTxnId),
          merchTxnDate: String(txnDate),
        },
        payDetails: {
          amount: Number(amount),
          product: String(productId),
          custAccNo: '213232323', // from sample
          txnCurrency: 'INR',
        },
        custDetails: {
          custFirstName: String(custFirstName),
          custEmail: String(custEmailId),
          custMobile: String(custMobileNumber),
        },
        extras: {
          udf1: String(udf1 ?? ''),
          udf2: String(udf2 ?? ''),
          udf3: String(udf3 ?? ''),
          udf4: String(udf4 ?? ''),
          udf5: String(udf5 ?? ''),
        },
      },
    };

    if (paymentMode) {
      base.payInstrument.payModeSpecificData = { subChannel: String(paymentMode) };
    }

    return JSON.stringify(base);
  }

  // Build the HTML page that loads AtomPaynetz and opens the cashier
  openAipayPopUp(atomTokenId, merchantDetails) {
    const isUat = String(merchantDetails.mode).toLowerCase() === 'uat';
    const setReturnUrl = isUat
      ? 'https://pgtest.atomtech.in/mobilesdk/param'
      : 'https://payment.atomtech.in/mobilesdk/param';
    const cdnVal = isUat ? 'pgtest' : 'psa';
    const env = isUat ? 'uat' : 'prod';

    // NOTE: env passed into AtomPaynetz matches your mode
    const htmlPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>AtomInstaPay</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <p style="text-align:center;margin-top:20%;">Please wait</p>
  <script src="https://${cdnVal}.atomtech.in/staticdata/ots/js/atomcheckout.js?v=${Date.now()}"></script>
  <script>
    function openPay(){
      const options = {
        atomTokenId: "${atomTokenId}",
        merchId: "${merchantDetails.merchantId}",
        custEmail: "${merchantDetails.custEmailId}",
        custMobile: "${merchantDetails.custMobileNumber}",
        returnUrl: "${setReturnUrl}",
        userAgent: "mobile_webView"
      };
      var atom = new AtomPaynetz(options, "${env}");
    }
    openPay();
  </script>
</body>
</html>`;
    return htmlPage;
  }

  // Call NDPS auth and return ONLY the encrypted token string (encData) safely
  async getAtomTokenId(encStr, merchantDetails) {
    const isUat = String(merchantDetails.mode).toLowerCase() === 'uat';
    const authAPIUrl = isUat
      ? 'https://caller.atomtech.in/ots/aipay/auth'
      : 'https://payment1.atomtech.in/ots/aipay/auth';

    // Always URL-encode values
    const body = `encData=${encodeURIComponent(encStr)}&merchId=${encodeURIComponent(
      merchantDetails.merchantId
    )}`;

    const res = await fetch(authAPIUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    const text = await res.text();

    if (!res.ok) {
      throw new Error(`Auth HTTP ${res.status}: ${text}`);
    }

    // Parse "key=value&key2=value2" pairs safely (order-agnostic)
    const params = {};
    text.split('&').forEach((pair) => {
      const [k, v = ''] = pair.split('=');
      if (k) params[k] = decodeURIComponent(v);
    });

    if (!params.encData) {
      // Some error responses are plain text/HTML/JSON. Help debugging by throwing the whole body.
      throw new Error(`encData missing in auth response: ${text}`);
    }

    return params.encData; // encrypted payload to decrypt for token validation
  }

  // Build signature input string for HMAC verification (unchanged from sample)
  createSigStr(parsedResponse) {
    const pi = parsedResponse['payInstrument'];
    const merchId = String(pi['merchDetails']['merchId']);
    const atomTxnId = String(pi['payDetails']['atomTxnId']);
    const merchTxnId = String(pi['merchDetails']['merchTxnId']);
    const totalAmount = Number(pi['payDetails']['totalAmount']).toFixed(2);
    const statusCode = String(pi['responseDetails']['statusCode']);

    // subChannel can be string or array depending on gateway; handle both
    const sub = pi?.['payModeSpecificData']?.['subChannel'];
    const subChannel = Array.isArray(sub) ? String(sub[0]) : String(sub ?? '');

    const bankTxnId = String(
      pi?.['payModeSpecificData']?.['bankDetails']?.['bankTxnId'] ?? ''
    );

    return merchId + atomTxnId + merchTxnId + totalAmount + statusCode + subChannel + bankTxnId;
  }
}

export default PaymentHelper;