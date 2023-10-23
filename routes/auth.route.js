import { Router } from "express";
const router = Router();

import {
  forgetPasswordValidator,
  loginValidator,
  resetPasswordValidator,
  signupValidator,
  verifyForSignupValidator
} from "../utils/validators/auth.validator.js";

import {
  forgetPassword,
  login,
  resetPassword,
  signup,
  verifyForPassword,
  verifyForSignup
} from "../controller/auth.controller.js";




router.post('/signup', signupValidator, signup);
router.post('/verifySignup', verifyForSignupValidator, verifyForSignup);
router.post('/forgetPassword', forgetPasswordValidator, forgetPassword);
router.post('/verifyPassword', verifyForSignupValidator, verifyForPassword);
router.patch('/resetPassword', resetPasswordValidator, resetPassword);
router.post('/login', loginValidator, login);


export default router;