import connectToDB from "../../dbConfig/dbGql.js";

const reportResolver = {
    Query: {

    },

    Mutation: {
        addReport: async(_, args) => {
            const userId = args.userId;
            const newReport = args.newReport;
            newReport.status = 'PENDING';
            const {reportCollection} = await connectToDB();
            const result = await reportCollection.insertOne(newReport);
            if(!result.insertedId) throw new Error('Failed to add the report.');
            newReport.insertedId = result.insertedId;
            return {
                code: '200',
                success: true,
                message: 'Your report has been saved. Thanks for your contribution. We will review the issue as soon as possible.',
                insertedId: result.insertedId,
                report: newReport
            }
        }
    }
};

export default reportResolver;