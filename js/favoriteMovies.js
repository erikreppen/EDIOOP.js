$edi.xhr = ( function xhr(httpType,url,callback){
  req.onreadystatechange = function(){
    console.log(req.readyState);
    if(req.readyState === 4){
      if(req.status === 200){
        callback(req.responseText);
      }
      else { console.log('error: ' + req.status); console.log(req.responseText); }
    }
  }

  req.open(httpType, url);
  req.send(null);
})

$edi.get = ( function edi_get(path,queryParams,callback){
  var req = new window.XMLHttpRequest();

  var qpArray = [];

  if(arguments.length === 2){
    var callback = queryParams;
    var queryParams = {};
  }

  for(var x in queryParams){
    qpArray.push(x + '=' + queryParams[x]);
  }
  
  if(qpArray.length){ qpArray = '?'+qpArray.join()}

  var url = domain + path + '?' + qpArray.join('&');

  $edi.xhr('GET', url, callback);
} );

$edi.get('/search/movie',{query:'gremlins'},function(e){ console.log( JSON.parse(e) ); } );

function Service(optionsIn){
  var options = {
    apiKey:'f48c213810bdb57c862939490c87e3c8',
    domain:'https://api.themoviedb.org/3'
  };
  var qp = {'api_key':options.apiKey};

  Service.edi = {

  }

}*/

function MovieSearch(){

  MovieSearch.edi = {
    'findMovies':{
      handler:function(e){
        $edi.get('/search/movies',{ 'query':e.query },
          function(e){
            var obj = JSON.parse(e);
            var trimmedObj = {
              title:true
            }
          }
        );
      },
      args:['query']
    },
    'moviesFound':{
      handler:function(e){

      },
      args:[response]
    }
  }
}