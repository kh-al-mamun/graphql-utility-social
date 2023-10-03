const songsSchema = `#graphql
    type Song {
        _id: ID!
        title: String!
        created_at: Date!
        duration: Float!
        url: String!
        thumbnail: String
        comment: String
        artist: String
        inQueue: Boolean
        userId: ID!
        user: User
    }

    extend type Query {
        song(songId: ID!): Song
        songs(userId: ID!, inQueue: Boolean): [Song]
    }

    # Mutations
    input song {
        title: String!
        artist: String!
        created_at: Date!
        duration: Float!
        url: String!
        thumbnail: String
        comment: String
        inQueue: Boolean
        userId: ID!
    }

    type AddSongMutationResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        insertedId: String
        song: Song #no new fetching, push insertedId in input and resend to the client
    }

    type UpdateSongResponse {
        acknowledged: Boolean
        modifiedCount: Int
        upsertedId: String
        upsertedCount: Int
        matchedCount: Int
        success: Boolean!
        message: String!
    }

    type DeleteSongResponse {
        acknowledged: Boolean
        deletedCount: Int
        code: String
        success: Boolean!
        message: String
        deletedId: ID
    }

    extend type Mutation {
        addSong(input: song!): AddSongMutationResponse
        toggleSong(songId: ID!): UpdateSongResponse
        deleteSong(songId: ID!, userId: ID!): DeleteSongResponse
    }
`;

export default songsSchema;