import { validationResult } from "express-validator";

import Game from "../models/game.js";
import jwt from "jsonwebtoken";

// export function getAll(req, res) {
//   Game.find({})
//     .then((docs) => {
//       let list = [];
//       for (let i = 0; i < docs.length; i++) {
//         list.push({
//           id: docs[i]._id,
//           name: docs[i].name,
//           description: docs[i].description,
//           maxPlayers: docs[i].maxPlayers,
//           started: docs[i].started,
//           ended: docs[i].ended,
//         });
//       }
//       res.status(200).json(list);
//     })
//     .catch((err) => {
//       res.status(500).json({ error: err });
//     });
// }

// export function addOnce(req, res) {
//   if (!validationResult(req).isEmpty()) {
//     res.status(400).json({ errors: validationResult(req).array() });
//   } else {
//     Game.create({
//       name: req.body.name,
//       description: req.body.description,
//       maxPlayers: req.body.maxPlayers,
//       started: req.body.started,
//       ended: req.body.ended,

//     })
//       .then((newGame) => {
//         res.status(200).json({
//           name: newGame.name,
//           description: newGame.description,
//           maxPlayers: newGame.maxPlayers,
//           started: newGame.started,
//           ended: newGame.ended,
//         });
//       })
//       .catch((err) => {
//         res.status(500).json({ error: err });
//       });
//   }
// }

// export function getOnce(req, res) {
//   Game.findById(req.params.id)
//     .then((doc) => {
//       res.status(200).json(doc);
//     })
//     .catch((err) => {
//       res.status(500).json({ error: err });
//     });
// }

// export function putOnce(req, res) {
//   let newGame = {};
//   if(req.file == undefined) {
//     newGame = {
//       name: req.body.name,

//       description: req.body.description,
//       maxPlayers: req.body.maxPlayers,
//       started: req.body.started,
//       ended: req.body.ended,
//     }
//   }
//   else {
//     newGame = {
//       name: req.body.name,
//       description: req.body.description,
//       maxPlayers: req.body.maxPlayers,
//       started: req.body.started,
//       ended: req.body.ended,

//     }
//   }
//   Game.findByIdAndUpdate(req.params.id, newGame)
//     .then((doc1) => {
//       Game.findById(req.params.id)
//         .then((doc2) => {
//           res.status(200).json(doc2);
//         })
//         .catch((err) => {
//           res.status(500).json({ error: err });
//         });
//     })
//     .catch((err) => {
//       res.status(500).json({ error: err });
//     });
// }

export function createGame(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, process.env.TOKENSECRET || "uleash");
  const userId = decodedToken.userId;

  if (!validationResult(req).isEmpty()) {
    res.status(400).json({ errors: validationResult(req).array() });
  } else {
    const newGame = new Game({
      name: req.body.name,
      description: req.body.description,
      maxPlayers: req.body.maxPlayers,
      hoster:
        userId /* req.user._id // assumes user ID is stored in req.user._id */,
      players: [userId], // Add the userId to the players array as the game creator is also a player
    });

    newGame
      .save()
      .then((game) => {
        res.status(200).json(game);
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  }
}

export async function joinGame(req, res) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKENSECRET);
    const userId = decodedToken.userId;
    const gameId = req.params.id;

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    if (game.players.includes(userId)) {
      return res.status(400).json({ error: "User is already in the game" });
    }

    if (game.players.length >= game.maxPlayers) {
      return res.status(400).json({ error: "Game is full" });
    }

    game.players.push(userId);
    const updatedGame = await game.save();

    res.status(200).json(updatedGame);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function leaveGame(req, res) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKENSECRET);
    const userId = decodedToken.userId;
    const gameId = req.params.id;

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    if (!game.players.includes(userId.toString())) {
      return res.status(400).json({ error: "User is not in the game" });
    }

    //game.players = game.players.filter(playerId => playerId !== userId);
    game.players = game.players.filter(
      (playerId) => playerId.toString() !== userId.toString()
    );

    if (game.hoster.toString() === userId.toString()) {
      await Game.findByIdAndDelete(gameId);
      return res.status(200).json({ message: "Game deleted" });
    }

    const updatedGame = await game.save();

    res.status(200).json(updatedGame);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function kickPlayer(req, res) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKENSECRET);
    const hostId = decodedToken.userId;
    const gameId = req.params.id;
    const playerToKickId = req.params.playerId;

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    if (hostId !== game.hoster.toString()) {
      return res.status(403).json({ error: "Only the host can kick players" });
    }

    if (!game.players.includes(playerToKickId.toString())) {
      return res.status(400).json({ error: "Player is not in the game" });
    }

    game.players = game.players.filter(
      (playerId) => playerId.toString() !== playerToKickId.toString()
    );
    const updatedGame = await game.save();

    res.status(200).json(updatedGame);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
