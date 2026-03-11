// server.js
const express = require("express");
const braintree = require("braintree");
const app = express();

// Allow JSON parsing
app.use(express.json());

// Configure Braintree Gateway (sandbox)
const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY
});

// Root route to test server
app.get("/", (req, res) => {
  res.send("Server running");
});

// Version route to confirm latest deployment
app.get("/version", (req, res) => {
  res.send("Latest version deployed!");
});

// Token route for Braintree sandbox
app.get("/token", async (req, res) => {
  try {
    const response = await gateway.clientToken.generate({});
    res.send(response.clientToken);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating token");
  }
});

// Checkout route (example, fixed amount)
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

// Listen on Render-provided port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
