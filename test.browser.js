(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function(simSettings){
    var menu = document.createElement('div');
    var toggle = document.createElement('button');
    menu.appendChild(toggle);

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
},{}],2:[function(require,module,exports){
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

module.exports = function(state){
    var currentBestBug = state.bugs.reduce(function(result, bug){
        return bug.age > result.age ? bug : result;
    }, state.bugs[0]);

    stats.textContent = [
        'Ticks: ' + state.ticks,
        'Itterations Per 50ms run: ' + state.itterationsPer50,
        'Bugs: ' + state.bugs.length,
        'Max Current Age: ' + (currentBestBug ? currentBestBug.age : 'Nothing alive'),
        'Max Age: ' + state.bestBug.age,
        'Best Bugs Brain: ' + JSON.stringify(state.bestBug.neurons.map(function(neuron){
            return neuron.settings;
        }), null, 4)
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
},{}],4:[function(require,module,exports){
var neural = require('./neural');
var simSettings = { realtime: false };
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
    for(var j = 0; j < 20; j++){
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
            bugs.push(Math.random() > 0.5 ? createChild(bestBug) : createBug(randomNeurons())) :
            bugs.push(createBug(randomNeurons()));
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


},{"./input":1,"./neural":2,"./render":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4zLjEvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiaW5wdXQuanMiLCJuZXVyYWwuanMiLCJyZW5kZXIuanMiLCJ0ZXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2ltU2V0dGluZ3Mpe1xuICAgIHZhciBtZW51ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdmFyIHRvZ2dsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgIG1lbnUuYXBwZW5kQ2hpbGQodG9nZ2xlKTtcblxuICAgIHRvZ2dsZS50ZXh0Q29udGVudCA9ICdSZWFsdGltZSc7XG5cbiAgICB0b2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICBzaW1TZXR0aW5ncy5yZWFsdGltZSA9ICFzaW1TZXR0aW5ncy5yZWFsdGltZTtcbiAgICB9KTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oKXtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtZW51KTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIHJ1bigpe1xuICAgICAgICB0b2dnbGUudGV4dENvbnRlbnQgPSBzaW1TZXR0aW5ncy5yZWFsdGltZSA/ICdSZWFsIFRpbWUnIDogJ0h5cGVyc3BlZWQnO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocnVuKTtcbiAgICB9XG5cbiAgICBydW4oKTtcbn07IiwidmFyIG1ldGhvZHMgPSB7XG4gICAgbXVsdGlwbHk6IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gYSAqIGI7XG4gICAgfSxcbiAgICBkaXZpZGU6IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gYSAvIGI7XG4gICAgfSxcbiAgICBhZGQ6IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gYSArIGI7XG4gICAgfSxcbiAgICBzdWJ0cmFjdDogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBhIC0gYjtcbiAgICB9LFxuICAgIHBvd2VyOiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIE1hdGgucG93KGEsIGIpO1xuICAgIH0sXG4gICAgbW9kOiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIGEgJSBiICogMTA7XG4gICAgfSxcbiAgICBpbnZlcnQ6IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gTWF0aC5hYnMoYSAqIC1iKTtcbiAgICB9XG59O1xuXG5mdW5jdGlvbiBtYWtlTmV1cm9uKG5ldXJvbnMsIHNldHRpbmdzKXtcbiAgICB2YXIgaW5wdXRJbmRpY2llcyA9IHNldHRpbmdzLmlucHV0SW5kaWNpZXMuc2xpY2UoKTtcblxuICAgIHZhciBuZXVyb24gPSBmdW5jdGlvbigpe1xuICAgICAgICAvLyB2YXIgcmVzdWx0ID0gTWF0aC5wb3coaW5wdXRJbmRpY2llcy5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBpbmRleCl7XG4gICAgICAgIC8vICAgICByZXR1cm4gcmVzdWx0ICsgTWF0aC5wb3cobmV1cm9uc1tpbmRleF0oKSwgMik7XG4gICAgICAgIC8vIH0sIDApLCAwLjUpO1xuXG4gICAgICAgIHZhciByZXN1bHQgPSAwO1xuICAgICAgICBpZihpbnB1dEluZGljaWVzKXtcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBpbnB1dEluZGljaWVzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gbmV1cm9uc1tpbnB1dEluZGljaWVzW2ldXSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0IC89IGlucHV0SW5kaWNpZXMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIC8vIHZhciByZXN1bHQgPSBpbnB1dEluZGljaWVzID8gaW5wdXRJbmRpY2llcy5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBpbmRleCl7XG4gICAgICAgIC8vICAgICByZXR1cm4gcmVzdWx0ICsgbmV1cm9uc1tpbmRleF0oKTtcbiAgICAgICAgLy8gfSwgMCkgLyBpbnB1dEluZGljaWVzLmxlbmd0aCA6IDA7XG5cbiAgICAgICAgcmVzdWx0ID0gbWV0aG9kc1tzZXR0aW5ncy5tZXRob2RdKHJlc3VsdCwgc2V0dGluZ3MubW9kaWZpZXIpO1xuXG4gICAgICAgIHJlc3VsdCA9IE1hdGgubWluKDEsIHJlc3VsdCk7XG4gICAgICAgIHJlc3VsdCA9IE1hdGgubWF4KDAsIHJlc3VsdCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICAgIG5ldXJvbi5zZXR0aW5ncyA9IHNldHRpbmdzO1xuXG4gICAgcmV0dXJuIG5ldXJvbjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuZXR3b3JrU2V0dGluZ3Mpe1xuICAgIHZhciBuZXR3b3JrID0ge307XG5cbiAgICB2YXIgaW5wdXRzID0gbmV0d29ya1NldHRpbmdzLmlucHV0cyxcbiAgICAgICAgb3V0cHV0cyA9IG5ldHdvcmtTZXR0aW5ncy5vdXRwdXRzLFxuICAgICAgICBwcmV2aW91c05ldXJvblNldHRpbmdzID0gbmV0d29ya1NldHRpbmdzLnByZXZpb3VzTmV1cm9uU2V0dGluZ3MsXG4gICAgICAgIGlucHV0TmV1cm9ucyA9IE9iamVjdC5rZXlzKG5ldHdvcmtTZXR0aW5ncy5pbnB1dHMpLm1hcChmdW5jdGlvbihrZXkpe1xuICAgICAgICAgICAgcmV0dXJuIG5ldHdvcmtTZXR0aW5ncy5pbnB1dHNba2V5XS5iaW5kKG5ldHdvcmspO1xuICAgICAgICB9KSxcbiAgICAgICAgbmV1cm9ucyA9IGlucHV0TmV1cm9ucy5zbGljZSgpO1xuXG4gICAgcHJldmlvdXNOZXVyb25TZXR0aW5ncy5tYXAoZnVuY3Rpb24obmV1cm9uU2V0dGluZ3Mpe1xuICAgICAgICB2YXIgbmV3TmV1cm9uU2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiBuZXVyb25TZXR0aW5ncy5tZXRob2QsXG4gICAgICAgICAgICAgICAgaW5wdXRJbmRpY2llczogbmV1cm9uU2V0dGluZ3MuaW5wdXRJbmRpY2llcyxcbiAgICAgICAgICAgICAgICBtb2RpZmllcjogbmV1cm9uU2V0dGluZ3MubW9kaWZpZXIgKiAoMSArIChNYXRoLnJhbmRvbSgpICogKG5ldHdvcmtTZXR0aW5ncy5tdXRhdGlvbiAqIDIpIC0gbmV0d29ya1NldHRpbmdzLm11dGF0aW9uKSlcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgbmV1cm9ucy5wdXNoKG1ha2VOZXVyb24obmV1cm9ucywgbmV3TmV1cm9uU2V0dGluZ3MpKTtcbiAgICB9KTtcblxuICAgIHZhciBvdXRwdXROZXVyb25zID0gbmV1cm9ucy5zbGljZSgtIE9iamVjdC5rZXlzKG91dHB1dHMpLmxlbmd0aCk7XG5cbiAgICB2YXIgaW5wdXRNYXAgPSBPYmplY3Qua2V5cyhpbnB1dHMpLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGtleSl7XG4gICAgICAgIHJlc3VsdFtrZXldID0gaW5wdXROZXVyb25zLnBvcCgpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwge30pO1xuXG4gICAgdmFyIG91dHB1dE1hcCA9IE9iamVjdC5rZXlzKG91dHB1dHMpLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGtleSl7XG4gICAgICAgIHJlc3VsdFtrZXldID0gb3V0cHV0TmV1cm9ucy5wb3AoKTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIHt9KTtcblxuICAgIG5ldHdvcmsuaW5wdXRzID0gaW5wdXRNYXA7XG4gICAgbmV0d29yay5vdXRwdXRzID0gb3V0cHV0TWFwO1xuICAgIG5ldHdvcmsubmV1cm9ucyA9IG5ldXJvbnMuc2xpY2UoT2JqZWN0LmtleXMoaW5wdXRzKS5sZW5ndGgpO1xuXG4gICAgcmV0dXJuIG5ldHdvcms7XG59O1xubW9kdWxlLmV4cG9ydHMubWV0aG9kcyA9IE9iamVjdC5rZXlzKG1ldGhvZHMpOyIsInZhciBzdGF0cyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ByZScpLFxuICAgIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLFxuICAgIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbigpe1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2FudmFzKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN0YXRzKTtcbn0pO1xuXG52YXIgcmVuZGVySGVpZ2h0ID0gNjA7XG52YXIgcmVuZGVyV2lkdGggPSAxMTAwO1xuY2FudmFzLmhlaWdodCA9IHJlbmRlckhlaWdodDtcbmNhbnZhcy53aWR0aCA9IHJlbmRlcldpZHRoO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN0YXRlKXtcbiAgICB2YXIgY3VycmVudEJlc3RCdWcgPSBzdGF0ZS5idWdzLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGJ1Zyl7XG4gICAgICAgIHJldHVybiBidWcuYWdlID4gcmVzdWx0LmFnZSA/IGJ1ZyA6IHJlc3VsdDtcbiAgICB9LCBzdGF0ZS5idWdzWzBdKTtcblxuICAgIHN0YXRzLnRleHRDb250ZW50ID0gW1xuICAgICAgICAnVGlja3M6ICcgKyBzdGF0ZS50aWNrcyxcbiAgICAgICAgJ0l0dGVyYXRpb25zIFBlciA1MG1zIHJ1bjogJyArIHN0YXRlLml0dGVyYXRpb25zUGVyNTAsXG4gICAgICAgICdCdWdzOiAnICsgc3RhdGUuYnVncy5sZW5ndGgsXG4gICAgICAgICdNYXggQ3VycmVudCBBZ2U6ICcgKyAoY3VycmVudEJlc3RCdWcgPyBjdXJyZW50QmVzdEJ1Zy5hZ2UgOiAnTm90aGluZyBhbGl2ZScpLFxuICAgICAgICAnTWF4IEFnZTogJyArIHN0YXRlLmJlc3RCdWcuYWdlLFxuICAgICAgICAnQmVzdCBCdWdzIEJyYWluOiAnICsgSlNPTi5zdHJpbmdpZnkoc3RhdGUuYmVzdEJ1Zy5uZXVyb25zLm1hcChmdW5jdGlvbihuZXVyb24pe1xuICAgICAgICAgICAgcmV0dXJuIG5ldXJvbi5zZXR0aW5ncztcbiAgICAgICAgfSksIG51bGwsIDQpXG4gICAgXS5qb2luKCdcXG4nKTtcbiAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCByZW5kZXJXaWR0aCwgcmVuZGVySGVpZ2h0KTtcblxuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG5cbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICcjMDAwMDAwJztcblxuICAgIHN0YXRlLm1hcC5tYXAoZnVuY3Rpb24oZG90LCBpbmRleCl7XG4gICAgICAgIGlmKGRvdCl7XG4gICAgICAgICAgICBjb250ZXh0LmZpbGxSZWN0KGluZGV4ICogMTAsIHJlbmRlckhlaWdodCAtIDEwLCAxMCwgMTApO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICcjRkYwMDAwJztcblxuICAgIHN0YXRlLmJ1Z3MubWFwKGZ1bmN0aW9uKGJ1Zyl7XG4gICAgICAgIGNvbnRleHQuZmlsbFJlY3QoYnVnLmRpc3RhbmNlLCByZW5kZXJIZWlnaHQgLSAxMCAtIChidWcuaGVpZ2h0ICogMTApLCAxMCwgMTApO1xuICAgIH0pO1xuXG4gICAgY29udGV4dC5maWxsU3R5bGUgPSAnaHNsYSgnICsgKHN0YXRlLmJlc3RCdWcuYWdlIC8gMjApLnRvU3RyaW5nKCkgKyAnLCAxMDAlLCAzMCUsIDAuMyknO1xuICAgIGNvbnRleHQuZmlsbFJlY3Qoc3RhdGUuYmVzdEJ1Zy5kaXN0YW5jZSwgcmVuZGVySGVpZ2h0IC0gMTAgLSAoc3RhdGUuYmVzdEJ1Zy5oZWlnaHQgKiAxMCksIDEwLCAxMCk7XG5cbiAgICBpZihjdXJyZW50QmVzdEJ1Zyl7XG4gICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ2hzbCgnICsgKGN1cnJlbnRCZXN0QnVnLmFnZSAvIDIwKS50b1N0cmluZygpICsgJywgMTAwJSwgMzAlKSc7XG4gICAgICAgIGNvbnRleHQuZmlsbFJlY3QoY3VycmVudEJlc3RCdWcuZGlzdGFuY2UsIHJlbmRlckhlaWdodCAtIDEwIC0gKGN1cnJlbnRCZXN0QnVnLmhlaWdodCAqIDEwKSwgMTAsIDEwKTtcbiAgICB9XG5cbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xufTsiLCJ2YXIgbmV1cmFsID0gcmVxdWlyZSgnLi9uZXVyYWwnKTtcbnZhciBzaW1TZXR0aW5ncyA9IHsgcmVhbHRpbWU6IGZhbHNlIH07XG52YXIgaW5wdXQgPSByZXF1aXJlKCcuL2lucHV0Jykoc2ltU2V0dGluZ3MpO1xuXG52YXIgcHJldmlvdXNOZXVyb25TZXR0aW5ncyA9IFtdO1xuXG52YXIgaW5wdXRzID0ge1xuICAgIGFnZTogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWdlO1xuICAgIH0sXG4gICAgaGVpZ2h0OiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5oZWlnaHQ7XG4gICAgfSxcbiAgICBlbmVyZ3k6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmVuZXJneTtcbiAgICB9XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVFeWVJbnB1dChpbmRleCl7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmRvdFBvc2l0aW9uc1tpbmRleF0gPyAxIDogMDtcbiAgICB9O1xufVxuXG5mb3IodmFyIGkgPSAwOyBpIDwgMjA7IGkrKyl7XG4gICAgaW5wdXRzWyduZXh0JyArIGldID0gY3JlYXRlRXllSW5wdXQoaSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3Rpb25zKG1heENvbm5lY3Rpb25zLCBtYXhJbmRleCl7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuXG4gICAgdmFyIGNvbm5lY3Rpb25zID0gTWF0aC5tYXgocGFyc2VJbnQoKE1hdGgucmFuZG9tKCkgKiBtYXhDb25uZWN0aW9ucykgJSBtYXhDb25uZWN0aW9ucyksIDEpO1xuXG4gICAgd2hpbGUoY29ubmVjdGlvbnMtLSl7XG4gICAgICAgIHJlc3VsdC5wdXNoKHBhcnNlSW50KE1hdGgucmFuZG9tKCkgKiBtYXhJbmRleCkgJSBtYXhJbmRleCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxudmFyIG1ldGhvZHMgPSBuZXVyYWwubWV0aG9kcztcblxuZnVuY3Rpb24gcmFuZG9tTmV1cm9ucygpe1xuICAgIHZhciBuZXVyb25zID0gW107XG4gICAgZm9yKHZhciBqID0gMDsgaiA8IDIwOyBqKyspe1xuICAgICAgICB2YXIgbWV0aG9kSW5kZXggPSBwYXJzZUludChNYXRoLnJhbmRvbSgpICogbWV0aG9kcy5sZW5ndGgpICUgbWV0aG9kcy5sZW5ndGg7XG4gICAgICAgIG5ldXJvbnMucHVzaCh7XG4gICAgICAgICAgICBtZXRob2Q6IG1ldGhvZHNbbWV0aG9kSW5kZXhdLFxuICAgICAgICAgICAgbW9kaWZpZXI6IE1hdGgucmFuZG9tKCksXG4gICAgICAgICAgICBpbnB1dEluZGljaWVzOiBjcmVhdGVDb25uZWN0aW9ucyg1LCBqICsgT2JqZWN0LmtleXMoaW5wdXRzKS5sZW5ndGgpXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBuZXVyb25zO1xufVxuXG5mb3IodmFyIGkgPSAwOyBpIDwgMjA7IGkrKyl7XG4gICAgcHJldmlvdXNOZXVyb25TZXR0aW5ncy5wdXNoKHJhbmRvbU5ldXJvbnMoKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJ1ZyhwcmV2aW91c05ldXJvblNldHRpbmdzKXtcbiAgICB2YXIgYnVnID0gbmV1cmFsKHtcbiAgICAgICAgbXV0YXRpb246IDAuMDAwNSxcbiAgICAgICAgaW5wdXRzOiBpbnB1dHMsXG4gICAgICAgIG91dHB1dHM6IHtcbiAgICAgICAgICAgIHRocnVzdFg6IHRydWUsXG4gICAgICAgICAgICB0aHJ1c3RZOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHByZXZpb3VzTmV1cm9uU2V0dGluZ3M6IHByZXZpb3VzTmV1cm9uU2V0dGluZ3NcbiAgICB9KTtcblxuICAgIGJ1Zy5hZ2UgPSAwO1xuICAgIGJ1Zy5lbmVyZ3kgPSAxO1xuICAgIGJ1Zy5oZWlnaHQgPSAwO1xuICAgIGJ1Zy50aHJ1c3RYID0gMDtcbiAgICBidWcudGhydXN0WSA9IDA7XG4gICAgYnVnLmRpc3RhbmNlID0gMDtcbiAgICBidWcuZGlzdEZyb21Eb3QgPSAtMTtcblxuICAgIHJldHVybiBidWc7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNoaWxkKGJ1Zyl7XG4gICAgcmV0dXJuIGNyZWF0ZUJ1ZyhidWcubmV1cm9ucy5tYXAoZnVuY3Rpb24obmV1cm9uKXtcbiAgICAgICAgcmV0dXJuIG5ldXJvbi5zZXR0aW5ncztcbiAgICB9KSk7XG59XG5cbnZhciBtYXAgPSBbXTtcblxuZm9yKHZhciBpID0gMDsgaSA8IDEyMDsgaSsrKXtcbiAgICBtYXAucHVzaChmYWxzZSk7XG59XG5cbnZhciBidWdzID0gW107XG5cbnZhciByZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyJyk7XG5cbnZhciB0aWNrcyA9IDA7XG52YXIgbG9vcGluZztcbnZhciBiZXN0QnVnO1xudmFyIGl0dGVyYXRpb25zUGVyNTAgPSAwO1xuZnVuY3Rpb24gZ2FtZUxvb3AoKXtcbiAgICB0aWNrcysrO1xuICAgIGlmKGJ1Z3MubGVuZ3RoIDwgMjApe1xuICAgICAgICBiZXN0QnVnID9cbiAgICAgICAgICAgIGJ1Z3MucHVzaChNYXRoLnJhbmRvbSgpID4gMC41ID8gY3JlYXRlQ2hpbGQoYmVzdEJ1ZykgOiBjcmVhdGVCdWcocmFuZG9tTmV1cm9ucygpKSkgOlxuICAgICAgICAgICAgYnVncy5wdXNoKGNyZWF0ZUJ1ZyhyYW5kb21OZXVyb25zKCkpKTtcbiAgICB9XG5cbiAgICBtYXAuc2hpZnQoKTtcbiAgICBtYXAucHVzaChtYXAuc2xpY2UoLTEwKS5zb21lKHggPT4geCkgPyBmYWxzZSA6IE1hdGgucmFuZG9tKCkgPCBidWdzLmxlbmd0aCAvIDIwMDApO1xuXG4gICAgdmFyIHN1cnZpdm9ycyA9IFtdO1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBidWdzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgdmFyIGJ1ZyA9IGJ1Z3NbaV07XG4gICAgICAgIGJ1Zy5hZ2UrKztcbiAgICAgICAgYnVnLmRpc3RhbmNlICs9IGJ1Zy50aHJ1c3RYICsgMTtcblxuICAgICAgICBpZighYmVzdEJ1ZyB8fCBidWcuYWdlID4gYmVzdEJ1Zy5hZ2Upe1xuICAgICAgICAgICAgc2ltU2V0dGluZ3MucmVhbHRpbWUgPSB0cnVlO1xuICAgICAgICAgICAgYmVzdEJ1ZyA9IGJ1ZztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGJ1Zy5kaXN0YW5jZSA+IDk5OSl7XG4gICAgICAgICAgICBidWcuZGlzdGFuY2UgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoYnVnLmFnZSAmJiAhKGJ1Zy5hZ2UgJSAxMTEpICYmIGJ1Zy5hZ2UgPiAzMDApe1xuICAgICAgICAgICAgc3Vydml2b3JzLnB1c2goY3JlYXRlQ2hpbGQoYnVnKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL29uIGRvdCwgZGllXG4gICAgICAgIGlmKGJ1Zy5kaXN0YW5jZSA+IDEwMCAmJiBidWcuaGVpZ2h0IDwgMSAmJiBidWcub25Eb3Qpe1xuICAgICAgICAgICAgaWYoYnVnID09PSBiZXN0QnVnKXtcbiAgICAgICAgICAgICAgICBzaW1TZXR0aW5ncy5yZWFsdGltZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBzdXJ2aXZvcnMucHVzaChidWcpO1xuXG4gICAgICAgIC8vZmFsbFxuICAgICAgICBidWcuaGVpZ2h0ICs9IGJ1Zy50aHJ1c3RZICogMjtcbiAgICAgICAgYnVnLmhlaWdodCA9IE1hdGgubWF4KDAsIGJ1Zy5oZWlnaHQgLT0gMC41KTtcbiAgICAgICAgdmFyIG1hcFBvc2l0aW9uID0gcGFyc2VJbnQoYnVnLmRpc3RhbmNlIC8gMTApO1xuICAgICAgICBidWcuZG90UG9zaXRpb25zID0gbWFwLnNsaWNlKG1hcFBvc2l0aW9uLCBtYXBQb3NpdGlvbiArIDIwKTtcbiAgICAgICAgYnVnLm9uRG90ID0gYnVnLmRvdFBvc2l0aW9uc1swXTtcblxuICAgICAgICBpZighYnVnLmhlaWdodCl7XG4gICAgICAgICAgICBpZihidWcuZW5lcmd5ID4gMC4yKXtcbiAgICAgICAgICAgICAgICB2YXIgdGhydXN0WSA9IGJ1Zy5vdXRwdXRzLnRocnVzdFkoKTtcbiAgICAgICAgICAgICAgICBidWcudGhydXN0WSArPSBNYXRoLm1pbih0aHJ1c3RZLCBidWcuZW5lcmd5KTtcbiAgICAgICAgICAgICAgICBidWcuZW5lcmd5ID0gTWF0aC5tYXgoMCwgYnVnLmVuZXJneSAtIGJ1Zy50aHJ1c3RZKTtcblxuICAgICAgICAgICAgICAgIHZhciB0aHJ1c3RYID0gYnVnLm91dHB1dHMudGhydXN0WCgpO1xuICAgICAgICAgICAgICAgIGJ1Zy50aHJ1c3RYICs9IE1hdGgubWluKHRocnVzdFgsIGJ1Zy5lbmVyZ3kpO1xuICAgICAgICAgICAgICAgIGJ1Zy5lbmVyZ3kgPSBNYXRoLm1heCgwLCBidWcuZW5lcmd5IC0gYnVnLnRocnVzdFgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnVnLmVuZXJneSA9IE1hdGgubWluKDEsIGJ1Zy5lbmVyZ3kgKyAwLjEpO1xuICAgICAgICB9XG4gICAgICAgIGlmKGJ1Zy50aHJ1c3RZID4gMCl7XG4gICAgICAgICAgICBidWcudGhydXN0WSAtPSAwLjE7XG4gICAgICAgIH1cbiAgICAgICAgaWYoYnVnLnRocnVzdFggPiAwLjEgfHwgYnVnLnRocnVzdFggPCAtMC4xKXtcbiAgICAgICAgICAgIGJ1Zy50aHJ1c3RYICo9IDAuOTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGJ1Z3MgPSBzdXJ2aXZvcnM7XG5cbiAgICBpZihsb29waW5nKXtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmKCFzaW1TZXR0aW5ncy5yZWFsdGltZSl7XG4gICAgICAgIGxvb3BpbmcgPSB0cnVlO1xuICAgICAgICB2YXIgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgICAgICBpdHRlcmF0aW9uc1BlcjUwID0gMDtcbiAgICAgICAgd2hpbGUoRGF0ZS5ub3coKSAtIHN0YXJ0IDwgNTApe1xuICAgICAgICAgICAgaXR0ZXJhdGlvbnNQZXI1MCsrO1xuICAgICAgICAgICAgZ2FtZUxvb3AoKTtcbiAgICAgICAgICAgIGlmKHNpbVNldHRpbmdzLnJlYWx0aW1lKXtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsb29waW5nID0gZmFsc2U7XG4gICAgICAgIHNldFRpbWVvdXQoZ2FtZUxvb3AsIDApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2V0VGltZW91dChnYW1lTG9vcCwgMzApO1xuXG59XG5cbmZ1bmN0aW9uIHJlbmRlcigpe1xuICAgIHJlbmRlcmVyKHsgdGlja3MsIGJ1Z3MsIG1hcCwgYmVzdEJ1ZywgaXR0ZXJhdGlvbnNQZXI1MCB9KTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcbn1cblxuZ2FtZUxvb3AoKTtcblxucmVuZGVyKCk7XG5cbiJdfQ==
