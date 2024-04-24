import { Request, Response } from 'express';
import prisma from '../../libs/PrismaInstance';
import { STATUS_CODES } from '../../utils/Constants';
import { sendResponse } from '../../utils/helpers';

const UpdateQuestion = async (req: Request, res: Response) => {
  try {
    // user contain user data after verufying token and params contains date from user input
    const { user, body } = req.body;
    const { questionId, answer } = body;

    if (!questionId || !questionId.trim()) {
      sendResponse(res, STATUS_CODES.BAD_REQUEST, {
        message: 'Please choose a valid question',
      });
    }

    if (!answer || !answer.trim()) {
      sendResponse(res, STATUS_CODES.BAD_REQUEST, {
        message: 'Please provide a correct answer',
      });
    }

    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!existingQuestion) {
      sendResponse(res, STATUS_CODES.BAD_REQUEST, {
        message:
          'The provided question ID does not match any existing question',
      });
      return; // Return here to stop further execution
    }

    // Find question using journal date and question ID
    const updatedQuestion = await prisma.question.update({
      where: {
        id: body.questionId,
      },
      data: {
        isAnswered: true,
        answer: answer,
      },
    });

    if (updatedQuestion) {
      return sendResponse(res, STATUS_CODES.OK, {
        message: 'Question updated successfully',
      });
    }

    sendResponse(res, STATUS_CODES.OK, {
      message: 'Something went wrong. Please try again',
    });
  } catch (error: any) {
    sendResponse(error, STATUS_CODES.INTERNAL_SERVER_ERROR, {
      error: 'Internal server error',
    });
  }
};

export default UpdateQuestion;
