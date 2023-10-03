const todosSchema = `#graphql
    type Todo {
        _id: ID!
        title: String
        description: String
        status: AllowedStatus!
        timeInitiated: Date
        timeEnded: Date
        userId: ID!
        user: User
    }

    extend type Query {
        todo(todoId: ID!): Todo
        todos(userId: ID!, status: AllowedStatus): [Todo]
    }

    #Mutations starts from here

    input todo {
        title: String!
        description: String!
        timeInitiated: Date!
        status: AllowedStatus!
        userId: ID!
    }

    input updatedDoc {
        title: String!
        description: String!
    }

    enum AllowedStatus {
        PENDING
        COMPLETED
    }

    type AddTodoMutationResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        insertedId: String
        todo: Todo #no new fetching, push insertedId in input and resend to the client
    }

    type UpdateTodoResult {
        acknowledged: Boolean
        modifiedCount: Int
        upsertedId: String
        upsertedCount: Int
        matchedCount: Int
        success: Boolean!
        message: String!
    }

    type DeleteTodoResult {
        acknowledged: Boolean
        deletedCount: Int
        code: String
        success: Boolean!
        message: String
        deletedId: ID
    }

    extend type Mutation {
        addTodo(input: todo!): AddTodoMutationResponse
        toggleTodo(todoId: ID!): UpdateTodoResult
        updateTodo(todoId: ID!, userId: ID!, input: updatedDoc): UpdateTodoResult
        deleteTodo(todoId: ID!, userId: ID!): DeleteTodoResult
    }
`

export default todosSchema;