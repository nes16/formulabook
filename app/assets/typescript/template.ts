define(['underscore', 'text'], function(_, text){
  var buildMap = {};

  return {
    load: function(name, req, onLoad, config){
      var text_name = "templatesrc/" + name + ".html";
      text.get(req.toUrl(text_name), function(template_source){
        var template = _.template(template_source);
        if(config.isBuild){
          buildMap[name] = template.source;
        }
        onLoad(template);
      });
    },

    write: function(pluginName, moduleName, write){
      if (moduleName in buildMap) {
        var template = (buildMap[moduleName]);
        write(
          "define('" +
            pluginName + '!' + moduleName + "', " +
            "['underscore'], " +
            "function(_) {return " + template + ";}" +
          ");"
        );
      }
      else{
        console.log("ERROR - failed to find template " + moduleName + " in buildMap");
      }
    }
  };
});
