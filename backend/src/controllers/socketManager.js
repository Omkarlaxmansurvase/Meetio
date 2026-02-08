import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
    const io = new Server(server);


    io.on("connection", (socket) => {

        // Handle joining a call
        socket.on("join-call",(path)=>{

            if(connections[path]===undefined){
                connections[path]=[];

            }
            connections[path].push(socket.id);
            timeOnline[socket.id]= new Date();

            for(let a = 0; a<connections[path].length; i++){
                io.to(connection[path][a]).emmit("user-joined",socket.id,connections[path]);
            }
            if(messages[path]!==undefined){
                for(let a=0; a<messages[path].length;++a){
                    io.to(socket.id).emmit("chat-message",messages[path][a]['data'],
                    messages[path][a]['sender'],messages[path][a]['socket-id-sender']
                    );
                }
            }

        })

        // Handle incoming signals
        socket.on("signal",(toId,message)=>{
            io.to(toId).emit("signal",socket.id,message);
        })

        // Handle chat messages
        socket.on("chat-message",(data,sender)=>{
            
        })

        // Handle disconnection
        socket.on("disconnect",()=>{

        });
    });

    return io;
}