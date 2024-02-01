import { client } from '../index.js';

export async function NewTask(data) {                //✔️
    return await client.db('taskhandler').collection('task').insertOne(data);
}

export async function EditTask({task}) {                //✔️
    return await client.db('taskhandler').collection('task').findOneAndUpdate({taskId: task.taskId},{$set:{title:task.title,details:task.details,remainder:task.remainder,deadline:task.deadline, taskStatus: task.taskStatus}});
}

export async function DeleteTask(taskId) {                //✔️
    return await client.db('taskhandler').collection('task').deleteOne(taskId);
}

export async function getAllTasks(userId) {                //✔️
    return await client.db('taskhandler').collection('task').find({userId:userId});
}

export async function TaskStatus(data) {                //✔️
    return await client.db('taskhandler').collection('task').findOneAndUpdate({taskId:data.taskId},{$set:{taskStatus:data.taskStatus}});
}