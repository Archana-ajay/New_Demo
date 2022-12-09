const moment = require('moment');
	
        const a=	moment('2022-11-29 17:35:08.046+05:30').fromNow().slice(0,2)
console.log(a);

 const tomorrow = new Date();
//tomorrow.setDate(tomorrow.getDate() + 1);

//   // 👇️ Tomorrow's date
//   console.log(tomorrow);

//   //if (tomorrow.toDateString() === new Date().toDateString()) {
  console.log(tomorrow.toDateString());
//     console.log();
//   //}