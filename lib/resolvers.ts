// Provide resolver functions for your schema fields
import { PrismaClient } from '@prisma/client'
import {Resolvers} from "./types";
import {validateUcan} from "./validateUcan";

const prisma = new PrismaClient()

export const resolvers : Resolvers = {
    Query: {
        omo:  (parent, args) => {
            return <any>"";
        },
        profiles: async (parent, args) => {
            const q = {};
            Object.keys(args.fields)
                .map(key => {
                    return {
                        key: key,
                        value: args.fields[key]
                    }
                })
                .filter(kv => kv.value)
                .forEach(kv => {
                    q[kv.key] = kv.value;
                });

            return await prisma.profile.find({
                where: {
                    ...q
                }
            });
        },
        fissionRoot: async (parent, args) => {
            const q = {};
            Object.keys(args.fields)
                .map(key => {
                    return {
                        key: key,
                        value: args.fields[key]
                    }
                })
                .filter(kv => kv.value)
                .forEach(kv => {
                    q[kv.key] = kv.value;
                });

            const result = await prisma.profile.findUnique({
                where: {
                    ...q
                },
                select: {
                    fissionRoot: true
                }
            });

            return result.fissionRoot;
        }
    },
    Mutation: {
        updateProfile: (parent, args) => {
            const jwtPayload = validateUcan("did:123", args.jwt);
            return {
                fissionName: <string>jwtPayload.rsc
            };
        }
    },
    Omo: {
        __isTypeOf: (obj) => {
            return <any>"";
        },
        did: (parent, args) => {
            return <any>"";
        }
    },
    Profile: {
        __isTypeOf: obj => {
            return <any>"";
        },
        did: (parent, args) => {
            return <any>"";
        },
        circlesAddress: (parent, args) => {
            return <any>"";
        },
        fissionName: (parent, args) => {
            return <any>"";
        },
        fissionRoot: (parent, args) => {
            return <any>"";
        },
        omoAvatarCID: (parent, args) => {
            return <any>"";
        },
        omoFirstName: (parent, args) => {
            return <any>"";
        },
        omoLastName: (parent, args) => {
            return <any>"";
        }
    }
};
