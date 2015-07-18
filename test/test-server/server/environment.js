'use strict';

var UglifyJS  = require('uglify-js');
//var Csso      = require('csso');
var Mincer    = require('mincer');

Mincer.logger.use(console);

var environment = module.exports = new Mincer.Environment('./');

environment.appendPath('bower_components');
environment.appendPath('src/coffee');
environment.appendPath('src/css');
environment.appendPath('src/less');
environment.appendPath('../../');
environment.appendPath('../../');

environment.registerHelper('asset_path', function (logicalPath) {
  var asset = environment.findAsset(logicalPath);
  console.log(asset);
  if (!asset) {
    throw new Error("File " + logicalPath + " not found");
  }

  return '/' + asset.digestPath;
});


//
// Prepare production-ready environment
//


if ('production' === process.env.NODE_ENV) {
  //
  // In production we assume that assets are not changed between requests,
  // so we use cached version of environment. See API docs for details.
  //

  environment = environment.index;

  //
  // Enable JS and CSS compression
  //

  // environment.jsCompressor = function (context, data, callback) {
  //   try {
  //     var ast = UglifyJS.parser.parse(data);

  //     ast = UglifyJS.uglify.ast_mangle(ast);
  //     ast = UglifyJS.uglify.ast_squeeze(ast);

  //     callback(null, UglifyJS.uglify.gen_code(ast));
  //   } catch (err) {
  //     callback(err);
  //   }
  // };

  // environment.cssCompressor = function (context, data, callback) {
  //   try {
  //     callback(null, Csso.justDoIt(data));
  //   } catch (err) {
  //     callback(err);
  //   }
  // };
}


//
// "Th-th-th-that's all folks!"