import { Request, Response } from 'express';
import prisma from '../../libs/PrismaInstance';
import { defaultJournalQuestions } from '../../seeds/JournalQuestions';
import { STATUS_CODES } from '../../utils/Constants';
import { sendResponse } from '../../utils/helpers';

const JournalList = async (req: Request, res: Response) => {
  try {
    // user contain user data after verufying token and params contains date from user input
    const { user } = req.body;

    // Find all journals using User id
    const journalList = await prisma.journal.findMany({
      where: {
        userId: user._id,
      },
      select: {
        questions: true,
        isAnswered: true,
        journalDate: true,
      },
    });

    if (journalList) {
      return sendResponse(res, STATUS_CODES.OK, {
        message: 'User journals List fetched successfully',
        journals: journalList,
      });
    }
  } catch (error: any) {
    sendResponse(error, STATUS_CODES.INTERNAL_SERVER_ERROR, {
      error: 'Internal server error',
    });
  }
};

export default JournalList;
