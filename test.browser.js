(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function(simSettings){
    var toggle = document.createElement('button');

    toggle.textContent = 'Realtime';

    toggle.addEventListener('click', function(){
        simSettings.realtime = !simSettings.realtime;
    });

    window.addEventListener('load', function(){
        document.body.appendChild(toggle);
    });
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
    var inputs = [],
        inputIndicies = settings.inputIndicies.slice();

    var neuron = function(){
        // var result = Math.pow(inputIndicies.reduce(function(result, index){
        //     return result + Math.pow(neurons[index](), 2);
        // }, 0), 0.5);

        var result = inputIndicies ? inputIndicies.reduce(function(result, index){
            return result + neurons[index]();
        }, 0) / inputIndicies.length : 0;

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
        'Bugs: ' + state.bugs.length,
        'Max Current Age: ' + currentBestBug.age,
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

    context.fillStyle = 'hsl(' + (currentBestBug.age / 20).toString() + ', 100%, 30%)';
    context.fillRect(currentBestBug.distance, renderHeight - 10 - (currentBestBug.height * 10), 10, 10);

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
            thrust: true
        },
        previousNeuronSettings: previousNeuronSettings
    });

    bug.age = 0;
    bug.energy = 1;
    bug.height = 0;
    bug.thrust = 0;
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
var innerRuns = 1;
var bestBug;
function gameLoop(){
    ticks++;
    if(bugs.length < 20){
        bestBug ?
            bugs.push(Math.random() > 0.5 ? createChild(bestBug) : createBug(randomNeurons())) :
            bugs.push(createBug(randomNeurons()));
    }

    map.shift();
    map.push(map.slice(-10).some(x => x) ? false : Math.random() < bugs.length / 2000);

    bugs = bugs.reduce(function(survivors, bug){
        bug.age++;
        bug.distance++;

        if(!bestBug || bug.age > bestBug.age){
            simSettings.realtime = true;
            bestBug = bug;
        }

        if(bug.distance > 999){
            bug.distance = 0;
        }

        if(bug.distance && !(bug.distance % 111) && bug.age > 300){
            survivors.push(createChild(bug));
        }

        //on dot, die
        if(bug.distance > 100 && bug.height < 1 && bug.onDot){
            if(bug === bestBug){
                simSettings.realtime = false;
            }
            return survivors;
        }

        survivors.push(bug);

        //fall
        bug.height += bug.thrust;
        bug.height = Math.max(0, bug.height -= 0.5);
        var mapPosition = parseInt(bug.distance / 10);
        bug.dotPositions = map.slice(mapPosition, mapPosition + 20);
        bug.onDot = bug.dotPositions[0];

        if(!bug.height && bug.energy > 0.2){
            var thrust = bug.outputs.thrust();
            bug.thrust += thrust * bug.energy * 1.5;
            bug.energy = Math.max(0, bug.energy - bug.thrust);
        }
        bug.energy = Math.min(1, bug.energy + 0.047);
        if(bug.thrust > 0){
            bug.thrust -= 0.1;
        }

        return survivors;
    }, []);

    if(!simSettings.realtime){
        if(innerRuns--){
            gameLoop();
        }else{
            innerRuns = 1000;
            setTimeout(gameLoop, 0);
        }
        return;
    }

    setTimeout(gameLoop, 30);

}

function render(){
    renderer({ ticks, bugs, map, bestBug });
    requestAnimationFrame(render);
}

gameLoop();

