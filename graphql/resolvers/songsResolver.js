import connectToDB from "../../dbConfig/dbGql.js";
import { ObjectId } from "mongodb";
import { runJwtVerification, runSameUserCheck } from "../../verificationFunctions/verifyJWT.js";

const songsResolver = {
    Query: {
        song: async (_, args, context) => {
            runJwtVerification(context);
            const { songsCollection } = await connectToDB();
            return await songsCollection.findOne({ _id: new ObjectId(args.songId) })
        },
        songs: async (_, args, context) => {
            runJwtVerification(context);
            runSameUserCheck(args.userId, context);
            const { songsCollection } = await connectToDB(); 
            let queryConditions = { userId: args.userId };
            if (args.inQueue || args.inQueue === false) {
                queryConditions.inQueue = args.inQueue
            }
            const options = {
                sort: {created_at: -1}
            }
            return await songsCollection.find(queryConditions, options).toArray();
        },
    },
    Song: {
        user: async (parent, _, context) => {
            runSameUserCheck(parent.userId, context)
            const { userCollection } = await connectToDB();
            return await userCollection.findOne({ _id: new ObjectId(parent.userId) });
        }
    },



    //Mutations starts here
    Mutation: {
        addSong: async (_, args, context) => {
            const newSong = args.input;
            runJwtVerification(context);
            runSameUserCheck(newSong.userId, context);
            newSong.inQueue = false;
            if(!newSong.thumbnail) {
                newSong.thumbnail = "https://ucarecdn.com/b61ed5f3-0aa5-4e96-a52f-a002d4768f0c/"
            }
            try {
                const { songsCollection } = await connectToDB();
                const result = await songsCollection.insertOne(newSong); 
                newSong._id = result.insertedId;
                if (!result.insertedId) throw new Error("Failed to Save the new song");
                return {
                    code: "200",
                    success: true,
                    message: `${newSong.title} is added to your list`,
                    insertedId: result.insertedId,
                    song: newSong
                }
            }
            catch (error) {
                throw new Error(`Failed to Save the new song. Error: ${error.message}`);
            }
        },

        toggleSong: async (_, args, context) => {
            runJwtVerification(context);
            try {
                const { songsCollection } = await connectToDB();
                const oldSong = await songsCollection.findOne({ _id: new ObjectId(args.songId) });
                if(oldSong) runSameUserCheck(oldSong.userId, context);
                const result = await songsCollection.updateOne(
                    { _id: new ObjectId(args.songId) },
                    { $set: { inQueue: oldSong.inQueue ? false : true } }
                )
                
                if (!result.modifiedCount > 0) throw new Error("Failed to update queue.");
                result.success = true;
                result.message = oldSong.inQueue ? `${oldSong.title} is added to queue` : `${oldSong.title} is removed from queue`;
                return result;
            }
            catch (error) {
                throw new Error(`Failed to Update queue. Error: ${error.message}`);
            }
        },

        deleteSong: async (_, args, context) => {
            runJwtVerification(context);
            runSameUserCheck(args.userId, context);
            try {
                const { songsCollection } = await connectToDB();
                const result = await songsCollection.deleteOne({ _id: new ObjectId(args.songId) })
                if (!result.deletedCount > 0) throw new Error("Failed to Delete song");
                result.success = true;
                result.deletedId = args.songId;
                result.message = 'Delete success';
                return result;

            }
            catch (error) {
                throw new Error(`Failed to Delete song. Error: ${error.message}`);
            }
        }
    }
}

export default songsResolver;