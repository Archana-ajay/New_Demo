const { Parser } = require("json2csv");
const fs = require("fs");

exports.csvDownload = (csv_path, data) => {
    const parser = new Parser([
        {
            value: "createdAt",
            label: "Date",
        },
        {
            value: "description",
            label: "Description",
        },
        {
            value: "firstName",
            label: "Updated By",
        },
    ]);
    const csv = parser.parse(data);
    fs.writeFile(csv_path, csv, (err) => {
        if (err) {
            throw err;
        }
    });
    return true;
};