const httpServer = require("http").createServer()
const mongoose = require("mongoose")
const Document = require("./Document")
mongoose.connect("mongodb+srv://thuan:rmk123456@cluster0.stpty.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
{
  useNewUrlParser: true, useUnifiedTopology: true ,
  useFindAndModify: false,
  useCreateIndex: true,
})
const PORT = process.env.PORT || 3001;

const io = require('socket.io')(PORT, {
    cors: {
      origin:  "https://blooming-lowlands-14678.herokuapp.com/",
      methods: ['GET', 'POST'],
    },
  })
  const defaultValue = ""
 

  io.on("connection",socket => {
    socket.on('get-document', async documentId =>
    {
      const document = await findOrCreateDocument(documentId)
      socket.join(documentId)
      socket.emit("load-document",document.data)
   
    socket.on("send-change",delta =>
    { 
      socket.broadcast.to(documentId).emit("receive-changes",delta)
    })
    socket.on("save-document",async data =>
    {
      await Document.findByIdAndUpdate(documentId,{data})
    })
  })
  })
  async  function findOrCreateDocument(id)
  {
    if(id == null)
    return
    const document = await Document.findById(id)
    if(document) return document
    return await Document.create({_id: id, data: defaultValue})
  }
