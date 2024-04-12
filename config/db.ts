import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const connectToPrisma = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to database via Prisma");
  } catch (error: any) {
    console.error("Error connecting to the database: ", error.message);
  }
};

export default connectToPrisma;
