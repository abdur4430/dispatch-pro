import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { typeDefs } from "@/graphql/schema";
import { resolvers } from "@/graphql/resolvers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

const server = new ApolloServer<any>({ typeDefs, resolvers });

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req) => {
    const session = await getServerSession(authOptions);
    return {
      session,
      userId: (session?.user as any)?.id,
      companyId: (session?.user as any)?.companyId,
    };
  },
});

export { handler as GET, handler as POST };
