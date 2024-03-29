import express from 'express';
import { client } from '../index.js';
const router = express.Router();
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import * as dotenv from 'dotenv'
import { getUserById, } from "../services/user.services.js";
dotenv.config();
import nodemailer from "nodemailer";
import {auth} from '../middleware/auth.js';
import { EditTask, LookupAllData, NewTask, getAllTasks, getEveryoneTasks, getTaskById } from '../services/task.services.js';
import schedule from 'node-schedule';


export const defaultFunc = async() => {

const functiond = async (r) => {
  console.log(r)
 let d = await r.remainder.split(/[.:T\-=/_]/).reverse()
 d.splice(0,1)
 console.log(d,r.user[0].email,"d here")

  const job = schedule.scheduleJob(`${d[0]} ${d[1]} ${d[2]} ${d[3]} ${d[4]} *`, ()=>{
    // console.log('The answer to life, the universe, and everything!', d, r.title);
    if(r.user[0].email){
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      var mailOptions = {
        from:process.env.EMAIL,
        to:r.user[0].email,
        subject:"Remainder mail",
        text:`This is your remainder for task ${r.title} and the deadline is ${r.deadline}`
      }
      transporter.sendMail(mailOptions,(error,info) => {
        if(error){
          response.status(401).send({msg:"Email Not Send"})
          console.log(error,"error")
        }else{
          response.status(201).send({msg:"Email Sent Successfully"})
          console.log("remainder sent successfully")
        }
      })
    }
  });
}
  // const allTasks = await getEveryoneTasks()
  const allData = await client.db('taskhandler').collection('task').aggregate(
    [
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "userId",
            as: "user",
          }
        }
      ]
).toArray()

  console.log(allData[0].user[0].email)
    allData.map((m)=>(
    functiond(m)
    ))
}

router.get('/all/:userId', async function(request, response){     //✔️ works
    const { userId } = request.params;
    console.log(userId);

    const userFromDb = await getUserById(userId);

    if(!userFromDb){
      response.status(400).send({msg:"User doesnot exist"})
    }else{
      const result = await getAllTasks(userId)
      console.log(result)
      response.status(200).send({data:result})
    }
  })

router.post('/new/:userId', async function(request, response){     //✔️
    const {title, details, deadline, taskStatus, remainder} = request.body; 
    const { userId } = request.params;
    console.log(request.body);

    const userFromDb = await getUserById(userId);

    if(!userFromDb){
      response.status(400).send({msg:"User doesnot exist"})
    }else{
      const result = await NewTask({
        title:title,
        details:details,
        deadline: deadline,
        taskStatus:taskStatus,
        remainder:remainder,
        userId: userId
      });
      response.status(200).send({msg:"Task created",data:result})
    }
  })
  
router.put('/edit/:userId/:taskId', async function(request, response){     //✔️
    const {title, details, deadline, taskStatus, remainder} = request.body; 
    const { userId, taskId } = request.params;
    console.log(request.body);
try{
  const userFromDb = await getUserById(userId);
  const taskfromdb = await getTaskById(taskId)
  console.log(userFromDb,taskfromdb,"before process")

  if(!userFromDb || !taskfromdb){
    response.status(400).send({msg:"User or task doesnot exist"})
  }else{
    const task = {
      title:title,
      details:details,
      deadline: deadline,
      taskStatus:taskStatus,
      remainder:remainder,
      userId: userId
    }
    console.log("task",task)
    const result = await EditTask({task,taskId});
    console.log("result",result)
    response.status(200).send({msg:"Task edited",data:result})
  }
}catch(err){
  response.status(400).send({msg:"Server side error"})
}
    
  })

  router.put('/delete/:userId/:taskId', async function(request, response){     //✔️
    const { userId, taskId } = request.params;
    const taskfromdb = await getTaskById(taskId)
    if(!taskfromdb){
      response.status(400).send({msg:"User doesnot exist"})
    }else{
      const result = await DeleteTask(taskId)

      response.status(200).send({msg:"Task deleted"})
    }
  })

  router.post('/remainder/:userId/:taskId', async function(request, response){     //✔️
    const { userId, taskId } = request.params;
    const taskfromdb = await getTaskById(taskId)
    const userFromDb = await getUserById(userId); 

    if(!taskfromdb || !userFromDb){
      response.status(400).send({msg:"User doesnot exist"})
    }else{  
            const token = jwt.sign({id:userFromDb._id},process.env.SECRET_KEY,
            //   {
            //   expiresIn:120000
            // }
            ); // continue from here
  
            const setuserToken = await client.db('taskhandler').collection('task').findOneAndUpdate({userId:userFromDb.userId},{ $set:{verifyToken:token}},{returnDocument:"after"}); 
            if(setuserToken){
              var transporter = await nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: process.env.EMAIL,
                  pass: process.env.EMAIL_PASSWORD
                }
              });
              var mailOptions = {
                from:process.env.EMAIL,
                to:userFromDb.email,
                subject:"Task remainder email",
                text:`This is a remainder mail for this task. Vist this Link of the task which will be valid only once - http://localhost:3000/taskremainder/${email}/${setuserToken.value.verifyToken}`
              }
              transporter.sendMail(mailOptions,(error,info) => {
                if(error){
                  response.status(401).send({msg:"Email Not Send"})
                }else{
                  response.status(201).send({msg:"Remainder Email Sent Successfully"})
                }
              })
            }
        }
  })

  router.put('/status/:userId/:taskId', async function(request, response){     //✔️
    const {taskStatus} = request.body;
    const { userId, taskId } = request.params;
    const taskfromdb = await getTaskById(taskId)
    if(!taskfromdb){
      response.status(400).send({msg:"User doesnot exist"})
    }else{
      const result = await TaskStatus({
        taskId: taskId,
        taskStatus: taskStatus
    })

      response.status(200).send({msg: taskStatus})
    }
  })

  export default router ;