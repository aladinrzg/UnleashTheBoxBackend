import express from "express";




import { getAll,addOnce,putOnce,getOnce,deleteOnce } from "../controllers/achievement.js";

const router = express.Router();

router
  .route("/")
  .get(getAll)
  .post(
   // multer("image", 5 * 1024 * 1024),
    //body("title").isLength({ min: 5 }),
    // body("description").isLength({ min: 5 }),
    // body("price").isNumeric(),
    // body("quantity").isNumeric(),
    addOnce
  );

router
  .route("/:id")
  .get(getOnce)
  .put(
    // multer("image", 5 * 1024 * 1024),
    // body("title").isLength({ min: 5 }),
    // body("description").isLength({ min: 5 }),
    // body("price").isNumeric(),
    // body("quantity").isNumeric(),
    putOnce
  )
  .delete(deleteOnce);

export default router;
