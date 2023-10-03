import connectToDB from "../../dbConfig/dbGql.js";
import { ObjectId } from "mongodb";
import { runJwtVerification, runSameUserCheck } from "../../verificationFunctions/verifyJWT.js";

// A map of functions which return data for the schema.
const resolvers = {
    Query: {
        user: async (_, args, context) => {
            // runJwtVerification(context)
            let queryConditions;
            if (args.userId) {
                runSameUserCheck(args.userId, context);
                queryConditions = { _id: new ObjectId(args.userId) };
            } else if (args.email) {
                // runSameUserCheck(args.email, context)
                queryConditions = { email: args.email };
            } else {
                throw new Error("Must provide one of the following: userId or email");
            }
            const { userCollection } = await connectToDB();
            return await userCollection.findOne(queryConditions);
        },

        users: async (_, __, context) => {
            runJwtVerification(context);
            if (context.user.role !== 'ADMIN') throw new Error("Unauthorized access detected!");
            const { userCollection } = await connectToDB();
            const result = await userCollection.find().toArray();
            return result;
        },

        // search users by username or displayname, case insensitively
        searchUsers: async (_, args, context) => {
            // runJwtVerification(context);
            const keywordPattern = new RegExp(args.keyword, 'i');
            const query = {
                $or: [{ displayName: { $regex: keywordPattern } }, { username: { $regex: keywordPattern } }],
                privacy: { $ne: 'HIDDEN' }
            };
            const { userCollection } = await connectToDB();
            const result = await userCollection.find(
                query,
                { projection: { _id: 1, username: 1, displayName: 1, image: 1 } }
            ).toArray()
            return result;
        },

        isUsernameTaken: async (_, args) => {
            if (!args.username) throw new Error("Username not provided! You must provide a username to check against.");
            if (!typeof (args.username) === 'string') throw new Error("Invalid username format, it must be a string.");
            const { userCollection } = await connectToDB();
            const result = await userCollection.findOne({ username: args.username.toLowerCase() });
            return Boolean(result)
        },

        getEmailFromUsername: async (_, args) => {
            if (!args.username) throw new Error("Username not provided! You must provide a username to check against.");
            if (!typeof (args.username) === 'string') throw new Error("Invalid username format, it must be a string.");
            const { userCollection } = await connectToDB();
            return await userCollection.findOne({ username: args.username.toLowerCase() })
        },

        publicProfile: async (_, args, context) => {
            // runJwtVerification(context);
            const { userCollection } = await connectToDB();
            const foundUser = await userCollection.findOne(
                { username: args.username },
                {
                    projection: {
                        _id: 1,
                        displayName: 1,
                        username: 1,
                        image: 1,
                        bio: 1,
                        website: 1,
                        phone: 1,
                    }
                }
            );
            // get follower and following count
            const { followCollection } = await connectToDB();
            foundUser.followerCount = await followCollection.countDocuments({ profileId: foundUser._id.toString() });
            foundUser.followingCount = await await followCollection.countDocuments({ userId: foundUser._id.toString() });
            return foundUser;
        },

        followSuggestion: async (_, args, context) => {
            // runJwtVerification(context);
            const userId = args.userId;
            const { followCollection, userCollection } = await connectToDB();
            // get user's already following ids
            const aggregate = await followCollection.aggregate([
                {
                    $match: {
                        userId: userId
                    }
                },
                {
                    $project: {
                        profileId: 1
                    }
                },
                {
                    $group: {
                        _id: null,
                        profileIds: { $addToSet: "$profileId" }
                    }
                }
            ]).toArray();
            // if aggregation produce result. It returns an empty array if nothing found.
            // but it returns an array of objects when it find something.
            let objectIds = [];
            if (aggregate.length > 0) {
                objectIds = aggregate[0].profileIds.map(id => new ObjectId(id));
            }
            // push user's own id, user does not want to follow himself, does he?
            objectIds.unshift(new ObjectId(userId));
            // finally we may get those suggested users, omitting all hidden accounts
            const suggestedUsers = await userCollection.find(
                { _id: { $nin: objectIds }, privacy: { $ne: 'HIDDEN' } },
                { projection: { _id: 1, displayName: 1, username: 1, image: 1 } }
            ).limit(50).toArray();
            return suggestedUsers;
        }
    },


    User: {
        savedPosts: async (parent) => {
            const { savedPostCollection } = await connectToDB();
            return savedPostCollection.find(
                { userId: parent._id.toString() },
                { sort: { created_at: -1 } }
            ).toArray();
        },
        followingAggregate: async (parent) => {
            const { followCollection } = await connectToDB();
            const count = await followCollection.countDocuments({ userId: parent._id.toString() });
            return {
                count,
                userId: parent._id.toString(),
            }
        }
    },


    SavedPost: {
        post: async (parent) => {
            const { postCollection } = await connectToDB();
            return await postCollection.findOne({ _id: new ObjectId(parent.postId) });
        }
    },


    PublicProfile: {
        posts: async (parent) => {
            const { postCollection } = await connectToDB();
            return await postCollection.find(
                { userId: parent._id.toString() },
                { sort: { created_at: -1 } }
            ).toArray();
        },
        // follower: async (parent) => {
        //     const { followCollection } = await connectToDB();
        //     return await followCollection.find({ profileId: parent._id.toString() }).toArray();
        // },
        // following: async (parent) => {
        //     const { followCollection } = await connectToDB();
        //     return await followCollection.find({ userId: parent._id.toString() }).toArray();
        // }
    },


    FollowingAggregate: {
        following: async (parent) => {
            const { followCollection } = await connectToDB();
            return await followCollection.find({ userId: parent.userId }).toArray();
        }
    },


    // mutations starts
    Mutation: {
        storeUser: async (_, args) => {
            const newUser = args.input;
            newUser.role = "USER";
            newUser.last_notification_checked = Date.now();
            const { userCollection } = await connectToDB();
            try {
                const result = await userCollection.insertOne(newUser);
                if (!result.insertedId) throw new Error("Failed to create an account");
                newUser._id = result.insertedId;
                return {
                    code: "200",
                    success: true,
                    message: `Account created successfully`,
                    insertedId: result.insertedId,
                    user: newUser
                }
            }
            catch (error) {
                throw new Error(`Failed to create an account. Error: ${error.message}`);
            }
        },

        updateUser: async (_, args, context) => {
            runJwtVerification(context);
            if (args.userId) {
                runSameUserCheck(args.userId, context);
            } else {
                throw new Error("Must provide userId for same user check.");
            }
            const { userCollection } = await connectToDB();
            try {
                const result = await userCollection.updateOne(
                    { _id: new ObjectId(args.userId) },
                    { $set: args.updatedDoc }
                )
                let message = "User info updated!";
                if (result.modifiedCount === 0 && result.matchedCount > 0) {
                    message = "Everything is up-to-date!"
                }
                return {
                    code: "200",
                    success: true,
                    message,
                    modifiedCount: result.modifiedCount
                }
            }
            catch (error) {
                throw new Error(`Failed to update user info. Error: ${error.message}`);
            }
        },

        followUser: async (_, args, context) => {
            // runJwtVerification(context);
            const newFollow = args.newFollow;
            // runSameUserCheck(newFollow.userId, context);
            const { followCollection } = await connectToDB();
            const result = await followCollection.insertOne(newFollow);
            if (!result.insertedId) throw new Error("Failed to follow the user");
            newFollow.insertedId = result.insertedId;
            return {
                code: "200",
                success: true,
                message: `Following success`,
                insertedId: result.insertedId,
                following: newFollow
            }
        },

        unFollowUser: async (_, args, context) => {
            // runJwtVerification(context);
            // runSameUserCheck(args.userId, context);
            const { followCollection } = await connectToDB();
            const result = await followCollection.deleteOne({ userId: args.userId, profileId: args.profileId });
            if (!result.deletedCount === 1) throw new Error("Failed to unFollow the user");
            return {
                code: '200',
                success: true,
                message: `UnFollow success`,
                deletedCount: result.deletedCount
            }
        }
    }
};

export default resolvers;