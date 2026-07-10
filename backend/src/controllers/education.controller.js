import { Education } from '../models/index.js'

async function createEducation(req, res){
    try {
        const {school, degree, field, start_date, end_date} = req.body
        const user_id = req.user.uid
        const education = await Education.create({
            school,
            degree,
            field,
            start_date,
            end_date,
            user_id
        })
        res.status(201).json(education)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

async function getEducation(req, res){
    try {
        const user_id = req.user.uid
        const education = await Education.findAll({ where: { user_id }, order: [['createdAt', 'DESC']] })
        res.status(200).json(education)
    } catch (error) {
        console.error('Error getting education:', error)
        res.status(500).json({message: error.message})
    }
}

async function updateEducation(req, res){
    try {
        const id = req.params.id
        const {school, degree, field, start_date, end_date} = req.body
        const user_id = req.user.uid
        const education = await Education.findOne({ where: { id, user_id } })

        if (!education) return res.status(404).json({ message: 'Not found' })
        
        await education.update({ school, degree, field, start_date, end_date })

        res.status(200).json(education)
    } catch (error) {
        console.error('Error updating education:', error)
        res.status(500).json({message: error.message})
    }
}
async function deleteEducation(req, res){
    try {
        const {id} = req.params
        const user_id = req.user.uid
        const education = await Education.findOne({ where: { id, user_id } })

        if (!education) return res.status(404).json({ message: 'Not found' })

        await education.destroy()

        res.status(200).json({ message: 'Deleted successfully' })
    } catch (error) {
        console.error('Error deleting education:', error)
        res.status(500).json({message: error.message})
    }
}

export default {
    createEducation,
    getEducation,
    updateEducation,
    deleteEducation
}
