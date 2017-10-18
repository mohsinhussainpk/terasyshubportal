var request = require('request');
var jwt = require('jsonwebtoken');

module.exports = function(router){

    router.route('/')
        .get(function(req, res){

            if(!req.session['token']){

                res.redirect('/login');

            }else{

                var token = req.session['token'];

                request.get('https://www.terasyshub.io/api/v1/user', {
                    headers:{'Authorization': 'JWT '+token}
                }, function(err, response, user){

                    request.get('https://www.terasyshub.io/api/v1/devices', {
                        headers:{'Authorization': 'JWT '+token}
                    }, function(err, response, devices) {

                        if(user && typeof(user) != 'undefined')
                            user = JSON.parse(user);
                        else
                            user = 'None';
                        devices = JSON.parse(devices);
                        console.log(token);

                        if (!err) {

                            res.render('demo', {user: user, devices:devices, token:token});

                        } else {
                            req.session['token'] = null;
                            res.redirect('/login');
                        }

                    });

                });
            }

        });

    router.route('/login')
        .get(function(req, res){

            if(!req.session['token']){

                res.render('login')

            }else{

                var token = req.session['token'];

                request.get('https://www.terasyshub.io/api/v1/user', {
                    headers:{'Authorization': 'JWT '+token}
                }, function(err, response, body){

                    if(!err){
                        res.redirect('/');
                    }else{
                        req.session['token'] = null;
                        res.render('/login');
                    }

                });
            }

        })

        .post(function(req, res){

            var errors = [];

            if(!req.body.email)
                errors.push('Please provide email address');

            if(!req.body.key)
                errors.push('Please provide password');

            if(errors.length)
                return res.render('login', {errors:errors});

            var data = {
                email: req.body.email.trim(),
                pass: req.body.key
            };

            request.post('https://www.terasyshub.io/api/v1/login', {
                body:data,
                json:true
            }, function(err, response, body){

                var token = body.trim();

                jwt.verify(token, config.secret, function(err, data){

                    if(err){
                        console.log(err);
                        res.render('login', {errors:['Invalid login details.']})
                    }else{
                        console.log(data);
                        req.session['token'] = token;
                        res.redirect('/')
                    }

                });

            })

        });

    router.route('/logout')
        .post(function(req, res){
            req.session['token'] = null;
            res.redirect('/login');
        })

};