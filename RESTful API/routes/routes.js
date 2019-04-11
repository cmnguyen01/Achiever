/* CptS 489, Spring 2019
    Project: Task Tracker
    File: UserRoutes.js    */

'use strict';

module.exports = function (app) {
    var TMuser = require('../controllers/UserController')
    // var Task = require('../controllers/TaskController')

    app.route('/users')
        .post(TMuser.addUser)
        .put(TMuser.updateUser);

    app.route('/users/:userId')
        .get(TMuser.getUser)
        .delete(TMuser.deleteUser);

    // app.route('/tasks')
    //     .post(Task.addTask)
    //     .put(Task.updateTask);

    // app.route('/task/:_id')
    //     .get(Task.getTask)
    //     .delete(Task.deleteTask);
}