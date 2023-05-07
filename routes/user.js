import express from "express";
import { body } from "express-validator";

//import multer from "../middlewares/multer-config.js";

import {
  forgotPassword,
  signin,
  signup,
  resetPassword,
  purchaseDiamonds,
  updateBattlePassTier,
  updateUserCurrency,
} from "../controllers/user.js";

const router = express.Router();

router.route("/signin").post(
  //multer("avatar", 512 * 1024),
  body("username").isLength({ min: 5 }),
  //body("username").isLength({ min: 5 }),
  //body("wallet").isNumeric(),
  signin
);
//add express validator for signUp
// show all users for the admin
router.route("/signup").post(signup);
router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword/:token").post(resetPassword);
router.post("/purchaseDiamonds", purchaseDiamonds);
router.put("/updateBattlePass", updateBattlePassTier);
router.put("/updateUserCurrency", updateUserCurrency);
//router.put("/getUserCurrency", getUserCurrency);
// router
//   .route("/:id")
//   .put(
//     multer("avatar", 512 * 1024),
//     body("username").isLength({ min: 5 }),
//     body("username").isLength({ min: 5 }),
//     body("wallet").isNumeric(),
//     putOnce
//   );

export default router;
