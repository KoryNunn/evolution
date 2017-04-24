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
    stats.textContent = [
        'Ticks: ' + state.ticks,
        'Bugs: ' + state.bugs.length,
        'Max Current Age: ' + state.bugs.reduce(function(result, bug){
            return Math.max(bug.age, result);
        }, 0),
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

    context.fillStyle = 'hsl(' + (state.bestBug.age / 20).toString() + ', 100%, 30%)';
    context.fillRect(state.bestBug.distance, renderHeight - 10 - (state.bestBug.height * 10), 10, 10);

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

    map.push(Math.random() < bugs.length / 2000);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4zLjEvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiaW5wdXQuanMiLCJuZXVyYWwuanMiLCJyZW5kZXIuanMiLCJ0ZXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2ltU2V0dGluZ3Mpe1xuICAgIHZhciB0b2dnbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcblxuICAgIHRvZ2dsZS50ZXh0Q29udGVudCA9ICdSZWFsdGltZSc7XG5cbiAgICB0b2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICBzaW1TZXR0aW5ncy5yZWFsdGltZSA9ICFzaW1TZXR0aW5ncy5yZWFsdGltZTtcbiAgICB9KTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oKXtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0b2dnbGUpO1xuICAgIH0pO1xufTsiLCJ2YXIgbWV0aG9kcyA9IHtcbiAgICBtdWx0aXBseTogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBhICogYjtcbiAgICB9LFxuICAgIGRpdmlkZTogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBhIC8gYjtcbiAgICB9LFxuICAgIGFkZDogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBhICsgYjtcbiAgICB9LFxuICAgIHBvd2VyOiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIE1hdGgucG93KGEsIGIpO1xuICAgIH0sXG4gICAgbW9kOiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIGEgJSBiICogMTA7XG4gICAgfSxcbiAgICBpbnZlcnQ6IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gTWF0aC5hYnMoYSAqIC1iKTtcbiAgICB9XG59O1xuXG5mdW5jdGlvbiBtYWtlTmV1cm9uKG5ldXJvbnMsIHNldHRpbmdzKXtcbiAgICB2YXIgaW5wdXRzID0gW10sXG4gICAgICAgIGlucHV0SW5kaWNpZXMgPSBzZXR0aW5ncy5pbnB1dEluZGljaWVzLnNsaWNlKCk7XG5cbiAgICB2YXIgbmV1cm9uID0gZnVuY3Rpb24oKXtcbiAgICAgICAgLy8gdmFyIHJlc3VsdCA9IE1hdGgucG93KGlucHV0SW5kaWNpZXMucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwgaW5kZXgpe1xuICAgICAgICAvLyAgICAgcmV0dXJuIHJlc3VsdCArIE1hdGgucG93KG5ldXJvbnNbaW5kZXhdKCksIDIpO1xuICAgICAgICAvLyB9LCAwKSwgMC41KTtcblxuICAgICAgICB2YXIgcmVzdWx0ID0gaW5wdXRJbmRpY2llcyA/IGlucHV0SW5kaWNpZXMucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwgaW5kZXgpe1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdCArIG5ldXJvbnNbaW5kZXhdKCk7XG4gICAgICAgIH0sIDApIC8gaW5wdXRJbmRpY2llcy5sZW5ndGggOiAwO1xuXG4gICAgICAgIHJlc3VsdCA9IG1ldGhvZHNbc2V0dGluZ3MubWV0aG9kXShyZXN1bHQsIHNldHRpbmdzLm1vZGlmaWVyKTtcblxuICAgICAgICByZXN1bHQgPSBNYXRoLm1pbigxLCByZXN1bHQpO1xuICAgICAgICByZXN1bHQgPSBNYXRoLm1heCgwLCByZXN1bHQpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICBuZXVyb24uc2V0dGluZ3MgPSBzZXR0aW5ncztcblxuICAgIHJldHVybiBuZXVyb247XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmV0d29ya1NldHRpbmdzKXtcbiAgICB2YXIgbmV0d29yayA9IHt9O1xuXG4gICAgdmFyIGlucHV0cyA9IG5ldHdvcmtTZXR0aW5ncy5pbnB1dHMsXG4gICAgICAgIG91dHB1dHMgPSBuZXR3b3JrU2V0dGluZ3Mub3V0cHV0cyxcbiAgICAgICAgcHJldmlvdXNOZXVyb25TZXR0aW5ncyA9IG5ldHdvcmtTZXR0aW5ncy5wcmV2aW91c05ldXJvblNldHRpbmdzLFxuICAgICAgICBpbnB1dE5ldXJvbnMgPSBPYmplY3Qua2V5cyhuZXR3b3JrU2V0dGluZ3MuaW5wdXRzKS5tYXAoZnVuY3Rpb24oa2V5KXtcbiAgICAgICAgICAgIHJldHVybiBuZXR3b3JrU2V0dGluZ3MuaW5wdXRzW2tleV0uYmluZChuZXR3b3JrKTtcbiAgICAgICAgfSksXG4gICAgICAgIG5ldXJvbnMgPSBpbnB1dE5ldXJvbnMuc2xpY2UoKTtcblxuICAgIHByZXZpb3VzTmV1cm9uU2V0dGluZ3MubWFwKGZ1bmN0aW9uKG5ldXJvblNldHRpbmdzKXtcbiAgICAgICAgdmFyIG5ld05ldXJvblNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogbmV1cm9uU2V0dGluZ3MubWV0aG9kLFxuICAgICAgICAgICAgICAgIGlucHV0SW5kaWNpZXM6IG5ldXJvblNldHRpbmdzLmlucHV0SW5kaWNpZXMsXG4gICAgICAgICAgICAgICAgbW9kaWZpZXI6IG5ldXJvblNldHRpbmdzLm1vZGlmaWVyICogKDEgKyAoTWF0aC5yYW5kb20oKSAqIChuZXR3b3JrU2V0dGluZ3MubXV0YXRpb24gKiAyKSAtIG5ldHdvcmtTZXR0aW5ncy5tdXRhdGlvbikpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIG5ldXJvbnMucHVzaChtYWtlTmV1cm9uKG5ldXJvbnMsIG5ld05ldXJvblNldHRpbmdzKSk7XG4gICAgfSk7XG5cbiAgICB2YXIgb3V0cHV0TmV1cm9ucyA9IG5ldXJvbnMuc2xpY2UoLSBPYmplY3Qua2V5cyhvdXRwdXRzKS5sZW5ndGgpO1xuXG4gICAgdmFyIGlucHV0TWFwID0gT2JqZWN0LmtleXMoaW5wdXRzKS5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBrZXkpe1xuICAgICAgICByZXN1bHRba2V5XSA9IGlucHV0TmV1cm9ucy5wb3AoKTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIHt9KTtcblxuICAgIHZhciBvdXRwdXRNYXAgPSBPYmplY3Qua2V5cyhvdXRwdXRzKS5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBrZXkpe1xuICAgICAgICByZXN1bHRba2V5XSA9IG91dHB1dE5ldXJvbnMucG9wKCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCB7fSk7XG5cbiAgICBuZXR3b3JrLmlucHV0cyA9IGlucHV0TWFwO1xuICAgIG5ldHdvcmsub3V0cHV0cyA9IG91dHB1dE1hcDtcbiAgICBuZXR3b3JrLm5ldXJvbnMgPSBuZXVyb25zLnNsaWNlKE9iamVjdC5rZXlzKGlucHV0cykubGVuZ3RoKTtcblxuICAgIHJldHVybiBuZXR3b3JrO1xufTtcbm1vZHVsZS5leHBvcnRzLm1ldGhvZHMgPSBPYmplY3Qua2V5cyhtZXRob2RzKTsiLCJ2YXIgc3RhdHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcmUnKSxcbiAgICBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSxcbiAgICBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oKXtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNhbnZhcyk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzdGF0cyk7XG59KTtcblxudmFyIHJlbmRlckhlaWdodCA9IDYwO1xudmFyIHJlbmRlcldpZHRoID0gMTEwMDtcbmNhbnZhcy5oZWlnaHQgPSByZW5kZXJIZWlnaHQ7XG5jYW52YXMud2lkdGggPSByZW5kZXJXaWR0aDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdGF0ZSl7XG4gICAgc3RhdHMudGV4dENvbnRlbnQgPSBbXG4gICAgICAgICdUaWNrczogJyArIHN0YXRlLnRpY2tzLFxuICAgICAgICAnQnVnczogJyArIHN0YXRlLmJ1Z3MubGVuZ3RoLFxuICAgICAgICAnTWF4IEN1cnJlbnQgQWdlOiAnICsgc3RhdGUuYnVncy5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBidWcpe1xuICAgICAgICAgICAgcmV0dXJuIE1hdGgubWF4KGJ1Zy5hZ2UsIHJlc3VsdCk7XG4gICAgICAgIH0sIDApLFxuICAgICAgICAnTWF4IEFnZTogJyArIHN0YXRlLmJlc3RCdWcuYWdlLFxuICAgICAgICAnQmVzdCBCdWdzIEJyYWluOiAnICsgSlNPTi5zdHJpbmdpZnkoc3RhdGUuYmVzdEJ1Zy5uZXVyb25zLm1hcChmdW5jdGlvbihuZXVyb24pe1xuICAgICAgICAgICAgcmV0dXJuIG5ldXJvbi5zZXR0aW5ncztcbiAgICAgICAgfSksIG51bGwsIDQpXG4gICAgXS5qb2luKCdcXG4nKTtcbiAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCByZW5kZXJXaWR0aCwgcmVuZGVySGVpZ2h0KTtcblxuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG5cbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICcjMDAwMDAwJztcblxuICAgIHN0YXRlLm1hcC5tYXAoZnVuY3Rpb24oZG90LCBpbmRleCl7XG4gICAgICAgIGlmKGRvdCl7XG4gICAgICAgICAgICBjb250ZXh0LmZpbGxSZWN0KGluZGV4ICogMTAsIHJlbmRlckhlaWdodCAtIDEwLCAxMCwgMTApO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICcjRkYwMDAwJztcblxuICAgIHN0YXRlLmJ1Z3MubWFwKGZ1bmN0aW9uKGJ1Zyl7XG4gICAgICAgIGNvbnRleHQuZmlsbFJlY3QoYnVnLmRpc3RhbmNlLCByZW5kZXJIZWlnaHQgLSAxMCAtIChidWcuaGVpZ2h0ICogMTApLCAxMCwgMTApO1xuICAgIH0pO1xuXG4gICAgY29udGV4dC5maWxsU3R5bGUgPSAnaHNsKCcgKyAoc3RhdGUuYmVzdEJ1Zy5hZ2UgLyAyMCkudG9TdHJpbmcoKSArICcsIDEwMCUsIDMwJSknO1xuICAgIGNvbnRleHQuZmlsbFJlY3Qoc3RhdGUuYmVzdEJ1Zy5kaXN0YW5jZSwgcmVuZGVySGVpZ2h0IC0gMTAgLSAoc3RhdGUuYmVzdEJ1Zy5oZWlnaHQgKiAxMCksIDEwLCAxMCk7XG5cbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xufTsiLCJ2YXIgbmV1cmFsID0gcmVxdWlyZSgnLi9uZXVyYWwnKTtcbnZhciBzaW1TZXR0aW5ncyA9IHsgcmVhbHRpbWU6IGZhbHNlIH07XG52YXIgaW5wdXQgPSByZXF1aXJlKCcuL2lucHV0Jykoc2ltU2V0dGluZ3MpO1xuXG52YXIgcHJldmlvdXNOZXVyb25TZXR0aW5ncyA9IFtdO1xuXG52YXIgaW5wdXRzID0ge1xuICAgIGFnZTogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWdlO1xuICAgIH0sXG4gICAgaGVpZ2h0OiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5oZWlnaHQ7XG4gICAgfSxcbiAgICBlbmVyZ3k6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmVuZXJneTtcbiAgICB9XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVFeWVJbnB1dChpbmRleCl7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmRvdFBvc2l0aW9uc1tpbmRleF0gPyAxIDogMDtcbiAgICB9O1xufVxuXG5mb3IodmFyIGkgPSAwOyBpIDwgMjA7IGkrKyl7XG4gICAgaW5wdXRzWyduZXh0JyArIGldID0gY3JlYXRlRXllSW5wdXQoaSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3Rpb25zKG1heENvbm5lY3Rpb25zLCBtYXhJbmRleCl7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuXG4gICAgdmFyIGNvbm5lY3Rpb25zID0gTWF0aC5tYXgocGFyc2VJbnQoKE1hdGgucmFuZG9tKCkgKiBtYXhDb25uZWN0aW9ucykgJSBtYXhDb25uZWN0aW9ucyksIDEpO1xuXG4gICAgd2hpbGUoY29ubmVjdGlvbnMtLSl7XG4gICAgICAgIHJlc3VsdC5wdXNoKHBhcnNlSW50KE1hdGgucmFuZG9tKCkgKiBtYXhJbmRleCkgJSBtYXhJbmRleCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxudmFyIG1ldGhvZHMgPSBuZXVyYWwubWV0aG9kcztcblxuZnVuY3Rpb24gcmFuZG9tTmV1cm9ucygpe1xuICAgIHZhciBuZXVyb25zID0gW107XG4gICAgZm9yKHZhciBqID0gMDsgaiA8IDIwOyBqKyspe1xuICAgICAgICB2YXIgbWV0aG9kSW5kZXggPSBwYXJzZUludChNYXRoLnJhbmRvbSgpICogbWV0aG9kcy5sZW5ndGgpICUgbWV0aG9kcy5sZW5ndGg7XG4gICAgICAgIG5ldXJvbnMucHVzaCh7XG4gICAgICAgICAgICBtZXRob2Q6IG1ldGhvZHNbbWV0aG9kSW5kZXhdLFxuICAgICAgICAgICAgbW9kaWZpZXI6IE1hdGgucmFuZG9tKCksXG4gICAgICAgICAgICBpbnB1dEluZGljaWVzOiBjcmVhdGVDb25uZWN0aW9ucyg1LCBqICsgT2JqZWN0LmtleXMoaW5wdXRzKS5sZW5ndGgpXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBuZXVyb25zO1xufVxuXG5mb3IodmFyIGkgPSAwOyBpIDwgMjA7IGkrKyl7XG4gICAgcHJldmlvdXNOZXVyb25TZXR0aW5ncy5wdXNoKHJhbmRvbU5ldXJvbnMoKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJ1ZyhwcmV2aW91c05ldXJvblNldHRpbmdzKXtcbiAgICB2YXIgYnVnID0gbmV1cmFsKHtcbiAgICAgICAgbXV0YXRpb246IDAuMDAwNSxcbiAgICAgICAgaW5wdXRzOiBpbnB1dHMsXG4gICAgICAgIG91dHB1dHM6IHtcbiAgICAgICAgICAgIHRocnVzdDogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBwcmV2aW91c05ldXJvblNldHRpbmdzOiBwcmV2aW91c05ldXJvblNldHRpbmdzXG4gICAgfSk7XG5cbiAgICBidWcuYWdlID0gMDtcbiAgICBidWcuZW5lcmd5ID0gMTtcbiAgICBidWcuaGVpZ2h0ID0gMDtcbiAgICBidWcudGhydXN0ID0gMDtcbiAgICBidWcuZGlzdGFuY2UgPSAwO1xuICAgIGJ1Zy5kaXN0RnJvbURvdCA9IC0xO1xuXG4gICAgcmV0dXJuIGJ1Zztcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ2hpbGQoYnVnKXtcbiAgICByZXR1cm4gY3JlYXRlQnVnKGJ1Zy5uZXVyb25zLm1hcChmdW5jdGlvbihuZXVyb24pe1xuICAgICAgICByZXR1cm4gbmV1cm9uLnNldHRpbmdzO1xuICAgIH0pKTtcbn1cblxudmFyIG1hcCA9IFtdO1xuXG5mb3IodmFyIGkgPSAwOyBpIDwgMTIwOyBpKyspe1xuICAgIG1hcC5wdXNoKGZhbHNlKTtcbn1cblxudmFyIGJ1Z3MgPSBbXTtcblxudmFyIHJlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXInKTtcblxudmFyIHRpY2tzID0gMDtcbnZhciBpbm5lclJ1bnMgPSAxO1xudmFyIGJlc3RCdWc7XG5mdW5jdGlvbiBnYW1lTG9vcCgpe1xuICAgIHRpY2tzKys7XG4gICAgaWYoYnVncy5sZW5ndGggPCAyMCl7XG4gICAgICAgIGJlc3RCdWcgP1xuICAgICAgICAgICAgYnVncy5wdXNoKE1hdGgucmFuZG9tKCkgPiAwLjUgPyBjcmVhdGVDaGlsZChiZXN0QnVnKSA6IGNyZWF0ZUJ1ZyhyYW5kb21OZXVyb25zKCkpKSA6XG4gICAgICAgICAgICBidWdzLnB1c2goY3JlYXRlQnVnKHJhbmRvbU5ldXJvbnMoKSkpO1xuICAgIH1cblxuICAgIG1hcC5zaGlmdCgpO1xuXG4gICAgbWFwLnB1c2goTWF0aC5yYW5kb20oKSA8IGJ1Z3MubGVuZ3RoIC8gMjAwMCk7XG5cbiAgICBidWdzID0gYnVncy5yZWR1Y2UoZnVuY3Rpb24oc3Vydml2b3JzLCBidWcpe1xuICAgICAgICBidWcuYWdlKys7XG4gICAgICAgIGJ1Zy5kaXN0YW5jZSsrO1xuXG4gICAgICAgIGlmKCFiZXN0QnVnIHx8IGJ1Zy5hZ2UgPiBiZXN0QnVnLmFnZSl7XG4gICAgICAgICAgICBzaW1TZXR0aW5ncy5yZWFsdGltZSA9IHRydWU7XG4gICAgICAgICAgICBiZXN0QnVnID0gYnVnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoYnVnLmRpc3RhbmNlID4gOTk5KXtcbiAgICAgICAgICAgIGJ1Zy5kaXN0YW5jZSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBpZihidWcuZGlzdGFuY2UgJiYgIShidWcuZGlzdGFuY2UgJSAxMTEpICYmIGJ1Zy5hZ2UgPiAzMDApe1xuICAgICAgICAgICAgc3Vydml2b3JzLnB1c2goY3JlYXRlQ2hpbGQoYnVnKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL29uIGRvdCwgZGllXG4gICAgICAgIGlmKGJ1Zy5kaXN0YW5jZSA+IDEwMCAmJiBidWcuaGVpZ2h0IDwgMSAmJiBidWcub25Eb3Qpe1xuICAgICAgICAgICAgaWYoYnVnID09PSBiZXN0QnVnKXtcbiAgICAgICAgICAgICAgICBzaW1TZXR0aW5ncy5yZWFsdGltZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN1cnZpdm9ycztcbiAgICAgICAgfVxuXG4gICAgICAgIHN1cnZpdm9ycy5wdXNoKGJ1Zyk7XG5cbiAgICAgICAgLy9mYWxsXG4gICAgICAgIGJ1Zy5oZWlnaHQgKz0gYnVnLnRocnVzdDtcbiAgICAgICAgYnVnLmhlaWdodCA9IE1hdGgubWF4KDAsIGJ1Zy5oZWlnaHQgLT0gMC41KTtcbiAgICAgICAgdmFyIG1hcFBvc2l0aW9uID0gcGFyc2VJbnQoYnVnLmRpc3RhbmNlIC8gMTApO1xuICAgICAgICBidWcuZG90UG9zaXRpb25zID0gbWFwLnNsaWNlKG1hcFBvc2l0aW9uLCBtYXBQb3NpdGlvbiArIDIwKTtcbiAgICAgICAgYnVnLm9uRG90ID0gYnVnLmRvdFBvc2l0aW9uc1swXTtcblxuICAgICAgICBpZighYnVnLmhlaWdodCAmJiBidWcuZW5lcmd5ID4gMC4yKXtcbiAgICAgICAgICAgIHZhciB0aHJ1c3QgPSBidWcub3V0cHV0cy50aHJ1c3QoKTtcbiAgICAgICAgICAgIGJ1Zy50aHJ1c3QgKz0gdGhydXN0ICogYnVnLmVuZXJneSAqIDEuNTtcbiAgICAgICAgICAgIGJ1Zy5lbmVyZ3kgPSBNYXRoLm1heCgwLCBidWcuZW5lcmd5IC0gYnVnLnRocnVzdCk7XG4gICAgICAgIH1cbiAgICAgICAgYnVnLmVuZXJneSA9IE1hdGgubWluKDEsIGJ1Zy5lbmVyZ3kgKyAwLjA0Nyk7XG4gICAgICAgIGlmKGJ1Zy50aHJ1c3QgPiAwKXtcbiAgICAgICAgICAgIGJ1Zy50aHJ1c3QgLT0gMC4xO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHN1cnZpdm9ycztcbiAgICB9LCBbXSk7XG5cbiAgICBpZighc2ltU2V0dGluZ3MucmVhbHRpbWUpe1xuICAgICAgICBpZihpbm5lclJ1bnMtLSl7XG4gICAgICAgICAgICBnYW1lTG9vcCgpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGlubmVyUnVucyA9IDEwMDA7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGdhbWVMb29wLCAwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2V0VGltZW91dChnYW1lTG9vcCwgMzApO1xuXG59XG5cbmZ1bmN0aW9uIHJlbmRlcigpe1xuICAgIHJlbmRlcmVyKHsgdGlja3MsIGJ1Z3MsIG1hcCwgYmVzdEJ1ZyB9KTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcbn1cblxuZ2FtZUxvb3AoKTtcblxucmVuZGVyKCk7XG5cbiJdfQ==
