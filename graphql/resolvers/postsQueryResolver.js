import { ObjectId } from "mongodb";
import connectToDB from "../../dbConfig/dbGql.js";
import { runJwtVerification, runSameUserCheck } from "../../verificationFunctions/verifyJWT.js";
import pipeline_getFollowerIds from "../../pipelines/pipeline_getFollowerIds.js";

const postQueryResolvers = {
    Query: {
        post: async (_, args, context) => {
            runJwtVerification(context);
            if (!args.postId) {
                throw new Error("Must provide a postId");
            }
            const { postCollection } = await connectToDB();
            try {
                return await postCollection.findOne({ _id: new ObjectId(args.postId) });
            }
            catch (error) {
                throw new Error(`Failed to get the post. Error: ${error.message}`);
            }
        },

        feedPosts: async (_, args, context) => {
            const userId = args.userId; const olderThan = args.createdAt;
            // runJwtVerification(context);
            const { followCollection, postCollection } = await connectToDB();
            // get user's already following ids
            const aggregate = await followCollection.aggregate(pipeline_getFollowerIds(userId)).toArray();
            // let user also see his own posts in feed
            let followingIds = [userId];
            if (aggregate[0]) followingIds = [userId, ...aggregate[0].profileIds];
            // default query: all following people's posts
            let query = { userId: { $in: followingIds } };
            // if a time specified, query for only older posts than that time
            if (olderThan) query = { userId: { $in: followingIds }, created_at: { $lt: olderThan } }
            const feedPosts = await postCollection.find(
                query,
                { sort: { created_at: -1 } }
            ).limit(7).toArray(); // 7 posts at one go
            return feedPosts;
        },

        savedPosts: async (_, args, context) => {
            // runJwtVerification(context)
            // runSameUserCheck(args.userId, context)
            const { savedPostCollection } = await connectToDB();
            return savedPostCollection.find(
                { userId: args.userId },
                { sort: { created_at: -1 } }
            ).toArray()
        },

        isPostAlreadySaved: async (_, args, context) => {
            runJwtVerification(context);
            runSameUserCheck(args.userId, context);
            const { savedPostCollection } = await connectToDB();
            const result = await savedPostCollection.findOne(
                { postId: args.postId, userId: args.userId }
            );
            return Boolean(result)
        },

        commentsByPostId: async (_, args, context) => {
            // runJwtVerification(context);
            const { commentCollection } = await connectToDB();
            return await commentCollection.find({ postId: args.postId }).toArray();
        },

        notifications: async (_, args, context) => {
            // runJwtVerification(context);
            // runSameUserCheck(args.receiverId, context);
            const { notificationCollection } = await connectToDB();
            if (args.lastChecked) {
                return await notificationCollection.find(
                    {
                        receiverId: args.receiverId,
                        created_at: { $gt: args.lastChecked }
                    },
                    { sort: { created_at: -1 } }
                ).toArray();
            } else {
                return await notificationCollection.find(
                    { receiverId: args.receiverId },
                    { sort: { created_at: -1 } }
                ).toArray();
            }
        },

        exploreGridPosts: async (_, args, context) => {
            // runJwtVerification(context);
            const userId = args.userId; const limit = args.limit || 24;
            const { followCollection, postCollection } = await connectToDB();
            // get user's already following ids
            const aggregate = await followCollection.aggregate(pipeline_getFollowerIds(userId)).toArray();
            let followerIds = [];
            if (aggregate[0]) followerIds = aggregate[0].profileIds;
            // explore page should not have user's own posts, so
            followerIds.unshift(userId);
            const exploreGridPosts = await postCollection.find(
                { userId: { $nin: followerIds }, privacy: { $ne: 'HIDDEN' } },
                { projection: { _id: 1, media: 1 }, sort: { created_at: -1 } }
            ).limit(limit).toArray();
            return exploreGridPosts;
        }
    },

    Post: {
        likesAggregate: async (parent) => {
            const { likeCollection } = await connectToDB();
            const count = await likeCollection.countDocuments({ postId: parent._id.toString() });
            return {
                count,
                postId: parent._id.toString()
            }
        },
        commentsAggregate: async (parent) => {
            const { commentCollection } = await connectToDB();
            const count = await commentCollection.countDocuments({ postId: parent._id.toString() });
            return {
                count,
                postId: parent._id.toString()
            }
        },
        likes: async (parent) => {
            const { likeCollection } = await connectToDB();
            return await likeCollection.find({ postId: parent._id.toString() }).toArray();
        },
        comments: async (parent) => {
            const { commentCollection } = await connectToDB();
            return await commentCollection.find({ postId: parent._id.toString() }).toArray();
        },
        user: async (parent) => {
            const { userCollection } = await connectToDB();
            return await userCollection.findOne(
                { _id: new ObjectId(parent.userId) },
                {
                    projection: { _id: 0, displayName: 1, image: 1, username: 1 }
                }
            )
        },
    },


    LikesAggregate: {
        likes: async (parent) => {
            const { likeCollection } = await connectToDB();
            return await likeCollection.find({ postId: parent.postId }).toArray();
        },
    },


    CommentsAggregate: {
        comments: async (parent) => {
            const { commentCollection } = await connectToDB();
            return await commentCollection.find({ postId: parent.postId }).toArray();
        },
    },


    Comment: {
        user: async (parent, _, context) => {
            // runSameUserCheck(parent.userId, context)
            const { userCollection } = await connectToDB();
            return await userCollection.findOne(
                { _id: new ObjectId(parent.userId) },
                {
                    projection: { _id: 0, displayName: 1, image: 1, username: 1 }
                }
            )
        }
    },


    SavedPost: {
        saved: async (parent, _, context) => {
            const { postCollection } = await connectToDB();
            return await postCollection.findOne({ _id: new ObjectId(parent.postId) })
        }
    },


    Notification: {
        post: async (parent) => {
            const { postCollection } = await connectToDB();
            return await postCollection.findOne(
                { _id: new ObjectId(parent.postId) },
                { projection: { _id: 1, media: 1 } }
            )
        },
        sender: async (parent) => {
            const { userCollection } = await connectToDB();
            return await userCollection.findOne(
                { _id: new ObjectId(parent.senderId) },
                { projection: { _id: 0, displayName: 1, image: 1, username: 1 } }
            )
        }
    },
}

export default postQueryResolvers;