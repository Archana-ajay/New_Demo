const pdf_document = require("pdfkit-table");
async function buildPDF(business_name,data,dataCallback, endCallback) {
  const doc = new pdf_document({ margin: 30, size: "A4" });
  doc.on('data', dataCallback);
  doc.on('end', endCallback);

  const table = {
    title: " Business History ",
    subtitle:
        `${business_name}` +
        `\nGenerated ON: ${new Date().toUTCString()}`,
    //headers:["Date","Description","UpdatedBy"],
    headers: [
        { label: "Date", property: "createdAt", width: 100 },
        { label: "Description", property: "description", width: 250 },
        { label: "UpdatedBy", property:"fullName"}
    ],
    datas:data
};
await doc.table(table, {
    width: 500,
});

//finalize document
doc.end();
}

module.exports = { buildPDF };