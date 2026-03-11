app.get("/version", (req, res) => {
  res.send("Latest version deployed!");
});
const express = require("express");
const braintree = require("braintree");
const app = express();
app.use(express.json());

// Configure Braintree Gateway
const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY
});

// Routes
app.get("/", (req, res) => res.send("Server running"));
app.get("/version", (req, res) => res.send("Latest version deployed!"));
app.get("/token", async (req, res) => {
  try {
    const response = await gateway.clientToken.generate({});
    res.send(response.clientToken);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating token");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
