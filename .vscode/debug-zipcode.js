// const { handler } = require("../amplify/backend/function/countyFunction/src");
// const event = require("../amplify/backend/function/countyFunction/src/event.json");
// (async function(){

//     // invoke
//     const response = await handler(event)

//     console.log(response)
// })()

// require('inspector').open(9229, '127.0.0.1', true);
// debugger;

(async function () {
  const { handler } = require("../amplify/backend/function/zipcodeFunction/src");
  const event = require("../amplify/backend/function/zipcodeFunction/src/event.json");
  const response = await handler(event);
  console.log(response);
})();
