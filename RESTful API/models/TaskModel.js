/* CptS 489, Spring 2019
    Project: Task Tracker
    File: UserModel.js    */

'user strict';

var ObjectId = require('mongodb').ObjectId;
var Task = require('../../Constructors.js').Task;

/*
  ResultObj constructor function. Since we need to create a different return object for many different possible scenarios, all this functionality
  can be put in one function.
    
  The most common parameters are closer to the start of the list while the ones that rarely get called are towards the end.
*/
function ResultObj(statusMsg = "", statusObj = null, success = false, id = null, data = null) { //what will be returned to the requester when the function completes
  var returnObj = {
    objId: id,
    success: success,
    statusMsg: statusMsg,
    statusObj: statusObj,
    data: data,
  };
  return returnObj;
}

/*
  add a task to the task database
  if the task can't be added then just return an err message
*/
Task.addTask = function (tasksDB, taskName, result) {
  var resultObj;
  tasksDB.insertOne(taskName, function (err, res) {
    if (err) { //Unkown error, return to client and display it in the log.
      resultObj = ResultObj("Error when adding new Task to database", err);
      console.log(resultObj.statusMsg + ": " + JSON.stringify(err));
      result(resultObj);
    } else {
      resultObj = ResultObj("Added task " + taskName.title, null, true, taskName._id, taskName);
      result(resultObj);
    }
  });
}

/*
  get a single task 
  if the task is not available then the return an err message,else return the task informationto
*/
Task.getTask = function (tasksDB, taskId, result) {
  var resultObj, id;
  if (taskId == "default") { // If the id is 'default' then we cannot create an ObjectId with it and mus tjust pass it as a string.
    id = taskId;
  } else {
    id = new ObjectId(taskId);
  }
  tasksDB.find({
    _id: id
  }).toArray(function (err, res) {
    if (err) {
      resultObj = ResultObj("Error when adding task to database", err);
      console.log(resultObj.statusMsg + ": " + JSON.stringify(err));
      result(resultObj);
    } else if (res.length == 1) {
      resultObj = ResultObj("Task retrieved", null, true, res[0]._id, res[0]);
      result(resultObj);
    } else {
      resultObj = ResultObj("Task not found");
      result(resultObj);
    }
  });
}

//get all tasks for a specific user
Task.getTasks = function (tasksDB, userId, result) {
  var resultObj;
  tasksDB.find({
    owner: userId
  }).toArray(function (err, res) {
    if (err) {
      resultObj = ResultObj("Error when adding task to database", err);
      console.log(resultObj.statusMsg + ": " + JSON.stringify(err));
      result(resultObj);
    } else {
      resultObj = ResultObj("Task retrieved", null, true, userId, res);
      result(resultObj);
    }
  });
}

