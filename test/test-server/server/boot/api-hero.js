module.exports = function(app) {
	global.app_root = process.cwd();
	require('api-hero').init(app, {monitoring_enabled:false});
};