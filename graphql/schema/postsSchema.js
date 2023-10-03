const typeDefs = `#graphql
    type Post {
        _id: ID,
        userId: ID,
        caption: String,
        created_at: Int64,
        location: String,
        media: [Media],
        likesAggregate: LikesAggregate
        commentsAggregate: CommentsAggregate
        likes: [Like],
        comments: [Comment],
        user: User,
    }

    type Media {
        asset_id: String,
        url: String,
        width: Int,
        height: Int,
        type: String,
        format: String,
    }

    type LikesAggregate {
        count: Int,
        likes: [Like]
    }

    type CommentsAggregate {
        count: Int,
        comments: [Comment]
    }

    type Like {
        _id: ID,
        postId: ID,
        postLikerId: ID,
        created_at: Date,
    }

    type Comment {
        _id: ID,
        postId: ID,
        userId: ID,
        created_at: Date,
        caption: String,
        user: User,
    }

    type SavedPost {
        _id: ID,
        postId: ID,
        userId: ID,
        created_at: Date,
        saved: Post,
    }

    type Notification {
        _id: ID,
        postId: ID,
        senderId: ID,
        receiverId: ID,
        created_at: Int64,
        type: NotificationTypes,
        post: Post,
        sender: User,
    }

    enum NotificationTypes {
        LIKE
        FOLLOW
        COMMENT
    }

    extend type Query {
        post(postId: ID!): Post
        feedPosts(userId: ID!, createdAt: Int64): [Post]
        savedPosts(userId: ID!): [SavedPost]
        isPostAlreadySaved(postId: ID!, userId: ID!): Boolean
        commentsByPostId(postId: ID!): [Comment]
        notifications(receiverId: ID!, lastChecked: Int64): [Notification]
        exploreGridPosts(userId: ID!, limit: Int): [Post]
        # postsByUser(usrId: ID!): [Post]
    }

    input post {
        userId: ID!,
        caption: String,
        media: [media],
        location: String,
        created_at: Int64!,
    }

    input media {
        asset_id: String,
        url: String,
        width: Int,
        height: Int,
        type: String,
        format: String,
    }

    input savePost {
        postId: ID,
        userId: ID,
        created_at: Date,
    }

    input comment {
        postId: ID,
        userId: ID,
        created_at: Date,
        caption: String,
    }

    input notification {
        postId: ID,
        senderId: ID!,
        receiverId: ID!,
        created_at: Int64!,
        type: NotificationTypes!
    }

    type AddPostMutationResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        insertedId: String
        post: Post #no new fetching, push insertedId in input and resend to the client
    }

    type DeletePostMutationResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        postDeleted: Int
        likesDeleted: Int
        commentsDeleted: Int
        notificationDeleted: Int
        savePostsDeleted: Int
    }

    type LikePostMutationResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        insertedId: String
        deletedCount: Int
        like: Like #no new fetching, push insertedId in input and resend to the client
    }

    type SavePostMutationResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        insertedId: String
        deletedCount: Int
    }

    type AddCommentMutationResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        insertedId: String
        deletedCount: Int
        comment: Comment #no new fetching, push insertedId in input and resend to the client
    }

    type NotificationMutationResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        insertedId: String
        deletedCount: Int
        notification: Notification #no new fetching, push insertedId in input and resend to the client
    }

    type ResetNotificationMutationResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        modifiedCount: Int
    }

    extend type Mutation {
        addPost(newPost: post!): AddPostMutationResponse
        deletePost(userId: ID!, postId: ID!): DeletePostMutationResponse
        likePost(postId: ID!, postLikerId: ID!, created_at: Date!): LikePostMutationResponse
        unlikePost(likeId: ID!, postLikerId: ID!): LikePostMutationResponse
        savePost(postToSave: savePost!): SavePostMutationResponse
        removeSavedPost(postId: ID!, userId: ID!): SavePostMutationResponse
        addComment(userId: ID!, newComment: comment!): AddCommentMutationResponse
        sendNotification(newNotification: notification!): NotificationMutationResponse
        deleteNotification(postId: ID, receiverId: ID senderId: ID!, type: NotificationTypes!): NotificationMutationResponse
        resetNotifications(userId: ID!): ResetNotificationMutationResponse
    }
`;

export default typeDefs;