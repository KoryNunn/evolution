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