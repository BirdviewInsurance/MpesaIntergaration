const express = require('express');

const app = express();
require("dotenv").config();
const cors = require('cors');
const { default: axios } = require('axios');


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
    });


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/token', (req, res) => {

    generateToken()
}
)
  

   // Middleware to generate token
 const generateToken = async (req, res, next) => {
    const secret = "pBsz2uAmsjXiyAizL9oNAk71LA48LdUoaTXaBK627VPmEy5iZgVJoUlj7pDWOMcT";
    const consumer = "4MKhZD24b0iqtIXoBbuo8hHaj0TVQI2iHt5mAvmFMjiVgrzS0fsDm8KpTUxbxPw12SYtorvGEwjFcZOU";
    const auth = new Buffer.from(`${consumer}:${secret}`).toString("base64");
    await axios
      .get(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        {
          headers: {
            authorization: `Basic ${auth}`,
          },
        }
      )
      .then((data) => {
        token = data.data.access_token;
        console.log(data.data);
        next();
      })
      .catch((err) => {
        console.log(err);
       
      });
}


app.post('/stk', generateToken ,async (req, res) => {
    const shortCode = 174379;
    const phone = req.body.phone.substring(1);
    const amount = req.body.amount;
    const passkey ="bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
  
    const date = new Date();
    const timestamp =
      date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);
    const password = new Buffer.from(shortCode + passkey + timestamp).toString(
      "base64"
    );
    const data = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: `254${phone}`,
      PartyB: 174379,
      PhoneNumber: `254${phone}`,
      CallBackURL: "https://mydomain.com/path",
      AccountReference: "Mpesa Test",
      TransactionDesc: "Testing stk push",
    };
  
    await axios
      .post(url, data, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
      .then((data) => {
        console.log(data);
        res.status(200).json(data.data);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json(err.message);
      });
 
}
)
