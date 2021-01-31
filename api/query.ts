import { ApolloServer } from 'apollo-server-micro';
import {typeDefs} from "../lib/schema";
import {resolvers} from "../lib/resolvers";

const res = <any>resolvers;
const def = <any>typeDefs;
const server = new ApolloServer({ typeDefs: def, resolvers: res });

export default server.createHandler({
    path: '/api/query',
});

export const config = {
    api: {
        bodyParser: false,
    },
};
