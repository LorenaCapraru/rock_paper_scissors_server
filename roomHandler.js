const shortId = require("shortid");

const roomHandler = (io, socket, rooms) => {
  const create = (payload, callback) => {
    console.log(payload.type);
    if (payload.type === "stranger" || payload.type === "friend") {
      const index = rooms.findIndex(
        (room) => room.vacant === true && room.private === false
      );
      if (index >= 0) {
        const room = rooms[index];
        room.players[socket.id] = {
          option: null,
          optionLock: false,
          score: 0,
          name: "",
        };
        room.vacant = false;
        socket.join(room.roomId);
        io.to(room.roomId).emit("room:get", room);
        callback(null, room.roomId);
        console.log(room.roomId + " room id");
      } else {
        const room = {
          roomId: shortId.generate(),
          players: {
            [socket.id]: {
              option: null,
              optionLock: false,
              score: 0,
              name: "",
            },
          },
          vacant: true,
          private: false,
          type: payload.type,
        };
        rooms.push(room);
        socket.join(room.roomId);
        io.to(room.roomId).emit("room:get", room);
        callback(null, room.roomId);
        console.log(room.roomId + " room id");
      }
    } else {
      const room = {
        roomId: shortId.generate(),
        players: {
          [socket.id]: {
            option: null,
            optionLock: false,
            score: 0,
            name: "",
          },
        },
        vacant: true,
        private: true,
        type: payload.type,
      };
      rooms.push(room);
      socket.join(room.roomId);
      io.to(room.roomId).emit("room:get", room);
      callback(null, room.roomId);
      console.log(room.roomId + " room id");
    }
  };

  const join = (payload, callback) => {
    const index = rooms.findIndex((room) => room.roomId === payload.roomId);
    if (index >= 0) {
      const room = rooms[index];
      if (room.players[socket.id]) return callback(null);

      if (room.vacant && room.private) {
        room.players[socket.id] = {
          option: null,
          optionLock: false,
          score: 0,
          name: "",
        };
        room.vacant = false;
        rooms.push(room);
        socket.join(room.roomId);
        io.to(room.roomId).emit("room:get", room);
        callback(null, room);
      } else {
        callback({ error: true });
      }
    } else {
      callback({ error: true });
    }
  };

  const update = (payload) => {
    const index = rooms.findIndex((room) => room.roomId === payload.roomId);
    if (index >= 0) {
      rooms[index] = payload;
      io.to(payload.roomId).emit("room:get", payload);
    }
  };

  socket.on("room:create", create);
  socket.on("room:join", join);
  socket.on("room:update", update);
};

module.exports = roomHandler;
