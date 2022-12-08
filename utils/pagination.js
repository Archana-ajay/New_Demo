exports.getPagination = (page, size) => {
    const limit = size ? +size : 5;
    const offset = page ? page * limit : 0;

    return { limit, offset };
};
exports.getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: users } = data;
    //const count=totalItems
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, users, totalPages, currentPage,itemsperpage:limit };
};

exports.hello=(nam)=>{
    return nam+"1"
}
exports.valuePromise = () => new Promise((resolve, reject) => {
    setTimeout(() => resolve("done!"), 1000)
  });
  exports.getSignedURL = async (key) => {
    const url = await s3.getSignedUrlPromise("getObject", {
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Expires: 60 * 5,
    });
    if (!url) {
        throw new CustomAPIError("image not exist in bucket");
    }
    return await url;
};
