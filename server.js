const http = require("http");
const server = http.createServer().listen(4000, () => {
  console.log("listening...");
});
server.on("request", (request, response) => {
  request.on("error", err => {
    console.error(err);
    response.statusCode = 400;
    response.end();
  });
  response.on("error", err => {
    console.error(err);
  });
  if (request.method === "GET" && request.url === "/") {
    const num = Math.floor(Math.random() * 100);
    if (num >= 15) {
      response.end(JSON.stringify({ Status: "Online" }));
    } else {
      response.statusCode = 500;
      response.end();
    }
  } else {
    response.statusCode = 404;
    response.end();
  }
});

let success = 0;
let fail = 0;
let percentFail;

checkStatus = () => {
  http
    .get("http://localhost:4000/", res => {
      if (res.statusCode === 200) {
        success++;
        percentFail = Math.round((fail / success) * 100) / 100;
        let rawData = "";
        res.on("data", chunk => {
          rawData += chunk;
        });
        res.on("end", () => {
          try {
            const parsedData = JSON.parse(rawData);
            console.log(parsedData.Status);
          } catch (e) {
            console.error(e.message);
          }
        });
      } else {
        fail++;
        percentFail = Math.round((fail / success) * 100) / 100;
        console.error("Failed", `${percentFail}%`);
      }
    })
    .on("error", e => {
      console.error(`Got error: ${e.message}`);
    });
};

setInterval(checkStatus, 1000);
