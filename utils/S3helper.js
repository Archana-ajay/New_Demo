const AWS = require('aws-sdk');
const CustomAPIError = require('../errors/custom-api');

const s3 = new AWS.S3({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_REGION,
});

exports.getSignedURL = async (key) => {
    try {
        const params = {
            Bucket: process.env.S3_BUCKET,
            Key: key,
        };
        //check if obj exists in the bucket
        await s3.headObject(params).promise();
        const url = await s3.getSignedUrlPromise('getObject', {
            Bucket: process.env.S3_BUCKET,
            Key: key,
            Expires: 60 * 5,
        });
        if (url) {
            return url;
        }
        if (!url) {
            throw new CustomAPIError('something went wrong');
        }
    } catch (err) {
        if (err.name === 'NotFound') {
            return null;
        }
    }
};
