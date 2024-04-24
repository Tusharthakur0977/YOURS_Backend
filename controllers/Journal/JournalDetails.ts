import { Request, Response } from 'express';
import prisma from '../../libs/PrismaInstance';
import { defaultJournalQuestions } from '../../seeds/JournalQuestions';
import { STATUS_CODES } from '../../utils/Constants';
import { sendResponse } from '../../utils/helpers';

const JournalDetails = async (req: Request, res: Response) => {
  try {
    // user contain user data after verufying token and params contains date from user input
    const { user, query } = req.body;
    const { journalDate } = query;

    if (!journalDate || !journalDate.trim()) {
      sendResponse(res, STATUS_CODES.BAD_REQUEST, {
        message: 'Please provide a valid Journal Date',
      });
    }

    // Parse journal date
    const parsedDate = new Date(journalDate);

    // Find or create user's journal data for the specified date
    const userJournal = await prisma.journal.findFirst({
      where: {
        userId: user._id,
        journalDate: parsedDate,
      },
      select: {
        isAnswered: true,
        journalDate: true,
        questions: true,
      },
    });

    // If no journal data found, create a new entry
    if (!userJournal) {
      const newUserJournal = await prisma.journal.create({
        data: {
          userId: user.id,
          journalDate: parsedDate,
          questions: { create: defaultJournalQuestions },
          isAnswered: false,
        },
        select: {
          isAnswered: true,
          journalDate: true,
          questions: true,
        },
      });

      if (newUserJournal) {
        return sendResponse(res, STATUS_CODES.OK, {
          message: 'User journal data fetched successfully',
          journal: newUserJournal,
        });
      }
    }
    sendResponse(res, STATUS_CODES.OK, {
      message: 'User journal data fetched successfully',
      journal: userJournal,
    });
  } catch (error: any) {
    sendResponse(error, STATUS_CODES.INTERNAL_SERVER_ERROR, {
      error: 'Internal server error',
    });
  }
};

export default JournalDetails;
