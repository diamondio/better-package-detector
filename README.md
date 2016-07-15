Package Detector
----------------

Package detector for OSX. Tells you whether or not a given path is a package based on what's written in the LS Register.

### Getting Started

```js
npm install --save better-package-detector
```

### Usage

```js
var pkgDetector = require('better-package-detector');

pkgDetector.init(function () {

  // Returns false if file is not in a package
  // Returns a string of the package path if it is within a package.

  // Examples:
  pkgDetector.findPackage('/path/to/some/file');          // => false
  pkgDetector.findPackage('/path/to/a/package.app/file'); // => '/path/to/a/package.app'
  pkgDetector.findPackage('/path/to/a/package.app');      // => '/path/to/a/package.app'

})
```

Please note that package detector does not always stat the file to ensure that it's there (for performance reasons, stat-ing 
every file can be quite expensive on large packages.) So as a result, it's the responsibility of the caller to make sure that the
package actually exists. If you do pass a non-existent file path to the package detector it will try its best to determine if it's a package.
