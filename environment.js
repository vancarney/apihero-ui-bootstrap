'use strict';


//
// Require some modules
//


var Mincer = require('mincer');


//
// Configure Mincers logger, by default, all
// messages are going to the middle of nowhere
//


Mincer.logger.use(console);


//
// Create and export environment
//


var environment = module.exports = new Mincer.Environment('./');


//
// Enable source maps support
//

// environment.enable('source_maps');
// environment.sourceRoot = '/'; // use to cheat nesting level in dev tools

//
// Configure environment load paths (where to find ssets)
//

// environment.appendPath('bower_components/apihero-ui/assets/coffee');
// environment.appendPath('bower_components/apihero-ui/assets/less');
// environment.appendPath('bower_components/apihero-ui/assets/jade');
environment.appendPath('bower_components');
environment.appendPath('src/coffee');
environment.appendPath('src/less');
environment.appendPath('src/jade');
environment.appendPath('vendor');


//
// Cache compiled assets.
//
// You want this to be enabled on your dev/staging/production environment.
// In order to enable it, uncomment following line. We keep it disabled in
// order to quick-test new featurees without bumping up Mincer's version.
//


// environment.cache = new Mincer.FileStore(path.join(__dirname, 'cache'));


//
// Define environment essential *_path helper that will be available in the
// processed assets. See `assets/stylesheets/app.css.ejs` for example.
//


environment.ContextClass.defineAssetPath(function (pathname, options) {
  var asset = this.environment.findAsset(pathname, options);

  if (!asset) {
    throw new Error('File ' + pathname + ' not found');
  }

  return './' + asset.digestPath;
});


environment.enable('autoprefixer');


//
// Prepare production-ready environment
//


if (process.env.NODE_ENV === 'production') {

  //
  // Enable JS and CSS compression
  //

  environment.jsCompressor  = 'uglify';
  // (!) use csswring, because csso does not supports sourcemaps
  environment.cssCompressor = 'csswring';

  //
  // In production we assume that assets are not changed between requests,
  // so we use cached version of environment. See API docs for details.
  //

  environment = environment.index;

}


//
// Enable inline macros to embed compile-time variables into code,
// instead of using EJS and chaining extentions. Then you can write things like
//
//     var url = "$$ JSON.stringify(asset_path('my_file.js')) $$";
//
// You can set guard regexps as second param. Also you can pass multiple values
// via arrays.
//


Mincer.MacroProcessor.configure([ '.js', '.css' ]/*, true */);


//
// Mincer rebuilt assets on any dependency file change. But sometime result
// depends on external variables: enviroment type, helper values and so one.
// In this case, you should change enviroment "version" - place there any
// unique string.
//


// enviroment.version = md5(JSON.stringify(your_version_object));


//
// "Th-th-th-that's all folks!"