const express = require("express");
const userRouter = express.Router();

const userController = require("../controllers/userController");

userRouter.post("/register", userController.userRegister);
userRouter.post("/login", userController.userLogin);
userRouter.post("/logout", userController.userLogout);
userRouter.post("/forgot-password", userController.forgotPassword);
userRouter.post("/reset-password/:token", userController.resetPassword);

module.exports = userRouter;
