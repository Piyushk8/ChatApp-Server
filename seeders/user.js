import {faker} from "@faker-js/faker"
import {User} from "../models/user.js"

const createUser = async(numusers)=>{
    try{
        const UsersPromise = [];
        for (let i=0;i<numusers;i++){
            const tempUser= User.create({
                    name:faker.person.fullName,
                    username:faker.internet.userName(),
                    password:"password",
                    avatar:{
                        url:faker.image.avatar(),
                        public_id:faker.system.fileName()
                    }
            })
            UsersPromise.push(tempUser)
        }
        await Promise.all(UsersPromise)
        console.log("users created ",numusers);
        process.exit(1);
    }catch(error){
        console.log(error);
        process.exit(1)
    }
};

export{createUser}