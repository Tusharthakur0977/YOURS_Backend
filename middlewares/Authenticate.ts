import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/helpers';
import { STATUS_CODES } from '../utils/Constants';
import jwt from 'jsonwebtoken';
import prisma from '../libs/PrismaInstance';

// Middleware to authenticate the user and attach user ID to the request
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // extractig token from headers and removing Bearer from token
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return sendResponse(res, STATUS_CODES.UNAUTHORIZED, {
      message: 'Unauthorized',
    });
  }

  try {
    // decoding the JWT token and extracting user ID from this
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const userId = (decoded as { userId: string }).userId;

    // Fetch user data using Prisma
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return sendResponse(res, STATUS_CODES.NOT_FOUND, {
        error: 'No user found',
      });
    }

    // sending user data find by user id to next function
    req.body = {
      user,
      params: req.params,
      headers: req.headers,
      query: req.query,
      body: req.body,
    };
    next();
  } catch (error) {
    return sendResponse(res, STATUS_CODES.UNAUTHORIZED, {
      error: 'Unauthorized',
    });
  }
};
