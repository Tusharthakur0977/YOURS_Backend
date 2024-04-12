import { User } from '@prisma/client';
import { compareSync } from 'bcrypt';
import { Request, Response } from 'express';
import prisma from '../../libs/PrismaInstance';
import { STATUS_CODES } from '../../utils/Constants';
import { generateJwtToken, sendResponse } from '../../utils/helpers';

const LoginUser = async (req: Request, res: Response) => {
  try {
    const { email, password }: User = req.body;

    // Validate input
    if (!email || !password) {
      return sendResponse(res, STATUS_CODES.BAD_REQUEST, {
        message: 'Please provide Email and Password',
      });
    }

    // Fetch user from database
    const user = await prisma.user.findFirst({ where: { email } });

    if (!user || !compareSync(password, user.password)) {
      return sendResponse(res, STATUS_CODES.BAD_REQUEST, {
        message: 'Invalid credentials.',
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    // Generate JWT token
    const token = generateJwtToken({ userId: user.id });

    // Send response
    sendResponse(res, STATUS_CODES.OK, { token, user: userWithoutPassword });
  } catch (error) {
    sendResponse(res, STATUS_CODES.INTERNAL_SERVER_ERROR, {
      error: 'Internal server error',
    });
  }
};

export default LoginUser;
