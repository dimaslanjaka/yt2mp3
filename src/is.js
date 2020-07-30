/**
 * IS anything ?
 */
class is {
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
    return typeof str == "string";
  }
  /**
   * is string
   * @param {string} str
   */
  static str(str) {
    return this.string(str);
  }
  static arrayObject(arrObj) {
    return typeof arrObj == "object" || Array.isArray(arrObj);
  }
}

module.exports = is;
