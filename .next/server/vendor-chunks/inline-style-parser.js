/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/inline-style-parser";
exports.ids = ["vendor-chunks/inline-style-parser"];
exports.modules = {

/***/ "(ssr)/./node_modules/inline-style-parser/index.js":
/*!***************************************************!*\
  !*** ./node_modules/inline-style-parser/index.js ***!
  \***************************************************/
/***/ ((module) => {

eval("// http://www.w3.org/TR/CSS21/grammar.html\n// https://github.com/visionmedia/css-parse/pull/49#issuecomment-30088027\nvar COMMENT_REGEX = /\\/\\*[^*]*\\*+([^/*][^*]*\\*+)*\\//g;\n\nvar NEWLINE_REGEX = /\\n/g;\nvar WHITESPACE_REGEX = /^\\s*/;\n\n// declaration\nvar PROPERTY_REGEX = /^(\\*?[-#/*\\\\\\w]+(\\[[0-9a-z_-]+\\])?)\\s*/;\nvar COLON_REGEX = /^:\\s*/;\nvar VALUE_REGEX = /^((?:'(?:\\\\'|.)*?'|\"(?:\\\\\"|.)*?\"|\\([^)]*?\\)|[^};])+)/;\nvar SEMICOLON_REGEX = /^[;\\s]*/;\n\n// https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/Trim#Polyfill\nvar TRIM_REGEX = /^\\s+|\\s+$/g;\n\n// strings\nvar NEWLINE = '\\n';\nvar FORWARD_SLASH = '/';\nvar ASTERISK = '*';\nvar EMPTY_STRING = '';\n\n// types\nvar TYPE_COMMENT = 'comment';\nvar TYPE_DECLARATION = 'declaration';\n\n/**\n * @param {String} style\n * @param {Object} [options]\n * @return {Object[]}\n * @throws {TypeError}\n * @throws {Error}\n */\nmodule.exports = function (style, options) {\n  if (typeof style !== 'string') {\n    throw new TypeError('First argument must be a string');\n  }\n\n  if (!style) return [];\n\n  options = options || {};\n\n  /**\n   * Positional.\n   */\n  var lineno = 1;\n  var column = 1;\n\n  /**\n   * Update lineno and column based on `str`.\n   *\n   * @param {String} str\n   */\n  function updatePosition(str) {\n    var lines = str.match(NEWLINE_REGEX);\n    if (lines) lineno += lines.length;\n    var i = str.lastIndexOf(NEWLINE);\n    column = ~i ? str.length - i : column + str.length;\n  }\n\n  /**\n   * Mark position and patch `node.position`.\n   *\n   * @return {Function}\n   */\n  function position() {\n    var start = { line: lineno, column: column };\n    return function (node) {\n      node.position = new Position(start);\n      whitespace();\n      return node;\n    };\n  }\n\n  /**\n   * Store position information for a node.\n   *\n   * @constructor\n   * @property {Object} start\n   * @property {Object} end\n   * @property {undefined|String} source\n   */\n  function Position(start) {\n    this.start = start;\n    this.end = { line: lineno, column: column };\n    this.source = options.source;\n  }\n\n  /**\n   * Non-enumerable source string.\n   */\n  Position.prototype.content = style;\n\n  var errorsList = [];\n\n  /**\n   * Error `msg`.\n   *\n   * @param {String} msg\n   * @throws {Error}\n   */\n  function error(msg) {\n    var err = new Error(\n      options.source + ':' + lineno + ':' + column + ': ' + msg\n    );\n    err.reason = msg;\n    err.filename = options.source;\n    err.line = lineno;\n    err.column = column;\n    err.source = style;\n\n    if (options.silent) {\n      errorsList.push(err);\n    } else {\n      throw err;\n    }\n  }\n\n  /**\n   * Match `re` and return captures.\n   *\n   * @param {RegExp} re\n   * @return {undefined|Array}\n   */\n  function match(re) {\n    var m = re.exec(style);\n    if (!m) return;\n    var str = m[0];\n    updatePosition(str);\n    style = style.slice(str.length);\n    return m;\n  }\n\n  /**\n   * Parse whitespace.\n   */\n  function whitespace() {\n    match(WHITESPACE_REGEX);\n  }\n\n  /**\n   * Parse comments.\n   *\n   * @param {Object[]} [rules]\n   * @return {Object[]}\n   */\n  function comments(rules) {\n    var c;\n    rules = rules || [];\n    while ((c = comment())) {\n      if (c !== false) {\n        rules.push(c);\n      }\n    }\n    return rules;\n  }\n\n  /**\n   * Parse comment.\n   *\n   * @return {Object}\n   * @throws {Error}\n   */\n  function comment() {\n    var pos = position();\n    if (FORWARD_SLASH != style.charAt(0) || ASTERISK != style.charAt(1)) return;\n\n    var i = 2;\n    while (\n      EMPTY_STRING != style.charAt(i) &&\n      (ASTERISK != style.charAt(i) || FORWARD_SLASH != style.charAt(i + 1))\n    ) {\n      ++i;\n    }\n    i += 2;\n\n    if (EMPTY_STRING === style.charAt(i - 1)) {\n      return error('End of comment missing');\n    }\n\n    var str = style.slice(2, i - 2);\n    column += 2;\n    updatePosition(str);\n    style = style.slice(i);\n    column += 2;\n\n    return pos({\n      type: TYPE_COMMENT,\n      comment: str\n    });\n  }\n\n  /**\n   * Parse declaration.\n   *\n   * @return {Object}\n   * @throws {Error}\n   */\n  function declaration() {\n    var pos = position();\n\n    // prop\n    var prop = match(PROPERTY_REGEX);\n    if (!prop) return;\n    comment();\n\n    // :\n    if (!match(COLON_REGEX)) return error(\"property missing ':'\");\n\n    // val\n    var val = match(VALUE_REGEX);\n\n    var ret = pos({\n      type: TYPE_DECLARATION,\n      property: trim(prop[0].replace(COMMENT_REGEX, EMPTY_STRING)),\n      value: val\n        ? trim(val[0].replace(COMMENT_REGEX, EMPTY_STRING))\n        : EMPTY_STRING\n    });\n\n    // ;\n    match(SEMICOLON_REGEX);\n\n    return ret;\n  }\n\n  /**\n   * Parse declarations.\n   *\n   * @return {Object[]}\n   */\n  function declarations() {\n    var decls = [];\n\n    comments(decls);\n\n    // declarations\n    var decl;\n    while ((decl = declaration())) {\n      if (decl !== false) {\n        decls.push(decl);\n        comments(decls);\n      }\n    }\n\n    return decls;\n  }\n\n  whitespace();\n  return declarations();\n};\n\n/**\n * Trim `str`.\n *\n * @param {String} str\n * @return {String}\n */\nfunction trim(str) {\n  return str ? str.replace(TRIM_REGEX, EMPTY_STRING) : EMPTY_STRING;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvaW5saW5lLXN0eWxlLXBhcnNlci9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtRUFBbUU7QUFDbkUsMEJBQTBCOztBQUUxQjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixZQUFZO0FBQ1osWUFBWTtBQUNaLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixRQUFRO0FBQ3hCLGdCQUFnQixRQUFRO0FBQ3hCLGdCQUFnQixrQkFBa0I7QUFDbEM7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYSxRQUFRO0FBQ3JCLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLFFBQVE7QUFDckIsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYSxVQUFVO0FBQ3ZCLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZCxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkLGNBQWM7QUFDZDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbXktdjAtcHJvamVjdC8uL25vZGVfbW9kdWxlcy9pbmxpbmUtc3R5bGUtcGFyc2VyL2luZGV4LmpzPzRlNzQiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gaHR0cDovL3d3dy53My5vcmcvVFIvQ1NTMjEvZ3JhbW1hci5odG1sXG4vLyBodHRwczovL2dpdGh1Yi5jb20vdmlzaW9ubWVkaWEvY3NzLXBhcnNlL3B1bGwvNDkjaXNzdWVjb21tZW50LTMwMDg4MDI3XG52YXIgQ09NTUVOVF9SRUdFWCA9IC9cXC9cXCpbXipdKlxcKisoW14vKl1bXipdKlxcKispKlxcLy9nO1xuXG52YXIgTkVXTElORV9SRUdFWCA9IC9cXG4vZztcbnZhciBXSElURVNQQUNFX1JFR0VYID0gL15cXHMqLztcblxuLy8gZGVjbGFyYXRpb25cbnZhciBQUk9QRVJUWV9SRUdFWCA9IC9eKFxcKj9bLSMvKlxcXFxcXHddKyhcXFtbMC05YS16Xy1dK1xcXSk/KVxccyovO1xudmFyIENPTE9OX1JFR0VYID0gL146XFxzKi87XG52YXIgVkFMVUVfUkVHRVggPSAvXigoPzonKD86XFxcXCd8LikqPyd8XCIoPzpcXFxcXCJ8LikqP1wifFxcKFteKV0qP1xcKXxbXn07XSkrKS87XG52YXIgU0VNSUNPTE9OX1JFR0VYID0gL15bO1xcc10qLztcblxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvU3RyaW5nL1RyaW0jUG9seWZpbGxcbnZhciBUUklNX1JFR0VYID0gL15cXHMrfFxccyskL2c7XG5cbi8vIHN0cmluZ3NcbnZhciBORVdMSU5FID0gJ1xcbic7XG52YXIgRk9SV0FSRF9TTEFTSCA9ICcvJztcbnZhciBBU1RFUklTSyA9ICcqJztcbnZhciBFTVBUWV9TVFJJTkcgPSAnJztcblxuLy8gdHlwZXNcbnZhciBUWVBFX0NPTU1FTlQgPSAnY29tbWVudCc7XG52YXIgVFlQRV9ERUNMQVJBVElPTiA9ICdkZWNsYXJhdGlvbic7XG5cbi8qKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0eWxlXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAcmV0dXJuIHtPYmplY3RbXX1cbiAqIEB0aHJvd3Mge1R5cGVFcnJvcn1cbiAqIEB0aHJvd3Mge0Vycm9yfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChzdHlsZSwgb3B0aW9ucykge1xuICBpZiAodHlwZW9mIHN0eWxlICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgfVxuXG4gIGlmICghc3R5bGUpIHJldHVybiBbXTtcblxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAvKipcbiAgICogUG9zaXRpb25hbC5cbiAgICovXG4gIHZhciBsaW5lbm8gPSAxO1xuICB2YXIgY29sdW1uID0gMTtcblxuICAvKipcbiAgICogVXBkYXRlIGxpbmVubyBhbmQgY29sdW1uIGJhc2VkIG9uIGBzdHJgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gICAqL1xuICBmdW5jdGlvbiB1cGRhdGVQb3NpdGlvbihzdHIpIHtcbiAgICB2YXIgbGluZXMgPSBzdHIubWF0Y2goTkVXTElORV9SRUdFWCk7XG4gICAgaWYgKGxpbmVzKSBsaW5lbm8gKz0gbGluZXMubGVuZ3RoO1xuICAgIHZhciBpID0gc3RyLmxhc3RJbmRleE9mKE5FV0xJTkUpO1xuICAgIGNvbHVtbiA9IH5pID8gc3RyLmxlbmd0aCAtIGkgOiBjb2x1bW4gKyBzdHIubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hcmsgcG9zaXRpb24gYW5kIHBhdGNoIGBub2RlLnBvc2l0aW9uYC5cbiAgICpcbiAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAqL1xuICBmdW5jdGlvbiBwb3NpdGlvbigpIHtcbiAgICB2YXIgc3RhcnQgPSB7IGxpbmU6IGxpbmVubywgY29sdW1uOiBjb2x1bW4gfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgIG5vZGUucG9zaXRpb24gPSBuZXcgUG9zaXRpb24oc3RhcnQpO1xuICAgICAgd2hpdGVzcGFjZSgpO1xuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9yZSBwb3NpdGlvbiBpbmZvcm1hdGlvbiBmb3IgYSBub2RlLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHByb3BlcnR5IHtPYmplY3R9IHN0YXJ0XG4gICAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBlbmRcbiAgICogQHByb3BlcnR5IHt1bmRlZmluZWR8U3RyaW5nfSBzb3VyY2VcbiAgICovXG4gIGZ1bmN0aW9uIFBvc2l0aW9uKHN0YXJ0KSB7XG4gICAgdGhpcy5zdGFydCA9IHN0YXJ0O1xuICAgIHRoaXMuZW5kID0geyBsaW5lOiBsaW5lbm8sIGNvbHVtbjogY29sdW1uIH07XG4gICAgdGhpcy5zb3VyY2UgPSBvcHRpb25zLnNvdXJjZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb24tZW51bWVyYWJsZSBzb3VyY2Ugc3RyaW5nLlxuICAgKi9cbiAgUG9zaXRpb24ucHJvdG90eXBlLmNvbnRlbnQgPSBzdHlsZTtcblxuICB2YXIgZXJyb3JzTGlzdCA9IFtdO1xuXG4gIC8qKlxuICAgKiBFcnJvciBgbXNnYC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1zZ1xuICAgKiBAdGhyb3dzIHtFcnJvcn1cbiAgICovXG4gIGZ1bmN0aW9uIGVycm9yKG1zZykge1xuICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoXG4gICAgICBvcHRpb25zLnNvdXJjZSArICc6JyArIGxpbmVubyArICc6JyArIGNvbHVtbiArICc6ICcgKyBtc2dcbiAgICApO1xuICAgIGVyci5yZWFzb24gPSBtc2c7XG4gICAgZXJyLmZpbGVuYW1lID0gb3B0aW9ucy5zb3VyY2U7XG4gICAgZXJyLmxpbmUgPSBsaW5lbm87XG4gICAgZXJyLmNvbHVtbiA9IGNvbHVtbjtcbiAgICBlcnIuc291cmNlID0gc3R5bGU7XG5cbiAgICBpZiAob3B0aW9ucy5zaWxlbnQpIHtcbiAgICAgIGVycm9yc0xpc3QucHVzaChlcnIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE1hdGNoIGByZWAgYW5kIHJldHVybiBjYXB0dXJlcy5cbiAgICpcbiAgICogQHBhcmFtIHtSZWdFeHB9IHJlXG4gICAqIEByZXR1cm4ge3VuZGVmaW5lZHxBcnJheX1cbiAgICovXG4gIGZ1bmN0aW9uIG1hdGNoKHJlKSB7XG4gICAgdmFyIG0gPSByZS5leGVjKHN0eWxlKTtcbiAgICBpZiAoIW0pIHJldHVybjtcbiAgICB2YXIgc3RyID0gbVswXTtcbiAgICB1cGRhdGVQb3NpdGlvbihzdHIpO1xuICAgIHN0eWxlID0gc3R5bGUuc2xpY2Uoc3RyLmxlbmd0aCk7XG4gICAgcmV0dXJuIG07XG4gIH1cblxuICAvKipcbiAgICogUGFyc2Ugd2hpdGVzcGFjZS5cbiAgICovXG4gIGZ1bmN0aW9uIHdoaXRlc3BhY2UoKSB7XG4gICAgbWF0Y2goV0hJVEVTUEFDRV9SRUdFWCk7XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgY29tbWVudHMuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0W119IFtydWxlc11cbiAgICogQHJldHVybiB7T2JqZWN0W119XG4gICAqL1xuICBmdW5jdGlvbiBjb21tZW50cyhydWxlcykge1xuICAgIHZhciBjO1xuICAgIHJ1bGVzID0gcnVsZXMgfHwgW107XG4gICAgd2hpbGUgKChjID0gY29tbWVudCgpKSkge1xuICAgICAgaWYgKGMgIT09IGZhbHNlKSB7XG4gICAgICAgIHJ1bGVzLnB1c2goYyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBydWxlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSBjb21tZW50LlxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAqIEB0aHJvd3Mge0Vycm9yfVxuICAgKi9cbiAgZnVuY3Rpb24gY29tbWVudCgpIHtcbiAgICB2YXIgcG9zID0gcG9zaXRpb24oKTtcbiAgICBpZiAoRk9SV0FSRF9TTEFTSCAhPSBzdHlsZS5jaGFyQXQoMCkgfHwgQVNURVJJU0sgIT0gc3R5bGUuY2hhckF0KDEpKSByZXR1cm47XG5cbiAgICB2YXIgaSA9IDI7XG4gICAgd2hpbGUgKFxuICAgICAgRU1QVFlfU1RSSU5HICE9IHN0eWxlLmNoYXJBdChpKSAmJlxuICAgICAgKEFTVEVSSVNLICE9IHN0eWxlLmNoYXJBdChpKSB8fCBGT1JXQVJEX1NMQVNIICE9IHN0eWxlLmNoYXJBdChpICsgMSkpXG4gICAgKSB7XG4gICAgICArK2k7XG4gICAgfVxuICAgIGkgKz0gMjtcblxuICAgIGlmIChFTVBUWV9TVFJJTkcgPT09IHN0eWxlLmNoYXJBdChpIC0gMSkpIHtcbiAgICAgIHJldHVybiBlcnJvcignRW5kIG9mIGNvbW1lbnQgbWlzc2luZycpO1xuICAgIH1cblxuICAgIHZhciBzdHIgPSBzdHlsZS5zbGljZSgyLCBpIC0gMik7XG4gICAgY29sdW1uICs9IDI7XG4gICAgdXBkYXRlUG9zaXRpb24oc3RyKTtcbiAgICBzdHlsZSA9IHN0eWxlLnNsaWNlKGkpO1xuICAgIGNvbHVtbiArPSAyO1xuXG4gICAgcmV0dXJuIHBvcyh7XG4gICAgICB0eXBlOiBUWVBFX0NPTU1FTlQsXG4gICAgICBjb21tZW50OiBzdHJcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSBkZWNsYXJhdGlvbi5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKiBAdGhyb3dzIHtFcnJvcn1cbiAgICovXG4gIGZ1bmN0aW9uIGRlY2xhcmF0aW9uKCkge1xuICAgIHZhciBwb3MgPSBwb3NpdGlvbigpO1xuXG4gICAgLy8gcHJvcFxuICAgIHZhciBwcm9wID0gbWF0Y2goUFJPUEVSVFlfUkVHRVgpO1xuICAgIGlmICghcHJvcCkgcmV0dXJuO1xuICAgIGNvbW1lbnQoKTtcblxuICAgIC8vIDpcbiAgICBpZiAoIW1hdGNoKENPTE9OX1JFR0VYKSkgcmV0dXJuIGVycm9yKFwicHJvcGVydHkgbWlzc2luZyAnOidcIik7XG5cbiAgICAvLyB2YWxcbiAgICB2YXIgdmFsID0gbWF0Y2goVkFMVUVfUkVHRVgpO1xuXG4gICAgdmFyIHJldCA9IHBvcyh7XG4gICAgICB0eXBlOiBUWVBFX0RFQ0xBUkFUSU9OLFxuICAgICAgcHJvcGVydHk6IHRyaW0ocHJvcFswXS5yZXBsYWNlKENPTU1FTlRfUkVHRVgsIEVNUFRZX1NUUklORykpLFxuICAgICAgdmFsdWU6IHZhbFxuICAgICAgICA/IHRyaW0odmFsWzBdLnJlcGxhY2UoQ09NTUVOVF9SRUdFWCwgRU1QVFlfU1RSSU5HKSlcbiAgICAgICAgOiBFTVBUWV9TVFJJTkdcbiAgICB9KTtcblxuICAgIC8vIDtcbiAgICBtYXRjaChTRU1JQ09MT05fUkVHRVgpO1xuXG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSBkZWNsYXJhdGlvbnMuXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdFtdfVxuICAgKi9cbiAgZnVuY3Rpb24gZGVjbGFyYXRpb25zKCkge1xuICAgIHZhciBkZWNscyA9IFtdO1xuXG4gICAgY29tbWVudHMoZGVjbHMpO1xuXG4gICAgLy8gZGVjbGFyYXRpb25zXG4gICAgdmFyIGRlY2w7XG4gICAgd2hpbGUgKChkZWNsID0gZGVjbGFyYXRpb24oKSkpIHtcbiAgICAgIGlmIChkZWNsICE9PSBmYWxzZSkge1xuICAgICAgICBkZWNscy5wdXNoKGRlY2wpO1xuICAgICAgICBjb21tZW50cyhkZWNscyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlY2xzO1xuICB9XG5cbiAgd2hpdGVzcGFjZSgpO1xuICByZXR1cm4gZGVjbGFyYXRpb25zKCk7XG59O1xuXG4vKipcbiAqIFRyaW0gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiB0cmltKHN0cikge1xuICByZXR1cm4gc3RyID8gc3RyLnJlcGxhY2UoVFJJTV9SRUdFWCwgRU1QVFlfU1RSSU5HKSA6IEVNUFRZX1NUUklORztcbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/inline-style-parser/index.js\n");

/***/ })

};
;