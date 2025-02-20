const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const fetch = require("node-fetch");
require('dotenv').config({ path: 'testing/.env.local' });
const fs = require("fs");

const BASE_URL = process.env.BASE_URL;
const UID = process.env.UID;
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync(process.env.SERVICE_ACCOUNT));
const API_KEY = process.env.API_KEY;

(async () => {
  initializeApp({
    credential: cert(SERVICE_ACCOUNT),
  });

  const customToken = await getAuth().createCustomToken(UID);

  const resp = await fetch(
    `${BASE_URL}/www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=${API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: customToken,
        returnSecureToken: true,
      }),
    },
  );
  const result = await resp.json();
  const idToken = result.idToken;
  console.log(idToken);
})();
