// FLAG: DELETE
import { ObjectId } from "mongodb";
import connectToDB from "../../dbConfig/dbGql.js";
import { runJwtVerification } from "../../verificationFunctions/verifyJWT.js";

const resolvers = {
    Query: {
        post: async (_, args, context) => {
            if (!args.postId) {
                throw new Error("Must provide a postId");
            }
            const { postsCollection } = await connectToDB();
            try {
                return await postsCollection.findOne({_id: new ObjectId(args.postId)});
            }
            catch (error) {
                throw new Error(`Failed to get the post. Error: ${error.message}`);
            }
        }
    },

    // mutations
    Mutation: {
        addPost: async (_, args, context) => {
            // runJwtVerification(context);
            const newPost = args.newPost;
            const { postsCollection } = await connectToDB();
            try {
                const result = await postsCollection.insertOne(newPost);
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
        }
    }
}

export default resolvers;