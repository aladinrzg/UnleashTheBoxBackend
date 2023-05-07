import { validationResult } from "express-validator";
import BattlePassTier from "../models/battlePassTier.js";

export function addOnce(req, res) {
  if (!validationResult(req).isEmpty()) {
    res.status(400).json({ errors: validationResult(req).array() });
  } else {
    BattlePassTier.create({
      tier: req.body.tier,
      requiredXP: req.body.requiredXP,
      rewards: req.body.rewards,
    })
      .then((newTier) => {
        res.status(200).json({
          tier: newTier.tier,
          requiredXP: newTier.requiredXP,
          rewards: newTier.rewards,
        });
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  }
}
