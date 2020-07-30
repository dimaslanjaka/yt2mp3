const fs = require("fs");
const { dirname } = require("path");
class resolve {
  static dir(path) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
  }
  static file(path) {
    this.dir(dirname(path));
    fs.writeFileSync(path, "");
  }
}
module.exports = resolve;
