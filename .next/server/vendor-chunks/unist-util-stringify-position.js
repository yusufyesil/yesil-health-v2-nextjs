"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/unist-util-stringify-position";
exports.ids = ["vendor-chunks/unist-util-stringify-position"];
exports.modules = {

/***/ "(ssr)/./node_modules/unist-util-stringify-position/lib/index.js":
/*!*****************************************************************!*\
  !*** ./node_modules/unist-util-stringify-position/lib/index.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   stringifyPosition: () => (/* binding */ stringifyPosition)\n/* harmony export */ });\n/**\n * @typedef {import('unist').Node} Node\n * @typedef {import('unist').Point} Point\n * @typedef {import('unist').Position} Position\n */\n\n/**\n * @typedef NodeLike\n * @property {string} type\n * @property {PositionLike | null | undefined} [position]\n *\n * @typedef PointLike\n * @property {number | null | undefined} [line]\n * @property {number | null | undefined} [column]\n * @property {number | null | undefined} [offset]\n *\n * @typedef PositionLike\n * @property {PointLike | null | undefined} [start]\n * @property {PointLike | null | undefined} [end]\n */\n\n/**\n * Serialize the positional info of a point, position (start and end points),\n * or node.\n *\n * @param {Node | NodeLike | Point | PointLike | Position | PositionLike | null | undefined} [value]\n *   Node, position, or point.\n * @returns {string}\n *   Pretty printed positional info of a node (`string`).\n *\n *   In the format of a range `ls:cs-le:ce` (when given `node` or `position`)\n *   or a point `l:c` (when given `point`), where `l` stands for line, `c` for\n *   column, `s` for `start`, and `e` for end.\n *   An empty string (`''`) is returned if the given value is neither `node`,\n *   `position`, nor `point`.\n */\nfunction stringifyPosition(value) {\n  // Nothing.\n  if (!value || typeof value !== 'object') {\n    return ''\n  }\n\n  // Node.\n  if ('position' in value || 'type' in value) {\n    return position(value.position)\n  }\n\n  // Position.\n  if ('start' in value || 'end' in value) {\n    return position(value)\n  }\n\n  // Point.\n  if ('line' in value || 'column' in value) {\n    return point(value)\n  }\n\n  // ?\n  return ''\n}\n\n/**\n * @param {Point | PointLike | null | undefined} point\n * @returns {string}\n */\nfunction point(point) {\n  return index(point && point.line) + ':' + index(point && point.column)\n}\n\n/**\n * @param {Position | PositionLike | null | undefined} pos\n * @returns {string}\n */\nfunction position(pos) {\n  return point(pos && pos.start) + '-' + point(pos && pos.end)\n}\n\n/**\n * @param {number | null | undefined} value\n * @returns {number}\n */\nfunction index(value) {\n  return value && typeof value === 'number' ? value : 1\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvdW5pc3QtdXRpbC1zdHJpbmdpZnktcG9zaXRpb24vbGliL2luZGV4LmpzIiwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBLGFBQWEsc0JBQXNCO0FBQ25DLGFBQWEsdUJBQXVCO0FBQ3BDLGFBQWEsMEJBQTBCO0FBQ3ZDOztBQUVBO0FBQ0E7QUFDQSxjQUFjLFFBQVE7QUFDdEIsY0FBYyxpQ0FBaUM7QUFDL0M7QUFDQTtBQUNBLGNBQWMsMkJBQTJCO0FBQ3pDLGNBQWMsMkJBQTJCO0FBQ3pDLGNBQWMsMkJBQTJCO0FBQ3pDO0FBQ0E7QUFDQSxjQUFjLDhCQUE4QjtBQUM1QyxjQUFjLDhCQUE4QjtBQUM1Qzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsa0ZBQWtGO0FBQzdGO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFdBQVcsc0NBQXNDO0FBQ2pELGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFdBQVcsNENBQTRDO0FBQ3ZELGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFdBQVcsMkJBQTJCO0FBQ3RDLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL215LXYwLXByb2plY3QvLi9ub2RlX21vZHVsZXMvdW5pc3QtdXRpbC1zdHJpbmdpZnktcG9zaXRpb24vbGliL2luZGV4LmpzPzc4NzciXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAdHlwZWRlZiB7aW1wb3J0KCd1bmlzdCcpLk5vZGV9IE5vZGVcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJ3VuaXN0JykuUG9pbnR9IFBvaW50XG4gKiBAdHlwZWRlZiB7aW1wb3J0KCd1bmlzdCcpLlBvc2l0aW9ufSBQb3NpdGlvblxuICovXG5cbi8qKlxuICogQHR5cGVkZWYgTm9kZUxpa2VcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB0eXBlXG4gKiBAcHJvcGVydHkge1Bvc2l0aW9uTGlrZSB8IG51bGwgfCB1bmRlZmluZWR9IFtwb3NpdGlvbl1cbiAqXG4gKiBAdHlwZWRlZiBQb2ludExpa2VcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZH0gW2xpbmVdXG4gKiBAcHJvcGVydHkge251bWJlciB8IG51bGwgfCB1bmRlZmluZWR9IFtjb2x1bW5dXG4gKiBAcHJvcGVydHkge251bWJlciB8IG51bGwgfCB1bmRlZmluZWR9IFtvZmZzZXRdXG4gKlxuICogQHR5cGVkZWYgUG9zaXRpb25MaWtlXG4gKiBAcHJvcGVydHkge1BvaW50TGlrZSB8IG51bGwgfCB1bmRlZmluZWR9IFtzdGFydF1cbiAqIEBwcm9wZXJ0eSB7UG9pbnRMaWtlIHwgbnVsbCB8IHVuZGVmaW5lZH0gW2VuZF1cbiAqL1xuXG4vKipcbiAqIFNlcmlhbGl6ZSB0aGUgcG9zaXRpb25hbCBpbmZvIG9mIGEgcG9pbnQsIHBvc2l0aW9uIChzdGFydCBhbmQgZW5kIHBvaW50cyksXG4gKiBvciBub2RlLlxuICpcbiAqIEBwYXJhbSB7Tm9kZSB8IE5vZGVMaWtlIHwgUG9pbnQgfCBQb2ludExpa2UgfCBQb3NpdGlvbiB8IFBvc2l0aW9uTGlrZSB8IG51bGwgfCB1bmRlZmluZWR9IFt2YWx1ZV1cbiAqICAgTm9kZSwgcG9zaXRpb24sIG9yIHBvaW50LlxuICogQHJldHVybnMge3N0cmluZ31cbiAqICAgUHJldHR5IHByaW50ZWQgcG9zaXRpb25hbCBpbmZvIG9mIGEgbm9kZSAoYHN0cmluZ2ApLlxuICpcbiAqICAgSW4gdGhlIGZvcm1hdCBvZiBhIHJhbmdlIGBsczpjcy1sZTpjZWAgKHdoZW4gZ2l2ZW4gYG5vZGVgIG9yIGBwb3NpdGlvbmApXG4gKiAgIG9yIGEgcG9pbnQgYGw6Y2AgKHdoZW4gZ2l2ZW4gYHBvaW50YCksIHdoZXJlIGBsYCBzdGFuZHMgZm9yIGxpbmUsIGBjYCBmb3JcbiAqICAgY29sdW1uLCBgc2AgZm9yIGBzdGFydGAsIGFuZCBgZWAgZm9yIGVuZC5cbiAqICAgQW4gZW1wdHkgc3RyaW5nIChgJydgKSBpcyByZXR1cm5lZCBpZiB0aGUgZ2l2ZW4gdmFsdWUgaXMgbmVpdGhlciBgbm9kZWAsXG4gKiAgIGBwb3NpdGlvbmAsIG5vciBgcG9pbnRgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5naWZ5UG9zaXRpb24odmFsdWUpIHtcbiAgLy8gTm90aGluZy5cbiAgaWYgKCF2YWx1ZSB8fCB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICAvLyBOb2RlLlxuICBpZiAoJ3Bvc2l0aW9uJyBpbiB2YWx1ZSB8fCAndHlwZScgaW4gdmFsdWUpIHtcbiAgICByZXR1cm4gcG9zaXRpb24odmFsdWUucG9zaXRpb24pXG4gIH1cblxuICAvLyBQb3NpdGlvbi5cbiAgaWYgKCdzdGFydCcgaW4gdmFsdWUgfHwgJ2VuZCcgaW4gdmFsdWUpIHtcbiAgICByZXR1cm4gcG9zaXRpb24odmFsdWUpXG4gIH1cblxuICAvLyBQb2ludC5cbiAgaWYgKCdsaW5lJyBpbiB2YWx1ZSB8fCAnY29sdW1uJyBpbiB2YWx1ZSkge1xuICAgIHJldHVybiBwb2ludCh2YWx1ZSlcbiAgfVxuXG4gIC8vID9cbiAgcmV0dXJuICcnXG59XG5cbi8qKlxuICogQHBhcmFtIHtQb2ludCB8IFBvaW50TGlrZSB8IG51bGwgfCB1bmRlZmluZWR9IHBvaW50XG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBwb2ludChwb2ludCkge1xuICByZXR1cm4gaW5kZXgocG9pbnQgJiYgcG9pbnQubGluZSkgKyAnOicgKyBpbmRleChwb2ludCAmJiBwb2ludC5jb2x1bW4pXG59XG5cbi8qKlxuICogQHBhcmFtIHtQb3NpdGlvbiB8IFBvc2l0aW9uTGlrZSB8IG51bGwgfCB1bmRlZmluZWR9IHBvc1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gcG9zaXRpb24ocG9zKSB7XG4gIHJldHVybiBwb2ludChwb3MgJiYgcG9zLnN0YXJ0KSArICctJyArIHBvaW50KHBvcyAmJiBwb3MuZW5kKVxufVxuXG4vKipcbiAqIEBwYXJhbSB7bnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZH0gdmFsdWVcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGluZGV4KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInID8gdmFsdWUgOiAxXG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/unist-util-stringify-position/lib/index.js\n");

/***/ })

};
;