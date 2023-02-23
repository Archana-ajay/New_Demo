const _ = require('lodash');
exports.sorted = (sortitems) => {
    var orderArray = [];
    if (sortitems) {
        const sorts = sortitems.split(',');
        _.each(sorts, async (sort) => {
            let field = sort;
            let order = 'ASC';
            if (sort.charAt(0) === '-') {
                order = 'DESC';
                field = sort.substring(1); // everything after first char
            }
            orderArray.push([field, order]);
        });
    } else {
        // default ordering (createdAt)
        orderArray.push(['createdAt', 'DESC']);
    }
    return orderArray;
};
