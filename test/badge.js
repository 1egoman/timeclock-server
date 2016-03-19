"use strict";
const httpMocks = require("node-mocks-http"),
      assert = require("assert"),
      stream = require("stream"),
      badge = require("../routes/badge");

describe("badge routes", function() {
  it("should fetch a valid badge for a repo with a .timecard.json", function(done) {
    let request = httpMocks.createRequest({
      method: 'GET',
      url: '/waltz-app/sample.svg',
      params: {
        username: "1egoman",
        repo: "clockmaker",
      }
    });

    let writestream = new stream.Stream()
    writestream.writable = true
    writestream.on('pipe', (data) => {
      assert.equal("https://img.shields.io/badge/unpaid-10h%2055m-yellow.svg", data.uri.href)
      done();
    });

    badge.fetchBadge(request, writestream);
  });

  it("should no fetch a badge that doesn't exist")//, function(done) {
  //   let request = httpMocks.createRequest({
  //     method: 'GET',
  //     url: '/1egoman/clockmaster.svg',
  //     params: {
  //       username: "1egoman",
  //       repo: "i-am-not-a-repo",
  //     }
  //   });
  //
  //   let response = httpMocks.createResponse();
  //   badge.fetchBadge(request, response);
  //   assert.equal(response._getData(), {error: "Not found"});
  // });
});
