const pipeline_getFollowerIds = (userId) => {
    return [
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
    ]
}

export default pipeline_getFollowerIds;