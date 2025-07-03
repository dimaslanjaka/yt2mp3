const net = require('net');
/**
 * IS anything ?
 */
class is {
  /**
   * Check port in use
   * @param {number} port
   * @param {function(boolean)} callback
   * @example is.portInUse(5000, function(used){
   * if (used){
   * console.error('port already in use');
   * }
   * })
   */
  static portInUse(port, callback) {
    var server = net.createServer(function (socket) {
      socket.write('Echo server\r\n');
      socket.pipe(socket);
    });

    server.listen(port, '127.0.0.1');
    server.on('error', function (e) {
      callback(true);
    });
    server.on('listening', function (e) {
      server.close();
      callback(false);
    });
  }
  /**
   * Check if is json
   * @param {string} str
   */
  static json(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
  /**
   * is string
   * @param {string} str
   */
  static string(str) {
    return typeof str == 'string';
  }
  /**
   * is string
   * @param {string} str
   */
  static str(str) {
    return this.string(str);
  }
  static arrayObject(arrObj) {
    return typeof arrObj == 'object' || Array.isArray(arrObj);
  }
}

module.exports = is;
