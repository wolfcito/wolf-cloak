import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const uri = import.meta.env.VITE_SUBGRAPH_URL as string | undefined;

export const apollo = uri
  ? new ApolloClient({
      link: new HttpLink({ uri, fetch }),
      cache: new InMemoryCache(),
    })
  : null;
