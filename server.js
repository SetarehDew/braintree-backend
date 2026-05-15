require("dotenv").config();

const express = require("express");
const braintree = require("braintree");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY
});

// Example products
const products = [
  { id: "item1", name: "Disney Mickey Figurine", price: 700.00 },
  { id: "item2", name: "Silver Necklace", price: 49.99 },
  { id: "item3", name: "Pearl Earrings", price: 19.99 },
  { id: "item4", name: "Disney Donald Duck", price: 400.00 },
  { id: "item5", name: "Disney Lion King", price: 1300.00 },
  { id: "item6", name: "Disney Dumbo", price: 750.00 },
  { id: "item7", name: "Disney Bambi", price: 350.00 },
  { id: "item8", name: "UNKNOWN", price: 600.00 },
  { id: "item9", name: "Catching The Eye", price: 340.00 },
  { id: "item10", name: "The Color of Love", price: 650.00 },
  { id: "item11", name: "Oh Yes She Did!", price: 425.00 },
  { id: "item12", name: "Riding High", price: 185.00 },
  { id: "item13", name: "The Boss", price: 300.00 },
  { id: "item14", name: "Under the Shelter of his Wings", price: 1160.00 },
  { id: "item15", name: "The Protectors of Freedom", price: 950.00 },
  { id: "item16", name: "Sisters Forever", price: 225.00 },
  { id: "item17", name: "Praise", price: 550.00 },
  { id: "item18", name: "Peace on Earth", price: 225.00 },
  { id: "item19", name: "The Joys of Spring", price: 220.00 },
  { id: "item20", name: "Tootie", price: 220.00 },
  { id: "item21", name: "Forever Friends", price: 190.00 },
  { id: "item22", name: "Gypsy", price: 275.00 },
  { id: "item23", name: "The Flower Girl", price: 95.00 },
  { id: "item24", name: "Birdy", price: 120.00 },
  { id: "item25", name: "Skeeter", price: 175.00 },
  { id: "item26", name: "Grandma", price: 430.00 },
  { id: "item27", name: "Jay Jay & Cluck", price: 190.00 },
  { id: "item28", name: "The Heirs", price: 100.00 },
  { id: "item29", name: "The Little Shepherd", price: 65.00 },
  { id: "item30", name: "UNKNOWN", price: 0.00 },
  { id: "item31", name: "Harmony", price: 50.00 },
  { id: "item32", name: "Evening Rose", price: 0.00 },
  { id: "item33", name: "Midnight", price: 750.00 },
  { id: "item34", name: "Double Hug", price: 300.00 },
  { id: "item35", name: "The Fruits of Friendship", price: 240.00 },
  { id: "item36", name: "Leap of Faith", price: 600.00 },
  { id: "item37", name: "A Bright and Morning Star", price: 100.00 },
  { id: "item38", name: "K9 and Moonshine", price: 225.00 },
  { id: "item39", name: "The Family", price: 475.00 },
  { id: "item40", name: "Heavenly Peace", price: 70.00 }

];

function calculateTotal(cart) {
  let total = 0;

  for (const item of cart) {
    const product = products.find((p) => p.id === item.id);

    if (!product) {
      throw new Error(`Invalid product id: ${item.id}`);
    }

    const qty = Number(item.qty);

    if (!Number.isInteger(qty) || qty < 1) {
      throw new Error(`Invalid quantity for ${item.id}`);
    }

    total += product.price * qty;
  }

  return total.toFixed(2);
}

app.get("/", (req, res) => {
  res.send("Server running");
});

app.get("/version", (req, res) => {
  res.send("Latest version deployed!");
});

app.get("/token", async (req, res) => {
  try {
    const response = await gateway.clientToken.generate({});
    res.send(response.clientToken);
  } catch (err) {
    console.error("Token generation error:", err);
    res.status(500).send("Error generating token");
  }
});

app.post("/checkout", async (req, res) => {
  try {
    const { nonce, cart } = req.body;

    if (!nonce) {
      return res.status(400).json({
        success: false,
        error: "Missing payment nonce"
      });
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Cart is empty"
      });
    }

    const amount = calculateTotal(cart);

    const result = await gateway.transaction.sale({
      amount,
      paymentMethodNonce: nonce,
      options: { submitForSettlement: true }
    });

    if (result.success) {
      return res.json({
        success: true,
        transactionId: result.transaction.id,
        amount
      });
    }

    return res.status(400).json({
      success: false,
      error: result.message || "Transaction failed"
    });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Error processing payment"
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});