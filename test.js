
var pkgDetector = require('./');

pkgDetector.init(function () {

  // Returns false if file is not in a package
  // Returns a string of the package path if it is within a package.

  // Examples:
  console.log('test 1:', pkgDetector.findPackage('/path/to/some/file'));          // => false
  console.log('test 2:', pkgDetector.findPackage('/Applications/Diamond.app/file')); // => '/path/to/a/package.app'
  console.log('test 3:', pkgDetector.findPackage('/Applications/Diamond.app'));      // => '/path/to/a/package.app'

})