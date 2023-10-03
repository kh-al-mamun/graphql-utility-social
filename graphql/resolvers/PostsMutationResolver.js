import { ObjectId } from "mongodb";
import connectToDB from "../../dbConfig/dbGql.js";
import { runJwtVerification, runSameUserCheck } from "../../verificationFunctions/verifyJWT.js";

const postMutationResolvers = {
    Mutation: {
        addPost: async (_, args, context) => {
            // runJwtVerification(context);
            const newPost = args.newPost;
            const { postCollection } = await connectToDB();
            try {
                const result = await postCollection.insertOne(newPost);
                if (!result.insertedId) throw new Error("Failed to add post");
                newPost._id = result.insertedId;
                return {
                    code: "200",
                    success: true,
                    message: `Post added successfully`,
                    insertedId: result.insertedId,
                    post: newPost
                }
            }
            catch (error) {
                throw new Error(`Failed to add post. Error: ${error.message}`);
            }
        },

        deletePost: async (_, args, context) => {
            const userId = args.userId; const postId = args.postId;
            // runJwtVerification(context);
            // runSameUserCheck(userId);
            const { postCollection, likeCollection, commentCollection, notificationCollection, savedPostCollection } = await connectToDB();
            const deletePost = await postCollection.deleteOne({ _id: new ObjectId(postId), userId: userId });
            if (deletePost.deletedCount !== 1) throw new Error('Could not delete the post. Try again later');
            const deleteLikes = await likeCollection.deleteMany({ postId: postId });
            const deleteComments = await commentCollection.deleteMany({ postId: postId });
            const deleteNotification = await notificationCollection.deleteMany({ postId: postId });
            const deleteSavePosts = await savedPostCollection.deleteMany({ postId: postId });
            return {
                code: "200",
                success: true,
                message: `Post deleted`,
                postDeleted: deletePost.deletedCount,
                likesDeleted: deleteLikes.deletedCount,
                commentsDeleted: deleteComments.deletedCount,
                notificationDeleted: deleteNotification.deletedCount,
                savePostsDeleted: deleteSavePosts.deletedCount
            }
        },

        likePost: async (_, args, context) => {
            const { postId, postLikerId, created_at } = args;
            runJwtVerification(context);
            runSameUserCheck(postLikerId, context);
            const newLike = {
                postId,
                postLikerId,
                created_at,
            }
            const { likeCollection } = await connectToDB();
            try {
                const result = await likeCollection.insertOne(newLike);
                if (!result.insertedId) throw new Error("Failed to like post");
                newLike._id = result.insertedId;
                return {
                    code: "200",
                    success: true,
                    message: `Post liked`,
                    insertedId: result.insertedId,
                    like: newLike,
                }
            }
            catch (error) {
                throw new Error(`Failed to like post. Error: ${error.message}`);
            }
        },

        unlikePost: async (_, args, context) => {
            runJwtVerification(context);
            runSameUserCheck(args.postLikerId, context);
            const { likeCollection } = await connectToDB();
            try {
                const result = await likeCollection.deleteOne({ _id: new ObjectId(args.likeId) });
                if (result.deletedCount !== 1) throw new Error("Failed to unlike post");
                return {
                    code: 200,
                    success: true,
                    message: `Post unliked`,
                    deletedCount: result.deletedCount,
                }
            }
            catch (error) {
                throw new Error(`Failed to unlike post. Error: ${error.message}`);
            }
        },

        savePost: async (_, args, context) => {
            runJwtVerification(context);
            runSameUserCheck(args.postToSave.userId, context);
            const { savedPostCollection } = await connectToDB();
            const result = await savedPostCollection.insertOne(args.postToSave);
            if (!result.insertedId) throw new Error("Failed to save post");
            return {
                code: 200,
                success: true,
                message: `Post saved`,
                insertedId: result.insertedId,
            }
        },

        removeSavedPost: async (_, args, context) => {
            runJwtVerification(context);
            runSameUserCheck(args.userId, context);
            const { savedPostCollection } = await connectToDB();
            const result = await savedPostCollection.deleteOne(
                { postId: args.postId, userId: args.userId }
            );
            if (result.deletedCount !== 1) throw new Error("Failed to remove this saved post");
            return {
                code: 200,
                success: true,
                message: `Post removed`,
                deletedCount: result.deletedCount,
            }
        },

        addComment: async (_, args, context) => {
            runJwtVerification(context);
            runSameUserCheck(args.userId, context)
            const newComment = args.newComment;
            const { commentCollection } = await connectToDB();
            const result = await commentCollection.insertOne(newComment);
            if (!result.insertedId) throw new Error("Failed to add comment");
            newComment._id = result.insertedId;
            return {
                code: 200,
                success: true,
                message: `Comment added`,
                insertedId: result.insertedId,
                comment: newComment,
            }
        },

        sendNotification: async (_, args, context) => {
            runJwtVerification(context);
            const newNotification = args.newNotification;
            runSameUserCheck(newNotification.senderId, context);
            const { notificationCollection } = await connectToDB();
            const result = await notificationCollection.insertOne(newNotification);
            if (!result.insertedId) throw new Error("Failed to send notification");
            newNotification.insertedId = result.insertedId;
            return {
                code: 200,
                success: true,
                message: `Notification sent`,
                insertedId: result.insertedId,
                notification: newNotification,
            }
        },

        deleteNotification: async (_, args, context) => {
            runJwtVerification(context);
            const query = {
                senderId: args.senderId,
                type: args.type
            }
            if (args.postId) { query.postId = args.postId; }
            else { query.receiverId = args.receiverId };

            const { notificationCollection } = await connectToDB();
            const result = await notificationCollection.deleteOne(query);
            if (result.deletedCount !== 1) throw new Error("Failed to delete notification");
            return {
                code: 200,
                success: true,
                message: `Notification removed`,
                deletedCount: result.deletedCount,
            }
        },

        resetNotifications: async (_, args, context) => {
            runJwtVerification(context);
            runSameUserCheck(args.userId, context);
            const { userCollection } = await connectToDB();
            const result = await userCollection.updateOne(
                { _id: new ObjectId(args.userId) },
                { $set: { last_notification_checked: Date.now() } }
            );
            if (!result.modifiedCount) throw new Error("Failed to reset the notifications");
            return {
                code: 200,
                success: true,
                message: `Notification has been reset`,
                modifiedCount: result.modifiedCount,
            }
        }
    }
}

export default postMutationResolvers;