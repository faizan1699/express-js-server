import bcrypt from 'bcrypt';
import Users from '../models/users/users-modal.js';

const createUser = async (req, res) => {

    try {

        const {name, email, password} = req.body;

        const existingUser = await Users.findOne({email});
        if(existingUser) {
            return res.status(200).json({
                message: 'User already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new Users({
            name,
            email,
            password: hashedPassword
        })

        await newUser.save();

        res.status(201).json({
            message: 'User created successfully and please verify your email',
            user: newUser
        });

    }
    catch (error) {
        res.status(500).json({
            message: 'Error creating user',
            error: error.message
        });
    }

}

export {createUser}