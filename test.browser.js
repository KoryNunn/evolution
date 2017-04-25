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
            return survivors;
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

        return survivors;
    }, []);

    if(looping){
        return;
    }

    if(!simSettings.realtime){
        looping = true;
        var start = Date.now();
        while(Date.now() - start < 50){
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
    renderer({ ticks, bugs, map, bestBug });
    requestAnimationFrame(render);
}

gameLoop();

render();


},{"./input":1,"./neural":2,"./render":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbnB1dC5qcyIsIm5ldXJhbC5qcyIsInJlbmRlci5qcyIsInRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzaW1TZXR0aW5ncyl7XG4gICAgdmFyIG1lbnUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB2YXIgdG9nZ2xlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgbWVudS5hcHBlbmRDaGlsZCh0b2dnbGUpO1xuXG4gICAgdG9nZ2xlLnRleHRDb250ZW50ID0gJ1JlYWx0aW1lJztcblxuICAgIHRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHNpbVNldHRpbmdzLnJlYWx0aW1lID0gIXNpbVNldHRpbmdzLnJlYWx0aW1lO1xuICAgIH0pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbigpe1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1lbnUpO1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gcnVuKCl7XG4gICAgICAgIHRvZ2dsZS50ZXh0Q29udGVudCA9IHNpbVNldHRpbmdzLnJlYWx0aW1lID8gJ1JlYWwgVGltZScgOiAnSHlwZXJzcGVlZCc7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShydW4pO1xuICAgIH1cblxuICAgIHJ1bigpO1xufTsiLCJ2YXIgbWV0aG9kcyA9IHtcbiAgICBtdWx0aXBseTogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBhICogYjtcbiAgICB9LFxuICAgIGRpdmlkZTogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBhIC8gYjtcbiAgICB9LFxuICAgIGFkZDogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBhICsgYjtcbiAgICB9LFxuICAgIHN1YnRyYWN0OiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIGEgLSBiO1xuICAgIH0sXG4gICAgcG93ZXI6IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gTWF0aC5wb3coYSwgYik7XG4gICAgfSxcbiAgICBtb2Q6IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gYSAlIGIgKiAxMDtcbiAgICB9LFxuICAgIGludmVydDogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBNYXRoLmFicyhhICogLWIpO1xuICAgIH1cbn07XG5cbmZ1bmN0aW9uIG1ha2VOZXVyb24obmV1cm9ucywgc2V0dGluZ3Mpe1xuICAgIHZhciBpbnB1dHMgPSBbXSxcbiAgICAgICAgaW5wdXRJbmRpY2llcyA9IHNldHRpbmdzLmlucHV0SW5kaWNpZXMuc2xpY2UoKTtcblxuICAgIHZhciBuZXVyb24gPSBmdW5jdGlvbigpe1xuICAgICAgICAvLyB2YXIgcmVzdWx0ID0gTWF0aC5wb3coaW5wdXRJbmRpY2llcy5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBpbmRleCl7XG4gICAgICAgIC8vICAgICByZXR1cm4gcmVzdWx0ICsgTWF0aC5wb3cobmV1cm9uc1tpbmRleF0oKSwgMik7XG4gICAgICAgIC8vIH0sIDApLCAwLjUpO1xuXG4gICAgICAgIHZhciByZXN1bHQgPSBpbnB1dEluZGljaWVzID8gaW5wdXRJbmRpY2llcy5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBpbmRleCl7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0ICsgbmV1cm9uc1tpbmRleF0oKTtcbiAgICAgICAgfSwgMCkgLyBpbnB1dEluZGljaWVzLmxlbmd0aCA6IDA7XG5cbiAgICAgICAgcmVzdWx0ID0gbWV0aG9kc1tzZXR0aW5ncy5tZXRob2RdKHJlc3VsdCwgc2V0dGluZ3MubW9kaWZpZXIpO1xuXG4gICAgICAgIHJlc3VsdCA9IE1hdGgubWluKDEsIHJlc3VsdCk7XG4gICAgICAgIHJlc3VsdCA9IE1hdGgubWF4KDAsIHJlc3VsdCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICAgIG5ldXJvbi5zZXR0aW5ncyA9IHNldHRpbmdzO1xuXG4gICAgcmV0dXJuIG5ldXJvbjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuZXR3b3JrU2V0dGluZ3Mpe1xuICAgIHZhciBuZXR3b3JrID0ge307XG5cbiAgICB2YXIgaW5wdXRzID0gbmV0d29ya1NldHRpbmdzLmlucHV0cyxcbiAgICAgICAgb3V0cHV0cyA9IG5ldHdvcmtTZXR0aW5ncy5vdXRwdXRzLFxuICAgICAgICBwcmV2aW91c05ldXJvblNldHRpbmdzID0gbmV0d29ya1NldHRpbmdzLnByZXZpb3VzTmV1cm9uU2V0dGluZ3MsXG4gICAgICAgIGlucHV0TmV1cm9ucyA9IE9iamVjdC5rZXlzKG5ldHdvcmtTZXR0aW5ncy5pbnB1dHMpLm1hcChmdW5jdGlvbihrZXkpe1xuICAgICAgICAgICAgcmV0dXJuIG5ldHdvcmtTZXR0aW5ncy5pbnB1dHNba2V5XS5iaW5kKG5ldHdvcmspO1xuICAgICAgICB9KSxcbiAgICAgICAgbmV1cm9ucyA9IGlucHV0TmV1cm9ucy5zbGljZSgpO1xuXG4gICAgcHJldmlvdXNOZXVyb25TZXR0aW5ncy5tYXAoZnVuY3Rpb24obmV1cm9uU2V0dGluZ3Mpe1xuICAgICAgICB2YXIgbmV3TmV1cm9uU2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiBuZXVyb25TZXR0aW5ncy5tZXRob2QsXG4gICAgICAgICAgICAgICAgaW5wdXRJbmRpY2llczogbmV1cm9uU2V0dGluZ3MuaW5wdXRJbmRpY2llcyxcbiAgICAgICAgICAgICAgICBtb2RpZmllcjogbmV1cm9uU2V0dGluZ3MubW9kaWZpZXIgKiAoMSArIChNYXRoLnJhbmRvbSgpICogKG5ldHdvcmtTZXR0aW5ncy5tdXRhdGlvbiAqIDIpIC0gbmV0d29ya1NldHRpbmdzLm11dGF0aW9uKSlcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgbmV1cm9ucy5wdXNoKG1ha2VOZXVyb24obmV1cm9ucywgbmV3TmV1cm9uU2V0dGluZ3MpKTtcbiAgICB9KTtcblxuICAgIHZhciBvdXRwdXROZXVyb25zID0gbmV1cm9ucy5zbGljZSgtIE9iamVjdC5rZXlzKG91dHB1dHMpLmxlbmd0aCk7XG5cbiAgICB2YXIgaW5wdXRNYXAgPSBPYmplY3Qua2V5cyhpbnB1dHMpLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGtleSl7XG4gICAgICAgIHJlc3VsdFtrZXldID0gaW5wdXROZXVyb25zLnBvcCgpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwge30pO1xuXG4gICAgdmFyIG91dHB1dE1hcCA9IE9iamVjdC5rZXlzKG91dHB1dHMpLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGtleSl7XG4gICAgICAgIHJlc3VsdFtrZXldID0gb3V0cHV0TmV1cm9ucy5wb3AoKTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIHt9KTtcblxuICAgIG5ldHdvcmsuaW5wdXRzID0gaW5wdXRNYXA7XG4gICAgbmV0d29yay5vdXRwdXRzID0gb3V0cHV0TWFwO1xuICAgIG5ldHdvcmsubmV1cm9ucyA9IG5ldXJvbnMuc2xpY2UoT2JqZWN0LmtleXMoaW5wdXRzKS5sZW5ndGgpO1xuXG4gICAgcmV0dXJuIG5ldHdvcms7XG59O1xubW9kdWxlLmV4cG9ydHMubWV0aG9kcyA9IE9iamVjdC5rZXlzKG1ldGhvZHMpOyIsInZhciBzdGF0cyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ByZScpLFxuICAgIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLFxuICAgIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbigpe1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2FudmFzKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN0YXRzKTtcbn0pO1xuXG52YXIgcmVuZGVySGVpZ2h0ID0gNjA7XG52YXIgcmVuZGVyV2lkdGggPSAxMTAwO1xuY2FudmFzLmhlaWdodCA9IHJlbmRlckhlaWdodDtcbmNhbnZhcy53aWR0aCA9IHJlbmRlcldpZHRoO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN0YXRlKXtcbiAgICB2YXIgY3VycmVudEJlc3RCdWcgPSBzdGF0ZS5idWdzLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGJ1Zyl7XG4gICAgICAgIHJldHVybiBidWcuYWdlID4gcmVzdWx0LmFnZSA/IGJ1ZyA6IHJlc3VsdDtcbiAgICB9LCBzdGF0ZS5idWdzWzBdKTtcblxuICAgIHN0YXRzLnRleHRDb250ZW50ID0gW1xuICAgICAgICAnVGlja3M6ICcgKyBzdGF0ZS50aWNrcyxcbiAgICAgICAgJ0J1Z3M6ICcgKyBzdGF0ZS5idWdzLmxlbmd0aCxcbiAgICAgICAgJ01heCBDdXJyZW50IEFnZTogJyArIChjdXJyZW50QmVzdEJ1ZyA/IGN1cnJlbnRCZXN0QnVnLmFnZSA6ICdOb3RoaW5nIGFsaXZlJyksXG4gICAgICAgICdNYXggQWdlOiAnICsgc3RhdGUuYmVzdEJ1Zy5hZ2UsXG4gICAgICAgICdCZXN0IEJ1Z3MgQnJhaW46ICcgKyBKU09OLnN0cmluZ2lmeShzdGF0ZS5iZXN0QnVnLm5ldXJvbnMubWFwKGZ1bmN0aW9uKG5ldXJvbil7XG4gICAgICAgICAgICByZXR1cm4gbmV1cm9uLnNldHRpbmdzO1xuICAgICAgICB9KSwgbnVsbCwgNClcbiAgICBdLmpvaW4oJ1xcbicpO1xuICAgIGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHJlbmRlcldpZHRoLCByZW5kZXJIZWlnaHQpO1xuXG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcblxuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJyMwMDAwMDAnO1xuXG4gICAgc3RhdGUubWFwLm1hcChmdW5jdGlvbihkb3QsIGluZGV4KXtcbiAgICAgICAgaWYoZG90KXtcbiAgICAgICAgICAgIGNvbnRleHQuZmlsbFJlY3QoaW5kZXggKiAxMCwgcmVuZGVySGVpZ2h0IC0gMTAsIDEwLCAxMCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJyNGRjAwMDAnO1xuXG4gICAgc3RhdGUuYnVncy5tYXAoZnVuY3Rpb24oYnVnKXtcbiAgICAgICAgY29udGV4dC5maWxsUmVjdChidWcuZGlzdGFuY2UsIHJlbmRlckhlaWdodCAtIDEwIC0gKGJ1Zy5oZWlnaHQgKiAxMCksIDEwLCAxMCk7XG4gICAgfSk7XG5cbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICdoc2xhKCcgKyAoc3RhdGUuYmVzdEJ1Zy5hZ2UgLyAyMCkudG9TdHJpbmcoKSArICcsIDEwMCUsIDMwJSwgMC4zKSc7XG4gICAgY29udGV4dC5maWxsUmVjdChzdGF0ZS5iZXN0QnVnLmRpc3RhbmNlLCByZW5kZXJIZWlnaHQgLSAxMCAtIChzdGF0ZS5iZXN0QnVnLmhlaWdodCAqIDEwKSwgMTAsIDEwKTtcblxuICAgIGlmKGN1cnJlbnRCZXN0QnVnKXtcbiAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAnaHNsKCcgKyAoY3VycmVudEJlc3RCdWcuYWdlIC8gMjApLnRvU3RyaW5nKCkgKyAnLCAxMDAlLCAzMCUpJztcbiAgICAgICAgY29udGV4dC5maWxsUmVjdChjdXJyZW50QmVzdEJ1Zy5kaXN0YW5jZSwgcmVuZGVySGVpZ2h0IC0gMTAgLSAoY3VycmVudEJlc3RCdWcuaGVpZ2h0ICogMTApLCAxMCwgMTApO1xuICAgIH1cblxuICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG59OyIsInZhciBuZXVyYWwgPSByZXF1aXJlKCcuL25ldXJhbCcpO1xudmFyIHNpbVNldHRpbmdzID0geyByZWFsdGltZTogZmFsc2UgfTtcbnZhciBpbnB1dCA9IHJlcXVpcmUoJy4vaW5wdXQnKShzaW1TZXR0aW5ncyk7XG5cbnZhciBwcmV2aW91c05ldXJvblNldHRpbmdzID0gW107XG5cbnZhciBpbnB1dHMgPSB7XG4gICAgYWdlOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5hZ2U7XG4gICAgfSxcbiAgICBoZWlnaHQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmhlaWdodDtcbiAgICB9LFxuICAgIGVuZXJneTogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZW5lcmd5O1xuICAgIH1cbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZUV5ZUlucHV0KGluZGV4KXtcbiAgICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZG90UG9zaXRpb25zW2luZGV4XSA/IDEgOiAwO1xuICAgIH07XG59XG5cbmZvcih2YXIgaSA9IDA7IGkgPCAyMDsgaSsrKXtcbiAgICBpbnB1dHNbJ25leHQnICsgaV0gPSBjcmVhdGVFeWVJbnB1dChpKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ29ubmVjdGlvbnMobWF4Q29ubmVjdGlvbnMsIG1heEluZGV4KXtcbiAgICB2YXIgcmVzdWx0ID0gW107XG5cbiAgICB2YXIgY29ubmVjdGlvbnMgPSBNYXRoLm1heChwYXJzZUludCgoTWF0aC5yYW5kb20oKSAqIG1heENvbm5lY3Rpb25zKSAlIG1heENvbm5lY3Rpb25zKSwgMSk7XG5cbiAgICB3aGlsZShjb25uZWN0aW9ucy0tKXtcbiAgICAgICAgcmVzdWx0LnB1c2gocGFyc2VJbnQoTWF0aC5yYW5kb20oKSAqIG1heEluZGV4KSAlIG1heEluZGV4KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG52YXIgbWV0aG9kcyA9IG5ldXJhbC5tZXRob2RzO1xuXG5mdW5jdGlvbiByYW5kb21OZXVyb25zKCl7XG4gICAgdmFyIG5ldXJvbnMgPSBbXTtcbiAgICBmb3IodmFyIGogPSAwOyBqIDwgMjA7IGorKyl7XG4gICAgICAgIHZhciBtZXRob2RJbmRleCA9IHBhcnNlSW50KE1hdGgucmFuZG9tKCkgKiBtZXRob2RzLmxlbmd0aCkgJSBtZXRob2RzLmxlbmd0aDtcbiAgICAgICAgbmV1cm9ucy5wdXNoKHtcbiAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kc1ttZXRob2RJbmRleF0sXG4gICAgICAgICAgICBtb2RpZmllcjogTWF0aC5yYW5kb20oKSxcbiAgICAgICAgICAgIGlucHV0SW5kaWNpZXM6IGNyZWF0ZUNvbm5lY3Rpb25zKDUsIGogKyBPYmplY3Qua2V5cyhpbnB1dHMpLmxlbmd0aClcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldXJvbnM7XG59XG5cbmZvcih2YXIgaSA9IDA7IGkgPCAyMDsgaSsrKXtcbiAgICBwcmV2aW91c05ldXJvblNldHRpbmdzLnB1c2gocmFuZG9tTmV1cm9ucygpKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQnVnKHByZXZpb3VzTmV1cm9uU2V0dGluZ3Mpe1xuICAgIHZhciBidWcgPSBuZXVyYWwoe1xuICAgICAgICBtdXRhdGlvbjogMC4wMDA1LFxuICAgICAgICBpbnB1dHM6IGlucHV0cyxcbiAgICAgICAgb3V0cHV0czoge1xuICAgICAgICAgICAgdGhydXN0WDogdHJ1ZSxcbiAgICAgICAgICAgIHRocnVzdFk6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgcHJldmlvdXNOZXVyb25TZXR0aW5nczogcHJldmlvdXNOZXVyb25TZXR0aW5nc1xuICAgIH0pO1xuXG4gICAgYnVnLmFnZSA9IDA7XG4gICAgYnVnLmVuZXJneSA9IDE7XG4gICAgYnVnLmhlaWdodCA9IDA7XG4gICAgYnVnLnRocnVzdFggPSAwO1xuICAgIGJ1Zy50aHJ1c3RZID0gMDtcbiAgICBidWcuZGlzdGFuY2UgPSAwO1xuICAgIGJ1Zy5kaXN0RnJvbURvdCA9IC0xO1xuXG4gICAgcmV0dXJuIGJ1Zztcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ2hpbGQoYnVnKXtcbiAgICByZXR1cm4gY3JlYXRlQnVnKGJ1Zy5uZXVyb25zLm1hcChmdW5jdGlvbihuZXVyb24pe1xuICAgICAgICByZXR1cm4gbmV1cm9uLnNldHRpbmdzO1xuICAgIH0pKTtcbn1cblxudmFyIG1hcCA9IFtdO1xuXG5mb3IodmFyIGkgPSAwOyBpIDwgMTIwOyBpKyspe1xuICAgIG1hcC5wdXNoKGZhbHNlKTtcbn1cblxudmFyIGJ1Z3MgPSBbXTtcblxudmFyIHJlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXInKTtcblxudmFyIHRpY2tzID0gMDtcbnZhciBsb29waW5nO1xudmFyIGJlc3RCdWc7XG5mdW5jdGlvbiBnYW1lTG9vcCgpe1xuICAgIHRpY2tzKys7XG4gICAgaWYoYnVncy5sZW5ndGggPCAyMCl7XG4gICAgICAgIGJlc3RCdWcgP1xuICAgICAgICAgICAgYnVncy5wdXNoKE1hdGgucmFuZG9tKCkgPiAwLjUgPyBjcmVhdGVDaGlsZChiZXN0QnVnKSA6IGNyZWF0ZUJ1ZyhyYW5kb21OZXVyb25zKCkpKSA6XG4gICAgICAgICAgICBidWdzLnB1c2goY3JlYXRlQnVnKHJhbmRvbU5ldXJvbnMoKSkpO1xuICAgIH1cblxuICAgIG1hcC5zaGlmdCgpO1xuICAgIG1hcC5wdXNoKG1hcC5zbGljZSgtMTApLnNvbWUoeCA9PiB4KSA/IGZhbHNlIDogTWF0aC5yYW5kb20oKSA8IGJ1Z3MubGVuZ3RoIC8gMjAwMCk7XG5cbiAgICBidWdzID0gYnVncy5yZWR1Y2UoZnVuY3Rpb24oc3Vydml2b3JzLCBidWcpe1xuICAgICAgICBidWcuYWdlKys7XG4gICAgICAgIGJ1Zy5kaXN0YW5jZSArPSBidWcudGhydXN0WCArIDE7XG5cbiAgICAgICAgaWYoIWJlc3RCdWcgfHwgYnVnLmFnZSA+IGJlc3RCdWcuYWdlKXtcbiAgICAgICAgICAgIHNpbVNldHRpbmdzLnJlYWx0aW1lID0gdHJ1ZTtcbiAgICAgICAgICAgIGJlc3RCdWcgPSBidWc7XG4gICAgICAgIH1cblxuICAgICAgICBpZihidWcuZGlzdGFuY2UgPiA5OTkpe1xuICAgICAgICAgICAgYnVnLmRpc3RhbmNlID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGJ1Zy5hZ2UgJiYgIShidWcuYWdlICUgMTExKSAmJiBidWcuYWdlID4gMzAwKXtcbiAgICAgICAgICAgIHN1cnZpdm9ycy5wdXNoKGNyZWF0ZUNoaWxkKGJ1ZykpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9vbiBkb3QsIGRpZVxuICAgICAgICBpZihidWcuZGlzdGFuY2UgPiAxMDAgJiYgYnVnLmhlaWdodCA8IDEgJiYgYnVnLm9uRG90KXtcbiAgICAgICAgICAgIGlmKGJ1ZyA9PT0gYmVzdEJ1Zyl7XG4gICAgICAgICAgICAgICAgc2ltU2V0dGluZ3MucmVhbHRpbWUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdXJ2aXZvcnM7XG4gICAgICAgIH1cblxuICAgICAgICBzdXJ2aXZvcnMucHVzaChidWcpO1xuXG4gICAgICAgIC8vZmFsbFxuICAgICAgICBidWcuaGVpZ2h0ICs9IGJ1Zy50aHJ1c3RZICogMjtcbiAgICAgICAgYnVnLmhlaWdodCA9IE1hdGgubWF4KDAsIGJ1Zy5oZWlnaHQgLT0gMC41KTtcbiAgICAgICAgdmFyIG1hcFBvc2l0aW9uID0gcGFyc2VJbnQoYnVnLmRpc3RhbmNlIC8gMTApO1xuICAgICAgICBidWcuZG90UG9zaXRpb25zID0gbWFwLnNsaWNlKG1hcFBvc2l0aW9uLCBtYXBQb3NpdGlvbiArIDIwKTtcbiAgICAgICAgYnVnLm9uRG90ID0gYnVnLmRvdFBvc2l0aW9uc1swXTtcblxuICAgICAgICBpZighYnVnLmhlaWdodCl7XG4gICAgICAgICAgICBpZihidWcuZW5lcmd5ID4gMC4yKXtcbiAgICAgICAgICAgICAgICB2YXIgdGhydXN0WSA9IGJ1Zy5vdXRwdXRzLnRocnVzdFkoKTtcbiAgICAgICAgICAgICAgICBidWcudGhydXN0WSArPSBNYXRoLm1pbih0aHJ1c3RZLCBidWcuZW5lcmd5KTtcbiAgICAgICAgICAgICAgICBidWcuZW5lcmd5ID0gTWF0aC5tYXgoMCwgYnVnLmVuZXJneSAtIGJ1Zy50aHJ1c3RZKTtcblxuICAgICAgICAgICAgICAgIHZhciB0aHJ1c3RYID0gYnVnLm91dHB1dHMudGhydXN0WCgpO1xuICAgICAgICAgICAgICAgIGJ1Zy50aHJ1c3RYICs9IE1hdGgubWluKHRocnVzdFgsIGJ1Zy5lbmVyZ3kpO1xuICAgICAgICAgICAgICAgIGJ1Zy5lbmVyZ3kgPSBNYXRoLm1heCgwLCBidWcuZW5lcmd5IC0gYnVnLnRocnVzdFgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnVnLmVuZXJneSA9IE1hdGgubWluKDEsIGJ1Zy5lbmVyZ3kgKyAwLjEpO1xuICAgICAgICB9XG4gICAgICAgIGlmKGJ1Zy50aHJ1c3RZID4gMCl7XG4gICAgICAgICAgICBidWcudGhydXN0WSAtPSAwLjE7XG4gICAgICAgIH1cbiAgICAgICAgaWYoYnVnLnRocnVzdFggPiAwLjEgfHwgYnVnLnRocnVzdFggPCAtMC4xKXtcbiAgICAgICAgICAgIGJ1Zy50aHJ1c3RYICo9IDAuOTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdXJ2aXZvcnM7XG4gICAgfSwgW10pO1xuXG4gICAgaWYobG9vcGluZyl7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZighc2ltU2V0dGluZ3MucmVhbHRpbWUpe1xuICAgICAgICBsb29waW5nID0gdHJ1ZTtcbiAgICAgICAgdmFyIHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgd2hpbGUoRGF0ZS5ub3coKSAtIHN0YXJ0IDwgNTApe1xuICAgICAgICAgICAgZ2FtZUxvb3AoKTtcbiAgICAgICAgICAgIGlmKHNpbVNldHRpbmdzLnJlYWx0aW1lKXtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsb29waW5nID0gZmFsc2U7XG4gICAgICAgIHNldFRpbWVvdXQoZ2FtZUxvb3AsIDApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2V0VGltZW91dChnYW1lTG9vcCwgMzApO1xuXG59XG5cbmZ1bmN0aW9uIHJlbmRlcigpe1xuICAgIHJlbmRlcmVyKHsgdGlja3MsIGJ1Z3MsIG1hcCwgYmVzdEJ1ZyB9KTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcbn1cblxuZ2FtZUxvb3AoKTtcblxucmVuZGVyKCk7XG5cbiJdfQ==
