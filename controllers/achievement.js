import { validationResult } from "express-validator";

import Achievement from "../models/achievement.js";

export function getAll(req, res) {
  Achievement.find({})
    .then((docs) => {
      let list = [];
      for (let i = 0; i < docs.length; i++) {
        list.push({
          id: docs[i]._id,
          name: docs[i].name,
          description: docs[i].description,
        });
      }
      res.status(200).json(list);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}

export function addOnce(req, res) {
  if (!validationResult(req).isEmpty()) {
    res.status(400).json({ errors: validationResult(req).array() });
  } else {
    Achievement.create({
      name: req.body.name,
      description: req.body.description,
    })
      .then((newAchievement) => {
        res.status(200).json({
          name: newAchievement.name,
          description: newAchievement.description,
        });
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  }
}

export function getOnce(req, res) {
  //by name by quest
  Achievement.findById(req.params.id)
    .then((doc) => {
      res.status(200).json(doc);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}

export function putOnce(req, res) {
  let newAchievement = {};
  if (req.file == undefined) {
    newAchievement = {
      name: req.body.name,
      description: req.body.description,
    };
  } else {
    newAchievement = {
      name: req.body.name,
      description: req.body.description,
    };
  }
  Achievement.findByIdAndUpdate(req.params.id, newAchievement)
    .then((doc1) => {
      Achievement.findById(req.params.id)
        .then((doc2) => {
          res.status(200).json(doc2);
        })
        .catch((err) => {
          res.status(500).json({ error: err });
        });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}

export function deleteOnce(req, res) {
  Achievement.findByIdAndDelete(req.params.id)
    .then((deletedAchievement) => {
      if (deletedAchievement) {
        res.status(200).json({
          message: `Achievement with ID ${req.params.id} deleted successfully`,
        });
      } else {
        res.status(404).json({
          error: `Achievement with ID ${req.params.id} not found`,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}
