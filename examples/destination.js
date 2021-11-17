const express = require('express')
const app = express()
const port = 3001

app.use(express.json());

app.post('/', (req, res) => {
    console.log(req.body);
    res.sendStatus(202)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});