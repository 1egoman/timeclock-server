"use strict";
const httpMocks = require("node-mocks-http"),
      assert = require("assert"),
      stream = require("stream"),
      sinon = require("sinon"),
      repo = require("../lib/repo"),
      badge = require("../routes/badge"),
      sampleCard = {
        card: [],
      };

describe("badge routes", function() {
  beforeEach(function() {
    sinon.stub(repo, "getRepoDetails").resolves({default_branch: "master"});
  });
  afterEach(function() {
    repo.getRepoDetails.restore();
  });

  it("should fetch a valid badge for a repo with a .timecard.json", function(done) {
    let request = httpMocks.createRequest({
      method: 'GET',
      url: '/waltz-app/sample.svg',
      params: {
        username: "waltz-app",
        repo: "sample",
      }
    });

    let writestream = new stream.Stream();
    writestream.writable = true;
    writestream.on('pipe', (data) => {
      assert.equal("https://img.shields.io/badge/unpaid-10h%2055m-yellow.svg", data.uri.href)
      done();
    });

    badge.fetchBadge(request, writestream);
  });
});

// describe("badge routes - failures", function() {
//   beforeEach(function() {
//     sinon.stub(repo, "getRepoDetails").rejects({error: "Not found"});
//   });
//   afterEach(function() {
//     repo.getRepoDetails.restore();
//   });
//
//   it("should no fetch a badge that doesn't exist", function(done) {
//     let request = httpMocks.createRequest({
//       method: 'GET',
//       url: '/waltz-app/i-am-not-a-repo.svg',
//       params: {
//         username: "waltz-app",
//         repo: "i-am-not-a-repo",
//       }
//     });
//
//     let response = httpMocks.createResponse();
//     badge.fetchBadge(request, response).catch((err) => {
//       assert.equal(err, {error: "Not found"});
//       done();
//     });
//   });
// });
