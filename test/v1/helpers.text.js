const chai = require("chai");
const chaiHttp = require("chai-http");
const {
  getOldOperator,
  filterRoutes,
  getRoutes,
  getRoute,
  getDirections
} = require("../../api/v1/helpers");

const expect = chai.expect;
chai.should();
chai.use(chaiHttp);

describe("Helpers v1", () => {
  describe("getOldOperator", () => {
    it("returns old operator given and old route", (done) => {
      const result = getOldOperator("301");
      expect(result).to.equal("Rodoviária de Lisboa");
      done();
    });
  });

  describe("filterRoutes", () => {
    it("returns filtered routes", (done) => {
      const testRoutes = [
        { old_operator: "Rodoviária de Lisboa", old_route: "301" },
        { old_operator: "Rodoviária de Lisboa", old_route: "303" },
        { old_operator: "Rodoviária de Lisboa", old_route: "305" },
        { old_operator: "Barraqueiro Transportes", old_route: "200" }
      ];
      const filter = { old_operator: "Rodoviária de Lisboa" };
      const limit = 2;
      const result = filterRoutes(testRoutes, filter, limit);
      expect(result.length).to.equal(limit);
      result.forEach(route => {
        expect(route.old_operator).to.equal("Rodoviária de Lisboa");
      });
      done();
    });
  });

  describe("getRoutes", () => {
    it("returns all routes", (done) => {
      const result = getRoutes();
      result.forEach(route => {
        route.should.have.keys([
          "id",
          "name",
          "old_route",
          "old_operator",
          "county"
        ]);
      });
      done();
    });
  });

  describe("getRoute", () => {
    it("returns route given a route ID", (done) => {
      const result = getRoute("4511");
      result.should.have.keys([
        "id",
        "name",
        "old_route",
        "old_operator",
        "county",
        "directions"
      ]);
      done();
    });
  });

  describe("getDirections", () => {
    it("returns directions given a route ID", (done) => {
      const result = getDirections("4511");
      result.should.be.a("array");
      result.forEach(direction => {
        direction.should.have.keys([
          "id",
          "direction",
          "description"
        ]);
      });

      done();
    });

    it("adds index for multiple options in the same direction", (done) => {
      const result = getDirections("4512");
      result.should.be.a("array");
      result.forEach(direction => {
        expect(direction.description.substr(-3)).to.match(/\([1-2]\)/);
      });
      done();
    });

    it("returns an empty array", (done) => {
      const result = getDirections("2741");
      result.should.be.a("array");
      expect(result.length).to.equal(0);
      done();
    });
  });
});
