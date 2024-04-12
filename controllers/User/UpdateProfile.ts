import { Request, Response } from 'express';
import { initializeApp } from 'firebase/app';
import { deleteObject, getStorage, ref } from 'firebase/storage';
import formidable from 'formidable';
import firebase_config from '../../config/firebase_config';
import prisma from '../../libs/PrismaInstance';
import { STATUS_CODES } from '../../utils/Constants';
import {
  extractProfilePicName,
  sendResponse,
  singleFileUpload,
} from '../../utils/helpers';

const form = formidable({});
const firebase = initializeApp(firebase_config.firebaseConfig);

export const UpdateProfileImage = async (req: Request, res: Response) => {
  try {
    const storage = getStorage();

    const [, files] = await form.parse(req);
    const { user } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { id: user.id },
    });

    if (!existingUser) {
      return sendResponse(res, STATUS_CODES.FORBIDDEN, {
        message: 'No User found',
      });
    }

    if (existingUser.profilePic) {
      const profilePicName = extractProfilePicName(existingUser.profilePic);

      // Create a reference to the file to delete
      const desertRef = ref(storage, profilePicName);

      // Delete the file
      deleteObject(desertRef)
        .then(async () => {
          const profilePic = await singleFileUpload(
            files.profileImage![0],
            firebase
          );

          const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { profilePic: profilePic },
          });

          if (updatedUser) {
            return sendResponse(res, STATUS_CODES.OK, {
              message: 'Profile image updated Successfully',
            });
          }
        })
        .catch((error) => {
          console.log(error, 'ERROR');
        });
    }
  } catch (error) {
    console.error('Create User Error: ', error); // Improved error logging
    sendResponse(res, STATUS_CODES.INTERNAL_SERVER_ERROR, {
      error: 'Internal server error',
    });
  }
};

export const UpdateProfileName = async (req: Request, res: Response) => {
  try {
    const { user, body } = req.body;
    const { fullName } = body;

    const existingUser = await prisma.user.findFirst({
      where: { id: user.id },
    });

    if (!existingUser) {
      return sendResponse(res, STATUS_CODES.FORBIDDEN, {
        message: 'No User found',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name: fullName },
    });

    if (updatedUser) {
      return sendResponse(res, STATUS_CODES.OK, {
        message: 'User name updated successfully',
      });
    }
  } catch (error) {
    console.error('Create User Error: ', error); // Improved error logging
    sendResponse(res, STATUS_CODES.INTERNAL_SERVER_ERROR, {
      error: 'Internal server error',
    });
  }
};
