/* global require, exports */
'use strict';

var _ = require('lodash');

exports.register = function (server, options, next) {
  var name = options.key || 'meta';
  var content = options.content || {credit: 'response-meta'};
  var results = options.results || 'results';
  var routes = options.routes || ['*'];

  server.ext('onPreResponse', function (request, reply) {
    if (routes.indexOf(request.route.path) !== -1 || routes[0] === '*') {
      if (_.has(request.response.source, name)) {

        request.response.source[name] = _.merge(request.response.source[name], content);
      } else {
        var temp = request.response.source;
        request.response.source = {};
        request.response.source[name] = content;
        request.response.source[results] = temp;
      }
    }

    return reply.continue();
  });

  next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};
