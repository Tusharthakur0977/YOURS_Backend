import express from 'express';
import CreateUser from '../controllers/User/CreateUser';
import LoginUser from '../controllers/User/LoginUser';
import {
  UpdateProfileImage,
  UpdateProfileName,
} from '../controllers/User/UpdateProfile';
import { authenticateToken } from '../middlewares/Authenticate';
import ForgotPassword from '../controllers/User/ForgotPassword';
import VerifyOtp from '../controllers/User/VerifyOtp';
import ChangePassword from '../controllers/User/ChangePassword';
import ResetPassword from '../controllers/User/ResetPassword';
import UserDetails from '../controllers/User/UserDetails';

const router = express.Router();

// Route for login and register
router.post('/register', CreateUser);
router.post('/login', LoginUser);

// Route for manually change password
router.post('/changePassword', authenticateToken, ChangePassword);

// Route flow for forget password
router.post('/forgotPassword', ForgotPassword);
router.post('/verifyOtp', VerifyOtp);
router.post('/resetPassword', ResetPassword);

// Route for update profile picture and Name
router.post('/updateProfileImage', authenticateToken, UpdateProfileImage);
router.post('/updateProfileName', authenticateToken, UpdateProfileName);

router.get('/details', authenticateToken, UserDetails);

export default router;
