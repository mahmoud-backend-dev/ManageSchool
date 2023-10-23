import fs from 'fs';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import BadRequest from '../errors/badRequest.js';
import CustomErrorAPI from '../errors/customErrorAPI.js';
import sendEmail from '../utils/sendEmail.js';
import { StatusCodes } from 'http-status-codes';
import pkj from 'jsonwebtoken';
const { verify } = pkj;
import UnauthenticatedError from '../errors/unauthenticated.js';
import { sanitizeData } from '../utils/sanitizeData.js';
import hbs from 'handlebars';
import NotFoundError from '../errors/notFound.js';



const sourceSignup = fs.readFileSync('templates/confirmMail.hbs', 'utf-8');
const templateForSignup = hbs.compile(sourceSignup);
const sourcePassword = fs.readFileSync('templates/resetPassword.hbs', 'utf-8');
const templateForPassword = hbs.compile(sourcePassword);



export const allowTo = (...roles) => asyncHandler(async (req, res, next) => {
  if (!roles.includes(req.user.roles))
    throw new UnauthenticatedError('You are not allowed to access this route')
  next();
});

// @desc Signup
// @route POST  /auth/signup
// @access Public
export const signup = asyncHandler(async (req, res) => {

  let user = await User.findOne({ email: req.body.email });
  
  if (user) {
    if (user.banForever == true)
      throw new BadRequest(`This email was taken ban forever`)
    if (user.isBanned == true)
      if (user.banExpired > new Date(Date.now()))
        throw new BadRequest(`This email was taken ban`);
      else {
        user.banExpired = undefined;
        user.isBanned = false;
        await user.save()
      }
    if (user.resetCodeExpiredForSignup > new Date(Date.now())) {
      throw new BadRequest('Your Account Not Verified');
    }
    if (user.resetVerifyForSignup == undefined) {
      throw new BadRequest('This email already user, choose anther email')
    }
    else {

      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      user.email = req.body.email;
      user.password = req.body.password;
      user.resetCodeExpiredForSignup = Date.now() + 60 * 60 * 1000;
      user.resetVerifyForSignup = false;
      
      const token = user.createJWTForSignup();
      const url = `http://localhost:3000/confirmSignup?${token}`;
      const mailOpts = {
        to: user.email,
        subject: "Verification Your Account (valid for one hour)"
      }
      try {
        await sendEmail(mailOpts, templateForSignup({
          name: user.firstName,
          url: url
        }));
        await user.hashedPass();
        user.save();
        return res.status(StatusCodes.CREATED).json({ status: "Success" });
      } catch (error) {
        user.deleteOne();
        // console.log(error);
        throw new CustomErrorAPI('There is an error in sending email', StatusCodes.INTERNAL_SERVER_ERROR);
      } 
    }
  }

  user = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password
  });
  user.resetCodeExpiredForSignup = Date.now() + 60 * 60 * 1000;
  user.resetVerifyForSignup = false;
  

  const token = user.createJWTForSignup();

  const url = `http://localhost:3000/confirmSignup?${token}`;
  const mailOpts = {
    to: user.email,
    subject: "Verification Your Account (valid for one hour)"
  }
  try {
    await sendEmail(mailOpts, templateForSignup({
      name: user.firstName,
      url: url
    }));
    await user.hashedPass();
    user.save();
    res.status(StatusCodes.CREATED).json({ status: "Success" });
  } catch (error) {
    user.deleteOne();
    // console.log(error);
    throw new CustomErrorAPI('There is an error in sending email', StatusCodes.INTERNAL_SERVER_ERROR);
  }
});

// @desc Verify For Signup
// @route POST  /auth/verifySignup
// @access Public
export const verifyForSignup = asyncHandler(async (req, res) => {
  const decoded = verify(req.body.token, process.env.JWT_SECRET);
  if (!decoded.userIdForSignup)
    throw new BadRequest('Invalid Token')
  const user = await User.findById(decoded.userId).populate({
    path: 'role',
    select: 'permissions'
  });

  if (!user)
    throw new UnauthenticatedError('The user that belong to this token does no longer exist');
  
  if (user.banForever == true)
    throw new BadRequest(`This email was taken ban forever`)
  
  if (user.isBanned == true)
    if (user.banExpired > new Date(Date.now()))
      throw new BadRequest(`This email was taken ban`);
    else {
      user.banExpired = undefined;
      user.isBanned = false;
      await user.save()
    }
  if (user.resetCodeExpiredForSignup == undefined)
    throw new BadRequest('User Is Active');
  if (user.resetCodeExpiredForSignup < new Date(Date.now())) {
    throw new BadRequest('Expired Token')
  } 

  user.resetCodeExpiredForSignup = undefined;
  user.resetVerifyForSignup = undefined;
  await user.save();
  const token = user.createJWTForAuthorization()
  res.status(StatusCodes.OK).json({ status: "Success", token, user: sanitizeData(user) });
});

