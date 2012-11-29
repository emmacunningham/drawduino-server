define(['kickstart'], function (kickstart) {
  var kickstart = kickstart.withConfig({'name': 'localhost', 'port': 8080, 'path': './'});
  var srv = kickstart.srv();

  // Catch request for serving home page
  srv.all('/', function(req, res) {
    res.render('index', { script : 'index' } );
  });

  srv.all('/about', function(req, res) {
    res.render('about');
  });

  return {'kickstart': kickstart, 'srv': srv};
});