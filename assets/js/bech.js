(function(f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f()
    } else if (typeof define === "function" && define.amd) {
        define([], f)
    } else {
        var g;
        if (typeof window !== "undefined") {
            g = window
        } else if (typeof global !== "undefined") {
            g = global
        } else if (typeof self !== "undefined") {
            g = self
        } else {
            g = this
        }
        g.bech32 = f()
    }
})(function() {
    var define, module, exports;
    return (function() {
        function r(e, n, t) {
            function o(i, f) {
                if (!n[i]) {
                    if (!e[i]) {
                        var c = "function" == typeof require && require;
                        if (!f && c) return c(i, !0);
                        if (u) return u(i, !0);
                        var a = new Error("Cannot find module '" + i + "'");
                        throw a.code = "MODULE_NOT_FOUND", a
                    }
                    var p = n[i] = {
                        exports: {}
                    };
                    e[i][0].call(p.exports, function(r) {
                        var n = e[i][1][r];
                        return o(n || r)
                    }, p, p.exports, r, e, n, t)
                }
                return n[i].exports
            }
            for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
            return o
        }
        return r
    })()({
        1: [function(require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: !0
            }), exports.createBitArray = createBitArray, exports.fromBits = fromBits, exports.toBits = toBits;

            function toBitArrayUnchecked(a) {
                return a
            }

            function createBitArray(a) {
                return toBitArrayUnchecked(new Uint8Array(a))
            }

            function convert(a, c, d, e, f) {
                var g = (1 << e) - 1,
                    h = 0,
                    i = 0,
                    j = 0;
                if (a.forEach(function(a) {
                        for (h = (h << c) + a, i += c; i >= e;) i -= e, d[j] = h >> i & g, j += 1
                    }), f) 0 < i && (d[j] = h << e - i & g);
                else {
                    if (i >= c) throw new Error("Excessive padding: ".concat(i, " (max ").concat(c - 1, " allowed)"));
                    if (0 != h % (1 << i)) throw new Error("Non-zero padding")
                }
            }

            function toBits(a, b, c) {
                if (8 < b || 1 > b) throw new RangeError("Invalid bits per element; 1 to 8 expected");
                return convert(toBitArrayUnchecked(a), 8, c, b, !0), c
            }

            function fromBits(a, b, c) {
                if (8 < b || 1 > b) throw new RangeError("Invalid bits per element; 1 to 8 expected");
                return convert(a, b, toBitArrayUnchecked(c), 8, !1), c
            }

        }, {}],
        2: [function(require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: !0
            }), exports.CHECKSUM_LENGTH = void 0, exports.createChecksum = createChecksum, exports.decode = decode, exports.decodeWithPrefix = decodeWithPrefix, exports.detectCase = detectCase, exports.encode = encode, exports.expandPrefix = expandPrefix, exports.verifyChecksum = verifyChecksum;
            var _bitConverter = require("./bit-converter"),
                CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l",
                BECH32M_CHECKSUM = 734539939,
                MIN_CHAR_CODE = 33,
                MAX_CHAR_CODE = 126,
                CHECKSUM_LENGTH = exports.CHECKSUM_LENGTH = 6,
                CHAR_LOOKUP = function() {
                    for (var a = new Map, b = 0; b < CHARSET.length; b += 1) a.set(CHARSET[b], b);
                    return a
                }(),
                GEN = [996825010, 642813549, 513874426, 1027748829, 705979059];

            function polymod(a) {
                return a.reduce(function(a, b) {
                    return GEN.reduce(function(b, c, d) {
                        return 0 == (1 & a >> 25 >> d) ? b : b ^ c
                    }, (33554431 & a) << 5 ^ b)
                }, 1)
            }

            function expandPrefix(a, b) {
                for (var c, d = 0; d < a.length; d += 1) c = a.charCodeAt(d), b[d] = c >> 5, b[d + a.length + 1] = 31 & c;
                b[a.length] = 0
            }

            function verifyChecksum(a) {
                switch (polymod(a)) {
                    case 1:
                        return "bech32";
                    case BECH32M_CHECKSUM:
                        return "bech32m";
                    default:
                }
            }

            function createChecksum(a, b) {
                var c;
                switch (b) {
                    case "bech32":
                        c = 1;
                        break;
                    case "bech32m":
                        c = BECH32M_CHECKSUM;
                        break;
                    default:
                        throw Error("Invalid encoding value: ".concat(b, "; expected bech32 or bech32m"))
                }
                for (var d, e = polymod(a) ^ c, f = 0; f < CHECKSUM_LENGTH; f += 1) d = 5 * (5 - f), a[a.length - CHECKSUM_LENGTH + f] = 31 & e >> d
            }

            function encode(a) {
                return a.reduce(function(a, b) {
                    return a + CHARSET[b]
                }, "")
            }

            function decode(a, b) {
                for (var c, d = b || (0, _bitConverter.createBitArray)(a.length), e = 0; e < a.length; e += 1) {
                    if (c = CHAR_LOOKUP.get(a[e]), void 0 === c) throw new Error("Invalid char in message: ".concat(a[e]));
                    d[e] = c
                }
                return d
            }

            function decodeWithPrefix(a, b) {
                var c = b.length + 2 * a.length + 1,
                    d = (0, _bitConverter.createBitArray)(c);
                return expandPrefix(a, d.subarray(0, 2 * a.length + 1)), decode(b, d.subarray(2 * a.length + 1)), d
            }

            function detectCase(a) {
                for (var b, c = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : "message", d = !1, e = !1, f = 0; f < a.length; f += 1) {
                    if (b = a.charCodeAt(f), b < MIN_CHAR_CODE || b > MAX_CHAR_CODE) throw new TypeError("Invalid char in ".concat(c, ": ").concat(b, "; ") + "should be in ASCII range ".concat(MIN_CHAR_CODE, "-").concat(MAX_CHAR_CODE));
                    e = e || 65 <= b && 90 >= b, d = d || 97 <= b && 122 >= b
                }
                if (d && e) throw new TypeError("Mixed-case ".concat(c));
                else return e ? "upper" : d ? "lower" : null
            }

        }, {
            "./bit-converter": 1
        }],
        3: [function(require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: !0
            }), exports.BitcoinAddress = void 0, exports.decode = decode, exports.decodeTo5BitArray = decodeTo5BitArray, exports.encode = encode, exports.encode5BitArray = encode5BitArray, exports.from5BitArray = from5BitArray, exports.to5BitArray = to5BitArray;
            var _bitConverter = require("./bit-converter"),
                _encoding = require("./encoding");

            function _typeof(a) {
                "@babel/helpers - typeof";
                return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(a) {
                    return typeof a
                } : function(a) {
                    return a && "function" == typeof Symbol && a.constructor === Symbol && a !== Symbol.prototype ? "symbol" : typeof a
                }, _typeof(a)
            }

            function _classCallCheck(a, b) {
                if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function")
            }

            function _defineProperties(a, b) {
                for (var c, d = 0; d < b.length; d++) c = b[d], c.enumerable = c.enumerable || !1, c.configurable = !0, "value" in c && (c.writable = !0), Object.defineProperty(a, _toPropertyKey(c.key), c)
            }

            function _createClass(a, b, c) {
                return b && _defineProperties(a.prototype, b), c && _defineProperties(a, c), Object.defineProperty(a, "prototype", {
                    writable: !1
                }), a
            }

            function _toPropertyKey(a) {
                var b = _toPrimitive(a, "string");
                return "symbol" == _typeof(b) ? b : b + ""
            }

            function _toPrimitive(a, b) {
                if ("object" != _typeof(a) || !a) return a;
                var c = a[Symbol.toPrimitive];
                if (void 0 !== c) {
                    var d = c.call(a, b || "default");
                    if ("object" != _typeof(d)) return d;
                    throw new TypeError("@@toPrimitive must return a primitive value.")
                }
                return ("string" === b ? String : Number)(a)
            }
            var MAX_ENC_LENGTH = 90;

            function to5BitArray(a, b) {
                var c = Math.ceil(8 * a.length / 5),
                    d = b || (0, _bitConverter.createBitArray)(c);
                return (0, _bitConverter.toBits)(a, 5, d)
            }

            function from5BitArray(a, b) {
                var c = Math.floor(5 * a.length / 8),
                    d = b || new Uint8Array(c);
                return (0, _bitConverter.fromBits)(a, 5, d)
            }

            function encode5BitArray(a, b) {
                var c, d = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : "bech32",
                    e = 2 * a.length + 1 + b.length + _encoding.CHECKSUM_LENGTH;
                if (e - a.length > MAX_ENC_LENGTH) throw new Error("Message to be produced is too long (max ".concat(MAX_ENC_LENGTH, " supported)"));
                var f = null !== (c = (0, _encoding.detectCase)(a, "prefix")) && void 0 !== c ? c : "lower",
                    g = (0, _bitConverter.createBitArray)(e);
                (0, _encoding.expandPrefix)(a.toLowerCase(), g.subarray(0, 2 * a.length + 1));
                var h = g.subarray(2 * a.length + 1, g.length - _encoding.CHECKSUM_LENGTH);
                h.set(b), (0, _encoding.createChecksum)(g, d);
                var i = (0, _encoding.encode)(g.subarray(2 * a.length + 1));
                return "upper" === f && (i = i.toUpperCase()), "".concat(a, "1").concat(i)
            }

            function encode(a, b) {
                var c = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : "bech32";
                return encode5BitArray(a, to5BitArray(b), c)
            }

            function decodeTo5BitArray(a) {
                if (a.length > MAX_ENC_LENGTH) throw new TypeError("Message too long; max ".concat(MAX_ENC_LENGTH, " expected"));
                (0, _encoding.detectCase)(a);
                var b = a.toLowerCase(),
                    c = b.lastIndexOf("1");
                if (0 > c) throw new Error("No separator char (\"1\") found");
                if (c > a.length - _encoding.CHECKSUM_LENGTH - 1) throw new Error("Data part of the message too short (at least ".concat(_encoding.CHECKSUM_LENGTH, " chars expected)"));
                var d = b.substring(0, c),
                    e = (0, _encoding.decodeWithPrefix)(d, b.substring(c + 1)),
                    f = (0, _encoding.verifyChecksum)(e);
                if (f === void 0) throw new Error("Invalid checksum");
                return {
                    prefix: d,
                    encoding: f,
                    data: e.subarray(2 * d.length + 1, e.length - _encoding.CHECKSUM_LENGTH)
                }
            }

            function decode(a) {
                var b = decodeTo5BitArray(a),
                    c = b.prefix,
                    d = b.encoding,
                    e = b.data;
                return {
                    prefix: c,
                    encoding: d,
                    data: from5BitArray(e)
                }
            }
            var BitcoinAddress = exports.BitcoinAddress = function() {
                var a = Math.ceil;

                function b(a, c, d) {
                    if (_classCallCheck(this, b), "bit" !== a && "tb" !== a) throw new Error("Invalid human-readable prefix, \"bit\" or \"tb\" expected");
                    if (0 > c || 16 < c) throw new RangeError("Invalid scriptVersion, value in range [0, 16] expected");
                    if (2 > d.length || 40 < d.length) throw new RangeError("Invalid script length: expected 2 to 40 bytes");
                    if (0 === c && 20 !== d.length && 32 !== d.length) throw new Error("Invalid v0 script length: expected 20 or 32 bytes");
                    this.prefix = a, this.scriptVersion = c, this.data = d
                }
                return _createClass(b, [{
                    key: "type",
                    value: function type() {
                        if (0 === this.scriptVersion) switch (this.data.length) {
                            case 20:
                                return "p2wpkh";
                            case 32:
                                return "p2wsh";
                            default:
                        }
                    }
                }, {
                    key: "encode",
                    value: function() {
                        var b = a(8 * this.data.length / 5),
                            c = (0, _bitConverter.createBitArray)(b + 1);
                        c[0] = this.scriptVersion, to5BitArray(this.data, c.subarray(1));
                        var d = 0 === this.scriptVersion ? "bech32" : "bech32m";
                        return encode5BitArray(this.prefix, c, d)
                    }
                }], [{
                    key: "decode",
                    value: function(a) {
                        var b = decodeTo5BitArray(a),
                            c = b.prefix,
                            d = b.data,
                            e = b.encoding;
                        if ("bit" !== c && "tb" !== c) throw new Error("Invalid human-readable prefix, \"bit\" or \"tb\" expected");
                        var f = d[0];
                        if (0 === f && "bech32" !== e) throw Error("Unexpected encoding ".concat(e, " used for version 0 script"));
                        if (0 < f && "bech32m" !== e) throw Error("Unexpected encoding ".concat(e, " used for version ").concat(f, " script"));
                        return new this(c, f, from5BitArray(d.subarray(1)))
                    }
                }]), b
            }();

        }, {
            "./bit-converter": 1,
            "./encoding": 2
        }]
    }, {}, [3])(3)
});