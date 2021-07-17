const client = require("./cilent.js")
const express = require("express")
const bodyParser = require("body-parser")
const { customAlphabet } = require("nanoid")

const app = express()
const nanoid = customAlphabet('1234567890', 9)
const port = process.env.port || 3333

app.use(bodyParser.json())
app.listen(port, () => {
    console.log("Server listening at port 3333")
})

client.connect()

app.get("/task", (req, res) => {
    client.query("select * from tasks where task_status= 'ACTIVE'", (err, result) => {
        if (!err) {
            if(result.rowCount>0){
                res.send(result.rows)
            }else{
                res.send("Currently no task is tracked")
            }        
        }else{
            console.log(`Error while getting currently tracked task: ${err}`)
        }
    })
    
})

app.post("/task", (req, res) => {
    checkActiveTask().then(() => {
        const task = req.body;
        let insertQuery = `insert into tasks (task_id, task_name, task_creation_time, task_status) values (${nanoid()}, '${task.name}', CURRENT_TIMESTAMP, 'ACTIVE')`   
    
        client.query(insertQuery, (err,result) => {
            if(!err){
                res.send("Task added succesfully")
                
            }else{
                console.log(`Error while adding new task: ${err}`)
                res.status(500).send(`Error while adding new task: ${err}`)
            }
        })
    })
})

function checkActiveTask(){
    return new Promise((resolve, reject) => {
        client.query("select * from tasks where task_status = 'ACTIVE'", (err, result) => {
            if (!err) {
                if(result.rowCount > 0){
                    client.query(`update tasks set task_status = 'FINISHED', task_finished_time = CURRENT_TIMESTAMP where task_status = 'ACTIVE'`)
                    resolve();
                }else{
                    resolve();
                }
            }else {
                console.log(`Error while checking currently tracked task: ${err}`)
                reject();
            }
         })
    })
}

app.patch("/stop", (req, res) => {
    client.query("select * from tasks where task_status = 'ACTIVE'", (err, result) => {
        if (!err) {
            if(result.rowCount > 0){
                client.query(`update tasks set task_status = 'FINISHED', task_finished_time = CURRENT_TIMESTAMP where task_status = 'ACTIVE'`)
                res.send("task stopped")
            }else{
                res.send("no task was tracked")
            }
        }else {
            console.log(`Error while checking currently tracked task: ${err}`)
        }
     })
})