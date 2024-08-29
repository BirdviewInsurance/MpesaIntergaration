const express = require('express');
const app = express();
require("dotenv").config();
const cors = require('cors');
const axios = require('axios');

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/access_token', access, (req, res) => {
    res.status(200).json({ access_token: req.access_token });
});

app.get('/register', access, async (req, res) => {
    const url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl";
    const auth = `Bearer ${req.access_token}`;

    try {
        const response = await axios.post(url, {
            ShortCode: "174379",
            ResponseType: "Complete",
            ConfirmationURL: "https://7700-41-90-182-12.ngrok-free.app/confirmation",
            ValidationURL: "https://7700-41-90-182-12.ngrok-free.app/validation_url"
        }, {
            headers: {
                "Authorization": auth,
                "Content-Type": "application/json"
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.log(error.response ? error.response.data : error.message);
        res.status(500).send(error.response ? error.response.data : error.message);
    }
});

app.post('/confirmation', (req, res) => {
    console.log("............................Confirmation..............................");
    console.log(req.body);
    // Acknowledge receipt of the confirmation
    res.status(200).send("Confirmation received");
});

app.post('/validation_url', (req, res) => {
    console.log("............................Validation URL..............................");
    console.log(req.body);
    // Acknowledge receipt of the validation request
    res.status(200).send("Validation received");
});

app.get('/simulate', access, async (req, res) => {
    let url = "";
    let auth = `Bearer ${req.access_token}`;

    try {
        url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate";
        const response = await axios.post(url, {
            ShortCode: "174379",
            CommandID: "CustomerPayBillOnline",
            Amount: "100",
            Msisdn: "254708374149",
            BillRefNumber: "TestAPI"
        }, {
            headers: {
                "Authorization": auth,
                "Content-Type": "application/json"
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.log(error.response ? error.response.data : error.message);
        res.status(500).send(error.response ? error.response.data : error.message);
    }
});
 
app.get('/balance', access, async (req, res) => {
    let endpoint = "https://sandbox.safaricom.co.ke/mpesa/accountbalance/v1/query";
    let auth = `Bearer ${req.access_token}`;

    try {
        const response = await axios.post(endpoint, {
            Initiator: "testapi",
            SecurityCredential: "eyziF84rM0XoC+wZ2OLcYexZ8tYMLwp6RLRgq/t3cuPhnFl7vGfhdo+tswc9Bfdw4ez+jjEbNdKiIvYVHwudmTsN7ZO6lw24TGHBzAVHv4BLziNvXQ0n8SNUxnzXyjzajlQxgoAjp0K9GmbwhVmEzytLHyDF8MiZdB7YuxfKaUCYM2skgKYPIfyu0nieGj/Dvz1AXx7uDfuX2eM6yxmc0leo/KCf7SL9WJvrF0gOt42WxeRLQjujkmdYioNaDeTZ3LCLDA6DHgg0vPNziHzPYgMaLi+ERN4LJx9OhbkLaz+xf42FzyutcjbvmsrTKYHgbnlJfGCphzeYLcTC6Gls4Q==",
            CommandID: "AccountBalance",
            PartyA: "174379",
            IdentifierType: "4",
            Remarks: "Remarks",
            QueueTimeOutURL: "https://7700-41-90-182-12.ngrok-free.app/timeout_url",
            ResultURL: "https://7700-41-90-182-12.ngrok-free.app/result_url"
        }, {
            headers: {
                "Authorization": auth,
                "Content-Type": "application/json"
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.log(error.response ? error.response.data : error.message);
        res.status(500).send(error.response ? error.response.data : error.message);
    }
});

app.post('/timeout_url', (req, res) => {
    console.log("............................Timeout URL..............................");
    console.log(req.body);
    // Acknowledge receipt of the timeout request
    res.status(200).send("Timeout received");
});


app.post('/result_url', (req, res) => {
    console.log("............................Result URL..............................");
    console.log(req.body );
    // Acknowledge receipt of the result request
    res.status(200).send("Result received");
});

app.get('/stk', access, async (req, res) => {
    const endpoint = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
    const auth = `Bearer ${req.access_token}`;
    const shortcode = "174379";
    const pass_key = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
    
    // Correct the timestamp generation
    const datenow = new Date();
    const timestamp = datenow.getFullYear() +
                      ("0" + (datenow.getMonth() + 1)).slice(-2) + // Month is zero-indexed
                      ("0" + datenow.getDate()).slice(-2) +
                      ("0" + datenow.getHours()).slice(-2) +
                      ("0" + datenow.getMinutes()).slice(-2) +
                      ("0" + datenow.getSeconds()).slice(-2);
    
    // Generate the password
    const password = Buffer.from(`${shortcode}${pass_key}${timestamp}`).toString('base64');

    try {
        const response = await axios.post(endpoint, {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: "1",
            PartyA: "254790359782",
            PartyB: shortcode,
            PhoneNumber: "254790359782",
            CallBackURL: "https://7700-41-90-182-12.ngrok-free.app/stk_callback",
            AccountReference: "123Test",
            TransactionDesc: "Processing"
        }, {
            headers: {
                "Authorization": auth,
                "Content-Type": "application/json"
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.log(error.response ? error.response.data : error.message);
        res.status(500).send(error.response ? error.response.data : error.message);
    }
});
        
app.post('/stk_callback', (req, res) => {
    console.log("..........................STK.........................");
    console.log(req.body);
    res.status(200).send("STK Callback received");
});
 



async function access(req, res, next) {
    const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

    const consumer_key = "qtIXoBbuo8hHaj0TVQI2iHt5mAvmFMjiVgrzS0fsDm8KpTUx";
    const consumer_secret = "pBsz2uAmsjXiyAizL9oNAk71LA48LdUoaTXaBK627VPmEy5iZgVJoUlj7pDWOMcT";

    const auth = Buffer.from(`${consumer_key}:${consumer_secret}`).toString('base64');

    try {
        const response = await axios.get(url, {
            headers: {
                "Authorization": `Basic ${auth}`
            }
        });
        req.access_token = response.data.access_token;
        console.log("toke",response)
      
        next();
    } catch (error) {
        console.log(error.response ? error.response.data : error.message);
        res.status(500).send(error.response ? error.response.data : error.message);
    }
}
