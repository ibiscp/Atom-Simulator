var elementsList = {}
for(var i = 0; i < data.elements.length; ++i){
  elementsList[data.elements[i].name] = i;
}

// Buttons and functions
var pauseGUI;
var shellsGUI;
var nucleusGUI;
var functions = {
  Element:function(value){
    drawElement();
    if (!options['nucleusAnimation'])
      nucleusGeneration();
    renderer.render(scene, camera);
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
      toggleShells();
    }
    else{
      options['shells'] = true;
      shellsGUI.name('Hide shells');
      toggleShells();
    }
  },
  NucleusAnimation:function(){
    if (options['nucleusAnimation']){
      options['nucleusAnimation'] = false;
      nucleusGUI.name('Show nucleus animation');
      nucleusGeneration();
    }
    else{
      options['nucleusAnimation'] = true;
      nucleusGUI.name('Hide nucleus animation');
      resetNucleus();
    }
  },
};

// DAT.GUI Related Stuff
var gui = new dat.GUI( { autoplace: false, width: 350 } );

// List of elements
var elementGUI = gui.add(options, "element", elementsList ).name('Element').listen();
elementGUI.onChange(functions.Element);

// Pause button
pauseGUI = gui.add(functions,'Pause');

// Show shells
shellsGUI = gui.add(functions,'Shells').name('Hide shells');

// Show nucleus animation
nucleusGUI = gui.add(functions,'NucleusAnimation').name('Hide nucleus animation');
