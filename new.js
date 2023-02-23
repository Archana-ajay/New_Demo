const fs = require("fs");
const a=fs.readFileSync('./new.json','utf-8')
var myObject= JSON.parse(a);
console.log(myObject);