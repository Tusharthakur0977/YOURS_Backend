import { Request, Response } from 'express';
import prisma from '../../libs/PrismaInstance';
import { STATUS_CODES } from '../../utils/Constants';
import {
  generateJwtToken,
  hashPassword,
  sendResponse,
} from '../../utils/helpers';

// this controller is for changing password after successfully verifying OTp in forgot password flow
const ResetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    // Validate input
    if (!email || !newPassword) {
      return sendResponse(res, STATUS_CODES.BAD_REQUEST, {
        message: 'Please provide Email and New Password',
      });
    }

    // hashing new password
    const hashedPassword = hashPassword(newPassword);

    // Fetch user from database
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    if (!updatedUser) {
      return sendResponse(res, STATUS_CODES.BAD_REQUEST, {
        message: 'No USer found',
      });
    }

    // // Generate JWT token
    const token = generateJwtToken({ userId: updatedUser.id });

    // // Send response
    sendResponse(res, STATUS_CODES.OK, {
      token,
      message: 'Password reset successfully',
    });
  } catch (error) {
    sendResponse(res, STATUS_CODES.INTERNAL_SERVER_ERROR, {
      error: 'Internal server error',
    });
  }
};

export default ResetPassword;
