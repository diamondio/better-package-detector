var cpp  = require('child-process-parser');
var fs   = require('fs');
var path = require('path');


var LS_REGISTER_LOCATIONS = [
  '/System/Library/Frameworks/ApplicationServices.framework/Frameworks/LaunchServices.framework/Support/lsregister',
  '/System/Library/Frameworks//CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister'
];
var DELIMITER = '--------------------------------------------------------';


var cachedExtensions = {};

// We shouldn't expose this, because its behaviour is not quite what the consumer would want or expect.
// A path being in the package extensions list is a necessary condition, but it is not a 
// sufficient condition to consider that thing to be a package. The other condition that must
// be met, is that the path must correspond to a *directory*, not a *file*. Checking that here
// would be silly for efficiency reasons, so we can leave it up to findPackage to make the choice
// about whether an fs.stat is warranted.
var isPackageExtension = function (filePath) {
  return (!!cachedExtensions[path.extname(filePath)]);
}

var findLSRegister = function () {
  var lsregister = false;
  for (var i = 0; i < LS_REGISTER_LOCATIONS.length; i++) {
    try {
      if (fs.statSync(LS_REGISTER_LOCATIONS[i]).isFile()) {
        lsregister = LS_REGISTER_LOCATIONS[i];
        break;
      }
    } catch (err) {}
  }
  return lsregister;
}

exports.init = function (cb) {
  var lsregister = findLSRegister();
  if (!lsregister) return cb({ message: 'could_not_find_lsregister' });
  
  cpp([lsregister, '-dump'], DELIMITER, function (entry) {
    var fileExtensions = [];
    var isPackage = false;
    entry.split('\n').forEach(function (line) {
      if ((line.indexOf('flags:') > -1) && (line.indexOf('package') > -1)) {
        isPackage = true;
      }
      if ((line.indexOf('conforms to') > -1) && (line.indexOf('com.apple.package') > -1)) {
        isPackage = true;
      }
      if (line.indexOf('bindings:') > -1) {
        line = line.substring(line.indexOf('bindings:') + 9);
        line.split(',').forEach(function (item) {
          item = item.trim();
          if (item.indexOf(':') > -1) return;
          if (item.indexOf('.') === 0) {
            fileExtensions.push(item);
          }
        });
      }
      if (line.indexOf('tags:') > -1) {
        line = line.substring(line.indexOf('tags:') + 5);
        line.split(',').forEach(function (item) {
          item = item.trim();
          if (item.indexOf(':') > -1) return;
          if (item.indexOf('.') === 0) {
            fileExtensions.push(item);
          }
        });
      }
    });
    if (isPackage) {
      fileExtensions.forEach(function (extension) {
        cachedExtensions[extension] = true;
      });
    }
  }, cb);
};


exports.findPackage = function (filePath) {
  var normPath = path.normalize(filePath);
  var pathComponents = normPath.split(path.sep);
  for (var i = 1; i < pathComponents.length; i++) {
    if (isPackageExtension(pathComponents[i])) {
      if (i < pathComponents.length - 1) return pathComponents.slice(0, i+1).join(path.sep);
      try {
        return fs.statSync(normPath).isDirectory() && normPath;
      } catch (err) {
        return normPath;
      }
    }
  }
  return false;
}
