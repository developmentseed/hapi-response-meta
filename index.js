/* global require, exports */
'use strict';

var _ = require('lodash');

exports.plugin = {
  register: (server, options) => {
    var name = options.key || 'meta';
    var content = options.content || {credit: 'response-meta'};
    var results = options.results || 'results';
    var routes = options.routes || ['*'];
    var excludeFormats = options.excludeFormats || [];

    server.ext('onPreResponse', function (request, h) {
      // Make sure route matches and we're not exclude based on format
      if ((routes.indexOf(request.route.path) !== -1 || routes[0] === '*') &&
        excludeFormats.indexOf(request.query.format) === -1) {
        if (_.has(request.response.source, name)) {

          request.response.source[name] = _.merge(request.response.source[name], content);
        } else {
          var temp = request.response.source;
          request.response.source = {};
          request.response.source[name] = content;
          request.response.source[results] = temp;
        }
      }

      return h.continue;
    });
  },

  pkg: require('./package.json')
};
