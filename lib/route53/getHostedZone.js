var
  util = require('util'),
  route53 = require('../route53'),
  aws = require('../aws'),
  _ = require('../util');

/**
 * GET GetHostedZone
 *
 * @param   {Object}  args
 */
var Request = function(args) {
  route53.Request.call(this, Response, args, 'GET');

  if (!route53.matchHostedZone(args.id)) {
    throw new aws.Exception('"' + args.id + '" is not a valid id', 'InvalidArgument');
  }

  this._path += _.asString(args.id);
}

util.inherits(Request, route53.Request);

/**
 * GetHostedZoneResponse
 *
 * @param   {Object}  response
 */
var Response = function(response) {
  route53.Response.call(this, response);

  var self            = this;
  var xmlRoot         = self._xml.get('/GetHostedZoneResponse');
  var hostedZone      = _.xmlToJson(xmlRoot.get('./HostedZone'));
  var xmlNameServers  = xmlRoot.find('./DelegationSet/NameServers/NameServer');

  self.hostedZone = {
    id: hostedZone.Id,
    name: hostedZone.Name,
    callerReference: hostedZone.CallerReference,
  };

  if (null != hostedZone.Config && !hostedZone.Config instanceof Object) {
    self.hostedZone.config.comment = hostedZone.Config.Comment;
  }

  self.nameServers = [];

  for (var i in xmlNameServers) {
    self.nameServers.push(_.xmlToJson(xmlNameServers[i]));
  }
}

util.inherits(Response, route53.Response);

module.exports.Request  = Request;
module.exports.Response = Response;