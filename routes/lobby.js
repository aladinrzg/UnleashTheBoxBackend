import express from "express";

import {
  addOnce,
  getPlayersByPort,
  getAll,
  lobbyMatchmaking,
  updateNbPlayersByPort,
  joinMatchWithCode,
} from "../controllers/lobby.js";

const router = express.Router();

router.route("/").post(addOnce).get(getAll);
router.route("/getPlayersByPort/:port").get(getPlayersByPort);
router.route("/lobbyMatchmaking").post(lobbyMatchmaking);
router.route("/joinMatchWithCode").post(joinMatchWithCode);
router.route("/updateNbPlayersByPort/:port").put(updateNbPlayersByPort);

export default router;
