import { ObjectId } from 'mongodb';
import { client } from '../index.js';

export async function NewTask(data) {                //✔️
    return await client.db('taskhandler').collection('task').insertOne(data);
}

export async function EditTask({task,taskId}) {                //✔️
    return await client.db('taskhandler').collection('task').findOneAndUpdate({_id:new ObjectId(taskId)},{$set:{title:task.title,details:task.details,remainder:task.remainder,deadline:task.deadline, taskStatus: task.taskStatus}});
}

export async function DeleteTask(taskId) {                //✔️
    return await client.db('taskhandler').collection('task').deleteOne({_id: new ObjectId(taskId)});
}

export async function getAllTasks(userId) {                //✔️
    return await client.db('taskhandler').collection('task').find({userId:userId}).toArray();
}

export async function getEveryoneTasks() {                //✔️
    return await client.db('taskhandler').collection('task').find({}).toArray();
}

export async function TaskStatus(data) {                //✔️
    return await client.db('taskhandler').collection('task').findOneAndUpdate({taskId:data.taskId},{$set:{taskStatus:data.taskStatus}});
}
export async function getTaskById(taskId) {                //✔️
    return await client.db('taskhandler').collection('task').findOne({_id:new ObjectId(taskId)});
}

export async function LookupAllData() {                //✔️
    return await client.db('taskhandler').collection('task').aggregate(
        [
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: 'userId',
                as: 'user',
              }
            }
          ]
    )
}