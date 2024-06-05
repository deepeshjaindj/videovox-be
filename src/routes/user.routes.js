import { Router } from "express";
import { changePasswordController, getCurrentUserController, getUserChannelProfileController, getWatchHistoryController, loginController, logoutController, refreshAccessTokenController, registerController, updateAccountDetailsController, updateUserAvatarController, updateUserCoverImageController } from "../controllers/index.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields(
    [
      {
        name: 'avatar',
        maxCount: 1
      },
      {
        name: 'coverImage',
        maxCount: 1
      }
    ]
  ),
  registerController
)

router.route("/login").post(loginController);

// Secured Routes
router.route("/logout").post(verifyJWT, logoutController);
router.route("/refreshToken").post(refreshAccessTokenController);

router.route("/changePassword").put(verifyJWT, changePasswordController);

router.route("/getCurrentUser").get(verifyJWT, getCurrentUserController);

router.route("/updateUserDetails").patch(verifyJWT, updateAccountDetailsController);
router.route("/updateAvatar").patch(upload.single('avatar'), verifyJWT, updateUserAvatarController);
router.route("/updateCoverImage").patch(upload.single('coverImage'), verifyJWT, updateUserCoverImageController);

router.route("/channel/:username").get(verifyJWT, getUserChannelProfileController)
router.route("/history").get(verifyJWT, getWatchHistoryController)

export default router;
