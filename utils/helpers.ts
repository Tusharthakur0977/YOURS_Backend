import { genSaltSync, hashSync } from 'bcrypt';
import { Response } from 'express';
import { FirebaseApp } from 'firebase/app';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { Fields } from 'formidable';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { STATUS_CODES } from './Constants';

export const sendResponse = <T>(
  res: Response<any, Record<string, any>>,
  status: HttpStatusCode,
  data: T
) => {
  res.status(status).json(data);
};

export const salt = genSaltSync(10);

export const hashPassword = (password: string) => {
  return hashSync(password, salt);
};

export type HttpStatusCode = (typeof STATUS_CODES)[keyof typeof STATUS_CODES];

// Function to generate a JWT token
export const generateJwtToken = (payload: Record<string, any>): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN as string,
  });
};

export function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp;
}

function generateRandomString() {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 15;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

export async function singleFileUpload(
  image: any,
  firebaseApp: FirebaseApp
): Promise<string> {
  try {
    // Initialize Cloud Storage and get a reference to the service
    const storage = getStorage(firebaseApp);

    // Generate a random name for the image file
    let randomName =
      'IMG' + generateRandomString() + path.extname(image.originalFilename);

    // Create a reference to the Firebase Storage path
    const storageRef = ref(storage, randomName);

    // Upload the image to Firebase Storage
    await uploadBytes(storageRef, fs.readFileSync(image.filepath));

    // Set the path for the uploaded image to local server (in the project)
    // let imagePath = path.join(__dirname, '../static/images', randomName);

    // Read the uploaded image file in case of local server upload
    // let imageBuffer = fs.readFileSync(image.filepath);

    // Compress the image using sharp
    // await sharp(imageBuffer)
    // .resize({ width: 800 }) // Resize the image if needed
    // .jpeg({ quality: 80 }) // Set JPEG quality to 80%
    // .toFile(imagePath); // Save the compressed image to disk

    // Remove the temporary uploaded image file
    fs.unlinkSync(image.filepath);

    // return `/images/${randomName}`;
    // Get the download URL for the uploaded image
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error; // Rethrow the error for handling in the calling function
  }
}

export const convertedFormData = (fields: Fields): Record<string, string> => {
  const convertedFields: Record<string, string> = {};

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) {
      convertedFields[key] = ''; // Or you can choose to skip undefined values
    } else if (Array.isArray(value)) {
      convertedFields[key] = value[0];
    } else {
      convertedFields[key] = value;
    }
  }

  return convertedFields;
};

export const extractProfilePicName = (url: string) => {
  // Find the position of the last '/' character before the image name
  const lastSlashIndex = url.lastIndexOf('/');

  // Find the position of the '?' character, which indicates the start of query parameters
  const questionMarkIndex = url.indexOf('?');

  // Extract the image name using substring based on the positions found
  const imageName = url.substring(lastSlashIndex + 1, questionMarkIndex);

  return imageName;
};
