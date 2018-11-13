var elementsList = {}
for(var i = 0; i < data.elements.length; ++i){
  elementsList[data.elements[i].name] = i;
}
function sortOnKeys(dict) {

    var sorted = [];
    for(var key in dict) {
        sorted[sorted.length] = key;
    }
    sorted.sort();

    var tempDict = {};
    for(var i = 0; i < sorted.length; i++) {
        tempDict[sorted[i]] = dict[sorted[i]];
    }

    return tempDict;
}

elementsList = sortOnKeys(elementsList);

// Buttons and functions
var pauseGUI;
var shellsGUI;
var nucleusGUI;
var orbits;
var functions = {
  Element:function(value){
    drawElement();
    renderer.render(scene, camera);
    options.shellNucleus = true;
    options.shell1 = true;
    options.shell2 = true;
    options.shell3 = true;
    options.shell4 = true;
    options.shell5 = true;
    options.shell6 = true;
    options.shell7 = true;
  },
  Pause:function(){
    if (options['pause']){
      options['pause'] = false;
      pauseGUI.name('Continue');
    }
    else{
      options['pause'] = true;
      pauseGUI.name('Pause');
      animate();
    }
  },
  Shells:function(){
    if (options['shells']){
      options['shells'] = false;
      shellsGUI.name('Show shells');
      // toggleShells();
    }
    else{
      options['shells'] = true;
      shellsGUI.name('Hide shells');
      // toggleShells();
    }
    setVisibility();
  },
  NucleusAnimation:function(){
    if (options['nucleusAnimation']){
      options['nucleusAnimation'] = false;
      nucleusGUI.name('Show nucleus animation');
      nucleusGenerator();
    }
    else{
      options['nucleusAnimation'] = true;
      nucleusGUI.name('Hide nucleus animation');
      resetNucleus();
    }
  },
  ShellVisibility:function(){
    setVisibility();
  }
};

// DAT.GUI Related Stuff
var gui = new dat.GUI( { autoplace: false, width: 350 } );

// List of elements
var elementGUI = gui.add(options, "element", elementsList ).name('Element').onChange(functions.Element);

// Pause button
pauseGUI = gui.add(functions,'Pause');

// Show shells
shellsGUI = gui.add(functions,'Shells').name('Hide shells');

// Show nucleus animation
nucleusGUI = gui.add(functions,'NucleusAnimation').name('Hide nucleus animation');

orbits = gui.addFolder('Orbits');
orbits.add(options, 'shellNucleus').name('Nucleus').onChange(functions.ShellVisibility).listen();
orbits.add(options, 'shell1').name('1st shell').onChange(functions.ShellVisibility).listen();
orbits.add(options, 'shell2').name('2nd shell').onChange(functions.ShellVisibility).listen();
orbits.add(options, 'shell3').name('3rd shell').onChange(functions.ShellVisibility).listen();
orbits.add(options, 'shell4').name('4th shell').onChange(functions.ShellVisibility).listen();
orbits.add(options, 'shell5').name('5th shell').onChange(functions.ShellVisibility).listen();
orbits.add(options, 'shell6').name('6th shell').onChange(functions.ShellVisibility).listen();
orbits.add(options, 'shell7').name('7th shell').onChange(functions.ShellVisibility).listen();
// orbits.add(options, 'shell7').name('7th shell').onChange(functions.ShellVisibility);
orbits.open();
