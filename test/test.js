/* global require, describe, it, before */
'use strict';

const Hapi = require('@hapi/hapi');
const expect = require('chai').expect;

const register = function () {
  const server = new Hapi.Server();
  server.route({ method: 'GET', path: '/', handler: function (request, h) { return 'ok'; }});

  return server;
};

describe('Test hapi-response-meta', function () {
  it('test if meta is added to response', async function(done) {
    const server = register();
    await server.register(require('../'));

    const request = { method: 'GET', url: '/'};
    let res = await server.inject(request);
    expect(res.result).to.have.all.keys(['meta', 'results']);
    done();
  });

  it('test options', async function (done) {
    const server = register();

    const plugin = {
      plugin: require('../'),
      options: {
        key: 'NewMeta',
        content: {
          license: 'Some license',
          website: 'example.com'
        },
        results: 'output'
      }
    };

    await server.register(plugin);

    const request = { method: 'GET', url: '/'};
    let res = await server.inject(request)
    expect(res.result).to.have.all.keys(['NewMeta', 'output']);
    expect(res.result.NewMeta).to.have.all.keys(['license', 'website']);
    expect(res.result.NewMeta.website).to.equal('example.com');
    expect(res.result.NewMeta.license).to.equal('Some license');
    done();
  });

  it('test when meta is already present', async function (done) {
    const server = register();

    const output = {
      meta: {
        page: 1,
        limit: 100
      },
      results: 'ok'
    };

    server.route({ method: 'GET', path: '/new', handler: function (request, h) { return output; }});

    const plugin = {
      plugin: require('../'),
      options: {
        content: {
          license: 'Some license',
          website: 'example.com'
        }
      }
    };

    await server.register(plugin);

    const request = { method: 'GET', url: '/new'};
    const res = await server.inject(request);
    expect(res.result.meta).to.have.all.keys(['license', 'website', 'page', 'limit']);
    done();
  });

  it('test route option', async function (done) {
    const server = register();

    const output = {
      meta: {
        page: 1,
        limit: 100
      },
      results: 'ok'
    };

    server.route({
      method: 'GET',
      path: '/with',
      handler: function (request, h) {
        return output;
      }
    });
    server.route({
      method: 'GET',
      path: '/without',
      handler: function (request, h) {
        return {this: 'that'};
      }
    });
    server.route({
      method: 'GET',
      path: '/with_meta',
      handler: function (request, h) {
        return {
          meta: {
            important: 'yes'
          },
          results: {
            this: 'that'
          }
        };
      }
    });
    await server.register({
      plugin: require('../'),
      options: {
        content: {
          license: 'Some license',
          website: 'example.com'
        },
        routes: ['/with']
      }
    })

    var request = { method: 'GET', url: '/with'};
    var res = await server.inject(request);
    expect(res.result.meta).to.contain.all.keys('license', 'website');

    request = { method: 'GET', url: '/without'};
    res = await server.inject(request);
    expect(res.result).to.not.have.any.keys('meta');

    request = { method: 'GET', url: '/with_meta'};
    res = await server.inject(request);
    expect(res.result.meta).to.not.have.any.keys('license', 'website');
    done();
  });

  it('test exclude option', async function (done) {
    const server = register();
    const plugin = {
      plugin: require('../'),
      options: {
        content: {
          license: 'Some license',
          website: 'example.com'
        },
        excludeFormats: ['csv']
      }
    };
    await server.register(plugin);

    const request = { method: 'GET', url: '/?format=csv'};
    const res = await server.inject(request);
    expect(res.result).to.equal('ok');
    done();
  });
});
