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

