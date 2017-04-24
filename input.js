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