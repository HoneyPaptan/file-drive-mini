import { ConvexError, v } from "convex/values"
import {mutation, MutationCtx, query, QueryCtx} from "./_generated/server"
import { getUser } from "./users"

// special function
async function hasAccessToOrg(ctx: QueryCtx | MutationCtx , tokenIdentifier: string , orgId : string){
    const user  = await getUser(ctx , tokenIdentifier)


    const hasAccess = 
    user.orgIds.includes(orgId) || 
    user.tokenIdentifier.includes(orgId)


    return hasAccess
}



export const createFile = mutation({
    args: {
        name: v.string(),
        orgId: v.string()
        
    },
    async handler(ctx , args){
        const identity =  await ctx.auth.getUserIdentity()
        if(!identity){
            throw new ConvexError('you must be logged in to upload files')
        }

        const hasAccess = await hasAccessToOrg(
            ctx,
            identity.tokenIdentifier,
            args.orgId
        )
        

        if(!hasAccess){
            throw new ConvexError("You do not have access to this Organisation")
        }

        await ctx.db.insert('files', {
            name: args.name,
            orgId: args.orgId
        })
    }
})

export const getFiles = query({
    args : {
        orgId: v.string()
    },
    async handler (ctx, args){
        const identity =  await ctx.auth.getUserIdentity()
        if(!identity){
            return [] // so ui doesnt crash for user
        }

        const hasAccess = await hasAccessToOrg(
            ctx,
            identity.tokenIdentifier,
            args.orgId
        )
        if(!hasAccess){
            return [] // so ui doesnt crash for user
        }

        return ctx.db.query('files')
        .withIndex('by_orgId', (q) => q.eq("orgId", args.orgId))
        .collect()
    }
})