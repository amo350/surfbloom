import { checkout, polar, portal } from "@polar-sh/better-auth";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { AccountRole } from "@/generated/prisma/enums";
import { prisma } from "./prisma";
import { polarClient } from "./polar";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            { productId: "34ef758d-c481-4f92-8a3e-ea358fe89e82", slug: "Pro" },
          ],
          successUrl: process.env.POLAR_SUCCESS_URL,
          authenticatedUsersOnly: true,
        }),
        portal(),
      ],
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            const existingOwner = await prisma.user.findFirst({
              where: { accountRole: AccountRole.OWNER },
            });
            if (existingOwner === null) {
              await prisma.user.update({
                where: { id: user.id },
                data: { accountRole: AccountRole.OWNER },
              });
            }
          } catch (err) {
            console.error("[auth] Failed to promote first user to OWNER:", err);
          }
        },
      },
    },
  },
});
