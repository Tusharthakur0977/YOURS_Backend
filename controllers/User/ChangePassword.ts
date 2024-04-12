import { compareSync } from 'bcrypt';
import { Request, Response } from 'express';
import prisma from '../../libs/PrismaInstance';
import { STATUS_CODES } from '../../utils/Constants';
import {
  generateJwtToken,
  hashPassword,
  sendResponse,
} from '../../utils/helpers';

const ChangePassword = async (req: Request, res: Response) => {
  try {
    const { user, body } = req.body;
    const { email, password, newPassword } = body;

    // Validate input
    if (!email || !password) {
      return sendResponse(res, STATUS_CODES.BAD_REQUEST, {
        message: 'Please provide Email and Password',
      });
    }
    if (!newPassword) {
      return sendResponse(res, STATUS_CODES.BAD_REQUEST, {
        message: 'Please provide a new password',
      });
    }

    // Fetch user from database

    if (!compareSync(password, user.password)) {
      return sendResponse(res, STATUS_CODES.UNAUTHORIZED, {
        message: 'Invalid credentials.',
      });
    }

    const hashedNewPassword = hashPassword(newPassword);

    const updateUser = await prisma.user.update({
      where: { email },
      data: { password: hashedNewPassword },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        securityQuestionId: true,
      },
    });

    // Generate JWT token
    const token = generateJwtToken({ userId: user.id });

    // Send response
    sendResponse(res, STATUS_CODES.OK, { token, user: updateUser });
  } catch (error) {
    sendResponse(res, STATUS_CODES.INTERNAL_SERVER_ERROR, {
      error: 'Internal server error',
    });
  }
};

export default ChangePassword;
