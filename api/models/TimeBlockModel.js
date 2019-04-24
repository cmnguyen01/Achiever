/* CptS 489, Spring 2019
    Project: Task Tracker
    File: timeBlockModel.js    */

'use strict';

var ObjectId = require('mongodb').ObjectId;

/**
 * Timeblock class which represents when a user schedules a task to be done at a certain block of time.
 * Currently, a TimeBlock consists of the following properties:
 - _id: Unique ID generated by MongoDB that differentiates timeblocks.
 - task: Task ID that the timeblock is scheduled for.
 - owner: user ID that the timeblock is created by and for.
 - day: ISOString formatted Date object that stores the day the timeblock is scheduled for.
 - startDate: The start time of the timeblock formatted as an ISOString
 - endDate: The end time of the timeblock formatted as an ISOString
 */
class TimeBlock {
    /**
     * Creates a new timeblock object.
     * Can take an object and convert it into a timeblock
     * @param {Object} timeBlock: Object that will be converted into a TimeBlock Object.
     */
    constructor(timeBlock) {
        this._id = timeBlock._id == null ? null : timeBlock._id;
        this.task = timeBlock.task == null ? null : timeBlock.task;
        this.owner = timeBlock.owner == null ? null : timeBlock.owner;
        this.day = timeBlock.day == null ? new Date().toISOString().split("T")[0] : timeBlock.day; //if there is no day, then use today. makes a new date and then splits on "T" which should give only month, day, and year
        this.startDate = timeBlock.startDate == null ? new Date().toISOString() : timeBlock.startDate;
        this.endDate = timeBlock.endDate == null ? new Date().toISOString() : timeBlock.endDate;
        // this.title = timeBlock.title == null ? null : timeBlock.title;
    }

    /**
     * Inserts a timeblock to the database
     * If no timeBlock is found, there is no data retuned and a statusMsg with the reason why there was an error.
     * @param {Collection} timeBlockDB: MongoDB collection that this function will be ran on.
     * @param {TimeBlock} newTimeBlock: TimeBlock that you want to add to the server.
     * @param {function} result: Function to call for the server response
     */
    static addTimeBlock(timeBlockDB, newTimeBlock, result) {
        var resultObj;
        timeBlockDB.insertOne(newTimeBlock, function (err, res) {
            if (err) { //Unkown error, return to client and display it in the log.
                resultObj = ResultObj("Error when adding timeBlock to database", err);
                console.log(resultObj.statusMsg + ": " + JSON.stringify(err));
                result(resultObj);
            } else { //timeBlock was added to the database.
                resultObj = ResultObj("Added timeBlock ", null, true, newTimeBlock._id, newTimeBlock);
                console.log(resultObj)
                result(resultObj);
            }
        });
    }

    /**
     * Gets a single timeblock with its _id as the key
     * If no timeBlock is found, there is no data retuned and a statusMsg with the reason why there was an error.
     * @param {Collection} timeBlockDB: MongoDB collection that this function will be ran on.
     * @param {TimeBlock} querytimeBlock: Object that contains the day and ownerID of the timeblocks that we want to retrieve
     * @param {function} result: Function to call for the server response
     */
    static getTimeBlock(timeBlockDB, querytimeBlock, result) {
        var resultObj;
        timeBlockDB.find({
            task: querytimeBlock.task,
            startDate: querytimeBlock.startDate
        }).toArray(function (err, res) {
            if (err) {
                resultObj = ResultObj("Error when adding timeBlock to database", err);
                console.log(resultObj.statusMsg + ": " + JSON.stringify(err));
                result(resultObj);
            } else if (res.length == 1) {
                resultObj = ResultObj("timeBlock retrieved", null, true, res[0]._id, res[0]);
                result(resultObj);
            } else {
                resultObj = ResultObj("timeBlock not found");
                result(resultObj);
            }
        });
    }

    /**
     * Gets all timeblocks from the server for a user on a certain day.
     * @param {Collection} timeBlockDB: MongoDB collection that this function will be ran on.
     * @param {TimeBlock} querytimeBlock: Object that contains the day and ownerID of the timeblocks that we want to retrieve
     * @param {function} result: Function to call for the server response
     */
    static getTimeBlocks(timeBlockDB, querytimeBlock, result) {
        var resultObj;
        timeBlockDB.find({
            day: querytimeBlock.day,
            owner: querytimeBlock.owner
        }).toArray(function (err, res) {
            if (err) {
                resultObj = ResultObj("Error when searching for timeblocks for user " + userId, err);
                console.log(resultObj.statusMsg + ": " + JSON.stringify(err));
                result(resultObj);
            } else {
                resultObj = ResultObj("timeblocks retrieved", null, true, querytimeBlock.day, res);
                result(resultObj);
            }
        });
    }

