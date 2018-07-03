(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var crel = require('crel');

module.exports = function(simSettings){
    var toggle;
    var menu = crel('div',
            'Neurons for new bugs: ',
            neurons = crel('input', { type: 'number', value: simSettings.neuronCount }),
            toggle = crel('button')
        );

    neurons.addEventListener('change', function(){
        var count = parseInt(neurons.value);
        count = Math.max(10, count);
        if(count !== neurons.value){
            neurons.value = count;
        }
        simSettings.neuronCount = count;
    });

    toggle.textContent = 'Realtime';

    toggle.addEventListener('click', function(){
        simSettings.realtime = !simSettings.realtime;
    });

    window.addEventListener('load', function(){
        document.body.appendChild(menu);
    });

    function run(){
        toggle.textContent = simSettings.realtime ? 'Real Time' : 'Hyperspeed';

        requestAnimationFrame(run);
    }

    run();
};
},{"crel":3}],2:[function(require,module,exports){
var methods = {
    multiply: function(a, b){
        return a * b;
    },
    divide: function(a, b){
        return a / b;
    },
    add: function(a, b){
        return a + b;
    },
    subtract: function(a, b){
        return a - b;
    },
    power: function(a, b){
        return Math.pow(a, b);
    },
    mod: function(a, b){
        return a % b * 10;
    },
    invert: function(a, b){
        return Math.abs(a * -b);
    },
    sin: function(a, b){
        return Math.sin(Math.PI * a / b);
    },
    cos: function(a, b){
        return Math.cos(Math.PI * a / b);
    },
    tan: function(a, b){
        return Math.tan(Math.PI * a / b);
    },
    log: function(a, b){
        return Math.log(a, b);
    }
};

function makeNeuron(neurons, settings){
    var inputIndicies = settings.inputIndicies.slice();

    var neuron = function(){
        // var result = Math.pow(inputIndicies.reduce(function(result, index){
        //     return result + Math.pow(neurons[index](), 2);
        // }, 0), 0.5);

        var result = 0;
        if(inputIndicies){
            for(var i = 0; i < inputIndicies.length; i++){
                result += neurons[inputIndicies[i]]();
            }
            result /= inputIndicies.length;
        }
        // var result = inputIndicies ? inputIndicies.reduce(function(result, index){
        //     return result + neurons[index]();
        // }, 0) / inputIndicies.length : 0;

        result = methods[settings.method](result, settings.modifier);

        result = Math.min(1, result);
        result = Math.max(0, result);

        return result;
    };
    neuron.settings = settings;

    return neuron;
}

module.exports = function(networkSettings){
    var network = {};

    var inputs = networkSettings.inputs,
        outputs = networkSettings.outputs,
        previousNeuronSettings = networkSettings.previousNeuronSettings,
        inputNeurons = Object.keys(networkSettings.inputs).map(function(key){
            return networkSettings.inputs[key].bind(network);
        }),
        neurons = inputNeurons.slice();

    previousNeuronSettings.map(function(neuronSettings){
        var newNeuronSettings = {
                method: neuronSettings.method,
                inputIndicies: neuronSettings.inputIndicies,
                modifier: neuronSettings.modifier * (1 + (Math.random() * (networkSettings.mutation * 2) - networkSettings.mutation))
            };

        neurons.push(makeNeuron(neurons, newNeuronSettings));
    });

    var outputNeurons = neurons.slice(- Object.keys(outputs).length);

    var inputMap = Object.keys(inputs).reduce(function(result, key){
        result[key] = inputNeurons.pop();

        return result;
    }, {});

    var outputMap = Object.keys(outputs).reduce(function(result, key){
        result[key] = outputNeurons.pop();

        return result;
    }, {});

    network.inputs = inputMap;
    network.outputs = outputMap;
    network.neurons = neurons.slice(Object.keys(inputs).length);

    return network;
};
module.exports.methods = Object.keys(methods);
},{}],3:[function(require,module,exports){
//Copyright (C) 2012 Kory Nunn

//Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

//The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/*

    This code is not formatted for readability, but rather run-speed and to assist compilers.

    However, the code's intention should be transparent.

    *** IE SUPPORT ***

    If you require this library to work in IE7, add the following after declaring crel.

    var testDiv = document.createElement('div'),
        testLabel = document.createElement('label');

    testDiv.setAttribute('class', 'a');
    testDiv['className'] !== 'a' ? crel.attrMap['class'] = 'className':undefined;
    testDiv.setAttribute('name','a');
    testDiv['name'] !== 'a' ? crel.attrMap['name'] = function(element, value){
        element.id = value;
    }:undefined;


    testLabel.setAttribute('for', 'a');
    testLabel['htmlFor'] !== 'a' ? crel.attrMap['for'] = 'htmlFor':undefined;



*/

(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.crel = factory();
    }
}(this, function () {
    var fn = 'function',
        obj = 'object',
        nodeType = 'nodeType',
        textContent = 'textContent',
        setAttribute = 'setAttribute',
        attrMapString = 'attrMap',
        isNodeString = 'isNode',
        isElementString = 'isElement',
        d = typeof document === obj ? document : {},
        isType = function(a, type){
            return typeof a === type;
        },
        isNode = typeof Node === fn ? function (object) {
            return object instanceof Node;
        } :
        // in IE <= 8 Node is an object, obviously..
        function(object){
            return object &&
                isType(object, obj) &&
                (nodeType in object) &&
                isType(object.ownerDocument,obj);
        },
        isElement = function (object) {
            return crel[isNodeString](object) && object[nodeType] === 1;
        },
        isArray = function(a){
            return a instanceof Array;
        },
        appendChild = function(element, child) {
            if (isArray(child)) {
                child.map(function(subChild){
                    appendChild(element, subChild);
                });
                return;
            }
            if(!crel[isNodeString](child)){
                child = d.createTextNode(child);
            }
            element.appendChild(child);
        };


    function crel(){
        var args = arguments, //Note: assigned to a variable to assist compilers. Saves about 40 bytes in closure compiler. Has negligable effect on performance.
            element = args[0],
            child,
            settings = args[1],
            childIndex = 2,
            argumentsLength = args.length,
            attributeMap = crel[attrMapString];

        element = crel[isElementString](element) ? element : d.createElement(element);
        // shortcut
        if(argumentsLength === 1){
            return element;
        }

        if(!isType(settings,obj) || crel[isNodeString](settings) || isArray(settings)) {
            --childIndex;
            settings = null;
        }

        // shortcut if there is only one child that is a string
        if((argumentsLength - childIndex) === 1 && isType(args[childIndex], 'string') && element[textContent] !== undefined){
            element[textContent] = args[childIndex];
        }else{
            for(; childIndex < argumentsLength; ++childIndex){
                child = args[childIndex];

                if(child == null){
                    continue;
                }

                if (isArray(child)) {
                  for (var i=0; i < child.length; ++i) {
                    appendChild(element, child[i]);
                  }
                } else {
                  appendChild(element, child);
                }
            }
        }

        for(var key in settings){
            if(!attributeMap[key]){
                if(isType(settings[key],fn)){
                    element[key] = settings[key];
                }else{
                    element[setAttribute](key, settings[key]);
                }
            }else{
                var attr = attributeMap[key];
                if(typeof attr === fn){
                    attr(element, settings[key]);
                }else{
                    element[setAttribute](attr, settings[key]);
                }
            }
        }

        return element;
    }

    // Used for mapping one kind of attribute to the supported version of that in bad browsers.
    crel[attrMapString] = {};

    crel[isElementString] = isElement;

    crel[isNodeString] = isNode;

    if(typeof Proxy !== 'undefined'){
        crel.proxy = new Proxy(crel, {
            get: function(target, key){
                !(key in crel) && (crel[key] = crel.bind(null, key));
                return crel[key];
            }
        });
    }

    return crel;
}));

},{}],4:[function(require,module,exports){
/*jshint eqnull:true*/
(function (root) {
  "use strict";

  var GLOBAL_KEY = "Random";

  var imul = (typeof Math.imul !== "function" || Math.imul(0xffffffff, 5) !== -5 ?
    function (a, b) {
      var ah = (a >>> 16) & 0xffff;
      var al = a & 0xffff;
      var bh = (b >>> 16) & 0xffff;
      var bl = b & 0xffff;
      // the shift by 0 fixes the sign on the high part
      // the final |0 converts the unsigned value into a signed value
      return (al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0;
    } :
    Math.imul);

  var stringRepeat = (typeof String.prototype.repeat === "function" && "x".repeat(3) === "xxx" ?
    function (x, y) {
      return x.repeat(y);
    } : function (pattern, count) {
      var result = "";
      while (count > 0) {
        if (count & 1) {
          result += pattern;
        }
        count >>= 1;
        pattern += pattern;
      }
      return result;
    });

  function Random(engine) {
    if (!(this instanceof Random)) {
      return new Random(engine);
    }

    if (engine == null) {
      engine = Random.engines.nativeMath;
    } else if (typeof engine !== "function") {
      throw new TypeError("Expected engine to be a function, got " + typeof engine);
    }
    this.engine = engine;
  }
  var proto = Random.prototype;

  Random.engines = {
    nativeMath: function () {
      return (Math.random() * 0x100000000) | 0;
    },
    mt19937: (function (Int32Array) {
      // http://en.wikipedia.org/wiki/Mersenne_twister
      function refreshData(data) {
        var k = 0;
        var tmp = 0;
        for (;
          (k | 0) < 227; k = (k + 1) | 0) {
          tmp = (data[k] & 0x80000000) | (data[(k + 1) | 0] & 0x7fffffff);
          data[k] = data[(k + 397) | 0] ^ (tmp >>> 1) ^ ((tmp & 0x1) ? 0x9908b0df : 0);
        }

        for (;
          (k | 0) < 623; k = (k + 1) | 0) {
          tmp = (data[k] & 0x80000000) | (data[(k + 1) | 0] & 0x7fffffff);
          data[k] = data[(k - 227) | 0] ^ (tmp >>> 1) ^ ((tmp & 0x1) ? 0x9908b0df : 0);
        }

        tmp = (data[623] & 0x80000000) | (data[0] & 0x7fffffff);
        data[623] = data[396] ^ (tmp >>> 1) ^ ((tmp & 0x1) ? 0x9908b0df : 0);
      }

      function temper(value) {
        value ^= value >>> 11;
        value ^= (value << 7) & 0x9d2c5680;
        value ^= (value << 15) & 0xefc60000;
        return value ^ (value >>> 18);
      }

      function seedWithArray(data, source) {
        var i = 1;
        var j = 0;
        var sourceLength = source.length;
        var k = Math.max(sourceLength, 624) | 0;
        var previous = data[0] | 0;
        for (;
          (k | 0) > 0; --k) {
          data[i] = previous = ((data[i] ^ imul((previous ^ (previous >>> 30)), 0x0019660d)) + (source[j] | 0) + (j | 0)) | 0;
          i = (i + 1) | 0;
          ++j;
          if ((i | 0) > 623) {
            data[0] = data[623];
            i = 1;
          }
          if (j >= sourceLength) {
            j = 0;
          }
        }
        for (k = 623;
          (k | 0) > 0; --k) {
          data[i] = previous = ((data[i] ^ imul((previous ^ (previous >>> 30)), 0x5d588b65)) - i) | 0;
          i = (i + 1) | 0;
          if ((i | 0) > 623) {
            data[0] = data[623];
            i = 1;
          }
        }
        data[0] = 0x80000000;
      }

      function mt19937() {
        var data = new Int32Array(624);
        var index = 0;
        var uses = 0;

        function next() {
          if ((index | 0) >= 624) {
            refreshData(data);
            index = 0;
          }

          var value = data[index];
          index = (index + 1) | 0;
          uses += 1;
          return temper(value) | 0;
        }
        next.getUseCount = function() {
          return uses;
        };
        next.discard = function (count) {
          uses += count;
          if ((index | 0) >= 624) {
            refreshData(data);
            index = 0;
          }
          while ((count - index) > 624) {
            count -= 624 - index;
            refreshData(data);
            index = 0;
          }
          index = (index + count) | 0;
          return next;
        };
        next.seed = function (initial) {
          var previous = 0;
          data[0] = previous = initial | 0;

          for (var i = 1; i < 624; i = (i + 1) | 0) {
            data[i] = previous = (imul((previous ^ (previous >>> 30)), 0x6c078965) + i) | 0;
          }
          index = 624;
          uses = 0;
          return next;
        };
        next.seedWithArray = function (source) {
          next.seed(0x012bd6aa);
          seedWithArray(data, source);
          return next;
        };
        next.autoSeed = function () {
          return next.seedWithArray(Random.generateEntropyArray());
        };
        return next;
      }

      return mt19937;
    }(typeof Int32Array === "function" ? Int32Array : Array)),
    browserCrypto: (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function" && typeof Int32Array === "function") ? (function () {
      var data = null;
      var index = 128;

      return function () {
        if (index >= 128) {
          if (data === null) {
            data = new Int32Array(128);
          }
          crypto.getRandomValues(data);
          index = 0;
        }

        return data[index++] | 0;
      };
    }()) : null
  };

  Random.generateEntropyArray = function () {
    var array = [];
    var engine = Random.engines.nativeMath;
    for (var i = 0; i < 16; ++i) {
      array[i] = engine() | 0;
    }
    array.push(new Date().getTime() | 0);
    return array;
  };

  function returnValue(value) {
    return function () {
      return value;
    };
  }

  // [-0x80000000, 0x7fffffff]
  Random.int32 = function (engine) {
    return engine() | 0;
  };
  proto.int32 = function () {
    return Random.int32(this.engine);
  };

  // [0, 0xffffffff]
  Random.uint32 = function (engine) {
    return engine() >>> 0;
  };
  proto.uint32 = function () {
    return Random.uint32(this.engine);
  };

  // [0, 0x1fffffffffffff]
  Random.uint53 = function (engine) {
    var high = engine() & 0x1fffff;
    var low = engine() >>> 0;
    return (high * 0x100000000) + low;
  };
  proto.uint53 = function () {
    return Random.uint53(this.engine);
  };

  // [0, 0x20000000000000]
  Random.uint53Full = function (engine) {
    while (true) {
      var high = engine() | 0;
      if (high & 0x200000) {
        if ((high & 0x3fffff) === 0x200000 && (engine() | 0) === 0) {
          return 0x20000000000000;
        }
      } else {
        var low = engine() >>> 0;
        return ((high & 0x1fffff) * 0x100000000) + low;
      }
    }
  };
  proto.uint53Full = function () {
    return Random.uint53Full(this.engine);
  };

  // [-0x20000000000000, 0x1fffffffffffff]
  Random.int53 = function (engine) {
    var high = engine() | 0;
    var low = engine() >>> 0;
    return ((high & 0x1fffff) * 0x100000000) + low + (high & 0x200000 ? -0x20000000000000 : 0);
  };
  proto.int53 = function () {
    return Random.int53(this.engine);
  };

  // [-0x20000000000000, 0x20000000000000]
  Random.int53Full = function (engine) {
    while (true) {
      var high = engine() | 0;
      if (high & 0x400000) {
        if ((high & 0x7fffff) === 0x400000 && (engine() | 0) === 0) {
          return 0x20000000000000;
        }
      } else {
        var low = engine() >>> 0;
        return ((high & 0x1fffff) * 0x100000000) + low + (high & 0x200000 ? -0x20000000000000 : 0);
      }
    }
  };
  proto.int53Full = function () {
    return Random.int53Full(this.engine);
  };

  function add(generate, addend) {
    if (addend === 0) {
      return generate;
    } else {
      return function (engine) {
        return generate(engine) + addend;
      };
    }
  }

  Random.integer = (function () {
    function isPowerOfTwoMinusOne(value) {
      return ((value + 1) & value) === 0;
    }

    function bitmask(masking) {
      return function (engine) {
        return engine() & masking;
      };
    }

    function downscaleToLoopCheckedRange(range) {
      var extendedRange = range + 1;
      var maximum = extendedRange * Math.floor(0x100000000 / extendedRange);
      return function (engine) {
        var value = 0;
        do {
          value = engine() >>> 0;
        } while (value >= maximum);
        return value % extendedRange;
      };
    }

    function downscaleToRange(range) {
      if (isPowerOfTwoMinusOne(range)) {
        return bitmask(range);
      } else {
        return downscaleToLoopCheckedRange(range);
      }
    }

    function isEvenlyDivisibleByMaxInt32(value) {
      return (value | 0) === 0;
    }

    function upscaleWithHighMasking(masking) {
      return function (engine) {
        var high = engine() & masking;
        var low = engine() >>> 0;
        return (high * 0x100000000) + low;
      };
    }

    function upscaleToLoopCheckedRange(extendedRange) {
      var maximum = extendedRange * Math.floor(0x20000000000000 / extendedRange);
      return function (engine) {
        var ret = 0;
        do {
          var high = engine() & 0x1fffff;
          var low = engine() >>> 0;
          ret = (high * 0x100000000) + low;
        } while (ret >= maximum);
        return ret % extendedRange;
      };
    }

    function upscaleWithinU53(range) {
      var extendedRange = range + 1;
      if (isEvenlyDivisibleByMaxInt32(extendedRange)) {
        var highRange = ((extendedRange / 0x100000000) | 0) - 1;
        if (isPowerOfTwoMinusOne(highRange)) {
          return upscaleWithHighMasking(highRange);
        }
      }
      return upscaleToLoopCheckedRange(extendedRange);
    }

    function upscaleWithinI53AndLoopCheck(min, max) {
      return function (engine) {
        var ret = 0;
        do {
          var high = engine() | 0;
          var low = engine() >>> 0;
          ret = ((high & 0x1fffff) * 0x100000000) + low + (high & 0x200000 ? -0x20000000000000 : 0);
        } while (ret < min || ret > max);
        return ret;
      };
    }

    return function (min, max) {
      min = Math.floor(min);
      max = Math.floor(max);
      if (min < -0x20000000000000 || !isFinite(min)) {
        throw new RangeError("Expected min to be at least " + (-0x20000000000000));
      } else if (max > 0x20000000000000 || !isFinite(max)) {
        throw new RangeError("Expected max to be at most " + 0x20000000000000);
      }

      var range = max - min;
      if (range <= 0 || !isFinite(range)) {
        return returnValue(min);
      } else if (range === 0xffffffff) {
        if (min === 0) {
          return Random.uint32;
        } else {
          return add(Random.int32, min + 0x80000000);
        }
      } else if (range < 0xffffffff) {
        return add(downscaleToRange(range), min);
      } else if (range === 0x1fffffffffffff) {
        return add(Random.uint53, min);
      } else if (range < 0x1fffffffffffff) {
        return add(upscaleWithinU53(range), min);
      } else if (max - 1 - min === 0x1fffffffffffff) {
        return add(Random.uint53Full, min);
      } else if (min === -0x20000000000000 && max === 0x20000000000000) {
        return Random.int53Full;
      } else if (min === -0x20000000000000 && max === 0x1fffffffffffff) {
        return Random.int53;
      } else if (min === -0x1fffffffffffff && max === 0x20000000000000) {
        return add(Random.int53, 1);
      } else if (max === 0x20000000000000) {
        return add(upscaleWithinI53AndLoopCheck(min - 1, max - 1), 1);
      } else {
        return upscaleWithinI53AndLoopCheck(min, max);
      }
    };
  }());
  proto.integer = function (min, max) {
    return Random.integer(min, max)(this.engine);
  };

  // [0, 1] (floating point)
  Random.realZeroToOneInclusive = function (engine) {
    return Random.uint53Full(engine) / 0x20000000000000;
  };
  proto.realZeroToOneInclusive = function () {
    return Random.realZeroToOneInclusive(this.engine);
  };

  // [0, 1) (floating point)
  Random.realZeroToOneExclusive = function (engine) {
    return Random.uint53(engine) / 0x20000000000000;
  };
  proto.realZeroToOneExclusive = function () {
    return Random.realZeroToOneExclusive(this.engine);
  };

  Random.real = (function () {
    function multiply(generate, multiplier) {
      if (multiplier === 1) {
        return generate;
      } else if (multiplier === 0) {
        return function () {
          return 0;
        };
      } else {
        return function (engine) {
          return generate(engine) * multiplier;
        };
      }
    }

    return function (left, right, inclusive) {
      if (!isFinite(left)) {
        throw new RangeError("Expected left to be a finite number");
      } else if (!isFinite(right)) {
        throw new RangeError("Expected right to be a finite number");
      }
      return add(
        multiply(
          inclusive ? Random.realZeroToOneInclusive : Random.realZeroToOneExclusive,
          right - left),
        left);
    };
  }());
  proto.real = function (min, max, inclusive) {
    return Random.real(min, max, inclusive)(this.engine);
  };

  Random.bool = (function () {
    function isLeastBitTrue(engine) {
      return (engine() & 1) === 1;
    }

    function lessThan(generate, value) {
      return function (engine) {
        return generate(engine) < value;
      };
    }

    function probability(percentage) {
      if (percentage <= 0) {
        return returnValue(false);
      } else if (percentage >= 1) {
        return returnValue(true);
      } else {
        var scaled = percentage * 0x100000000;
        if (scaled % 1 === 0) {
          return lessThan(Random.int32, (scaled - 0x80000000) | 0);
        } else {
          return lessThan(Random.uint53, Math.round(percentage * 0x20000000000000));
        }
      }
    }

    return function (numerator, denominator) {
      if (denominator == null) {
        if (numerator == null) {
          return isLeastBitTrue;
        }
        return probability(numerator);
      } else {
        if (numerator <= 0) {
          return returnValue(false);
        } else if (numerator >= denominator) {
          return returnValue(true);
        }
        return lessThan(Random.integer(0, denominator - 1), numerator);
      }
    };
  }());
  proto.bool = function (numerator, denominator) {
    return Random.bool(numerator, denominator)(this.engine);
  };

  function toInteger(value) {
    var number = +value;
    if (number < 0) {
      return Math.ceil(number);
    } else {
      return Math.floor(number);
    }
  }

  function convertSliceArgument(value, length) {
    if (value < 0) {
      return Math.max(value + length, 0);
    } else {
      return Math.min(value, length);
    }
  }
  Random.pick = function (engine, array, begin, end) {
    var length = array.length;
    var start = begin == null ? 0 : convertSliceArgument(toInteger(begin), length);
    var finish = end === void 0 ? length : convertSliceArgument(toInteger(end), length);
    if (start >= finish) {
      return void 0;
    }
    var distribution = Random.integer(start, finish - 1);
    return array[distribution(engine)];
  };
  proto.pick = function (array, begin, end) {
    return Random.pick(this.engine, array, begin, end);
  };

  function returnUndefined() {
    return void 0;
  }
  var slice = Array.prototype.slice;
  Random.picker = function (array, begin, end) {
    var clone = slice.call(array, begin, end);
    if (!clone.length) {
      return returnUndefined;
    }
    var distribution = Random.integer(0, clone.length - 1);
    return function (engine) {
      return clone[distribution(engine)];
    };
  };

  Random.shuffle = function (engine, array, downTo) {
    var length = array.length;
    if (length) {
      if (downTo == null) {
        downTo = 0;
      }
      for (var i = (length - 1) >>> 0; i > downTo; --i) {
        var distribution = Random.integer(0, i);
        var j = distribution(engine);
        if (i !== j) {
          var tmp = array[i];
          array[i] = array[j];
          array[j] = tmp;
        }
      }
    }
    return array;
  };
  proto.shuffle = function (array) {
    return Random.shuffle(this.engine, array);
  };

  Random.sample = function (engine, population, sampleSize) {
    if (sampleSize < 0 || sampleSize > population.length || !isFinite(sampleSize)) {
      throw new RangeError("Expected sampleSize to be within 0 and the length of the population");
    }

    if (sampleSize === 0) {
      return [];
    }

    var clone = slice.call(population);
    var length = clone.length;
    if (length === sampleSize) {
      return Random.shuffle(engine, clone, 0);
    }
    var tailLength = length - sampleSize;
    return Random.shuffle(engine, clone, tailLength - 1).slice(tailLength);
  };
  proto.sample = function (population, sampleSize) {
    return Random.sample(this.engine, population, sampleSize);
  };

  Random.die = function (sideCount) {
    return Random.integer(1, sideCount);
  };
  proto.die = function (sideCount) {
    return Random.die(sideCount)(this.engine);
  };

  Random.dice = function (sideCount, dieCount) {
    var distribution = Random.die(sideCount);
    return function (engine) {
      var result = [];
      result.length = dieCount;
      for (var i = 0; i < dieCount; ++i) {
        result[i] = distribution(engine);
      }
      return result;
    };
  };
  proto.dice = function (sideCount, dieCount) {
    return Random.dice(sideCount, dieCount)(this.engine);
  };

  // http://en.wikipedia.org/wiki/Universally_unique_identifier
  Random.uuid4 = (function () {
    function zeroPad(string, zeroCount) {
      return stringRepeat("0", zeroCount - string.length) + string;
    }

    return function (engine) {
      var a = engine() >>> 0;
      var b = engine() | 0;
      var c = engine() | 0;
      var d = engine() >>> 0;

      return (
        zeroPad(a.toString(16), 8) +
        "-" +
        zeroPad((b & 0xffff).toString(16), 4) +
        "-" +
        zeroPad((((b >> 4) & 0x0fff) | 0x4000).toString(16), 4) +
        "-" +
        zeroPad(((c & 0x3fff) | 0x8000).toString(16), 4) +
        "-" +
        zeroPad(((c >> 4) & 0xffff).toString(16), 4) +
        zeroPad(d.toString(16), 8));
    };
  }());
  proto.uuid4 = function () {
    return Random.uuid4(this.engine);
  };

  Random.string = (function () {
    // has 2**x chars, for faster uniform distribution
    var DEFAULT_STRING_POOL = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";

    return function (pool) {
      if (pool == null) {
        pool = DEFAULT_STRING_POOL;
      }

      var length = pool.length;
      if (!length) {
        throw new Error("Expected pool not to be an empty string");
      }

      var distribution = Random.integer(0, length - 1);
      return function (engine, length) {
        var result = "";
        for (var i = 0; i < length; ++i) {
          var j = distribution(engine);
          result += pool.charAt(j);
        }
        return result;
      };
    };
  }());
  proto.string = function (length, pool) {
    return Random.string(pool)(this.engine, length);
  };

  Random.hex = (function () {
    var LOWER_HEX_POOL = "0123456789abcdef";
    var lowerHex = Random.string(LOWER_HEX_POOL);
    var upperHex = Random.string(LOWER_HEX_POOL.toUpperCase());

    return function (upper) {
      if (upper) {
        return upperHex;
      } else {
        return lowerHex;
      }
    };
  }());
  proto.hex = function (length, upper) {
    return Random.hex(upper)(this.engine, length);
  };

  Random.date = function (start, end) {
    if (!(start instanceof Date)) {
      throw new TypeError("Expected start to be a Date, got " + typeof start);
    } else if (!(end instanceof Date)) {
      throw new TypeError("Expected end to be a Date, got " + typeof end);
    }
    var distribution = Random.integer(start.getTime(), end.getTime());
    return function (engine) {
      return new Date(distribution(engine));
    };
  };
  proto.date = function (start, end) {
    return Random.date(start, end)(this.engine);
  };

  if (typeof define === "function" && define.amd) {
    define(function () {
      return Random;
    });
  } else if (typeof module !== "undefined" && typeof require === "function") {
    module.exports = Random;
  } else {
    (function () {
      var oldGlobal = root[GLOBAL_KEY];
      Random.noConflict = function () {
        root[GLOBAL_KEY] = oldGlobal;
        return this;
      };
    }());
    root[GLOBAL_KEY] = Random;
  }
}(this));
},{}],5:[function(require,module,exports){
var stats = document.createElement('pre'),
    canvas = document.createElement('canvas'),
    context = canvas.getContext('2d');

window.addEventListener('load', function(){
    document.body.appendChild(canvas);
    document.body.appendChild(stats);
});

var renderHeight = 60;
var renderWidth = 1100;
canvas.height = renderHeight;
canvas.width = renderWidth;

var lastBestBug = null,
    lastBestBugJSON;

function getBestBugJSON(bestBug){
    if(lastBestBug === bestBug){
        return lastBestBugJSON;
    }

    lastBestBug = bestBug;

    return lastBestBugJSON = JSON.stringify(bestBug.neurons.map(function(neuron){
        return neuron.settings;
    }), null, 4);
}
module.exports = function(state){
    var currentBestBug = state.bugs.reduce(function(result, bug){
        return bug.age > result.age ? bug : result;
    }, state.bugs[0]);

    var currentLineages = state.bugs.reduce(function(result, bug){
        if (result.indexOf(bug.paternalLineage) === -1) {
            result.push(bug.paternalLineage);
        }

        return result;
    }, []);

    stats.textContent = [
        'Ticks: ' + state.ticks,
        'Itterations Per 50ms run: ' + state.itterationsPer50,
        'Bugs: ' + state.bugs.length,
        'Max Current Age: ' + (currentBestBug ? currentBestBug.age : 'Nothing alive'),
        'Current Best Bug Lineage: ' + (currentBestBug ? `${ currentBestBug.paternalLineage.id } (age: ${state.ticks - currentBestBug.paternalLineage.tick})` : 'None'),
        'Current Lineages: ',
        ...currentLineages.map(function(lineage){ return `${ lineage.id } (age: ${state.ticks - lineage.tick})`; }),
        'Max Age: ' + state.bestBug.age,
        'Best Bugs Brain: ' + getBestBugJSON(state.bestBug)
    ].join('\n');
    context.clearRect(0, 0, renderWidth, renderHeight);

    context.beginPath();

    context.fillStyle = '#000000';

    state.map.map(function(dot, index){
        if(dot){
            context.fillRect(index * 10, renderHeight - 10, 10, 10);
        }
    });

    context.fillStyle = '#FF0000';

    state.bugs.map(function(bug){
        context.fillRect(bug.distance, renderHeight - 10 - (bug.height * 10), 10, 10);
    });

    context.fillStyle = 'hsla(' + (state.bestBug.age / 20).toString() + ', 100%, 30%, 0.3)';
    context.fillRect(state.bestBug.distance, renderHeight - 10 - (state.bestBug.height * 10), 10, 10);

    if(currentBestBug){
        context.fillStyle = 'hsl(' + (currentBestBug.age / 20).toString() + ', 100%, 30%)';
        context.fillRect(currentBestBug.distance, renderHeight - 10 - (currentBestBug.height * 10), 10, 10);
    }

    context.closePath();
};
},{}],6:[function(require,module,exports){
var neural = require('./neural');
var simSettings = { realtime: false, neuronCount: 20 };
var input = require('./input')(simSettings);
var Random = require("random-js");


var previousNeuronSettings = [];

var inputs = {
    age: function(){
        return this.age;
    },
    height: function(){
        return this.height;
    },
    energy: function(){
        return this.energy;
    }
};

function createEyeInput(index){
    return function(){
        return this.dotPositions[index] ? 1 : 0;
    };
}

for(var i = 0; i < 20; i++){
    inputs['next' + i] = createEyeInput(i);
}

function createConnections(maxConnections, maxIndex){
    var result = [];

    var connections = Math.max(parseInt((Math.random() * maxConnections) % maxConnections), 1);

    while(connections--){
        result.push(parseInt(Math.random() * maxIndex) % maxIndex);
    }

    return result;
}

var methods = neural.methods;

function randomNeurons(){
    var neurons = [];
    for(var j = 0; j < simSettings.neuronCount; j++){
        var methodIndex = parseInt(Math.random() * methods.length) % methods.length;
        neurons.push({
            method: methods[methodIndex],
            modifier: Math.random(),
            inputIndicies: createConnections(5, j + Object.keys(inputs).length)
        });
    }

    return neurons;
}

for(var i = 0; i < simSettings.neuronCount; i++){
    previousNeuronSettings.push(randomNeurons());
}

function createBug(previousNeuronSettings, paternalLineage, tick){
    var bug = neural({
        mutation: 0.0005,
        inputs: inputs,
        outputs: {
            thrustX: true,
            thrustY: true
        },
        previousNeuronSettings: previousNeuronSettings
    });

    bug.age = 0;
    bug.energy = 1;
    bug.height = 0;
    bug.thrustX = 0;
    bug.thrustY = 0;
    bug.distance = 0;
    bug.distFromDot = -1;
    bug.paternalLineage = paternalLineage || {id: Random.uuid4(Random.engines.browserCrypto), tick: tick};

    return bug;
}

function createChild(bug){
    return createBug(bug.neurons.map(function(neuron){
        return neuron.settings;
    }), bug.paternalLineage);
}

function spawnChildFromSex(parentOne, parentTwo, tick){
    if (parentOne.neurons.length !== simSettings.neuronCount || parentTwo.neurons.length !== simSettings.neuronCount) {
        return;
    }

    var newChildSettings = [];
    var parentOneContribution = [...Array(parentOne.neurons.length).keys()];
    var parentTwoContribution = [];

    Random.shuffle(Random.engines.browserCrypto, parentOne);

    for(var i = 0; i < (simSettings.neuronCount / 2); i++){
        parentTwoContribution.push(parentOneContribution.pop());
    }

    for(var j = 0; j < simSettings.neuronCount; j++){
        if (parentOneContribution.indexOf(j) > -1) {
            newChildSettings.push(parentOne.neurons[j].settings);
        } else {
            newChildSettings.push(parentTwo.neurons[j].settings);
        }
    }

    var newBug = createBug(newChildSettings, parentOne.paternalLineage, tick);

    return newBug;
}

function findABugAPartner(suitor, bugs){
    //find me a random bug that isn't best bug?
    var collection = bugs.reduce((accumulator, currentBug, currentIndex) => {
        if (currentBug.age !== suitor.age && currentBug.neurons.length === suitor.neurons.length) {
            accumulator.push(currentIndex);
        }

        return accumulator;
    },[]);

    return bugs[Random.shuffle(Random.engines.browserCrypto,collection)[0]];
}

var map = [];

for(var i = 0; i < 120; i++){
    map.push(false);
}

var bugs = [];

var renderer = require('./render');

var ticks = 0;
var looping;
var bestBug;
var itterationsPer50 = 0;
function gameLoop(){
    ticks++;
    if(bugs.length < 20){
        var newBug;

        if(bestBug && Math.random() > 0.5 && bugs.length > 1){
            newBug = spawnChildFromSex(bestBug, findABugAPartner(bestBug, bugs), ticks);
        }

        if (!newBug) {
            newBug = createBug(randomNeurons(), null, ticks);
        }

        bugs.push(newBug);
    }

    map.shift();
    map.push(map.slice(-10).some(x => x) ? false : Math.random() < bugs.length / 2000);

    var survivors = [];
    for(var i = 0; i < bugs.length; i++){
        var bug = bugs[i];
        bug.age++;
        bug.distance += bug.thrustX + 1;

        if(!bestBug || bug.age > bestBug.age){
            simSettings.realtime = true;
            bestBug = bug;
        }

        if(bug.distance > 999){
            bug.distance = 0;
        }

        if(bug.age && !(bug.age % 111) && bug.age > 300){
            var partner = findABugAPartner(bestBug, bugs) || createBug(randomNeurons(), null, ticks);

            bugs.push(spawnChildFromSex(bestBug, partner));
        }

        //on dot, die
        if(bug.distance > 100 && bug.height < 1 && bug.onDot){
            if(bug === bestBug){
                simSettings.realtime = false;
            }
            continue;
        }

        survivors.push(bug);

        //fall
        bug.height += bug.thrustY * 2;
        bug.height = Math.max(0, bug.height -= 0.5);
        var mapPosition = parseInt(bug.distance / 10);
        bug.dotPositions = map.slice(mapPosition, mapPosition + 20);
        bug.onDot = bug.dotPositions[0];

        if(!bug.height){
            if(bug.energy > 0.2){
                var thrustY = bug.outputs.thrustY();
                bug.thrustY += Math.min(thrustY, bug.energy);
                bug.energy = Math.max(0, bug.energy - bug.thrustY);

                var thrustX = bug.outputs.thrustX();
                bug.thrustX += Math.min(thrustX, bug.energy);
                bug.energy = Math.max(0, bug.energy - bug.thrustX);
            }
            bug.energy = Math.min(1, bug.energy + 0.1);
        }
        if(bug.thrustY > 0){
            bug.thrustY -= 0.1;
        }
        if(bug.thrustX > 0.1 || bug.thrustX < -0.1){
            bug.thrustX *= 0.9;
        }
    }

    bugs = survivors;

    if(looping){
        return;
    }

    if(!simSettings.realtime){
        looping = true;
        var start = Date.now();
        itterationsPer50 = 0;
        while(Date.now() - start < 50){
            itterationsPer50++;
            gameLoop();
            if(simSettings.realtime){
                break;
            }
        }
        looping = false;
        setTimeout(gameLoop, 0);
        return;
    }

    setTimeout(gameLoop, 30);

}

function render(){
    renderer({ ticks, bugs, map, bestBug, itterationsPer50 });
    requestAnimationFrame(render);
}

gameLoop();

render();


},{"./input":1,"./neural":2,"./render":5,"random-js":4}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbnB1dC5qcyIsIm5ldXJhbC5qcyIsIm5vZGVfbW9kdWxlcy9jcmVsL2NyZWwuanMiLCJub2RlX21vZHVsZXMvcmFuZG9tLWpzL2xpYi9yYW5kb20uanMiLCJyZW5kZXIuanMiLCJ0ZXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJ2YXIgY3JlbCA9IHJlcXVpcmUoJ2NyZWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzaW1TZXR0aW5ncyl7XG4gICAgdmFyIHRvZ2dsZTtcbiAgICB2YXIgbWVudSA9IGNyZWwoJ2RpdicsXG4gICAgICAgICAgICAnTmV1cm9ucyBmb3IgbmV3IGJ1Z3M6ICcsXG4gICAgICAgICAgICBuZXVyb25zID0gY3JlbCgnaW5wdXQnLCB7IHR5cGU6ICdudW1iZXInLCB2YWx1ZTogc2ltU2V0dGluZ3MubmV1cm9uQ291bnQgfSksXG4gICAgICAgICAgICB0b2dnbGUgPSBjcmVsKCdidXR0b24nKVxuICAgICAgICApO1xuXG4gICAgbmV1cm9ucy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgY291bnQgPSBwYXJzZUludChuZXVyb25zLnZhbHVlKTtcbiAgICAgICAgY291bnQgPSBNYXRoLm1heCgxMCwgY291bnQpO1xuICAgICAgICBpZihjb3VudCAhPT0gbmV1cm9ucy52YWx1ZSl7XG4gICAgICAgICAgICBuZXVyb25zLnZhbHVlID0gY291bnQ7XG4gICAgICAgIH1cbiAgICAgICAgc2ltU2V0dGluZ3MubmV1cm9uQ291bnQgPSBjb3VudDtcbiAgICB9KTtcblxuICAgIHRvZ2dsZS50ZXh0Q29udGVudCA9ICdSZWFsdGltZSc7XG5cbiAgICB0b2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICBzaW1TZXR0aW5ncy5yZWFsdGltZSA9ICFzaW1TZXR0aW5ncy5yZWFsdGltZTtcbiAgICB9KTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oKXtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtZW51KTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIHJ1bigpe1xuICAgICAgICB0b2dnbGUudGV4dENvbnRlbnQgPSBzaW1TZXR0aW5ncy5yZWFsdGltZSA/ICdSZWFsIFRpbWUnIDogJ0h5cGVyc3BlZWQnO1xuXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShydW4pO1xuICAgIH1cblxuICAgIHJ1bigpO1xufTsiLCJ2YXIgbWV0aG9kcyA9IHtcbiAgICBtdWx0aXBseTogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBhICogYjtcbiAgICB9LFxuICAgIGRpdmlkZTogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBhIC8gYjtcbiAgICB9LFxuICAgIGFkZDogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBhICsgYjtcbiAgICB9LFxuICAgIHN1YnRyYWN0OiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIGEgLSBiO1xuICAgIH0sXG4gICAgcG93ZXI6IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gTWF0aC5wb3coYSwgYik7XG4gICAgfSxcbiAgICBtb2Q6IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gYSAlIGIgKiAxMDtcbiAgICB9LFxuICAgIGludmVydDogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBNYXRoLmFicyhhICogLWIpO1xuICAgIH0sXG4gICAgc2luOiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIE1hdGguc2luKE1hdGguUEkgKiBhIC8gYik7XG4gICAgfSxcbiAgICBjb3M6IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gTWF0aC5jb3MoTWF0aC5QSSAqIGEgLyBiKTtcbiAgICB9LFxuICAgIHRhbjogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBNYXRoLnRhbihNYXRoLlBJICogYSAvIGIpO1xuICAgIH0sXG4gICAgbG9nOiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIE1hdGgubG9nKGEsIGIpO1xuICAgIH1cbn07XG5cbmZ1bmN0aW9uIG1ha2VOZXVyb24obmV1cm9ucywgc2V0dGluZ3Mpe1xuICAgIHZhciBpbnB1dEluZGljaWVzID0gc2V0dGluZ3MuaW5wdXRJbmRpY2llcy5zbGljZSgpO1xuXG4gICAgdmFyIG5ldXJvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIC8vIHZhciByZXN1bHQgPSBNYXRoLnBvdyhpbnB1dEluZGljaWVzLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGluZGV4KXtcbiAgICAgICAgLy8gICAgIHJldHVybiByZXN1bHQgKyBNYXRoLnBvdyhuZXVyb25zW2luZGV4XSgpLCAyKTtcbiAgICAgICAgLy8gfSwgMCksIDAuNSk7XG5cbiAgICAgICAgdmFyIHJlc3VsdCA9IDA7XG4gICAgICAgIGlmKGlucHV0SW5kaWNpZXMpe1xuICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGlucHV0SW5kaWNpZXMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBuZXVyb25zW2lucHV0SW5kaWNpZXNbaV1dKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHQgLz0gaW5wdXRJbmRpY2llcy5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdmFyIHJlc3VsdCA9IGlucHV0SW5kaWNpZXMgPyBpbnB1dEluZGljaWVzLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGluZGV4KXtcbiAgICAgICAgLy8gICAgIHJldHVybiByZXN1bHQgKyBuZXVyb25zW2luZGV4XSgpO1xuICAgICAgICAvLyB9LCAwKSAvIGlucHV0SW5kaWNpZXMubGVuZ3RoIDogMDtcblxuICAgICAgICByZXN1bHQgPSBtZXRob2RzW3NldHRpbmdzLm1ldGhvZF0ocmVzdWx0LCBzZXR0aW5ncy5tb2RpZmllcik7XG5cbiAgICAgICAgcmVzdWx0ID0gTWF0aC5taW4oMSwgcmVzdWx0KTtcbiAgICAgICAgcmVzdWx0ID0gTWF0aC5tYXgoMCwgcmVzdWx0KTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgbmV1cm9uLnNldHRpbmdzID0gc2V0dGluZ3M7XG5cbiAgICByZXR1cm4gbmV1cm9uO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5ldHdvcmtTZXR0aW5ncyl7XG4gICAgdmFyIG5ldHdvcmsgPSB7fTtcblxuICAgIHZhciBpbnB1dHMgPSBuZXR3b3JrU2V0dGluZ3MuaW5wdXRzLFxuICAgICAgICBvdXRwdXRzID0gbmV0d29ya1NldHRpbmdzLm91dHB1dHMsXG4gICAgICAgIHByZXZpb3VzTmV1cm9uU2V0dGluZ3MgPSBuZXR3b3JrU2V0dGluZ3MucHJldmlvdXNOZXVyb25TZXR0aW5ncyxcbiAgICAgICAgaW5wdXROZXVyb25zID0gT2JqZWN0LmtleXMobmV0d29ya1NldHRpbmdzLmlucHV0cykubWFwKGZ1bmN0aW9uKGtleSl7XG4gICAgICAgICAgICByZXR1cm4gbmV0d29ya1NldHRpbmdzLmlucHV0c1trZXldLmJpbmQobmV0d29yayk7XG4gICAgICAgIH0pLFxuICAgICAgICBuZXVyb25zID0gaW5wdXROZXVyb25zLnNsaWNlKCk7XG5cbiAgICBwcmV2aW91c05ldXJvblNldHRpbmdzLm1hcChmdW5jdGlvbihuZXVyb25TZXR0aW5ncyl7XG4gICAgICAgIHZhciBuZXdOZXVyb25TZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6IG5ldXJvblNldHRpbmdzLm1ldGhvZCxcbiAgICAgICAgICAgICAgICBpbnB1dEluZGljaWVzOiBuZXVyb25TZXR0aW5ncy5pbnB1dEluZGljaWVzLFxuICAgICAgICAgICAgICAgIG1vZGlmaWVyOiBuZXVyb25TZXR0aW5ncy5tb2RpZmllciAqICgxICsgKE1hdGgucmFuZG9tKCkgKiAobmV0d29ya1NldHRpbmdzLm11dGF0aW9uICogMikgLSBuZXR3b3JrU2V0dGluZ3MubXV0YXRpb24pKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICBuZXVyb25zLnB1c2gobWFrZU5ldXJvbihuZXVyb25zLCBuZXdOZXVyb25TZXR0aW5ncykpO1xuICAgIH0pO1xuXG4gICAgdmFyIG91dHB1dE5ldXJvbnMgPSBuZXVyb25zLnNsaWNlKC0gT2JqZWN0LmtleXMob3V0cHV0cykubGVuZ3RoKTtcblxuICAgIHZhciBpbnB1dE1hcCA9IE9iamVjdC5rZXlzKGlucHV0cykucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwga2V5KXtcbiAgICAgICAgcmVzdWx0W2tleV0gPSBpbnB1dE5ldXJvbnMucG9wKCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCB7fSk7XG5cbiAgICB2YXIgb3V0cHV0TWFwID0gT2JqZWN0LmtleXMob3V0cHV0cykucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwga2V5KXtcbiAgICAgICAgcmVzdWx0W2tleV0gPSBvdXRwdXROZXVyb25zLnBvcCgpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwge30pO1xuXG4gICAgbmV0d29yay5pbnB1dHMgPSBpbnB1dE1hcDtcbiAgICBuZXR3b3JrLm91dHB1dHMgPSBvdXRwdXRNYXA7XG4gICAgbmV0d29yay5uZXVyb25zID0gbmV1cm9ucy5zbGljZShPYmplY3Qua2V5cyhpbnB1dHMpLmxlbmd0aCk7XG5cbiAgICByZXR1cm4gbmV0d29yaztcbn07XG5tb2R1bGUuZXhwb3J0cy5tZXRob2RzID0gT2JqZWN0LmtleXMobWV0aG9kcyk7IiwiLy9Db3B5cmlnaHQgKEMpIDIwMTIgS29yeSBOdW5uXHJcblxyXG4vL1Blcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcblxyXG4vL1RoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG5cclxuLy9USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cclxuXHJcbi8qXHJcblxyXG4gICAgVGhpcyBjb2RlIGlzIG5vdCBmb3JtYXR0ZWQgZm9yIHJlYWRhYmlsaXR5LCBidXQgcmF0aGVyIHJ1bi1zcGVlZCBhbmQgdG8gYXNzaXN0IGNvbXBpbGVycy5cclxuXHJcbiAgICBIb3dldmVyLCB0aGUgY29kZSdzIGludGVudGlvbiBzaG91bGQgYmUgdHJhbnNwYXJlbnQuXHJcblxyXG4gICAgKioqIElFIFNVUFBPUlQgKioqXHJcblxyXG4gICAgSWYgeW91IHJlcXVpcmUgdGhpcyBsaWJyYXJ5IHRvIHdvcmsgaW4gSUU3LCBhZGQgdGhlIGZvbGxvd2luZyBhZnRlciBkZWNsYXJpbmcgY3JlbC5cclxuXHJcbiAgICB2YXIgdGVzdERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxyXG4gICAgICAgIHRlc3RMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XHJcblxyXG4gICAgdGVzdERpdi5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2EnKTtcclxuICAgIHRlc3REaXZbJ2NsYXNzTmFtZSddICE9PSAnYScgPyBjcmVsLmF0dHJNYXBbJ2NsYXNzJ10gPSAnY2xhc3NOYW1lJzp1bmRlZmluZWQ7XHJcbiAgICB0ZXN0RGl2LnNldEF0dHJpYnV0ZSgnbmFtZScsJ2EnKTtcclxuICAgIHRlc3REaXZbJ25hbWUnXSAhPT0gJ2EnID8gY3JlbC5hdHRyTWFwWyduYW1lJ10gPSBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZSl7XHJcbiAgICAgICAgZWxlbWVudC5pZCA9IHZhbHVlO1xyXG4gICAgfTp1bmRlZmluZWQ7XHJcblxyXG5cclxuICAgIHRlc3RMYWJlbC5zZXRBdHRyaWJ1dGUoJ2ZvcicsICdhJyk7XHJcbiAgICB0ZXN0TGFiZWxbJ2h0bWxGb3InXSAhPT0gJ2EnID8gY3JlbC5hdHRyTWFwWydmb3InXSA9ICdodG1sRm9yJzp1bmRlZmluZWQ7XHJcblxyXG5cclxuXHJcbiovXHJcblxyXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcclxuICAgIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICAgICAgZGVmaW5lKGZhY3RvcnkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByb290LmNyZWwgPSBmYWN0b3J5KCk7XHJcbiAgICB9XHJcbn0odGhpcywgZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGZuID0gJ2Z1bmN0aW9uJyxcclxuICAgICAgICBvYmogPSAnb2JqZWN0JyxcclxuICAgICAgICBub2RlVHlwZSA9ICdub2RlVHlwZScsXHJcbiAgICAgICAgdGV4dENvbnRlbnQgPSAndGV4dENvbnRlbnQnLFxyXG4gICAgICAgIHNldEF0dHJpYnV0ZSA9ICdzZXRBdHRyaWJ1dGUnLFxyXG4gICAgICAgIGF0dHJNYXBTdHJpbmcgPSAnYXR0ck1hcCcsXHJcbiAgICAgICAgaXNOb2RlU3RyaW5nID0gJ2lzTm9kZScsXHJcbiAgICAgICAgaXNFbGVtZW50U3RyaW5nID0gJ2lzRWxlbWVudCcsXHJcbiAgICAgICAgZCA9IHR5cGVvZiBkb2N1bWVudCA9PT0gb2JqID8gZG9jdW1lbnQgOiB7fSxcclxuICAgICAgICBpc1R5cGUgPSBmdW5jdGlvbihhLCB0eXBlKXtcclxuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBhID09PSB0eXBlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNOb2RlID0gdHlwZW9mIE5vZGUgPT09IGZuID8gZnVuY3Rpb24gKG9iamVjdCkge1xyXG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0IGluc3RhbmNlb2YgTm9kZTtcclxuICAgICAgICB9IDpcclxuICAgICAgICAvLyBpbiBJRSA8PSA4IE5vZGUgaXMgYW4gb2JqZWN0LCBvYnZpb3VzbHkuLlxyXG4gICAgICAgIGZ1bmN0aW9uKG9iamVjdCl7XHJcbiAgICAgICAgICAgIHJldHVybiBvYmplY3QgJiZcclxuICAgICAgICAgICAgICAgIGlzVHlwZShvYmplY3QsIG9iaikgJiZcclxuICAgICAgICAgICAgICAgIChub2RlVHlwZSBpbiBvYmplY3QpICYmXHJcbiAgICAgICAgICAgICAgICBpc1R5cGUob2JqZWN0Lm93bmVyRG9jdW1lbnQsb2JqKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzRWxlbWVudCA9IGZ1bmN0aW9uIChvYmplY3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNyZWxbaXNOb2RlU3RyaW5nXShvYmplY3QpICYmIG9iamVjdFtub2RlVHlwZV0gPT09IDE7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpc0FycmF5ID0gZnVuY3Rpb24oYSl7XHJcbiAgICAgICAgICAgIHJldHVybiBhIGluc3RhbmNlb2YgQXJyYXk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhcHBlbmRDaGlsZCA9IGZ1bmN0aW9uKGVsZW1lbnQsIGNoaWxkKSB7XHJcbiAgICAgICAgICAgIGlmIChpc0FycmF5KGNoaWxkKSkge1xyXG4gICAgICAgICAgICAgICAgY2hpbGQubWFwKGZ1bmN0aW9uKHN1YkNoaWxkKXtcclxuICAgICAgICAgICAgICAgICAgICBhcHBlbmRDaGlsZChlbGVtZW50LCBzdWJDaGlsZCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZighY3JlbFtpc05vZGVTdHJpbmddKGNoaWxkKSl7XHJcbiAgICAgICAgICAgICAgICBjaGlsZCA9IGQuY3JlYXRlVGV4dE5vZGUoY2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoY2hpbGQpO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWwoKXtcclxuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cywgLy9Ob3RlOiBhc3NpZ25lZCB0byBhIHZhcmlhYmxlIHRvIGFzc2lzdCBjb21waWxlcnMuIFNhdmVzIGFib3V0IDQwIGJ5dGVzIGluIGNsb3N1cmUgY29tcGlsZXIuIEhhcyBuZWdsaWdhYmxlIGVmZmVjdCBvbiBwZXJmb3JtYW5jZS5cclxuICAgICAgICAgICAgZWxlbWVudCA9IGFyZ3NbMF0sXHJcbiAgICAgICAgICAgIGNoaWxkLFxyXG4gICAgICAgICAgICBzZXR0aW5ncyA9IGFyZ3NbMV0sXHJcbiAgICAgICAgICAgIGNoaWxkSW5kZXggPSAyLFxyXG4gICAgICAgICAgICBhcmd1bWVudHNMZW5ndGggPSBhcmdzLmxlbmd0aCxcclxuICAgICAgICAgICAgYXR0cmlidXRlTWFwID0gY3JlbFthdHRyTWFwU3RyaW5nXTtcclxuXHJcbiAgICAgICAgZWxlbWVudCA9IGNyZWxbaXNFbGVtZW50U3RyaW5nXShlbGVtZW50KSA/IGVsZW1lbnQgOiBkLmNyZWF0ZUVsZW1lbnQoZWxlbWVudCk7XHJcbiAgICAgICAgLy8gc2hvcnRjdXRcclxuICAgICAgICBpZihhcmd1bWVudHNMZW5ndGggPT09IDEpe1xyXG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCFpc1R5cGUoc2V0dGluZ3Msb2JqKSB8fCBjcmVsW2lzTm9kZVN0cmluZ10oc2V0dGluZ3MpIHx8IGlzQXJyYXkoc2V0dGluZ3MpKSB7XHJcbiAgICAgICAgICAgIC0tY2hpbGRJbmRleDtcclxuICAgICAgICAgICAgc2V0dGluZ3MgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gc2hvcnRjdXQgaWYgdGhlcmUgaXMgb25seSBvbmUgY2hpbGQgdGhhdCBpcyBhIHN0cmluZ1xyXG4gICAgICAgIGlmKChhcmd1bWVudHNMZW5ndGggLSBjaGlsZEluZGV4KSA9PT0gMSAmJiBpc1R5cGUoYXJnc1tjaGlsZEluZGV4XSwgJ3N0cmluZycpICYmIGVsZW1lbnRbdGV4dENvbnRlbnRdICE9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICBlbGVtZW50W3RleHRDb250ZW50XSA9IGFyZ3NbY2hpbGRJbmRleF07XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGZvcig7IGNoaWxkSW5kZXggPCBhcmd1bWVudHNMZW5ndGg7ICsrY2hpbGRJbmRleCl7XHJcbiAgICAgICAgICAgICAgICBjaGlsZCA9IGFyZ3NbY2hpbGRJbmRleF07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoY2hpbGQgPT0gbnVsbCl7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzQXJyYXkoY2hpbGQpKSB7XHJcbiAgICAgICAgICAgICAgICAgIGZvciAodmFyIGk9MDsgaSA8IGNoaWxkLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXBwZW5kQ2hpbGQoZWxlbWVudCwgY2hpbGRbaV0pO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBhcHBlbmRDaGlsZChlbGVtZW50LCBjaGlsZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvcih2YXIga2V5IGluIHNldHRpbmdzKXtcclxuICAgICAgICAgICAgaWYoIWF0dHJpYnV0ZU1hcFtrZXldKXtcclxuICAgICAgICAgICAgICAgIGlmKGlzVHlwZShzZXR0aW5nc1trZXldLGZuKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudFtrZXldID0gc2V0dGluZ3Nba2V5XTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRbc2V0QXR0cmlidXRlXShrZXksIHNldHRpbmdzW2tleV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHZhciBhdHRyID0gYXR0cmlidXRlTWFwW2tleV07XHJcbiAgICAgICAgICAgICAgICBpZih0eXBlb2YgYXR0ciA9PT0gZm4pe1xyXG4gICAgICAgICAgICAgICAgICAgIGF0dHIoZWxlbWVudCwgc2V0dGluZ3Nba2V5XSk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50W3NldEF0dHJpYnV0ZV0oYXR0ciwgc2V0dGluZ3Nba2V5XSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVzZWQgZm9yIG1hcHBpbmcgb25lIGtpbmQgb2YgYXR0cmlidXRlIHRvIHRoZSBzdXBwb3J0ZWQgdmVyc2lvbiBvZiB0aGF0IGluIGJhZCBicm93c2Vycy5cclxuICAgIGNyZWxbYXR0ck1hcFN0cmluZ10gPSB7fTtcclxuXHJcbiAgICBjcmVsW2lzRWxlbWVudFN0cmluZ10gPSBpc0VsZW1lbnQ7XHJcblxyXG4gICAgY3JlbFtpc05vZGVTdHJpbmddID0gaXNOb2RlO1xyXG5cclxuICAgIGlmKHR5cGVvZiBQcm94eSAhPT0gJ3VuZGVmaW5lZCcpe1xyXG4gICAgICAgIGNyZWwucHJveHkgPSBuZXcgUHJveHkoY3JlbCwge1xyXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKHRhcmdldCwga2V5KXtcclxuICAgICAgICAgICAgICAgICEoa2V5IGluIGNyZWwpICYmIChjcmVsW2tleV0gPSBjcmVsLmJpbmQobnVsbCwga2V5KSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlbFtrZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNyZWw7XHJcbn0pKTtcclxuIiwiLypqc2hpbnQgZXFudWxsOnRydWUqL1xuKGZ1bmN0aW9uIChyb290KSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBHTE9CQUxfS0VZID0gXCJSYW5kb21cIjtcblxuICB2YXIgaW11bCA9ICh0eXBlb2YgTWF0aC5pbXVsICE9PSBcImZ1bmN0aW9uXCIgfHwgTWF0aC5pbXVsKDB4ZmZmZmZmZmYsIDUpICE9PSAtNSA/XG4gICAgZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHZhciBhaCA9IChhID4+PiAxNikgJiAweGZmZmY7XG4gICAgICB2YXIgYWwgPSBhICYgMHhmZmZmO1xuICAgICAgdmFyIGJoID0gKGIgPj4+IDE2KSAmIDB4ZmZmZjtcbiAgICAgIHZhciBibCA9IGIgJiAweGZmZmY7XG4gICAgICAvLyB0aGUgc2hpZnQgYnkgMCBmaXhlcyB0aGUgc2lnbiBvbiB0aGUgaGlnaCBwYXJ0XG4gICAgICAvLyB0aGUgZmluYWwgfDAgY29udmVydHMgdGhlIHVuc2lnbmVkIHZhbHVlIGludG8gYSBzaWduZWQgdmFsdWVcbiAgICAgIHJldHVybiAoYWwgKiBibCkgKyAoKChhaCAqIGJsICsgYWwgKiBiaCkgPDwgMTYpID4+PiAwKSB8IDA7XG4gICAgfSA6XG4gICAgTWF0aC5pbXVsKTtcblxuICB2YXIgc3RyaW5nUmVwZWF0ID0gKHR5cGVvZiBTdHJpbmcucHJvdG90eXBlLnJlcGVhdCA9PT0gXCJmdW5jdGlvblwiICYmIFwieFwiLnJlcGVhdCgzKSA9PT0gXCJ4eHhcIiA/XG4gICAgZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgIHJldHVybiB4LnJlcGVhdCh5KTtcbiAgICB9IDogZnVuY3Rpb24gKHBhdHRlcm4sIGNvdW50KSB7XG4gICAgICB2YXIgcmVzdWx0ID0gXCJcIjtcbiAgICAgIHdoaWxlIChjb3VudCA+IDApIHtcbiAgICAgICAgaWYgKGNvdW50ICYgMSkge1xuICAgICAgICAgIHJlc3VsdCArPSBwYXR0ZXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvdW50ID4+PSAxO1xuICAgICAgICBwYXR0ZXJuICs9IHBhdHRlcm47XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xuXG4gIGZ1bmN0aW9uIFJhbmRvbShlbmdpbmUpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUmFuZG9tKSkge1xuICAgICAgcmV0dXJuIG5ldyBSYW5kb20oZW5naW5lKTtcbiAgICB9XG5cbiAgICBpZiAoZW5naW5lID09IG51bGwpIHtcbiAgICAgIGVuZ2luZSA9IFJhbmRvbS5lbmdpbmVzLm5hdGl2ZU1hdGg7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZW5naW5lICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJFeHBlY3RlZCBlbmdpbmUgdG8gYmUgYSBmdW5jdGlvbiwgZ290IFwiICsgdHlwZW9mIGVuZ2luZSk7XG4gICAgfVxuICAgIHRoaXMuZW5naW5lID0gZW5naW5lO1xuICB9XG4gIHZhciBwcm90byA9IFJhbmRvbS5wcm90b3R5cGU7XG5cbiAgUmFuZG9tLmVuZ2luZXMgPSB7XG4gICAgbmF0aXZlTWF0aDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIChNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwMDApIHwgMDtcbiAgICB9LFxuICAgIG10MTk5Mzc6IChmdW5jdGlvbiAoSW50MzJBcnJheSkge1xuICAgICAgLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NZXJzZW5uZV90d2lzdGVyXG4gICAgICBmdW5jdGlvbiByZWZyZXNoRGF0YShkYXRhKSB7XG4gICAgICAgIHZhciBrID0gMDtcbiAgICAgICAgdmFyIHRtcCA9IDA7XG4gICAgICAgIGZvciAoO1xuICAgICAgICAgIChrIHwgMCkgPCAyMjc7IGsgPSAoayArIDEpIHwgMCkge1xuICAgICAgICAgIHRtcCA9IChkYXRhW2tdICYgMHg4MDAwMDAwMCkgfCAoZGF0YVsoayArIDEpIHwgMF0gJiAweDdmZmZmZmZmKTtcbiAgICAgICAgICBkYXRhW2tdID0gZGF0YVsoayArIDM5NykgfCAwXSBeICh0bXAgPj4+IDEpIF4gKCh0bXAgJiAweDEpID8gMHg5OTA4YjBkZiA6IDApO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICg7XG4gICAgICAgICAgKGsgfCAwKSA8IDYyMzsgayA9IChrICsgMSkgfCAwKSB7XG4gICAgICAgICAgdG1wID0gKGRhdGFba10gJiAweDgwMDAwMDAwKSB8IChkYXRhWyhrICsgMSkgfCAwXSAmIDB4N2ZmZmZmZmYpO1xuICAgICAgICAgIGRhdGFba10gPSBkYXRhWyhrIC0gMjI3KSB8IDBdIF4gKHRtcCA+Pj4gMSkgXiAoKHRtcCAmIDB4MSkgPyAweDk5MDhiMGRmIDogMCk7XG4gICAgICAgIH1cblxuICAgICAgICB0bXAgPSAoZGF0YVs2MjNdICYgMHg4MDAwMDAwMCkgfCAoZGF0YVswXSAmIDB4N2ZmZmZmZmYpO1xuICAgICAgICBkYXRhWzYyM10gPSBkYXRhWzM5Nl0gXiAodG1wID4+PiAxKSBeICgodG1wICYgMHgxKSA/IDB4OTkwOGIwZGYgOiAwKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdGVtcGVyKHZhbHVlKSB7XG4gICAgICAgIHZhbHVlIF49IHZhbHVlID4+PiAxMTtcbiAgICAgICAgdmFsdWUgXj0gKHZhbHVlIDw8IDcpICYgMHg5ZDJjNTY4MDtcbiAgICAgICAgdmFsdWUgXj0gKHZhbHVlIDw8IDE1KSAmIDB4ZWZjNjAwMDA7XG4gICAgICAgIHJldHVybiB2YWx1ZSBeICh2YWx1ZSA+Pj4gMTgpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzZWVkV2l0aEFycmF5KGRhdGEsIHNvdXJjZSkge1xuICAgICAgICB2YXIgaSA9IDE7XG4gICAgICAgIHZhciBqID0gMDtcbiAgICAgICAgdmFyIHNvdXJjZUxlbmd0aCA9IHNvdXJjZS5sZW5ndGg7XG4gICAgICAgIHZhciBrID0gTWF0aC5tYXgoc291cmNlTGVuZ3RoLCA2MjQpIHwgMDtcbiAgICAgICAgdmFyIHByZXZpb3VzID0gZGF0YVswXSB8IDA7XG4gICAgICAgIGZvciAoO1xuICAgICAgICAgIChrIHwgMCkgPiAwOyAtLWspIHtcbiAgICAgICAgICBkYXRhW2ldID0gcHJldmlvdXMgPSAoKGRhdGFbaV0gXiBpbXVsKChwcmV2aW91cyBeIChwcmV2aW91cyA+Pj4gMzApKSwgMHgwMDE5NjYwZCkpICsgKHNvdXJjZVtqXSB8IDApICsgKGogfCAwKSkgfCAwO1xuICAgICAgICAgIGkgPSAoaSArIDEpIHwgMDtcbiAgICAgICAgICArK2o7XG4gICAgICAgICAgaWYgKChpIHwgMCkgPiA2MjMpIHtcbiAgICAgICAgICAgIGRhdGFbMF0gPSBkYXRhWzYyM107XG4gICAgICAgICAgICBpID0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGogPj0gc291cmNlTGVuZ3RoKSB7XG4gICAgICAgICAgICBqID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChrID0gNjIzO1xuICAgICAgICAgIChrIHwgMCkgPiAwOyAtLWspIHtcbiAgICAgICAgICBkYXRhW2ldID0gcHJldmlvdXMgPSAoKGRhdGFbaV0gXiBpbXVsKChwcmV2aW91cyBeIChwcmV2aW91cyA+Pj4gMzApKSwgMHg1ZDU4OGI2NSkpIC0gaSkgfCAwO1xuICAgICAgICAgIGkgPSAoaSArIDEpIHwgMDtcbiAgICAgICAgICBpZiAoKGkgfCAwKSA+IDYyMykge1xuICAgICAgICAgICAgZGF0YVswXSA9IGRhdGFbNjIzXTtcbiAgICAgICAgICAgIGkgPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBkYXRhWzBdID0gMHg4MDAwMDAwMDtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gbXQxOTkzNygpIHtcbiAgICAgICAgdmFyIGRhdGEgPSBuZXcgSW50MzJBcnJheSg2MjQpO1xuICAgICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgICB2YXIgdXNlcyA9IDA7XG5cbiAgICAgICAgZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICBpZiAoKGluZGV4IHwgMCkgPj0gNjI0KSB7XG4gICAgICAgICAgICByZWZyZXNoRGF0YShkYXRhKTtcbiAgICAgICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgdmFsdWUgPSBkYXRhW2luZGV4XTtcbiAgICAgICAgICBpbmRleCA9IChpbmRleCArIDEpIHwgMDtcbiAgICAgICAgICB1c2VzICs9IDE7XG4gICAgICAgICAgcmV0dXJuIHRlbXBlcih2YWx1ZSkgfCAwO1xuICAgICAgICB9XG4gICAgICAgIG5leHQuZ2V0VXNlQ291bnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gdXNlcztcbiAgICAgICAgfTtcbiAgICAgICAgbmV4dC5kaXNjYXJkID0gZnVuY3Rpb24gKGNvdW50KSB7XG4gICAgICAgICAgdXNlcyArPSBjb3VudDtcbiAgICAgICAgICBpZiAoKGluZGV4IHwgMCkgPj0gNjI0KSB7XG4gICAgICAgICAgICByZWZyZXNoRGF0YShkYXRhKTtcbiAgICAgICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgd2hpbGUgKChjb3VudCAtIGluZGV4KSA+IDYyNCkge1xuICAgICAgICAgICAgY291bnQgLT0gNjI0IC0gaW5kZXg7XG4gICAgICAgICAgICByZWZyZXNoRGF0YShkYXRhKTtcbiAgICAgICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaW5kZXggPSAoaW5kZXggKyBjb3VudCkgfCAwO1xuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9O1xuICAgICAgICBuZXh0LnNlZWQgPSBmdW5jdGlvbiAoaW5pdGlhbCkge1xuICAgICAgICAgIHZhciBwcmV2aW91cyA9IDA7XG4gICAgICAgICAgZGF0YVswXSA9IHByZXZpb3VzID0gaW5pdGlhbCB8IDA7XG5cbiAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IDYyNDsgaSA9IChpICsgMSkgfCAwKSB7XG4gICAgICAgICAgICBkYXRhW2ldID0gcHJldmlvdXMgPSAoaW11bCgocHJldmlvdXMgXiAocHJldmlvdXMgPj4+IDMwKSksIDB4NmMwNzg5NjUpICsgaSkgfCAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpbmRleCA9IDYyNDtcbiAgICAgICAgICB1c2VzID0gMDtcbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfTtcbiAgICAgICAgbmV4dC5zZWVkV2l0aEFycmF5ID0gZnVuY3Rpb24gKHNvdXJjZSkge1xuICAgICAgICAgIG5leHQuc2VlZCgweDAxMmJkNmFhKTtcbiAgICAgICAgICBzZWVkV2l0aEFycmF5KGRhdGEsIHNvdXJjZSk7XG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH07XG4gICAgICAgIG5leHQuYXV0b1NlZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIG5leHQuc2VlZFdpdGhBcnJheShSYW5kb20uZ2VuZXJhdGVFbnRyb3B5QXJyYXkoKSk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbXQxOTkzNztcbiAgICB9KHR5cGVvZiBJbnQzMkFycmF5ID09PSBcImZ1bmN0aW9uXCIgPyBJbnQzMkFycmF5IDogQXJyYXkpKSxcbiAgICBicm93c2VyQ3J5cHRvOiAodHlwZW9mIGNyeXB0byAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBJbnQzMkFycmF5ID09PSBcImZ1bmN0aW9uXCIpID8gKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBkYXRhID0gbnVsbDtcbiAgICAgIHZhciBpbmRleCA9IDEyODtcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGluZGV4ID49IDEyOCkge1xuICAgICAgICAgIGlmIChkYXRhID09PSBudWxsKSB7XG4gICAgICAgICAgICBkYXRhID0gbmV3IEludDMyQXJyYXkoMTI4KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhkYXRhKTtcbiAgICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGF0YVtpbmRleCsrXSB8IDA7XG4gICAgICB9O1xuICAgIH0oKSkgOiBudWxsXG4gIH07XG5cbiAgUmFuZG9tLmdlbmVyYXRlRW50cm9weUFycmF5ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBhcnJheSA9IFtdO1xuICAgIHZhciBlbmdpbmUgPSBSYW5kb20uZW5naW5lcy5uYXRpdmVNYXRoO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTY7ICsraSkge1xuICAgICAgYXJyYXlbaV0gPSBlbmdpbmUoKSB8IDA7XG4gICAgfVxuICAgIGFycmF5LnB1c2gobmV3IERhdGUoKS5nZXRUaW1lKCkgfCAwKTtcbiAgICByZXR1cm4gYXJyYXk7XG4gIH07XG5cbiAgZnVuY3Rpb24gcmV0dXJuVmFsdWUodmFsdWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH07XG4gIH1cblxuICAvLyBbLTB4ODAwMDAwMDAsIDB4N2ZmZmZmZmZdXG4gIFJhbmRvbS5pbnQzMiA9IGZ1bmN0aW9uIChlbmdpbmUpIHtcbiAgICByZXR1cm4gZW5naW5lKCkgfCAwO1xuICB9O1xuICBwcm90by5pbnQzMiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUmFuZG9tLmludDMyKHRoaXMuZW5naW5lKTtcbiAgfTtcblxuICAvLyBbMCwgMHhmZmZmZmZmZl1cbiAgUmFuZG9tLnVpbnQzMiA9IGZ1bmN0aW9uIChlbmdpbmUpIHtcbiAgICByZXR1cm4gZW5naW5lKCkgPj4+IDA7XG4gIH07XG4gIHByb3RvLnVpbnQzMiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUmFuZG9tLnVpbnQzMih0aGlzLmVuZ2luZSk7XG4gIH07XG5cbiAgLy8gWzAsIDB4MWZmZmZmZmZmZmZmZmZdXG4gIFJhbmRvbS51aW50NTMgPSBmdW5jdGlvbiAoZW5naW5lKSB7XG4gICAgdmFyIGhpZ2ggPSBlbmdpbmUoKSAmIDB4MWZmZmZmO1xuICAgIHZhciBsb3cgPSBlbmdpbmUoKSA+Pj4gMDtcbiAgICByZXR1cm4gKGhpZ2ggKiAweDEwMDAwMDAwMCkgKyBsb3c7XG4gIH07XG4gIHByb3RvLnVpbnQ1MyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUmFuZG9tLnVpbnQ1Myh0aGlzLmVuZ2luZSk7XG4gIH07XG5cbiAgLy8gWzAsIDB4MjAwMDAwMDAwMDAwMDBdXG4gIFJhbmRvbS51aW50NTNGdWxsID0gZnVuY3Rpb24gKGVuZ2luZSkge1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICB2YXIgaGlnaCA9IGVuZ2luZSgpIHwgMDtcbiAgICAgIGlmIChoaWdoICYgMHgyMDAwMDApIHtcbiAgICAgICAgaWYgKChoaWdoICYgMHgzZmZmZmYpID09PSAweDIwMDAwMCAmJiAoZW5naW5lKCkgfCAwKSA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiAweDIwMDAwMDAwMDAwMDAwO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbG93ID0gZW5naW5lKCkgPj4+IDA7XG4gICAgICAgIHJldHVybiAoKGhpZ2ggJiAweDFmZmZmZikgKiAweDEwMDAwMDAwMCkgKyBsb3c7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBwcm90by51aW50NTNGdWxsID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSYW5kb20udWludDUzRnVsbCh0aGlzLmVuZ2luZSk7XG4gIH07XG5cbiAgLy8gWy0weDIwMDAwMDAwMDAwMDAwLCAweDFmZmZmZmZmZmZmZmZmXVxuICBSYW5kb20uaW50NTMgPSBmdW5jdGlvbiAoZW5naW5lKSB7XG4gICAgdmFyIGhpZ2ggPSBlbmdpbmUoKSB8IDA7XG4gICAgdmFyIGxvdyA9IGVuZ2luZSgpID4+PiAwO1xuICAgIHJldHVybiAoKGhpZ2ggJiAweDFmZmZmZikgKiAweDEwMDAwMDAwMCkgKyBsb3cgKyAoaGlnaCAmIDB4MjAwMDAwID8gLTB4MjAwMDAwMDAwMDAwMDAgOiAwKTtcbiAgfTtcbiAgcHJvdG8uaW50NTMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFJhbmRvbS5pbnQ1Myh0aGlzLmVuZ2luZSk7XG4gIH07XG5cbiAgLy8gWy0weDIwMDAwMDAwMDAwMDAwLCAweDIwMDAwMDAwMDAwMDAwXVxuICBSYW5kb20uaW50NTNGdWxsID0gZnVuY3Rpb24gKGVuZ2luZSkge1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICB2YXIgaGlnaCA9IGVuZ2luZSgpIHwgMDtcbiAgICAgIGlmIChoaWdoICYgMHg0MDAwMDApIHtcbiAgICAgICAgaWYgKChoaWdoICYgMHg3ZmZmZmYpID09PSAweDQwMDAwMCAmJiAoZW5naW5lKCkgfCAwKSA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiAweDIwMDAwMDAwMDAwMDAwO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbG93ID0gZW5naW5lKCkgPj4+IDA7XG4gICAgICAgIHJldHVybiAoKGhpZ2ggJiAweDFmZmZmZikgKiAweDEwMDAwMDAwMCkgKyBsb3cgKyAoaGlnaCAmIDB4MjAwMDAwID8gLTB4MjAwMDAwMDAwMDAwMDAgOiAwKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIHByb3RvLmludDUzRnVsbCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUmFuZG9tLmludDUzRnVsbCh0aGlzLmVuZ2luZSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gYWRkKGdlbmVyYXRlLCBhZGRlbmQpIHtcbiAgICBpZiAoYWRkZW5kID09PSAwKSB7XG4gICAgICByZXR1cm4gZ2VuZXJhdGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZW5naW5lKSB7XG4gICAgICAgIHJldHVybiBnZW5lcmF0ZShlbmdpbmUpICsgYWRkZW5kO1xuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBSYW5kb20uaW50ZWdlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gaXNQb3dlck9mVHdvTWludXNPbmUodmFsdWUpIHtcbiAgICAgIHJldHVybiAoKHZhbHVlICsgMSkgJiB2YWx1ZSkgPT09IDA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYml0bWFzayhtYXNraW5nKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGVuZ2luZSkge1xuICAgICAgICByZXR1cm4gZW5naW5lKCkgJiBtYXNraW5nO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkb3duc2NhbGVUb0xvb3BDaGVja2VkUmFuZ2UocmFuZ2UpIHtcbiAgICAgIHZhciBleHRlbmRlZFJhbmdlID0gcmFuZ2UgKyAxO1xuICAgICAgdmFyIG1heGltdW0gPSBleHRlbmRlZFJhbmdlICogTWF0aC5mbG9vcigweDEwMDAwMDAwMCAvIGV4dGVuZGVkUmFuZ2UpO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlbmdpbmUpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gMDtcbiAgICAgICAgZG8ge1xuICAgICAgICAgIHZhbHVlID0gZW5naW5lKCkgPj4+IDA7XG4gICAgICAgIH0gd2hpbGUgKHZhbHVlID49IG1heGltdW0pO1xuICAgICAgICByZXR1cm4gdmFsdWUgJSBleHRlbmRlZFJhbmdlO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkb3duc2NhbGVUb1JhbmdlKHJhbmdlKSB7XG4gICAgICBpZiAoaXNQb3dlck9mVHdvTWludXNPbmUocmFuZ2UpKSB7XG4gICAgICAgIHJldHVybiBiaXRtYXNrKHJhbmdlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBkb3duc2NhbGVUb0xvb3BDaGVja2VkUmFuZ2UocmFuZ2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzRXZlbmx5RGl2aXNpYmxlQnlNYXhJbnQzMih2YWx1ZSkge1xuICAgICAgcmV0dXJuICh2YWx1ZSB8IDApID09PSAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwc2NhbGVXaXRoSGlnaE1hc2tpbmcobWFza2luZykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlbmdpbmUpIHtcbiAgICAgICAgdmFyIGhpZ2ggPSBlbmdpbmUoKSAmIG1hc2tpbmc7XG4gICAgICAgIHZhciBsb3cgPSBlbmdpbmUoKSA+Pj4gMDtcbiAgICAgICAgcmV0dXJuIChoaWdoICogMHgxMDAwMDAwMDApICsgbG93O1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cHNjYWxlVG9Mb29wQ2hlY2tlZFJhbmdlKGV4dGVuZGVkUmFuZ2UpIHtcbiAgICAgIHZhciBtYXhpbXVtID0gZXh0ZW5kZWRSYW5nZSAqIE1hdGguZmxvb3IoMHgyMDAwMDAwMDAwMDAwMCAvIGV4dGVuZGVkUmFuZ2UpO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlbmdpbmUpIHtcbiAgICAgICAgdmFyIHJldCA9IDA7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICB2YXIgaGlnaCA9IGVuZ2luZSgpICYgMHgxZmZmZmY7XG4gICAgICAgICAgdmFyIGxvdyA9IGVuZ2luZSgpID4+PiAwO1xuICAgICAgICAgIHJldCA9IChoaWdoICogMHgxMDAwMDAwMDApICsgbG93O1xuICAgICAgICB9IHdoaWxlIChyZXQgPj0gbWF4aW11bSk7XG4gICAgICAgIHJldHVybiByZXQgJSBleHRlbmRlZFJhbmdlO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cHNjYWxlV2l0aGluVTUzKHJhbmdlKSB7XG4gICAgICB2YXIgZXh0ZW5kZWRSYW5nZSA9IHJhbmdlICsgMTtcbiAgICAgIGlmIChpc0V2ZW5seURpdmlzaWJsZUJ5TWF4SW50MzIoZXh0ZW5kZWRSYW5nZSkpIHtcbiAgICAgICAgdmFyIGhpZ2hSYW5nZSA9ICgoZXh0ZW5kZWRSYW5nZSAvIDB4MTAwMDAwMDAwKSB8IDApIC0gMTtcbiAgICAgICAgaWYgKGlzUG93ZXJPZlR3b01pbnVzT25lKGhpZ2hSYW5nZSkpIHtcbiAgICAgICAgICByZXR1cm4gdXBzY2FsZVdpdGhIaWdoTWFza2luZyhoaWdoUmFuZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdXBzY2FsZVRvTG9vcENoZWNrZWRSYW5nZShleHRlbmRlZFJhbmdlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cHNjYWxlV2l0aGluSTUzQW5kTG9vcENoZWNrKG1pbiwgbWF4KSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGVuZ2luZSkge1xuICAgICAgICB2YXIgcmV0ID0gMDtcbiAgICAgICAgZG8ge1xuICAgICAgICAgIHZhciBoaWdoID0gZW5naW5lKCkgfCAwO1xuICAgICAgICAgIHZhciBsb3cgPSBlbmdpbmUoKSA+Pj4gMDtcbiAgICAgICAgICByZXQgPSAoKGhpZ2ggJiAweDFmZmZmZikgKiAweDEwMDAwMDAwMCkgKyBsb3cgKyAoaGlnaCAmIDB4MjAwMDAwID8gLTB4MjAwMDAwMDAwMDAwMDAgOiAwKTtcbiAgICAgICAgfSB3aGlsZSAocmV0IDwgbWluIHx8IHJldCA+IG1heCk7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiAobWluLCBtYXgpIHtcbiAgICAgIG1pbiA9IE1hdGguZmxvb3IobWluKTtcbiAgICAgIG1heCA9IE1hdGguZmxvb3IobWF4KTtcbiAgICAgIGlmIChtaW4gPCAtMHgyMDAwMDAwMDAwMDAwMCB8fCAhaXNGaW5pdGUobWluKSkge1xuICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcIkV4cGVjdGVkIG1pbiB0byBiZSBhdCBsZWFzdCBcIiArICgtMHgyMDAwMDAwMDAwMDAwMCkpO1xuICAgICAgfSBlbHNlIGlmIChtYXggPiAweDIwMDAwMDAwMDAwMDAwIHx8ICFpc0Zpbml0ZShtYXgpKSB7XG4gICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFwiRXhwZWN0ZWQgbWF4IHRvIGJlIGF0IG1vc3QgXCIgKyAweDIwMDAwMDAwMDAwMDAwKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHJhbmdlID0gbWF4IC0gbWluO1xuICAgICAgaWYgKHJhbmdlIDw9IDAgfHwgIWlzRmluaXRlKHJhbmdlKSkge1xuICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWUobWluKTtcbiAgICAgIH0gZWxzZSBpZiAocmFuZ2UgPT09IDB4ZmZmZmZmZmYpIHtcbiAgICAgICAgaWYgKG1pbiA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBSYW5kb20udWludDMyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBhZGQoUmFuZG9tLmludDMyLCBtaW4gKyAweDgwMDAwMDAwKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChyYW5nZSA8IDB4ZmZmZmZmZmYpIHtcbiAgICAgICAgcmV0dXJuIGFkZChkb3duc2NhbGVUb1JhbmdlKHJhbmdlKSwgbWluKTtcbiAgICAgIH0gZWxzZSBpZiAocmFuZ2UgPT09IDB4MWZmZmZmZmZmZmZmZmYpIHtcbiAgICAgICAgcmV0dXJuIGFkZChSYW5kb20udWludDUzLCBtaW4pO1xuICAgICAgfSBlbHNlIGlmIChyYW5nZSA8IDB4MWZmZmZmZmZmZmZmZmYpIHtcbiAgICAgICAgcmV0dXJuIGFkZCh1cHNjYWxlV2l0aGluVTUzKHJhbmdlKSwgbWluKTtcbiAgICAgIH0gZWxzZSBpZiAobWF4IC0gMSAtIG1pbiA9PT0gMHgxZmZmZmZmZmZmZmZmZikge1xuICAgICAgICByZXR1cm4gYWRkKFJhbmRvbS51aW50NTNGdWxsLCBtaW4pO1xuICAgICAgfSBlbHNlIGlmIChtaW4gPT09IC0weDIwMDAwMDAwMDAwMDAwICYmIG1heCA9PT0gMHgyMDAwMDAwMDAwMDAwMCkge1xuICAgICAgICByZXR1cm4gUmFuZG9tLmludDUzRnVsbDtcbiAgICAgIH0gZWxzZSBpZiAobWluID09PSAtMHgyMDAwMDAwMDAwMDAwMCAmJiBtYXggPT09IDB4MWZmZmZmZmZmZmZmZmYpIHtcbiAgICAgICAgcmV0dXJuIFJhbmRvbS5pbnQ1MztcbiAgICAgIH0gZWxzZSBpZiAobWluID09PSAtMHgxZmZmZmZmZmZmZmZmZiAmJiBtYXggPT09IDB4MjAwMDAwMDAwMDAwMDApIHtcbiAgICAgICAgcmV0dXJuIGFkZChSYW5kb20uaW50NTMsIDEpO1xuICAgICAgfSBlbHNlIGlmIChtYXggPT09IDB4MjAwMDAwMDAwMDAwMDApIHtcbiAgICAgICAgcmV0dXJuIGFkZCh1cHNjYWxlV2l0aGluSTUzQW5kTG9vcENoZWNrKG1pbiAtIDEsIG1heCAtIDEpLCAxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB1cHNjYWxlV2l0aGluSTUzQW5kTG9vcENoZWNrKG1pbiwgbWF4KTtcbiAgICAgIH1cbiAgICB9O1xuICB9KCkpO1xuICBwcm90by5pbnRlZ2VyID0gZnVuY3Rpb24gKG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuIFJhbmRvbS5pbnRlZ2VyKG1pbiwgbWF4KSh0aGlzLmVuZ2luZSk7XG4gIH07XG5cbiAgLy8gWzAsIDFdIChmbG9hdGluZyBwb2ludClcbiAgUmFuZG9tLnJlYWxaZXJvVG9PbmVJbmNsdXNpdmUgPSBmdW5jdGlvbiAoZW5naW5lKSB7XG4gICAgcmV0dXJuIFJhbmRvbS51aW50NTNGdWxsKGVuZ2luZSkgLyAweDIwMDAwMDAwMDAwMDAwO1xuICB9O1xuICBwcm90by5yZWFsWmVyb1RvT25lSW5jbHVzaXZlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSYW5kb20ucmVhbFplcm9Ub09uZUluY2x1c2l2ZSh0aGlzLmVuZ2luZSk7XG4gIH07XG5cbiAgLy8gWzAsIDEpIChmbG9hdGluZyBwb2ludClcbiAgUmFuZG9tLnJlYWxaZXJvVG9PbmVFeGNsdXNpdmUgPSBmdW5jdGlvbiAoZW5naW5lKSB7XG4gICAgcmV0dXJuIFJhbmRvbS51aW50NTMoZW5naW5lKSAvIDB4MjAwMDAwMDAwMDAwMDA7XG4gIH07XG4gIHByb3RvLnJlYWxaZXJvVG9PbmVFeGNsdXNpdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFJhbmRvbS5yZWFsWmVyb1RvT25lRXhjbHVzaXZlKHRoaXMuZW5naW5lKTtcbiAgfTtcblxuICBSYW5kb20ucmVhbCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gbXVsdGlwbHkoZ2VuZXJhdGUsIG11bHRpcGxpZXIpIHtcbiAgICAgIGlmIChtdWx0aXBsaWVyID09PSAxKSB7XG4gICAgICAgIHJldHVybiBnZW5lcmF0ZTtcbiAgICAgIH0gZWxzZSBpZiAobXVsdGlwbGllciA9PT0gMCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlbmdpbmUpIHtcbiAgICAgICAgICByZXR1cm4gZ2VuZXJhdGUoZW5naW5lKSAqIG11bHRpcGxpZXI7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChsZWZ0LCByaWdodCwgaW5jbHVzaXZlKSB7XG4gICAgICBpZiAoIWlzRmluaXRlKGxlZnQpKSB7XG4gICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFwiRXhwZWN0ZWQgbGVmdCB0byBiZSBhIGZpbml0ZSBudW1iZXJcIik7XG4gICAgICB9IGVsc2UgaWYgKCFpc0Zpbml0ZShyaWdodCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCJFeHBlY3RlZCByaWdodCB0byBiZSBhIGZpbml0ZSBudW1iZXJcIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gYWRkKFxuICAgICAgICBtdWx0aXBseShcbiAgICAgICAgICBpbmNsdXNpdmUgPyBSYW5kb20ucmVhbFplcm9Ub09uZUluY2x1c2l2ZSA6IFJhbmRvbS5yZWFsWmVyb1RvT25lRXhjbHVzaXZlLFxuICAgICAgICAgIHJpZ2h0IC0gbGVmdCksXG4gICAgICAgIGxlZnQpO1xuICAgIH07XG4gIH0oKSk7XG4gIHByb3RvLnJlYWwgPSBmdW5jdGlvbiAobWluLCBtYXgsIGluY2x1c2l2ZSkge1xuICAgIHJldHVybiBSYW5kb20ucmVhbChtaW4sIG1heCwgaW5jbHVzaXZlKSh0aGlzLmVuZ2luZSk7XG4gIH07XG5cbiAgUmFuZG9tLmJvb2wgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIGlzTGVhc3RCaXRUcnVlKGVuZ2luZSkge1xuICAgICAgcmV0dXJuIChlbmdpbmUoKSAmIDEpID09PSAxO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxlc3NUaGFuKGdlbmVyYXRlLCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlbmdpbmUpIHtcbiAgICAgICAgcmV0dXJuIGdlbmVyYXRlKGVuZ2luZSkgPCB2YWx1ZTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJvYmFiaWxpdHkocGVyY2VudGFnZSkge1xuICAgICAgaWYgKHBlcmNlbnRhZ2UgPD0gMCkge1xuICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWUoZmFsc2UpO1xuICAgICAgfSBlbHNlIGlmIChwZXJjZW50YWdlID49IDEpIHtcbiAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlKHRydWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHNjYWxlZCA9IHBlcmNlbnRhZ2UgKiAweDEwMDAwMDAwMDtcbiAgICAgICAgaWYgKHNjYWxlZCAlIDEgPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gbGVzc1RoYW4oUmFuZG9tLmludDMyLCAoc2NhbGVkIC0gMHg4MDAwMDAwMCkgfCAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbGVzc1RoYW4oUmFuZG9tLnVpbnQ1MywgTWF0aC5yb3VuZChwZXJjZW50YWdlICogMHgyMDAwMDAwMDAwMDAwMCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChudW1lcmF0b3IsIGRlbm9taW5hdG9yKSB7XG4gICAgICBpZiAoZGVub21pbmF0b3IgPT0gbnVsbCkge1xuICAgICAgICBpZiAobnVtZXJhdG9yID09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gaXNMZWFzdEJpdFRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb2JhYmlsaXR5KG51bWVyYXRvcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobnVtZXJhdG9yIDw9IDApIHtcbiAgICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWUoZmFsc2UpO1xuICAgICAgICB9IGVsc2UgaWYgKG51bWVyYXRvciA+PSBkZW5vbWluYXRvcikge1xuICAgICAgICAgIHJldHVybiByZXR1cm5WYWx1ZSh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGVzc1RoYW4oUmFuZG9tLmludGVnZXIoMCwgZGVub21pbmF0b3IgLSAxKSwgbnVtZXJhdG9yKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KCkpO1xuICBwcm90by5ib29sID0gZnVuY3Rpb24gKG51bWVyYXRvciwgZGVub21pbmF0b3IpIHtcbiAgICByZXR1cm4gUmFuZG9tLmJvb2wobnVtZXJhdG9yLCBkZW5vbWluYXRvcikodGhpcy5lbmdpbmUpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHRvSW50ZWdlcih2YWx1ZSkge1xuICAgIHZhciBudW1iZXIgPSArdmFsdWU7XG4gICAgaWYgKG51bWJlciA8IDApIHtcbiAgICAgIHJldHVybiBNYXRoLmNlaWwobnVtYmVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IobnVtYmVyKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjb252ZXJ0U2xpY2VBcmd1bWVudCh2YWx1ZSwgbGVuZ3RoKSB7XG4gICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgcmV0dXJuIE1hdGgubWF4KHZhbHVlICsgbGVuZ3RoLCAwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIE1hdGgubWluKHZhbHVlLCBsZW5ndGgpO1xuICAgIH1cbiAgfVxuICBSYW5kb20ucGljayA9IGZ1bmN0aW9uIChlbmdpbmUsIGFycmF5LCBiZWdpbiwgZW5kKSB7XG4gICAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcbiAgICB2YXIgc3RhcnQgPSBiZWdpbiA9PSBudWxsID8gMCA6IGNvbnZlcnRTbGljZUFyZ3VtZW50KHRvSW50ZWdlcihiZWdpbiksIGxlbmd0aCk7XG4gICAgdmFyIGZpbmlzaCA9IGVuZCA9PT0gdm9pZCAwID8gbGVuZ3RoIDogY29udmVydFNsaWNlQXJndW1lbnQodG9JbnRlZ2VyKGVuZCksIGxlbmd0aCk7XG4gICAgaWYgKHN0YXJ0ID49IGZpbmlzaCkge1xuICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICB9XG4gICAgdmFyIGRpc3RyaWJ1dGlvbiA9IFJhbmRvbS5pbnRlZ2VyKHN0YXJ0LCBmaW5pc2ggLSAxKTtcbiAgICByZXR1cm4gYXJyYXlbZGlzdHJpYnV0aW9uKGVuZ2luZSldO1xuICB9O1xuICBwcm90by5waWNrID0gZnVuY3Rpb24gKGFycmF5LCBiZWdpbiwgZW5kKSB7XG4gICAgcmV0dXJuIFJhbmRvbS5waWNrKHRoaXMuZW5naW5lLCBhcnJheSwgYmVnaW4sIGVuZCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gcmV0dXJuVW5kZWZpbmVkKCkge1xuICAgIHJldHVybiB2b2lkIDA7XG4gIH1cbiAgdmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuICBSYW5kb20ucGlja2VyID0gZnVuY3Rpb24gKGFycmF5LCBiZWdpbiwgZW5kKSB7XG4gICAgdmFyIGNsb25lID0gc2xpY2UuY2FsbChhcnJheSwgYmVnaW4sIGVuZCk7XG4gICAgaWYgKCFjbG9uZS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiByZXR1cm5VbmRlZmluZWQ7XG4gICAgfVxuICAgIHZhciBkaXN0cmlidXRpb24gPSBSYW5kb20uaW50ZWdlcigwLCBjbG9uZS5sZW5ndGggLSAxKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGVuZ2luZSkge1xuICAgICAgcmV0dXJuIGNsb25lW2Rpc3RyaWJ1dGlvbihlbmdpbmUpXTtcbiAgICB9O1xuICB9O1xuXG4gIFJhbmRvbS5zaHVmZmxlID0gZnVuY3Rpb24gKGVuZ2luZSwgYXJyYXksIGRvd25Ubykge1xuICAgIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gICAgaWYgKGxlbmd0aCkge1xuICAgICAgaWYgKGRvd25UbyA9PSBudWxsKSB7XG4gICAgICAgIGRvd25UbyA9IDA7XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBpID0gKGxlbmd0aCAtIDEpID4+PiAwOyBpID4gZG93blRvOyAtLWkpIHtcbiAgICAgICAgdmFyIGRpc3RyaWJ1dGlvbiA9IFJhbmRvbS5pbnRlZ2VyKDAsIGkpO1xuICAgICAgICB2YXIgaiA9IGRpc3RyaWJ1dGlvbihlbmdpbmUpO1xuICAgICAgICBpZiAoaSAhPT0gaikge1xuICAgICAgICAgIHZhciB0bXAgPSBhcnJheVtpXTtcbiAgICAgICAgICBhcnJheVtpXSA9IGFycmF5W2pdO1xuICAgICAgICAgIGFycmF5W2pdID0gdG1wO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnJheTtcbiAgfTtcbiAgcHJvdG8uc2h1ZmZsZSA9IGZ1bmN0aW9uIChhcnJheSkge1xuICAgIHJldHVybiBSYW5kb20uc2h1ZmZsZSh0aGlzLmVuZ2luZSwgYXJyYXkpO1xuICB9O1xuXG4gIFJhbmRvbS5zYW1wbGUgPSBmdW5jdGlvbiAoZW5naW5lLCBwb3B1bGF0aW9uLCBzYW1wbGVTaXplKSB7XG4gICAgaWYgKHNhbXBsZVNpemUgPCAwIHx8IHNhbXBsZVNpemUgPiBwb3B1bGF0aW9uLmxlbmd0aCB8fCAhaXNGaW5pdGUoc2FtcGxlU2l6ZSkpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFwiRXhwZWN0ZWQgc2FtcGxlU2l6ZSB0byBiZSB3aXRoaW4gMCBhbmQgdGhlIGxlbmd0aCBvZiB0aGUgcG9wdWxhdGlvblwiKTtcbiAgICB9XG5cbiAgICBpZiAoc2FtcGxlU2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHZhciBjbG9uZSA9IHNsaWNlLmNhbGwocG9wdWxhdGlvbik7XG4gICAgdmFyIGxlbmd0aCA9IGNsb25lLmxlbmd0aDtcbiAgICBpZiAobGVuZ3RoID09PSBzYW1wbGVTaXplKSB7XG4gICAgICByZXR1cm4gUmFuZG9tLnNodWZmbGUoZW5naW5lLCBjbG9uZSwgMCk7XG4gICAgfVxuICAgIHZhciB0YWlsTGVuZ3RoID0gbGVuZ3RoIC0gc2FtcGxlU2l6ZTtcbiAgICByZXR1cm4gUmFuZG9tLnNodWZmbGUoZW5naW5lLCBjbG9uZSwgdGFpbExlbmd0aCAtIDEpLnNsaWNlKHRhaWxMZW5ndGgpO1xuICB9O1xuICBwcm90by5zYW1wbGUgPSBmdW5jdGlvbiAocG9wdWxhdGlvbiwgc2FtcGxlU2l6ZSkge1xuICAgIHJldHVybiBSYW5kb20uc2FtcGxlKHRoaXMuZW5naW5lLCBwb3B1bGF0aW9uLCBzYW1wbGVTaXplKTtcbiAgfTtcblxuICBSYW5kb20uZGllID0gZnVuY3Rpb24gKHNpZGVDb3VudCkge1xuICAgIHJldHVybiBSYW5kb20uaW50ZWdlcigxLCBzaWRlQ291bnQpO1xuICB9O1xuICBwcm90by5kaWUgPSBmdW5jdGlvbiAoc2lkZUNvdW50KSB7XG4gICAgcmV0dXJuIFJhbmRvbS5kaWUoc2lkZUNvdW50KSh0aGlzLmVuZ2luZSk7XG4gIH07XG5cbiAgUmFuZG9tLmRpY2UgPSBmdW5jdGlvbiAoc2lkZUNvdW50LCBkaWVDb3VudCkge1xuICAgIHZhciBkaXN0cmlidXRpb24gPSBSYW5kb20uZGllKHNpZGVDb3VudCk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChlbmdpbmUpIHtcbiAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgIHJlc3VsdC5sZW5ndGggPSBkaWVDb3VudDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGllQ291bnQ7ICsraSkge1xuICAgICAgICByZXN1bHRbaV0gPSBkaXN0cmlidXRpb24oZW5naW5lKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcbiAgcHJvdG8uZGljZSA9IGZ1bmN0aW9uIChzaWRlQ291bnQsIGRpZUNvdW50KSB7XG4gICAgcmV0dXJuIFJhbmRvbS5kaWNlKHNpZGVDb3VudCwgZGllQ291bnQpKHRoaXMuZW5naW5lKTtcbiAgfTtcblxuICAvLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1VuaXZlcnNhbGx5X3VuaXF1ZV9pZGVudGlmaWVyXG4gIFJhbmRvbS51dWlkNCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gemVyb1BhZChzdHJpbmcsIHplcm9Db3VudCkge1xuICAgICAgcmV0dXJuIHN0cmluZ1JlcGVhdChcIjBcIiwgemVyb0NvdW50IC0gc3RyaW5nLmxlbmd0aCkgKyBzdHJpbmc7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChlbmdpbmUpIHtcbiAgICAgIHZhciBhID0gZW5naW5lKCkgPj4+IDA7XG4gICAgICB2YXIgYiA9IGVuZ2luZSgpIHwgMDtcbiAgICAgIHZhciBjID0gZW5naW5lKCkgfCAwO1xuICAgICAgdmFyIGQgPSBlbmdpbmUoKSA+Pj4gMDtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgemVyb1BhZChhLnRvU3RyaW5nKDE2KSwgOCkgK1xuICAgICAgICBcIi1cIiArXG4gICAgICAgIHplcm9QYWQoKGIgJiAweGZmZmYpLnRvU3RyaW5nKDE2KSwgNCkgK1xuICAgICAgICBcIi1cIiArXG4gICAgICAgIHplcm9QYWQoKCgoYiA+PiA0KSAmIDB4MGZmZikgfCAweDQwMDApLnRvU3RyaW5nKDE2KSwgNCkgK1xuICAgICAgICBcIi1cIiArXG4gICAgICAgIHplcm9QYWQoKChjICYgMHgzZmZmKSB8IDB4ODAwMCkudG9TdHJpbmcoMTYpLCA0KSArXG4gICAgICAgIFwiLVwiICtcbiAgICAgICAgemVyb1BhZCgoKGMgPj4gNCkgJiAweGZmZmYpLnRvU3RyaW5nKDE2KSwgNCkgK1xuICAgICAgICB6ZXJvUGFkKGQudG9TdHJpbmcoMTYpLCA4KSk7XG4gICAgfTtcbiAgfSgpKTtcbiAgcHJvdG8udXVpZDQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFJhbmRvbS51dWlkNCh0aGlzLmVuZ2luZSk7XG4gIH07XG5cbiAgUmFuZG9tLnN0cmluZyA9IChmdW5jdGlvbiAoKSB7XG4gICAgLy8gaGFzIDIqKnggY2hhcnMsIGZvciBmYXN0ZXIgdW5pZm9ybSBkaXN0cmlidXRpb25cbiAgICB2YXIgREVGQVVMVF9TVFJJTkdfUE9PTCA9IFwiYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWjAxMjM0NTY3ODlfLVwiO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChwb29sKSB7XG4gICAgICBpZiAocG9vbCA9PSBudWxsKSB7XG4gICAgICAgIHBvb2wgPSBERUZBVUxUX1NUUklOR19QT09MO1xuICAgICAgfVxuXG4gICAgICB2YXIgbGVuZ3RoID0gcG9vbC5sZW5ndGg7XG4gICAgICBpZiAoIWxlbmd0aCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCBwb29sIG5vdCB0byBiZSBhbiBlbXB0eSBzdHJpbmdcIik7XG4gICAgICB9XG5cbiAgICAgIHZhciBkaXN0cmlidXRpb24gPSBSYW5kb20uaW50ZWdlcigwLCBsZW5ndGggLSAxKTtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZW5naW5lLCBsZW5ndGgpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFwiXCI7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICB2YXIgaiA9IGRpc3RyaWJ1dGlvbihlbmdpbmUpO1xuICAgICAgICAgIHJlc3VsdCArPSBwb29sLmNoYXJBdChqKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfTtcbiAgICB9O1xuICB9KCkpO1xuICBwcm90by5zdHJpbmcgPSBmdW5jdGlvbiAobGVuZ3RoLCBwb29sKSB7XG4gICAgcmV0dXJuIFJhbmRvbS5zdHJpbmcocG9vbCkodGhpcy5lbmdpbmUsIGxlbmd0aCk7XG4gIH07XG5cbiAgUmFuZG9tLmhleCA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIExPV0VSX0hFWF9QT09MID0gXCIwMTIzNDU2Nzg5YWJjZGVmXCI7XG4gICAgdmFyIGxvd2VySGV4ID0gUmFuZG9tLnN0cmluZyhMT1dFUl9IRVhfUE9PTCk7XG4gICAgdmFyIHVwcGVySGV4ID0gUmFuZG9tLnN0cmluZyhMT1dFUl9IRVhfUE9PTC50b1VwcGVyQ2FzZSgpKTtcblxuICAgIHJldHVybiBmdW5jdGlvbiAodXBwZXIpIHtcbiAgICAgIGlmICh1cHBlcikge1xuICAgICAgICByZXR1cm4gdXBwZXJIZXg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbG93ZXJIZXg7XG4gICAgICB9XG4gICAgfTtcbiAgfSgpKTtcbiAgcHJvdG8uaGV4ID0gZnVuY3Rpb24gKGxlbmd0aCwgdXBwZXIpIHtcbiAgICByZXR1cm4gUmFuZG9tLmhleCh1cHBlcikodGhpcy5lbmdpbmUsIGxlbmd0aCk7XG4gIH07XG5cbiAgUmFuZG9tLmRhdGUgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICAgIGlmICghKHN0YXJ0IGluc3RhbmNlb2YgRGF0ZSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJFeHBlY3RlZCBzdGFydCB0byBiZSBhIERhdGUsIGdvdCBcIiArIHR5cGVvZiBzdGFydCk7XG4gICAgfSBlbHNlIGlmICghKGVuZCBpbnN0YW5jZW9mIERhdGUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRXhwZWN0ZWQgZW5kIHRvIGJlIGEgRGF0ZSwgZ290IFwiICsgdHlwZW9mIGVuZCk7XG4gICAgfVxuICAgIHZhciBkaXN0cmlidXRpb24gPSBSYW5kb20uaW50ZWdlcihzdGFydC5nZXRUaW1lKCksIGVuZC5nZXRUaW1lKCkpO1xuICAgIHJldHVybiBmdW5jdGlvbiAoZW5naW5lKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUoZGlzdHJpYnV0aW9uKGVuZ2luZSkpO1xuICAgIH07XG4gIH07XG4gIHByb3RvLmRhdGUgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICAgIHJldHVybiBSYW5kb20uZGF0ZShzdGFydCwgZW5kKSh0aGlzLmVuZ2luZSk7XG4gIH07XG5cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBSYW5kb207XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgcmVxdWlyZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBSYW5kb207XG4gIH0gZWxzZSB7XG4gICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBvbGRHbG9iYWwgPSByb290W0dMT0JBTF9LRVldO1xuICAgICAgUmFuZG9tLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJvb3RbR0xPQkFMX0tFWV0gPSBvbGRHbG9iYWw7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcbiAgICB9KCkpO1xuICAgIHJvb3RbR0xPQkFMX0tFWV0gPSBSYW5kb207XG4gIH1cbn0odGhpcykpOyIsInZhciBzdGF0cyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ByZScpLFxuICAgIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLFxuICAgIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbigpe1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2FudmFzKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN0YXRzKTtcbn0pO1xuXG52YXIgcmVuZGVySGVpZ2h0ID0gNjA7XG52YXIgcmVuZGVyV2lkdGggPSAxMTAwO1xuY2FudmFzLmhlaWdodCA9IHJlbmRlckhlaWdodDtcbmNhbnZhcy53aWR0aCA9IHJlbmRlcldpZHRoO1xuXG52YXIgbGFzdEJlc3RCdWcgPSBudWxsLFxuICAgIGxhc3RCZXN0QnVnSlNPTjtcblxuZnVuY3Rpb24gZ2V0QmVzdEJ1Z0pTT04oYmVzdEJ1Zyl7XG4gICAgaWYobGFzdEJlc3RCdWcgPT09IGJlc3RCdWcpe1xuICAgICAgICByZXR1cm4gbGFzdEJlc3RCdWdKU09OO1xuICAgIH1cblxuICAgIGxhc3RCZXN0QnVnID0gYmVzdEJ1ZztcblxuICAgIHJldHVybiBsYXN0QmVzdEJ1Z0pTT04gPSBKU09OLnN0cmluZ2lmeShiZXN0QnVnLm5ldXJvbnMubWFwKGZ1bmN0aW9uKG5ldXJvbil7XG4gICAgICAgIHJldHVybiBuZXVyb24uc2V0dGluZ3M7XG4gICAgfSksIG51bGwsIDQpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdGF0ZSl7XG4gICAgdmFyIGN1cnJlbnRCZXN0QnVnID0gc3RhdGUuYnVncy5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBidWcpe1xuICAgICAgICByZXR1cm4gYnVnLmFnZSA+IHJlc3VsdC5hZ2UgPyBidWcgOiByZXN1bHQ7XG4gICAgfSwgc3RhdGUuYnVnc1swXSk7XG5cbiAgICB2YXIgY3VycmVudExpbmVhZ2VzID0gc3RhdGUuYnVncy5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBidWcpe1xuICAgICAgICBpZiAocmVzdWx0LmluZGV4T2YoYnVnLnBhdGVybmFsTGluZWFnZSkgPT09IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChidWcucGF0ZXJuYWxMaW5lYWdlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgW10pO1xuXG4gICAgc3RhdHMudGV4dENvbnRlbnQgPSBbXG4gICAgICAgICdUaWNrczogJyArIHN0YXRlLnRpY2tzLFxuICAgICAgICAnSXR0ZXJhdGlvbnMgUGVyIDUwbXMgcnVuOiAnICsgc3RhdGUuaXR0ZXJhdGlvbnNQZXI1MCxcbiAgICAgICAgJ0J1Z3M6ICcgKyBzdGF0ZS5idWdzLmxlbmd0aCxcbiAgICAgICAgJ01heCBDdXJyZW50IEFnZTogJyArIChjdXJyZW50QmVzdEJ1ZyA/IGN1cnJlbnRCZXN0QnVnLmFnZSA6ICdOb3RoaW5nIGFsaXZlJyksXG4gICAgICAgICdDdXJyZW50IEJlc3QgQnVnIExpbmVhZ2U6ICcgKyAoY3VycmVudEJlc3RCdWcgPyBgJHsgY3VycmVudEJlc3RCdWcucGF0ZXJuYWxMaW5lYWdlLmlkIH0gKGFnZTogJHtzdGF0ZS50aWNrcyAtIGN1cnJlbnRCZXN0QnVnLnBhdGVybmFsTGluZWFnZS50aWNrfSlgIDogJ05vbmUnKSxcbiAgICAgICAgJ0N1cnJlbnQgTGluZWFnZXM6ICcsXG4gICAgICAgIC4uLmN1cnJlbnRMaW5lYWdlcy5tYXAoZnVuY3Rpb24obGluZWFnZSl7IHJldHVybiBgJHsgbGluZWFnZS5pZCB9IChhZ2U6ICR7c3RhdGUudGlja3MgLSBsaW5lYWdlLnRpY2t9KWA7IH0pLFxuICAgICAgICAnTWF4IEFnZTogJyArIHN0YXRlLmJlc3RCdWcuYWdlLFxuICAgICAgICAnQmVzdCBCdWdzIEJyYWluOiAnICsgZ2V0QmVzdEJ1Z0pTT04oc3RhdGUuYmVzdEJ1ZylcbiAgICBdLmpvaW4oJ1xcbicpO1xuICAgIGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHJlbmRlcldpZHRoLCByZW5kZXJIZWlnaHQpO1xuXG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcblxuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJyMwMDAwMDAnO1xuXG4gICAgc3RhdGUubWFwLm1hcChmdW5jdGlvbihkb3QsIGluZGV4KXtcbiAgICAgICAgaWYoZG90KXtcbiAgICAgICAgICAgIGNvbnRleHQuZmlsbFJlY3QoaW5kZXggKiAxMCwgcmVuZGVySGVpZ2h0IC0gMTAsIDEwLCAxMCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJyNGRjAwMDAnO1xuXG4gICAgc3RhdGUuYnVncy5tYXAoZnVuY3Rpb24oYnVnKXtcbiAgICAgICAgY29udGV4dC5maWxsUmVjdChidWcuZGlzdGFuY2UsIHJlbmRlckhlaWdodCAtIDEwIC0gKGJ1Zy5oZWlnaHQgKiAxMCksIDEwLCAxMCk7XG4gICAgfSk7XG5cbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICdoc2xhKCcgKyAoc3RhdGUuYmVzdEJ1Zy5hZ2UgLyAyMCkudG9TdHJpbmcoKSArICcsIDEwMCUsIDMwJSwgMC4zKSc7XG4gICAgY29udGV4dC5maWxsUmVjdChzdGF0ZS5iZXN0QnVnLmRpc3RhbmNlLCByZW5kZXJIZWlnaHQgLSAxMCAtIChzdGF0ZS5iZXN0QnVnLmhlaWdodCAqIDEwKSwgMTAsIDEwKTtcblxuICAgIGlmKGN1cnJlbnRCZXN0QnVnKXtcbiAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAnaHNsKCcgKyAoY3VycmVudEJlc3RCdWcuYWdlIC8gMjApLnRvU3RyaW5nKCkgKyAnLCAxMDAlLCAzMCUpJztcbiAgICAgICAgY29udGV4dC5maWxsUmVjdChjdXJyZW50QmVzdEJ1Zy5kaXN0YW5jZSwgcmVuZGVySGVpZ2h0IC0gMTAgLSAoY3VycmVudEJlc3RCdWcuaGVpZ2h0ICogMTApLCAxMCwgMTApO1xuICAgIH1cblxuICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG59OyIsInZhciBuZXVyYWwgPSByZXF1aXJlKCcuL25ldXJhbCcpO1xudmFyIHNpbVNldHRpbmdzID0geyByZWFsdGltZTogZmFsc2UsIG5ldXJvbkNvdW50OiAyMCB9O1xudmFyIGlucHV0ID0gcmVxdWlyZSgnLi9pbnB1dCcpKHNpbVNldHRpbmdzKTtcbnZhciBSYW5kb20gPSByZXF1aXJlKFwicmFuZG9tLWpzXCIpO1xuXG5cbnZhciBwcmV2aW91c05ldXJvblNldHRpbmdzID0gW107XG5cbnZhciBpbnB1dHMgPSB7XG4gICAgYWdlOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5hZ2U7XG4gICAgfSxcbiAgICBoZWlnaHQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmhlaWdodDtcbiAgICB9LFxuICAgIGVuZXJneTogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZW5lcmd5O1xuICAgIH1cbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZUV5ZUlucHV0KGluZGV4KXtcbiAgICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZG90UG9zaXRpb25zW2luZGV4XSA/IDEgOiAwO1xuICAgIH07XG59XG5cbmZvcih2YXIgaSA9IDA7IGkgPCAyMDsgaSsrKXtcbiAgICBpbnB1dHNbJ25leHQnICsgaV0gPSBjcmVhdGVFeWVJbnB1dChpKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ29ubmVjdGlvbnMobWF4Q29ubmVjdGlvbnMsIG1heEluZGV4KXtcbiAgICB2YXIgcmVzdWx0ID0gW107XG5cbiAgICB2YXIgY29ubmVjdGlvbnMgPSBNYXRoLm1heChwYXJzZUludCgoTWF0aC5yYW5kb20oKSAqIG1heENvbm5lY3Rpb25zKSAlIG1heENvbm5lY3Rpb25zKSwgMSk7XG5cbiAgICB3aGlsZShjb25uZWN0aW9ucy0tKXtcbiAgICAgICAgcmVzdWx0LnB1c2gocGFyc2VJbnQoTWF0aC5yYW5kb20oKSAqIG1heEluZGV4KSAlIG1heEluZGV4KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG52YXIgbWV0aG9kcyA9IG5ldXJhbC5tZXRob2RzO1xuXG5mdW5jdGlvbiByYW5kb21OZXVyb25zKCl7XG4gICAgdmFyIG5ldXJvbnMgPSBbXTtcbiAgICBmb3IodmFyIGogPSAwOyBqIDwgc2ltU2V0dGluZ3MubmV1cm9uQ291bnQ7IGorKyl7XG4gICAgICAgIHZhciBtZXRob2RJbmRleCA9IHBhcnNlSW50KE1hdGgucmFuZG9tKCkgKiBtZXRob2RzLmxlbmd0aCkgJSBtZXRob2RzLmxlbmd0aDtcbiAgICAgICAgbmV1cm9ucy5wdXNoKHtcbiAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kc1ttZXRob2RJbmRleF0sXG4gICAgICAgICAgICBtb2RpZmllcjogTWF0aC5yYW5kb20oKSxcbiAgICAgICAgICAgIGlucHV0SW5kaWNpZXM6IGNyZWF0ZUNvbm5lY3Rpb25zKDUsIGogKyBPYmplY3Qua2V5cyhpbnB1dHMpLmxlbmd0aClcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldXJvbnM7XG59XG5cbmZvcih2YXIgaSA9IDA7IGkgPCBzaW1TZXR0aW5ncy5uZXVyb25Db3VudDsgaSsrKXtcbiAgICBwcmV2aW91c05ldXJvblNldHRpbmdzLnB1c2gocmFuZG9tTmV1cm9ucygpKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQnVnKHByZXZpb3VzTmV1cm9uU2V0dGluZ3MsIHBhdGVybmFsTGluZWFnZSwgdGljayl7XG4gICAgdmFyIGJ1ZyA9IG5ldXJhbCh7XG4gICAgICAgIG11dGF0aW9uOiAwLjAwMDUsXG4gICAgICAgIGlucHV0czogaW5wdXRzLFxuICAgICAgICBvdXRwdXRzOiB7XG4gICAgICAgICAgICB0aHJ1c3RYOiB0cnVlLFxuICAgICAgICAgICAgdGhydXN0WTogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBwcmV2aW91c05ldXJvblNldHRpbmdzOiBwcmV2aW91c05ldXJvblNldHRpbmdzXG4gICAgfSk7XG5cbiAgICBidWcuYWdlID0gMDtcbiAgICBidWcuZW5lcmd5ID0gMTtcbiAgICBidWcuaGVpZ2h0ID0gMDtcbiAgICBidWcudGhydXN0WCA9IDA7XG4gICAgYnVnLnRocnVzdFkgPSAwO1xuICAgIGJ1Zy5kaXN0YW5jZSA9IDA7XG4gICAgYnVnLmRpc3RGcm9tRG90ID0gLTE7XG4gICAgYnVnLnBhdGVybmFsTGluZWFnZSA9IHBhdGVybmFsTGluZWFnZSB8fCB7aWQ6IFJhbmRvbS51dWlkNChSYW5kb20uZW5naW5lcy5icm93c2VyQ3J5cHRvKSwgdGljazogdGlja307XG5cbiAgICByZXR1cm4gYnVnO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDaGlsZChidWcpe1xuICAgIHJldHVybiBjcmVhdGVCdWcoYnVnLm5ldXJvbnMubWFwKGZ1bmN0aW9uKG5ldXJvbil7XG4gICAgICAgIHJldHVybiBuZXVyb24uc2V0dGluZ3M7XG4gICAgfSksIGJ1Zy5wYXRlcm5hbExpbmVhZ2UpO1xufVxuXG5mdW5jdGlvbiBzcGF3bkNoaWxkRnJvbVNleChwYXJlbnRPbmUsIHBhcmVudFR3bywgdGljayl7XG4gICAgaWYgKHBhcmVudE9uZS5uZXVyb25zLmxlbmd0aCAhPT0gc2ltU2V0dGluZ3MubmV1cm9uQ291bnQgfHwgcGFyZW50VHdvLm5ldXJvbnMubGVuZ3RoICE9PSBzaW1TZXR0aW5ncy5uZXVyb25Db3VudCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG5ld0NoaWxkU2V0dGluZ3MgPSBbXTtcbiAgICB2YXIgcGFyZW50T25lQ29udHJpYnV0aW9uID0gWy4uLkFycmF5KHBhcmVudE9uZS5uZXVyb25zLmxlbmd0aCkua2V5cygpXTtcbiAgICB2YXIgcGFyZW50VHdvQ29udHJpYnV0aW9uID0gW107XG5cbiAgICBSYW5kb20uc2h1ZmZsZShSYW5kb20uZW5naW5lcy5icm93c2VyQ3J5cHRvLCBwYXJlbnRPbmUpO1xuXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IChzaW1TZXR0aW5ncy5uZXVyb25Db3VudCAvIDIpOyBpKyspe1xuICAgICAgICBwYXJlbnRUd29Db250cmlidXRpb24ucHVzaChwYXJlbnRPbmVDb250cmlidXRpb24ucG9wKCkpO1xuICAgIH1cblxuICAgIGZvcih2YXIgaiA9IDA7IGogPCBzaW1TZXR0aW5ncy5uZXVyb25Db3VudDsgaisrKXtcbiAgICAgICAgaWYgKHBhcmVudE9uZUNvbnRyaWJ1dGlvbi5pbmRleE9mKGopID4gLTEpIHtcbiAgICAgICAgICAgIG5ld0NoaWxkU2V0dGluZ3MucHVzaChwYXJlbnRPbmUubmV1cm9uc1tqXS5zZXR0aW5ncyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXdDaGlsZFNldHRpbmdzLnB1c2gocGFyZW50VHdvLm5ldXJvbnNbal0uc2V0dGluZ3MpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIG5ld0J1ZyA9IGNyZWF0ZUJ1ZyhuZXdDaGlsZFNldHRpbmdzLCBwYXJlbnRPbmUucGF0ZXJuYWxMaW5lYWdlLCB0aWNrKTtcblxuICAgIHJldHVybiBuZXdCdWc7XG59XG5cbmZ1bmN0aW9uIGZpbmRBQnVnQVBhcnRuZXIoc3VpdG9yLCBidWdzKXtcbiAgICAvL2ZpbmQgbWUgYSByYW5kb20gYnVnIHRoYXQgaXNuJ3QgYmVzdCBidWc/XG4gICAgdmFyIGNvbGxlY3Rpb24gPSBidWdzLnJlZHVjZSgoYWNjdW11bGF0b3IsIGN1cnJlbnRCdWcsIGN1cnJlbnRJbmRleCkgPT4ge1xuICAgICAgICBpZiAoY3VycmVudEJ1Zy5hZ2UgIT09IHN1aXRvci5hZ2UgJiYgY3VycmVudEJ1Zy5uZXVyb25zLmxlbmd0aCA9PT0gc3VpdG9yLm5ldXJvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBhY2N1bXVsYXRvci5wdXNoKGN1cnJlbnRJbmRleCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYWNjdW11bGF0b3I7XG4gICAgfSxbXSk7XG5cbiAgICByZXR1cm4gYnVnc1tSYW5kb20uc2h1ZmZsZShSYW5kb20uZW5naW5lcy5icm93c2VyQ3J5cHRvLGNvbGxlY3Rpb24pWzBdXTtcbn1cblxudmFyIG1hcCA9IFtdO1xuXG5mb3IodmFyIGkgPSAwOyBpIDwgMTIwOyBpKyspe1xuICAgIG1hcC5wdXNoKGZhbHNlKTtcbn1cblxudmFyIGJ1Z3MgPSBbXTtcblxudmFyIHJlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXInKTtcblxudmFyIHRpY2tzID0gMDtcbnZhciBsb29waW5nO1xudmFyIGJlc3RCdWc7XG52YXIgaXR0ZXJhdGlvbnNQZXI1MCA9IDA7XG5mdW5jdGlvbiBnYW1lTG9vcCgpe1xuICAgIHRpY2tzKys7XG4gICAgaWYoYnVncy5sZW5ndGggPCAyMCl7XG4gICAgICAgIHZhciBuZXdCdWc7XG5cbiAgICAgICAgaWYoYmVzdEJ1ZyAmJiBNYXRoLnJhbmRvbSgpID4gMC41ICYmIGJ1Z3MubGVuZ3RoID4gMSl7XG4gICAgICAgICAgICBuZXdCdWcgPSBzcGF3bkNoaWxkRnJvbVNleChiZXN0QnVnLCBmaW5kQUJ1Z0FQYXJ0bmVyKGJlc3RCdWcsIGJ1Z3MpLCB0aWNrcyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW5ld0J1Zykge1xuICAgICAgICAgICAgbmV3QnVnID0gY3JlYXRlQnVnKHJhbmRvbU5ldXJvbnMoKSwgbnVsbCwgdGlja3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgYnVncy5wdXNoKG5ld0J1Zyk7XG4gICAgfVxuXG4gICAgbWFwLnNoaWZ0KCk7XG4gICAgbWFwLnB1c2gobWFwLnNsaWNlKC0xMCkuc29tZSh4ID0+IHgpID8gZmFsc2UgOiBNYXRoLnJhbmRvbSgpIDwgYnVncy5sZW5ndGggLyAyMDAwKTtcblxuICAgIHZhciBzdXJ2aXZvcnMgPSBbXTtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgYnVncy5sZW5ndGg7IGkrKyl7XG4gICAgICAgIHZhciBidWcgPSBidWdzW2ldO1xuICAgICAgICBidWcuYWdlKys7XG4gICAgICAgIGJ1Zy5kaXN0YW5jZSArPSBidWcudGhydXN0WCArIDE7XG5cbiAgICAgICAgaWYoIWJlc3RCdWcgfHwgYnVnLmFnZSA+IGJlc3RCdWcuYWdlKXtcbiAgICAgICAgICAgIHNpbVNldHRpbmdzLnJlYWx0aW1lID0gdHJ1ZTtcbiAgICAgICAgICAgIGJlc3RCdWcgPSBidWc7XG4gICAgICAgIH1cblxuICAgICAgICBpZihidWcuZGlzdGFuY2UgPiA5OTkpe1xuICAgICAgICAgICAgYnVnLmRpc3RhbmNlID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGJ1Zy5hZ2UgJiYgIShidWcuYWdlICUgMTExKSAmJiBidWcuYWdlID4gMzAwKXtcbiAgICAgICAgICAgIHZhciBwYXJ0bmVyID0gZmluZEFCdWdBUGFydG5lcihiZXN0QnVnLCBidWdzKSB8fCBjcmVhdGVCdWcocmFuZG9tTmV1cm9ucygpLCBudWxsLCB0aWNrcyk7XG5cbiAgICAgICAgICAgIGJ1Z3MucHVzaChzcGF3bkNoaWxkRnJvbVNleChiZXN0QnVnLCBwYXJ0bmVyKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL29uIGRvdCwgZGllXG4gICAgICAgIGlmKGJ1Zy5kaXN0YW5jZSA+IDEwMCAmJiBidWcuaGVpZ2h0IDwgMSAmJiBidWcub25Eb3Qpe1xuICAgICAgICAgICAgaWYoYnVnID09PSBiZXN0QnVnKXtcbiAgICAgICAgICAgICAgICBzaW1TZXR0aW5ncy5yZWFsdGltZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBzdXJ2aXZvcnMucHVzaChidWcpO1xuXG4gICAgICAgIC8vZmFsbFxuICAgICAgICBidWcuaGVpZ2h0ICs9IGJ1Zy50aHJ1c3RZICogMjtcbiAgICAgICAgYnVnLmhlaWdodCA9IE1hdGgubWF4KDAsIGJ1Zy5oZWlnaHQgLT0gMC41KTtcbiAgICAgICAgdmFyIG1hcFBvc2l0aW9uID0gcGFyc2VJbnQoYnVnLmRpc3RhbmNlIC8gMTApO1xuICAgICAgICBidWcuZG90UG9zaXRpb25zID0gbWFwLnNsaWNlKG1hcFBvc2l0aW9uLCBtYXBQb3NpdGlvbiArIDIwKTtcbiAgICAgICAgYnVnLm9uRG90ID0gYnVnLmRvdFBvc2l0aW9uc1swXTtcblxuICAgICAgICBpZighYnVnLmhlaWdodCl7XG4gICAgICAgICAgICBpZihidWcuZW5lcmd5ID4gMC4yKXtcbiAgICAgICAgICAgICAgICB2YXIgdGhydXN0WSA9IGJ1Zy5vdXRwdXRzLnRocnVzdFkoKTtcbiAgICAgICAgICAgICAgICBidWcudGhydXN0WSArPSBNYXRoLm1pbih0aHJ1c3RZLCBidWcuZW5lcmd5KTtcbiAgICAgICAgICAgICAgICBidWcuZW5lcmd5ID0gTWF0aC5tYXgoMCwgYnVnLmVuZXJneSAtIGJ1Zy50aHJ1c3RZKTtcblxuICAgICAgICAgICAgICAgIHZhciB0aHJ1c3RYID0gYnVnLm91dHB1dHMudGhydXN0WCgpO1xuICAgICAgICAgICAgICAgIGJ1Zy50aHJ1c3RYICs9IE1hdGgubWluKHRocnVzdFgsIGJ1Zy5lbmVyZ3kpO1xuICAgICAgICAgICAgICAgIGJ1Zy5lbmVyZ3kgPSBNYXRoLm1heCgwLCBidWcuZW5lcmd5IC0gYnVnLnRocnVzdFgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnVnLmVuZXJneSA9IE1hdGgubWluKDEsIGJ1Zy5lbmVyZ3kgKyAwLjEpO1xuICAgICAgICB9XG4gICAgICAgIGlmKGJ1Zy50aHJ1c3RZID4gMCl7XG4gICAgICAgICAgICBidWcudGhydXN0WSAtPSAwLjE7XG4gICAgICAgIH1cbiAgICAgICAgaWYoYnVnLnRocnVzdFggPiAwLjEgfHwgYnVnLnRocnVzdFggPCAtMC4xKXtcbiAgICAgICAgICAgIGJ1Zy50aHJ1c3RYICo9IDAuOTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGJ1Z3MgPSBzdXJ2aXZvcnM7XG5cbiAgICBpZihsb29waW5nKXtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmKCFzaW1TZXR0aW5ncy5yZWFsdGltZSl7XG4gICAgICAgIGxvb3BpbmcgPSB0cnVlO1xuICAgICAgICB2YXIgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgICAgICBpdHRlcmF0aW9uc1BlcjUwID0gMDtcbiAgICAgICAgd2hpbGUoRGF0ZS5ub3coKSAtIHN0YXJ0IDwgNTApe1xuICAgICAgICAgICAgaXR0ZXJhdGlvbnNQZXI1MCsrO1xuICAgICAgICAgICAgZ2FtZUxvb3AoKTtcbiAgICAgICAgICAgIGlmKHNpbVNldHRpbmdzLnJlYWx0aW1lKXtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsb29waW5nID0gZmFsc2U7XG4gICAgICAgIHNldFRpbWVvdXQoZ2FtZUxvb3AsIDApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2V0VGltZW91dChnYW1lTG9vcCwgMzApO1xuXG59XG5cbmZ1bmN0aW9uIHJlbmRlcigpe1xuICAgIHJlbmRlcmVyKHsgdGlja3MsIGJ1Z3MsIG1hcCwgYmVzdEJ1ZywgaXR0ZXJhdGlvbnNQZXI1MCB9KTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcbn1cblxuZ2FtZUxvb3AoKTtcblxucmVuZGVyKCk7XG5cbiJdfQ==
