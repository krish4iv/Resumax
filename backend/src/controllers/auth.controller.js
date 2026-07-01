import { User } from "../models/index.js";

async function register(req, res) {
    const {firebase_uid, email, name} = req.body;

    if(!firebase_uid || !email || !name) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try{
        const findUser = await User.findOne({ where: { email } });
        if(findUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            firebase_uid,
            email,
            name
        });
        res.status(201).json({ message: 'User created', user });

    }catch(error){
        return res.status(500).json({ message: 'Internal server error' });
    }
   
}

async function login(req, res) {
  try {
    const { firebase_uid } = req.body
    if (!firebase_uid) return res.status(400).json({ message: 'Missing firebase_uid' })
    
    const user = await User.findOne({ where: { firebase_uid } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    
    res.status(200).json({ message: 'Login successful', user })
    
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

async function getMe(req, res) {
  try {
    res.json({ message: 'Me', user: req.user })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

export default {
    register,
    login,
    getMe
};