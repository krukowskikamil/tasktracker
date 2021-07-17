const http = require('http');

http.get('http://localhost:3333/task', (res) => {
    console.log(res.statusCode)
})