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