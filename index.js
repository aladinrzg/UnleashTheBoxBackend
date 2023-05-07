import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
//dotenv
import dotenv from "dotenv";
dotenv.config();
// Access environment variables using process.env

import { notFoundError, errorHandler } from "./middlewares/error-handler.js";

import gameRoutes from "./routes/game.js";
import userRoutes from "./routes/user.js";
import achievementRoutes from "./routes/achievement.js";
import battlePassTierRoutes from "./routes/battlePassTier.js";
import lobbyRoutes from "./routes/lobby.js";

const app = express();
const port = process.env.PORT;
const databaseName = "UnleashTheBox";
const db_url = process.env.DB_URL || `mongodb://127.0.0.1:27017`;

mongoose.set("debug", true);
mongoose.Promise = global.Promise;

mongoose
  .connect(`${db_url}/${databaseName}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Set the write concern change here
    writeConcern: {
      w: "majority",
      j: true,
      wtimeout: 1000,
    },
  })
  .then(() => {
    console.log(`Connected to ${databaseName}`);
  })
  .catch((err) => {
    console.log(err);
  });

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use('/img', express.static('public/images'));

app.use("/game", gameRoutes);

app.use("/achievement", achievementRoutes);
app.use("/user", userRoutes);
app.use("/battlePassTier", battlePassTierRoutes);
app.use("/lobby", lobbyRoutes);

app.use(notFoundError);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
