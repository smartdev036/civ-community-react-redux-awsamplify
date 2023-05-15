// const { handler } = require("../amplify/backend/function/countyFunction/src");
// const event = require("../amplify/backend/function/countyFunction/src/event.json");
// (async function(){

//     // invoke
//     const response = await handler(event)

//     console.log(response)
// })()

(async function () {
  const { handler } = require("../amplify/backend/function/historicalFunction/src");
  const event = require("../amplify/backend/function/historicalFunction/src/event.json");
  const response = await handler(event);
  console.log(response);
})();
