/* global require, describe, it, before */
'use strict';

var Hapi = require('hapi');
var expect = require('chai').expect;

var register = function () {
  var server = new Hapi.Server();
  server.connection();
  server.route({ method: 'GET', path: '/', handler: function (request, reply) { return reply('ok'); }});

  return server;
};

describe('Test hapi-response-meta', function () {
  it('test if meta is added to response', function (done) {
    var server = register();
    server.register(require('../'), function (err) {
      expect(err).to.be.empty;

      var request = { method: 'GET', url: '/'};
      server.inject(request, function (res) {
        expect(res.result).to.have.all.keys(['meta', 'results']);
        done();
      });
    });
  });

  it('test options', function (done) {
    var server = register();

    var plugin = {
      register: require('../'),
      options: {
        key: 'NewMeta',
        content: {
          license: 'Some license',
          website: 'example.com'
        },
        results: 'output'
      }
    };

    server.register(plugin, function (err) {
      expect(err).to.be.empty;

      var request = { method: 'GET', url: '/'};
      server.inject(request, function (res) {
        expect(res.result).to.have.all.keys(['NewMeta', 'output']);
        expect(res.result.NewMeta).to.have.all.keys(['license', 'website']);
        expect(res.result.NewMeta.website).to.equal('example.com');
        expect(res.result.NewMeta.license).to.equal('Some license');
        done();
      });
    });
  });

  it('test when meta is already present', function (done) {
    var server = register();

    var output = {
      meta: {
        page: 1,
        limit: 100
      },
      results: 'ok'
    };

    server.route({ method: 'GET', path: '/new', handler: function (request, reply) { return reply(output); }});

    var plugin = {
      register: require('../'),
      options: {
        content: {
          license: 'Some license',
          website: 'example.com'
        }
      }
    };

    server.register(plugin, function (err) {
      expect(err).to.be.empty;

      var request = { method: 'GET', url: '/new'};
      server.inject(request, function (res) {
        expect(res.result.meta).to.have.all.keys(['license', 'website', 'page', 'limit']);
        done();
      });
    });
  });
});
