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
        console.error('Error registering user:', error)
        return res.status(500).json({ message: 'Internal server error', error: error.message });
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
    const user = await User.findOne({ where: { firebase_uid: req.user.uid } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    
    res.status(200).json({ message: 'Me', user })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

async function updateProfile (req, res) {
  try {
    const {
      location, preferred_role, skills, target_companies, industries, comp_floor,
      onboarding_goal, onboarding_situation, experience_level, craft,
      work_mode, open_to_relocate, work_authorization,
      search_status, biggest_blocker, weekly_time_commitment, github_username,
    } = req.body

    const user = await User.findOne({ where: { firebase_uid: req.user.uid } })
    if (!user) return res.status(404).json({ message: 'User not found' })

    await user.update({
      ...(location !== undefined && { location }),
      ...(preferred_role !== undefined && { preferred_role }),
      ...(skills !== undefined && { skills }),
      ...(target_companies !== undefined && { target_companies }),
      ...(industries !== undefined && { industries }),
      ...(comp_floor !== undefined && { comp_floor }),
      ...(onboarding_goal !== undefined && { onboarding_goal }),
      ...(onboarding_situation !== undefined && { onboarding_situation }),
      ...(experience_level !== undefined && { experience_level }),
      ...(craft !== undefined && { craft }),
      ...(work_mode !== undefined && { work_mode }),
      ...(open_to_relocate !== undefined && { open_to_relocate }),
      ...(work_authorization !== undefined && { work_authorization }),
      ...(search_status !== undefined && { search_status }),
      ...(biggest_blocker !== undefined && { biggest_blocker }),
      ...(weekly_time_commitment !== undefined && { weekly_time_commitment }),
      ...(github_username !== undefined && { github_username }),
    })
    
    res.status(200).json({ message: 'Profile updated', user })
  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

async function completeOnboarding(req, res) {
  try {
    const {
      onboarding_goal, onboarding_situation, experience_level, craft,
      skills, target_companies, location, industries, comp_floor,
      work_mode, open_to_relocate, work_authorization,
      search_status, biggest_blocker, weekly_time_commitment, github_username,
    } = req.body

    const user = await User.findOne({ where: { firebase_uid: req.user.uid } })
    if (!user) return res.status(404).json({ message: 'User not found' })

    await user.update({
      ...(onboarding_goal !== undefined && { onboarding_goal }),
      ...(onboarding_situation !== undefined && { onboarding_situation }),
      ...(experience_level !== undefined && { experience_level }),
      ...(craft !== undefined && { craft }),
      ...(skills !== undefined && { skills }),
      ...(target_companies !== undefined && { target_companies }),
      ...(location !== undefined && { location }),
      ...(industries !== undefined && { industries }),
      ...(comp_floor !== undefined && { comp_floor }),
      ...(work_mode !== undefined && { work_mode }),
      ...(open_to_relocate !== undefined && { open_to_relocate }),
      ...(work_authorization !== undefined && { work_authorization }),
      ...(search_status !== undefined && { search_status }),
      ...(biggest_blocker !== undefined && { biggest_blocker }),
      ...(weekly_time_commitment !== undefined && { weekly_time_commitment }),
      ...(github_username !== undefined && { github_username }),
      onboarding_completed: true,
    })

    res.status(200).json({ message: 'Onboarding complete', user })
  } catch (error) {
    console.error('Error completing onboarding:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export default {
    register,
    login,
    getMe,
    updateProfile,
    completeOnboarding
};