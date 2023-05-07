import express from "express";

import { addOnce } from "../controllers/battlePassTier.js";

const router = express.Router();

router.route("/").post(addOnce);

export default router;
