(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
    lastBestBugInfo;

function getBestBugInfo(bestBug){
    if(lastBestBug === bestBug){
        return lastBestBugInfo;
    }

    lastBestBug = bestBug;

    return lastBestBugInfo = bestBug.neurons.map(function(neuron, index){
        return index + ' - Inputs: ' + neuron.settings.inputIndicies + ' Method: ' + neuron.settings.method + ' Modifier: ' + neuron.settings.modifier;
    }).join('\n');
}
module.exports = function(state){
    var currentBestBug = state.bugs.reduce(function(result, bug){
        return bug.totalDistance > result.totalDistance ? bug : result;
    }, state.bugs[0]);

    stats.textContent = [
        'Ticks: ' + state.ticks.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
        'Itterations Per 50ms run: ' + state.itterationsPer50,
        'Bugs: ' + state.bugs.length,
        'Max Current Distance: ' + (currentBestBug ? currentBestBug.totalDistance : 'Nothing alive'),
        'Max Distance: ' + state.bestBug.totalDistance,
        'Best Bugs Brain: ' + getBestBugInfo(state.bestBug)
    ].join('\n');
    context.clearRect(0, 0, renderWidth, renderHeight);

    context.beginPath();

    context.fillStyle = '#000000';

    state.map.map(function(dot, index){
        if(dot){
            context.fillRect(index * 10, renderHeight - 10, 10, 10);
        }
    });

    context.fillStyle = 'hsla(' + (state.bestBug.age / 20).toString() + ', 100%, 30%, 0.3)';
    context.fillRect(state.bestBug.distance, renderHeight - 10 - (state.bestBug.height * 10), 10, 10);

    state.bugs.map(function(bug){
        context.fillStyle = 'hsla(' + (bug.thrustX * 255) + ', ' + ((bug.thrustY + bug.thrustY) / 2 * 50) + 25 + '%, 50%, 1)';
        context.fillRect(bug.distance, renderHeight - 10 - (bug.height * 10), 10, 10);
    });

    if(currentBestBug){
        context.fillStyle = 'hsl(' + (currentBestBug.age / 20).toString() + ', 100%, 30%)';
        context.fillRect(currentBestBug.distance + 3, renderHeight - 10 - (currentBestBug.height * 10) - 5, 4, 4);
    }

    context.closePath();
};
},{}],5:[function(require,module,exports){
var neural = require('./neural');
var simSettings = { realtime: false, neuronCount: 20 };
var input = require('./input')(simSettings);

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
            inputIndicies: createConnections(6, j + Object.keys(inputs).length)
        });
    }

    return neurons;
}

for(var i = 0; i < 20; i++){
    previousNeuronSettings.push(randomNeurons());
}

function createBug(previousNeuronSettings){
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
    bug.totalDistance = 0;
    bug.distFromDot = -1;

    return bug;
}

