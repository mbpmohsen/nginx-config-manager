/** source/routes/configuration.ts */
import express from "express";
import controller from "../controllers/configuration";
const router = express.Router();

router.get("/configuration", controller.getConfigurations);
router.post("/configuration", controller.addConfiguration);

export = router;
