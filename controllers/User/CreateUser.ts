import { Request, Response } from 'express';
import { initializeApp } from 'firebase/app';
import formidable from 'formidable';
import firebase_config from '../../config/firebase_config';
import prisma from '../../libs/PrismaInstance';
import { STATUS_CODES } from '../../utils/Constants';
import {
  convertedFormData,
  generateJwtToken,
  hashPassword,
  sendResponse,
  singleFileUpload,
} from '../../utils/helpers';

const form = formidable({});
const firebase = initializeApp(firebase_config.firebaseConfig);

const CreateUser = async (req: Request, res: Response) => {
  try {
    const [fields, files] = await form.parse(req);
    const body = convertedFormData(fields);

    const { email, name, password, sobrietyDate } = body;
    
    // // Input validation
    if (!name) {
      return sendResponse(res, STATUS_CODES.BAD_REQUEST, {
        message: 'Name is required.',
      });
    }
    if (!email || !password) {
      return sendResponse(res, STATUS_CODES.BAD_REQUEST, {
        message: 'Email and password are required.',
      });
    }

    if (password.length === 0) {
      return sendResponse(res, STATUS_CODES.BAD_REQUEST, {
        message: 'Password is required.',
      });
    }

    if (password.length < STATUS_CODES.MIN_PASSWORD_LENGTH) {
      return sendResponse(res, STATUS_CODES.BAD_REQUEST, {
        message: 'Password must be at least 6 characters.',
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: email },
    });

    if (existingUser) {
      return sendResponse(res, STATUS_CODES.FORBIDDEN, {
        message: 'User with email or Mobile Number already exists.',
      });
    }

    // // Hash password
    const hashedPassword = hashPassword(password);

    const profilePic = await singleFileUpload(files.profileImage![0], firebase);
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        profilePic: profilePic,
        sobriety: sobrietyDate,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        sobriety: true,
      },
    });

    // // Generate JWT token
    const token = generateJwtToken({ userId: newUser.id });

    // // Send response
    sendResponse(res, STATUS_CODES.OK, { token, user: newUser });
  } catch (error) {
    console.error('Create User Error: ', error); // Improved error logging
    sendResponse(res, STATUS_CODES.INTERNAL_SERVER_ERROR, {
      error: 'Internal server error',
    });
  }
};

export default CreateUser;
