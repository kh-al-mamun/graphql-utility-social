const reportSchema = `#graphql
    type Report {
        _id: ID
        userId: ID
        created_at: Int64
        message: String
        media: [Media]
        type: ReportTypes
        status: ReportStatus
    }

    enum ReportTypes {
        BUG
    }

    enum ReportStatus {
        PENDING
        RESOLVED
        CANCELED
    }

    input report {
        created_at: Int64!
        userId: ID!
        message: String!
        media: [media]
        type: ReportTypes!
    }

    type AddReportMutationResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        insertedId: ID
        deletedCount: Int
        report: Report
    }

    extend type Mutation {
        addReport(userId: ID!, newReport: report!): AddReportMutationResponse
    }
`;

export default reportSchema;