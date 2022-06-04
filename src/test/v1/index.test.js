const app = require("../../app");
const chai = require("chai");
const chaiHttp = require("chai-http");
const nock = require("nock");
const axios = require("axios");
const httpAdapter = require("axios/lib/adapters/http");
const { CARRIS_BASE_URL } = require("../../api/v1/helpers");
const timetableCassete = require("./cassettes/4544_timetable.json");

chai.should();
chai.use(chaiHttp);

axios.defaults.host = CARRIS_BASE_URL;
axios.defaults.adapter = httpAdapter;

const BASE_URL = "/api/v1";

describe("API v1", () => {
  describe("GET /routes", () => {
    it("returns routes", (done) => {
      chai.request(app)
        .get(`${BASE_URL}/routes`)
        .end((_, response) => {
          response.should.have.status(200);
          response.body.should.be.a("array");
          response.body.forEach(route => {
            route.should.have.keys([
              "id",
              "name",
              "previousRoute",
              "previousOperator",
              "county"
            ]);
          });
          done();
        });
    });
  });

  describe("GET /routes/:routeId", () => {
    it("returns routes", (done) => {
      chai.request(app)
        .get(`${BASE_URL}/routes/4511`)
        .end((_, response) => {
          response.should.have.status(200);
          response.body.should.have.keys([
            "id",
            "name",
            "previousRoute",
            "previousOperator",
            "county",
            "directions"
          ]);
          response.body.directions.should.be.a("array");
          response.body.directions.forEach(direction => {
            direction.should.have.keys([
              "id",
              "direction",
              "description"
            ]);
          });
          done();
        });
    });
  });

  describe("GET /routes/:routeId/directions", () => {
    it("returns routes", (done) => {
      chai.request(app)
        .get(`${BASE_URL}/routes/4511/directions`)
        .end((_, response) => {
          response.should.have.status(200);
          response.body.should.be.a("array");
          response.body.forEach(direction => {
            direction.should.have.keys([
              "id",
              "direction",
              "description"
            ]);
          });
          done();
        });
    });
  });

  describe("GET /routes/:routeId/directions/:directionId", () => {
    it("returns routes", (done) => {
      nock(CARRIS_BASE_URL)
        .get("/4511_0_1.json")
        .reply(200, timetableCassete);

      chai.request(app)
        .get(`${BASE_URL}/routes/4511/directions/4511_0_1`)
        .end((_, response) => {
          response.should.have.status(200);
          response.body.should.have.keys(["id", "direction", "description", "departures"]);
          response.body.departures.should.be.a("array");
          response.body.departures.forEach(departure => {
            departure.should.have.keys([
              "stop",
              "timetable"
            ]);
          });
          done();
        });
    });
  });
});
