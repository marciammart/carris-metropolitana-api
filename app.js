const express = require("express");
const swaggerUI = require("swagger-ui-express");
const swaggerDocs = require("./swagger.json");

const port = process.env.PORT || 8000;
const app = express();

app.use("/api", require("./api"));
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

const server = app.listen(port, () => {
  console.log(`Carris Metropolitana API listening on port ${port}`);
});

module.exports = server;