    /**
     * Updates a start and end time for a time block
     * @param {Collection} timeBlockDB: MongoDB collection that this function will be ran on.
     * @param {TimeBlock} newTimeBlock: Timeblock object that will be updated on the server side.
     * @param {function} result: Function to call for the server response
     */
    static updateTimeBlock(timeBlockDB, newTimeBlock, result) {
        var resultObj;
        timeBlockDB.find({
            _id: new ObjectId(newTimeBlock._id)
        }).toArray(function (err, res) {
            if (err) { //Unkown error, return to client and display it in the log.
                resultObj = ResultObj("Error when checking if timeBlock is available.", err);
                console.log(resultObj.statusMsg + ": " + JSON.stringify(err));
                result(resultObj);
            } else if (res.length == 0) { //no timeBlock with id timeBlockId, tell the updater and log it
                resultObj = ResultObj("timeBlock is not available");
                console.log(resultObj.statusMsg);
                result(resultObj);
            } else { //timeBlock is in the database!
                updateDate(timeBlockDB, newTimeBlock, resultObj).then(result); //change these to things we need later
            }
        });
    }

    /**
     * Deletes a timeblock from the database using the taskID and startDate as a key.
     * @param {Collection} timeBlockDB: MongoDB collection that this function will be ran on.
     * @param {TimeBlock} querytimeBlock: Timeblock object that will be used to locate the one to delete.
     * @param {function} result: Function to call for the server response
     */
    static deleteTimeBlock(timeBlockDB, querytimeBlock, result) {
        var resultObj;
        timeBlockDB.find({
            task: querytimeBlock.task,
            startDate: querytimeBlock.startDate
        }).toArray(function (err, res) {
            if (err) {
                resultObj = ResultObj("Error when deleting timeBlock", err);
                console.log(resultObj.statusMsg + ": " + JSON.stringify(err));
                result(resultObj);
            } else {
                timeBlockDB.deleteOne({
                    task: querytimeBlock.task,
                    startDate: querytimeBlock.startDate
                }, function (err2) {
                    if (err2) {
                        resultObj = ResultObj("Error when deleting timeblock", err2);
                        console.log(resultObj.statusMsg + ": " + JSON.stringify(err2));
                        result(resultObj);
                    } else {
                        resultObj = ResultObj("timeBlock was deleted", null, true, null, null);
                        result(resultObj);
                    }
                });
            }
        });
    }
}

////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////// General Use Functions /////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Constructor function for a result Object. Allows fast creation of a return object for an API response.
 * 
 * ResultObj constructor function. Since we need to create a different return object for many different possible scenarios, all this functionality
  can be put in one function.

  The most common parameters are closer to the start of the list while the ones that rarely get called are towards the end.
 * @param {string} statusMsg: Message that gives more detail on the result of the call.
 * @param {Object} statusObj: Object containing details about errors if there is an error
 * @param {boolean} success: Status of the API call
 * @param {string} id: ID of the object affected
 * @param {Object} data: data that can be read from the reciever
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

/**
 * Updates the start and end date of a timeblock.
 * @param {Collection} timeBlockDB: MongoDB collection that this function will be ran on.
 * @param {TimeBlock} newTimeBlock: Timeblock object to update.
 * @param {ResultObj} resultObj: JSON object that contains the server response
 */
async function updateDate(timeBlockDB, newTimeBlock, resultObj) {
    return new Promise(function (resolve) {
        timeBlockDB.updateOne({ //find the timeBlock to update
                _id: new ObjectId(newTimeBlock._id)
            }, { //update its data with:
                $set: {
                    'startDate': newTimeBlock.startDate,
                    'endDate': newTimeBlock.endDate
                }
            },
            function (err) {
                if (err) { //Unkown error, return to client and display it in the log.
                    resultObj = ResultObj("Error when attempting to update timeblock!", err);
                    console.log(resultObj.statusMsg + ": " + err);
                    resolve(resultObj);
                } else { //hole updated successfully!
                    resultObj = ResultObj("start date changed to " + newTimeBlock.startDate, null, true, null, newTimeBlock);
                    resolve(resultObj);
                }
            });
    });
}

module.exports = {
    TimeBlock,
    ResultObj
};