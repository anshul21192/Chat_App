let users=[];

const addUser = ({id,username,room})=>{
    
    
    if(!username || !room){
        return {
            error:"username and room required",
        }
    }
    // Validate the data
    
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Check for existing user

    const existingUser = users.find((user)=>{
        return user.room === room && user.username===username;
    });

    // Validate Username

    if(existingUser){
        return{
            error:'Username is in use'
        }
    }

    // Store user

    
    const user = {
        id,username,room
    };
    
    users.push(user);

    // console.log(users);

    return {user};
}

const removeUser = (id)=>{
    const index = users.findIndex((user) => user.id === id);

    if(index!=-1){
        const user=users.splice(index,1);
        return user[0];
    }
}

const getUser=(id)=>{
    const index = users.findIndex((user)=> user.id===id);

    if(index!=-1) return users[index];
    return undefined;
}

const getUsersInRoom = (room)=>{
    const usersInRoom = users.filter((user)=> user.room===room);
    return usersInRoom;
}

module.exports={
    getUsersInRoom,
    getUser,
    addUser,
    removeUser
}