// @desc Forget Password
// @route POST  /auth/forgetPassword
// @access Public
export const forgetPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    throw new NotFoundError(`No such user for this id: ${req.body.email}`);

  if (user.banForever == true)
    throw new BadRequest(`This email was taken ban forever`)
  
  if (user.isBanned == true)
    if (user.banExpired > new Date(Date.now()))
      throw new BadRequest(`This email was taken ban`);
    else {
      user.banExpired = undefined;
      user.isBanned = false;
      await user.save()
    }
  
  if (user.resetVerifyForSignup==false)
    throw new BadRequest('Your Account not verify');

  user.resetCodeExpiredForPassword = Date.now() + 60 * 60 * 1000;
  user.resetVerifyForPassword = false;
  const token = user.createJWTForResetPassword();
  const url = `http://localhost:3000/confirmForgetPassword?${token}`;
  const mailOpts = {
    to: user.email,
    subject: "Verification For Reset Password (valid for one hour)",

  }
  try {
    await sendEmail(mailOpts, templateForPassword({
      name: user.firstName,
      url: url,
      email:user.emil
    }));
    user.save();
  } catch (error) {
    console.log(error);
    user.resetCodeExpiredForPassword = undefined;
    user.resetVerifyForPassword = undefined;
    user.save();
    throw new CustomErrorAPI(`There is an error in sending email`, StatusCodes.INTERNAL_SERVER_ERROR);
  }
  res.status(StatusCodes.OK).json({ status: "Success" });
});

// @desc Verify For Password
// @route POST  /auth/verifyPassword
// @access Public
export const verifyForPassword = asyncHandler(async (req, res) => {
  const decoded = verify(req.body.token, process.env.JWT_SECRET);
  if (!decoded.userIdForResetPassword)
    throw new BadRequest('Invalid Token')
  const user = await User.findById(decoded.userId).populate({
    path: 'role',
    select: 'permissions'
  });
  if (user.resetCodeExpiredForPassword > new Date(Date.now()))
    throw new BadRequest('Your Account Not Verified')
  if (!user)
    throw new UnauthenticatedError('The user that belong to this token does no longer exist');

  if (user.banForever == true)
    throw new BadRequest(`This email was taken ban forever`)
  
  if (user.isBanned == true)
    if (user.banExpired > new Date(Date.now()))
      throw new BadRequest(`This email was taken ban`);
    else {
      user.banExpired = undefined;
      user.isBanned = false;
      await user.save()
    }

  user.resetCodeExpiredForPassword = undefined;
  user.resetVerifyForPassword = true;
  await user.save();
  res.status(StatusCodes.OK).json({ status: "Success", user: sanitizeData(user) });
});

// @desc Reset Password
// @route PATCH  /auth/resetPassword
// @access Public
export const resetPassword = asyncHandler(async (req, res) => {
  // Get user based on email
  const user = await User.findOne({ email: req.body.email }).populate({
    path: 'role',
    select: 'permissions'
  });
  if (!user)
    throw new BadRequest(`There is no user with that email ${req.body.email}`)

  if (user.banForever == true)
    throw new BadRequest(`This email was taken ban forever`)
  
  if (user.isBanned == true)
    if (user.banExpired > new Date(Date.now()))
      throw new BadRequest(`This email was taken ban`);
    else {
      user.banExpired = undefined;
      user.isBanned = false;
      await user.save()
    }
  if (user.resetVerifyForPassword == false)
    throw new BadRequest('Your account not verified');

  user.password = req.body.newPassword;
  user.hashedResetCodeForPassword = undefined;
  user.resetCodeExpiredForPassword = undefined;
  user.resetVerifyForPassword = undefined;
  await user.hashedPass();
  await user.save();
  const token = user.createJWTForAuthorization();
  res.status(StatusCodes.OK).json({ token, data: sanitizeData(user) });
});

// @desc Login
// @route POST  /auth/login
// @access Public
export const login = asyncHandler(async (req, res) => {

  const user = await User.findOne({ email: req.body.email }).populate({
    path: 'role',
    select: 'permissions'
  });
  if (!user)
    throw new NotFoundError(`No user for this email: ${req.body.email}`);

  if (user.banForever == true)
    throw new BadRequest(`This email was taken ban forever`)
  
  if (user.isBanned == true)
    if (user.banExpired > new Date(Date.now()))
      throw new BadRequest(`This email was taken ban`);
    else {
      user.banExpired = undefined;
      user.isBanned = false;
      await user.save()
    }
  
  if (user.resetVerifyForSignup == false)
    throw new BadRequest('Your Account Not Verified');
  const isMatch = await user.comparePass(req.body.password);
  if (!user || !isMatch)
    throw new BadRequest('email or password incorrect');
  const token = user.createJWTForAuthorization();
  res.status(StatusCodes.OK).json({ status: "Success", token, user: sanitizeData(user) });

});




