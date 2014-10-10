(function(){

  var events = new EventEmitter();

  var $edi = window.$edi = (function(){

    $edi.edi_id = false;

    //closure stuff here

    var
      depot = {

      },
      hReg = new (function EventRegistry(){
        var ids={};
        var types={};
        var events={};

        this.byId = byId;
        this.byType = byType;
        this.byEvent = byEvent;

        function byId(label, evtName, handler){
          return getSetHandler(ids, label, evtName, handler);
        }

        function byType(label, evtName, handler){
          return getSetHandler(types, label, evtName, handler);
        }

        function byEvent(label, handler){
          var evtObj = events[label] = events[label] || [];
          if(handler){
            evtObj.push(handler);
            return true;
          }
          else if(evtObj && evtObj.length){
            return evtObj;
          }
          else return null;
        }

        function getSetHandler(evtObj, label, evtName, handler){
          if(handler){
            var evtType = evtObj[label] = evtObj[label] || {};
            var handlerArr = evtType[evtName] = evtType[evtName] || [];
            handlerArr.push(handler);
            return true;
          }
          else if(evtObj[label] && evtObj[label][evtName] && evtObj[label][evtName].length){
            return evtObj[label][evtName];
          }
          else {
            return null;
          }

        }
      }),
      errors = {
        noArg:function(){
          throw new Error('edioop error: No event name argument passed');
          return false;
        }
      },
      anonConstructorId = (function(){
        var counter = 0;
        function anonConstructorId(){
          return 'anonConstructorId_' + counter++;
        }
        return anonConstructorId;
      })()
    ;

    $edi.fire = fire;
    $edi.on = on;
    $edi.off = off;

    events.addListener('edi_event', evtRouter);

    function evtRouter(e){
      var handlers;
      var evtName = e.edi_evtName;
      var e2 = {};
      switch(e.edi_targetType){
        case 'id':
          bubbler = idBubbleHandler;
          handlers = hReg.byId(e.edi_id, evtName) || [];
          break;
        case 'type':
          bubbler = typeBubbleHandler;
          handlers = hReg.byType(e.edi_id,evtName) || [];
          break;
        case 'event':
          handlers = hReg.byEvent(evtName) || [];
          break
        default:
          handlers = [];
          break;
      }
        function idBubbleHandler(){
          e2.edi_originId = e.edi_id;
          e2.edi_id = e.edi_target.parentNode.edi_id
          e2.edi_bubbled = true;
          e2.edi_evtName = e.edi_evtName;
          e2.edi_argsObj = e.edi_argsObj;
          e2.edi_argsArr = e.edi_argsArr;
          e.edi_target.factory.fire(e2);
          typeBubbleHandler(e2);
        }
        function typeBubbleHandler(obj){
          var obj = obj || e;
          e2.edi_originId = obj.edi_id;
          e2.edi_evtName = obj.edi_evtName;
          e2.edi_bubbled = true;
          e2.edi_argsObj = obj.edi_argsObj;
          e2.edi_argsArr = obj.edi_argsArr;
          $edi.fire(e2);
        }

      handlers = handlers.slice();
      if(!e.edi_bubbled){ handlers.push(bubbler) };
      while(handlers.length){
        handlers.shift()(e);
      }

    }

    function wireEdiConstructor(func){

      var depotId = func.edi_constructorId = func.name || anonConstructorId();
      var anonElementId = ( function(){
        counter = 0;
        return (function anonElementId(){ return (depotId +'_'+counter++); });
      } )();
      var thisDepot = depot[depotId] = {};

      func.fire = func.prototype.fire = fire;
      func.on = func.prototype.on = on;
      func.off = func.prototype.off = off;

      var retFunc = function(options){

        options = options || {};

        var instId = options.id || anonElementId();

        var inst = thisDepot[instId] = new func();

        inst.factory = retFunc;
        inst.parentNode = retFunc;
        inst.edi_id = instId;

        var ediHandlers = func.edi;

        for (var x in ediHandlers){
          (function(x){

            var thisHandler = ediHandlers[x];
            var evtObj = { edi_evtName:x };
            inst[x] = function(){

              var argLabels = thisHandler.args.slice();
              var argArray = Array.prototype.slice.call(arguments);
              evtObj.edi_argArr = argArray.slice();
              evtObj.edi_argObj = {};
              var i = argLabels.length;
              while(i--){
                evtObj.edi_argObj[argLabels.pop()] = evtObj.edi_argArr[i];
              }

              inst.fire(evtObj);
            };
            handler = function(){ thisHandler.handler.apply(inst,arguments); }
            inst.on(x, handler);

          })(x);

        }

        return inst;
      };

      retFunc.edi_id = func.name;
      retFunc.parentNode = $edi;
      retFunc.fire = fire;
      retFunc.on = on;
      retFunc.off = off;

      return retFunc;
    }

    $edi.addFactory = ( function edi_addFactory(func){
      $edi[func.name] = wireEdiConstructor(func);
    } );

    function on(evtName,handler){ //or (evtObj) with edi_evtName property

      var that = this;
      var ediId = that.edi_id || false;
      if(ediId && typeof that !== 'function'){
        hReg.byId(ediId, evtName, setContext(handler));
      }
      else if( (typeof that === 'function') && (that.name !== $edi.name) ){
        hReg.byType(ediId, evtName, setContext(handler));
      }
      else if(that === $edi) {
        hReg.byEvent(evtName, setContext(handler));
      }

      function setContext(handler){
        return function(e){
          handler.apply(that, arguments);
        }
      }
    }

    function off(evtName){
      events.removeAllListeners(evtName);
    }

    function fire(){
      var args = Array.prototype.slice.call(arguments);
      var that = this;
      var evtObj, bubbler;

      if(typeof args[0] === 'string'){
        if(args[1] && typeof args[1] === 'object'){
            evtObj = args[1];
            evtObj.edi_evtName = args[0];
        }
        else {
          evtObj = { edi_evtName:args[0] }
        }
      }
      else if(typeof args[0] === 'object') {
        evtObj = args[0];
      }
      else {
        errors.noArg();
        return false;
      }
      switch(getType(that)){
        case 'id':
          evtObj.edi_targetType = 'id';
          evtObj.edi_id = this.edi_id;
          break;
        case 'type':
          evtObj.edi_targetType = 'type';
          evtObj.edi_id = this.edi_id;
          break;
        case 'event':
          evtObj.edi_targetType = 'event';
          evtObj.edi_id = false;
          break;
        default:
          //getType should catch an unsupported object
          break;
      }

      evtObj.edi_target = this;

      if(evtObj.edi_evtName) {
        events.emit('edi_event', evtObj);

        return true;
      }
      //else { return errors.noArg(); }
    }

    function getType(target){
      if(typeof target === 'function' && target.name === '$edi'){ return 'event'; }
      else if(typeof target === 'function') { return 'type'; }
      else if(target.edi_id){ return 'id' }
      else { throw new Error('not an edi object'); }
    }

    function Generic(obj){
      obj.on = on;
      obj.off = off;
      obj.fire = fire;

      /*var depotId = func.edi_constructorId = func.name || anonConstructorId();
      var anonElementId = ( function(){
        counter = 0;
        return (function anonElementId(){ return (depotId +'_'+counter++); });
      } )();
      var thisDepot = depot[depotId] = {};

      func.fire = func.prototype.fire = fire;
      func.on = func.prototype.on = on;
      func.off = func.prototype.off = off; */
    }

    function $edi(obj){

      return new Generic(obj);

    };

    return $edi;

  } )(); // /$edi-var


})();// /outer

/*
function TestObj(){

  TestObj.edi = {
    'someAction':{
      handler:function(e){
      },
      args:['arg1','arg2']
    },
    'otherAction':{
      handler:function(e){
      },
      args:['asdf']
    }
  }
}

$edi.addFactory(TestObj);

var obj = $edi.TestObj();

$edi.TestObj.on('someAction', function(e){ console.log('type 2'); } );

$edi.on('someAction', function(e){console.log('global 3');});

obj.on('someAction', function(e){console.log('component 1'); });

$edi.on('someAction', function(e){console.log('global 3b');});

obj.on('someAction', function(e){console.log('component 1b'); });


$edi.TestObj.on('someAction', function(e){ console.log('type 2b'); } );

obj.someAction(1,2);
//$edi.TestObj.on('someAction', function(){console.log('ew');});

*/