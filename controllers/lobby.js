import { validationResult } from "express-validator";
import Lobby from "../models/lobby.js";
import { DateTime } from "luxon";

export function getAll(req, res) {
  Lobby.find({})
    .then((docs) => {
      let list = [];
      for (let i = 0; i < docs.length; i++) {
        list.push({
          id: docs[i]._id,
          code: docs[i].code,
          port: docs[i].port,
          nbPlayers: docs[i].nbPlayers,
          isPrivate: docs[i].isPrivate,
        });
      }
      res.status(200).json(list);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}

//helpers for addOnce  ================================================================================
function generateCode() {
  let code = "";
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  // Generate 3 uppercase letters
  for (let i = 0; i < 3; i++) {
    const randomLetterIndex = Math.floor(Math.random() * letters.length);
    code += letters[randomLetterIndex];
  }

  // Generate 4 numbers
  for (let i = 0; i < 4; i++) {
    const randomNumberIndex = Math.floor(Math.random() * numbers.length);
    code += numbers[randomNumberIndex];
  }

  return code;
}
async function isCodeUnique(code) {
  const existingLobby = await Lobby.findOne({ code });
  return !existingLobby;
}

async function generateUniqueCode() {
  let code;
  do {
    code = generateCode();
  } while (!(await isCodeUnique(code)));
  return code;
}

async function deleteLobbyIfCreatedWithinOneHour(routerIpAddress, port) {
  const oneHourAgo = DateTime.now().minus({ minutes: 1 }).toJSDate(); //DateTime.now().minus({}).toJSDate();

  const existingLobby = await Lobby.findOne({
    routerIpAddress,
    port,
    createdAt: { $gt: oneHourAgo },
  });

  if (existingLobby) {
    await Lobby.deleteOne({ _id: existingLobby._id });
  }
}
//end helpers for addOne==================================================================================================

//toooo test gbal el 9ahwa (mochklet el database connexion)
export async function addOnce(req, res) {
  if (!validationResult(req).isEmpty()) {
    res.status(400).json({ errors: validationResult(req).array() });
  } else {
    try {
      const generatedCode = await generateUniqueCode();
      const { port, routerIpAddress } = req.body;

      await deleteLobbyIfCreatedWithinOneHour(routerIpAddress, port);

      const newLobby = await Lobby.create({
        code: generatedCode,
        port, //port: req.body.port,
        nbPlayers: req.body.nbPlayers,
        isPrivate: req.body.isPrivate,
        routerIpAddress, //routerIpAddress: req.body.routerIpAddress,
        machineIpAddress: req.body.machineIpAddress,
      });

      res.status(200).json({
        code: newLobby.code,
        port: newLobby.port,
        nbPlayers: newLobby.nbPlayers,
        isPrivate: newLobby.isPrivate,
        routerIpAddress: newLobby.routerIpAddress,
        machineIpAddress: newLobby.machineIpAddress,
      });
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }
}

//get number of players with a given port
export async function getPlayersByPort(req, res) {
  const { port } = req.params;
  try {
    const lobby = await Lobby.findOne({ port: req.params.port });
    if (!lobby) {
      res.status(404).json({ error: "Lobby not found" });
    } else {
      res.status(200).json({ nbPlayers: lobby.nbPlayers });
    }
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json({ error: err });
  }
}

//get the first lobby <4 >0 and public (isPrivate false) and lastUpdatedat mel champ timestamp
// export async function getFirFreestLobby(req, res) {
//   try {
//     const lobby = await Lobby.findOne({
//       nbPlayers: { $lt: 4, $gt: 0 },
//       isPrivate: false,
//     }).sort({ updatedAt: -1 });

//     if (!lobby) {
//       res
//         .status(404)
//         .json({ error: "No lobby found with less than 4 players" });
//     } else {
//       res.status(200).json({ port: lobby.port });
//     }
//   } catch (err) {
//     console.error("Error:", err);
//     res.status(500).json({ error: err });
//   }
// }

export async function lobbyMatchmaking(req, res) {
  const { ipAddress } = req.body;
  if (!ipAddress) {
    return res.status(400).json({ error: "Missing ipAddress in body" });
  }
  try {
    // First find a lobby with 3 players
    let lobby = await Lobby.findOne({
      nbPlayers: 3,
      isPrivate: false,
    }).sort({ createdAt: 1 });

    // If not found find a lobby with 2 players
    if (!lobby) {
      lobby = await Lobby.findOne({
        nbPlayers: 2,
        isPrivate: false,
      }).sort({ createdAt: 1 });
    }

    // If still not found find the oldest lobby with less than 4 players
    if (!lobby) {
      lobby = await Lobby.findOne({
        nbPlayers: { $lt: 4 },
        isPrivate: false,
      }).sort({ createdAt: 1 });
    }

    if (!lobby) {
      res
        .status(404)
        .json({ error: "No lobby found with less than 4 players" });
    } else {
      if (ipAddress === lobby.routerIpAddress) {
        res
          .status(200)
          .json({ ipAddress: lobby.machineIpAddress, port: lobby.port });
      } else {
        res
          .status(200)
          .json({ ipAddress: lobby.routerIpAddress, port: lobby.port });
      }
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err });
  }
}

export async function joinMatchWithCode(req, res) {
  const { code, ipAddress } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Missing code in  body" });
  }

  if (!ipAddress) {
    return res.status(400).json({ error: "Missing ipAddress in  body" });
  }

  try {
    const lobby = await Lobby.findOne({ code });

    if (!lobby) {
      res.status(404).json({ error: "Lobby not found" });
    } else {
      if (ipAddress === lobby.routerIpAddress) {
        res
          .status(200)
          .json({ ipAddress: lobby.machineIpAddress, port: lobby.port });
      } else {
        res
          .status(200)
          .json({ ipAddress: lobby.routerIpAddress, port: lobby.port });
      }
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err });
  }
}

export async function updateNbPlayersByPort(req, res) {
  const { port } = req.params;
  const { nbPlayers } = req.body;

  if (!port) {
    return res
      .status(400)
      .json({ error: "Missing port in request parameters" });
  }

  if (nbPlayers === undefined) {
    return res.status(400).json({ error: "Missing nbPlayers in request body" });
  }

  try {
    const lb = await Lobby.findOne({ port: req.params.port });

    if (!lb) {
      res.status(404).json({ error: "Lobby not found" });
    } else {
      lb.nbPlayers = req.body.nbPlayers;
      await lb.save();
      res.status(200).json({ message: "nbPlayers updated", lobby: lb });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err });
  }
}
