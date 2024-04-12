import { Request, Response } from 'express';
import prisma from '../../libs/PrismaInstance';
import { STATUS_CODES } from '../../utils/Constants';
import { sendResponse } from '../../utils/helpers';

const VerifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return sendResponse(res, STATUS_CODES.BAD_REQUEST, {
        message: 'Please provide Email and 6 digit Otp',
      });
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { email },
      include: { forgotPasswordOTP: true },
    });

    if (!user) {
      return sendResponse(res, STATUS_CODES.BAD_REQUEST, {
        message: 'No USer found',
      });
    }

    if (
      !user.forgotPasswordOTP ||
      user.forgotPasswordOTP.otp.toString() !== otp
    ) {
      return sendResponse(res, STATUS_CODES.BAD_REQUEST, {
        message: 'Invalid OTP',
      });
    }

    // Delete OTP from the database after verification
    await prisma.forgotPasswordOTP.delete({
      where: {
        id: user.forgotPasswordOTP.id,
      },
    });

    // Send response
    sendResponse(res, STATUS_CODES.OK, {
      message: 'OTP verified successfully',
    });
  } catch (error) {
    sendResponse(res, STATUS_CODES.INTERNAL_SERVER_ERROR, {
      error: 'Internal server error',
    });
  }
};

export default VerifyOtp;
