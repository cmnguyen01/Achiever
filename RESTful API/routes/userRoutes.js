/* CptS 489, Spring 2019
    Project: Task Tracker
    File: UserRoutes.js    */

    'use strict';

    module.exports=function(app)
    {
        var TTuser=require('../controllers/UserController')

        app.route('/users')
        .post(TTuser.addUser)
        .get(TTuser.getUser);
    }