import { PipelineStage, Types } from "mongoose"

export const populateUser = (): PipelineStage[] => [
    {
        $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            pipeline: [
                {
                    $project: {
                        'email': 0,
                        'password': 0
                    }
                }
            ],
            as: 'user'
        }
    },
    {
        $unwind: '$user'
    }
]

export const checkIfUserGiveScore = (userId: string): PipelineStage[] => [
    {
        $lookup: {
            from: 'replyscores',
            let: { reply_id: '$_id', user_id: new Types.ObjectId(userId) },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ['$reply', '$$reply_id'] },
                                { $eq: ['$user', '$$user_id'] }
                            ]
                        }
                    }
                }
            ],
            as: 'matchedScores',
        }
    },
    {
        $unwind: { path: '$matchedScores', preserveNullAndEmptyArrays: true }
    },
    {
        $addFields: {
            'user_score': {
                $cond: {
                    if: { $ne: ['$matchedScores', {}] },
                    then: '$matchedScores.score',
                    else: 0
                }
            }
        }
    },
    {
        $project: {
            'matchedScores': 0
        }
    }
];