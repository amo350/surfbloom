import { baseProcedure, createTRPCRouter, protectedProceduce } from "../init";
import { prisma } from "@/lib/prisma";
export const appRouter = createTRPCRouter({
  getUsers: protectedProceduce.query(({ ctx }) => {
    return prisma.user.findMany({
      where: {
        id: ctx.auth?.user.id,
      },
    });
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