// TODO: Implement U and D in milestone 3
/*update the task for several cases
-name
-category
-priority
-subtask
-timeblock?*/
Task.updateTask = function (tasksDB, newTask, result) {
  var resultObj;
  tasksDB.find({
    _id: new ObjectId(newTask._id)
  }).toArray(function (err, res) {
    if (err) { //Unkown error, return to client and display it in the log.
      resultObj = ResultObj("Error when checking if user with id " + taskId + " exists in database.", err);
      console.log(resultObj.statusMsg + ": " + JSON.stringify(err));
      result(resultObj);
    } else if (res.length == 0) { //no user with id userId, tell the updater and log it
      resultObj = ResultObj("Task not in database. ID:" + taskId._Id);
      console.log(resultObj.statusMsg);
      result(resultObj);
    } else {
      if (newTask.name != null) {
        updateTaskName(tasksDB, newTask, result).then(function (res) {
          result(res);
        })
      }
      if (newTask.category != null) {
        updateTaskCategory(tasksDB, newTask, result).then(function (res) {
          result(res);
        })
      }
      if (newTask.priority != null) {
        updateTaskPriority(tasksDB, newTask, result).then(function (res) {
          result(res);
        })
      }
      if (newTask.timeBlocks.length > 0) {
        updateTaskTB(tasksDB, newTask, result).then(function (res) {
          result(res);
        })
      }
      if (newTask.subTasks.length > 0) {
        updatesubTask(tasksDB, newTask, result).then(function (res) {
          result(res);
        })
      }
    }
  })
}
//update the task name
async function updateTaskName(tasksDB, newTask, result) {
  return new Promise(function (resolve) {
    tasksDB.updateOne({
      _id: new ObjectId(newTask._id)
    }, {
      $set: {
        'name': newTask.name
      },
      function (err) {
        if (err) {
          resultObj = ResultObj("Error when attempting to change name!", err);
          console.log(resultObj.statusMsg + ": " + err);
          resolve(resultObj);
        } else {
          resultObj = ResultObj("Name changed to " + newTask.name, null, true);
          resolve(resultObj);
        }
      }
    })

  })
}
//update category
async function updateTaskCategory(tasksDB, newTask, result) {
  return new Promise(function (resolve) {
    tasksDB.updateOne({
      _id: new ObjectId(newTask._id)
    }, {
      $set: {
        'category': newTask.category
      },
      function (err) {
        if (err) {
          resultObj = ResultObj("Error when attempting to change name!", err);
          console.log(resultObj.statusMsg + ": " + err);
          resolve(resultObj);
        } else {
          resultObj = ResultObj("category changed to " + newTask.category, null, true);
          resolve(resultObj);
        }
      }
    })

  })
}
//update the priorty
async function updateTaskPriority(tasksDB, newTask, result) {
  return new Promise(function (resolve) {
    tasksDB.updateOne({
      _id: new ObjectId(newTask._id)
    }, {
      $set: {
        'priority': newTask.priority
      },
      function (err) {
        if (err) {
          resultObj = ResultObj("Error when attempting to change name!", err);
          console.log(resultObj.statusMsg + ": " + err);
          resolve(resultObj);
        } else {
          resultObj = ResultObj("priority changed to " + newTask.priority, null, true);
          resolve(resultObj);
        }
      }
    })

  })
}
//update the timeblock debating whether or not timeblocks would need a table of its own
async function updateTaskTB(tasksDB, newTask, result) {
  return new Promise(function (resolve) {

  })
}
//update the subtask
async function updatesubTask(tasksDB, newTask, result) {
  return new Promise(function (resolve) {
    tasksDB.find({
      _id: new ObjectId(newTask._id),
      subTasks: {
        $elemMatch: {
          //what goes in here? 
          //subTasks
          subTasks: newTask.subTasks
        }
      }
    }).toArray(function (err, res) {
      if (err) {
        resultObj = ResultObj("Error when locating subtask", err);
        console.log(resultObj.statusMsg + ": " + err);
        resolve(statusObj);
      } else if (res.length == 0) {
        tasksDB.updateOne({
          _id: new ObjectId(newTask._id)
        }, {
          $push: {
            subTasks: {
              $each: newTask.subTasks
            }
          },
        }, function (err2) {
          if (err2) { //Unkown error, return to client and display it in the log.
            resultObj = ResultObj("Error when attempting to save task ID: " + newTask.subTasks + " for task " + newTask.name, err2);
            console.log(resultObj.statusMsg + ": " + err2);
            resolve(resultObj);
          } else { //Task was added successfully!
            resultObj = ResultObj("Task saved as template for user " + newTask.name, null, true);
            resolve(resultObj);
          }
        })
      }
    })
  })

}




// TODO: Implement U and D in milestone 3 
/*delete a task from the task db*/
Task.deleteTask = function (tasksDB, taskId, result) {
  var resultObj;
  tasksDB.find({
    _id: new ObjectId(taskId)
  }).toArray(function (err) {
    if (err) {
      resultObj = ResultObj("Error when attempting to delete task!", err);
      console.log(resultObj.statusMsg + ": " + err);
      resolve(resultObj);
    } else {
      tasksDB.deleteOne({
        _id: new ObjectId(taskId)
      }).toArray(function (err2) {
        if (err2) {
          resultObj = ResultObj("Error when attempting to delete task!", err);
          console.log(resultObj.statusMsg + ": " + err);
          resolve(resultObj);
        } else {
          resultObj = ResultObj("user with" + taskId.name + "deleted");
          resultObj(resultObj);
        }
      })
    }
  })
}

module.exports = Task;