render();


},{"./input":1,"./neural":2,"./render":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4zLjEvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiaW5wdXQuanMiLCJuZXVyYWwuanMiLCJyZW5kZXIuanMiLCJ0ZXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzaW1TZXR0aW5ncyl7XG4gICAgdmFyIHRvZ2dsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuXG4gICAgdG9nZ2xlLnRleHRDb250ZW50ID0gJ1JlYWx0aW1lJztcblxuICAgIHRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHNpbVNldHRpbmdzLnJlYWx0aW1lID0gIXNpbVNldHRpbmdzLnJlYWx0aW1lO1xuICAgIH0pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbigpe1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRvZ2dsZSk7XG4gICAgfSk7XG59OyIsInZhciBtZXRob2RzID0ge1xuICAgIG11bHRpcGx5OiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIGEgKiBiO1xuICAgIH0sXG4gICAgZGl2aWRlOiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIGEgLyBiO1xuICAgIH0sXG4gICAgYWRkOiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIGEgKyBiO1xuICAgIH0sXG4gICAgc3VidHJhY3Q6IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gYSAtIGI7XG4gICAgfSxcbiAgICBwb3dlcjogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBNYXRoLnBvdyhhLCBiKTtcbiAgICB9LFxuICAgIG1vZDogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBhICUgYiAqIDEwO1xuICAgIH0sXG4gICAgaW52ZXJ0OiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIE1hdGguYWJzKGEgKiAtYik7XG4gICAgfVxufTtcblxuZnVuY3Rpb24gbWFrZU5ldXJvbihuZXVyb25zLCBzZXR0aW5ncyl7XG4gICAgdmFyIGlucHV0cyA9IFtdLFxuICAgICAgICBpbnB1dEluZGljaWVzID0gc2V0dGluZ3MuaW5wdXRJbmRpY2llcy5zbGljZSgpO1xuXG4gICAgdmFyIG5ldXJvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIC8vIHZhciByZXN1bHQgPSBNYXRoLnBvdyhpbnB1dEluZGljaWVzLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGluZGV4KXtcbiAgICAgICAgLy8gICAgIHJldHVybiByZXN1bHQgKyBNYXRoLnBvdyhuZXVyb25zW2luZGV4XSgpLCAyKTtcbiAgICAgICAgLy8gfSwgMCksIDAuNSk7XG5cbiAgICAgICAgdmFyIHJlc3VsdCA9IGlucHV0SW5kaWNpZXMgPyBpbnB1dEluZGljaWVzLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGluZGV4KXtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQgKyBuZXVyb25zW2luZGV4XSgpO1xuICAgICAgICB9LCAwKSAvIGlucHV0SW5kaWNpZXMubGVuZ3RoIDogMDtcblxuICAgICAgICByZXN1bHQgPSBtZXRob2RzW3NldHRpbmdzLm1ldGhvZF0ocmVzdWx0LCBzZXR0aW5ncy5tb2RpZmllcik7XG5cbiAgICAgICAgcmVzdWx0ID0gTWF0aC5taW4oMSwgcmVzdWx0KTtcbiAgICAgICAgcmVzdWx0ID0gTWF0aC5tYXgoMCwgcmVzdWx0KTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgbmV1cm9uLnNldHRpbmdzID0gc2V0dGluZ3M7XG5cbiAgICByZXR1cm4gbmV1cm9uO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5ldHdvcmtTZXR0aW5ncyl7XG4gICAgdmFyIG5ldHdvcmsgPSB7fTtcblxuICAgIHZhciBpbnB1dHMgPSBuZXR3b3JrU2V0dGluZ3MuaW5wdXRzLFxuICAgICAgICBvdXRwdXRzID0gbmV0d29ya1NldHRpbmdzLm91dHB1dHMsXG4gICAgICAgIHByZXZpb3VzTmV1cm9uU2V0dGluZ3MgPSBuZXR3b3JrU2V0dGluZ3MucHJldmlvdXNOZXVyb25TZXR0aW5ncyxcbiAgICAgICAgaW5wdXROZXVyb25zID0gT2JqZWN0LmtleXMobmV0d29ya1NldHRpbmdzLmlucHV0cykubWFwKGZ1bmN0aW9uKGtleSl7XG4gICAgICAgICAgICByZXR1cm4gbmV0d29ya1NldHRpbmdzLmlucHV0c1trZXldLmJpbmQobmV0d29yayk7XG4gICAgICAgIH0pLFxuICAgICAgICBuZXVyb25zID0gaW5wdXROZXVyb25zLnNsaWNlKCk7XG5cbiAgICBwcmV2aW91c05ldXJvblNldHRpbmdzLm1hcChmdW5jdGlvbihuZXVyb25TZXR0aW5ncyl7XG4gICAgICAgIHZhciBuZXdOZXVyb25TZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6IG5ldXJvblNldHRpbmdzLm1ldGhvZCxcbiAgICAgICAgICAgICAgICBpbnB1dEluZGljaWVzOiBuZXVyb25TZXR0aW5ncy5pbnB1dEluZGljaWVzLFxuICAgICAgICAgICAgICAgIG1vZGlmaWVyOiBuZXVyb25TZXR0aW5ncy5tb2RpZmllciAqICgxICsgKE1hdGgucmFuZG9tKCkgKiAobmV0d29ya1NldHRpbmdzLm11dGF0aW9uICogMikgLSBuZXR3b3JrU2V0dGluZ3MubXV0YXRpb24pKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICBuZXVyb25zLnB1c2gobWFrZU5ldXJvbihuZXVyb25zLCBuZXdOZXVyb25TZXR0aW5ncykpO1xuICAgIH0pO1xuXG4gICAgdmFyIG91dHB1dE5ldXJvbnMgPSBuZXVyb25zLnNsaWNlKC0gT2JqZWN0LmtleXMob3V0cHV0cykubGVuZ3RoKTtcblxuICAgIHZhciBpbnB1dE1hcCA9IE9iamVjdC5rZXlzKGlucHV0cykucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwga2V5KXtcbiAgICAgICAgcmVzdWx0W2tleV0gPSBpbnB1dE5ldXJvbnMucG9wKCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCB7fSk7XG5cbiAgICB2YXIgb3V0cHV0TWFwID0gT2JqZWN0LmtleXMob3V0cHV0cykucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwga2V5KXtcbiAgICAgICAgcmVzdWx0W2tleV0gPSBvdXRwdXROZXVyb25zLnBvcCgpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwge30pO1xuXG4gICAgbmV0d29yay5pbnB1dHMgPSBpbnB1dE1hcDtcbiAgICBuZXR3b3JrLm91dHB1dHMgPSBvdXRwdXRNYXA7XG4gICAgbmV0d29yay5uZXVyb25zID0gbmV1cm9ucy5zbGljZShPYmplY3Qua2V5cyhpbnB1dHMpLmxlbmd0aCk7XG5cbiAgICByZXR1cm4gbmV0d29yaztcbn07XG5tb2R1bGUuZXhwb3J0cy5tZXRob2RzID0gT2JqZWN0LmtleXMobWV0aG9kcyk7IiwidmFyIHN0YXRzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJlJyksXG4gICAgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyksXG4gICAgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKCl7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjYW52YXMpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc3RhdHMpO1xufSk7XG5cbnZhciByZW5kZXJIZWlnaHQgPSA2MDtcbnZhciByZW5kZXJXaWR0aCA9IDExMDA7XG5jYW52YXMuaGVpZ2h0ID0gcmVuZGVySGVpZ2h0O1xuY2FudmFzLndpZHRoID0gcmVuZGVyV2lkdGg7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RhdGUpe1xuICAgIHZhciBjdXJyZW50QmVzdEJ1ZyA9IHN0YXRlLmJ1Z3MucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwgYnVnKXtcbiAgICAgICAgcmV0dXJuIGJ1Zy5hZ2UgPiByZXN1bHQuYWdlID8gYnVnIDogcmVzdWx0O1xuICAgIH0sIHN0YXRlLmJ1Z3NbMF0pO1xuXG4gICAgc3RhdHMudGV4dENvbnRlbnQgPSBbXG4gICAgICAgICdUaWNrczogJyArIHN0YXRlLnRpY2tzLFxuICAgICAgICAnQnVnczogJyArIHN0YXRlLmJ1Z3MubGVuZ3RoLFxuICAgICAgICAnTWF4IEN1cnJlbnQgQWdlOiAnICsgY3VycmVudEJlc3RCdWcuYWdlLFxuICAgICAgICAnTWF4IEFnZTogJyArIHN0YXRlLmJlc3RCdWcuYWdlLFxuICAgICAgICAnQmVzdCBCdWdzIEJyYWluOiAnICsgSlNPTi5zdHJpbmdpZnkoc3RhdGUuYmVzdEJ1Zy5uZXVyb25zLm1hcChmdW5jdGlvbihuZXVyb24pe1xuICAgICAgICAgICAgcmV0dXJuIG5ldXJvbi5zZXR0aW5ncztcbiAgICAgICAgfSksIG51bGwsIDQpXG4gICAgXS5qb2luKCdcXG4nKTtcbiAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCByZW5kZXJXaWR0aCwgcmVuZGVySGVpZ2h0KTtcblxuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG5cbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICcjMDAwMDAwJztcblxuICAgIHN0YXRlLm1hcC5tYXAoZnVuY3Rpb24oZG90LCBpbmRleCl7XG4gICAgICAgIGlmKGRvdCl7XG4gICAgICAgICAgICBjb250ZXh0LmZpbGxSZWN0KGluZGV4ICogMTAsIHJlbmRlckhlaWdodCAtIDEwLCAxMCwgMTApO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICcjRkYwMDAwJztcblxuICAgIHN0YXRlLmJ1Z3MubWFwKGZ1bmN0aW9uKGJ1Zyl7XG4gICAgICAgIGNvbnRleHQuZmlsbFJlY3QoYnVnLmRpc3RhbmNlLCByZW5kZXJIZWlnaHQgLSAxMCAtIChidWcuaGVpZ2h0ICogMTApLCAxMCwgMTApO1xuICAgIH0pO1xuXG4gICAgY29udGV4dC5maWxsU3R5bGUgPSAnaHNsYSgnICsgKHN0YXRlLmJlc3RCdWcuYWdlIC8gMjApLnRvU3RyaW5nKCkgKyAnLCAxMDAlLCAzMCUsIDAuMyknO1xuICAgIGNvbnRleHQuZmlsbFJlY3Qoc3RhdGUuYmVzdEJ1Zy5kaXN0YW5jZSwgcmVuZGVySGVpZ2h0IC0gMTAgLSAoc3RhdGUuYmVzdEJ1Zy5oZWlnaHQgKiAxMCksIDEwLCAxMCk7XG5cbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICdoc2woJyArIChjdXJyZW50QmVzdEJ1Zy5hZ2UgLyAyMCkudG9TdHJpbmcoKSArICcsIDEwMCUsIDMwJSknO1xuICAgIGNvbnRleHQuZmlsbFJlY3QoY3VycmVudEJlc3RCdWcuZGlzdGFuY2UsIHJlbmRlckhlaWdodCAtIDEwIC0gKGN1cnJlbnRCZXN0QnVnLmhlaWdodCAqIDEwKSwgMTAsIDEwKTtcblxuICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG59OyIsInZhciBuZXVyYWwgPSByZXF1aXJlKCcuL25ldXJhbCcpO1xudmFyIHNpbVNldHRpbmdzID0geyByZWFsdGltZTogZmFsc2UgfTtcbnZhciBpbnB1dCA9IHJlcXVpcmUoJy4vaW5wdXQnKShzaW1TZXR0aW5ncyk7XG5cbnZhciBwcmV2aW91c05ldXJvblNldHRpbmdzID0gW107XG5cbnZhciBpbnB1dHMgPSB7XG4gICAgYWdlOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5hZ2U7XG4gICAgfSxcbiAgICBoZWlnaHQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmhlaWdodDtcbiAgICB9LFxuICAgIGVuZXJneTogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZW5lcmd5O1xuICAgIH1cbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZUV5ZUlucHV0KGluZGV4KXtcbiAgICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZG90UG9zaXRpb25zW2luZGV4XSA/IDEgOiAwO1xuICAgIH07XG59XG5cbmZvcih2YXIgaSA9IDA7IGkgPCAyMDsgaSsrKXtcbiAgICBpbnB1dHNbJ25leHQnICsgaV0gPSBjcmVhdGVFeWVJbnB1dChpKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ29ubmVjdGlvbnMobWF4Q29ubmVjdGlvbnMsIG1heEluZGV4KXtcbiAgICB2YXIgcmVzdWx0ID0gW107XG5cbiAgICB2YXIgY29ubmVjdGlvbnMgPSBNYXRoLm1heChwYXJzZUludCgoTWF0aC5yYW5kb20oKSAqIG1heENvbm5lY3Rpb25zKSAlIG1heENvbm5lY3Rpb25zKSwgMSk7XG5cbiAgICB3aGlsZShjb25uZWN0aW9ucy0tKXtcbiAgICAgICAgcmVzdWx0LnB1c2gocGFyc2VJbnQoTWF0aC5yYW5kb20oKSAqIG1heEluZGV4KSAlIG1heEluZGV4KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG52YXIgbWV0aG9kcyA9IG5ldXJhbC5tZXRob2RzO1xuXG5mdW5jdGlvbiByYW5kb21OZXVyb25zKCl7XG4gICAgdmFyIG5ldXJvbnMgPSBbXTtcbiAgICBmb3IodmFyIGogPSAwOyBqIDwgMjA7IGorKyl7XG4gICAgICAgIHZhciBtZXRob2RJbmRleCA9IHBhcnNlSW50KE1hdGgucmFuZG9tKCkgKiBtZXRob2RzLmxlbmd0aCkgJSBtZXRob2RzLmxlbmd0aDtcbiAgICAgICAgbmV1cm9ucy5wdXNoKHtcbiAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kc1ttZXRob2RJbmRleF0sXG4gICAgICAgICAgICBtb2RpZmllcjogTWF0aC5yYW5kb20oKSxcbiAgICAgICAgICAgIGlucHV0SW5kaWNpZXM6IGNyZWF0ZUNvbm5lY3Rpb25zKDUsIGogKyBPYmplY3Qua2V5cyhpbnB1dHMpLmxlbmd0aClcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldXJvbnM7XG59XG5cbmZvcih2YXIgaSA9IDA7IGkgPCAyMDsgaSsrKXtcbiAgICBwcmV2aW91c05ldXJvblNldHRpbmdzLnB1c2gocmFuZG9tTmV1cm9ucygpKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQnVnKHByZXZpb3VzTmV1cm9uU2V0dGluZ3Mpe1xuICAgIHZhciBidWcgPSBuZXVyYWwoe1xuICAgICAgICBtdXRhdGlvbjogMC4wMDA1LFxuICAgICAgICBpbnB1dHM6IGlucHV0cyxcbiAgICAgICAgb3V0cHV0czoge1xuICAgICAgICAgICAgdGhydXN0OiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHByZXZpb3VzTmV1cm9uU2V0dGluZ3M6IHByZXZpb3VzTmV1cm9uU2V0dGluZ3NcbiAgICB9KTtcblxuICAgIGJ1Zy5hZ2UgPSAwO1xuICAgIGJ1Zy5lbmVyZ3kgPSAxO1xuICAgIGJ1Zy5oZWlnaHQgPSAwO1xuICAgIGJ1Zy50aHJ1c3QgPSAwO1xuICAgIGJ1Zy5kaXN0YW5jZSA9IDA7XG4gICAgYnVnLmRpc3RGcm9tRG90ID0gLTE7XG5cbiAgICByZXR1cm4gYnVnO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDaGlsZChidWcpe1xuICAgIHJldHVybiBjcmVhdGVCdWcoYnVnLm5ldXJvbnMubWFwKGZ1bmN0aW9uKG5ldXJvbil7XG4gICAgICAgIHJldHVybiBuZXVyb24uc2V0dGluZ3M7XG4gICAgfSkpO1xufVxuXG52YXIgbWFwID0gW107XG5cbmZvcih2YXIgaSA9IDA7IGkgPCAxMjA7IGkrKyl7XG4gICAgbWFwLnB1c2goZmFsc2UpO1xufVxuXG52YXIgYnVncyA9IFtdO1xuXG52YXIgcmVuZGVyZXIgPSByZXF1aXJlKCcuL3JlbmRlcicpO1xuXG52YXIgdGlja3MgPSAwO1xudmFyIGlubmVyUnVucyA9IDE7XG52YXIgYmVzdEJ1ZztcbmZ1bmN0aW9uIGdhbWVMb29wKCl7XG4gICAgdGlja3MrKztcbiAgICBpZihidWdzLmxlbmd0aCA8IDIwKXtcbiAgICAgICAgYmVzdEJ1ZyA/XG4gICAgICAgICAgICBidWdzLnB1c2goTWF0aC5yYW5kb20oKSA+IDAuNSA/IGNyZWF0ZUNoaWxkKGJlc3RCdWcpIDogY3JlYXRlQnVnKHJhbmRvbU5ldXJvbnMoKSkpIDpcbiAgICAgICAgICAgIGJ1Z3MucHVzaChjcmVhdGVCdWcocmFuZG9tTmV1cm9ucygpKSk7XG4gICAgfVxuXG4gICAgbWFwLnNoaWZ0KCk7XG4gICAgbWFwLnB1c2gobWFwLnNsaWNlKC0xMCkuc29tZSh4ID0+IHgpID8gZmFsc2UgOiBNYXRoLnJhbmRvbSgpIDwgYnVncy5sZW5ndGggLyAyMDAwKTtcblxuICAgIGJ1Z3MgPSBidWdzLnJlZHVjZShmdW5jdGlvbihzdXJ2aXZvcnMsIGJ1Zyl7XG4gICAgICAgIGJ1Zy5hZ2UrKztcbiAgICAgICAgYnVnLmRpc3RhbmNlKys7XG5cbiAgICAgICAgaWYoIWJlc3RCdWcgfHwgYnVnLmFnZSA+IGJlc3RCdWcuYWdlKXtcbiAgICAgICAgICAgIHNpbVNldHRpbmdzLnJlYWx0aW1lID0gdHJ1ZTtcbiAgICAgICAgICAgIGJlc3RCdWcgPSBidWc7XG4gICAgICAgIH1cblxuICAgICAgICBpZihidWcuZGlzdGFuY2UgPiA5OTkpe1xuICAgICAgICAgICAgYnVnLmRpc3RhbmNlID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGJ1Zy5kaXN0YW5jZSAmJiAhKGJ1Zy5kaXN0YW5jZSAlIDExMSkgJiYgYnVnLmFnZSA+IDMwMCl7XG4gICAgICAgICAgICBzdXJ2aXZvcnMucHVzaChjcmVhdGVDaGlsZChidWcpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vb24gZG90LCBkaWVcbiAgICAgICAgaWYoYnVnLmRpc3RhbmNlID4gMTAwICYmIGJ1Zy5oZWlnaHQgPCAxICYmIGJ1Zy5vbkRvdCl7XG4gICAgICAgICAgICBpZihidWcgPT09IGJlc3RCdWcpe1xuICAgICAgICAgICAgICAgIHNpbVNldHRpbmdzLnJlYWx0aW1lID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3Vydml2b3JzO1xuICAgICAgICB9XG5cbiAgICAgICAgc3Vydml2b3JzLnB1c2goYnVnKTtcblxuICAgICAgICAvL2ZhbGxcbiAgICAgICAgYnVnLmhlaWdodCArPSBidWcudGhydXN0O1xuICAgICAgICBidWcuaGVpZ2h0ID0gTWF0aC5tYXgoMCwgYnVnLmhlaWdodCAtPSAwLjUpO1xuICAgICAgICB2YXIgbWFwUG9zaXRpb24gPSBwYXJzZUludChidWcuZGlzdGFuY2UgLyAxMCk7XG4gICAgICAgIGJ1Zy5kb3RQb3NpdGlvbnMgPSBtYXAuc2xpY2UobWFwUG9zaXRpb24sIG1hcFBvc2l0aW9uICsgMjApO1xuICAgICAgICBidWcub25Eb3QgPSBidWcuZG90UG9zaXRpb25zWzBdO1xuXG4gICAgICAgIGlmKCFidWcuaGVpZ2h0ICYmIGJ1Zy5lbmVyZ3kgPiAwLjIpe1xuICAgICAgICAgICAgdmFyIHRocnVzdCA9IGJ1Zy5vdXRwdXRzLnRocnVzdCgpO1xuICAgICAgICAgICAgYnVnLnRocnVzdCArPSB0aHJ1c3QgKiBidWcuZW5lcmd5ICogMS41O1xuICAgICAgICAgICAgYnVnLmVuZXJneSA9IE1hdGgubWF4KDAsIGJ1Zy5lbmVyZ3kgLSBidWcudGhydXN0KTtcbiAgICAgICAgfVxuICAgICAgICBidWcuZW5lcmd5ID0gTWF0aC5taW4oMSwgYnVnLmVuZXJneSArIDAuMDQ3KTtcbiAgICAgICAgaWYoYnVnLnRocnVzdCA+IDApe1xuICAgICAgICAgICAgYnVnLnRocnVzdCAtPSAwLjE7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3Vydml2b3JzO1xuICAgIH0sIFtdKTtcblxuICAgIGlmKCFzaW1TZXR0aW5ncy5yZWFsdGltZSl7XG4gICAgICAgIGlmKGlubmVyUnVucy0tKXtcbiAgICAgICAgICAgIGdhbWVMb29wKCk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgaW5uZXJSdW5zID0gMTAwMDtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZ2FtZUxvb3AsIDApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzZXRUaW1lb3V0KGdhbWVMb29wLCAzMCk7XG5cbn1cblxuZnVuY3Rpb24gcmVuZGVyKCl7XG4gICAgcmVuZGVyZXIoeyB0aWNrcywgYnVncywgbWFwLCBiZXN0QnVnIH0pO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xufVxuXG5nYW1lTG9vcCgpO1xuXG5yZW5kZXIoKTtcblxuIl19
