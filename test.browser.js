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

for(var i = 0; i < 20; i++){
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
    var newChildSettings = [];
    var parentOneContribution = [...Array(20).keys()];
    var parentTwoContribution = [];

    for(var k = 0; k < 10; k++){
        Random.shuffle(Random.engines.browserCrypto, parentOne);
        parentTwoContribution.push(parentOneContribution.pop());
    }

    for(var l = 0; l < 20; l++){
        if (parentOneContribution.indexOf(l) > -1) {
             newChildSettings.push(parentOne.neurons[l].settings);
        } else {
            newChildSettings.push(parentTwo.neurons[l].settings);
        }
    }

    var newBug = createBug(newChildSettings, parentOne.paternalLineage, tick);

    return newBug;
}

function findABugAPartner(suitor, bugs){
    //find me a random bug that isn't best bug?
    var collection = bugs.reduce((accumulator, currentBug, currentIndex) => {
        if (currentBug.age !== suitor.age) {
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
        bestBug ?
            bugs.push(Math.random() > 0.5 && bugs.length > 1 ? spawnChildFromSex(bestBug, findABugAPartner(bestBug, bugs), ticks): createBug(randomNeurons(), null, ticks)) :
            bugs.push(createBug(randomNeurons(), null, ticks));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbnB1dC5qcyIsIm5ldXJhbC5qcyIsIm5vZGVfbW9kdWxlcy9jcmVsL2NyZWwuanMiLCJub2RlX21vZHVsZXMvcmFuZG9tLWpzL2xpYi9yYW5kb20uanMiLCJyZW5kZXIuanMiLCJ0ZXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwidmFyIGNyZWwgPSByZXF1aXJlKCdjcmVsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2ltU2V0dGluZ3Mpe1xuICAgIHZhciB0b2dnbGU7XG4gICAgdmFyIG1lbnUgPSBjcmVsKCdkaXYnLFxuICAgICAgICAgICAgJ05ldXJvbnMgZm9yIG5ldyBidWdzOiAnLFxuICAgICAgICAgICAgbmV1cm9ucyA9IGNyZWwoJ2lucHV0JywgeyB0eXBlOiAnbnVtYmVyJywgdmFsdWU6IHNpbVNldHRpbmdzLm5ldXJvbkNvdW50IH0pLFxuICAgICAgICAgICAgdG9nZ2xlID0gY3JlbCgnYnV0dG9uJylcbiAgICAgICAgKTtcblxuICAgIG5ldXJvbnMuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGNvdW50ID0gcGFyc2VJbnQobmV1cm9ucy52YWx1ZSk7XG4gICAgICAgIGNvdW50ID0gTWF0aC5tYXgoMTAsIGNvdW50KTtcbiAgICAgICAgaWYoY291bnQgIT09IG5ldXJvbnMudmFsdWUpe1xuICAgICAgICAgICAgbmV1cm9ucy52YWx1ZSA9IGNvdW50O1xuICAgICAgICB9XG4gICAgICAgIHNpbVNldHRpbmdzLm5ldXJvbkNvdW50ID0gY291bnQ7XG4gICAgfSk7XG5cbiAgICB0b2dnbGUudGV4dENvbnRlbnQgPSAnUmVhbHRpbWUnO1xuXG4gICAgdG9nZ2xlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgc2ltU2V0dGluZ3MucmVhbHRpbWUgPSAhc2ltU2V0dGluZ3MucmVhbHRpbWU7XG4gICAgfSk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobWVudSk7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBydW4oKXtcbiAgICAgICAgdG9nZ2xlLnRleHRDb250ZW50ID0gc2ltU2V0dGluZ3MucmVhbHRpbWUgPyAnUmVhbCBUaW1lJyA6ICdIeXBlcnNwZWVkJztcblxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocnVuKTtcbiAgICB9XG5cbiAgICBydW4oKTtcbn07IiwidmFyIG1ldGhvZHMgPSB7XG4gICAgbXVsdGlwbHk6IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gYSAqIGI7XG4gICAgfSxcbiAgICBkaXZpZGU6IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gYSAvIGI7XG4gICAgfSxcbiAgICBhZGQ6IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gYSArIGI7XG4gICAgfSxcbiAgICBzdWJ0cmFjdDogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBhIC0gYjtcbiAgICB9LFxuICAgIHBvd2VyOiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIE1hdGgucG93KGEsIGIpO1xuICAgIH0sXG4gICAgbW9kOiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIGEgJSBiICogMTA7XG4gICAgfSxcbiAgICBpbnZlcnQ6IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gTWF0aC5hYnMoYSAqIC1iKTtcbiAgICB9LFxuICAgIHNpbjogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBNYXRoLnNpbihNYXRoLlBJICogYSAvIGIpO1xuICAgIH0sXG4gICAgY29zOiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIE1hdGguY29zKE1hdGguUEkgKiBhIC8gYik7XG4gICAgfSxcbiAgICB0YW46IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gTWF0aC50YW4oTWF0aC5QSSAqIGEgLyBiKTtcbiAgICB9LFxuICAgIGxvZzogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBNYXRoLmxvZyhhLCBiKTtcbiAgICB9XG59O1xuXG5mdW5jdGlvbiBtYWtlTmV1cm9uKG5ldXJvbnMsIHNldHRpbmdzKXtcbiAgICB2YXIgaW5wdXRJbmRpY2llcyA9IHNldHRpbmdzLmlucHV0SW5kaWNpZXMuc2xpY2UoKTtcblxuICAgIHZhciBuZXVyb24gPSBmdW5jdGlvbigpe1xuICAgICAgICAvLyB2YXIgcmVzdWx0ID0gTWF0aC5wb3coaW5wdXRJbmRpY2llcy5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBpbmRleCl7XG4gICAgICAgIC8vICAgICByZXR1cm4gcmVzdWx0ICsgTWF0aC5wb3cobmV1cm9uc1tpbmRleF0oKSwgMik7XG4gICAgICAgIC8vIH0sIDApLCAwLjUpO1xuXG4gICAgICAgIHZhciByZXN1bHQgPSAwO1xuICAgICAgICBpZihpbnB1dEluZGljaWVzKXtcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBpbnB1dEluZGljaWVzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gbmV1cm9uc1tpbnB1dEluZGljaWVzW2ldXSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0IC89IGlucHV0SW5kaWNpZXMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIC8vIHZhciByZXN1bHQgPSBpbnB1dEluZGljaWVzID8gaW5wdXRJbmRpY2llcy5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBpbmRleCl7XG4gICAgICAgIC8vICAgICByZXR1cm4gcmVzdWx0ICsgbmV1cm9uc1tpbmRleF0oKTtcbiAgICAgICAgLy8gfSwgMCkgLyBpbnB1dEluZGljaWVzLmxlbmd0aCA6IDA7XG5cbiAgICAgICAgcmVzdWx0ID0gbWV0aG9kc1tzZXR0aW5ncy5tZXRob2RdKHJlc3VsdCwgc2V0dGluZ3MubW9kaWZpZXIpO1xuXG4gICAgICAgIHJlc3VsdCA9IE1hdGgubWluKDEsIHJlc3VsdCk7XG4gICAgICAgIHJlc3VsdCA9IE1hdGgubWF4KDAsIHJlc3VsdCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICAgIG5ldXJvbi5zZXR0aW5ncyA9IHNldHRpbmdzO1xuXG4gICAgcmV0dXJuIG5ldXJvbjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuZXR3b3JrU2V0dGluZ3Mpe1xuICAgIHZhciBuZXR3b3JrID0ge307XG5cbiAgICB2YXIgaW5wdXRzID0gbmV0d29ya1NldHRpbmdzLmlucHV0cyxcbiAgICAgICAgb3V0cHV0cyA9IG5ldHdvcmtTZXR0aW5ncy5vdXRwdXRzLFxuICAgICAgICBwcmV2aW91c05ldXJvblNldHRpbmdzID0gbmV0d29ya1NldHRpbmdzLnByZXZpb3VzTmV1cm9uU2V0dGluZ3MsXG4gICAgICAgIGlucHV0TmV1cm9ucyA9IE9iamVjdC5rZXlzKG5ldHdvcmtTZXR0aW5ncy5pbnB1dHMpLm1hcChmdW5jdGlvbihrZXkpe1xuICAgICAgICAgICAgcmV0dXJuIG5ldHdvcmtTZXR0aW5ncy5pbnB1dHNba2V5XS5iaW5kKG5ldHdvcmspO1xuICAgICAgICB9KSxcbiAgICAgICAgbmV1cm9ucyA9IGlucHV0TmV1cm9ucy5zbGljZSgpO1xuXG4gICAgcHJldmlvdXNOZXVyb25TZXR0aW5ncy5tYXAoZnVuY3Rpb24obmV1cm9uU2V0dGluZ3Mpe1xuICAgICAgICB2YXIgbmV3TmV1cm9uU2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiBuZXVyb25TZXR0aW5ncy5tZXRob2QsXG4gICAgICAgICAgICAgICAgaW5wdXRJbmRpY2llczogbmV1cm9uU2V0dGluZ3MuaW5wdXRJbmRpY2llcyxcbiAgICAgICAgICAgICAgICBtb2RpZmllcjogbmV1cm9uU2V0dGluZ3MubW9kaWZpZXIgKiAoMSArIChNYXRoLnJhbmRvbSgpICogKG5ldHdvcmtTZXR0aW5ncy5tdXRhdGlvbiAqIDIpIC0gbmV0d29ya1NldHRpbmdzLm11dGF0aW9uKSlcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgbmV1cm9ucy5wdXNoKG1ha2VOZXVyb24obmV1cm9ucywgbmV3TmV1cm9uU2V0dGluZ3MpKTtcbiAgICB9KTtcblxuICAgIHZhciBvdXRwdXROZXVyb25zID0gbmV1cm9ucy5zbGljZSgtIE9iamVjdC5rZXlzKG91dHB1dHMpLmxlbmd0aCk7XG5cbiAgICB2YXIgaW5wdXRNYXAgPSBPYmplY3Qua2V5cyhpbnB1dHMpLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGtleSl7XG4gICAgICAgIHJlc3VsdFtrZXldID0gaW5wdXROZXVyb25zLnBvcCgpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwge30pO1xuXG4gICAgdmFyIG91dHB1dE1hcCA9IE9iamVjdC5rZXlzKG91dHB1dHMpLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGtleSl7XG4gICAgICAgIHJlc3VsdFtrZXldID0gb3V0cHV0TmV1cm9ucy5wb3AoKTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIHt9KTtcblxuICAgIG5ldHdvcmsuaW5wdXRzID0gaW5wdXRNYXA7XG4gICAgbmV0d29yay5vdXRwdXRzID0gb3V0cHV0TWFwO1xuICAgIG5ldHdvcmsubmV1cm9ucyA9IG5ldXJvbnMuc2xpY2UoT2JqZWN0LmtleXMoaW5wdXRzKS5sZW5ndGgpO1xuXG4gICAgcmV0dXJuIG5ldHdvcms7XG59O1xubW9kdWxlLmV4cG9ydHMubWV0aG9kcyA9IE9iamVjdC5rZXlzKG1ldGhvZHMpOyIsIi8vQ29weXJpZ2h0IChDKSAyMDEyIEtvcnkgTnVublxyXG5cclxuLy9QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG5cclxuLy9UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuXHJcbi8vVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXHJcblxyXG4vKlxyXG5cclxuICAgIFRoaXMgY29kZSBpcyBub3QgZm9ybWF0dGVkIGZvciByZWFkYWJpbGl0eSwgYnV0IHJhdGhlciBydW4tc3BlZWQgYW5kIHRvIGFzc2lzdCBjb21waWxlcnMuXHJcblxyXG4gICAgSG93ZXZlciwgdGhlIGNvZGUncyBpbnRlbnRpb24gc2hvdWxkIGJlIHRyYW5zcGFyZW50LlxyXG5cclxuICAgICoqKiBJRSBTVVBQT1JUICoqKlxyXG5cclxuICAgIElmIHlvdSByZXF1aXJlIHRoaXMgbGlicmFyeSB0byB3b3JrIGluIElFNywgYWRkIHRoZSBmb2xsb3dpbmcgYWZ0ZXIgZGVjbGFyaW5nIGNyZWwuXHJcblxyXG4gICAgdmFyIHRlc3REaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcclxuICAgICAgICB0ZXN0TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xyXG5cclxuICAgIHRlc3REaXYuc2V0QXR0cmlidXRlKCdjbGFzcycsICdhJyk7XHJcbiAgICB0ZXN0RGl2WydjbGFzc05hbWUnXSAhPT0gJ2EnID8gY3JlbC5hdHRyTWFwWydjbGFzcyddID0gJ2NsYXNzTmFtZSc6dW5kZWZpbmVkO1xyXG4gICAgdGVzdERpdi5zZXRBdHRyaWJ1dGUoJ25hbWUnLCdhJyk7XHJcbiAgICB0ZXN0RGl2WyduYW1lJ10gIT09ICdhJyA/IGNyZWwuYXR0ck1hcFsnbmFtZSddID0gZnVuY3Rpb24oZWxlbWVudCwgdmFsdWUpe1xyXG4gICAgICAgIGVsZW1lbnQuaWQgPSB2YWx1ZTtcclxuICAgIH06dW5kZWZpbmVkO1xyXG5cclxuXHJcbiAgICB0ZXN0TGFiZWwuc2V0QXR0cmlidXRlKCdmb3InLCAnYScpO1xyXG4gICAgdGVzdExhYmVsWydodG1sRm9yJ10gIT09ICdhJyA/IGNyZWwuYXR0ck1hcFsnZm9yJ10gPSAnaHRtbEZvcic6dW5kZWZpbmVkO1xyXG5cclxuXHJcblxyXG4qL1xyXG5cclxuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XHJcbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgICAgIGRlZmluZShmYWN0b3J5KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcm9vdC5jcmVsID0gZmFjdG9yeSgpO1xyXG4gICAgfVxyXG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBmbiA9ICdmdW5jdGlvbicsXHJcbiAgICAgICAgb2JqID0gJ29iamVjdCcsXHJcbiAgICAgICAgbm9kZVR5cGUgPSAnbm9kZVR5cGUnLFxyXG4gICAgICAgIHRleHRDb250ZW50ID0gJ3RleHRDb250ZW50JyxcclxuICAgICAgICBzZXRBdHRyaWJ1dGUgPSAnc2V0QXR0cmlidXRlJyxcclxuICAgICAgICBhdHRyTWFwU3RyaW5nID0gJ2F0dHJNYXAnLFxyXG4gICAgICAgIGlzTm9kZVN0cmluZyA9ICdpc05vZGUnLFxyXG4gICAgICAgIGlzRWxlbWVudFN0cmluZyA9ICdpc0VsZW1lbnQnLFxyXG4gICAgICAgIGQgPSB0eXBlb2YgZG9jdW1lbnQgPT09IG9iaiA/IGRvY3VtZW50IDoge30sXHJcbiAgICAgICAgaXNUeXBlID0gZnVuY3Rpb24oYSwgdHlwZSl7XHJcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgYSA9PT0gdHlwZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzTm9kZSA9IHR5cGVvZiBOb2RlID09PSBmbiA/IGZ1bmN0aW9uIChvYmplY3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9iamVjdCBpbnN0YW5jZW9mIE5vZGU7XHJcbiAgICAgICAgfSA6XHJcbiAgICAgICAgLy8gaW4gSUUgPD0gOCBOb2RlIGlzIGFuIG9iamVjdCwgb2J2aW91c2x5Li5cclxuICAgICAgICBmdW5jdGlvbihvYmplY3Qpe1xyXG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0ICYmXHJcbiAgICAgICAgICAgICAgICBpc1R5cGUob2JqZWN0LCBvYmopICYmXHJcbiAgICAgICAgICAgICAgICAobm9kZVR5cGUgaW4gb2JqZWN0KSAmJlxyXG4gICAgICAgICAgICAgICAgaXNUeXBlKG9iamVjdC5vd25lckRvY3VtZW50LG9iaik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpc0VsZW1lbnQgPSBmdW5jdGlvbiAob2JqZWN0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjcmVsW2lzTm9kZVN0cmluZ10ob2JqZWN0KSAmJiBvYmplY3Rbbm9kZVR5cGVdID09PSAxO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNBcnJheSA9IGZ1bmN0aW9uKGEpe1xyXG4gICAgICAgICAgICByZXR1cm4gYSBpbnN0YW5jZW9mIEFycmF5O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYXBwZW5kQ2hpbGQgPSBmdW5jdGlvbihlbGVtZW50LCBjaGlsZCkge1xyXG4gICAgICAgICAgICBpZiAoaXNBcnJheShjaGlsZCkpIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkLm1hcChmdW5jdGlvbihzdWJDaGlsZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgYXBwZW5kQ2hpbGQoZWxlbWVudCwgc3ViQ2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoIWNyZWxbaXNOb2RlU3RyaW5nXShjaGlsZCkpe1xyXG4gICAgICAgICAgICAgICAgY2hpbGQgPSBkLmNyZWF0ZVRleHROb2RlKGNoaWxkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKGNoaWxkKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBjcmVsKCl7XHJcbiAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsIC8vTm90ZTogYXNzaWduZWQgdG8gYSB2YXJpYWJsZSB0byBhc3Npc3QgY29tcGlsZXJzLiBTYXZlcyBhYm91dCA0MCBieXRlcyBpbiBjbG9zdXJlIGNvbXBpbGVyLiBIYXMgbmVnbGlnYWJsZSBlZmZlY3Qgb24gcGVyZm9ybWFuY2UuXHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSBhcmdzWzBdLFxyXG4gICAgICAgICAgICBjaGlsZCxcclxuICAgICAgICAgICAgc2V0dGluZ3MgPSBhcmdzWzFdLFxyXG4gICAgICAgICAgICBjaGlsZEluZGV4ID0gMixcclxuICAgICAgICAgICAgYXJndW1lbnRzTGVuZ3RoID0gYXJncy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZU1hcCA9IGNyZWxbYXR0ck1hcFN0cmluZ107XHJcblxyXG4gICAgICAgIGVsZW1lbnQgPSBjcmVsW2lzRWxlbWVudFN0cmluZ10oZWxlbWVudCkgPyBlbGVtZW50IDogZC5jcmVhdGVFbGVtZW50KGVsZW1lbnQpO1xyXG4gICAgICAgIC8vIHNob3J0Y3V0XHJcbiAgICAgICAgaWYoYXJndW1lbnRzTGVuZ3RoID09PSAxKXtcclxuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZighaXNUeXBlKHNldHRpbmdzLG9iaikgfHwgY3JlbFtpc05vZGVTdHJpbmddKHNldHRpbmdzKSB8fCBpc0FycmF5KHNldHRpbmdzKSkge1xyXG4gICAgICAgICAgICAtLWNoaWxkSW5kZXg7XHJcbiAgICAgICAgICAgIHNldHRpbmdzID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHNob3J0Y3V0IGlmIHRoZXJlIGlzIG9ubHkgb25lIGNoaWxkIHRoYXQgaXMgYSBzdHJpbmdcclxuICAgICAgICBpZigoYXJndW1lbnRzTGVuZ3RoIC0gY2hpbGRJbmRleCkgPT09IDEgJiYgaXNUeXBlKGFyZ3NbY2hpbGRJbmRleF0sICdzdHJpbmcnKSAmJiBlbGVtZW50W3RleHRDb250ZW50XSAhPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgZWxlbWVudFt0ZXh0Q29udGVudF0gPSBhcmdzW2NoaWxkSW5kZXhdO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBmb3IoOyBjaGlsZEluZGV4IDwgYXJndW1lbnRzTGVuZ3RoOyArK2NoaWxkSW5kZXgpe1xyXG4gICAgICAgICAgICAgICAgY2hpbGQgPSBhcmdzW2NoaWxkSW5kZXhdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKGNoaWxkID09IG51bGwpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc0FycmF5KGNoaWxkKSkge1xyXG4gICAgICAgICAgICAgICAgICBmb3IgKHZhciBpPTA7IGkgPCBjaGlsZC5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFwcGVuZENoaWxkKGVsZW1lbnQsIGNoaWxkW2ldKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgYXBwZW5kQ2hpbGQoZWxlbWVudCwgY2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IodmFyIGtleSBpbiBzZXR0aW5ncyl7XHJcbiAgICAgICAgICAgIGlmKCFhdHRyaWJ1dGVNYXBba2V5XSl7XHJcbiAgICAgICAgICAgICAgICBpZihpc1R5cGUoc2V0dGluZ3Nba2V5XSxmbikpe1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRba2V5XSA9IHNldHRpbmdzW2tleV07XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50W3NldEF0dHJpYnV0ZV0oa2V5LCBzZXR0aW5nc1trZXldKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB2YXIgYXR0ciA9IGF0dHJpYnV0ZU1hcFtrZXldO1xyXG4gICAgICAgICAgICAgICAgaWYodHlwZW9mIGF0dHIgPT09IGZuKXtcclxuICAgICAgICAgICAgICAgICAgICBhdHRyKGVsZW1lbnQsIHNldHRpbmdzW2tleV0pO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudFtzZXRBdHRyaWJ1dGVdKGF0dHIsIHNldHRpbmdzW2tleV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVc2VkIGZvciBtYXBwaW5nIG9uZSBraW5kIG9mIGF0dHJpYnV0ZSB0byB0aGUgc3VwcG9ydGVkIHZlcnNpb24gb2YgdGhhdCBpbiBiYWQgYnJvd3NlcnMuXHJcbiAgICBjcmVsW2F0dHJNYXBTdHJpbmddID0ge307XHJcblxyXG4gICAgY3JlbFtpc0VsZW1lbnRTdHJpbmddID0gaXNFbGVtZW50O1xyXG5cclxuICAgIGNyZWxbaXNOb2RlU3RyaW5nXSA9IGlzTm9kZTtcclxuXHJcbiAgICBpZih0eXBlb2YgUHJveHkgIT09ICd1bmRlZmluZWQnKXtcclxuICAgICAgICBjcmVsLnByb3h5ID0gbmV3IFByb3h5KGNyZWwsIHtcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbih0YXJnZXQsIGtleSl7XHJcbiAgICAgICAgICAgICAgICAhKGtleSBpbiBjcmVsKSAmJiAoY3JlbFtrZXldID0gY3JlbC5iaW5kKG51bGwsIGtleSkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWxba2V5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjcmVsO1xyXG59KSk7XHJcbiIsIi8qanNoaW50IGVxbnVsbDp0cnVlKi9cbihmdW5jdGlvbiAocm9vdCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgR0xPQkFMX0tFWSA9IFwiUmFuZG9tXCI7XG5cbiAgdmFyIGltdWwgPSAodHlwZW9mIE1hdGguaW11bCAhPT0gXCJmdW5jdGlvblwiIHx8IE1hdGguaW11bCgweGZmZmZmZmZmLCA1KSAhPT0gLTUgP1xuICAgIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICB2YXIgYWggPSAoYSA+Pj4gMTYpICYgMHhmZmZmO1xuICAgICAgdmFyIGFsID0gYSAmIDB4ZmZmZjtcbiAgICAgIHZhciBiaCA9IChiID4+PiAxNikgJiAweGZmZmY7XG4gICAgICB2YXIgYmwgPSBiICYgMHhmZmZmO1xuICAgICAgLy8gdGhlIHNoaWZ0IGJ5IDAgZml4ZXMgdGhlIHNpZ24gb24gdGhlIGhpZ2ggcGFydFxuICAgICAgLy8gdGhlIGZpbmFsIHwwIGNvbnZlcnRzIHRoZSB1bnNpZ25lZCB2YWx1ZSBpbnRvIGEgc2lnbmVkIHZhbHVlXG4gICAgICByZXR1cm4gKGFsICogYmwpICsgKCgoYWggKiBibCArIGFsICogYmgpIDw8IDE2KSA+Pj4gMCkgfCAwO1xuICAgIH0gOlxuICAgIE1hdGguaW11bCk7XG5cbiAgdmFyIHN0cmluZ1JlcGVhdCA9ICh0eXBlb2YgU3RyaW5nLnByb3RvdHlwZS5yZXBlYXQgPT09IFwiZnVuY3Rpb25cIiAmJiBcInhcIi5yZXBlYXQoMykgPT09IFwieHh4XCIgP1xuICAgIGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICByZXR1cm4geC5yZXBlYXQoeSk7XG4gICAgfSA6IGZ1bmN0aW9uIChwYXR0ZXJuLCBjb3VudCkge1xuICAgICAgdmFyIHJlc3VsdCA9IFwiXCI7XG4gICAgICB3aGlsZSAoY291bnQgPiAwKSB7XG4gICAgICAgIGlmIChjb3VudCAmIDEpIHtcbiAgICAgICAgICByZXN1bHQgKz0gcGF0dGVybjtcbiAgICAgICAgfVxuICAgICAgICBjb3VudCA+Pj0gMTtcbiAgICAgICAgcGF0dGVybiArPSBwYXR0ZXJuO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9KTtcblxuICBmdW5jdGlvbiBSYW5kb20oZW5naW5lKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFJhbmRvbSkpIHtcbiAgICAgIHJldHVybiBuZXcgUmFuZG9tKGVuZ2luZSk7XG4gICAgfVxuXG4gICAgaWYgKGVuZ2luZSA9PSBudWxsKSB7XG4gICAgICBlbmdpbmUgPSBSYW5kb20uZW5naW5lcy5uYXRpdmVNYXRoO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGVuZ2luZSAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRXhwZWN0ZWQgZW5naW5lIHRvIGJlIGEgZnVuY3Rpb24sIGdvdCBcIiArIHR5cGVvZiBlbmdpbmUpO1xuICAgIH1cbiAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZTtcbiAgfVxuICB2YXIgcHJvdG8gPSBSYW5kb20ucHJvdG90eXBlO1xuXG4gIFJhbmRvbS5lbmdpbmVzID0ge1xuICAgIG5hdGl2ZU1hdGg6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAoTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMDAwKSB8IDA7XG4gICAgfSxcbiAgICBtdDE5OTM3OiAoZnVuY3Rpb24gKEludDMyQXJyYXkpIHtcbiAgICAgIC8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTWVyc2VubmVfdHdpc3RlclxuICAgICAgZnVuY3Rpb24gcmVmcmVzaERhdGEoZGF0YSkge1xuICAgICAgICB2YXIgayA9IDA7XG4gICAgICAgIHZhciB0bXAgPSAwO1xuICAgICAgICBmb3IgKDtcbiAgICAgICAgICAoayB8IDApIDwgMjI3OyBrID0gKGsgKyAxKSB8IDApIHtcbiAgICAgICAgICB0bXAgPSAoZGF0YVtrXSAmIDB4ODAwMDAwMDApIHwgKGRhdGFbKGsgKyAxKSB8IDBdICYgMHg3ZmZmZmZmZik7XG4gICAgICAgICAgZGF0YVtrXSA9IGRhdGFbKGsgKyAzOTcpIHwgMF0gXiAodG1wID4+PiAxKSBeICgodG1wICYgMHgxKSA/IDB4OTkwOGIwZGYgOiAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoO1xuICAgICAgICAgIChrIHwgMCkgPCA2MjM7IGsgPSAoayArIDEpIHwgMCkge1xuICAgICAgICAgIHRtcCA9IChkYXRhW2tdICYgMHg4MDAwMDAwMCkgfCAoZGF0YVsoayArIDEpIHwgMF0gJiAweDdmZmZmZmZmKTtcbiAgICAgICAgICBkYXRhW2tdID0gZGF0YVsoayAtIDIyNykgfCAwXSBeICh0bXAgPj4+IDEpIF4gKCh0bXAgJiAweDEpID8gMHg5OTA4YjBkZiA6IDApO1xuICAgICAgICB9XG5cbiAgICAgICAgdG1wID0gKGRhdGFbNjIzXSAmIDB4ODAwMDAwMDApIHwgKGRhdGFbMF0gJiAweDdmZmZmZmZmKTtcbiAgICAgICAgZGF0YVs2MjNdID0gZGF0YVszOTZdIF4gKHRtcCA+Pj4gMSkgXiAoKHRtcCAmIDB4MSkgPyAweDk5MDhiMGRmIDogMCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHRlbXBlcih2YWx1ZSkge1xuICAgICAgICB2YWx1ZSBePSB2YWx1ZSA+Pj4gMTE7XG4gICAgICAgIHZhbHVlIF49ICh2YWx1ZSA8PCA3KSAmIDB4OWQyYzU2ODA7XG4gICAgICAgIHZhbHVlIF49ICh2YWx1ZSA8PCAxNSkgJiAweGVmYzYwMDAwO1xuICAgICAgICByZXR1cm4gdmFsdWUgXiAodmFsdWUgPj4+IDE4KTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2VlZFdpdGhBcnJheShkYXRhLCBzb3VyY2UpIHtcbiAgICAgICAgdmFyIGkgPSAxO1xuICAgICAgICB2YXIgaiA9IDA7XG4gICAgICAgIHZhciBzb3VyY2VMZW5ndGggPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICB2YXIgayA9IE1hdGgubWF4KHNvdXJjZUxlbmd0aCwgNjI0KSB8IDA7XG4gICAgICAgIHZhciBwcmV2aW91cyA9IGRhdGFbMF0gfCAwO1xuICAgICAgICBmb3IgKDtcbiAgICAgICAgICAoayB8IDApID4gMDsgLS1rKSB7XG4gICAgICAgICAgZGF0YVtpXSA9IHByZXZpb3VzID0gKChkYXRhW2ldIF4gaW11bCgocHJldmlvdXMgXiAocHJldmlvdXMgPj4+IDMwKSksIDB4MDAxOTY2MGQpKSArIChzb3VyY2Vbal0gfCAwKSArIChqIHwgMCkpIHwgMDtcbiAgICAgICAgICBpID0gKGkgKyAxKSB8IDA7XG4gICAgICAgICAgKytqO1xuICAgICAgICAgIGlmICgoaSB8IDApID4gNjIzKSB7XG4gICAgICAgICAgICBkYXRhWzBdID0gZGF0YVs2MjNdO1xuICAgICAgICAgICAgaSA9IDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChqID49IHNvdXJjZUxlbmd0aCkge1xuICAgICAgICAgICAgaiA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoayA9IDYyMztcbiAgICAgICAgICAoayB8IDApID4gMDsgLS1rKSB7XG4gICAgICAgICAgZGF0YVtpXSA9IHByZXZpb3VzID0gKChkYXRhW2ldIF4gaW11bCgocHJldmlvdXMgXiAocHJldmlvdXMgPj4+IDMwKSksIDB4NWQ1ODhiNjUpKSAtIGkpIHwgMDtcbiAgICAgICAgICBpID0gKGkgKyAxKSB8IDA7XG4gICAgICAgICAgaWYgKChpIHwgMCkgPiA2MjMpIHtcbiAgICAgICAgICAgIGRhdGFbMF0gPSBkYXRhWzYyM107XG4gICAgICAgICAgICBpID0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZGF0YVswXSA9IDB4ODAwMDAwMDA7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG10MTk5MzcoKSB7XG4gICAgICAgIHZhciBkYXRhID0gbmV3IEludDMyQXJyYXkoNjI0KTtcbiAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgdmFyIHVzZXMgPSAwO1xuXG4gICAgICAgIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgaWYgKChpbmRleCB8IDApID49IDYyNCkge1xuICAgICAgICAgICAgcmVmcmVzaERhdGEoZGF0YSk7XG4gICAgICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIHZhbHVlID0gZGF0YVtpbmRleF07XG4gICAgICAgICAgaW5kZXggPSAoaW5kZXggKyAxKSB8IDA7XG4gICAgICAgICAgdXNlcyArPSAxO1xuICAgICAgICAgIHJldHVybiB0ZW1wZXIodmFsdWUpIHwgMDtcbiAgICAgICAgfVxuICAgICAgICBuZXh0LmdldFVzZUNvdW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHVzZXM7XG4gICAgICAgIH07XG4gICAgICAgIG5leHQuZGlzY2FyZCA9IGZ1bmN0aW9uIChjb3VudCkge1xuICAgICAgICAgIHVzZXMgKz0gY291bnQ7XG4gICAgICAgICAgaWYgKChpbmRleCB8IDApID49IDYyNCkge1xuICAgICAgICAgICAgcmVmcmVzaERhdGEoZGF0YSk7XG4gICAgICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHdoaWxlICgoY291bnQgLSBpbmRleCkgPiA2MjQpIHtcbiAgICAgICAgICAgIGNvdW50IC09IDYyNCAtIGluZGV4O1xuICAgICAgICAgICAgcmVmcmVzaERhdGEoZGF0YSk7XG4gICAgICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIGluZGV4ID0gKGluZGV4ICsgY291bnQpIHwgMDtcbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfTtcbiAgICAgICAgbmV4dC5zZWVkID0gZnVuY3Rpb24gKGluaXRpYWwpIHtcbiAgICAgICAgICB2YXIgcHJldmlvdXMgPSAwO1xuICAgICAgICAgIGRhdGFbMF0gPSBwcmV2aW91cyA9IGluaXRpYWwgfCAwO1xuXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCA2MjQ7IGkgPSAoaSArIDEpIHwgMCkge1xuICAgICAgICAgICAgZGF0YVtpXSA9IHByZXZpb3VzID0gKGltdWwoKHByZXZpb3VzIF4gKHByZXZpb3VzID4+PiAzMCkpLCAweDZjMDc4OTY1KSArIGkpIHwgMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaW5kZXggPSA2MjQ7XG4gICAgICAgICAgdXNlcyA9IDA7XG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH07XG4gICAgICAgIG5leHQuc2VlZFdpdGhBcnJheSA9IGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgICAgICBuZXh0LnNlZWQoMHgwMTJiZDZhYSk7XG4gICAgICAgICAgc2VlZFdpdGhBcnJheShkYXRhLCBzb3VyY2UpO1xuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9O1xuICAgICAgICBuZXh0LmF1dG9TZWVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBuZXh0LnNlZWRXaXRoQXJyYXkoUmFuZG9tLmdlbmVyYXRlRW50cm9weUFycmF5KCkpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG10MTk5Mzc7XG4gICAgfSh0eXBlb2YgSW50MzJBcnJheSA9PT0gXCJmdW5jdGlvblwiID8gSW50MzJBcnJheSA6IEFycmF5KSksXG4gICAgYnJvd3NlckNyeXB0bzogKHR5cGVvZiBjcnlwdG8gIT09IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgSW50MzJBcnJheSA9PT0gXCJmdW5jdGlvblwiKSA/IChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZGF0YSA9IG51bGw7XG4gICAgICB2YXIgaW5kZXggPSAxMjg7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChpbmRleCA+PSAxMjgpIHtcbiAgICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgZGF0YSA9IG5ldyBJbnQzMkFycmF5KDEyOCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoZGF0YSk7XG4gICAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRhdGFbaW5kZXgrK10gfCAwO1xuICAgICAgfTtcbiAgICB9KCkpIDogbnVsbFxuICB9O1xuXG4gIFJhbmRvbS5nZW5lcmF0ZUVudHJvcHlBcnJheSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYXJyYXkgPSBbXTtcbiAgICB2YXIgZW5naW5lID0gUmFuZG9tLmVuZ2luZXMubmF0aXZlTWF0aDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDE2OyArK2kpIHtcbiAgICAgIGFycmF5W2ldID0gZW5naW5lKCkgfCAwO1xuICAgIH1cbiAgICBhcnJheS5wdXNoKG5ldyBEYXRlKCkuZ2V0VGltZSgpIHwgMCk7XG4gICAgcmV0dXJuIGFycmF5O1xuICB9O1xuXG4gIGZ1bmN0aW9uIHJldHVyblZhbHVlKHZhbHVlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICB9XG5cbiAgLy8gWy0weDgwMDAwMDAwLCAweDdmZmZmZmZmXVxuICBSYW5kb20uaW50MzIgPSBmdW5jdGlvbiAoZW5naW5lKSB7XG4gICAgcmV0dXJuIGVuZ2luZSgpIHwgMDtcbiAgfTtcbiAgcHJvdG8uaW50MzIgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFJhbmRvbS5pbnQzMih0aGlzLmVuZ2luZSk7XG4gIH07XG5cbiAgLy8gWzAsIDB4ZmZmZmZmZmZdXG4gIFJhbmRvbS51aW50MzIgPSBmdW5jdGlvbiAoZW5naW5lKSB7XG4gICAgcmV0dXJuIGVuZ2luZSgpID4+PiAwO1xuICB9O1xuICBwcm90by51aW50MzIgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFJhbmRvbS51aW50MzIodGhpcy5lbmdpbmUpO1xuICB9O1xuXG4gIC8vIFswLCAweDFmZmZmZmZmZmZmZmZmXVxuICBSYW5kb20udWludDUzID0gZnVuY3Rpb24gKGVuZ2luZSkge1xuICAgIHZhciBoaWdoID0gZW5naW5lKCkgJiAweDFmZmZmZjtcbiAgICB2YXIgbG93ID0gZW5naW5lKCkgPj4+IDA7XG4gICAgcmV0dXJuIChoaWdoICogMHgxMDAwMDAwMDApICsgbG93O1xuICB9O1xuICBwcm90by51aW50NTMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFJhbmRvbS51aW50NTModGhpcy5lbmdpbmUpO1xuICB9O1xuXG4gIC8vIFswLCAweDIwMDAwMDAwMDAwMDAwXVxuICBSYW5kb20udWludDUzRnVsbCA9IGZ1bmN0aW9uIChlbmdpbmUpIHtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgdmFyIGhpZ2ggPSBlbmdpbmUoKSB8IDA7XG4gICAgICBpZiAoaGlnaCAmIDB4MjAwMDAwKSB7XG4gICAgICAgIGlmICgoaGlnaCAmIDB4M2ZmZmZmKSA9PT0gMHgyMDAwMDAgJiYgKGVuZ2luZSgpIHwgMCkgPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gMHgyMDAwMDAwMDAwMDAwMDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGxvdyA9IGVuZ2luZSgpID4+PiAwO1xuICAgICAgICByZXR1cm4gKChoaWdoICYgMHgxZmZmZmYpICogMHgxMDAwMDAwMDApICsgbG93O1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgcHJvdG8udWludDUzRnVsbCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUmFuZG9tLnVpbnQ1M0Z1bGwodGhpcy5lbmdpbmUpO1xuICB9O1xuXG4gIC8vIFstMHgyMDAwMDAwMDAwMDAwMCwgMHgxZmZmZmZmZmZmZmZmZl1cbiAgUmFuZG9tLmludDUzID0gZnVuY3Rpb24gKGVuZ2luZSkge1xuICAgIHZhciBoaWdoID0gZW5naW5lKCkgfCAwO1xuICAgIHZhciBsb3cgPSBlbmdpbmUoKSA+Pj4gMDtcbiAgICByZXR1cm4gKChoaWdoICYgMHgxZmZmZmYpICogMHgxMDAwMDAwMDApICsgbG93ICsgKGhpZ2ggJiAweDIwMDAwMCA/IC0weDIwMDAwMDAwMDAwMDAwIDogMCk7XG4gIH07XG4gIHByb3RvLmludDUzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSYW5kb20uaW50NTModGhpcy5lbmdpbmUpO1xuICB9O1xuXG4gIC8vIFstMHgyMDAwMDAwMDAwMDAwMCwgMHgyMDAwMDAwMDAwMDAwMF1cbiAgUmFuZG9tLmludDUzRnVsbCA9IGZ1bmN0aW9uIChlbmdpbmUpIHtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgdmFyIGhpZ2ggPSBlbmdpbmUoKSB8IDA7XG4gICAgICBpZiAoaGlnaCAmIDB4NDAwMDAwKSB7XG4gICAgICAgIGlmICgoaGlnaCAmIDB4N2ZmZmZmKSA9PT0gMHg0MDAwMDAgJiYgKGVuZ2luZSgpIHwgMCkgPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gMHgyMDAwMDAwMDAwMDAwMDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGxvdyA9IGVuZ2luZSgpID4+PiAwO1xuICAgICAgICByZXR1cm4gKChoaWdoICYgMHgxZmZmZmYpICogMHgxMDAwMDAwMDApICsgbG93ICsgKGhpZ2ggJiAweDIwMDAwMCA/IC0weDIwMDAwMDAwMDAwMDAwIDogMCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBwcm90by5pbnQ1M0Z1bGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFJhbmRvbS5pbnQ1M0Z1bGwodGhpcy5lbmdpbmUpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGFkZChnZW5lcmF0ZSwgYWRkZW5kKSB7XG4gICAgaWYgKGFkZGVuZCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGdlbmVyYXRlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGVuZ2luZSkge1xuICAgICAgICByZXR1cm4gZ2VuZXJhdGUoZW5naW5lKSArIGFkZGVuZDtcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgUmFuZG9tLmludGVnZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIGlzUG93ZXJPZlR3b01pbnVzT25lKHZhbHVlKSB7XG4gICAgICByZXR1cm4gKCh2YWx1ZSArIDEpICYgdmFsdWUpID09PSAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJpdG1hc2sobWFza2luZykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlbmdpbmUpIHtcbiAgICAgICAgcmV0dXJuIGVuZ2luZSgpICYgbWFza2luZztcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZG93bnNjYWxlVG9Mb29wQ2hlY2tlZFJhbmdlKHJhbmdlKSB7XG4gICAgICB2YXIgZXh0ZW5kZWRSYW5nZSA9IHJhbmdlICsgMTtcbiAgICAgIHZhciBtYXhpbXVtID0gZXh0ZW5kZWRSYW5nZSAqIE1hdGguZmxvb3IoMHgxMDAwMDAwMDAgLyBleHRlbmRlZFJhbmdlKTtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZW5naW5lKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IDA7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICB2YWx1ZSA9IGVuZ2luZSgpID4+PiAwO1xuICAgICAgICB9IHdoaWxlICh2YWx1ZSA+PSBtYXhpbXVtKTtcbiAgICAgICAgcmV0dXJuIHZhbHVlICUgZXh0ZW5kZWRSYW5nZTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZG93bnNjYWxlVG9SYW5nZShyYW5nZSkge1xuICAgICAgaWYgKGlzUG93ZXJPZlR3b01pbnVzT25lKHJhbmdlKSkge1xuICAgICAgICByZXR1cm4gYml0bWFzayhyYW5nZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZG93bnNjYWxlVG9Mb29wQ2hlY2tlZFJhbmdlKHJhbmdlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0V2ZW5seURpdmlzaWJsZUJ5TWF4SW50MzIodmFsdWUpIHtcbiAgICAgIHJldHVybiAodmFsdWUgfCAwKSA9PT0gMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cHNjYWxlV2l0aEhpZ2hNYXNraW5nKG1hc2tpbmcpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZW5naW5lKSB7XG4gICAgICAgIHZhciBoaWdoID0gZW5naW5lKCkgJiBtYXNraW5nO1xuICAgICAgICB2YXIgbG93ID0gZW5naW5lKCkgPj4+IDA7XG4gICAgICAgIHJldHVybiAoaGlnaCAqIDB4MTAwMDAwMDAwKSArIGxvdztcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBzY2FsZVRvTG9vcENoZWNrZWRSYW5nZShleHRlbmRlZFJhbmdlKSB7XG4gICAgICB2YXIgbWF4aW11bSA9IGV4dGVuZGVkUmFuZ2UgKiBNYXRoLmZsb29yKDB4MjAwMDAwMDAwMDAwMDAgLyBleHRlbmRlZFJhbmdlKTtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZW5naW5lKSB7XG4gICAgICAgIHZhciByZXQgPSAwO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgdmFyIGhpZ2ggPSBlbmdpbmUoKSAmIDB4MWZmZmZmO1xuICAgICAgICAgIHZhciBsb3cgPSBlbmdpbmUoKSA+Pj4gMDtcbiAgICAgICAgICByZXQgPSAoaGlnaCAqIDB4MTAwMDAwMDAwKSArIGxvdztcbiAgICAgICAgfSB3aGlsZSAocmV0ID49IG1heGltdW0pO1xuICAgICAgICByZXR1cm4gcmV0ICUgZXh0ZW5kZWRSYW5nZTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBzY2FsZVdpdGhpblU1MyhyYW5nZSkge1xuICAgICAgdmFyIGV4dGVuZGVkUmFuZ2UgPSByYW5nZSArIDE7XG4gICAgICBpZiAoaXNFdmVubHlEaXZpc2libGVCeU1heEludDMyKGV4dGVuZGVkUmFuZ2UpKSB7XG4gICAgICAgIHZhciBoaWdoUmFuZ2UgPSAoKGV4dGVuZGVkUmFuZ2UgLyAweDEwMDAwMDAwMCkgfCAwKSAtIDE7XG4gICAgICAgIGlmIChpc1Bvd2VyT2ZUd29NaW51c09uZShoaWdoUmFuZ2UpKSB7XG4gICAgICAgICAgcmV0dXJuIHVwc2NhbGVXaXRoSGlnaE1hc2tpbmcoaGlnaFJhbmdlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHVwc2NhbGVUb0xvb3BDaGVja2VkUmFuZ2UoZXh0ZW5kZWRSYW5nZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBzY2FsZVdpdGhpbkk1M0FuZExvb3BDaGVjayhtaW4sIG1heCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlbmdpbmUpIHtcbiAgICAgICAgdmFyIHJldCA9IDA7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICB2YXIgaGlnaCA9IGVuZ2luZSgpIHwgMDtcbiAgICAgICAgICB2YXIgbG93ID0gZW5naW5lKCkgPj4+IDA7XG4gICAgICAgICAgcmV0ID0gKChoaWdoICYgMHgxZmZmZmYpICogMHgxMDAwMDAwMDApICsgbG93ICsgKGhpZ2ggJiAweDIwMDAwMCA/IC0weDIwMDAwMDAwMDAwMDAwIDogMCk7XG4gICAgICAgIH0gd2hpbGUgKHJldCA8IG1pbiB8fCByZXQgPiBtYXgpO1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKG1pbiwgbWF4KSB7XG4gICAgICBtaW4gPSBNYXRoLmZsb29yKG1pbik7XG4gICAgICBtYXggPSBNYXRoLmZsb29yKG1heCk7XG4gICAgICBpZiAobWluIDwgLTB4MjAwMDAwMDAwMDAwMDAgfHwgIWlzRmluaXRlKG1pbikpIHtcbiAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCJFeHBlY3RlZCBtaW4gdG8gYmUgYXQgbGVhc3QgXCIgKyAoLTB4MjAwMDAwMDAwMDAwMDApKTtcbiAgICAgIH0gZWxzZSBpZiAobWF4ID4gMHgyMDAwMDAwMDAwMDAwMCB8fCAhaXNGaW5pdGUobWF4KSkge1xuICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcIkV4cGVjdGVkIG1heCB0byBiZSBhdCBtb3N0IFwiICsgMHgyMDAwMDAwMDAwMDAwMCk7XG4gICAgICB9XG5cbiAgICAgIHZhciByYW5nZSA9IG1heCAtIG1pbjtcbiAgICAgIGlmIChyYW5nZSA8PSAwIHx8ICFpc0Zpbml0ZShyYW5nZSkpIHtcbiAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlKG1pbik7XG4gICAgICB9IGVsc2UgaWYgKHJhbmdlID09PSAweGZmZmZmZmZmKSB7XG4gICAgICAgIGlmIChtaW4gPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gUmFuZG9tLnVpbnQzMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gYWRkKFJhbmRvbS5pbnQzMiwgbWluICsgMHg4MDAwMDAwMCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocmFuZ2UgPCAweGZmZmZmZmZmKSB7XG4gICAgICAgIHJldHVybiBhZGQoZG93bnNjYWxlVG9SYW5nZShyYW5nZSksIG1pbik7XG4gICAgICB9IGVsc2UgaWYgKHJhbmdlID09PSAweDFmZmZmZmZmZmZmZmZmKSB7XG4gICAgICAgIHJldHVybiBhZGQoUmFuZG9tLnVpbnQ1MywgbWluKTtcbiAgICAgIH0gZWxzZSBpZiAocmFuZ2UgPCAweDFmZmZmZmZmZmZmZmZmKSB7XG4gICAgICAgIHJldHVybiBhZGQodXBzY2FsZVdpdGhpblU1MyhyYW5nZSksIG1pbik7XG4gICAgICB9IGVsc2UgaWYgKG1heCAtIDEgLSBtaW4gPT09IDB4MWZmZmZmZmZmZmZmZmYpIHtcbiAgICAgICAgcmV0dXJuIGFkZChSYW5kb20udWludDUzRnVsbCwgbWluKTtcbiAgICAgIH0gZWxzZSBpZiAobWluID09PSAtMHgyMDAwMDAwMDAwMDAwMCAmJiBtYXggPT09IDB4MjAwMDAwMDAwMDAwMDApIHtcbiAgICAgICAgcmV0dXJuIFJhbmRvbS5pbnQ1M0Z1bGw7XG4gICAgICB9IGVsc2UgaWYgKG1pbiA9PT0gLTB4MjAwMDAwMDAwMDAwMDAgJiYgbWF4ID09PSAweDFmZmZmZmZmZmZmZmZmKSB7XG4gICAgICAgIHJldHVybiBSYW5kb20uaW50NTM7XG4gICAgICB9IGVsc2UgaWYgKG1pbiA9PT0gLTB4MWZmZmZmZmZmZmZmZmYgJiYgbWF4ID09PSAweDIwMDAwMDAwMDAwMDAwKSB7XG4gICAgICAgIHJldHVybiBhZGQoUmFuZG9tLmludDUzLCAxKTtcbiAgICAgIH0gZWxzZSBpZiAobWF4ID09PSAweDIwMDAwMDAwMDAwMDAwKSB7XG4gICAgICAgIHJldHVybiBhZGQodXBzY2FsZVdpdGhpbkk1M0FuZExvb3BDaGVjayhtaW4gLSAxLCBtYXggLSAxKSwgMSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdXBzY2FsZVdpdGhpbkk1M0FuZExvb3BDaGVjayhtaW4sIG1heCk7XG4gICAgICB9XG4gICAgfTtcbiAgfSgpKTtcbiAgcHJvdG8uaW50ZWdlciA9IGZ1bmN0aW9uIChtaW4sIG1heCkge1xuICAgIHJldHVybiBSYW5kb20uaW50ZWdlcihtaW4sIG1heCkodGhpcy5lbmdpbmUpO1xuICB9O1xuXG4gIC8vIFswLCAxXSAoZmxvYXRpbmcgcG9pbnQpXG4gIFJhbmRvbS5yZWFsWmVyb1RvT25lSW5jbHVzaXZlID0gZnVuY3Rpb24gKGVuZ2luZSkge1xuICAgIHJldHVybiBSYW5kb20udWludDUzRnVsbChlbmdpbmUpIC8gMHgyMDAwMDAwMDAwMDAwMDtcbiAgfTtcbiAgcHJvdG8ucmVhbFplcm9Ub09uZUluY2x1c2l2ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUmFuZG9tLnJlYWxaZXJvVG9PbmVJbmNsdXNpdmUodGhpcy5lbmdpbmUpO1xuICB9O1xuXG4gIC8vIFswLCAxKSAoZmxvYXRpbmcgcG9pbnQpXG4gIFJhbmRvbS5yZWFsWmVyb1RvT25lRXhjbHVzaXZlID0gZnVuY3Rpb24gKGVuZ2luZSkge1xuICAgIHJldHVybiBSYW5kb20udWludDUzKGVuZ2luZSkgLyAweDIwMDAwMDAwMDAwMDAwO1xuICB9O1xuICBwcm90by5yZWFsWmVyb1RvT25lRXhjbHVzaXZlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSYW5kb20ucmVhbFplcm9Ub09uZUV4Y2x1c2l2ZSh0aGlzLmVuZ2luZSk7XG4gIH07XG5cbiAgUmFuZG9tLnJlYWwgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIG11bHRpcGx5KGdlbmVyYXRlLCBtdWx0aXBsaWVyKSB7XG4gICAgICBpZiAobXVsdGlwbGllciA9PT0gMSkge1xuICAgICAgICByZXR1cm4gZ2VuZXJhdGU7XG4gICAgICB9IGVsc2UgaWYgKG11bHRpcGxpZXIgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZW5naW5lKSB7XG4gICAgICAgICAgcmV0dXJuIGdlbmVyYXRlKGVuZ2luZSkgKiBtdWx0aXBsaWVyO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiAobGVmdCwgcmlnaHQsIGluY2x1c2l2ZSkge1xuICAgICAgaWYgKCFpc0Zpbml0ZShsZWZ0KSkge1xuICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcIkV4cGVjdGVkIGxlZnQgdG8gYmUgYSBmaW5pdGUgbnVtYmVyXCIpO1xuICAgICAgfSBlbHNlIGlmICghaXNGaW5pdGUocmlnaHQpKSB7XG4gICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFwiRXhwZWN0ZWQgcmlnaHQgdG8gYmUgYSBmaW5pdGUgbnVtYmVyXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFkZChcbiAgICAgICAgbXVsdGlwbHkoXG4gICAgICAgICAgaW5jbHVzaXZlID8gUmFuZG9tLnJlYWxaZXJvVG9PbmVJbmNsdXNpdmUgOiBSYW5kb20ucmVhbFplcm9Ub09uZUV4Y2x1c2l2ZSxcbiAgICAgICAgICByaWdodCAtIGxlZnQpLFxuICAgICAgICBsZWZ0KTtcbiAgICB9O1xuICB9KCkpO1xuICBwcm90by5yZWFsID0gZnVuY3Rpb24gKG1pbiwgbWF4LCBpbmNsdXNpdmUpIHtcbiAgICByZXR1cm4gUmFuZG9tLnJlYWwobWluLCBtYXgsIGluY2x1c2l2ZSkodGhpcy5lbmdpbmUpO1xuICB9O1xuXG4gIFJhbmRvbS5ib29sID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBpc0xlYXN0Qml0VHJ1ZShlbmdpbmUpIHtcbiAgICAgIHJldHVybiAoZW5naW5lKCkgJiAxKSA9PT0gMTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsZXNzVGhhbihnZW5lcmF0ZSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZW5naW5lKSB7XG4gICAgICAgIHJldHVybiBnZW5lcmF0ZShlbmdpbmUpIDwgdmFsdWU7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByb2JhYmlsaXR5KHBlcmNlbnRhZ2UpIHtcbiAgICAgIGlmIChwZXJjZW50YWdlIDw9IDApIHtcbiAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlKGZhbHNlKTtcbiAgICAgIH0gZWxzZSBpZiAocGVyY2VudGFnZSA+PSAxKSB7XG4gICAgICAgIHJldHVybiByZXR1cm5WYWx1ZSh0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBzY2FsZWQgPSBwZXJjZW50YWdlICogMHgxMDAwMDAwMDA7XG4gICAgICAgIGlmIChzY2FsZWQgJSAxID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIGxlc3NUaGFuKFJhbmRvbS5pbnQzMiwgKHNjYWxlZCAtIDB4ODAwMDAwMDApIHwgMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGxlc3NUaGFuKFJhbmRvbS51aW50NTMsIE1hdGgucm91bmQocGVyY2VudGFnZSAqIDB4MjAwMDAwMDAwMDAwMDApKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiAobnVtZXJhdG9yLCBkZW5vbWluYXRvcikge1xuICAgICAgaWYgKGRlbm9taW5hdG9yID09IG51bGwpIHtcbiAgICAgICAgaWYgKG51bWVyYXRvciA9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGlzTGVhc3RCaXRUcnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9iYWJpbGl0eShudW1lcmF0b3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG51bWVyYXRvciA8PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlKGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIGlmIChudW1lcmF0b3IgPj0gZGVub21pbmF0b3IpIHtcbiAgICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWUodHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxlc3NUaGFuKFJhbmRvbS5pbnRlZ2VyKDAsIGRlbm9taW5hdG9yIC0gMSksIG51bWVyYXRvcik7XG4gICAgICB9XG4gICAgfTtcbiAgfSgpKTtcbiAgcHJvdG8uYm9vbCA9IGZ1bmN0aW9uIChudW1lcmF0b3IsIGRlbm9taW5hdG9yKSB7XG4gICAgcmV0dXJuIFJhbmRvbS5ib29sKG51bWVyYXRvciwgZGVub21pbmF0b3IpKHRoaXMuZW5naW5lKTtcbiAgfTtcblxuICBmdW5jdGlvbiB0b0ludGVnZXIodmFsdWUpIHtcbiAgICB2YXIgbnVtYmVyID0gK3ZhbHVlO1xuICAgIGlmIChudW1iZXIgPCAwKSB7XG4gICAgICByZXR1cm4gTWF0aC5jZWlsKG51bWJlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKG51bWJlcik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY29udmVydFNsaWNlQXJndW1lbnQodmFsdWUsIGxlbmd0aCkge1xuICAgIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgIHJldHVybiBNYXRoLm1heCh2YWx1ZSArIGxlbmd0aCwgMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBNYXRoLm1pbih2YWx1ZSwgbGVuZ3RoKTtcbiAgICB9XG4gIH1cbiAgUmFuZG9tLnBpY2sgPSBmdW5jdGlvbiAoZW5naW5lLCBhcnJheSwgYmVnaW4sIGVuZCkge1xuICAgIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gICAgdmFyIHN0YXJ0ID0gYmVnaW4gPT0gbnVsbCA/IDAgOiBjb252ZXJ0U2xpY2VBcmd1bWVudCh0b0ludGVnZXIoYmVnaW4pLCBsZW5ndGgpO1xuICAgIHZhciBmaW5pc2ggPSBlbmQgPT09IHZvaWQgMCA/IGxlbmd0aCA6IGNvbnZlcnRTbGljZUFyZ3VtZW50KHRvSW50ZWdlcihlbmQpLCBsZW5ndGgpO1xuICAgIGlmIChzdGFydCA+PSBmaW5pc2gpIHtcbiAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgfVxuICAgIHZhciBkaXN0cmlidXRpb24gPSBSYW5kb20uaW50ZWdlcihzdGFydCwgZmluaXNoIC0gMSk7XG4gICAgcmV0dXJuIGFycmF5W2Rpc3RyaWJ1dGlvbihlbmdpbmUpXTtcbiAgfTtcbiAgcHJvdG8ucGljayA9IGZ1bmN0aW9uIChhcnJheSwgYmVnaW4sIGVuZCkge1xuICAgIHJldHVybiBSYW5kb20ucGljayh0aGlzLmVuZ2luZSwgYXJyYXksIGJlZ2luLCBlbmQpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHJldHVyblVuZGVmaW5lZCgpIHtcbiAgICByZXR1cm4gdm9pZCAwO1xuICB9XG4gIHZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbiAgUmFuZG9tLnBpY2tlciA9IGZ1bmN0aW9uIChhcnJheSwgYmVnaW4sIGVuZCkge1xuICAgIHZhciBjbG9uZSA9IHNsaWNlLmNhbGwoYXJyYXksIGJlZ2luLCBlbmQpO1xuICAgIGlmICghY2xvbmUubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gcmV0dXJuVW5kZWZpbmVkO1xuICAgIH1cbiAgICB2YXIgZGlzdHJpYnV0aW9uID0gUmFuZG9tLmludGVnZXIoMCwgY2xvbmUubGVuZ3RoIC0gMSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChlbmdpbmUpIHtcbiAgICAgIHJldHVybiBjbG9uZVtkaXN0cmlidXRpb24oZW5naW5lKV07XG4gICAgfTtcbiAgfTtcblxuICBSYW5kb20uc2h1ZmZsZSA9IGZ1bmN0aW9uIChlbmdpbmUsIGFycmF5LCBkb3duVG8pIHtcbiAgICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuICAgIGlmIChsZW5ndGgpIHtcbiAgICAgIGlmIChkb3duVG8gPT0gbnVsbCkge1xuICAgICAgICBkb3duVG8gPSAwO1xuICAgICAgfVxuICAgICAgZm9yICh2YXIgaSA9IChsZW5ndGggLSAxKSA+Pj4gMDsgaSA+IGRvd25UbzsgLS1pKSB7XG4gICAgICAgIHZhciBkaXN0cmlidXRpb24gPSBSYW5kb20uaW50ZWdlcigwLCBpKTtcbiAgICAgICAgdmFyIGogPSBkaXN0cmlidXRpb24oZW5naW5lKTtcbiAgICAgICAgaWYgKGkgIT09IGopIHtcbiAgICAgICAgICB2YXIgdG1wID0gYXJyYXlbaV07XG4gICAgICAgICAgYXJyYXlbaV0gPSBhcnJheVtqXTtcbiAgICAgICAgICBhcnJheVtqXSA9IHRtcDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXk7XG4gIH07XG4gIHByb3RvLnNodWZmbGUgPSBmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICByZXR1cm4gUmFuZG9tLnNodWZmbGUodGhpcy5lbmdpbmUsIGFycmF5KTtcbiAgfTtcblxuICBSYW5kb20uc2FtcGxlID0gZnVuY3Rpb24gKGVuZ2luZSwgcG9wdWxhdGlvbiwgc2FtcGxlU2l6ZSkge1xuICAgIGlmIChzYW1wbGVTaXplIDwgMCB8fCBzYW1wbGVTaXplID4gcG9wdWxhdGlvbi5sZW5ndGggfHwgIWlzRmluaXRlKHNhbXBsZVNpemUpKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcIkV4cGVjdGVkIHNhbXBsZVNpemUgdG8gYmUgd2l0aGluIDAgYW5kIHRoZSBsZW5ndGggb2YgdGhlIHBvcHVsYXRpb25cIik7XG4gICAgfVxuXG4gICAgaWYgKHNhbXBsZVNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICB2YXIgY2xvbmUgPSBzbGljZS5jYWxsKHBvcHVsYXRpb24pO1xuICAgIHZhciBsZW5ndGggPSBjbG9uZS5sZW5ndGg7XG4gICAgaWYgKGxlbmd0aCA9PT0gc2FtcGxlU2l6ZSkge1xuICAgICAgcmV0dXJuIFJhbmRvbS5zaHVmZmxlKGVuZ2luZSwgY2xvbmUsIDApO1xuICAgIH1cbiAgICB2YXIgdGFpbExlbmd0aCA9IGxlbmd0aCAtIHNhbXBsZVNpemU7XG4gICAgcmV0dXJuIFJhbmRvbS5zaHVmZmxlKGVuZ2luZSwgY2xvbmUsIHRhaWxMZW5ndGggLSAxKS5zbGljZSh0YWlsTGVuZ3RoKTtcbiAgfTtcbiAgcHJvdG8uc2FtcGxlID0gZnVuY3Rpb24gKHBvcHVsYXRpb24sIHNhbXBsZVNpemUpIHtcbiAgICByZXR1cm4gUmFuZG9tLnNhbXBsZSh0aGlzLmVuZ2luZSwgcG9wdWxhdGlvbiwgc2FtcGxlU2l6ZSk7XG4gIH07XG5cbiAgUmFuZG9tLmRpZSA9IGZ1bmN0aW9uIChzaWRlQ291bnQpIHtcbiAgICByZXR1cm4gUmFuZG9tLmludGVnZXIoMSwgc2lkZUNvdW50KTtcbiAgfTtcbiAgcHJvdG8uZGllID0gZnVuY3Rpb24gKHNpZGVDb3VudCkge1xuICAgIHJldHVybiBSYW5kb20uZGllKHNpZGVDb3VudCkodGhpcy5lbmdpbmUpO1xuICB9O1xuXG4gIFJhbmRvbS5kaWNlID0gZnVuY3Rpb24gKHNpZGVDb3VudCwgZGllQ291bnQpIHtcbiAgICB2YXIgZGlzdHJpYnV0aW9uID0gUmFuZG9tLmRpZShzaWRlQ291bnQpO1xuICAgIHJldHVybiBmdW5jdGlvbiAoZW5naW5lKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICByZXN1bHQubGVuZ3RoID0gZGllQ291bnQ7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRpZUNvdW50OyArK2kpIHtcbiAgICAgICAgcmVzdWx0W2ldID0gZGlzdHJpYnV0aW9uKGVuZ2luZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG4gIHByb3RvLmRpY2UgPSBmdW5jdGlvbiAoc2lkZUNvdW50LCBkaWVDb3VudCkge1xuICAgIHJldHVybiBSYW5kb20uZGljZShzaWRlQ291bnQsIGRpZUNvdW50KSh0aGlzLmVuZ2luZSk7XG4gIH07XG5cbiAgLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Vbml2ZXJzYWxseV91bmlxdWVfaWRlbnRpZmllclxuICBSYW5kb20udXVpZDQgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIHplcm9QYWQoc3RyaW5nLCB6ZXJvQ291bnQpIHtcbiAgICAgIHJldHVybiBzdHJpbmdSZXBlYXQoXCIwXCIsIHplcm9Db3VudCAtIHN0cmluZy5sZW5ndGgpICsgc3RyaW5nO1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiAoZW5naW5lKSB7XG4gICAgICB2YXIgYSA9IGVuZ2luZSgpID4+PiAwO1xuICAgICAgdmFyIGIgPSBlbmdpbmUoKSB8IDA7XG4gICAgICB2YXIgYyA9IGVuZ2luZSgpIHwgMDtcbiAgICAgIHZhciBkID0gZW5naW5lKCkgPj4+IDA7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIHplcm9QYWQoYS50b1N0cmluZygxNiksIDgpICtcbiAgICAgICAgXCItXCIgK1xuICAgICAgICB6ZXJvUGFkKChiICYgMHhmZmZmKS50b1N0cmluZygxNiksIDQpICtcbiAgICAgICAgXCItXCIgK1xuICAgICAgICB6ZXJvUGFkKCgoKGIgPj4gNCkgJiAweDBmZmYpIHwgMHg0MDAwKS50b1N0cmluZygxNiksIDQpICtcbiAgICAgICAgXCItXCIgK1xuICAgICAgICB6ZXJvUGFkKCgoYyAmIDB4M2ZmZikgfCAweDgwMDApLnRvU3RyaW5nKDE2KSwgNCkgK1xuICAgICAgICBcIi1cIiArXG4gICAgICAgIHplcm9QYWQoKChjID4+IDQpICYgMHhmZmZmKS50b1N0cmluZygxNiksIDQpICtcbiAgICAgICAgemVyb1BhZChkLnRvU3RyaW5nKDE2KSwgOCkpO1xuICAgIH07XG4gIH0oKSk7XG4gIHByb3RvLnV1aWQ0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSYW5kb20udXVpZDQodGhpcy5lbmdpbmUpO1xuICB9O1xuXG4gIFJhbmRvbS5zdHJpbmcgPSAoZnVuY3Rpb24gKCkge1xuICAgIC8vIGhhcyAyKip4IGNoYXJzLCBmb3IgZmFzdGVyIHVuaWZvcm0gZGlzdHJpYnV0aW9uXG4gICAgdmFyIERFRkFVTFRfU1RSSU5HX1BPT0wgPSBcImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVowMTIzNDU2Nzg5Xy1cIjtcblxuICAgIHJldHVybiBmdW5jdGlvbiAocG9vbCkge1xuICAgICAgaWYgKHBvb2wgPT0gbnVsbCkge1xuICAgICAgICBwb29sID0gREVGQVVMVF9TVFJJTkdfUE9PTDtcbiAgICAgIH1cblxuICAgICAgdmFyIGxlbmd0aCA9IHBvb2wubGVuZ3RoO1xuICAgICAgaWYgKCFsZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXhwZWN0ZWQgcG9vbCBub3QgdG8gYmUgYW4gZW1wdHkgc3RyaW5nXCIpO1xuICAgICAgfVxuXG4gICAgICB2YXIgZGlzdHJpYnV0aW9uID0gUmFuZG9tLmludGVnZXIoMCwgbGVuZ3RoIC0gMSk7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGVuZ2luZSwgbGVuZ3RoKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBcIlwiO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgdmFyIGogPSBkaXN0cmlidXRpb24oZW5naW5lKTtcbiAgICAgICAgICByZXN1bHQgKz0gcG9vbC5jaGFyQXQoaik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH07XG4gICAgfTtcbiAgfSgpKTtcbiAgcHJvdG8uc3RyaW5nID0gZnVuY3Rpb24gKGxlbmd0aCwgcG9vbCkge1xuICAgIHJldHVybiBSYW5kb20uc3RyaW5nKHBvb2wpKHRoaXMuZW5naW5lLCBsZW5ndGgpO1xuICB9O1xuXG4gIFJhbmRvbS5oZXggPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBMT1dFUl9IRVhfUE9PTCA9IFwiMDEyMzQ1Njc4OWFiY2RlZlwiO1xuICAgIHZhciBsb3dlckhleCA9IFJhbmRvbS5zdHJpbmcoTE9XRVJfSEVYX1BPT0wpO1xuICAgIHZhciB1cHBlckhleCA9IFJhbmRvbS5zdHJpbmcoTE9XRVJfSEVYX1BPT0wudG9VcHBlckNhc2UoKSk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKHVwcGVyKSB7XG4gICAgICBpZiAodXBwZXIpIHtcbiAgICAgICAgcmV0dXJuIHVwcGVySGV4O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGxvd2VySGV4O1xuICAgICAgfVxuICAgIH07XG4gIH0oKSk7XG4gIHByb3RvLmhleCA9IGZ1bmN0aW9uIChsZW5ndGgsIHVwcGVyKSB7XG4gICAgcmV0dXJuIFJhbmRvbS5oZXgodXBwZXIpKHRoaXMuZW5naW5lLCBsZW5ndGgpO1xuICB9O1xuXG4gIFJhbmRvbS5kYXRlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgICBpZiAoIShzdGFydCBpbnN0YW5jZW9mIERhdGUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRXhwZWN0ZWQgc3RhcnQgdG8gYmUgYSBEYXRlLCBnb3QgXCIgKyB0eXBlb2Ygc3RhcnQpO1xuICAgIH0gZWxzZSBpZiAoIShlbmQgaW5zdGFuY2VvZiBEYXRlKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkV4cGVjdGVkIGVuZCB0byBiZSBhIERhdGUsIGdvdCBcIiArIHR5cGVvZiBlbmQpO1xuICAgIH1cbiAgICB2YXIgZGlzdHJpYnV0aW9uID0gUmFuZG9tLmludGVnZXIoc3RhcnQuZ2V0VGltZSgpLCBlbmQuZ2V0VGltZSgpKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGVuZ2luZSkge1xuICAgICAgcmV0dXJuIG5ldyBEYXRlKGRpc3RyaWJ1dGlvbihlbmdpbmUpKTtcbiAgICB9O1xuICB9O1xuICBwcm90by5kYXRlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgICByZXR1cm4gUmFuZG9tLmRhdGUoc3RhcnQsIGVuZCkodGhpcy5lbmdpbmUpO1xuICB9O1xuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gUmFuZG9tO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIHJlcXVpcmUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gUmFuZG9tO1xuICB9IGVsc2Uge1xuICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgb2xkR2xvYmFsID0gcm9vdFtHTE9CQUxfS0VZXTtcbiAgICAgIFJhbmRvbS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByb290W0dMT0JBTF9LRVldID0gb2xkR2xvYmFsO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH07XG4gICAgfSgpKTtcbiAgICByb290W0dMT0JBTF9LRVldID0gUmFuZG9tO1xuICB9XG59KHRoaXMpKTsiLCJ2YXIgc3RhdHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcmUnKSxcbiAgICBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSxcbiAgICBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oKXtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNhbnZhcyk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzdGF0cyk7XG59KTtcblxudmFyIHJlbmRlckhlaWdodCA9IDYwO1xudmFyIHJlbmRlcldpZHRoID0gMTEwMDtcbmNhbnZhcy5oZWlnaHQgPSByZW5kZXJIZWlnaHQ7XG5jYW52YXMud2lkdGggPSByZW5kZXJXaWR0aDtcblxudmFyIGxhc3RCZXN0QnVnID0gbnVsbCxcbiAgICBsYXN0QmVzdEJ1Z0pTT047XG5cbmZ1bmN0aW9uIGdldEJlc3RCdWdKU09OKGJlc3RCdWcpe1xuICAgIGlmKGxhc3RCZXN0QnVnID09PSBiZXN0QnVnKXtcbiAgICAgICAgcmV0dXJuIGxhc3RCZXN0QnVnSlNPTjtcbiAgICB9XG5cbiAgICBsYXN0QmVzdEJ1ZyA9IGJlc3RCdWc7XG5cbiAgICByZXR1cm4gbGFzdEJlc3RCdWdKU09OID0gSlNPTi5zdHJpbmdpZnkoYmVzdEJ1Zy5uZXVyb25zLm1hcChmdW5jdGlvbihuZXVyb24pe1xuICAgICAgICByZXR1cm4gbmV1cm9uLnNldHRpbmdzO1xuICAgIH0pLCBudWxsLCA0KTtcbn1cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RhdGUpe1xuICAgIHZhciBjdXJyZW50QmVzdEJ1ZyA9IHN0YXRlLmJ1Z3MucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwgYnVnKXtcbiAgICAgICAgcmV0dXJuIGJ1Zy5hZ2UgPiByZXN1bHQuYWdlID8gYnVnIDogcmVzdWx0O1xuICAgIH0sIHN0YXRlLmJ1Z3NbMF0pO1xuXG4gICAgdmFyIGN1cnJlbnRMaW5lYWdlcyA9IHN0YXRlLmJ1Z3MucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwgYnVnKXtcbiAgICAgICAgaWYgKHJlc3VsdC5pbmRleE9mKGJ1Zy5wYXRlcm5hbExpbmVhZ2UpID09PSAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goYnVnLnBhdGVybmFsTGluZWFnZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIFtdKTtcblxuICAgIHN0YXRzLnRleHRDb250ZW50ID0gW1xuICAgICAgICAnVGlja3M6ICcgKyBzdGF0ZS50aWNrcyxcbiAgICAgICAgJ0l0dGVyYXRpb25zIFBlciA1MG1zIHJ1bjogJyArIHN0YXRlLml0dGVyYXRpb25zUGVyNTAsXG4gICAgICAgICdCdWdzOiAnICsgc3RhdGUuYnVncy5sZW5ndGgsXG4gICAgICAgICdNYXggQ3VycmVudCBBZ2U6ICcgKyAoY3VycmVudEJlc3RCdWcgPyBjdXJyZW50QmVzdEJ1Zy5hZ2UgOiAnTm90aGluZyBhbGl2ZScpLFxuICAgICAgICAnQ3VycmVudCBCZXN0IEJ1ZyBMaW5lYWdlOiAnICsgKGN1cnJlbnRCZXN0QnVnID8gYCR7IGN1cnJlbnRCZXN0QnVnLnBhdGVybmFsTGluZWFnZS5pZCB9IChhZ2U6ICR7c3RhdGUudGlja3MgLSBjdXJyZW50QmVzdEJ1Zy5wYXRlcm5hbExpbmVhZ2UudGlja30pYCA6ICdOb25lJyksXG4gICAgICAgICdDdXJyZW50IExpbmVhZ2VzOiAnLFxuICAgICAgICAuLi5jdXJyZW50TGluZWFnZXMubWFwKGZ1bmN0aW9uKGxpbmVhZ2UpeyByZXR1cm4gYCR7IGxpbmVhZ2UuaWQgfSAoYWdlOiAke3N0YXRlLnRpY2tzIC0gbGluZWFnZS50aWNrfSlgOyB9KSxcbiAgICAgICAgJ01heCBBZ2U6ICcgKyBzdGF0ZS5iZXN0QnVnLmFnZSxcbiAgICAgICAgJ0Jlc3QgQnVncyBCcmFpbjogJyArIGdldEJlc3RCdWdKU09OKHN0YXRlLmJlc3RCdWcpXG4gICAgXS5qb2luKCdcXG4nKTtcbiAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCByZW5kZXJXaWR0aCwgcmVuZGVySGVpZ2h0KTtcblxuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG5cbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICcjMDAwMDAwJztcblxuICAgIHN0YXRlLm1hcC5tYXAoZnVuY3Rpb24oZG90LCBpbmRleCl7XG4gICAgICAgIGlmKGRvdCl7XG4gICAgICAgICAgICBjb250ZXh0LmZpbGxSZWN0KGluZGV4ICogMTAsIHJlbmRlckhlaWdodCAtIDEwLCAxMCwgMTApO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICcjRkYwMDAwJztcblxuICAgIHN0YXRlLmJ1Z3MubWFwKGZ1bmN0aW9uKGJ1Zyl7XG4gICAgICAgIGNvbnRleHQuZmlsbFJlY3QoYnVnLmRpc3RhbmNlLCByZW5kZXJIZWlnaHQgLSAxMCAtIChidWcuaGVpZ2h0ICogMTApLCAxMCwgMTApO1xuICAgIH0pO1xuXG4gICAgY29udGV4dC5maWxsU3R5bGUgPSAnaHNsYSgnICsgKHN0YXRlLmJlc3RCdWcuYWdlIC8gMjApLnRvU3RyaW5nKCkgKyAnLCAxMDAlLCAzMCUsIDAuMyknO1xuICAgIGNvbnRleHQuZmlsbFJlY3Qoc3RhdGUuYmVzdEJ1Zy5kaXN0YW5jZSwgcmVuZGVySGVpZ2h0IC0gMTAgLSAoc3RhdGUuYmVzdEJ1Zy5oZWlnaHQgKiAxMCksIDEwLCAxMCk7XG5cbiAgICBpZihjdXJyZW50QmVzdEJ1Zyl7XG4gICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ2hzbCgnICsgKGN1cnJlbnRCZXN0QnVnLmFnZSAvIDIwKS50b1N0cmluZygpICsgJywgMTAwJSwgMzAlKSc7XG4gICAgICAgIGNvbnRleHQuZmlsbFJlY3QoY3VycmVudEJlc3RCdWcuZGlzdGFuY2UsIHJlbmRlckhlaWdodCAtIDEwIC0gKGN1cnJlbnRCZXN0QnVnLmhlaWdodCAqIDEwKSwgMTAsIDEwKTtcbiAgICB9XG5cbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xufTsiLCJ2YXIgbmV1cmFsID0gcmVxdWlyZSgnLi9uZXVyYWwnKTtcbnZhciBzaW1TZXR0aW5ncyA9IHsgcmVhbHRpbWU6IGZhbHNlLCBuZXVyb25Db3VudDogMjAgfTtcbnZhciBpbnB1dCA9IHJlcXVpcmUoJy4vaW5wdXQnKShzaW1TZXR0aW5ncyk7XG52YXIgUmFuZG9tID0gcmVxdWlyZShcInJhbmRvbS1qc1wiKTtcblxuXG52YXIgcHJldmlvdXNOZXVyb25TZXR0aW5ncyA9IFtdO1xuXG52YXIgaW5wdXRzID0ge1xuICAgIGFnZTogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWdlO1xuICAgIH0sXG4gICAgaGVpZ2h0OiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5oZWlnaHQ7XG4gICAgfSxcbiAgICBlbmVyZ3k6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmVuZXJneTtcbiAgICB9XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVFeWVJbnB1dChpbmRleCl7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmRvdFBvc2l0aW9uc1tpbmRleF0gPyAxIDogMDtcbiAgICB9O1xufVxuXG5mb3IodmFyIGkgPSAwOyBpIDwgMjA7IGkrKyl7XG4gICAgaW5wdXRzWyduZXh0JyArIGldID0gY3JlYXRlRXllSW5wdXQoaSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3Rpb25zKG1heENvbm5lY3Rpb25zLCBtYXhJbmRleCl7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuXG4gICAgdmFyIGNvbm5lY3Rpb25zID0gTWF0aC5tYXgocGFyc2VJbnQoKE1hdGgucmFuZG9tKCkgKiBtYXhDb25uZWN0aW9ucykgJSBtYXhDb25uZWN0aW9ucyksIDEpO1xuXG4gICAgd2hpbGUoY29ubmVjdGlvbnMtLSl7XG4gICAgICAgIHJlc3VsdC5wdXNoKHBhcnNlSW50KE1hdGgucmFuZG9tKCkgKiBtYXhJbmRleCkgJSBtYXhJbmRleCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxudmFyIG1ldGhvZHMgPSBuZXVyYWwubWV0aG9kcztcblxuZnVuY3Rpb24gcmFuZG9tTmV1cm9ucygpe1xuICAgIHZhciBuZXVyb25zID0gW107XG4gICAgZm9yKHZhciBqID0gMDsgaiA8IHNpbVNldHRpbmdzLm5ldXJvbkNvdW50OyBqKyspe1xuICAgICAgICB2YXIgbWV0aG9kSW5kZXggPSBwYXJzZUludChNYXRoLnJhbmRvbSgpICogbWV0aG9kcy5sZW5ndGgpICUgbWV0aG9kcy5sZW5ndGg7XG4gICAgICAgIG5ldXJvbnMucHVzaCh7XG4gICAgICAgICAgICBtZXRob2Q6IG1ldGhvZHNbbWV0aG9kSW5kZXhdLFxuICAgICAgICAgICAgbW9kaWZpZXI6IE1hdGgucmFuZG9tKCksXG4gICAgICAgICAgICBpbnB1dEluZGljaWVzOiBjcmVhdGVDb25uZWN0aW9ucyg1LCBqICsgT2JqZWN0LmtleXMoaW5wdXRzKS5sZW5ndGgpXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBuZXVyb25zO1xufVxuXG5mb3IodmFyIGkgPSAwOyBpIDwgMjA7IGkrKyl7XG4gICAgcHJldmlvdXNOZXVyb25TZXR0aW5ncy5wdXNoKHJhbmRvbU5ldXJvbnMoKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJ1ZyhwcmV2aW91c05ldXJvblNldHRpbmdzLCBwYXRlcm5hbExpbmVhZ2UsIHRpY2spe1xuICAgIHZhciBidWcgPSBuZXVyYWwoe1xuICAgICAgICBtdXRhdGlvbjogMC4wMDA1LFxuICAgICAgICBpbnB1dHM6IGlucHV0cyxcbiAgICAgICAgb3V0cHV0czoge1xuICAgICAgICAgICAgdGhydXN0WDogdHJ1ZSxcbiAgICAgICAgICAgIHRocnVzdFk6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgcHJldmlvdXNOZXVyb25TZXR0aW5nczogcHJldmlvdXNOZXVyb25TZXR0aW5nc1xuICAgIH0pO1xuXG4gICAgYnVnLmFnZSA9IDA7XG4gICAgYnVnLmVuZXJneSA9IDE7XG4gICAgYnVnLmhlaWdodCA9IDA7XG4gICAgYnVnLnRocnVzdFggPSAwO1xuICAgIGJ1Zy50aHJ1c3RZID0gMDtcbiAgICBidWcuZGlzdGFuY2UgPSAwO1xuICAgIGJ1Zy5kaXN0RnJvbURvdCA9IC0xO1xuICAgIGJ1Zy5wYXRlcm5hbExpbmVhZ2UgPSBwYXRlcm5hbExpbmVhZ2UgfHwge2lkOiBSYW5kb20udXVpZDQoUmFuZG9tLmVuZ2luZXMuYnJvd3NlckNyeXB0byksIHRpY2s6IHRpY2t9O1xuXG4gICAgcmV0dXJuIGJ1Zztcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ2hpbGQoYnVnKXtcbiAgICByZXR1cm4gY3JlYXRlQnVnKGJ1Zy5uZXVyb25zLm1hcChmdW5jdGlvbihuZXVyb24pe1xuICAgICAgICByZXR1cm4gbmV1cm9uLnNldHRpbmdzO1xuICAgIH0pLCBidWcucGF0ZXJuYWxMaW5lYWdlKTtcbn1cblxuZnVuY3Rpb24gc3Bhd25DaGlsZEZyb21TZXgocGFyZW50T25lLCBwYXJlbnRUd28sIHRpY2spe1xuICAgIHZhciBuZXdDaGlsZFNldHRpbmdzID0gW107XG4gICAgdmFyIHBhcmVudE9uZUNvbnRyaWJ1dGlvbiA9IFsuLi5BcnJheSgyMCkua2V5cygpXTtcbiAgICB2YXIgcGFyZW50VHdvQ29udHJpYnV0aW9uID0gW107XG5cbiAgICBmb3IodmFyIGsgPSAwOyBrIDwgMTA7IGsrKyl7XG4gICAgICAgIFJhbmRvbS5zaHVmZmxlKFJhbmRvbS5lbmdpbmVzLmJyb3dzZXJDcnlwdG8sIHBhcmVudE9uZSk7XG4gICAgICAgIHBhcmVudFR3b0NvbnRyaWJ1dGlvbi5wdXNoKHBhcmVudE9uZUNvbnRyaWJ1dGlvbi5wb3AoKSk7XG4gICAgfVxuXG4gICAgZm9yKHZhciBsID0gMDsgbCA8IDIwOyBsKyspe1xuICAgICAgICBpZiAocGFyZW50T25lQ29udHJpYnV0aW9uLmluZGV4T2YobCkgPiAtMSkge1xuICAgICAgICAgICAgIG5ld0NoaWxkU2V0dGluZ3MucHVzaChwYXJlbnRPbmUubmV1cm9uc1tsXS5zZXR0aW5ncyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXdDaGlsZFNldHRpbmdzLnB1c2gocGFyZW50VHdvLm5ldXJvbnNbbF0uc2V0dGluZ3MpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIG5ld0J1ZyA9IGNyZWF0ZUJ1ZyhuZXdDaGlsZFNldHRpbmdzLCBwYXJlbnRPbmUucGF0ZXJuYWxMaW5lYWdlLCB0aWNrKTtcblxuICAgIHJldHVybiBuZXdCdWc7XG59XG5cbmZ1bmN0aW9uIGZpbmRBQnVnQVBhcnRuZXIoc3VpdG9yLCBidWdzKXtcbiAgICAvL2ZpbmQgbWUgYSByYW5kb20gYnVnIHRoYXQgaXNuJ3QgYmVzdCBidWc/XG4gICAgdmFyIGNvbGxlY3Rpb24gPSBidWdzLnJlZHVjZSgoYWNjdW11bGF0b3IsIGN1cnJlbnRCdWcsIGN1cnJlbnRJbmRleCkgPT4ge1xuICAgICAgICBpZiAoY3VycmVudEJ1Zy5hZ2UgIT09IHN1aXRvci5hZ2UpIHtcbiAgICAgICAgICAgIGFjY3VtdWxhdG9yLnB1c2goY3VycmVudEluZGV4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhY2N1bXVsYXRvcjtcbiAgICB9LFtdKTtcblxuICAgIHJldHVybiBidWdzW1JhbmRvbS5zaHVmZmxlKFJhbmRvbS5lbmdpbmVzLmJyb3dzZXJDcnlwdG8sY29sbGVjdGlvbilbMF1dO1xufVxuXG52YXIgbWFwID0gW107XG5cbmZvcih2YXIgaSA9IDA7IGkgPCAxMjA7IGkrKyl7XG4gICAgbWFwLnB1c2goZmFsc2UpO1xufVxuXG52YXIgYnVncyA9IFtdO1xuXG52YXIgcmVuZGVyZXIgPSByZXF1aXJlKCcuL3JlbmRlcicpO1xuXG52YXIgdGlja3MgPSAwO1xudmFyIGxvb3Bpbmc7XG52YXIgYmVzdEJ1ZztcbnZhciBpdHRlcmF0aW9uc1BlcjUwID0gMDtcbmZ1bmN0aW9uIGdhbWVMb29wKCl7XG4gICAgdGlja3MrKztcbiAgICBpZihidWdzLmxlbmd0aCA8IDIwKXtcbiAgICAgICAgYmVzdEJ1ZyA/XG4gICAgICAgICAgICBidWdzLnB1c2goTWF0aC5yYW5kb20oKSA+IDAuNSAmJiBidWdzLmxlbmd0aCA+IDEgPyBzcGF3bkNoaWxkRnJvbVNleChiZXN0QnVnLCBmaW5kQUJ1Z0FQYXJ0bmVyKGJlc3RCdWcsIGJ1Z3MpLCB0aWNrcyk6IGNyZWF0ZUJ1ZyhyYW5kb21OZXVyb25zKCksIG51bGwsIHRpY2tzKSkgOlxuICAgICAgICAgICAgYnVncy5wdXNoKGNyZWF0ZUJ1ZyhyYW5kb21OZXVyb25zKCksIG51bGwsIHRpY2tzKSk7XG4gICAgfVxuXG4gICAgbWFwLnNoaWZ0KCk7XG4gICAgbWFwLnB1c2gobWFwLnNsaWNlKC0xMCkuc29tZSh4ID0+IHgpID8gZmFsc2UgOiBNYXRoLnJhbmRvbSgpIDwgYnVncy5sZW5ndGggLyAyMDAwKTtcblxuICAgIHZhciBzdXJ2aXZvcnMgPSBbXTtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgYnVncy5sZW5ndGg7IGkrKyl7XG4gICAgICAgIHZhciBidWcgPSBidWdzW2ldO1xuICAgICAgICBidWcuYWdlKys7XG4gICAgICAgIGJ1Zy5kaXN0YW5jZSArPSBidWcudGhydXN0WCArIDE7XG5cbiAgICAgICAgaWYoIWJlc3RCdWcgfHwgYnVnLmFnZSA+IGJlc3RCdWcuYWdlKXtcbiAgICAgICAgICAgIHNpbVNldHRpbmdzLnJlYWx0aW1lID0gdHJ1ZTtcbiAgICAgICAgICAgIGJlc3RCdWcgPSBidWc7XG4gICAgICAgIH1cblxuICAgICAgICBpZihidWcuZGlzdGFuY2UgPiA5OTkpe1xuICAgICAgICAgICAgYnVnLmRpc3RhbmNlID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGJ1Zy5hZ2UgJiYgIShidWcuYWdlICUgMTExKSAmJiBidWcuYWdlID4gMzAwKXtcbiAgICAgICAgICAgIGlmIChidWdzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICBidWdzLnB1c2goc3Bhd25DaGlsZEZyb21TZXgoYmVzdEJ1ZywgZmluZEFCdWdBUGFydG5lcihiZXN0QnVnLCBidWdzKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9vbiBkb3QsIGRpZVxuICAgICAgICBpZihidWcuZGlzdGFuY2UgPiAxMDAgJiYgYnVnLmhlaWdodCA8IDEgJiYgYnVnLm9uRG90KXtcbiAgICAgICAgICAgIGlmKGJ1ZyA9PT0gYmVzdEJ1Zyl7XG4gICAgICAgICAgICAgICAgc2ltU2V0dGluZ3MucmVhbHRpbWUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgc3Vydml2b3JzLnB1c2goYnVnKTtcblxuICAgICAgICAvL2ZhbGxcbiAgICAgICAgYnVnLmhlaWdodCArPSBidWcudGhydXN0WSAqIDI7XG4gICAgICAgIGJ1Zy5oZWlnaHQgPSBNYXRoLm1heCgwLCBidWcuaGVpZ2h0IC09IDAuNSk7XG4gICAgICAgIHZhciBtYXBQb3NpdGlvbiA9IHBhcnNlSW50KGJ1Zy5kaXN0YW5jZSAvIDEwKTtcbiAgICAgICAgYnVnLmRvdFBvc2l0aW9ucyA9IG1hcC5zbGljZShtYXBQb3NpdGlvbiwgbWFwUG9zaXRpb24gKyAyMCk7XG4gICAgICAgIGJ1Zy5vbkRvdCA9IGJ1Zy5kb3RQb3NpdGlvbnNbMF07XG5cbiAgICAgICAgaWYoIWJ1Zy5oZWlnaHQpe1xuICAgICAgICAgICAgaWYoYnVnLmVuZXJneSA+IDAuMil7XG4gICAgICAgICAgICAgICAgdmFyIHRocnVzdFkgPSBidWcub3V0cHV0cy50aHJ1c3RZKCk7XG4gICAgICAgICAgICAgICAgYnVnLnRocnVzdFkgKz0gTWF0aC5taW4odGhydXN0WSwgYnVnLmVuZXJneSk7XG4gICAgICAgICAgICAgICAgYnVnLmVuZXJneSA9IE1hdGgubWF4KDAsIGJ1Zy5lbmVyZ3kgLSBidWcudGhydXN0WSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgdGhydXN0WCA9IGJ1Zy5vdXRwdXRzLnRocnVzdFgoKTtcbiAgICAgICAgICAgICAgICBidWcudGhydXN0WCArPSBNYXRoLm1pbih0aHJ1c3RYLCBidWcuZW5lcmd5KTtcbiAgICAgICAgICAgICAgICBidWcuZW5lcmd5ID0gTWF0aC5tYXgoMCwgYnVnLmVuZXJneSAtIGJ1Zy50aHJ1c3RYKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJ1Zy5lbmVyZ3kgPSBNYXRoLm1pbigxLCBidWcuZW5lcmd5ICsgMC4xKTtcbiAgICAgICAgfVxuICAgICAgICBpZihidWcudGhydXN0WSA+IDApe1xuICAgICAgICAgICAgYnVnLnRocnVzdFkgLT0gMC4xO1xuICAgICAgICB9XG4gICAgICAgIGlmKGJ1Zy50aHJ1c3RYID4gMC4xIHx8IGJ1Zy50aHJ1c3RYIDwgLTAuMSl7XG4gICAgICAgICAgICBidWcudGhydXN0WCAqPSAwLjk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBidWdzID0gc3Vydml2b3JzO1xuXG4gICAgaWYobG9vcGluZyl7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZighc2ltU2V0dGluZ3MucmVhbHRpbWUpe1xuICAgICAgICBsb29waW5nID0gdHJ1ZTtcbiAgICAgICAgdmFyIHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgaXR0ZXJhdGlvbnNQZXI1MCA9IDA7XG4gICAgICAgIHdoaWxlKERhdGUubm93KCkgLSBzdGFydCA8IDUwKXtcbiAgICAgICAgICAgIGl0dGVyYXRpb25zUGVyNTArKztcbiAgICAgICAgICAgIGdhbWVMb29wKCk7XG4gICAgICAgICAgICBpZihzaW1TZXR0aW5ncy5yZWFsdGltZSl7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbG9vcGluZyA9IGZhbHNlO1xuICAgICAgICBzZXRUaW1lb3V0KGdhbWVMb29wLCAwKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNldFRpbWVvdXQoZ2FtZUxvb3AsIDMwKTtcblxufVxuXG5mdW5jdGlvbiByZW5kZXIoKXtcbiAgICByZW5kZXJlcih7IHRpY2tzLCBidWdzLCBtYXAsIGJlc3RCdWcsIGl0dGVyYXRpb25zUGVyNTAgfSk7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG59XG5cbmdhbWVMb29wKCk7XG5cbnJlbmRlcigpO1xuXG4iXX0=
