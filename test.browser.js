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
    add: function(a, b){
        return a + b;
    },
    power: function(a, b){
        return Math.pow(a, b);
    },
    mod: function(a, b){
        return a % b * 10;
    }
};

function makeNeuron(neurons, settings){
    var inputs = [],
        inputIndicies = settings.inputIndicies.slice();

    var neuron = function(){
        var result = inputIndicies.reduce(function(result, index){
            return result + Math.pow(neurons[index](), 2);
        }, 0);

        result = Math.pow(result, 1/2);

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
}
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
        'Max Age: ' + state.bestBug.age,
        'neurons: ' + JSON.stringify(state.bestBug.neurons.map(function(neuron){
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

    context.closePath();
};
},{}],4:[function(require,module,exports){
var neural = require('./neural');
var simSettings = { realtime: false };
var input = require('./input')(simSettings);

var previousNeuronSettings = [];

var inputs = {
    distFromFirstDot: function(){
        return this.dotDists[0] == null ? -1 : this.dotDists[0];
    },
    distFromSecondDot: function(){
        return this.dotDists[1] == null ? -1 : this.dotDists[1];
    },
    height: function(){
        return this.height;
    },
    energy: function(){
        return this.energy;
    }
};

function createConnections(maxConnections, maxIndex){
    var result = [];

    var connections = Math.max(parseInt(Math.random() * maxConnections), Object.keys(inputs).length);

    while(connections--){
        result.push(parseInt(Math.random() * maxIndex));
    }

    return result;
}

var methods = ['add', 'multiply', 'power', 'mod'];

function randomNeurons(){
    var neurons = [];
    for(var j = 0; j < 10; j++){
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
        mutation: 0.001,
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
    if(bugs.length < 10){
        bugs.push(createBug(randomNeurons()));
    }

    map.shift();

    map.push(Math.random() < bugs.length / 1000);

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
            survivors.push(createBug(bug.neurons.map(function(neuron){
                return neuron.settings;
            })));
        }

        //on dot, die
        if(bug.distance > 100 && bug.height < 1 && bug.distFromDot === 0){
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
        bug.dotDists = map.slice(mapPosition, mapPosition + 10)
            .map(function(dot, index){
                return dot && index;
            })
            .filter(function(distance){
                return typeof distance === 'number';
            });

        bug.distFromDot = bug.dotDists.length ? bug.dotDists[0] : -1;

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
            innerRuns = 100;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4zLjEvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiaW5wdXQuanMiLCJuZXVyYWwuanMiLCJyZW5kZXIuanMiLCJ0ZXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2ltU2V0dGluZ3Mpe1xuICAgIHZhciB0b2dnbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcblxuICAgIHRvZ2dsZS50ZXh0Q29udGVudCA9ICdSZWFsdGltZSc7XG5cbiAgICB0b2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICBzaW1TZXR0aW5ncy5yZWFsdGltZSA9ICFzaW1TZXR0aW5ncy5yZWFsdGltZTtcbiAgICB9KTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oKXtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0b2dnbGUpO1xuICAgIH0pO1xufTsiLCJ2YXIgbWV0aG9kcyA9IHtcbiAgICBtdWx0aXBseTogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBhICogYjtcbiAgICB9LFxuICAgIGFkZDogZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBhICsgYjtcbiAgICB9LFxuICAgIHBvd2VyOiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIE1hdGgucG93KGEsIGIpO1xuICAgIH0sXG4gICAgbW9kOiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIGEgJSBiICogMTA7XG4gICAgfVxufTtcblxuZnVuY3Rpb24gbWFrZU5ldXJvbihuZXVyb25zLCBzZXR0aW5ncyl7XG4gICAgdmFyIGlucHV0cyA9IFtdLFxuICAgICAgICBpbnB1dEluZGljaWVzID0gc2V0dGluZ3MuaW5wdXRJbmRpY2llcy5zbGljZSgpO1xuXG4gICAgdmFyIG5ldXJvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciByZXN1bHQgPSBpbnB1dEluZGljaWVzLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGluZGV4KXtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQgKyBNYXRoLnBvdyhuZXVyb25zW2luZGV4XSgpLCAyKTtcbiAgICAgICAgfSwgMCk7XG5cbiAgICAgICAgcmVzdWx0ID0gTWF0aC5wb3cocmVzdWx0LCAxLzIpO1xuXG4gICAgICAgIHJlc3VsdCA9IG1ldGhvZHNbc2V0dGluZ3MubWV0aG9kXShyZXN1bHQsIHNldHRpbmdzLm1vZGlmaWVyKTtcblxuICAgICAgICByZXN1bHQgPSBNYXRoLm1pbigxLCByZXN1bHQpO1xuICAgICAgICByZXN1bHQgPSBNYXRoLm1heCgwLCByZXN1bHQpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICBuZXVyb24uc2V0dGluZ3MgPSBzZXR0aW5ncztcblxuICAgIHJldHVybiBuZXVyb247XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmV0d29ya1NldHRpbmdzKXtcbiAgICB2YXIgbmV0d29yayA9IHt9O1xuXG4gICAgdmFyIGlucHV0cyA9IG5ldHdvcmtTZXR0aW5ncy5pbnB1dHMsXG4gICAgICAgIG91dHB1dHMgPSBuZXR3b3JrU2V0dGluZ3Mub3V0cHV0cyxcbiAgICAgICAgcHJldmlvdXNOZXVyb25TZXR0aW5ncyA9IG5ldHdvcmtTZXR0aW5ncy5wcmV2aW91c05ldXJvblNldHRpbmdzLFxuICAgICAgICBpbnB1dE5ldXJvbnMgPSBPYmplY3Qua2V5cyhuZXR3b3JrU2V0dGluZ3MuaW5wdXRzKS5tYXAoZnVuY3Rpb24oa2V5KXtcbiAgICAgICAgICAgIHJldHVybiBuZXR3b3JrU2V0dGluZ3MuaW5wdXRzW2tleV0uYmluZChuZXR3b3JrKTtcbiAgICAgICAgfSksXG4gICAgICAgIG5ldXJvbnMgPSBpbnB1dE5ldXJvbnMuc2xpY2UoKTtcblxuICAgIHByZXZpb3VzTmV1cm9uU2V0dGluZ3MubWFwKGZ1bmN0aW9uKG5ldXJvblNldHRpbmdzKXtcbiAgICAgICAgdmFyIG5ld05ldXJvblNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogbmV1cm9uU2V0dGluZ3MubWV0aG9kLFxuICAgICAgICAgICAgICAgIGlucHV0SW5kaWNpZXM6IG5ldXJvblNldHRpbmdzLmlucHV0SW5kaWNpZXMsXG4gICAgICAgICAgICAgICAgbW9kaWZpZXI6IG5ldXJvblNldHRpbmdzLm1vZGlmaWVyICogKDEgKyAoTWF0aC5yYW5kb20oKSAqIChuZXR3b3JrU2V0dGluZ3MubXV0YXRpb24gKiAyKSAtIG5ldHdvcmtTZXR0aW5ncy5tdXRhdGlvbikpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIG5ldXJvbnMucHVzaChtYWtlTmV1cm9uKG5ldXJvbnMsIG5ld05ldXJvblNldHRpbmdzKSk7XG4gICAgfSk7XG5cbiAgICB2YXIgb3V0cHV0TmV1cm9ucyA9IG5ldXJvbnMuc2xpY2UoLSBPYmplY3Qua2V5cyhvdXRwdXRzKS5sZW5ndGgpO1xuXG4gICAgdmFyIGlucHV0TWFwID0gT2JqZWN0LmtleXMoaW5wdXRzKS5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBrZXkpe1xuICAgICAgICByZXN1bHRba2V5XSA9IGlucHV0TmV1cm9ucy5wb3AoKTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIHt9KTtcblxuICAgIHZhciBvdXRwdXRNYXAgPSBPYmplY3Qua2V5cyhvdXRwdXRzKS5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBrZXkpe1xuICAgICAgICByZXN1bHRba2V5XSA9IG91dHB1dE5ldXJvbnMucG9wKCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCB7fSk7XG5cbiAgICBuZXR3b3JrLmlucHV0cyA9IGlucHV0TWFwO1xuICAgIG5ldHdvcmsub3V0cHV0cyA9IG91dHB1dE1hcDtcbiAgICBuZXR3b3JrLm5ldXJvbnMgPSBuZXVyb25zLnNsaWNlKE9iamVjdC5rZXlzKGlucHV0cykubGVuZ3RoKTtcblxuICAgIHJldHVybiBuZXR3b3JrO1xufSIsInZhciBzdGF0cyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ByZScpLFxuICAgIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLFxuICAgIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbigpe1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2FudmFzKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN0YXRzKTtcbn0pO1xuXG52YXIgcmVuZGVySGVpZ2h0ID0gNjA7XG52YXIgcmVuZGVyV2lkdGggPSAxMTAwO1xuY2FudmFzLmhlaWdodCA9IHJlbmRlckhlaWdodDtcbmNhbnZhcy53aWR0aCA9IHJlbmRlcldpZHRoO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN0YXRlKXtcbiAgICBzdGF0cy50ZXh0Q29udGVudCA9IFtcbiAgICAgICAgJ1RpY2tzOiAnICsgc3RhdGUudGlja3MsXG4gICAgICAgICdCdWdzOiAnICsgc3RhdGUuYnVncy5sZW5ndGgsXG4gICAgICAgICdNYXggQWdlOiAnICsgc3RhdGUuYmVzdEJ1Zy5hZ2UsXG4gICAgICAgICduZXVyb25zOiAnICsgSlNPTi5zdHJpbmdpZnkoc3RhdGUuYmVzdEJ1Zy5uZXVyb25zLm1hcChmdW5jdGlvbihuZXVyb24pe1xuICAgICAgICAgICAgcmV0dXJuIG5ldXJvbi5zZXR0aW5ncztcbiAgICAgICAgfSksIG51bGwsIDQpXG4gICAgXS5qb2luKCdcXG4nKTtcbiAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCByZW5kZXJXaWR0aCwgcmVuZGVySGVpZ2h0KTtcblxuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG5cbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICcjMDAwMDAwJztcblxuICAgIHN0YXRlLm1hcC5tYXAoZnVuY3Rpb24oZG90LCBpbmRleCl7XG4gICAgICAgIGlmKGRvdCl7XG4gICAgICAgICAgICBjb250ZXh0LmZpbGxSZWN0KGluZGV4ICogMTAsIHJlbmRlckhlaWdodCAtIDEwLCAxMCwgMTApO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICcjRkYwMDAwJztcblxuICAgIHN0YXRlLmJ1Z3MubWFwKGZ1bmN0aW9uKGJ1Zyl7XG4gICAgICAgIGNvbnRleHQuZmlsbFJlY3QoYnVnLmRpc3RhbmNlLCByZW5kZXJIZWlnaHQgLSAxMCAtIChidWcuaGVpZ2h0ICogMTApLCAxMCwgMTApO1xuICAgIH0pO1xuXG4gICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbn07IiwidmFyIG5ldXJhbCA9IHJlcXVpcmUoJy4vbmV1cmFsJyk7XG52YXIgc2ltU2V0dGluZ3MgPSB7IHJlYWx0aW1lOiBmYWxzZSB9O1xudmFyIGlucHV0ID0gcmVxdWlyZSgnLi9pbnB1dCcpKHNpbVNldHRpbmdzKTtcblxudmFyIHByZXZpb3VzTmV1cm9uU2V0dGluZ3MgPSBbXTtcblxudmFyIGlucHV0cyA9IHtcbiAgICBkaXN0RnJvbUZpcnN0RG90OiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5kb3REaXN0c1swXSA9PSBudWxsID8gLTEgOiB0aGlzLmRvdERpc3RzWzBdO1xuICAgIH0sXG4gICAgZGlzdEZyb21TZWNvbmREb3Q6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmRvdERpc3RzWzFdID09IG51bGwgPyAtMSA6IHRoaXMuZG90RGlzdHNbMV07XG4gICAgfSxcbiAgICBoZWlnaHQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmhlaWdodDtcbiAgICB9LFxuICAgIGVuZXJneTogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZW5lcmd5O1xuICAgIH1cbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3Rpb25zKG1heENvbm5lY3Rpb25zLCBtYXhJbmRleCl7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuXG4gICAgdmFyIGNvbm5lY3Rpb25zID0gTWF0aC5tYXgocGFyc2VJbnQoTWF0aC5yYW5kb20oKSAqIG1heENvbm5lY3Rpb25zKSwgT2JqZWN0LmtleXMoaW5wdXRzKS5sZW5ndGgpO1xuXG4gICAgd2hpbGUoY29ubmVjdGlvbnMtLSl7XG4gICAgICAgIHJlc3VsdC5wdXNoKHBhcnNlSW50KE1hdGgucmFuZG9tKCkgKiBtYXhJbmRleCkpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbnZhciBtZXRob2RzID0gWydhZGQnLCAnbXVsdGlwbHknLCAncG93ZXInLCAnbW9kJ107XG5cbmZ1bmN0aW9uIHJhbmRvbU5ldXJvbnMoKXtcbiAgICB2YXIgbmV1cm9ucyA9IFtdO1xuICAgIGZvcih2YXIgaiA9IDA7IGogPCAxMDsgaisrKXtcbiAgICAgICAgdmFyIG1ldGhvZEluZGV4ID0gcGFyc2VJbnQoTWF0aC5yYW5kb20oKSAqIG1ldGhvZHMubGVuZ3RoKSAlIG1ldGhvZHMubGVuZ3RoO1xuICAgICAgICBuZXVyb25zLnB1c2goe1xuICAgICAgICAgICAgbWV0aG9kOiBtZXRob2RzW21ldGhvZEluZGV4XSxcbiAgICAgICAgICAgIG1vZGlmaWVyOiBNYXRoLnJhbmRvbSgpLFxuICAgICAgICAgICAgaW5wdXRJbmRpY2llczogY3JlYXRlQ29ubmVjdGlvbnMoNSwgaiArIE9iamVjdC5rZXlzKGlucHV0cykubGVuZ3RoKVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV1cm9ucztcbn1cblxuZm9yKHZhciBpID0gMDsgaSA8IDIwOyBpKyspe1xuICAgIHByZXZpb3VzTmV1cm9uU2V0dGluZ3MucHVzaChyYW5kb21OZXVyb25zKCkpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVCdWcocHJldmlvdXNOZXVyb25TZXR0aW5ncyl7XG4gICAgdmFyIGJ1ZyA9IG5ldXJhbCh7XG4gICAgICAgIG11dGF0aW9uOiAwLjAwMSxcbiAgICAgICAgaW5wdXRzOiBpbnB1dHMsXG4gICAgICAgIG91dHB1dHM6IHtcbiAgICAgICAgICAgIHRocnVzdDogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBwcmV2aW91c05ldXJvblNldHRpbmdzOiBwcmV2aW91c05ldXJvblNldHRpbmdzXG4gICAgfSk7XG5cbiAgICBidWcuYWdlID0gMDtcbiAgICBidWcuZW5lcmd5ID0gMTtcbiAgICBidWcuaGVpZ2h0ID0gMDtcbiAgICBidWcudGhydXN0ID0gMDtcbiAgICBidWcuZGlzdGFuY2UgPSAwO1xuICAgIGJ1Zy5kaXN0RnJvbURvdCA9IC0xO1xuXG4gICAgcmV0dXJuIGJ1Zztcbn1cblxudmFyIG1hcCA9IFtdO1xuXG5mb3IodmFyIGkgPSAwOyBpIDwgMTIwOyBpKyspe1xuICAgIG1hcC5wdXNoKGZhbHNlKTtcbn1cblxudmFyIGJ1Z3MgPSBbXTtcblxudmFyIHJlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXInKTtcblxudmFyIHRpY2tzID0gMDtcbnZhciBpbm5lclJ1bnMgPSAxO1xudmFyIGJlc3RCdWc7XG5mdW5jdGlvbiBnYW1lTG9vcCgpe1xuICAgIHRpY2tzKys7XG4gICAgaWYoYnVncy5sZW5ndGggPCAxMCl7XG4gICAgICAgIGJ1Z3MucHVzaChjcmVhdGVCdWcocmFuZG9tTmV1cm9ucygpKSk7XG4gICAgfVxuXG4gICAgbWFwLnNoaWZ0KCk7XG5cbiAgICBtYXAucHVzaChNYXRoLnJhbmRvbSgpIDwgYnVncy5sZW5ndGggLyAxMDAwKTtcblxuICAgIGJ1Z3MgPSBidWdzLnJlZHVjZShmdW5jdGlvbihzdXJ2aXZvcnMsIGJ1Zyl7XG4gICAgICAgIGJ1Zy5hZ2UrKztcbiAgICAgICAgYnVnLmRpc3RhbmNlKys7XG5cbiAgICAgICAgaWYoIWJlc3RCdWcgfHwgYnVnLmFnZSA+IGJlc3RCdWcuYWdlKXtcbiAgICAgICAgICAgIHNpbVNldHRpbmdzLnJlYWx0aW1lID0gdHJ1ZTtcbiAgICAgICAgICAgIGJlc3RCdWcgPSBidWc7XG4gICAgICAgIH1cblxuICAgICAgICBpZihidWcuZGlzdGFuY2UgPiA5OTkpe1xuICAgICAgICAgICAgYnVnLmRpc3RhbmNlID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGJ1Zy5kaXN0YW5jZSAmJiAhKGJ1Zy5kaXN0YW5jZSAlIDExMSkgJiYgYnVnLmFnZSA+IDMwMCl7XG4gICAgICAgICAgICBzdXJ2aXZvcnMucHVzaChjcmVhdGVCdWcoYnVnLm5ldXJvbnMubWFwKGZ1bmN0aW9uKG5ldXJvbil7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldXJvbi5zZXR0aW5ncztcbiAgICAgICAgICAgIH0pKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL29uIGRvdCwgZGllXG4gICAgICAgIGlmKGJ1Zy5kaXN0YW5jZSA+IDEwMCAmJiBidWcuaGVpZ2h0IDwgMSAmJiBidWcuZGlzdEZyb21Eb3QgPT09IDApe1xuICAgICAgICAgICAgaWYoYnVnID09PSBiZXN0QnVnKXtcbiAgICAgICAgICAgICAgICBzaW1TZXR0aW5ncy5yZWFsdGltZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN1cnZpdm9ycztcbiAgICAgICAgfVxuXG4gICAgICAgIHN1cnZpdm9ycy5wdXNoKGJ1Zyk7XG5cbiAgICAgICAgLy9mYWxsXG4gICAgICAgIGJ1Zy5oZWlnaHQgKz0gYnVnLnRocnVzdDtcbiAgICAgICAgYnVnLmhlaWdodCA9IE1hdGgubWF4KDAsIGJ1Zy5oZWlnaHQgLT0gMC41KTtcbiAgICAgICAgdmFyIG1hcFBvc2l0aW9uID0gcGFyc2VJbnQoYnVnLmRpc3RhbmNlIC8gMTApO1xuICAgICAgICBidWcuZG90RGlzdHMgPSBtYXAuc2xpY2UobWFwUG9zaXRpb24sIG1hcFBvc2l0aW9uICsgMTApXG4gICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGRvdCwgaW5kZXgpe1xuICAgICAgICAgICAgICAgIHJldHVybiBkb3QgJiYgaW5kZXg7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmZpbHRlcihmdW5jdGlvbihkaXN0YW5jZSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBkaXN0YW5jZSA9PT0gJ251bWJlcic7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBidWcuZGlzdEZyb21Eb3QgPSBidWcuZG90RGlzdHMubGVuZ3RoID8gYnVnLmRvdERpc3RzWzBdIDogLTE7XG5cbiAgICAgICAgaWYoIWJ1Zy5oZWlnaHQgJiYgYnVnLmVuZXJneSA+IDAuMil7XG4gICAgICAgICAgICB2YXIgdGhydXN0ID0gYnVnLm91dHB1dHMudGhydXN0KCk7XG4gICAgICAgICAgICBidWcudGhydXN0ICs9IHRocnVzdCAqIGJ1Zy5lbmVyZ3kgKiAxLjU7XG4gICAgICAgICAgICBidWcuZW5lcmd5ID0gTWF0aC5tYXgoMCwgYnVnLmVuZXJneSAtIGJ1Zy50aHJ1c3QpO1xuICAgICAgICB9XG4gICAgICAgIGJ1Zy5lbmVyZ3kgPSBNYXRoLm1pbigxLCBidWcuZW5lcmd5ICsgMC4wNDcpO1xuICAgICAgICBpZihidWcudGhydXN0ID4gMCl7XG4gICAgICAgICAgICBidWcudGhydXN0IC09IDAuMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdXJ2aXZvcnM7XG4gICAgfSwgW10pO1xuXG4gICAgaWYoIXNpbVNldHRpbmdzLnJlYWx0aW1lKXtcbiAgICAgICAgaWYoaW5uZXJSdW5zLS0pe1xuICAgICAgICAgICAgZ2FtZUxvb3AoKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBpbm5lclJ1bnMgPSAxMDA7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGdhbWVMb29wLCAwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2V0VGltZW91dChnYW1lTG9vcCwgMzApO1xuXG59XG5cbmZ1bmN0aW9uIHJlbmRlcigpe1xuICAgIHJlbmRlcmVyKHsgdGlja3MsIGJ1Z3MsIG1hcCwgYmVzdEJ1ZyB9KTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcbn1cblxuZ2FtZUxvb3AoKTtcblxucmVuZGVyKCk7XG5cbiJdfQ==
