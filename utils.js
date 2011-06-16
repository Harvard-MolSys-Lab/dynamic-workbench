var path = require('path');

exports.userFilePath = function(node) {
	return path.join('files',node);
}
function sendError(res,msg,status) {
	var body = msg;
	res.setHeader('Content-Type', 'text/plain');
	res.setHeader('Content-Length', body.length);
	res.statusCode = status;
	res.end(body);
}
exports.sendError = sendError;
exports.forbidden = function(res,msg) {
	msg || (msg = '');
	sendError(res,'Forbidden. '+msg,403);
}
exports.allowedPath = function(path) {
	return path ? (path.indexOf('..')==-1) : false;
}