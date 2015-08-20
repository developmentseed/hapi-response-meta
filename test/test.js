/* global require, describe, it, before */
'use strict';

var Hapi = require('hapi');
var expect = require('chai').expect;
var Step = require('step');

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

  it('test route option', function (done) {
    var server = register();

    var output = {
      meta: {
        page: 1,
        limit: 100
      },
      results: 'ok'
    };

    server.route({
      method: 'GET',
      path: '/with',
      handler: function (request, reply) {
        return reply(output);
      }
    });
    server.route({
      method: 'GET',
      path: '/without',
      handler: function (request, reply) {
        return reply({this: 'that'});
      }
    });
    server.route({
      method: 'GET',
      path: '/with_meta',
      handler: function (request, reply) {
        return reply({
          meta: {
            important: 'yes'
          },
          results: {
            this: 'that'
          }
        });
      }
    });
    server.register({
      register: require('../'),
      options: {
        content: {
          license: 'Some license',
          website: 'example.com'
        },
        routes: ['/with']
      }
    }, function (err) {
      expect(err).to.be.empty;

      Step(
        function withGet () {
          var request = { method: 'GET', url: '/with'};
          server.inject(request, this);
        },
        function without (res) {
          expect(res.result.meta).to.contain.all.keys('license', 'website');
          var request = { method: 'GET', url: '/without'};
          server.inject(request, this);
        },
        function withMeta (res) {
          expect(res.result).to.not.have.any.keys('meta');
          var request = { method: 'GET', url: '/with_meta'};
          server.inject(request, this);
        },
        function withMeta (res) {
          expect(res.result.meta).to.not.have.any.keys('license', 'website');
          done();
        }
      );
    });
  });

  it('test exclude option', function (done) {
    var server = register();
    var plugin = {
      register: require('../'),
      options: {
        content: {
          license: 'Some license',
          website: 'example.com'
        },
        excludeFormats: ['csv']
      }
    };
    server.register(plugin, function (err) {
      expect(err).to.be.empty;

      var request = { method: 'GET', url: '/?format=csv'};
      server.inject(request, function (res) {
        expect(res.result).to.equal('ok');
        done();
      });
    });
  });
});
