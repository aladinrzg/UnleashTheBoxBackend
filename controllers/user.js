import User from "../models/user.js";
import BattlePassTier from "../models/battlePassTier.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Stripe from "stripe";

export async function signin(req, res) {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.TOKENSECRET;
  if (!user) {
    return res.status(400).send("this user not found");
  }
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    // here we compare the passwordHash with the password from request body
    const token = jwt.sign(
      {
        userId: user._id,
        //isAdmin: user.isAdmin,
      },
      secret, // the secret keeyyyyyyy issss heeeerreeeeeeee !!!!!!!!!!!
      { expiresIn: "1d" } // our authentication token will expire after 1day
    );

    res.status(200).send({
      username: user.username,
      mail: user.email,
      diamonds: user.diamonds,
      coins: user.coins,
      score: user.score,
      hasBattlePass: user.hasBattlePass,
      battlePassTier: user.battlePassTier,
      token: token,
    });
  } else {
    res.status(400).json({ Message: "Invalid credentials" });
  }
}

// register (for the user)
export async function signup(req, res) {
  let user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10), // crypting the password and 10 is the salt its like extra information for secret
  });

  user = await user.save();
  if (!user) {
    return res.status(404).send("this user cant be registered ");
  }

  res.send(user);
}

export async function forgotPassword(req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send("This email is not registered");
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.TOKENSECRET,
      { expiresIn: "1h" }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: user.email,
      subject: "Reset Password Link",
      text:
        `Hello ${user.username},\n\n` +
        `You recently requested to reset your password for your account.` +
        `Please click on the following link to reset your password: ${process.env.CLIENT_URL}/user/resetPassword/${token}\n\n` +
        `This link will expire in 1 hour.` +
        `If you did not request a password reset, please ignore this email.\n`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).send("Email could not be sent");
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).send("Reset password email sent successfully");
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
}

export async function resetPassword(req, res) {
  try {
    const token = req.params.token;
    if (!token) {
      return res.status(400).send("Invalid request");
    }

    const decodedToken = jwt.verify(token, process.env.TOKENSECRET);
    if (!decodedToken.userId || !decodedToken.email) {
      return res.status(400).send("Invalid token");
    }

    const user = await User.findOne({
      _id: decodedToken.userId,
      email: decodedToken.email,
    });
    if (!user) {
      return res.status(400).send("Invalid token");
    }

    user.password = bcrypt.hashSync(req.body.password, 10);
    await user.save();

    return res.status(200).send("Password reset successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
}

//const stripe = new Stripe('sk_test_51MzXKaKhDbX32SFKCy1HLYLNgA4Ij5gBNWqOxvh8km7NGqlorw1xCEOPORn4SMA1AheCm2Ule2kGcSYHX3fsNEvr00yz5rLVTp');
const stripe = new Stripe(
  "sk_test_51MzXKaKhDbX32SFKCy1HLYLNgA4Ij5gBNWqOxvh8km7NGqlorw1xCEOPORn4SMA1AheCm2Ule2kGcSYHX3fsNEvr00yz5rLVTp"
);

// export async function purchaseDiamonds(req, res) {
//   try {
//     const { userIdS, paymentMethodId, diamonds, amount } = req.body;

//     const token = req.headers.authorization.split(" ")[1];
//     const decodedToken = jwt.verify(token, process.env.TOKENSECRET);
//     const userId = decodedToken.userId;

//     // Create a payment intent
//     const paymentIntent = await stripeClient.paymentIntents.create({
//       amount: amount,
//       currency: "usd",
//       payment_method: paymentMethodId,
//       confirm: true,
//       customer: userIdS,
//     });

//     if (paymentIntent.status === "succeeded") {
//       // Update the user's diamonds balance
//       const user = await User.findById(userId);
//       if (!user) {
//         return res.status(404).send("User not found");
//       }

//       user.wallet += parseInt(diamonds);
//       await user.save();

//       return res.status(200).send({
//         message: "Diamonds purchase successful",
//         diamonds: user.wallet,
//       });
//     } else {
//       return res.status(400).send("Payment failed");
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send("Internal Server Error");
//   }
// }

export async function purchaseDiamonds(req, res) {
  try {
    const { diamondAmount, tokenId } = req.body;

    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKENSECRET);
    const userId = decodedToken.userId;

    if (!diamondAmount || !tokenId) {
      return res.status(400).json({ error: "Missing required parameters." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Define the price of a single diamond (in cents)
    const diamondPrice = 100; // e.g., $1.00

    // Calculate the total cost of the purchase
    const totalCost = diamondPrice * diamondAmount;

    // Create a charge using the Stripe API
    const charge = await stripe.charges.create({
      amount: totalCost,
      currency: "usd",
      source: tokenId,
      description: `Purchase of ${diamondAmount} diamonds`,
    });

    // Update user's diamonds count
    user.diamonds += diamondAmount;
    await user.save();

    res.status(200).json({ message: "Diamonds purchased successfully.", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong with the purchase." });
  }
}

export async function updateBattlePassTier(req, res) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKENSECRET);
    const userId = decodedToken.userId;

    const { gainedXP } = req.body;

    if (!userId || !gainedXP) {
      return res
        .status(400)
        .json({ error: "userId and gainedXP are required" });
    }

    const user = await User.findById(userId);
    const currentTier = await BattlePassTier.findOne({
      tier: user.battlePassTier,
    });

    if (user.score + gainedXP >= currentTier.requiredXP) {
      const nextTier = await BattlePassTier.findOne({
        tier: user.battlePassTier + 1,
      });

      if (nextTier) {
        user.battlePassTier = nextTier.tier;
      } else {
        console.log("no Next BattlePassTier");
      }
    }

    user.score += gainedXP;
    await user.save();

    res
      .status(200)
      .json({ message: "Battle pass tier updated successfully", user });
  } catch (error) {
    console.error("Error updating battle pass tier:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateUserCurrency(req, res) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKENSECRET);
    const userId = decodedToken.userId;

    const { coinsUpdate, diamondsUpdate } = req.body;

    if (
      !userId ||
      typeof coinsUpdate === "undefined" ||
      typeof diamondsUpdate === "undefined"
    ) {
      return res.status(400).json({
        error: "userId, coinsUpdate, and diamondsUpdate are required",
      });
    }

    const user = await User.findById(userId);

    // Add coins and diamonds to the user's existing balance
    user.coins = coinsUpdate;
    user.diamonds = diamondsUpdate;
    await user.save();

    res
      .status(200)
      .json({ message: "User currency updated successfully", user });
  } catch (error) {
    console.error("Error updating user currency:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// export async function getUserCurrency(req, res) {
//   try {
//     if (!req.headers.authorization) {
//       return res.status(401).json({ error: "Unauthorized access" });
//     }

//     const token = req.headers.authorization.split(" ")[1];
//     const decodedToken = jwt.verify(token, process.env.TOKENSECRET);
//     const userId = decodedToken.userId;

//     if (!userId) {
//       return res.status(400).json({ error: "userId is required" });
//     }

//     const user = await User.findById(userId, "name coins diamonds");

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.status(200).json({
//       message: "User currency retrieved successfully",
//       username: user.username,
//       coins: user.coins,
//       diamonds: user.diamonds,
//     });
//   } catch (error) {
//     if (error.name === "JsonWebTokenError") {
//       return res.status(401).json({ error: "Unauthorized access" });
//     }

//     console.error("Error retrieving user currency:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// }
