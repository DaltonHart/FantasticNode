const http = require("http");

const fs = require("fs");

const status = require("./status.json");

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
  } else if (request.method === "GET" && request.url === "/status") {
    response.writeHead(200, { "Content-type": "application/json" });
    response.end(JSON.stringify(status));
  } else {
    response.statusCode = 404;
    response.end();
  }
});

checkStatus = () => {
  http
    .get("http://localhost:4000/", res => {
      if (res.statusCode === 200) {
        fs.readFile("status.json", "utf8", (err, data) => {
          if (err) {
            console.log(err);
          } else {
            obj = JSON.parse(data);
            obj.success = obj.success + 1;
            obj["percent-fail"] =
              Math.round((obj.error / obj.success) * 100) / 100;
            json = JSON.stringify(obj, null, 2);
            fs.writeFile("status.json", json, "utf8", () => {});
          }
        });
      } else {
        fs.readFile("status.json", "utf8", (err, data) => {
          if (err) {
            console.log(err);
          } else {
            obj = JSON.parse(data);
            obj.error = obj.error + 1;
            obj["percent-fail"] =
              Math.round((obj.error / obj.success) * 100) / 100;
            obj["fails-log"].push({
              code: res.statusCode,
              url: res.path,
              message: res.statusMessage,
              time: new Date().toLocaleString()
            });
            json = JSON.stringify(obj, null, 2);
            fs.writeFile("status.json", json, "utf8", () => {});
          }
        });
      }
    })
    .on("error", e => {
      console.error(`Got error: ${e.message}`);
    });
};

setInterval(checkStatus, 1000);
