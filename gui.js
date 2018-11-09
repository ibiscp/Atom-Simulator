var elementsList = {}
for(var i = 0; i < data.elements.length; ++i){
    elementsList[data.elements[i].name] = i;
}

// DAT.GUI Related Stuff
var gui = new dat.GUI();

var elementGUI = gui.add(options, "element", elementsList ).name('Element').listen();
elementGUI.onChange(function(value)
	{   drawElement();   });

  var obj = { Clear:function(){ clearScene(scene); }};//clearScene(); }};

  gui.add(obj,'Clear');
