import { Request, Response } from 'express';
import { sendEmail } from '../../config/nodemailer_config';
import prisma from '../../libs/PrismaInstance';
import { STATUS_CODES } from '../../utils/Constants';
import { generateOTP, sendResponse } from '../../utils/helpers';

const ForgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return sendResponse(res, STATUS_CODES.BAD_REQUEST, {
        message: 'Please provide Email Address',
      });
    }

    const exisitingUser = await prisma.user.findUnique({
      where: { email: email },
      select: { id: true },
    });

    if (exisitingUser) {
      // Generate random OTP
      const otp = generateOTP();

      // sending generated OTP to users email
      const MailResponse = await sendEmail(
        email,
        'Forgot Password OTP',
        `<p>Dear User,</p>
        <p>You have requested to reset your password. Please use the following OTP to reset your password:</p>
        <p>OTP: ${otp}</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Regards,</p>
        <p>YOURS Team</p>`
      );

      // check for email sent successfully
      if (
        MailResponse.rejected.length === 0 &&
        MailResponse.response.includes('250')
      ) {
        const savedOtp = await prisma.user.update({
          where: { id: exisitingUser.id },
          data: {
            forgotPasswordOTP: {
              create: { otp: otp, userId: exisitingUser.id },
            },
          },
        });
        if (savedOtp) {
          return sendResponse(res, STATUS_CODES.OK, {
            message: `OTP sent successfullt to ${email}`,
          });
        }
      }

      // Saving Otp in new collection for OTp with user ID reference
    } else {
      return sendResponse(res, STATUS_CODES.FORBIDDEN, {
        message: `No user with ${email} Found`,
      });
    }
  } catch (error) {
    sendResponse(res, STATUS_CODES.INTERNAL_SERVER_ERROR, {
      error: 'Internal server error',
    });
  }
};

export default ForgotPassword;
