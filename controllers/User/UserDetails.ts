import { Request, Response } from 'express';
import { STATUS_CODES } from '../../utils/Constants';
import { sendResponse } from '../../utils/helpers';

const UserDetails = async (req: Request, res: Response) => {
  try {
    const { user } = req.body;

    if (user)
      sendResponse(res, STATUS_CODES.OK, {
        message: 'User details Fetched successfully',
        user,
      });
  } catch (error: any) {
    sendResponse(error, STATUS_CODES.INTERNAL_SERVER_ERROR, {
      error: 'Internal server error',
    });
  }
};

export default UserDetails;
