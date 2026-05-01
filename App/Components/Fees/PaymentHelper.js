// src/payments/PaymentHelper.js
// ✅ NO React imports, NO hooks, NO navigation here

class PaymentHelper {
    makeTxnId() {
        const r = Math.floor(100000 + Math.random() * 900000);
        const t = String(Date.now()).slice(-4);
        return `${r}${t}`;
    }

    /**
     * Build AUTH JSON (OTSv1.1)
     */
    getJsonData(merchantDetails) {
        const {
            merchantId,
            password,
            productId,
            custAccNo,
            merchTxnId,
            txnDate,
            amount,
            custFirstName,
            custEmailId,
            custMobileNumber,
            udf1,
            udf2,
            udf3,
            udf4,
            udf5,
        } = merchantDetails;

        const payload = {
            payInstrument: {
                headDetails: { version: 'OTSv1.1', api: 'AUTH', platform: 'FLASH' },
                merchDetails: {
                    merchId: String(merchantId ?? ''),
                    userId: '',
                    password: String(password ?? ''),
                    merchTxnId: String(merchTxnId ?? ''),
                    merchTxnDate: String(txnDate ?? ''),
                },
                payDetails: {
                    amount: Number(amount ?? 0),
                    product: String(productId ?? ''),
                    custAccNo: String(custAccNo ?? ''),
                    txnCurrency: 'INR',
                },
                custDetails: {
                    custFirstName: String(custFirstName ?? 'User'),
                    custEmail: String(custEmailId ?? 'user@example.com'),
                    custMobile: String(custMobileNumber ?? '9999999999'),
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

        return JSON.stringify(payload);
    }

    /**
     * Call AUTH endpoint to get encData response
     */
    async getAtomTokenId(encStr, merchantDetails) {
        const env = String(merchantDetails?.mode ?? 'prod').toLowerCase();
        const authAPIUrl =
            merchantDetails?.authUrl ||
            (env === 'uat'
                ? 'https://caller.atomtech.in/ots/aipay/auth'
                : 'https://payment1.atomtech.in/ots/aipay/auth');

        const body =
            `encData=${encodeURIComponent(encStr)}` +
            `&merchId=${encodeURIComponent(String(merchantDetails?.merchantId ?? ''))}`;

        const resp = await fetch(authAPIUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
        });

        const txt = await resp.text();

        // Expected: encData=XXXX....
        const match = txt.match(/encData=([^&]+)/);
        if (!match?.[1]) {
            throw new Error(`AUTH API: encData not found. Raw: ${txt?.slice(0, 200)}`);
        }
        return match[1];
    }

    /**
     * ✅ IMPORTANT FIX:
     * Use merchantReturnUrl (your server callback) for WebView flow
     * Not mobilesdk/param (that is for native SDK)
     * NOTE: merchantReturnUrl should always be provided from FeesDetails component
     */
    openAipayPopUp(atomTokenId, merchantDetails) {
        const env = String(merchantDetails?.mode ?? 'prod').toLowerCase();

        // Script host
        const cdn = env === 'uat' ? 'pgtest' : 'psa';
        const atomEnv = env === 'uat' ? 'uat' : 'prod';

        // merchantReturnUrl should be provided from the parent component (FeesDetails.js)
        const returnUrl = merchantDetails?.merchantReturnUrl || '';

        if (!returnUrl) {
            console.warn('Warning: merchantReturnUrl not provided to PaymentHelper.openAipayPopUp()');
        }

        return `<!DOCTYPE html
<html lang="en">
<head>
  <title>Atom Checkout</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <p style="text-align:center;margin-top:20%;">Please wait...</p>

  <script src="https://${cdn}.atomtech.in/staticdata/ots/js/atomcheckout.js?v=${Date.now()}"></script>
  <script>
    (function(){
      var options = {
        atomTokenId: "${String(atomTokenId)}",
        merchId: "${String(merchantDetails?.merchantId ?? "")}",
        custEmail: "${String(merchantDetails?.custEmailId ?? "")}",
        custMobile: "${String(merchantDetails?.custMobileNumber ?? "")}",
        returnUrl: "${String(returnUrl)}",
        userAgent: "mobile_webView"
      };
      new AtomPaynetz(options, "${atomEnv}");
    })();
  </script>
</body>
</html>`;
    }
}

export default PaymentHelper;