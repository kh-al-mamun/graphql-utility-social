const typeDefs = `#graphql
  type User{
    _id: ID
    email: String
    username: String
    firstName: String
    lastName: String
    displayName: String
    bio: String
    phone: String
    website: String
    age: Int
    sex: String
    image: String
    created_at: Date
    role: Role
    last_notification_checked: Int64
    savedPosts: [SavedPost]
    followingAggregate: FollowingAggregate
  }

  type Email {
    email: String
  }

  type SavedPost {
    _id: ID
    postId: ID
    userId: ID
    created_at: Date
    post: Post
  }

  type FollowingAggregate {
    count: Int
    following: [Follow]
  }

  type PublicProfile {
    _id: ID
    username: String
    displayName: String
    bio: String
    phone: String
    website: String
    image: String
    followerCount: Int
    followingCount: Int
    posts: [Post]
    # follower: [Follow]
    # following: [Follow]
  }

  type Follow {
    _id: ID
    userId: ID # the one following
    profileId: ID # the one is followed
  }

  enum Role {
    USER
  }

  extend type Query {
    user(userId: ID, email: String): User
    users: [User]
    searchUsers(userId: ID!, keyword: String!): [User]
    isUsernameTaken(username: String): Boolean
    getEmailFromUsername(username: String): Email
    publicProfile(username: String!): PublicProfile
    followSuggestion(userId: ID!): [User]
  }

  input user {
    email: String!
    username: String!
    displayName: String!
    created_at: Date!
    firstName: String
    lastName: String
    image: String
    age: Int
    sex: String
    last_notification_checked: Int64
  }

  input updateUser {
    email: String
    username: String
    displayName: String
    created_at: Date
    website: String
    image: String
    phone: String
    bio: String
    age: Int
    sex: String
  }

  input follow {
    created_at: Int64
    userId: ID # the one following
    profileId: ID # the one is followed
  }

  type StoreUserMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    insertedId: String
    user: User #no new fetching, push insertedId in input and resend to the client
  }

  type UpdateUserMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    modifiedCount: Int
  }

  type FollowUserMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    insertedId: ID
    deletedCount: Int
    following: Follow
  }

  extend type Mutation {
    storeUser(input:user): StoreUserMutationResponse
    updateUser(userId: ID!, updatedDoc: updateUser!): UpdateUserMutationResponse
    followUser(newFollow: follow!): FollowUserMutationResponse
    unFollowUser(userId: ID!, profileId: ID!): FollowUserMutationResponse
  }
`;

export default typeDefs;