import { Router } from "express";
import { registerUser,login,logout ,refreshAccessTokene} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js"
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
);

router.route("/login").post(login);
router.route("/logout").post(verifyJWT,logout);
router.route("/refresh-token").post(refreshAccessTokene);

export default router;
