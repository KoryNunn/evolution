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
        if(bestBug && Math.random() > 0.5 && bugs.length > 1 && bugs.some((bug) => { return bug.neurons.length === simSettings.neuronCount; })){
            newBug = spawnChildFromSex(bestBug, findABugAPartner(bestBug, bugs), ticks);
        } else {
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
            if (bugs.length > 1) {
                bugs.push(spawnChildFromSex(bestBug, findABugAPartner(bestBug, bugs)));

                bugs = bugs.filter((bug) => {return bug});
            }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbnB1dC5qcyIsIm5ldXJhbC5qcyIsIm5vZGVfbW9kdWxlcy9jcmVsL2NyZWwuanMiLCJub2RlX21vZHVsZXMvcmFuZG9tLWpzL2xpYi9yYW5kb20uanMiLCJyZW5kZXIuanMiLCJ0ZXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInZhciBjcmVsID0gcmVxdWlyZSgnY3JlbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNpbVNldHRpbmdzKXtcbiAgICB2YXIgdG9nZ2xlO1xuICAgIHZhciBtZW51ID0gY3JlbCgnZGl2JyxcbiAgICAgICAgICAgICdOZXVyb25zIGZvciBuZXcgYnVnczogJyxcbiAgICAgICAgICAgIG5ldXJvbnMgPSBjcmVsKCdpbnB1dCcsIHsgdHlwZTogJ251bWJlcicsIHZhbHVlOiBzaW1TZXR0aW5ncy5uZXVyb25Db3VudCB9KSxcbiAgICAgICAgICAgIHRvZ2dsZSA9IGNyZWwoJ2J1dHRvbicpXG4gICAgICAgICk7XG5cbiAgICBuZXVyb25zLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBjb3VudCA9IHBhcnNlSW50KG5ldXJvbnMudmFsdWUpO1xuICAgICAgICBjb3VudCA9IE1hdGgubWF4KDEwLCBjb3VudCk7XG4gICAgICAgIGlmKGNvdW50ICE9PSBuZXVyb25zLnZhbHVlKXtcbiAgICAgICAgICAgIG5ldXJvbnMudmFsdWUgPSBjb3VudDtcbiAgICAgICAgfVxuICAgICAgICBzaW1TZXR0aW5ncy5uZXVyb25Db3VudCA9IGNvdW50O1xuICAgIH0pO1xuXG4gICAgdG9nZ2xlLnRleHRDb250ZW50ID0gJ1JlYWx0aW1lJztcblxuICAgIHRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHNpbVNldHRpbmdzLnJlYWx0aW1lID0gIXNpbVNldHRpbmdzLnJlYWx0aW1lO1xuICAgIH0pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbigpe1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1lbnUpO1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gcnVuKCl7XG4gICAgICAgIHRvZ2dsZS50ZXh0Q29udGVudCA9IHNpbVNldHRpbmdzLnJlYWx0aW1lID8gJ1JlYWwgVGltZScgOiAnSHlwZXJzcGVlZCc7XG5cbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJ1bik7XG4gICAgfVxuXG4gICAgcnVuKCk7XG59OyIsInZhciBtZXRob2RzID0ge1xuICAgIG11bHRpcGx5OiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIGEgKiBiO1xuICAgIH0sXG4gICAgZGl2aWRlOiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIGEgLyBiO1xuICAgIH0sXG4gICAgYWRkOiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIGEgKyBiO1xuICAgIH0sXG4gICAgc3VidHJhY3Q6IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gYSAtIGI7XG4gICAgfSxcbiAgICBwb3dlcjogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBNYXRoLnBvdyhhLCBiKTtcbiAgICB9LFxuICAgIG1vZDogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBhICUgYiAqIDEwO1xuICAgIH0sXG4gICAgaW52ZXJ0OiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIE1hdGguYWJzKGEgKiAtYik7XG4gICAgfSxcbiAgICBzaW46IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gTWF0aC5zaW4oTWF0aC5QSSAqIGEgLyBiKTtcbiAgICB9LFxuICAgIGNvczogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBNYXRoLmNvcyhNYXRoLlBJICogYSAvIGIpO1xuICAgIH0sXG4gICAgdGFuOiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIE1hdGgudGFuKE1hdGguUEkgKiBhIC8gYik7XG4gICAgfSxcbiAgICBsb2c6IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gTWF0aC5sb2coYSwgYik7XG4gICAgfVxufTtcblxuZnVuY3Rpb24gbWFrZU5ldXJvbihuZXVyb25zLCBzZXR0aW5ncyl7XG4gICAgdmFyIGlucHV0SW5kaWNpZXMgPSBzZXR0aW5ncy5pbnB1dEluZGljaWVzLnNsaWNlKCk7XG5cbiAgICB2YXIgbmV1cm9uID0gZnVuY3Rpb24oKXtcbiAgICAgICAgLy8gdmFyIHJlc3VsdCA9IE1hdGgucG93KGlucHV0SW5kaWNpZXMucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwgaW5kZXgpe1xuICAgICAgICAvLyAgICAgcmV0dXJuIHJlc3VsdCArIE1hdGgucG93KG5ldXJvbnNbaW5kZXhdKCksIDIpO1xuICAgICAgICAvLyB9LCAwKSwgMC41KTtcblxuICAgICAgICB2YXIgcmVzdWx0ID0gMDtcbiAgICAgICAgaWYoaW5wdXRJbmRpY2llcyl7XG4gICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgaW5wdXRJbmRpY2llcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IG5ldXJvbnNbaW5wdXRJbmRpY2llc1tpXV0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdCAvPSBpbnB1dEluZGljaWVzLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICAvLyB2YXIgcmVzdWx0ID0gaW5wdXRJbmRpY2llcyA/IGlucHV0SW5kaWNpZXMucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwgaW5kZXgpe1xuICAgICAgICAvLyAgICAgcmV0dXJuIHJlc3VsdCArIG5ldXJvbnNbaW5kZXhdKCk7XG4gICAgICAgIC8vIH0sIDApIC8gaW5wdXRJbmRpY2llcy5sZW5ndGggOiAwO1xuXG4gICAgICAgIHJlc3VsdCA9IG1ldGhvZHNbc2V0dGluZ3MubWV0aG9kXShyZXN1bHQsIHNldHRpbmdzLm1vZGlmaWVyKTtcblxuICAgICAgICByZXN1bHQgPSBNYXRoLm1pbigxLCByZXN1bHQpO1xuICAgICAgICByZXN1bHQgPSBNYXRoLm1heCgwLCByZXN1bHQpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICBuZXVyb24uc2V0dGluZ3MgPSBzZXR0aW5ncztcblxuICAgIHJldHVybiBuZXVyb247XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmV0d29ya1NldHRpbmdzKXtcbiAgICB2YXIgbmV0d29yayA9IHt9O1xuXG4gICAgdmFyIGlucHV0cyA9IG5ldHdvcmtTZXR0aW5ncy5pbnB1dHMsXG4gICAgICAgIG91dHB1dHMgPSBuZXR3b3JrU2V0dGluZ3Mub3V0cHV0cyxcbiAgICAgICAgcHJldmlvdXNOZXVyb25TZXR0aW5ncyA9IG5ldHdvcmtTZXR0aW5ncy5wcmV2aW91c05ldXJvblNldHRpbmdzLFxuICAgICAgICBpbnB1dE5ldXJvbnMgPSBPYmplY3Qua2V5cyhuZXR3b3JrU2V0dGluZ3MuaW5wdXRzKS5tYXAoZnVuY3Rpb24oa2V5KXtcbiAgICAgICAgICAgIHJldHVybiBuZXR3b3JrU2V0dGluZ3MuaW5wdXRzW2tleV0uYmluZChuZXR3b3JrKTtcbiAgICAgICAgfSksXG4gICAgICAgIG5ldXJvbnMgPSBpbnB1dE5ldXJvbnMuc2xpY2UoKTtcblxuICAgIHByZXZpb3VzTmV1cm9uU2V0dGluZ3MubWFwKGZ1bmN0aW9uKG5ldXJvblNldHRpbmdzKXtcbiAgICAgICAgdmFyIG5ld05ldXJvblNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogbmV1cm9uU2V0dGluZ3MubWV0aG9kLFxuICAgICAgICAgICAgICAgIGlucHV0SW5kaWNpZXM6IG5ldXJvblNldHRpbmdzLmlucHV0SW5kaWNpZXMsXG4gICAgICAgICAgICAgICAgbW9kaWZpZXI6IG5ldXJvblNldHRpbmdzLm1vZGlmaWVyICogKDEgKyAoTWF0aC5yYW5kb20oKSAqIChuZXR3b3JrU2V0dGluZ3MubXV0YXRpb24gKiAyKSAtIG5ldHdvcmtTZXR0aW5ncy5tdXRhdGlvbikpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIG5ldXJvbnMucHVzaChtYWtlTmV1cm9uKG5ldXJvbnMsIG5ld05ldXJvblNldHRpbmdzKSk7XG4gICAgfSk7XG5cbiAgICB2YXIgb3V0cHV0TmV1cm9ucyA9IG5ldXJvbnMuc2xpY2UoLSBPYmplY3Qua2V5cyhvdXRwdXRzKS5sZW5ndGgpO1xuXG4gICAgdmFyIGlucHV0TWFwID0gT2JqZWN0LmtleXMoaW5wdXRzKS5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBrZXkpe1xuICAgICAgICByZXN1bHRba2V5XSA9IGlucHV0TmV1cm9ucy5wb3AoKTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIHt9KTtcblxuICAgIHZhciBvdXRwdXRNYXAgPSBPYmplY3Qua2V5cyhvdXRwdXRzKS5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBrZXkpe1xuICAgICAgICByZXN1bHRba2V5XSA9IG91dHB1dE5ldXJvbnMucG9wKCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCB7fSk7XG5cbiAgICBuZXR3b3JrLmlucHV0cyA9IGlucHV0TWFwO1xuICAgIG5ldHdvcmsub3V0cHV0cyA9IG91dHB1dE1hcDtcbiAgICBuZXR3b3JrLm5ldXJvbnMgPSBuZXVyb25zLnNsaWNlKE9iamVjdC5rZXlzKGlucHV0cykubGVuZ3RoKTtcblxuICAgIHJldHVybiBuZXR3b3JrO1xufTtcbm1vZHVsZS5leHBvcnRzLm1ldGhvZHMgPSBPYmplY3Qua2V5cyhtZXRob2RzKTsiLCIvL0NvcHlyaWdodCAoQykgMjAxMiBLb3J5IE51bm5cclxuXHJcbi8vUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuXHJcbi8vVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcblxyXG4vL1RIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxyXG5cclxuLypcclxuXHJcbiAgICBUaGlzIGNvZGUgaXMgbm90IGZvcm1hdHRlZCBmb3IgcmVhZGFiaWxpdHksIGJ1dCByYXRoZXIgcnVuLXNwZWVkIGFuZCB0byBhc3Npc3QgY29tcGlsZXJzLlxyXG5cclxuICAgIEhvd2V2ZXIsIHRoZSBjb2RlJ3MgaW50ZW50aW9uIHNob3VsZCBiZSB0cmFuc3BhcmVudC5cclxuXHJcbiAgICAqKiogSUUgU1VQUE9SVCAqKipcclxuXHJcbiAgICBJZiB5b3UgcmVxdWlyZSB0aGlzIGxpYnJhcnkgdG8gd29yayBpbiBJRTcsIGFkZCB0aGUgZm9sbG93aW5nIGFmdGVyIGRlY2xhcmluZyBjcmVsLlxyXG5cclxuICAgIHZhciB0ZXN0RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXHJcbiAgICAgICAgdGVzdExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcclxuXHJcbiAgICB0ZXN0RGl2LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnYScpO1xyXG4gICAgdGVzdERpdlsnY2xhc3NOYW1lJ10gIT09ICdhJyA/IGNyZWwuYXR0ck1hcFsnY2xhc3MnXSA9ICdjbGFzc05hbWUnOnVuZGVmaW5lZDtcclxuICAgIHRlc3REaXYuc2V0QXR0cmlidXRlKCduYW1lJywnYScpO1xyXG4gICAgdGVzdERpdlsnbmFtZSddICE9PSAnYScgPyBjcmVsLmF0dHJNYXBbJ25hbWUnXSA9IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlKXtcclxuICAgICAgICBlbGVtZW50LmlkID0gdmFsdWU7XHJcbiAgICB9OnVuZGVmaW5lZDtcclxuXHJcblxyXG4gICAgdGVzdExhYmVsLnNldEF0dHJpYnV0ZSgnZm9yJywgJ2EnKTtcclxuICAgIHRlc3RMYWJlbFsnaHRtbEZvciddICE9PSAnYScgPyBjcmVsLmF0dHJNYXBbJ2ZvciddID0gJ2h0bWxGb3InOnVuZGVmaW5lZDtcclxuXHJcblxyXG5cclxuKi9cclxuXHJcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xyXG4gICAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuICAgICAgICBkZWZpbmUoZmFjdG9yeSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJvb3QuY3JlbCA9IGZhY3RvcnkoKTtcclxuICAgIH1cclxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZm4gPSAnZnVuY3Rpb24nLFxyXG4gICAgICAgIG9iaiA9ICdvYmplY3QnLFxyXG4gICAgICAgIG5vZGVUeXBlID0gJ25vZGVUeXBlJyxcclxuICAgICAgICB0ZXh0Q29udGVudCA9ICd0ZXh0Q29udGVudCcsXHJcbiAgICAgICAgc2V0QXR0cmlidXRlID0gJ3NldEF0dHJpYnV0ZScsXHJcbiAgICAgICAgYXR0ck1hcFN0cmluZyA9ICdhdHRyTWFwJyxcclxuICAgICAgICBpc05vZGVTdHJpbmcgPSAnaXNOb2RlJyxcclxuICAgICAgICBpc0VsZW1lbnRTdHJpbmcgPSAnaXNFbGVtZW50JyxcclxuICAgICAgICBkID0gdHlwZW9mIGRvY3VtZW50ID09PSBvYmogPyBkb2N1bWVudCA6IHt9LFxyXG4gICAgICAgIGlzVHlwZSA9IGZ1bmN0aW9uKGEsIHR5cGUpe1xyXG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIGEgPT09IHR5cGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpc05vZGUgPSB0eXBlb2YgTm9kZSA9PT0gZm4gPyBmdW5jdGlvbiAob2JqZWN0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBvYmplY3QgaW5zdGFuY2VvZiBOb2RlO1xyXG4gICAgICAgIH0gOlxyXG4gICAgICAgIC8vIGluIElFIDw9IDggTm9kZSBpcyBhbiBvYmplY3QsIG9idmlvdXNseS4uXHJcbiAgICAgICAgZnVuY3Rpb24ob2JqZWN0KXtcclxuICAgICAgICAgICAgcmV0dXJuIG9iamVjdCAmJlxyXG4gICAgICAgICAgICAgICAgaXNUeXBlKG9iamVjdCwgb2JqKSAmJlxyXG4gICAgICAgICAgICAgICAgKG5vZGVUeXBlIGluIG9iamVjdCkgJiZcclxuICAgICAgICAgICAgICAgIGlzVHlwZShvYmplY3Qub3duZXJEb2N1bWVudCxvYmopO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNFbGVtZW50ID0gZnVuY3Rpb24gKG9iamVjdCkge1xyXG4gICAgICAgICAgICByZXR1cm4gY3JlbFtpc05vZGVTdHJpbmddKG9iamVjdCkgJiYgb2JqZWN0W25vZGVUeXBlXSA9PT0gMTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzQXJyYXkgPSBmdW5jdGlvbihhKXtcclxuICAgICAgICAgICAgcmV0dXJuIGEgaW5zdGFuY2VvZiBBcnJheTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFwcGVuZENoaWxkID0gZnVuY3Rpb24oZWxlbWVudCwgY2hpbGQpIHtcclxuICAgICAgICAgICAgaWYgKGlzQXJyYXkoY2hpbGQpKSB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5tYXAoZnVuY3Rpb24oc3ViQ2hpbGQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGFwcGVuZENoaWxkKGVsZW1lbnQsIHN1YkNoaWxkKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKCFjcmVsW2lzTm9kZVN0cmluZ10oY2hpbGQpKXtcclxuICAgICAgICAgICAgICAgIGNoaWxkID0gZC5jcmVhdGVUZXh0Tm9kZShjaGlsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChjaGlsZCk7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgZnVuY3Rpb24gY3JlbCgpe1xyXG4gICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzLCAvL05vdGU6IGFzc2lnbmVkIHRvIGEgdmFyaWFibGUgdG8gYXNzaXN0IGNvbXBpbGVycy4gU2F2ZXMgYWJvdXQgNDAgYnl0ZXMgaW4gY2xvc3VyZSBjb21waWxlci4gSGFzIG5lZ2xpZ2FibGUgZWZmZWN0IG9uIHBlcmZvcm1hbmNlLlxyXG4gICAgICAgICAgICBlbGVtZW50ID0gYXJnc1swXSxcclxuICAgICAgICAgICAgY2hpbGQsXHJcbiAgICAgICAgICAgIHNldHRpbmdzID0gYXJnc1sxXSxcclxuICAgICAgICAgICAgY2hpbGRJbmRleCA9IDIsXHJcbiAgICAgICAgICAgIGFyZ3VtZW50c0xlbmd0aCA9IGFyZ3MubGVuZ3RoLFxyXG4gICAgICAgICAgICBhdHRyaWJ1dGVNYXAgPSBjcmVsW2F0dHJNYXBTdHJpbmddO1xyXG5cclxuICAgICAgICBlbGVtZW50ID0gY3JlbFtpc0VsZW1lbnRTdHJpbmddKGVsZW1lbnQpID8gZWxlbWVudCA6IGQuY3JlYXRlRWxlbWVudChlbGVtZW50KTtcclxuICAgICAgICAvLyBzaG9ydGN1dFxyXG4gICAgICAgIGlmKGFyZ3VtZW50c0xlbmd0aCA9PT0gMSl7XHJcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIWlzVHlwZShzZXR0aW5ncyxvYmopIHx8IGNyZWxbaXNOb2RlU3RyaW5nXShzZXR0aW5ncykgfHwgaXNBcnJheShzZXR0aW5ncykpIHtcclxuICAgICAgICAgICAgLS1jaGlsZEluZGV4O1xyXG4gICAgICAgICAgICBzZXR0aW5ncyA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzaG9ydGN1dCBpZiB0aGVyZSBpcyBvbmx5IG9uZSBjaGlsZCB0aGF0IGlzIGEgc3RyaW5nXHJcbiAgICAgICAgaWYoKGFyZ3VtZW50c0xlbmd0aCAtIGNoaWxkSW5kZXgpID09PSAxICYmIGlzVHlwZShhcmdzW2NoaWxkSW5kZXhdLCAnc3RyaW5nJykgJiYgZWxlbWVudFt0ZXh0Q29udGVudF0gIT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIGVsZW1lbnRbdGV4dENvbnRlbnRdID0gYXJnc1tjaGlsZEluZGV4XTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgZm9yKDsgY2hpbGRJbmRleCA8IGFyZ3VtZW50c0xlbmd0aDsgKytjaGlsZEluZGV4KXtcclxuICAgICAgICAgICAgICAgIGNoaWxkID0gYXJnc1tjaGlsZEluZGV4XTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihjaGlsZCA9PSBudWxsKXtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNBcnJheShjaGlsZCkpIHtcclxuICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaT0wOyBpIDwgY2hpbGQubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgICBhcHBlbmRDaGlsZChlbGVtZW50LCBjaGlsZFtpXSk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIGFwcGVuZENoaWxkKGVsZW1lbnQsIGNoaWxkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yKHZhciBrZXkgaW4gc2V0dGluZ3Mpe1xyXG4gICAgICAgICAgICBpZighYXR0cmlidXRlTWFwW2tleV0pe1xyXG4gICAgICAgICAgICAgICAgaWYoaXNUeXBlKHNldHRpbmdzW2tleV0sZm4pKXtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50W2tleV0gPSBzZXR0aW5nc1trZXldO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudFtzZXRBdHRyaWJ1dGVdKGtleSwgc2V0dGluZ3Nba2V5XSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdmFyIGF0dHIgPSBhdHRyaWJ1dGVNYXBba2V5XTtcclxuICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBhdHRyID09PSBmbil7XHJcbiAgICAgICAgICAgICAgICAgICAgYXR0cihlbGVtZW50LCBzZXR0aW5nc1trZXldKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRbc2V0QXR0cmlidXRlXShhdHRyLCBzZXR0aW5nc1trZXldKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXNlZCBmb3IgbWFwcGluZyBvbmUga2luZCBvZiBhdHRyaWJ1dGUgdG8gdGhlIHN1cHBvcnRlZCB2ZXJzaW9uIG9mIHRoYXQgaW4gYmFkIGJyb3dzZXJzLlxyXG4gICAgY3JlbFthdHRyTWFwU3RyaW5nXSA9IHt9O1xyXG5cclxuICAgIGNyZWxbaXNFbGVtZW50U3RyaW5nXSA9IGlzRWxlbWVudDtcclxuXHJcbiAgICBjcmVsW2lzTm9kZVN0cmluZ10gPSBpc05vZGU7XHJcblxyXG4gICAgaWYodHlwZW9mIFByb3h5ICE9PSAndW5kZWZpbmVkJyl7XHJcbiAgICAgICAgY3JlbC5wcm94eSA9IG5ldyBQcm94eShjcmVsLCB7XHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24odGFyZ2V0LCBrZXkpe1xyXG4gICAgICAgICAgICAgICAgIShrZXkgaW4gY3JlbCkgJiYgKGNyZWxba2V5XSA9IGNyZWwuYmluZChudWxsLCBrZXkpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjcmVsW2tleV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY3JlbDtcclxufSkpO1xyXG4iLCIvKmpzaGludCBlcW51bGw6dHJ1ZSovXG4oZnVuY3Rpb24gKHJvb3QpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIEdMT0JBTF9LRVkgPSBcIlJhbmRvbVwiO1xuXG4gIHZhciBpbXVsID0gKHR5cGVvZiBNYXRoLmltdWwgIT09IFwiZnVuY3Rpb25cIiB8fCBNYXRoLmltdWwoMHhmZmZmZmZmZiwgNSkgIT09IC01ID9cbiAgICBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgdmFyIGFoID0gKGEgPj4+IDE2KSAmIDB4ZmZmZjtcbiAgICAgIHZhciBhbCA9IGEgJiAweGZmZmY7XG4gICAgICB2YXIgYmggPSAoYiA+Pj4gMTYpICYgMHhmZmZmO1xuICAgICAgdmFyIGJsID0gYiAmIDB4ZmZmZjtcbiAgICAgIC8vIHRoZSBzaGlmdCBieSAwIGZpeGVzIHRoZSBzaWduIG9uIHRoZSBoaWdoIHBhcnRcbiAgICAgIC8vIHRoZSBmaW5hbCB8MCBjb252ZXJ0cyB0aGUgdW5zaWduZWQgdmFsdWUgaW50byBhIHNpZ25lZCB2YWx1ZVxuICAgICAgcmV0dXJuIChhbCAqIGJsKSArICgoKGFoICogYmwgKyBhbCAqIGJoKSA8PCAxNikgPj4+IDApIHwgMDtcbiAgICB9IDpcbiAgICBNYXRoLmltdWwpO1xuXG4gIHZhciBzdHJpbmdSZXBlYXQgPSAodHlwZW9mIFN0cmluZy5wcm90b3R5cGUucmVwZWF0ID09PSBcImZ1bmN0aW9uXCIgJiYgXCJ4XCIucmVwZWF0KDMpID09PSBcInh4eFwiID9cbiAgICBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgcmV0dXJuIHgucmVwZWF0KHkpO1xuICAgIH0gOiBmdW5jdGlvbiAocGF0dGVybiwgY291bnQpIHtcbiAgICAgIHZhciByZXN1bHQgPSBcIlwiO1xuICAgICAgd2hpbGUgKGNvdW50ID4gMCkge1xuICAgICAgICBpZiAoY291bnQgJiAxKSB7XG4gICAgICAgICAgcmVzdWx0ICs9IHBhdHRlcm47XG4gICAgICAgIH1cbiAgICAgICAgY291bnQgPj49IDE7XG4gICAgICAgIHBhdHRlcm4gKz0gcGF0dGVybjtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSk7XG5cbiAgZnVuY3Rpb24gUmFuZG9tKGVuZ2luZSkge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBSYW5kb20pKSB7XG4gICAgICByZXR1cm4gbmV3IFJhbmRvbShlbmdpbmUpO1xuICAgIH1cblxuICAgIGlmIChlbmdpbmUgPT0gbnVsbCkge1xuICAgICAgZW5naW5lID0gUmFuZG9tLmVuZ2luZXMubmF0aXZlTWF0aDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbmdpbmUgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkV4cGVjdGVkIGVuZ2luZSB0byBiZSBhIGZ1bmN0aW9uLCBnb3QgXCIgKyB0eXBlb2YgZW5naW5lKTtcbiAgICB9XG4gICAgdGhpcy5lbmdpbmUgPSBlbmdpbmU7XG4gIH1cbiAgdmFyIHByb3RvID0gUmFuZG9tLnByb3RvdHlwZTtcblxuICBSYW5kb20uZW5naW5lcyA9IHtcbiAgICBuYXRpdmVNYXRoOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDAwMCkgfCAwO1xuICAgIH0sXG4gICAgbXQxOTkzNzogKGZ1bmN0aW9uIChJbnQzMkFycmF5KSB7XG4gICAgICAvLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01lcnNlbm5lX3R3aXN0ZXJcbiAgICAgIGZ1bmN0aW9uIHJlZnJlc2hEYXRhKGRhdGEpIHtcbiAgICAgICAgdmFyIGsgPSAwO1xuICAgICAgICB2YXIgdG1wID0gMDtcbiAgICAgICAgZm9yICg7XG4gICAgICAgICAgKGsgfCAwKSA8IDIyNzsgayA9IChrICsgMSkgfCAwKSB7XG4gICAgICAgICAgdG1wID0gKGRhdGFba10gJiAweDgwMDAwMDAwKSB8IChkYXRhWyhrICsgMSkgfCAwXSAmIDB4N2ZmZmZmZmYpO1xuICAgICAgICAgIGRhdGFba10gPSBkYXRhWyhrICsgMzk3KSB8IDBdIF4gKHRtcCA+Pj4gMSkgXiAoKHRtcCAmIDB4MSkgPyAweDk5MDhiMGRmIDogMCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKDtcbiAgICAgICAgICAoayB8IDApIDwgNjIzOyBrID0gKGsgKyAxKSB8IDApIHtcbiAgICAgICAgICB0bXAgPSAoZGF0YVtrXSAmIDB4ODAwMDAwMDApIHwgKGRhdGFbKGsgKyAxKSB8IDBdICYgMHg3ZmZmZmZmZik7XG4gICAgICAgICAgZGF0YVtrXSA9IGRhdGFbKGsgLSAyMjcpIHwgMF0gXiAodG1wID4+PiAxKSBeICgodG1wICYgMHgxKSA/IDB4OTkwOGIwZGYgOiAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRtcCA9IChkYXRhWzYyM10gJiAweDgwMDAwMDAwKSB8IChkYXRhWzBdICYgMHg3ZmZmZmZmZik7XG4gICAgICAgIGRhdGFbNjIzXSA9IGRhdGFbMzk2XSBeICh0bXAgPj4+IDEpIF4gKCh0bXAgJiAweDEpID8gMHg5OTA4YjBkZiA6IDApO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB0ZW1wZXIodmFsdWUpIHtcbiAgICAgICAgdmFsdWUgXj0gdmFsdWUgPj4+IDExO1xuICAgICAgICB2YWx1ZSBePSAodmFsdWUgPDwgNykgJiAweDlkMmM1NjgwO1xuICAgICAgICB2YWx1ZSBePSAodmFsdWUgPDwgMTUpICYgMHhlZmM2MDAwMDtcbiAgICAgICAgcmV0dXJuIHZhbHVlIF4gKHZhbHVlID4+PiAxOCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNlZWRXaXRoQXJyYXkoZGF0YSwgc291cmNlKSB7XG4gICAgICAgIHZhciBpID0gMTtcbiAgICAgICAgdmFyIGogPSAwO1xuICAgICAgICB2YXIgc291cmNlTGVuZ3RoID0gc291cmNlLmxlbmd0aDtcbiAgICAgICAgdmFyIGsgPSBNYXRoLm1heChzb3VyY2VMZW5ndGgsIDYyNCkgfCAwO1xuICAgICAgICB2YXIgcHJldmlvdXMgPSBkYXRhWzBdIHwgMDtcbiAgICAgICAgZm9yICg7XG4gICAgICAgICAgKGsgfCAwKSA+IDA7IC0taykge1xuICAgICAgICAgIGRhdGFbaV0gPSBwcmV2aW91cyA9ICgoZGF0YVtpXSBeIGltdWwoKHByZXZpb3VzIF4gKHByZXZpb3VzID4+PiAzMCkpLCAweDAwMTk2NjBkKSkgKyAoc291cmNlW2pdIHwgMCkgKyAoaiB8IDApKSB8IDA7XG4gICAgICAgICAgaSA9IChpICsgMSkgfCAwO1xuICAgICAgICAgICsrajtcbiAgICAgICAgICBpZiAoKGkgfCAwKSA+IDYyMykge1xuICAgICAgICAgICAgZGF0YVswXSA9IGRhdGFbNjIzXTtcbiAgICAgICAgICAgIGkgPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaiA+PSBzb3VyY2VMZW5ndGgpIHtcbiAgICAgICAgICAgIGogPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGsgPSA2MjM7XG4gICAgICAgICAgKGsgfCAwKSA+IDA7IC0taykge1xuICAgICAgICAgIGRhdGFbaV0gPSBwcmV2aW91cyA9ICgoZGF0YVtpXSBeIGltdWwoKHByZXZpb3VzIF4gKHByZXZpb3VzID4+PiAzMCkpLCAweDVkNTg4YjY1KSkgLSBpKSB8IDA7XG4gICAgICAgICAgaSA9IChpICsgMSkgfCAwO1xuICAgICAgICAgIGlmICgoaSB8IDApID4gNjIzKSB7XG4gICAgICAgICAgICBkYXRhWzBdID0gZGF0YVs2MjNdO1xuICAgICAgICAgICAgaSA9IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGRhdGFbMF0gPSAweDgwMDAwMDAwO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBtdDE5OTM3KCkge1xuICAgICAgICB2YXIgZGF0YSA9IG5ldyBJbnQzMkFycmF5KDYyNCk7XG4gICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgIHZhciB1c2VzID0gMDtcblxuICAgICAgICBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgIGlmICgoaW5kZXggfCAwKSA+PSA2MjQpIHtcbiAgICAgICAgICAgIHJlZnJlc2hEYXRhKGRhdGEpO1xuICAgICAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciB2YWx1ZSA9IGRhdGFbaW5kZXhdO1xuICAgICAgICAgIGluZGV4ID0gKGluZGV4ICsgMSkgfCAwO1xuICAgICAgICAgIHVzZXMgKz0gMTtcbiAgICAgICAgICByZXR1cm4gdGVtcGVyKHZhbHVlKSB8IDA7XG4gICAgICAgIH1cbiAgICAgICAgbmV4dC5nZXRVc2VDb3VudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB1c2VzO1xuICAgICAgICB9O1xuICAgICAgICBuZXh0LmRpc2NhcmQgPSBmdW5jdGlvbiAoY291bnQpIHtcbiAgICAgICAgICB1c2VzICs9IGNvdW50O1xuICAgICAgICAgIGlmICgoaW5kZXggfCAwKSA+PSA2MjQpIHtcbiAgICAgICAgICAgIHJlZnJlc2hEYXRhKGRhdGEpO1xuICAgICAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICB3aGlsZSAoKGNvdW50IC0gaW5kZXgpID4gNjI0KSB7XG4gICAgICAgICAgICBjb3VudCAtPSA2MjQgLSBpbmRleDtcbiAgICAgICAgICAgIHJlZnJlc2hEYXRhKGRhdGEpO1xuICAgICAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpbmRleCA9IChpbmRleCArIGNvdW50KSB8IDA7XG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH07XG4gICAgICAgIG5leHQuc2VlZCA9IGZ1bmN0aW9uIChpbml0aWFsKSB7XG4gICAgICAgICAgdmFyIHByZXZpb3VzID0gMDtcbiAgICAgICAgICBkYXRhWzBdID0gcHJldmlvdXMgPSBpbml0aWFsIHwgMDtcblxuICAgICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgNjI0OyBpID0gKGkgKyAxKSB8IDApIHtcbiAgICAgICAgICAgIGRhdGFbaV0gPSBwcmV2aW91cyA9IChpbXVsKChwcmV2aW91cyBeIChwcmV2aW91cyA+Pj4gMzApKSwgMHg2YzA3ODk2NSkgKyBpKSB8IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIGluZGV4ID0gNjI0O1xuICAgICAgICAgIHVzZXMgPSAwO1xuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9O1xuICAgICAgICBuZXh0LnNlZWRXaXRoQXJyYXkgPSBmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICAgICAgbmV4dC5zZWVkKDB4MDEyYmQ2YWEpO1xuICAgICAgICAgIHNlZWRXaXRoQXJyYXkoZGF0YSwgc291cmNlKTtcbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfTtcbiAgICAgICAgbmV4dC5hdXRvU2VlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gbmV4dC5zZWVkV2l0aEFycmF5KFJhbmRvbS5nZW5lcmF0ZUVudHJvcHlBcnJheSgpKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtdDE5OTM3O1xuICAgIH0odHlwZW9mIEludDMyQXJyYXkgPT09IFwiZnVuY3Rpb25cIiA/IEludDMyQXJyYXkgOiBBcnJheSkpLFxuICAgIGJyb3dzZXJDcnlwdG86ICh0eXBlb2YgY3J5cHRvICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIEludDMyQXJyYXkgPT09IFwiZnVuY3Rpb25cIikgPyAoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGRhdGEgPSBudWxsO1xuICAgICAgdmFyIGluZGV4ID0gMTI4O1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoaW5kZXggPj0gMTI4KSB7XG4gICAgICAgICAgaWYgKGRhdGEgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGRhdGEgPSBuZXcgSW50MzJBcnJheSgxMjgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKGRhdGEpO1xuICAgICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkYXRhW2luZGV4KytdIHwgMDtcbiAgICAgIH07XG4gICAgfSgpKSA6IG51bGxcbiAgfTtcblxuICBSYW5kb20uZ2VuZXJhdGVFbnRyb3B5QXJyYXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFycmF5ID0gW107XG4gICAgdmFyIGVuZ2luZSA9IFJhbmRvbS5lbmdpbmVzLm5hdGl2ZU1hdGg7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNjsgKytpKSB7XG4gICAgICBhcnJheVtpXSA9IGVuZ2luZSgpIHwgMDtcbiAgICB9XG4gICAgYXJyYXkucHVzaChuZXcgRGF0ZSgpLmdldFRpbWUoKSB8IDApO1xuICAgIHJldHVybiBhcnJheTtcbiAgfTtcblxuICBmdW5jdGlvbiByZXR1cm5WYWx1ZSh2YWx1ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcbiAgfVxuXG4gIC8vIFstMHg4MDAwMDAwMCwgMHg3ZmZmZmZmZl1cbiAgUmFuZG9tLmludDMyID0gZnVuY3Rpb24gKGVuZ2luZSkge1xuICAgIHJldHVybiBlbmdpbmUoKSB8IDA7XG4gIH07XG4gIHByb3RvLmludDMyID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSYW5kb20uaW50MzIodGhpcy5lbmdpbmUpO1xuICB9O1xuXG4gIC8vIFswLCAweGZmZmZmZmZmXVxuICBSYW5kb20udWludDMyID0gZnVuY3Rpb24gKGVuZ2luZSkge1xuICAgIHJldHVybiBlbmdpbmUoKSA+Pj4gMDtcbiAgfTtcbiAgcHJvdG8udWludDMyID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSYW5kb20udWludDMyKHRoaXMuZW5naW5lKTtcbiAgfTtcblxuICAvLyBbMCwgMHgxZmZmZmZmZmZmZmZmZl1cbiAgUmFuZG9tLnVpbnQ1MyA9IGZ1bmN0aW9uIChlbmdpbmUpIHtcbiAgICB2YXIgaGlnaCA9IGVuZ2luZSgpICYgMHgxZmZmZmY7XG4gICAgdmFyIGxvdyA9IGVuZ2luZSgpID4+PiAwO1xuICAgIHJldHVybiAoaGlnaCAqIDB4MTAwMDAwMDAwKSArIGxvdztcbiAgfTtcbiAgcHJvdG8udWludDUzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSYW5kb20udWludDUzKHRoaXMuZW5naW5lKTtcbiAgfTtcblxuICAvLyBbMCwgMHgyMDAwMDAwMDAwMDAwMF1cbiAgUmFuZG9tLnVpbnQ1M0Z1bGwgPSBmdW5jdGlvbiAoZW5naW5lKSB7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIHZhciBoaWdoID0gZW5naW5lKCkgfCAwO1xuICAgICAgaWYgKGhpZ2ggJiAweDIwMDAwMCkge1xuICAgICAgICBpZiAoKGhpZ2ggJiAweDNmZmZmZikgPT09IDB4MjAwMDAwICYmIChlbmdpbmUoKSB8IDApID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIDB4MjAwMDAwMDAwMDAwMDA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBsb3cgPSBlbmdpbmUoKSA+Pj4gMDtcbiAgICAgICAgcmV0dXJuICgoaGlnaCAmIDB4MWZmZmZmKSAqIDB4MTAwMDAwMDAwKSArIGxvdztcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIHByb3RvLnVpbnQ1M0Z1bGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFJhbmRvbS51aW50NTNGdWxsKHRoaXMuZW5naW5lKTtcbiAgfTtcblxuICAvLyBbLTB4MjAwMDAwMDAwMDAwMDAsIDB4MWZmZmZmZmZmZmZmZmZdXG4gIFJhbmRvbS5pbnQ1MyA9IGZ1bmN0aW9uIChlbmdpbmUpIHtcbiAgICB2YXIgaGlnaCA9IGVuZ2luZSgpIHwgMDtcbiAgICB2YXIgbG93ID0gZW5naW5lKCkgPj4+IDA7XG4gICAgcmV0dXJuICgoaGlnaCAmIDB4MWZmZmZmKSAqIDB4MTAwMDAwMDAwKSArIGxvdyArIChoaWdoICYgMHgyMDAwMDAgPyAtMHgyMDAwMDAwMDAwMDAwMCA6IDApO1xuICB9O1xuICBwcm90by5pbnQ1MyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUmFuZG9tLmludDUzKHRoaXMuZW5naW5lKTtcbiAgfTtcblxuICAvLyBbLTB4MjAwMDAwMDAwMDAwMDAsIDB4MjAwMDAwMDAwMDAwMDBdXG4gIFJhbmRvbS5pbnQ1M0Z1bGwgPSBmdW5jdGlvbiAoZW5naW5lKSB7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIHZhciBoaWdoID0gZW5naW5lKCkgfCAwO1xuICAgICAgaWYgKGhpZ2ggJiAweDQwMDAwMCkge1xuICAgICAgICBpZiAoKGhpZ2ggJiAweDdmZmZmZikgPT09IDB4NDAwMDAwICYmIChlbmdpbmUoKSB8IDApID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIDB4MjAwMDAwMDAwMDAwMDA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBsb3cgPSBlbmdpbmUoKSA+Pj4gMDtcbiAgICAgICAgcmV0dXJuICgoaGlnaCAmIDB4MWZmZmZmKSAqIDB4MTAwMDAwMDAwKSArIGxvdyArIChoaWdoICYgMHgyMDAwMDAgPyAtMHgyMDAwMDAwMDAwMDAwMCA6IDApO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgcHJvdG8uaW50NTNGdWxsID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSYW5kb20uaW50NTNGdWxsKHRoaXMuZW5naW5lKTtcbiAgfTtcblxuICBmdW5jdGlvbiBhZGQoZ2VuZXJhdGUsIGFkZGVuZCkge1xuICAgIGlmIChhZGRlbmQgPT09IDApIHtcbiAgICAgIHJldHVybiBnZW5lcmF0ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlbmdpbmUpIHtcbiAgICAgICAgcmV0dXJuIGdlbmVyYXRlKGVuZ2luZSkgKyBhZGRlbmQ7XG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIFJhbmRvbS5pbnRlZ2VyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBpc1Bvd2VyT2ZUd29NaW51c09uZSh2YWx1ZSkge1xuICAgICAgcmV0dXJuICgodmFsdWUgKyAxKSAmIHZhbHVlKSA9PT0gMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBiaXRtYXNrKG1hc2tpbmcpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZW5naW5lKSB7XG4gICAgICAgIHJldHVybiBlbmdpbmUoKSAmIG1hc2tpbmc7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRvd25zY2FsZVRvTG9vcENoZWNrZWRSYW5nZShyYW5nZSkge1xuICAgICAgdmFyIGV4dGVuZGVkUmFuZ2UgPSByYW5nZSArIDE7XG4gICAgICB2YXIgbWF4aW11bSA9IGV4dGVuZGVkUmFuZ2UgKiBNYXRoLmZsb29yKDB4MTAwMDAwMDAwIC8gZXh0ZW5kZWRSYW5nZSk7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGVuZ2luZSkge1xuICAgICAgICB2YXIgdmFsdWUgPSAwO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgdmFsdWUgPSBlbmdpbmUoKSA+Pj4gMDtcbiAgICAgICAgfSB3aGlsZSAodmFsdWUgPj0gbWF4aW11bSk7XG4gICAgICAgIHJldHVybiB2YWx1ZSAlIGV4dGVuZGVkUmFuZ2U7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRvd25zY2FsZVRvUmFuZ2UocmFuZ2UpIHtcbiAgICAgIGlmIChpc1Bvd2VyT2ZUd29NaW51c09uZShyYW5nZSkpIHtcbiAgICAgICAgcmV0dXJuIGJpdG1hc2socmFuZ2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGRvd25zY2FsZVRvTG9vcENoZWNrZWRSYW5nZShyYW5nZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNFdmVubHlEaXZpc2libGVCeU1heEludDMyKHZhbHVlKSB7XG4gICAgICByZXR1cm4gKHZhbHVlIHwgMCkgPT09IDA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBzY2FsZVdpdGhIaWdoTWFza2luZyhtYXNraW5nKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGVuZ2luZSkge1xuICAgICAgICB2YXIgaGlnaCA9IGVuZ2luZSgpICYgbWFza2luZztcbiAgICAgICAgdmFyIGxvdyA9IGVuZ2luZSgpID4+PiAwO1xuICAgICAgICByZXR1cm4gKGhpZ2ggKiAweDEwMDAwMDAwMCkgKyBsb3c7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwc2NhbGVUb0xvb3BDaGVja2VkUmFuZ2UoZXh0ZW5kZWRSYW5nZSkge1xuICAgICAgdmFyIG1heGltdW0gPSBleHRlbmRlZFJhbmdlICogTWF0aC5mbG9vcigweDIwMDAwMDAwMDAwMDAwIC8gZXh0ZW5kZWRSYW5nZSk7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGVuZ2luZSkge1xuICAgICAgICB2YXIgcmV0ID0gMDtcbiAgICAgICAgZG8ge1xuICAgICAgICAgIHZhciBoaWdoID0gZW5naW5lKCkgJiAweDFmZmZmZjtcbiAgICAgICAgICB2YXIgbG93ID0gZW5naW5lKCkgPj4+IDA7XG4gICAgICAgICAgcmV0ID0gKGhpZ2ggKiAweDEwMDAwMDAwMCkgKyBsb3c7XG4gICAgICAgIH0gd2hpbGUgKHJldCA+PSBtYXhpbXVtKTtcbiAgICAgICAgcmV0dXJuIHJldCAlIGV4dGVuZGVkUmFuZ2U7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwc2NhbGVXaXRoaW5VNTMocmFuZ2UpIHtcbiAgICAgIHZhciBleHRlbmRlZFJhbmdlID0gcmFuZ2UgKyAxO1xuICAgICAgaWYgKGlzRXZlbmx5RGl2aXNpYmxlQnlNYXhJbnQzMihleHRlbmRlZFJhbmdlKSkge1xuICAgICAgICB2YXIgaGlnaFJhbmdlID0gKChleHRlbmRlZFJhbmdlIC8gMHgxMDAwMDAwMDApIHwgMCkgLSAxO1xuICAgICAgICBpZiAoaXNQb3dlck9mVHdvTWludXNPbmUoaGlnaFJhbmdlKSkge1xuICAgICAgICAgIHJldHVybiB1cHNjYWxlV2l0aEhpZ2hNYXNraW5nKGhpZ2hSYW5nZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB1cHNjYWxlVG9Mb29wQ2hlY2tlZFJhbmdlKGV4dGVuZGVkUmFuZ2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwc2NhbGVXaXRoaW5JNTNBbmRMb29wQ2hlY2sobWluLCBtYXgpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZW5naW5lKSB7XG4gICAgICAgIHZhciByZXQgPSAwO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgdmFyIGhpZ2ggPSBlbmdpbmUoKSB8IDA7XG4gICAgICAgICAgdmFyIGxvdyA9IGVuZ2luZSgpID4+PiAwO1xuICAgICAgICAgIHJldCA9ICgoaGlnaCAmIDB4MWZmZmZmKSAqIDB4MTAwMDAwMDAwKSArIGxvdyArIChoaWdoICYgMHgyMDAwMDAgPyAtMHgyMDAwMDAwMDAwMDAwMCA6IDApO1xuICAgICAgICB9IHdoaWxlIChyZXQgPCBtaW4gfHwgcmV0ID4gbWF4KTtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChtaW4sIG1heCkge1xuICAgICAgbWluID0gTWF0aC5mbG9vcihtaW4pO1xuICAgICAgbWF4ID0gTWF0aC5mbG9vcihtYXgpO1xuICAgICAgaWYgKG1pbiA8IC0weDIwMDAwMDAwMDAwMDAwIHx8ICFpc0Zpbml0ZShtaW4pKSB7XG4gICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFwiRXhwZWN0ZWQgbWluIHRvIGJlIGF0IGxlYXN0IFwiICsgKC0weDIwMDAwMDAwMDAwMDAwKSk7XG4gICAgICB9IGVsc2UgaWYgKG1heCA+IDB4MjAwMDAwMDAwMDAwMDAgfHwgIWlzRmluaXRlKG1heCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCJFeHBlY3RlZCBtYXggdG8gYmUgYXQgbW9zdCBcIiArIDB4MjAwMDAwMDAwMDAwMDApO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmFuZ2UgPSBtYXggLSBtaW47XG4gICAgICBpZiAocmFuZ2UgPD0gMCB8fCAhaXNGaW5pdGUocmFuZ2UpKSB7XG4gICAgICAgIHJldHVybiByZXR1cm5WYWx1ZShtaW4pO1xuICAgICAgfSBlbHNlIGlmIChyYW5nZSA9PT0gMHhmZmZmZmZmZikge1xuICAgICAgICBpZiAobWluID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIFJhbmRvbS51aW50MzI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGFkZChSYW5kb20uaW50MzIsIG1pbiArIDB4ODAwMDAwMDApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHJhbmdlIDwgMHhmZmZmZmZmZikge1xuICAgICAgICByZXR1cm4gYWRkKGRvd25zY2FsZVRvUmFuZ2UocmFuZ2UpLCBtaW4pO1xuICAgICAgfSBlbHNlIGlmIChyYW5nZSA9PT0gMHgxZmZmZmZmZmZmZmZmZikge1xuICAgICAgICByZXR1cm4gYWRkKFJhbmRvbS51aW50NTMsIG1pbik7XG4gICAgICB9IGVsc2UgaWYgKHJhbmdlIDwgMHgxZmZmZmZmZmZmZmZmZikge1xuICAgICAgICByZXR1cm4gYWRkKHVwc2NhbGVXaXRoaW5VNTMocmFuZ2UpLCBtaW4pO1xuICAgICAgfSBlbHNlIGlmIChtYXggLSAxIC0gbWluID09PSAweDFmZmZmZmZmZmZmZmZmKSB7XG4gICAgICAgIHJldHVybiBhZGQoUmFuZG9tLnVpbnQ1M0Z1bGwsIG1pbik7XG4gICAgICB9IGVsc2UgaWYgKG1pbiA9PT0gLTB4MjAwMDAwMDAwMDAwMDAgJiYgbWF4ID09PSAweDIwMDAwMDAwMDAwMDAwKSB7XG4gICAgICAgIHJldHVybiBSYW5kb20uaW50NTNGdWxsO1xuICAgICAgfSBlbHNlIGlmIChtaW4gPT09IC0weDIwMDAwMDAwMDAwMDAwICYmIG1heCA9PT0gMHgxZmZmZmZmZmZmZmZmZikge1xuICAgICAgICByZXR1cm4gUmFuZG9tLmludDUzO1xuICAgICAgfSBlbHNlIGlmIChtaW4gPT09IC0weDFmZmZmZmZmZmZmZmZmICYmIG1heCA9PT0gMHgyMDAwMDAwMDAwMDAwMCkge1xuICAgICAgICByZXR1cm4gYWRkKFJhbmRvbS5pbnQ1MywgMSk7XG4gICAgICB9IGVsc2UgaWYgKG1heCA9PT0gMHgyMDAwMDAwMDAwMDAwMCkge1xuICAgICAgICByZXR1cm4gYWRkKHVwc2NhbGVXaXRoaW5JNTNBbmRMb29wQ2hlY2sobWluIC0gMSwgbWF4IC0gMSksIDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHVwc2NhbGVXaXRoaW5JNTNBbmRMb29wQ2hlY2sobWluLCBtYXgpO1xuICAgICAgfVxuICAgIH07XG4gIH0oKSk7XG4gIHByb3RvLmludGVnZXIgPSBmdW5jdGlvbiAobWluLCBtYXgpIHtcbiAgICByZXR1cm4gUmFuZG9tLmludGVnZXIobWluLCBtYXgpKHRoaXMuZW5naW5lKTtcbiAgfTtcblxuICAvLyBbMCwgMV0gKGZsb2F0aW5nIHBvaW50KVxuICBSYW5kb20ucmVhbFplcm9Ub09uZUluY2x1c2l2ZSA9IGZ1bmN0aW9uIChlbmdpbmUpIHtcbiAgICByZXR1cm4gUmFuZG9tLnVpbnQ1M0Z1bGwoZW5naW5lKSAvIDB4MjAwMDAwMDAwMDAwMDA7XG4gIH07XG4gIHByb3RvLnJlYWxaZXJvVG9PbmVJbmNsdXNpdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFJhbmRvbS5yZWFsWmVyb1RvT25lSW5jbHVzaXZlKHRoaXMuZW5naW5lKTtcbiAgfTtcblxuICAvLyBbMCwgMSkgKGZsb2F0aW5nIHBvaW50KVxuICBSYW5kb20ucmVhbFplcm9Ub09uZUV4Y2x1c2l2ZSA9IGZ1bmN0aW9uIChlbmdpbmUpIHtcbiAgICByZXR1cm4gUmFuZG9tLnVpbnQ1MyhlbmdpbmUpIC8gMHgyMDAwMDAwMDAwMDAwMDtcbiAgfTtcbiAgcHJvdG8ucmVhbFplcm9Ub09uZUV4Y2x1c2l2ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUmFuZG9tLnJlYWxaZXJvVG9PbmVFeGNsdXNpdmUodGhpcy5lbmdpbmUpO1xuICB9O1xuXG4gIFJhbmRvbS5yZWFsID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBtdWx0aXBseShnZW5lcmF0ZSwgbXVsdGlwbGllcikge1xuICAgICAgaWYgKG11bHRpcGxpZXIgPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIGdlbmVyYXRlO1xuICAgICAgfSBlbHNlIGlmIChtdWx0aXBsaWVyID09PSAwKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGVuZ2luZSkge1xuICAgICAgICAgIHJldHVybiBnZW5lcmF0ZShlbmdpbmUpICogbXVsdGlwbGllcjtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKGxlZnQsIHJpZ2h0LCBpbmNsdXNpdmUpIHtcbiAgICAgIGlmICghaXNGaW5pdGUobGVmdCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCJFeHBlY3RlZCBsZWZ0IHRvIGJlIGEgZmluaXRlIG51bWJlclwiKTtcbiAgICAgIH0gZWxzZSBpZiAoIWlzRmluaXRlKHJpZ2h0KSkge1xuICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcIkV4cGVjdGVkIHJpZ2h0IHRvIGJlIGEgZmluaXRlIG51bWJlclwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhZGQoXG4gICAgICAgIG11bHRpcGx5KFxuICAgICAgICAgIGluY2x1c2l2ZSA/IFJhbmRvbS5yZWFsWmVyb1RvT25lSW5jbHVzaXZlIDogUmFuZG9tLnJlYWxaZXJvVG9PbmVFeGNsdXNpdmUsXG4gICAgICAgICAgcmlnaHQgLSBsZWZ0KSxcbiAgICAgICAgbGVmdCk7XG4gICAgfTtcbiAgfSgpKTtcbiAgcHJvdG8ucmVhbCA9IGZ1bmN0aW9uIChtaW4sIG1heCwgaW5jbHVzaXZlKSB7XG4gICAgcmV0dXJuIFJhbmRvbS5yZWFsKG1pbiwgbWF4LCBpbmNsdXNpdmUpKHRoaXMuZW5naW5lKTtcbiAgfTtcblxuICBSYW5kb20uYm9vbCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gaXNMZWFzdEJpdFRydWUoZW5naW5lKSB7XG4gICAgICByZXR1cm4gKGVuZ2luZSgpICYgMSkgPT09IDE7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGVzc1RoYW4oZ2VuZXJhdGUsIHZhbHVlKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGVuZ2luZSkge1xuICAgICAgICByZXR1cm4gZ2VuZXJhdGUoZW5naW5lKSA8IHZhbHVlO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcm9iYWJpbGl0eShwZXJjZW50YWdlKSB7XG4gICAgICBpZiAocGVyY2VudGFnZSA8PSAwKSB7XG4gICAgICAgIHJldHVybiByZXR1cm5WYWx1ZShmYWxzZSk7XG4gICAgICB9IGVsc2UgaWYgKHBlcmNlbnRhZ2UgPj0gMSkge1xuICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWUodHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgc2NhbGVkID0gcGVyY2VudGFnZSAqIDB4MTAwMDAwMDAwO1xuICAgICAgICBpZiAoc2NhbGVkICUgMSA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBsZXNzVGhhbihSYW5kb20uaW50MzIsIChzY2FsZWQgLSAweDgwMDAwMDAwKSB8IDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBsZXNzVGhhbihSYW5kb20udWludDUzLCBNYXRoLnJvdW5kKHBlcmNlbnRhZ2UgKiAweDIwMDAwMDAwMDAwMDAwKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKG51bWVyYXRvciwgZGVub21pbmF0b3IpIHtcbiAgICAgIGlmIChkZW5vbWluYXRvciA9PSBudWxsKSB7XG4gICAgICAgIGlmIChudW1lcmF0b3IgPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBpc0xlYXN0Qml0VHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvYmFiaWxpdHkobnVtZXJhdG9yKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChudW1lcmF0b3IgPD0gMCkge1xuICAgICAgICAgIHJldHVybiByZXR1cm5WYWx1ZShmYWxzZSk7XG4gICAgICAgIH0gZWxzZSBpZiAobnVtZXJhdG9yID49IGRlbm9taW5hdG9yKSB7XG4gICAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlKHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsZXNzVGhhbihSYW5kb20uaW50ZWdlcigwLCBkZW5vbWluYXRvciAtIDEpLCBudW1lcmF0b3IpO1xuICAgICAgfVxuICAgIH07XG4gIH0oKSk7XG4gIHByb3RvLmJvb2wgPSBmdW5jdGlvbiAobnVtZXJhdG9yLCBkZW5vbWluYXRvcikge1xuICAgIHJldHVybiBSYW5kb20uYm9vbChudW1lcmF0b3IsIGRlbm9taW5hdG9yKSh0aGlzLmVuZ2luZSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gdG9JbnRlZ2VyKHZhbHVlKSB7XG4gICAgdmFyIG51bWJlciA9ICt2YWx1ZTtcbiAgICBpZiAobnVtYmVyIDwgMCkge1xuICAgICAgcmV0dXJuIE1hdGguY2VpbChudW1iZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihudW1iZXIpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnZlcnRTbGljZUFyZ3VtZW50KHZhbHVlLCBsZW5ndGgpIHtcbiAgICBpZiAodmFsdWUgPCAwKSB7XG4gICAgICByZXR1cm4gTWF0aC5tYXgodmFsdWUgKyBsZW5ndGgsIDApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gTWF0aC5taW4odmFsdWUsIGxlbmd0aCk7XG4gICAgfVxuICB9XG4gIFJhbmRvbS5waWNrID0gZnVuY3Rpb24gKGVuZ2luZSwgYXJyYXksIGJlZ2luLCBlbmQpIHtcbiAgICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuICAgIHZhciBzdGFydCA9IGJlZ2luID09IG51bGwgPyAwIDogY29udmVydFNsaWNlQXJndW1lbnQodG9JbnRlZ2VyKGJlZ2luKSwgbGVuZ3RoKTtcbiAgICB2YXIgZmluaXNoID0gZW5kID09PSB2b2lkIDAgPyBsZW5ndGggOiBjb252ZXJ0U2xpY2VBcmd1bWVudCh0b0ludGVnZXIoZW5kKSwgbGVuZ3RoKTtcbiAgICBpZiAoc3RhcnQgPj0gZmluaXNoKSB7XG4gICAgICByZXR1cm4gdm9pZCAwO1xuICAgIH1cbiAgICB2YXIgZGlzdHJpYnV0aW9uID0gUmFuZG9tLmludGVnZXIoc3RhcnQsIGZpbmlzaCAtIDEpO1xuICAgIHJldHVybiBhcnJheVtkaXN0cmlidXRpb24oZW5naW5lKV07XG4gIH07XG4gIHByb3RvLnBpY2sgPSBmdW5jdGlvbiAoYXJyYXksIGJlZ2luLCBlbmQpIHtcbiAgICByZXR1cm4gUmFuZG9tLnBpY2sodGhpcy5lbmdpbmUsIGFycmF5LCBiZWdpbiwgZW5kKTtcbiAgfTtcblxuICBmdW5jdGlvbiByZXR1cm5VbmRlZmluZWQoKSB7XG4gICAgcmV0dXJuIHZvaWQgMDtcbiAgfVxuICB2YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG4gIFJhbmRvbS5waWNrZXIgPSBmdW5jdGlvbiAoYXJyYXksIGJlZ2luLCBlbmQpIHtcbiAgICB2YXIgY2xvbmUgPSBzbGljZS5jYWxsKGFycmF5LCBiZWdpbiwgZW5kKTtcbiAgICBpZiAoIWNsb25lLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHJldHVyblVuZGVmaW5lZDtcbiAgICB9XG4gICAgdmFyIGRpc3RyaWJ1dGlvbiA9IFJhbmRvbS5pbnRlZ2VyKDAsIGNsb25lLmxlbmd0aCAtIDEpO1xuICAgIHJldHVybiBmdW5jdGlvbiAoZW5naW5lKSB7XG4gICAgICByZXR1cm4gY2xvbmVbZGlzdHJpYnV0aW9uKGVuZ2luZSldO1xuICAgIH07XG4gIH07XG5cbiAgUmFuZG9tLnNodWZmbGUgPSBmdW5jdGlvbiAoZW5naW5lLCBhcnJheSwgZG93blRvKSB7XG4gICAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcbiAgICBpZiAobGVuZ3RoKSB7XG4gICAgICBpZiAoZG93blRvID09IG51bGwpIHtcbiAgICAgICAgZG93blRvID0gMDtcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGkgPSAobGVuZ3RoIC0gMSkgPj4+IDA7IGkgPiBkb3duVG87IC0taSkge1xuICAgICAgICB2YXIgZGlzdHJpYnV0aW9uID0gUmFuZG9tLmludGVnZXIoMCwgaSk7XG4gICAgICAgIHZhciBqID0gZGlzdHJpYnV0aW9uKGVuZ2luZSk7XG4gICAgICAgIGlmIChpICE9PSBqKSB7XG4gICAgICAgICAgdmFyIHRtcCA9IGFycmF5W2ldO1xuICAgICAgICAgIGFycmF5W2ldID0gYXJyYXlbal07XG4gICAgICAgICAgYXJyYXlbal0gPSB0bXA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFycmF5O1xuICB9O1xuICBwcm90by5zaHVmZmxlID0gZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgcmV0dXJuIFJhbmRvbS5zaHVmZmxlKHRoaXMuZW5naW5lLCBhcnJheSk7XG4gIH07XG5cbiAgUmFuZG9tLnNhbXBsZSA9IGZ1bmN0aW9uIChlbmdpbmUsIHBvcHVsYXRpb24sIHNhbXBsZVNpemUpIHtcbiAgICBpZiAoc2FtcGxlU2l6ZSA8IDAgfHwgc2FtcGxlU2l6ZSA+IHBvcHVsYXRpb24ubGVuZ3RoIHx8ICFpc0Zpbml0ZShzYW1wbGVTaXplKSkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCJFeHBlY3RlZCBzYW1wbGVTaXplIHRvIGJlIHdpdGhpbiAwIGFuZCB0aGUgbGVuZ3RoIG9mIHRoZSBwb3B1bGF0aW9uXCIpO1xuICAgIH1cblxuICAgIGlmIChzYW1wbGVTaXplID09PSAwKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgdmFyIGNsb25lID0gc2xpY2UuY2FsbChwb3B1bGF0aW9uKTtcbiAgICB2YXIgbGVuZ3RoID0gY2xvbmUubGVuZ3RoO1xuICAgIGlmIChsZW5ndGggPT09IHNhbXBsZVNpemUpIHtcbiAgICAgIHJldHVybiBSYW5kb20uc2h1ZmZsZShlbmdpbmUsIGNsb25lLCAwKTtcbiAgICB9XG4gICAgdmFyIHRhaWxMZW5ndGggPSBsZW5ndGggLSBzYW1wbGVTaXplO1xuICAgIHJldHVybiBSYW5kb20uc2h1ZmZsZShlbmdpbmUsIGNsb25lLCB0YWlsTGVuZ3RoIC0gMSkuc2xpY2UodGFpbExlbmd0aCk7XG4gIH07XG4gIHByb3RvLnNhbXBsZSA9IGZ1bmN0aW9uIChwb3B1bGF0aW9uLCBzYW1wbGVTaXplKSB7XG4gICAgcmV0dXJuIFJhbmRvbS5zYW1wbGUodGhpcy5lbmdpbmUsIHBvcHVsYXRpb24sIHNhbXBsZVNpemUpO1xuICB9O1xuXG4gIFJhbmRvbS5kaWUgPSBmdW5jdGlvbiAoc2lkZUNvdW50KSB7XG4gICAgcmV0dXJuIFJhbmRvbS5pbnRlZ2VyKDEsIHNpZGVDb3VudCk7XG4gIH07XG4gIHByb3RvLmRpZSA9IGZ1bmN0aW9uIChzaWRlQ291bnQpIHtcbiAgICByZXR1cm4gUmFuZG9tLmRpZShzaWRlQ291bnQpKHRoaXMuZW5naW5lKTtcbiAgfTtcblxuICBSYW5kb20uZGljZSA9IGZ1bmN0aW9uIChzaWRlQ291bnQsIGRpZUNvdW50KSB7XG4gICAgdmFyIGRpc3RyaWJ1dGlvbiA9IFJhbmRvbS5kaWUoc2lkZUNvdW50KTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGVuZ2luZSkge1xuICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgcmVzdWx0Lmxlbmd0aCA9IGRpZUNvdW50O1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkaWVDb3VudDsgKytpKSB7XG4gICAgICAgIHJlc3VsdFtpXSA9IGRpc3RyaWJ1dGlvbihlbmdpbmUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuICBwcm90by5kaWNlID0gZnVuY3Rpb24gKHNpZGVDb3VudCwgZGllQ291bnQpIHtcbiAgICByZXR1cm4gUmFuZG9tLmRpY2Uoc2lkZUNvdW50LCBkaWVDb3VudCkodGhpcy5lbmdpbmUpO1xuICB9O1xuXG4gIC8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVW5pdmVyc2FsbHlfdW5pcXVlX2lkZW50aWZpZXJcbiAgUmFuZG9tLnV1aWQ0ID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiB6ZXJvUGFkKHN0cmluZywgemVyb0NvdW50KSB7XG4gICAgICByZXR1cm4gc3RyaW5nUmVwZWF0KFwiMFwiLCB6ZXJvQ291bnQgLSBzdHJpbmcubGVuZ3RoKSArIHN0cmluZztcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKGVuZ2luZSkge1xuICAgICAgdmFyIGEgPSBlbmdpbmUoKSA+Pj4gMDtcbiAgICAgIHZhciBiID0gZW5naW5lKCkgfCAwO1xuICAgICAgdmFyIGMgPSBlbmdpbmUoKSB8IDA7XG4gICAgICB2YXIgZCA9IGVuZ2luZSgpID4+PiAwO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICB6ZXJvUGFkKGEudG9TdHJpbmcoMTYpLCA4KSArXG4gICAgICAgIFwiLVwiICtcbiAgICAgICAgemVyb1BhZCgoYiAmIDB4ZmZmZikudG9TdHJpbmcoMTYpLCA0KSArXG4gICAgICAgIFwiLVwiICtcbiAgICAgICAgemVyb1BhZCgoKChiID4+IDQpICYgMHgwZmZmKSB8IDB4NDAwMCkudG9TdHJpbmcoMTYpLCA0KSArXG4gICAgICAgIFwiLVwiICtcbiAgICAgICAgemVyb1BhZCgoKGMgJiAweDNmZmYpIHwgMHg4MDAwKS50b1N0cmluZygxNiksIDQpICtcbiAgICAgICAgXCItXCIgK1xuICAgICAgICB6ZXJvUGFkKCgoYyA+PiA0KSAmIDB4ZmZmZikudG9TdHJpbmcoMTYpLCA0KSArXG4gICAgICAgIHplcm9QYWQoZC50b1N0cmluZygxNiksIDgpKTtcbiAgICB9O1xuICB9KCkpO1xuICBwcm90by51dWlkNCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUmFuZG9tLnV1aWQ0KHRoaXMuZW5naW5lKTtcbiAgfTtcblxuICBSYW5kb20uc3RyaW5nID0gKGZ1bmN0aW9uICgpIHtcbiAgICAvLyBoYXMgMioqeCBjaGFycywgZm9yIGZhc3RlciB1bmlmb3JtIGRpc3RyaWJ1dGlvblxuICAgIHZhciBERUZBVUxUX1NUUklOR19QT09MID0gXCJhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ekFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaMDEyMzQ1Njc4OV8tXCI7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKHBvb2wpIHtcbiAgICAgIGlmIChwb29sID09IG51bGwpIHtcbiAgICAgICAgcG9vbCA9IERFRkFVTFRfU1RSSU5HX1BPT0w7XG4gICAgICB9XG5cbiAgICAgIHZhciBsZW5ndGggPSBwb29sLmxlbmd0aDtcbiAgICAgIGlmICghbGVuZ3RoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkV4cGVjdGVkIHBvb2wgbm90IHRvIGJlIGFuIGVtcHR5IHN0cmluZ1wiKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGRpc3RyaWJ1dGlvbiA9IFJhbmRvbS5pbnRlZ2VyKDAsIGxlbmd0aCAtIDEpO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlbmdpbmUsIGxlbmd0aCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gXCJcIjtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgICAgICAgIHZhciBqID0gZGlzdHJpYnV0aW9uKGVuZ2luZSk7XG4gICAgICAgICAgcmVzdWx0ICs9IHBvb2wuY2hhckF0KGopO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9O1xuICAgIH07XG4gIH0oKSk7XG4gIHByb3RvLnN0cmluZyA9IGZ1bmN0aW9uIChsZW5ndGgsIHBvb2wpIHtcbiAgICByZXR1cm4gUmFuZG9tLnN0cmluZyhwb29sKSh0aGlzLmVuZ2luZSwgbGVuZ3RoKTtcbiAgfTtcblxuICBSYW5kb20uaGV4ID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgTE9XRVJfSEVYX1BPT0wgPSBcIjAxMjM0NTY3ODlhYmNkZWZcIjtcbiAgICB2YXIgbG93ZXJIZXggPSBSYW5kb20uc3RyaW5nKExPV0VSX0hFWF9QT09MKTtcbiAgICB2YXIgdXBwZXJIZXggPSBSYW5kb20uc3RyaW5nKExPV0VSX0hFWF9QT09MLnRvVXBwZXJDYXNlKCkpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh1cHBlcikge1xuICAgICAgaWYgKHVwcGVyKSB7XG4gICAgICAgIHJldHVybiB1cHBlckhleDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBsb3dlckhleDtcbiAgICAgIH1cbiAgICB9O1xuICB9KCkpO1xuICBwcm90by5oZXggPSBmdW5jdGlvbiAobGVuZ3RoLCB1cHBlcikge1xuICAgIHJldHVybiBSYW5kb20uaGV4KHVwcGVyKSh0aGlzLmVuZ2luZSwgbGVuZ3RoKTtcbiAgfTtcblxuICBSYW5kb20uZGF0ZSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XG4gICAgaWYgKCEoc3RhcnQgaW5zdGFuY2VvZiBEYXRlKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkV4cGVjdGVkIHN0YXJ0IHRvIGJlIGEgRGF0ZSwgZ290IFwiICsgdHlwZW9mIHN0YXJ0KTtcbiAgICB9IGVsc2UgaWYgKCEoZW5kIGluc3RhbmNlb2YgRGF0ZSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJFeHBlY3RlZCBlbmQgdG8gYmUgYSBEYXRlLCBnb3QgXCIgKyB0eXBlb2YgZW5kKTtcbiAgICB9XG4gICAgdmFyIGRpc3RyaWJ1dGlvbiA9IFJhbmRvbS5pbnRlZ2VyKHN0YXJ0LmdldFRpbWUoKSwgZW5kLmdldFRpbWUoKSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChlbmdpbmUpIHtcbiAgICAgIHJldHVybiBuZXcgRGF0ZShkaXN0cmlidXRpb24oZW5naW5lKSk7XG4gICAgfTtcbiAgfTtcbiAgcHJvdG8uZGF0ZSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XG4gICAgcmV0dXJuIFJhbmRvbS5kYXRlKHN0YXJ0LCBlbmQpKHRoaXMuZW5naW5lKTtcbiAgfTtcblxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFJhbmRvbTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiByZXF1aXJlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFJhbmRvbTtcbiAgfSBlbHNlIHtcbiAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG9sZEdsb2JhbCA9IHJvb3RbR0xPQkFMX0tFWV07XG4gICAgICBSYW5kb20ubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcm9vdFtHTE9CQUxfS0VZXSA9IG9sZEdsb2JhbDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9O1xuICAgIH0oKSk7XG4gICAgcm9vdFtHTE9CQUxfS0VZXSA9IFJhbmRvbTtcbiAgfVxufSh0aGlzKSk7IiwidmFyIHN0YXRzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJlJyksXG4gICAgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyksXG4gICAgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKCl7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjYW52YXMpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc3RhdHMpO1xufSk7XG5cbnZhciByZW5kZXJIZWlnaHQgPSA2MDtcbnZhciByZW5kZXJXaWR0aCA9IDExMDA7XG5jYW52YXMuaGVpZ2h0ID0gcmVuZGVySGVpZ2h0O1xuY2FudmFzLndpZHRoID0gcmVuZGVyV2lkdGg7XG5cbnZhciBsYXN0QmVzdEJ1ZyA9IG51bGwsXG4gICAgbGFzdEJlc3RCdWdKU09OO1xuXG5mdW5jdGlvbiBnZXRCZXN0QnVnSlNPTihiZXN0QnVnKXtcbiAgICBpZihsYXN0QmVzdEJ1ZyA9PT0gYmVzdEJ1Zyl7XG4gICAgICAgIHJldHVybiBsYXN0QmVzdEJ1Z0pTT047XG4gICAgfVxuXG4gICAgbGFzdEJlc3RCdWcgPSBiZXN0QnVnO1xuXG4gICAgcmV0dXJuIGxhc3RCZXN0QnVnSlNPTiA9IEpTT04uc3RyaW5naWZ5KGJlc3RCdWcubmV1cm9ucy5tYXAoZnVuY3Rpb24obmV1cm9uKXtcbiAgICAgICAgcmV0dXJuIG5ldXJvbi5zZXR0aW5ncztcbiAgICB9KSwgbnVsbCwgNCk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN0YXRlKXtcbiAgICB2YXIgY3VycmVudEJlc3RCdWcgPSBzdGF0ZS5idWdzLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGJ1Zyl7XG4gICAgICAgIHJldHVybiBidWcuYWdlID4gcmVzdWx0LmFnZSA/IGJ1ZyA6IHJlc3VsdDtcbiAgICB9LCBzdGF0ZS5idWdzWzBdKTtcblxuICAgIHZhciBjdXJyZW50TGluZWFnZXMgPSBzdGF0ZS5idWdzLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGJ1Zyl7XG4gICAgICAgIGlmIChyZXN1bHQuaW5kZXhPZihidWcucGF0ZXJuYWxMaW5lYWdlKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGJ1Zy5wYXRlcm5hbExpbmVhZ2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBbXSk7XG5cbiAgICBzdGF0cy50ZXh0Q29udGVudCA9IFtcbiAgICAgICAgJ1RpY2tzOiAnICsgc3RhdGUudGlja3MsXG4gICAgICAgICdJdHRlcmF0aW9ucyBQZXIgNTBtcyBydW46ICcgKyBzdGF0ZS5pdHRlcmF0aW9uc1BlcjUwLFxuICAgICAgICAnQnVnczogJyArIHN0YXRlLmJ1Z3MubGVuZ3RoLFxuICAgICAgICAnTWF4IEN1cnJlbnQgQWdlOiAnICsgKGN1cnJlbnRCZXN0QnVnID8gY3VycmVudEJlc3RCdWcuYWdlIDogJ05vdGhpbmcgYWxpdmUnKSxcbiAgICAgICAgJ0N1cnJlbnQgQmVzdCBCdWcgTGluZWFnZTogJyArIChjdXJyZW50QmVzdEJ1ZyA/IGAkeyBjdXJyZW50QmVzdEJ1Zy5wYXRlcm5hbExpbmVhZ2UuaWQgfSAoYWdlOiAke3N0YXRlLnRpY2tzIC0gY3VycmVudEJlc3RCdWcucGF0ZXJuYWxMaW5lYWdlLnRpY2t9KWAgOiAnTm9uZScpLFxuICAgICAgICAnQ3VycmVudCBMaW5lYWdlczogJyxcbiAgICAgICAgLi4uY3VycmVudExpbmVhZ2VzLm1hcChmdW5jdGlvbihsaW5lYWdlKXsgcmV0dXJuIGAkeyBsaW5lYWdlLmlkIH0gKGFnZTogJHtzdGF0ZS50aWNrcyAtIGxpbmVhZ2UudGlja30pYDsgfSksXG4gICAgICAgICdNYXggQWdlOiAnICsgc3RhdGUuYmVzdEJ1Zy5hZ2UsXG4gICAgICAgICdCZXN0IEJ1Z3MgQnJhaW46ICcgKyBnZXRCZXN0QnVnSlNPTihzdGF0ZS5iZXN0QnVnKVxuICAgIF0uam9pbignXFxuJyk7XG4gICAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgcmVuZGVyV2lkdGgsIHJlbmRlckhlaWdodCk7XG5cbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuXG4gICAgY29udGV4dC5maWxsU3R5bGUgPSAnIzAwMDAwMCc7XG5cbiAgICBzdGF0ZS5tYXAubWFwKGZ1bmN0aW9uKGRvdCwgaW5kZXgpe1xuICAgICAgICBpZihkb3Qpe1xuICAgICAgICAgICAgY29udGV4dC5maWxsUmVjdChpbmRleCAqIDEwLCByZW5kZXJIZWlnaHQgLSAxMCwgMTAsIDEwKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29udGV4dC5maWxsU3R5bGUgPSAnI0ZGMDAwMCc7XG5cbiAgICBzdGF0ZS5idWdzLm1hcChmdW5jdGlvbihidWcpe1xuICAgICAgICBjb250ZXh0LmZpbGxSZWN0KGJ1Zy5kaXN0YW5jZSwgcmVuZGVySGVpZ2h0IC0gMTAgLSAoYnVnLmhlaWdodCAqIDEwKSwgMTAsIDEwKTtcbiAgICB9KTtcblxuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ2hzbGEoJyArIChzdGF0ZS5iZXN0QnVnLmFnZSAvIDIwKS50b1N0cmluZygpICsgJywgMTAwJSwgMzAlLCAwLjMpJztcbiAgICBjb250ZXh0LmZpbGxSZWN0KHN0YXRlLmJlc3RCdWcuZGlzdGFuY2UsIHJlbmRlckhlaWdodCAtIDEwIC0gKHN0YXRlLmJlc3RCdWcuaGVpZ2h0ICogMTApLCAxMCwgMTApO1xuXG4gICAgaWYoY3VycmVudEJlc3RCdWcpe1xuICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICdoc2woJyArIChjdXJyZW50QmVzdEJ1Zy5hZ2UgLyAyMCkudG9TdHJpbmcoKSArICcsIDEwMCUsIDMwJSknO1xuICAgICAgICBjb250ZXh0LmZpbGxSZWN0KGN1cnJlbnRCZXN0QnVnLmRpc3RhbmNlLCByZW5kZXJIZWlnaHQgLSAxMCAtIChjdXJyZW50QmVzdEJ1Zy5oZWlnaHQgKiAxMCksIDEwLCAxMCk7XG4gICAgfVxuXG4gICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbn07IiwidmFyIG5ldXJhbCA9IHJlcXVpcmUoJy4vbmV1cmFsJyk7XG52YXIgc2ltU2V0dGluZ3MgPSB7IHJlYWx0aW1lOiBmYWxzZSwgbmV1cm9uQ291bnQ6IDIwIH07XG52YXIgaW5wdXQgPSByZXF1aXJlKCcuL2lucHV0Jykoc2ltU2V0dGluZ3MpO1xudmFyIFJhbmRvbSA9IHJlcXVpcmUoXCJyYW5kb20tanNcIik7XG5cblxudmFyIHByZXZpb3VzTmV1cm9uU2V0dGluZ3MgPSBbXTtcblxudmFyIGlucHV0cyA9IHtcbiAgICBhZ2U6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmFnZTtcbiAgICB9LFxuICAgIGhlaWdodDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGVpZ2h0O1xuICAgIH0sXG4gICAgZW5lcmd5OiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5lbmVyZ3k7XG4gICAgfVxufTtcblxuZnVuY3Rpb24gY3JlYXRlRXllSW5wdXQoaW5kZXgpe1xuICAgIHJldHVybiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5kb3RQb3NpdGlvbnNbaW5kZXhdID8gMSA6IDA7XG4gICAgfTtcbn1cblxuZm9yKHZhciBpID0gMDsgaSA8IDIwOyBpKyspe1xuICAgIGlucHV0c1snbmV4dCcgKyBpXSA9IGNyZWF0ZUV5ZUlucHV0KGkpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDb25uZWN0aW9ucyhtYXhDb25uZWN0aW9ucywgbWF4SW5kZXgpe1xuICAgIHZhciByZXN1bHQgPSBbXTtcblxuICAgIHZhciBjb25uZWN0aW9ucyA9IE1hdGgubWF4KHBhcnNlSW50KChNYXRoLnJhbmRvbSgpICogbWF4Q29ubmVjdGlvbnMpICUgbWF4Q29ubmVjdGlvbnMpLCAxKTtcblxuICAgIHdoaWxlKGNvbm5lY3Rpb25zLS0pe1xuICAgICAgICByZXN1bHQucHVzaChwYXJzZUludChNYXRoLnJhbmRvbSgpICogbWF4SW5kZXgpICUgbWF4SW5kZXgpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbnZhciBtZXRob2RzID0gbmV1cmFsLm1ldGhvZHM7XG5cbmZ1bmN0aW9uIHJhbmRvbU5ldXJvbnMoKXtcbiAgICB2YXIgbmV1cm9ucyA9IFtdO1xuICAgIGZvcih2YXIgaiA9IDA7IGogPCBzaW1TZXR0aW5ncy5uZXVyb25Db3VudDsgaisrKXtcbiAgICAgICAgdmFyIG1ldGhvZEluZGV4ID0gcGFyc2VJbnQoTWF0aC5yYW5kb20oKSAqIG1ldGhvZHMubGVuZ3RoKSAlIG1ldGhvZHMubGVuZ3RoO1xuICAgICAgICBuZXVyb25zLnB1c2goe1xuICAgICAgICAgICAgbWV0aG9kOiBtZXRob2RzW21ldGhvZEluZGV4XSxcbiAgICAgICAgICAgIG1vZGlmaWVyOiBNYXRoLnJhbmRvbSgpLFxuICAgICAgICAgICAgaW5wdXRJbmRpY2llczogY3JlYXRlQ29ubmVjdGlvbnMoNSwgaiArIE9iamVjdC5rZXlzKGlucHV0cykubGVuZ3RoKVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV1cm9ucztcbn1cblxuZm9yKHZhciBpID0gMDsgaSA8IHNpbVNldHRpbmdzLm5ldXJvbkNvdW50OyBpKyspe1xuICAgIHByZXZpb3VzTmV1cm9uU2V0dGluZ3MucHVzaChyYW5kb21OZXVyb25zKCkpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVCdWcocHJldmlvdXNOZXVyb25TZXR0aW5ncywgcGF0ZXJuYWxMaW5lYWdlLCB0aWNrKXtcbiAgICB2YXIgYnVnID0gbmV1cmFsKHtcbiAgICAgICAgbXV0YXRpb246IDAuMDAwNSxcbiAgICAgICAgaW5wdXRzOiBpbnB1dHMsXG4gICAgICAgIG91dHB1dHM6IHtcbiAgICAgICAgICAgIHRocnVzdFg6IHRydWUsXG4gICAgICAgICAgICB0aHJ1c3RZOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHByZXZpb3VzTmV1cm9uU2V0dGluZ3M6IHByZXZpb3VzTmV1cm9uU2V0dGluZ3NcbiAgICB9KTtcblxuICAgIGJ1Zy5hZ2UgPSAwO1xuICAgIGJ1Zy5lbmVyZ3kgPSAxO1xuICAgIGJ1Zy5oZWlnaHQgPSAwO1xuICAgIGJ1Zy50aHJ1c3RYID0gMDtcbiAgICBidWcudGhydXN0WSA9IDA7XG4gICAgYnVnLmRpc3RhbmNlID0gMDtcbiAgICBidWcuZGlzdEZyb21Eb3QgPSAtMTtcbiAgICBidWcucGF0ZXJuYWxMaW5lYWdlID0gcGF0ZXJuYWxMaW5lYWdlIHx8IHtpZDogUmFuZG9tLnV1aWQ0KFJhbmRvbS5lbmdpbmVzLmJyb3dzZXJDcnlwdG8pLCB0aWNrOiB0aWNrfTtcblxuICAgIHJldHVybiBidWc7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNoaWxkKGJ1Zyl7XG4gICAgcmV0dXJuIGNyZWF0ZUJ1ZyhidWcubmV1cm9ucy5tYXAoZnVuY3Rpb24obmV1cm9uKXtcbiAgICAgICAgcmV0dXJuIG5ldXJvbi5zZXR0aW5ncztcbiAgICB9KSwgYnVnLnBhdGVybmFsTGluZWFnZSk7XG59XG5cbmZ1bmN0aW9uIHNwYXduQ2hpbGRGcm9tU2V4KHBhcmVudE9uZSwgcGFyZW50VHdvLCB0aWNrKXtcbiAgICBpZiAocGFyZW50T25lLm5ldXJvbnMubGVuZ3RoICE9PSBzaW1TZXR0aW5ncy5uZXVyb25Db3VudCB8fCBwYXJlbnRUd28ubmV1cm9ucy5sZW5ndGggIT09IHNpbVNldHRpbmdzLm5ldXJvbkNvdW50KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIG5ld0NoaWxkU2V0dGluZ3MgPSBbXTtcbiAgICB2YXIgcGFyZW50T25lQ29udHJpYnV0aW9uID0gWy4uLkFycmF5KHBhcmVudE9uZS5uZXVyb25zLmxlbmd0aCkua2V5cygpXTtcbiAgICB2YXIgcGFyZW50VHdvQ29udHJpYnV0aW9uID0gW107XG5cbiAgICBSYW5kb20uc2h1ZmZsZShSYW5kb20uZW5naW5lcy5icm93c2VyQ3J5cHRvLCBwYXJlbnRPbmUpO1xuXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IChzaW1TZXR0aW5ncy5uZXVyb25Db3VudCAvIDIpOyBpKyspe1xuICAgICAgICBwYXJlbnRUd29Db250cmlidXRpb24ucHVzaChwYXJlbnRPbmVDb250cmlidXRpb24ucG9wKCkpO1xuICAgIH1cblxuICAgIGZvcih2YXIgaiA9IDA7IGogPCBzaW1TZXR0aW5ncy5uZXVyb25Db3VudDsgaisrKXtcbiAgICAgICAgaWYgKHBhcmVudE9uZUNvbnRyaWJ1dGlvbi5pbmRleE9mKGopID4gLTEpIHtcbiAgICAgICAgICAgIG5ld0NoaWxkU2V0dGluZ3MucHVzaChwYXJlbnRPbmUubmV1cm9uc1tqXS5zZXR0aW5ncyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXdDaGlsZFNldHRpbmdzLnB1c2gocGFyZW50VHdvLm5ldXJvbnNbal0uc2V0dGluZ3MpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIG5ld0J1ZyA9IGNyZWF0ZUJ1ZyhuZXdDaGlsZFNldHRpbmdzLCBwYXJlbnRPbmUucGF0ZXJuYWxMaW5lYWdlLCB0aWNrKTtcblxuICAgIHJldHVybiBuZXdCdWc7XG59XG5cbmZ1bmN0aW9uIGZpbmRBQnVnQVBhcnRuZXIoc3VpdG9yLCBidWdzKXtcbiAgICAvL2ZpbmQgbWUgYSByYW5kb20gYnVnIHRoYXQgaXNuJ3QgYmVzdCBidWc/XG4gICAgdmFyIGNvbGxlY3Rpb24gPSBidWdzLnJlZHVjZSgoYWNjdW11bGF0b3IsIGN1cnJlbnRCdWcsIGN1cnJlbnRJbmRleCkgPT4ge1xuICAgICAgICBpZiAoY3VycmVudEJ1Zy5hZ2UgIT09IHN1aXRvci5hZ2UgJiYgY3VycmVudEJ1Zy5uZXVyb25zLmxlbmd0aCA9PT0gc3VpdG9yLm5ldXJvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBhY2N1bXVsYXRvci5wdXNoKGN1cnJlbnRJbmRleCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYWNjdW11bGF0b3I7XG4gICAgfSxbXSk7XG5cbiAgICByZXR1cm4gYnVnc1tSYW5kb20uc2h1ZmZsZShSYW5kb20uZW5naW5lcy5icm93c2VyQ3J5cHRvLGNvbGxlY3Rpb24pWzBdXTtcbn1cblxudmFyIG1hcCA9IFtdO1xuXG5mb3IodmFyIGkgPSAwOyBpIDwgMTIwOyBpKyspe1xuICAgIG1hcC5wdXNoKGZhbHNlKTtcbn1cblxudmFyIGJ1Z3MgPSBbXTtcblxudmFyIHJlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXInKTtcblxudmFyIHRpY2tzID0gMDtcbnZhciBsb29waW5nO1xudmFyIGJlc3RCdWc7XG52YXIgaXR0ZXJhdGlvbnNQZXI1MCA9IDA7XG5mdW5jdGlvbiBnYW1lTG9vcCgpe1xuICAgIHRpY2tzKys7XG4gICAgaWYoYnVncy5sZW5ndGggPCAyMCl7XG4gICAgICAgIHZhciBuZXdCdWc7XG4gICAgICAgIGlmKGJlc3RCdWcgJiYgTWF0aC5yYW5kb20oKSA+IDAuNSAmJiBidWdzLmxlbmd0aCA+IDEgJiYgYnVncy5zb21lKChidWcpID0+IHsgcmV0dXJuIGJ1Zy5uZXVyb25zLmxlbmd0aCA9PT0gc2ltU2V0dGluZ3MubmV1cm9uQ291bnQ7IH0pKXtcbiAgICAgICAgICAgIG5ld0J1ZyA9IHNwYXduQ2hpbGRGcm9tU2V4KGJlc3RCdWcsIGZpbmRBQnVnQVBhcnRuZXIoYmVzdEJ1ZywgYnVncyksIHRpY2tzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ld0J1ZyA9IGNyZWF0ZUJ1ZyhyYW5kb21OZXVyb25zKCksIG51bGwsIHRpY2tzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJ1Z3MucHVzaChuZXdCdWcpO1xuICAgIH1cblxuICAgIG1hcC5zaGlmdCgpO1xuICAgIG1hcC5wdXNoKG1hcC5zbGljZSgtMTApLnNvbWUoeCA9PiB4KSA/IGZhbHNlIDogTWF0aC5yYW5kb20oKSA8IGJ1Z3MubGVuZ3RoIC8gMjAwMCk7XG5cbiAgICB2YXIgc3Vydml2b3JzID0gW107XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGJ1Z3MubGVuZ3RoOyBpKyspe1xuICAgICAgICB2YXIgYnVnID0gYnVnc1tpXTtcbiAgICAgICAgYnVnLmFnZSsrO1xuICAgICAgICBidWcuZGlzdGFuY2UgKz0gYnVnLnRocnVzdFggKyAxO1xuXG4gICAgICAgIGlmKCFiZXN0QnVnIHx8IGJ1Zy5hZ2UgPiBiZXN0QnVnLmFnZSl7XG4gICAgICAgICAgICBzaW1TZXR0aW5ncy5yZWFsdGltZSA9IHRydWU7XG4gICAgICAgICAgICBiZXN0QnVnID0gYnVnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoYnVnLmRpc3RhbmNlID4gOTk5KXtcbiAgICAgICAgICAgIGJ1Zy5kaXN0YW5jZSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBpZihidWcuYWdlICYmICEoYnVnLmFnZSAlIDExMSkgJiYgYnVnLmFnZSA+IDMwMCl7XG4gICAgICAgICAgICBpZiAoYnVncy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgYnVncy5wdXNoKHNwYXduQ2hpbGRGcm9tU2V4KGJlc3RCdWcsIGZpbmRBQnVnQVBhcnRuZXIoYmVzdEJ1ZywgYnVncykpKTtcblxuICAgICAgICAgICAgICAgIGJ1Z3MgPSBidWdzLmZpbHRlcigoYnVnKSA9PiB7cmV0dXJuIGJ1Z30pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9vbiBkb3QsIGRpZVxuICAgICAgICBpZihidWcuZGlzdGFuY2UgPiAxMDAgJiYgYnVnLmhlaWdodCA8IDEgJiYgYnVnLm9uRG90KXtcbiAgICAgICAgICAgIGlmKGJ1ZyA9PT0gYmVzdEJ1Zyl7XG4gICAgICAgICAgICAgICAgc2ltU2V0dGluZ3MucmVhbHRpbWUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgc3Vydml2b3JzLnB1c2goYnVnKTtcblxuICAgICAgICAvL2ZhbGxcbiAgICAgICAgYnVnLmhlaWdodCArPSBidWcudGhydXN0WSAqIDI7XG4gICAgICAgIGJ1Zy5oZWlnaHQgPSBNYXRoLm1heCgwLCBidWcuaGVpZ2h0IC09IDAuNSk7XG4gICAgICAgIHZhciBtYXBQb3NpdGlvbiA9IHBhcnNlSW50KGJ1Zy5kaXN0YW5jZSAvIDEwKTtcbiAgICAgICAgYnVnLmRvdFBvc2l0aW9ucyA9IG1hcC5zbGljZShtYXBQb3NpdGlvbiwgbWFwUG9zaXRpb24gKyAyMCk7XG4gICAgICAgIGJ1Zy5vbkRvdCA9IGJ1Zy5kb3RQb3NpdGlvbnNbMF07XG5cbiAgICAgICAgaWYoIWJ1Zy5oZWlnaHQpe1xuICAgICAgICAgICAgaWYoYnVnLmVuZXJneSA+IDAuMil7XG4gICAgICAgICAgICAgICAgdmFyIHRocnVzdFkgPSBidWcub3V0cHV0cy50aHJ1c3RZKCk7XG4gICAgICAgICAgICAgICAgYnVnLnRocnVzdFkgKz0gTWF0aC5taW4odGhydXN0WSwgYnVnLmVuZXJneSk7XG4gICAgICAgICAgICAgICAgYnVnLmVuZXJneSA9IE1hdGgubWF4KDAsIGJ1Zy5lbmVyZ3kgLSBidWcudGhydXN0WSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgdGhydXN0WCA9IGJ1Zy5vdXRwdXRzLnRocnVzdFgoKTtcbiAgICAgICAgICAgICAgICBidWcudGhydXN0WCArPSBNYXRoLm1pbih0aHJ1c3RYLCBidWcuZW5lcmd5KTtcbiAgICAgICAgICAgICAgICBidWcuZW5lcmd5ID0gTWF0aC5tYXgoMCwgYnVnLmVuZXJneSAtIGJ1Zy50aHJ1c3RYKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJ1Zy5lbmVyZ3kgPSBNYXRoLm1pbigxLCBidWcuZW5lcmd5ICsgMC4xKTtcbiAgICAgICAgfVxuICAgICAgICBpZihidWcudGhydXN0WSA+IDApe1xuICAgICAgICAgICAgYnVnLnRocnVzdFkgLT0gMC4xO1xuICAgICAgICB9XG4gICAgICAgIGlmKGJ1Zy50aHJ1c3RYID4gMC4xIHx8IGJ1Zy50aHJ1c3RYIDwgLTAuMSl7XG4gICAgICAgICAgICBidWcudGhydXN0WCAqPSAwLjk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBidWdzID0gc3Vydml2b3JzO1xuXG4gICAgaWYobG9vcGluZyl7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZighc2ltU2V0dGluZ3MucmVhbHRpbWUpe1xuICAgICAgICBsb29waW5nID0gdHJ1ZTtcbiAgICAgICAgdmFyIHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgaXR0ZXJhdGlvbnNQZXI1MCA9IDA7XG4gICAgICAgIHdoaWxlKERhdGUubm93KCkgLSBzdGFydCA8IDUwKXtcbiAgICAgICAgICAgIGl0dGVyYXRpb25zUGVyNTArKztcbiAgICAgICAgICAgIGdhbWVMb29wKCk7XG4gICAgICAgICAgICBpZihzaW1TZXR0aW5ncy5yZWFsdGltZSl7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbG9vcGluZyA9IGZhbHNlO1xuICAgICAgICBzZXRUaW1lb3V0KGdhbWVMb29wLCAwKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNldFRpbWVvdXQoZ2FtZUxvb3AsIDMwKTtcblxufVxuXG5mdW5jdGlvbiByZW5kZXIoKXtcbiAgICByZW5kZXJlcih7IHRpY2tzLCBidWdzLCBtYXAsIGJlc3RCdWcsIGl0dGVyYXRpb25zUGVyNTAgfSk7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG59XG5cbmdhbWVMb29wKCk7XG5cbnJlbmRlcigpO1xuXG4iXX0=
