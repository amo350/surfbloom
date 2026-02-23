import { checkout, polar, portal } from "@polar-sh/better-auth";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { AccountRole } from "@/generated/prisma/enums";
import { polarClient } from "./polar";
import { prisma } from "./prisma";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  throw new Error(
    "Missing required Google OAuth env vars: GOOGLE_CLIENT_ID and/or GOOGLE_CLIENT_SECRET",
  );
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
    google: {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    },
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
            await prisma.$transaction(async (tx) => {
              // Check if any OWNER exists
              const ownerExists = await tx.user.findFirst({
                where: { accountRole: AccountRole.OWNER },
              });

              if (!ownerExists) {
                // First user becomes OWNER (no accountOwnerId - they own themselves)
                await tx.user.update({
                  where: { id: user.id },
                  data: {
                    accountRole: AccountRole.OWNER,
                    // accountOwnerId stays null - they are the account owner
                  },
                });
              }
              // Other users start as USER with no accountOwnerId
              // Their accountOwnerId gets set when they accept an invitation
            });
          } catch (error) {
            console.error("Error in user create hook:", error);
          }
        },
      },
    },
  },
});
