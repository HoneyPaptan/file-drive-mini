import { ConvexError, v } from "convex/values"
import {mutation, MutationCtx, query, QueryCtx} from "./_generated/server"
import { getUser } from "./users"
import { filesTypes } from "./schema";


// for uploading files URL generator
export const generateUploadUrl = mutation(async (ctx) => {
    const identity =  await ctx.auth.getUserIdentity()
    if(!identity){
        throw new ConvexError('you must be logged in to upload files')
    }

    return await ctx.storage.generateUploadUrl();
  });




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
        fileId: v.id("_storage"),
        orgId: v.string(),
        type: filesTypes
        
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
            orgId: args.orgId,
            fileId: args.fileId,
            type: args.type
        })
    }
})

export const getFiles = query({
    args : {
        orgId: v.string(),
        type: v.optional(filesTypes),
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
      

        let files = await ctx.db.query('files')
        .withIndex('by_orgId', (q) => q.eq("orgId", args.orgId))
        .collect()
        if (args.type) {
            files = files.filter((file) => file.type === args.type);
          }
      
          const filesWithUrl = await Promise.all(
            files.map(async (file) => ({
              ...file,
              url: await ctx.storage.getUrl(file.fileId),
            }))
          );
      
        return filesWithUrl;
       
    }
})


export const deleteFile = mutation({
    
    args: {fileId : v.id("files")},
    async handler(ctx, args) {
        const identity =  await ctx.auth.getUserIdentity()
        if(!identity){
            throw new ConvexError("You do not have access to this Organisation")
        }

        const file = await ctx.db.get(args.fileId)
        if(!file){
            throw new ConvexError("This file does not exist")
        }

        const hasAccess = await hasAccessToOrg(
            ctx,
            identity.tokenIdentifier,
            file.orgId
        )
        if(!hasAccess){
            throw new ConvexError("You do not have access to delete this file")
        }
        await ctx.db.delete(args.fileId)
    }
})