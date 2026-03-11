const express = require("express");
const braintree = require("braintree");

const app = express();
app.use(express.json());

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY
});

app.get("/", (req, res) => {
  res.send("Server running");
});

// <-- THIS IS THE IMPORTANT TOKEN ROUTE
app.get("/token", async (req, res) => {
  try {
    const response = await gateway.clientToken.generate({});
    res.send(response.clientToken);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating token");
  }
});

app.post("/checkout", async (req, res) => {
  const nonce = req.body.nonce;
  try {
    const result = await gateway.transaction.sale({
      amount: "10.00",
      paymentMethodNonce: nonce,
      options: { submitForSettlement: true }
    });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing transaction");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
