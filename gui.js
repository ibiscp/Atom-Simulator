var elementsList = {}
for(var i = 0; i < data.elements.length; ++i){
  elementsList[data.elements[i].name] = i;
}

// Buttons and functions
var pauseGUI;
var shellsGUI;
var functions = { Pause:function(){
  if (options['pause']){
    options['pause'] = false;
    pauseGUI.name('Continue');
  }
  else{
    options['pause'] = true;
    pauseGUI.name('Pause');
    animate();
  }},
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
    }}};

// DAT.GUI Related Stuff
var gui = new dat.GUI();

// List of elements
var elementGUI = gui.add(options, "element", elementsList ).name('Element').listen();
elementGUI.onChange(function(value)
{   drawElement();   renderer.render(scene, camera);  });

// Pause button
pauseGUI = gui.add(functions,'Pause');

// Show shells
shellsGUI = gui.add(functions,'Shells').name('Hide shells');
