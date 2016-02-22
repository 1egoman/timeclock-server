"use strict";
const httpMocks = require("node-mocks-http"),
      assert = require("assert"),
      isAuthenticated = require("../lib/is_authenticated");

describe("is_authenticated", function() {
  it("should login an authenticated user", function(done) {
    let request  = httpMocks.createRequest({
      method: 'GET',
      url: '/some/url',
      isAuthenticated: () => true
    });
    let response = httpMocks.createResponse();

    isAuthenticated(request, response, done);
  });

  it("should not log in an unauthorized user", function(done) {
    let request  = httpMocks.createRequest({
      method: 'GET',
      url: '/some/url',
      isAuthenticated: () => false
    });
    let response = httpMocks.createResponse();

    isAuthenticated(request, response, () => {
      throw new Error("done called?")
    });
    assert.equal(response._getRedirectUrl(), "/");
    done();
  });
});
