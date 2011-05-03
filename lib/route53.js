var
  util = require('util'),
  crypto = require('crypto'),
  aws = require('./aws'),
  _ = require('./util');

// Version Information
var version = '2010-10-01';
var xmlns   = 'https://route53.amazonaws.com/doc/' + version + '/';

/**
 * A generic Route53 request.
 *
 * @param   {Function}  response
 * @param   {String}    action
 */
var Request = function(response, args, method) {
  aws.RestRequest.call(this, response, args, 'route53.amazonaws.com', method, '/' + version);
}

util.inherits(Request, aws.RestRequest);

/**
 * Returns the string to sign.
 *
 * @param   {String}  accessKeyId
 * @return  {String}
 */
Request.prototype.getStringToSign = function(accessKeyId) {
  return this._date.toUTCString();
}

/**
 * Signs the request with the given key and signature.
 *
 * @param   {String}  accessKeyId
 * @param   {String}  secretAccessKey
 * @return  {Request}
 */
Request.prototype.sign = function(accessKeyId, signature) {
  aws.RestRequest.prototype.sign.call(this, accessKeyId, signature);

  this._headers['X-Amzn-Authorization'] = 'AWS3-HTTPS AWSAccessKeyId=' + accessKeyId
                                        + ',Algorithm=Hmac' + this.getSignatureAlgorithm().toUpperCase()
                                        + ',Signature=' + signature;

  return this;
}

/**
 * A generic Route53 response.
 *
 * @param   {Object}  headers
 * @param   {String}  data
 */
var Response = function(response) {
  aws.Response.call(this, response);

  var self      = this;
  var requestId = response.headers['x-amzn-requestid'];
  var error     = _.xmlToJson(self._xml.get('/ErrorResponse/Error'));

  if (error) {
    throw new aws.ResponseException(
      error.Message,
      error.Code,
      requestId
    );
  }

  self.requestId = requestId;
}

util.inherits(Response, aws.Response);

/**
 * Checks if the hosted zone ID is valid.
 *
 * @param   {String}  id
 * @return  {Boolean}
 */
var matchHostedZone = function(id) {
  return _.asString(id).match(/^\/hostedzone\/([^\/]+?)$/);
}

/**
 * Checks if the change ID is valid.
 *
 * @param   {String}  id
 * @return  {Boolean}
 */
var matchChange = function(id) {
  return _.asString(id).match(/^\/change\/([^\/]+?)$/);
}

module.exports.version  = version;
module.exports.xmlns    = xmlns;
module.exports.Request  = Request;
module.exports.Response = Response;

module.exports.matchHostedZone  = matchHostedZone;
module.exports.matchChange      = matchChange;