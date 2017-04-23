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

    var connections = parseInt(Math.random() * maxConnections);

    while(connections--){
        result.push(parseInt(Math.random() * maxIndex));
    }

    return result;
}

var methods = ['add', 'multiply', 'power', 'mod'];

function randomNeurons(){
    var neurons = [];
    for(var j = 0; j < 10; j++){
        var methodIndex = parseInt(Math.random() * methods.length);
        neurons.push({
            method: methods[methodIndex],
            modifier: Math.random(),
            inputIndicies: createConnections(4, j + Object.keys(inputs).length)
        });
    }

    return neurons;
}

for(var i = 0; i < 20; i++){
    previousNeuronSettings.push(randomNeurons());
}

function createBug(previousNeuronSettings){
    var bug = neural({
        mutation: 0.01,
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
    if(bugs.length < 40){
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

        if(bug.distance && !(bug.distance % 111)){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbnB1dC5qcyIsIm5ldXJhbC5qcyIsInJlbmRlci5qcyIsInRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzaW1TZXR0aW5ncyl7XG4gICAgdmFyIHRvZ2dsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuXG4gICAgdG9nZ2xlLnRleHRDb250ZW50ID0gJ1JlYWx0aW1lJztcblxuICAgIHRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHNpbVNldHRpbmdzLnJlYWx0aW1lID0gIXNpbVNldHRpbmdzLnJlYWx0aW1lO1xuICAgIH0pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbigpe1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRvZ2dsZSk7XG4gICAgfSk7XG59OyIsInZhciBtZXRob2RzID0ge1xuICAgIG11bHRpcGx5OiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIGEgKiBiO1xuICAgIH0sXG4gICAgYWRkOiBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIGEgKyBiO1xuICAgIH0sXG4gICAgcG93ZXI6IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gTWF0aC5wb3coYSwgYik7XG4gICAgfSxcbiAgICBtb2Q6IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gYSAlIGIgKiAxMDtcbiAgICB9XG59O1xuXG5mdW5jdGlvbiBtYWtlTmV1cm9uKG5ldXJvbnMsIHNldHRpbmdzKXtcbiAgICB2YXIgaW5wdXRzID0gW10sXG4gICAgICAgIGlucHV0SW5kaWNpZXMgPSBzZXR0aW5ncy5pbnB1dEluZGljaWVzLnNsaWNlKCk7XG5cbiAgICB2YXIgbmV1cm9uID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGlucHV0SW5kaWNpZXMucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwgaW5kZXgpe1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdCArIE1hdGgucG93KG5ldXJvbnNbaW5kZXhdKCksIDIpO1xuICAgICAgICB9LCAwKTtcblxuICAgICAgICByZXN1bHQgPSBNYXRoLnBvdyhyZXN1bHQsIDEvMik7XG5cbiAgICAgICAgcmVzdWx0ID0gbWV0aG9kc1tzZXR0aW5ncy5tZXRob2RdKHJlc3VsdCwgc2V0dGluZ3MubW9kaWZpZXIpO1xuXG4gICAgICAgIHJlc3VsdCA9IE1hdGgubWluKDEsIHJlc3VsdCk7XG4gICAgICAgIHJlc3VsdCA9IE1hdGgubWF4KDAsIHJlc3VsdCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICAgIG5ldXJvbi5zZXR0aW5ncyA9IHNldHRpbmdzO1xuXG4gICAgcmV0dXJuIG5ldXJvbjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuZXR3b3JrU2V0dGluZ3Mpe1xuICAgIHZhciBuZXR3b3JrID0ge307XG5cbiAgICB2YXIgaW5wdXRzID0gbmV0d29ya1NldHRpbmdzLmlucHV0cyxcbiAgICAgICAgb3V0cHV0cyA9IG5ldHdvcmtTZXR0aW5ncy5vdXRwdXRzLFxuICAgICAgICBwcmV2aW91c05ldXJvblNldHRpbmdzID0gbmV0d29ya1NldHRpbmdzLnByZXZpb3VzTmV1cm9uU2V0dGluZ3MsXG4gICAgICAgIGlucHV0TmV1cm9ucyA9IE9iamVjdC5rZXlzKG5ldHdvcmtTZXR0aW5ncy5pbnB1dHMpLm1hcChmdW5jdGlvbihrZXkpe1xuICAgICAgICAgICAgcmV0dXJuIG5ldHdvcmtTZXR0aW5ncy5pbnB1dHNba2V5XS5iaW5kKG5ldHdvcmspO1xuICAgICAgICB9KSxcbiAgICAgICAgbmV1cm9ucyA9IGlucHV0TmV1cm9ucy5zbGljZSgpO1xuXG4gICAgcHJldmlvdXNOZXVyb25TZXR0aW5ncy5tYXAoZnVuY3Rpb24obmV1cm9uU2V0dGluZ3Mpe1xuICAgICAgICB2YXIgbmV3TmV1cm9uU2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiBuZXVyb25TZXR0aW5ncy5tZXRob2QsXG4gICAgICAgICAgICAgICAgaW5wdXRJbmRpY2llczogbmV1cm9uU2V0dGluZ3MuaW5wdXRJbmRpY2llcyxcbiAgICAgICAgICAgICAgICBtb2RpZmllcjogbmV1cm9uU2V0dGluZ3MubW9kaWZpZXIgKiAoMSArIChNYXRoLnJhbmRvbSgpICogKG5ldHdvcmtTZXR0aW5ncy5tdXRhdGlvbiAqIDIpIC0gbmV0d29ya1NldHRpbmdzLm11dGF0aW9uKSlcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgbmV1cm9ucy5wdXNoKG1ha2VOZXVyb24obmV1cm9ucywgbmV3TmV1cm9uU2V0dGluZ3MpKTtcbiAgICB9KTtcblxuICAgIHZhciBvdXRwdXROZXVyb25zID0gbmV1cm9ucy5zbGljZSgtIE9iamVjdC5rZXlzKG91dHB1dHMpLmxlbmd0aCk7XG5cbiAgICB2YXIgaW5wdXRNYXAgPSBPYmplY3Qua2V5cyhpbnB1dHMpLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGtleSl7XG4gICAgICAgIHJlc3VsdFtrZXldID0gaW5wdXROZXVyb25zLnBvcCgpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwge30pO1xuXG4gICAgdmFyIG91dHB1dE1hcCA9IE9iamVjdC5rZXlzKG91dHB1dHMpLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGtleSl7XG4gICAgICAgIHJlc3VsdFtrZXldID0gb3V0cHV0TmV1cm9ucy5wb3AoKTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIHt9KTtcblxuICAgIG5ldHdvcmsuaW5wdXRzID0gaW5wdXRNYXA7XG4gICAgbmV0d29yay5vdXRwdXRzID0gb3V0cHV0TWFwO1xuICAgIG5ldHdvcmsubmV1cm9ucyA9IG5ldXJvbnMuc2xpY2UoT2JqZWN0LmtleXMoaW5wdXRzKS5sZW5ndGgpO1xuXG4gICAgcmV0dXJuIG5ldHdvcms7XG59IiwidmFyIHN0YXRzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJlJyksXG4gICAgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyksXG4gICAgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKCl7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjYW52YXMpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc3RhdHMpO1xufSk7XG5cbnZhciByZW5kZXJIZWlnaHQgPSA2MDtcbnZhciByZW5kZXJXaWR0aCA9IDExMDA7XG5jYW52YXMuaGVpZ2h0ID0gcmVuZGVySGVpZ2h0O1xuY2FudmFzLndpZHRoID0gcmVuZGVyV2lkdGg7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RhdGUpe1xuICAgIHN0YXRzLnRleHRDb250ZW50ID0gW1xuICAgICAgICAnVGlja3M6ICcgKyBzdGF0ZS50aWNrcyxcbiAgICAgICAgJ0J1Z3M6ICcgKyBzdGF0ZS5idWdzLmxlbmd0aCxcbiAgICAgICAgJ01heCBBZ2U6ICcgKyBzdGF0ZS5iZXN0QnVnLmFnZSxcbiAgICAgICAgJ25ldXJvbnM6ICcgKyBKU09OLnN0cmluZ2lmeShzdGF0ZS5iZXN0QnVnLm5ldXJvbnMubWFwKGZ1bmN0aW9uKG5ldXJvbil7XG4gICAgICAgICAgICByZXR1cm4gbmV1cm9uLnNldHRpbmdzO1xuICAgICAgICB9KSwgbnVsbCwgNClcbiAgICBdLmpvaW4oJ1xcbicpO1xuICAgIGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHJlbmRlcldpZHRoLCByZW5kZXJIZWlnaHQpO1xuXG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcblxuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJyMwMDAwMDAnO1xuXG4gICAgc3RhdGUubWFwLm1hcChmdW5jdGlvbihkb3QsIGluZGV4KXtcbiAgICAgICAgaWYoZG90KXtcbiAgICAgICAgICAgIGNvbnRleHQuZmlsbFJlY3QoaW5kZXggKiAxMCwgcmVuZGVySGVpZ2h0IC0gMTAsIDEwLCAxMCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJyNGRjAwMDAnO1xuXG4gICAgc3RhdGUuYnVncy5tYXAoZnVuY3Rpb24oYnVnKXtcbiAgICAgICAgY29udGV4dC5maWxsUmVjdChidWcuZGlzdGFuY2UsIHJlbmRlckhlaWdodCAtIDEwIC0gKGJ1Zy5oZWlnaHQgKiAxMCksIDEwLCAxMCk7XG4gICAgfSk7XG5cbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xufTsiLCJ2YXIgbmV1cmFsID0gcmVxdWlyZSgnLi9uZXVyYWwnKTtcbnZhciBzaW1TZXR0aW5ncyA9IHsgcmVhbHRpbWU6IGZhbHNlIH07XG52YXIgaW5wdXQgPSByZXF1aXJlKCcuL2lucHV0Jykoc2ltU2V0dGluZ3MpO1xuXG52YXIgcHJldmlvdXNOZXVyb25TZXR0aW5ncyA9IFtdO1xuXG52YXIgaW5wdXRzID0ge1xuICAgIGRpc3RGcm9tRmlyc3REb3Q6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmRvdERpc3RzWzBdID09IG51bGwgPyAtMSA6IHRoaXMuZG90RGlzdHNbMF07XG4gICAgfSxcbiAgICBkaXN0RnJvbVNlY29uZERvdDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZG90RGlzdHNbMV0gPT0gbnVsbCA/IC0xIDogdGhpcy5kb3REaXN0c1sxXTtcbiAgICB9LFxuICAgIGhlaWdodDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGVpZ2h0O1xuICAgIH0sXG4gICAgZW5lcmd5OiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5lbmVyZ3k7XG4gICAgfVxufTtcblxuZnVuY3Rpb24gY3JlYXRlQ29ubmVjdGlvbnMobWF4Q29ubmVjdGlvbnMsIG1heEluZGV4KXtcbiAgICB2YXIgcmVzdWx0ID0gW107XG5cbiAgICB2YXIgY29ubmVjdGlvbnMgPSBwYXJzZUludChNYXRoLnJhbmRvbSgpICogbWF4Q29ubmVjdGlvbnMpO1xuXG4gICAgd2hpbGUoY29ubmVjdGlvbnMtLSl7XG4gICAgICAgIHJlc3VsdC5wdXNoKHBhcnNlSW50KE1hdGgucmFuZG9tKCkgKiBtYXhJbmRleCkpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbnZhciBtZXRob2RzID0gWydhZGQnLCAnbXVsdGlwbHknLCAncG93ZXInLCAnbW9kJ107XG5cbmZ1bmN0aW9uIHJhbmRvbU5ldXJvbnMoKXtcbiAgICB2YXIgbmV1cm9ucyA9IFtdO1xuICAgIGZvcih2YXIgaiA9IDA7IGogPCAxMDsgaisrKXtcbiAgICAgICAgdmFyIG1ldGhvZEluZGV4ID0gcGFyc2VJbnQoTWF0aC5yYW5kb20oKSAqIG1ldGhvZHMubGVuZ3RoKTtcbiAgICAgICAgbmV1cm9ucy5wdXNoKHtcbiAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kc1ttZXRob2RJbmRleF0sXG4gICAgICAgICAgICBtb2RpZmllcjogTWF0aC5yYW5kb20oKSxcbiAgICAgICAgICAgIGlucHV0SW5kaWNpZXM6IGNyZWF0ZUNvbm5lY3Rpb25zKDQsIGogKyBPYmplY3Qua2V5cyhpbnB1dHMpLmxlbmd0aClcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldXJvbnM7XG59XG5cbmZvcih2YXIgaSA9IDA7IGkgPCAyMDsgaSsrKXtcbiAgICBwcmV2aW91c05ldXJvblNldHRpbmdzLnB1c2gocmFuZG9tTmV1cm9ucygpKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQnVnKHByZXZpb3VzTmV1cm9uU2V0dGluZ3Mpe1xuICAgIHZhciBidWcgPSBuZXVyYWwoe1xuICAgICAgICBtdXRhdGlvbjogMC4wMSxcbiAgICAgICAgaW5wdXRzOiBpbnB1dHMsXG4gICAgICAgIG91dHB1dHM6IHtcbiAgICAgICAgICAgIHRocnVzdDogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBwcmV2aW91c05ldXJvblNldHRpbmdzOiBwcmV2aW91c05ldXJvblNldHRpbmdzXG4gICAgfSk7XG5cbiAgICBidWcuYWdlID0gMDtcbiAgICBidWcuZW5lcmd5ID0gMTtcbiAgICBidWcuaGVpZ2h0ID0gMDtcbiAgICBidWcudGhydXN0ID0gMDtcbiAgICBidWcuZGlzdGFuY2UgPSAwO1xuICAgIGJ1Zy5kaXN0RnJvbURvdCA9IC0xO1xuXG4gICAgcmV0dXJuIGJ1Zztcbn1cblxudmFyIG1hcCA9IFtdO1xuXG5mb3IodmFyIGkgPSAwOyBpIDwgMTIwOyBpKyspe1xuICAgIG1hcC5wdXNoKGZhbHNlKTtcbn1cblxudmFyIGJ1Z3MgPSBbXTtcblxudmFyIHJlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXInKTtcblxudmFyIHRpY2tzID0gMDtcbnZhciBpbm5lclJ1bnMgPSAxO1xudmFyIGJlc3RCdWc7XG5mdW5jdGlvbiBnYW1lTG9vcCgpe1xuICAgIHRpY2tzKys7XG4gICAgaWYoYnVncy5sZW5ndGggPCA0MCl7XG4gICAgICAgIGJ1Z3MucHVzaChjcmVhdGVCdWcocmFuZG9tTmV1cm9ucygpKSk7XG4gICAgfVxuXG4gICAgbWFwLnNoaWZ0KCk7XG5cbiAgICBtYXAucHVzaChNYXRoLnJhbmRvbSgpIDwgYnVncy5sZW5ndGggLyAxMDAwKTtcblxuICAgIGJ1Z3MgPSBidWdzLnJlZHVjZShmdW5jdGlvbihzdXJ2aXZvcnMsIGJ1Zyl7XG4gICAgICAgIGJ1Zy5hZ2UrKztcbiAgICAgICAgYnVnLmRpc3RhbmNlKys7XG5cbiAgICAgICAgaWYoIWJlc3RCdWcgfHwgYnVnLmFnZSA+IGJlc3RCdWcuYWdlKXtcbiAgICAgICAgICAgIHNpbVNldHRpbmdzLnJlYWx0aW1lID0gdHJ1ZTtcbiAgICAgICAgICAgIGJlc3RCdWcgPSBidWc7XG4gICAgICAgIH1cblxuICAgICAgICBpZihidWcuZGlzdGFuY2UgPiA5OTkpe1xuICAgICAgICAgICAgYnVnLmRpc3RhbmNlID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGJ1Zy5kaXN0YW5jZSAmJiAhKGJ1Zy5kaXN0YW5jZSAlIDExMSkpe1xuICAgICAgICAgICAgc3Vydml2b3JzLnB1c2goY3JlYXRlQnVnKGJ1Zy5uZXVyb25zLm1hcChmdW5jdGlvbihuZXVyb24pe1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXVyb24uc2V0dGluZ3M7XG4gICAgICAgICAgICB9KSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9vbiBkb3QsIGRpZVxuICAgICAgICBpZihidWcuZGlzdGFuY2UgPiAxMDAgJiYgYnVnLmhlaWdodCA8IDEgJiYgYnVnLmRpc3RGcm9tRG90ID09PSAwKXtcbiAgICAgICAgICAgIGlmKGJ1ZyA9PT0gYmVzdEJ1Zyl7XG4gICAgICAgICAgICAgICAgc2ltU2V0dGluZ3MucmVhbHRpbWUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdXJ2aXZvcnM7XG4gICAgICAgIH1cblxuICAgICAgICBzdXJ2aXZvcnMucHVzaChidWcpO1xuXG4gICAgICAgIC8vZmFsbFxuICAgICAgICBidWcuaGVpZ2h0ICs9IGJ1Zy50aHJ1c3Q7XG4gICAgICAgIGJ1Zy5oZWlnaHQgPSBNYXRoLm1heCgwLCBidWcuaGVpZ2h0IC09IDAuNSk7XG4gICAgICAgIHZhciBtYXBQb3NpdGlvbiA9IHBhcnNlSW50KGJ1Zy5kaXN0YW5jZSAvIDEwKTtcbiAgICAgICAgYnVnLmRvdERpc3RzID0gbWFwLnNsaWNlKG1hcFBvc2l0aW9uLCBtYXBQb3NpdGlvbiArIDEwKVxuICAgICAgICAgICAgLm1hcChmdW5jdGlvbihkb3QsIGluZGV4KXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG90ICYmIGluZGV4O1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5maWx0ZXIoZnVuY3Rpb24oZGlzdGFuY2Upe1xuICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2YgZGlzdGFuY2UgPT09ICdudW1iZXInO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgYnVnLmRpc3RGcm9tRG90ID0gYnVnLmRvdERpc3RzLmxlbmd0aCA/IGJ1Zy5kb3REaXN0c1swXSA6IC0xO1xuXG4gICAgICAgIGlmKCFidWcuaGVpZ2h0ICYmIGJ1Zy5lbmVyZ3kgPiAwLjIpe1xuICAgICAgICAgICAgdmFyIHRocnVzdCA9IGJ1Zy5vdXRwdXRzLnRocnVzdCgpO1xuICAgICAgICAgICAgYnVnLnRocnVzdCArPSB0aHJ1c3QgKiBidWcuZW5lcmd5ICogMS41O1xuICAgICAgICAgICAgYnVnLmVuZXJneSA9IE1hdGgubWF4KDAsIGJ1Zy5lbmVyZ3kgLSBidWcudGhydXN0KTtcbiAgICAgICAgfVxuICAgICAgICBidWcuZW5lcmd5ID0gTWF0aC5taW4oMSwgYnVnLmVuZXJneSArIDAuMDQ3KTtcbiAgICAgICAgaWYoYnVnLnRocnVzdCA+IDApe1xuICAgICAgICAgICAgYnVnLnRocnVzdCAtPSAwLjE7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3Vydml2b3JzO1xuICAgIH0sIFtdKTtcblxuICAgIGlmKCFzaW1TZXR0aW5ncy5yZWFsdGltZSl7XG4gICAgICAgIGlmKGlubmVyUnVucy0tKXtcbiAgICAgICAgICAgIGdhbWVMb29wKCk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgaW5uZXJSdW5zID0gMTAwO1xuICAgICAgICAgICAgc2V0VGltZW91dChnYW1lTG9vcCwgMCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNldFRpbWVvdXQoZ2FtZUxvb3AsIDMwKTtcblxufVxuXG5mdW5jdGlvbiByZW5kZXIoKXtcbiAgICByZW5kZXJlcih7IHRpY2tzLCBidWdzLCBtYXAsIGJlc3RCdWcgfSk7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG59XG5cbmdhbWVMb29wKCk7XG5cbnJlbmRlcigpO1xuXG4iXX0=
