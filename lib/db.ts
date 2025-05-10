import { PrismaClient } from "../app/generated/prisma-client";
import { withAccelerate } from "@prisma/extension-accelerate";

const db = new PrismaClient().$extends(withAccelerate());

export default db;