function createChild(bug){
    return createBug(bug.neurons.map(function(neuron){
        return neuron.settings;
    }));
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
            bugs.push(Math.random() > 0.9 ? createChild(bestBug) : createBug(randomNeurons())) :
            bugs.push(createBug(randomNeurons()));
    }

    map.shift();
    map.push(map.slice(-5).some(x => x) ? false : Math.random() < bugs.length / 2000);

    var survivors = [];
    for(var i = 0; i < bugs.length; i++){
        var bug = bugs[i];
        bug.age++;
        bug.distance += bug.thrustX + 1;
        bug.totalDistance += bug.thrustX + 1;

        if(!bestBug || bug.totalDistance > bestBug.totalDistance){
            simSettings.realtime = true;
            bestBug = bug;
        }

        if(bug.distance > 999){
            bug.distance = 0;
        }

        if(bug.age && !(bug.age % 111) && bug.age > 300){
            survivors.push(createChild(bug));
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

        if(bug.energy > 0.2){
            var thrustY = bug.outputs.thrustY();
            bug.thrustY += Math.min(thrustY, bug.energy);
            bug.energy = Math.max(0, bug.energy - bug.thrustY);
        }
        if(bug.energy > 0){
            var thrustX = bug.outputs.thrustX();
            bug.thrustX += Math.min(thrustX, bug.energy);
            bug.energy = Math.max(0, bug.energy - bug.thrustX);
        }
        bug.energy = Math.min(1, bug.energy + 0.07);
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


},{"./input":1,"./neural":2,"./render":4}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4zLjEvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiaW5wdXQuanMiLCJuZXVyYWwuanMiLCJub2RlX21vZHVsZXMvY3JlbC9jcmVsLmpzIiwicmVuZGVyLmpzIiwidGVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgY3JlbCA9IHJlcXVpcmUoJ2NyZWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzaW1TZXR0aW5ncyl7XG4gICAgdmFyIHRvZ2dsZTtcbiAgICB2YXIgbWVudSA9IGNyZWwoJ2RpdicsXG4gICAgICAgICAgICAnTmV1cm9ucyBmb3IgbmV3IGJ1Z3M6ICcsXG4gICAgICAgICAgICBuZXVyb25zID0gY3JlbCgnaW5wdXQnLCB7IHR5cGU6ICdudW1iZXInLCB2YWx1ZTogc2ltU2V0dGluZ3MubmV1cm9uQ291bnQgfSksXG4gICAgICAgICAgICB0b2dnbGUgPSBjcmVsKCdidXR0b24nKVxuICAgICAgICApO1xuXG4gICAgbmV1cm9ucy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgY291bnQgPSBwYXJzZUludChuZXVyb25zLnZhbHVlKTtcbiAgICAgICAgY291bnQgPSBNYXRoLm1heCgxMCwgY291bnQpO1xuICAgICAgICBpZihjb3VudCAhPT0gbmV1cm9ucy52YWx1ZSl7XG4gICAgICAgICAgICBuZXVyb25zLnZhbHVlID0gY291bnQ7XG4gICAgICAgIH1cbiAgICAgICAgc2ltU2V0dGluZ3MubmV1cm9uQ291bnQgPSBjb3VudDtcbiAgICB9KTtcblxuICAgIHRvZ2dsZS50ZXh0Q29udGVudCA9ICdSZWFsdGltZSc7XG5cbiAgICB0b2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICBzaW1TZXR0aW5ncy5yZWFsdGltZSA9ICFzaW1TZXR0aW5ncy5yZWFsdGltZTtcbiAgICB9KTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oKXtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtZW51KTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIHJ1bigpe1xuICAgICAgICB0b2dnbGUudGV4dENvbnRlbnQgPSBzaW1TZXR0aW5ncy5yZWFsdGltZSA/ICdSZWFsIFRpbWUnIDogJ0h5cGVyc3BlZWQnO1xuXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShydW4pO1xuICAgIH1cblxuICAgIHJ1bigpO1xufTsiLCJ2YXIgbWV0aG9kcyA9IHtcbiAgICBtdWx0aXBseTogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBhICogYjtcbiAgICB9LFxuICAgIGRpdmlkZTogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBhIC8gYjtcbiAgICB9LFxuICAgIGFkZDogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBhICsgYjtcbiAgICB9LFxuICAgIHN1YnRyYWN0OiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIGEgLSBiO1xuICAgIH0sXG4gICAgcG93ZXI6IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gTWF0aC5wb3coYSwgYik7XG4gICAgfSxcbiAgICBtb2Q6IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gYSAlIGIgKiAxMDtcbiAgICB9LFxuICAgIGludmVydDogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBNYXRoLmFicyhhICogLWIpO1xuICAgIH1cbn07XG5cbmZ1bmN0aW9uIG1ha2VOZXVyb24obmV1cm9ucywgc2V0dGluZ3Mpe1xuICAgIHZhciBpbnB1dEluZGljaWVzID0gc2V0dGluZ3MuaW5wdXRJbmRpY2llcy5zbGljZSgpO1xuXG4gICAgdmFyIG5ldXJvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIC8vIHZhciByZXN1bHQgPSBNYXRoLnBvdyhpbnB1dEluZGljaWVzLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGluZGV4KXtcbiAgICAgICAgLy8gICAgIHJldHVybiByZXN1bHQgKyBNYXRoLnBvdyhuZXVyb25zW2luZGV4XSgpLCAyKTtcbiAgICAgICAgLy8gfSwgMCksIDAuNSk7XG5cbiAgICAgICAgdmFyIHJlc3VsdCA9IDA7XG4gICAgICAgIGlmKGlucHV0SW5kaWNpZXMpe1xuICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGlucHV0SW5kaWNpZXMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBuZXVyb25zW2lucHV0SW5kaWNpZXNbaV1dKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHQgLz0gaW5wdXRJbmRpY2llcy5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdmFyIHJlc3VsdCA9IGlucHV0SW5kaWNpZXMgPyBpbnB1dEluZGljaWVzLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGluZGV4KXtcbiAgICAgICAgLy8gICAgIHJldHVybiByZXN1bHQgKyBuZXVyb25zW2luZGV4XSgpO1xuICAgICAgICAvLyB9LCAwKSAvIGlucHV0SW5kaWNpZXMubGVuZ3RoIDogMDtcblxuICAgICAgICByZXN1bHQgPSBtZXRob2RzW3NldHRpbmdzLm1ldGhvZF0ocmVzdWx0LCBzZXR0aW5ncy5tb2RpZmllcik7XG5cbiAgICAgICAgcmVzdWx0ID0gTWF0aC5taW4oMSwgcmVzdWx0KTtcbiAgICAgICAgcmVzdWx0ID0gTWF0aC5tYXgoMCwgcmVzdWx0KTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgbmV1cm9uLnNldHRpbmdzID0gc2V0dGluZ3M7XG5cbiAgICByZXR1cm4gbmV1cm9uO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5ldHdvcmtTZXR0aW5ncyl7XG4gICAgdmFyIG5ldHdvcmsgPSB7fTtcblxuICAgIHZhciBpbnB1dHMgPSBuZXR3b3JrU2V0dGluZ3MuaW5wdXRzLFxuICAgICAgICBvdXRwdXRzID0gbmV0d29ya1NldHRpbmdzLm91dHB1dHMsXG4gICAgICAgIHByZXZpb3VzTmV1cm9uU2V0dGluZ3MgPSBuZXR3b3JrU2V0dGluZ3MucHJldmlvdXNOZXVyb25TZXR0aW5ncyxcbiAgICAgICAgaW5wdXROZXVyb25zID0gT2JqZWN0LmtleXMobmV0d29ya1NldHRpbmdzLmlucHV0cykubWFwKGZ1bmN0aW9uKGtleSl7XG4gICAgICAgICAgICByZXR1cm4gbmV0d29ya1NldHRpbmdzLmlucHV0c1trZXldLmJpbmQobmV0d29yayk7XG4gICAgICAgIH0pLFxuICAgICAgICBuZXVyb25zID0gaW5wdXROZXVyb25zLnNsaWNlKCk7XG5cbiAgICBwcmV2aW91c05ldXJvblNldHRpbmdzLm1hcChmdW5jdGlvbihuZXVyb25TZXR0aW5ncyl7XG4gICAgICAgIHZhciBuZXdOZXVyb25TZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6IG5ldXJvblNldHRpbmdzLm1ldGhvZCxcbiAgICAgICAgICAgICAgICBpbnB1dEluZGljaWVzOiBuZXVyb25TZXR0aW5ncy5pbnB1dEluZGljaWVzLFxuICAgICAgICAgICAgICAgIG1vZGlmaWVyOiBuZXVyb25TZXR0aW5ncy5tb2RpZmllciAqICgxICsgKE1hdGgucmFuZG9tKCkgKiAobmV0d29ya1NldHRpbmdzLm11dGF0aW9uICogMikgLSBuZXR3b3JrU2V0dGluZ3MubXV0YXRpb24pKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICBuZXVyb25zLnB1c2gobWFrZU5ldXJvbihuZXVyb25zLCBuZXdOZXVyb25TZXR0aW5ncykpO1xuICAgIH0pO1xuXG4gICAgdmFyIG91dHB1dE5ldXJvbnMgPSBuZXVyb25zLnNsaWNlKC0gT2JqZWN0LmtleXMob3V0cHV0cykubGVuZ3RoKTtcblxuICAgIHZhciBpbnB1dE1hcCA9IE9iamVjdC5rZXlzKGlucHV0cykucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwga2V5KXtcbiAgICAgICAgcmVzdWx0W2tleV0gPSBpbnB1dE5ldXJvbnMucG9wKCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCB7fSk7XG5cbiAgICB2YXIgb3V0cHV0TWFwID0gT2JqZWN0LmtleXMob3V0cHV0cykucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwga2V5KXtcbiAgICAgICAgcmVzdWx0W2tleV0gPSBvdXRwdXROZXVyb25zLnBvcCgpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwge30pO1xuXG4gICAgbmV0d29yay5pbnB1dHMgPSBpbnB1dE1hcDtcbiAgICBuZXR3b3JrLm91dHB1dHMgPSBvdXRwdXRNYXA7XG4gICAgbmV0d29yay5uZXVyb25zID0gbmV1cm9ucy5zbGljZShPYmplY3Qua2V5cyhpbnB1dHMpLmxlbmd0aCk7XG5cbiAgICByZXR1cm4gbmV0d29yaztcbn07XG5tb2R1bGUuZXhwb3J0cy5tZXRob2RzID0gT2JqZWN0LmtleXMobWV0aG9kcyk7IiwiLy9Db3B5cmlnaHQgKEMpIDIwMTIgS29yeSBOdW5uXHJcblxyXG4vL1Blcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcblxyXG4vL1RoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG5cclxuLy9USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cclxuXHJcbi8qXHJcblxyXG4gICAgVGhpcyBjb2RlIGlzIG5vdCBmb3JtYXR0ZWQgZm9yIHJlYWRhYmlsaXR5LCBidXQgcmF0aGVyIHJ1bi1zcGVlZCBhbmQgdG8gYXNzaXN0IGNvbXBpbGVycy5cclxuXHJcbiAgICBIb3dldmVyLCB0aGUgY29kZSdzIGludGVudGlvbiBzaG91bGQgYmUgdHJhbnNwYXJlbnQuXHJcblxyXG4gICAgKioqIElFIFNVUFBPUlQgKioqXHJcblxyXG4gICAgSWYgeW91IHJlcXVpcmUgdGhpcyBsaWJyYXJ5IHRvIHdvcmsgaW4gSUU3LCBhZGQgdGhlIGZvbGxvd2luZyBhZnRlciBkZWNsYXJpbmcgY3JlbC5cclxuXHJcbiAgICB2YXIgdGVzdERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxyXG4gICAgICAgIHRlc3RMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XHJcblxyXG4gICAgdGVzdERpdi5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2EnKTtcclxuICAgIHRlc3REaXZbJ2NsYXNzTmFtZSddICE9PSAnYScgPyBjcmVsLmF0dHJNYXBbJ2NsYXNzJ10gPSAnY2xhc3NOYW1lJzp1bmRlZmluZWQ7XHJcbiAgICB0ZXN0RGl2LnNldEF0dHJpYnV0ZSgnbmFtZScsJ2EnKTtcclxuICAgIHRlc3REaXZbJ25hbWUnXSAhPT0gJ2EnID8gY3JlbC5hdHRyTWFwWyduYW1lJ10gPSBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZSl7XHJcbiAgICAgICAgZWxlbWVudC5pZCA9IHZhbHVlO1xyXG4gICAgfTp1bmRlZmluZWQ7XHJcblxyXG5cclxuICAgIHRlc3RMYWJlbC5zZXRBdHRyaWJ1dGUoJ2ZvcicsICdhJyk7XHJcbiAgICB0ZXN0TGFiZWxbJ2h0bWxGb3InXSAhPT0gJ2EnID8gY3JlbC5hdHRyTWFwWydmb3InXSA9ICdodG1sRm9yJzp1bmRlZmluZWQ7XHJcblxyXG5cclxuXHJcbiovXHJcblxyXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcclxuICAgIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICAgICAgZGVmaW5lKGZhY3RvcnkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByb290LmNyZWwgPSBmYWN0b3J5KCk7XHJcbiAgICB9XHJcbn0odGhpcywgZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGZuID0gJ2Z1bmN0aW9uJyxcclxuICAgICAgICBvYmogPSAnb2JqZWN0JyxcclxuICAgICAgICBub2RlVHlwZSA9ICdub2RlVHlwZScsXHJcbiAgICAgICAgdGV4dENvbnRlbnQgPSAndGV4dENvbnRlbnQnLFxyXG4gICAgICAgIHNldEF0dHJpYnV0ZSA9ICdzZXRBdHRyaWJ1dGUnLFxyXG4gICAgICAgIGF0dHJNYXBTdHJpbmcgPSAnYXR0ck1hcCcsXHJcbiAgICAgICAgaXNOb2RlU3RyaW5nID0gJ2lzTm9kZScsXHJcbiAgICAgICAgaXNFbGVtZW50U3RyaW5nID0gJ2lzRWxlbWVudCcsXHJcbiAgICAgICAgZCA9IHR5cGVvZiBkb2N1bWVudCA9PT0gb2JqID8gZG9jdW1lbnQgOiB7fSxcclxuICAgICAgICBpc1R5cGUgPSBmdW5jdGlvbihhLCB0eXBlKXtcclxuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBhID09PSB0eXBlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNOb2RlID0gdHlwZW9mIE5vZGUgPT09IGZuID8gZnVuY3Rpb24gKG9iamVjdCkge1xyXG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0IGluc3RhbmNlb2YgTm9kZTtcclxuICAgICAgICB9IDpcclxuICAgICAgICAvLyBpbiBJRSA8PSA4IE5vZGUgaXMgYW4gb2JqZWN0LCBvYnZpb3VzbHkuLlxyXG4gICAgICAgIGZ1bmN0aW9uKG9iamVjdCl7XHJcbiAgICAgICAgICAgIHJldHVybiBvYmplY3QgJiZcclxuICAgICAgICAgICAgICAgIGlzVHlwZShvYmplY3QsIG9iaikgJiZcclxuICAgICAgICAgICAgICAgIChub2RlVHlwZSBpbiBvYmplY3QpICYmXHJcbiAgICAgICAgICAgICAgICBpc1R5cGUob2JqZWN0Lm93bmVyRG9jdW1lbnQsb2JqKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzRWxlbWVudCA9IGZ1bmN0aW9uIChvYmplY3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNyZWxbaXNOb2RlU3RyaW5nXShvYmplY3QpICYmIG9iamVjdFtub2RlVHlwZV0gPT09IDE7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpc0FycmF5ID0gZnVuY3Rpb24oYSl7XHJcbiAgICAgICAgICAgIHJldHVybiBhIGluc3RhbmNlb2YgQXJyYXk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhcHBlbmRDaGlsZCA9IGZ1bmN0aW9uKGVsZW1lbnQsIGNoaWxkKSB7XHJcbiAgICAgICAgICBpZighY3JlbFtpc05vZGVTdHJpbmddKGNoaWxkKSl7XHJcbiAgICAgICAgICAgICAgY2hpbGQgPSBkLmNyZWF0ZVRleHROb2RlKGNoaWxkKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoY2hpbGQpO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWwoKXtcclxuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cywgLy9Ob3RlOiBhc3NpZ25lZCB0byBhIHZhcmlhYmxlIHRvIGFzc2lzdCBjb21waWxlcnMuIFNhdmVzIGFib3V0IDQwIGJ5dGVzIGluIGNsb3N1cmUgY29tcGlsZXIuIEhhcyBuZWdsaWdhYmxlIGVmZmVjdCBvbiBwZXJmb3JtYW5jZS5cclxuICAgICAgICAgICAgZWxlbWVudCA9IGFyZ3NbMF0sXHJcbiAgICAgICAgICAgIGNoaWxkLFxyXG4gICAgICAgICAgICBzZXR0aW5ncyA9IGFyZ3NbMV0sXHJcbiAgICAgICAgICAgIGNoaWxkSW5kZXggPSAyLFxyXG4gICAgICAgICAgICBhcmd1bWVudHNMZW5ndGggPSBhcmdzLmxlbmd0aCxcclxuICAgICAgICAgICAgYXR0cmlidXRlTWFwID0gY3JlbFthdHRyTWFwU3RyaW5nXTtcclxuXHJcbiAgICAgICAgZWxlbWVudCA9IGNyZWxbaXNFbGVtZW50U3RyaW5nXShlbGVtZW50KSA/IGVsZW1lbnQgOiBkLmNyZWF0ZUVsZW1lbnQoZWxlbWVudCk7XHJcbiAgICAgICAgLy8gc2hvcnRjdXRcclxuICAgICAgICBpZihhcmd1bWVudHNMZW5ndGggPT09IDEpe1xyXG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCFpc1R5cGUoc2V0dGluZ3Msb2JqKSB8fCBjcmVsW2lzTm9kZVN0cmluZ10oc2V0dGluZ3MpIHx8IGlzQXJyYXkoc2V0dGluZ3MpKSB7XHJcbiAgICAgICAgICAgIC0tY2hpbGRJbmRleDtcclxuICAgICAgICAgICAgc2V0dGluZ3MgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gc2hvcnRjdXQgaWYgdGhlcmUgaXMgb25seSBvbmUgY2hpbGQgdGhhdCBpcyBhIHN0cmluZ1xyXG4gICAgICAgIGlmKChhcmd1bWVudHNMZW5ndGggLSBjaGlsZEluZGV4KSA9PT0gMSAmJiBpc1R5cGUoYXJnc1tjaGlsZEluZGV4XSwgJ3N0cmluZycpICYmIGVsZW1lbnRbdGV4dENvbnRlbnRdICE9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICBlbGVtZW50W3RleHRDb250ZW50XSA9IGFyZ3NbY2hpbGRJbmRleF07XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGZvcig7IGNoaWxkSW5kZXggPCBhcmd1bWVudHNMZW5ndGg7ICsrY2hpbGRJbmRleCl7XHJcbiAgICAgICAgICAgICAgICBjaGlsZCA9IGFyZ3NbY2hpbGRJbmRleF07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoY2hpbGQgPT0gbnVsbCl7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzQXJyYXkoY2hpbGQpKSB7XHJcbiAgICAgICAgICAgICAgICAgIGZvciAodmFyIGk9MDsgaSA8IGNoaWxkLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXBwZW5kQ2hpbGQoZWxlbWVudCwgY2hpbGRbaV0pO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBhcHBlbmRDaGlsZChlbGVtZW50LCBjaGlsZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvcih2YXIga2V5IGluIHNldHRpbmdzKXtcclxuICAgICAgICAgICAgaWYoIWF0dHJpYnV0ZU1hcFtrZXldKXtcclxuICAgICAgICAgICAgICAgIGlmKGlzVHlwZShzZXR0aW5nc1trZXldLGZuKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudFtrZXldID0gc2V0dGluZ3Nba2V5XTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRbc2V0QXR0cmlidXRlXShrZXksIHNldHRpbmdzW2tleV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHZhciBhdHRyID0gYXR0cmlidXRlTWFwW2tleV07XHJcbiAgICAgICAgICAgICAgICBpZih0eXBlb2YgYXR0ciA9PT0gZm4pe1xyXG4gICAgICAgICAgICAgICAgICAgIGF0dHIoZWxlbWVudCwgc2V0dGluZ3Nba2V5XSk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50W3NldEF0dHJpYnV0ZV0oYXR0ciwgc2V0dGluZ3Nba2V5XSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVzZWQgZm9yIG1hcHBpbmcgb25lIGtpbmQgb2YgYXR0cmlidXRlIHRvIHRoZSBzdXBwb3J0ZWQgdmVyc2lvbiBvZiB0aGF0IGluIGJhZCBicm93c2Vycy5cclxuICAgIGNyZWxbYXR0ck1hcFN0cmluZ10gPSB7fTtcclxuXHJcbiAgICBjcmVsW2lzRWxlbWVudFN0cmluZ10gPSBpc0VsZW1lbnQ7XHJcblxyXG4gICAgY3JlbFtpc05vZGVTdHJpbmddID0gaXNOb2RlO1xyXG5cclxuICAgIGlmKHR5cGVvZiBQcm94eSAhPT0gJ3VuZGVmaW5lZCcpe1xyXG4gICAgICAgIGNyZWwucHJveHkgPSBuZXcgUHJveHkoY3JlbCwge1xyXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKHRhcmdldCwga2V5KXtcclxuICAgICAgICAgICAgICAgICEoa2V5IGluIGNyZWwpICYmIChjcmVsW2tleV0gPSBjcmVsLmJpbmQobnVsbCwga2V5KSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlbFtrZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNyZWw7XHJcbn0pKTtcclxuIiwidmFyIHN0YXRzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJlJyksXG4gICAgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyksXG4gICAgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKCl7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjYW52YXMpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc3RhdHMpO1xufSk7XG5cbnZhciByZW5kZXJIZWlnaHQgPSA2MDtcbnZhciByZW5kZXJXaWR0aCA9IDExMDA7XG5jYW52YXMuaGVpZ2h0ID0gcmVuZGVySGVpZ2h0O1xuY2FudmFzLndpZHRoID0gcmVuZGVyV2lkdGg7XG5cbnZhciBsYXN0QmVzdEJ1ZyA9IG51bGwsXG4gICAgbGFzdEJlc3RCdWdJbmZvO1xuXG5mdW5jdGlvbiBnZXRCZXN0QnVnSW5mbyhiZXN0QnVnKXtcbiAgICBpZihsYXN0QmVzdEJ1ZyA9PT0gYmVzdEJ1Zyl7XG4gICAgICAgIHJldHVybiBsYXN0QmVzdEJ1Z0luZm87XG4gICAgfVxuXG4gICAgbGFzdEJlc3RCdWcgPSBiZXN0QnVnO1xuXG4gICAgcmV0dXJuIGxhc3RCZXN0QnVnSW5mbyA9IGJlc3RCdWcubmV1cm9ucy5tYXAoZnVuY3Rpb24obmV1cm9uLCBpbmRleCl7XG4gICAgICAgIHJldHVybiBpbmRleCArICcgLSBJbnB1dHM6ICcgKyBuZXVyb24uc2V0dGluZ3MuaW5wdXRJbmRpY2llcyArICcgTWV0aG9kOiAnICsgbmV1cm9uLnNldHRpbmdzLm1ldGhvZCArICcgTW9kaWZpZXI6ICcgKyBuZXVyb24uc2V0dGluZ3MubW9kaWZpZXI7XG4gICAgfSkuam9pbignXFxuJyk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN0YXRlKXtcbiAgICB2YXIgY3VycmVudEJlc3RCdWcgPSBzdGF0ZS5idWdzLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGJ1Zyl7XG4gICAgICAgIHJldHVybiBidWcudG90YWxEaXN0YW5jZSA+IHJlc3VsdC50b3RhbERpc3RhbmNlID8gYnVnIDogcmVzdWx0O1xuICAgIH0sIHN0YXRlLmJ1Z3NbMF0pO1xuXG4gICAgc3RhdHMudGV4dENvbnRlbnQgPSBbXG4gICAgICAgICdUaWNrczogJyArIHN0YXRlLnRpY2tzLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgXCIsXCIpLFxuICAgICAgICAnSXR0ZXJhdGlvbnMgUGVyIDUwbXMgcnVuOiAnICsgc3RhdGUuaXR0ZXJhdGlvbnNQZXI1MCxcbiAgICAgICAgJ0J1Z3M6ICcgKyBzdGF0ZS5idWdzLmxlbmd0aCxcbiAgICAgICAgJ01heCBDdXJyZW50IERpc3RhbmNlOiAnICsgKGN1cnJlbnRCZXN0QnVnID8gY3VycmVudEJlc3RCdWcudG90YWxEaXN0YW5jZSA6ICdOb3RoaW5nIGFsaXZlJyksXG4gICAgICAgICdNYXggRGlzdGFuY2U6ICcgKyBzdGF0ZS5iZXN0QnVnLnRvdGFsRGlzdGFuY2UsXG4gICAgICAgICdCZXN0IEJ1Z3MgQnJhaW46ICcgKyBnZXRCZXN0QnVnSW5mbyhzdGF0ZS5iZXN0QnVnKVxuICAgIF0uam9pbignXFxuJyk7XG4gICAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgcmVuZGVyV2lkdGgsIHJlbmRlckhlaWdodCk7XG5cbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuXG4gICAgY29udGV4dC5maWxsU3R5bGUgPSAnIzAwMDAwMCc7XG5cbiAgICBzdGF0ZS5tYXAubWFwKGZ1bmN0aW9uKGRvdCwgaW5kZXgpe1xuICAgICAgICBpZihkb3Qpe1xuICAgICAgICAgICAgY29udGV4dC5maWxsUmVjdChpbmRleCAqIDEwLCByZW5kZXJIZWlnaHQgLSAxMCwgMTAsIDEwKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29udGV4dC5maWxsU3R5bGUgPSAnaHNsYSgnICsgKHN0YXRlLmJlc3RCdWcuYWdlIC8gMjApLnRvU3RyaW5nKCkgKyAnLCAxMDAlLCAzMCUsIDAuMyknO1xuICAgIGNvbnRleHQuZmlsbFJlY3Qoc3RhdGUuYmVzdEJ1Zy5kaXN0YW5jZSwgcmVuZGVySGVpZ2h0IC0gMTAgLSAoc3RhdGUuYmVzdEJ1Zy5oZWlnaHQgKiAxMCksIDEwLCAxMCk7XG5cbiAgICBzdGF0ZS5idWdzLm1hcChmdW5jdGlvbihidWcpe1xuICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICdoc2xhKCcgKyAoYnVnLnRocnVzdFggKiAyNTUpICsgJywgJyArICgoYnVnLnRocnVzdFkgKyBidWcudGhydXN0WSkgLyAyICogNTApICsgMjUgKyAnJSwgNTAlLCAxKSc7XG4gICAgICAgIGNvbnRleHQuZmlsbFJlY3QoYnVnLmRpc3RhbmNlLCByZW5kZXJIZWlnaHQgLSAxMCAtIChidWcuaGVpZ2h0ICogMTApLCAxMCwgMTApO1xuICAgIH0pO1xuXG4gICAgaWYoY3VycmVudEJlc3RCdWcpe1xuICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICdoc2woJyArIChjdXJyZW50QmVzdEJ1Zy5hZ2UgLyAyMCkudG9TdHJpbmcoKSArICcsIDEwMCUsIDMwJSknO1xuICAgICAgICBjb250ZXh0LmZpbGxSZWN0KGN1cnJlbnRCZXN0QnVnLmRpc3RhbmNlICsgMywgcmVuZGVySGVpZ2h0IC0gMTAgLSAoY3VycmVudEJlc3RCdWcuaGVpZ2h0ICogMTApIC0gNSwgNCwgNCk7XG4gICAgfVxuXG4gICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbn07IiwidmFyIG5ldXJhbCA9IHJlcXVpcmUoJy4vbmV1cmFsJyk7XG52YXIgc2ltU2V0dGluZ3MgPSB7IHJlYWx0aW1lOiBmYWxzZSwgbmV1cm9uQ291bnQ6IDIwIH07XG52YXIgaW5wdXQgPSByZXF1aXJlKCcuL2lucHV0Jykoc2ltU2V0dGluZ3MpO1xuXG52YXIgcHJldmlvdXNOZXVyb25TZXR0aW5ncyA9IFtdO1xuXG52YXIgaW5wdXRzID0ge1xuICAgIGFnZTogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWdlO1xuICAgIH0sXG4gICAgaGVpZ2h0OiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5oZWlnaHQ7XG4gICAgfSxcbiAgICBlbmVyZ3k6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmVuZXJneTtcbiAgICB9XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVFeWVJbnB1dChpbmRleCl7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmRvdFBvc2l0aW9uc1tpbmRleF0gPyAxIDogMDtcbiAgICB9O1xufVxuXG5mb3IodmFyIGkgPSAwOyBpIDwgMjA7IGkrKyl7XG4gICAgaW5wdXRzWyduZXh0JyArIGldID0gY3JlYXRlRXllSW5wdXQoaSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3Rpb25zKG1heENvbm5lY3Rpb25zLCBtYXhJbmRleCl7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuXG4gICAgdmFyIGNvbm5lY3Rpb25zID0gTWF0aC5tYXgocGFyc2VJbnQoKE1hdGgucmFuZG9tKCkgKiBtYXhDb25uZWN0aW9ucykgJSBtYXhDb25uZWN0aW9ucyksIDEpO1xuXG4gICAgd2hpbGUoY29ubmVjdGlvbnMtLSl7XG4gICAgICAgIHJlc3VsdC5wdXNoKHBhcnNlSW50KE1hdGgucmFuZG9tKCkgKiBtYXhJbmRleCkgJSBtYXhJbmRleCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxudmFyIG1ldGhvZHMgPSBuZXVyYWwubWV0aG9kcztcblxuZnVuY3Rpb24gcmFuZG9tTmV1cm9ucygpe1xuICAgIHZhciBuZXVyb25zID0gW107XG4gICAgZm9yKHZhciBqID0gMDsgaiA8IHNpbVNldHRpbmdzLm5ldXJvbkNvdW50OyBqKyspe1xuICAgICAgICB2YXIgbWV0aG9kSW5kZXggPSBwYXJzZUludChNYXRoLnJhbmRvbSgpICogbWV0aG9kcy5sZW5ndGgpICUgbWV0aG9kcy5sZW5ndGg7XG4gICAgICAgIG5ldXJvbnMucHVzaCh7XG4gICAgICAgICAgICBtZXRob2Q6IG1ldGhvZHNbbWV0aG9kSW5kZXhdLFxuICAgICAgICAgICAgbW9kaWZpZXI6IE1hdGgucmFuZG9tKCksXG4gICAgICAgICAgICBpbnB1dEluZGljaWVzOiBjcmVhdGVDb25uZWN0aW9ucyg2LCBqICsgT2JqZWN0LmtleXMoaW5wdXRzKS5sZW5ndGgpXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBuZXVyb25zO1xufVxuXG5mb3IodmFyIGkgPSAwOyBpIDwgMjA7IGkrKyl7XG4gICAgcHJldmlvdXNOZXVyb25TZXR0aW5ncy5wdXNoKHJhbmRvbU5ldXJvbnMoKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJ1ZyhwcmV2aW91c05ldXJvblNldHRpbmdzKXtcbiAgICB2YXIgYnVnID0gbmV1cmFsKHtcbiAgICAgICAgbXV0YXRpb246IDAuMDAwNSxcbiAgICAgICAgaW5wdXRzOiBpbnB1dHMsXG4gICAgICAgIG91dHB1dHM6IHtcbiAgICAgICAgICAgIHRocnVzdFg6IHRydWUsXG4gICAgICAgICAgICB0aHJ1c3RZOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHByZXZpb3VzTmV1cm9uU2V0dGluZ3M6IHByZXZpb3VzTmV1cm9uU2V0dGluZ3NcbiAgICB9KTtcblxuICAgIGJ1Zy5hZ2UgPSAwO1xuICAgIGJ1Zy5lbmVyZ3kgPSAxO1xuICAgIGJ1Zy5oZWlnaHQgPSAwO1xuICAgIGJ1Zy50aHJ1c3RYID0gMDtcbiAgICBidWcudGhydXN0WSA9IDA7XG4gICAgYnVnLmRpc3RhbmNlID0gMDtcbiAgICBidWcudG90YWxEaXN0YW5jZSA9IDA7XG4gICAgYnVnLmRpc3RGcm9tRG90ID0gLTE7XG5cbiAgICByZXR1cm4gYnVnO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDaGlsZChidWcpe1xuICAgIHJldHVybiBjcmVhdGVCdWcoYnVnLm5ldXJvbnMubWFwKGZ1bmN0aW9uKG5ldXJvbil7XG4gICAgICAgIHJldHVybiBuZXVyb24uc2V0dGluZ3M7XG4gICAgfSkpO1xufVxuXG52YXIgbWFwID0gW107XG5cbmZvcih2YXIgaSA9IDA7IGkgPCAxMjA7IGkrKyl7XG4gICAgbWFwLnB1c2goZmFsc2UpO1xufVxuXG52YXIgYnVncyA9IFtdO1xuXG52YXIgcmVuZGVyZXIgPSByZXF1aXJlKCcuL3JlbmRlcicpO1xuXG52YXIgdGlja3MgPSAwO1xudmFyIGxvb3Bpbmc7XG52YXIgYmVzdEJ1ZztcbnZhciBpdHRlcmF0aW9uc1BlcjUwID0gMDtcbmZ1bmN0aW9uIGdhbWVMb29wKCl7XG4gICAgdGlja3MrKztcbiAgICBpZihidWdzLmxlbmd0aCA8IDIwKXtcbiAgICAgICAgYmVzdEJ1ZyA/XG4gICAgICAgICAgICBidWdzLnB1c2goTWF0aC5yYW5kb20oKSA+IDAuOSA/IGNyZWF0ZUNoaWxkKGJlc3RCdWcpIDogY3JlYXRlQnVnKHJhbmRvbU5ldXJvbnMoKSkpIDpcbiAgICAgICAgICAgIGJ1Z3MucHVzaChjcmVhdGVCdWcocmFuZG9tTmV1cm9ucygpKSk7XG4gICAgfVxuXG4gICAgbWFwLnNoaWZ0KCk7XG4gICAgbWFwLnB1c2gobWFwLnNsaWNlKC01KS5zb21lKHggPT4geCkgPyBmYWxzZSA6IE1hdGgucmFuZG9tKCkgPCBidWdzLmxlbmd0aCAvIDIwMDApO1xuXG4gICAgdmFyIHN1cnZpdm9ycyA9IFtdO1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBidWdzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgdmFyIGJ1ZyA9IGJ1Z3NbaV07XG4gICAgICAgIGJ1Zy5hZ2UrKztcbiAgICAgICAgYnVnLmRpc3RhbmNlICs9IGJ1Zy50aHJ1c3RYICsgMTtcbiAgICAgICAgYnVnLnRvdGFsRGlzdGFuY2UgKz0gYnVnLnRocnVzdFggKyAxO1xuXG4gICAgICAgIGlmKCFiZXN0QnVnIHx8IGJ1Zy50b3RhbERpc3RhbmNlID4gYmVzdEJ1Zy50b3RhbERpc3RhbmNlKXtcbiAgICAgICAgICAgIHNpbVNldHRpbmdzLnJlYWx0aW1lID0gdHJ1ZTtcbiAgICAgICAgICAgIGJlc3RCdWcgPSBidWc7XG4gICAgICAgIH1cblxuICAgICAgICBpZihidWcuZGlzdGFuY2UgPiA5OTkpe1xuICAgICAgICAgICAgYnVnLmRpc3RhbmNlID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGJ1Zy5hZ2UgJiYgIShidWcuYWdlICUgMTExKSAmJiBidWcuYWdlID4gMzAwKXtcbiAgICAgICAgICAgIHN1cnZpdm9ycy5wdXNoKGNyZWF0ZUNoaWxkKGJ1ZykpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9vbiBkb3QsIGRpZVxuICAgICAgICBpZihidWcuZGlzdGFuY2UgPiAxMDAgJiYgYnVnLmhlaWdodCA8IDEgJiYgYnVnLm9uRG90KXtcbiAgICAgICAgICAgIGlmKGJ1ZyA9PT0gYmVzdEJ1Zyl7XG4gICAgICAgICAgICAgICAgc2ltU2V0dGluZ3MucmVhbHRpbWUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgc3Vydml2b3JzLnB1c2goYnVnKTtcblxuICAgICAgICAvL2ZhbGxcbiAgICAgICAgYnVnLmhlaWdodCArPSBidWcudGhydXN0WSAqIDI7XG4gICAgICAgIGJ1Zy5oZWlnaHQgPSBNYXRoLm1heCgwLCBidWcuaGVpZ2h0IC09IDAuNSk7XG4gICAgICAgIHZhciBtYXBQb3NpdGlvbiA9IHBhcnNlSW50KGJ1Zy5kaXN0YW5jZSAvIDEwKTtcbiAgICAgICAgYnVnLmRvdFBvc2l0aW9ucyA9IG1hcC5zbGljZShtYXBQb3NpdGlvbiwgbWFwUG9zaXRpb24gKyAyMCk7XG4gICAgICAgIGJ1Zy5vbkRvdCA9IGJ1Zy5kb3RQb3NpdGlvbnNbMF07XG5cbiAgICAgICAgaWYoYnVnLmVuZXJneSA+IDAuMil7XG4gICAgICAgICAgICB2YXIgdGhydXN0WSA9IGJ1Zy5vdXRwdXRzLnRocnVzdFkoKTtcbiAgICAgICAgICAgIGJ1Zy50aHJ1c3RZICs9IE1hdGgubWluKHRocnVzdFksIGJ1Zy5lbmVyZ3kpO1xuICAgICAgICAgICAgYnVnLmVuZXJneSA9IE1hdGgubWF4KDAsIGJ1Zy5lbmVyZ3kgLSBidWcudGhydXN0WSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYoYnVnLmVuZXJneSA+IDApe1xuICAgICAgICAgICAgdmFyIHRocnVzdFggPSBidWcub3V0cHV0cy50aHJ1c3RYKCk7XG4gICAgICAgICAgICBidWcudGhydXN0WCArPSBNYXRoLm1pbih0aHJ1c3RYLCBidWcuZW5lcmd5KTtcbiAgICAgICAgICAgIGJ1Zy5lbmVyZ3kgPSBNYXRoLm1heCgwLCBidWcuZW5lcmd5IC0gYnVnLnRocnVzdFgpO1xuICAgICAgICB9XG4gICAgICAgIGJ1Zy5lbmVyZ3kgPSBNYXRoLm1pbigxLCBidWcuZW5lcmd5ICsgMC4wNyk7XG4gICAgICAgIGlmKGJ1Zy50aHJ1c3RZID4gMCl7XG4gICAgICAgICAgICBidWcudGhydXN0WSAtPSAwLjE7XG4gICAgICAgIH1cbiAgICAgICAgaWYoYnVnLnRocnVzdFggPiAwLjEgfHwgYnVnLnRocnVzdFggPCAtMC4xKXtcbiAgICAgICAgICAgIGJ1Zy50aHJ1c3RYICo9IDAuOTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGJ1Z3MgPSBzdXJ2aXZvcnM7XG5cbiAgICBpZihsb29waW5nKXtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmKCFzaW1TZXR0aW5ncy5yZWFsdGltZSl7XG4gICAgICAgIGxvb3BpbmcgPSB0cnVlO1xuICAgICAgICB2YXIgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgICAgICBpdHRlcmF0aW9uc1BlcjUwID0gMDtcbiAgICAgICAgd2hpbGUoRGF0ZS5ub3coKSAtIHN0YXJ0IDwgNTApe1xuICAgICAgICAgICAgaXR0ZXJhdGlvbnNQZXI1MCsrO1xuICAgICAgICAgICAgZ2FtZUxvb3AoKTtcbiAgICAgICAgICAgIGlmKHNpbVNldHRpbmdzLnJlYWx0aW1lKXtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsb29waW5nID0gZmFsc2U7XG4gICAgICAgIHNldFRpbWVvdXQoZ2FtZUxvb3AsIDApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2V0VGltZW91dChnYW1lTG9vcCwgMzApO1xuXG59XG5cbmZ1bmN0aW9uIHJlbmRlcigpe1xuICAgIHJlbmRlcmVyKHsgdGlja3MsIGJ1Z3MsIG1hcCwgYmVzdEJ1ZywgaXR0ZXJhdGlvbnNQZXI1MCB9KTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcbn1cblxuZ2FtZUxvb3AoKTtcblxucmVuZGVyKCk7XG5cbiJdfQ==
