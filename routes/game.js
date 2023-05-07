import express from "express";
import {
  createGame,
  joinGame,
  kickPlayer,
  leaveGame,
} from "../controllers/game.js";

const router = express.Router();
//get game by name ou lezim el nameGame unique
router
  .route("/")

  .post(createGame);

router.route("/join/:id").put(joinGame);

router.route("/leave/:id").put(leaveGame);

router.route("/kick/:id/:playerId").delete(kickPlayer);

//router.route("/forgetPassword").post(kickPlayer);

//   .route("/:id")
//   .get(getOnce)

//     multer("image", 5 * 1024 * 1024),
//     body("title").isLength({ min: 5 }),
//     body("description").isLength({ min: 5 }),
//     body("price").isNumeric(),
//     body("quantity").isNumeric(),
//     putOnce

export default router;
