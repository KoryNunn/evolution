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

    var connections = Math.max(parseInt((Math.random() * maxConnections) % maxConnections), Object.keys(inputs).length);

    while(connections--){
        result.push(parseInt(Math.random() * maxIndex));
    }

    return result;
}

var methods = neural.methods;

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

