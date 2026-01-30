import { checkout, polar, portal } from "@polar-sh/better-auth";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { AccountRole } from "@/generated/prisma/enums";
import { prisma } from "./prisma";
import { polarClient } from "./polar";

const TX_CONFLICT_CODES = ["P2034", "P2036", "P2037"];
const MAX_TX_RETRIES = 3;

async function withTxRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_TX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      const code =
        e && typeof e === "object" && "code" in e
          ? (e as { code: string }).code
          : "";
      if (!TX_CONFLICT_CODES.includes(code)) {
        throw e;
      }
    }
  }
  throw lastError;
}

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
            await withTxRetry(() =>
              prisma.$transaction(
                async (tx) => {
                  // Check if any OWNER exists (unique partial index also enforces at most one OWNER)
                  const ownerExists = await tx.user.findFirst({
                    where: {
                      accountRole: AccountRole.OWNER,
                      accountOwnerId: null,
                    },
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
                },
                { isolationLevel: "Serializable" },
              ),
            );
          } catch (error) {
            console.error("Error in user create hook:", error);
          }
        },
      },
    },
  },
});
