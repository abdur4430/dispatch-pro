"use client";
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client/core";

let client: InstanceType<typeof ApolloClient>;

export function getApolloClient() {
  if (!client) {
    client = new ApolloClient({
      link: createHttpLink({ uri: "/api/graphql", credentials: "include" }),
      cache: new InMemoryCache(),
    });
  }
  return client;
}
