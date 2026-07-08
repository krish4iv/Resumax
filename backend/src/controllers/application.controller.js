import { Application } from '../models/index.js'

async function createApplication(req, res){
    try {
        const {job_title, company, job_url, status, applied_date, notes} = req.body
        const user_id = req.user.uid
        const application = await Application.create({
            job_title,
            company,
            job_url,
            status,
            applied_date,
            notes,
            user_id
        })
        res.status(201).json(application)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

async function getAllApplications(req, res){
     try {
        const user_id = req.user.uid
        const items = await Application.findAll({ where: { user_id }, order: [['createdAt', 'DESC']] })
        res.status(200).json(items)
  } catch (error) {
        res.status(500).json({ message: error.message })
  }
}

async function updateStatus(req, res){
    try{
        const {job_title, company, job_url, status, applied_date, notes} = req.body
        const application = await Application.findOne({
            where: { id: req.params.id, user_id: req.user.uid }
        })

        if (!application) return res.status(404).json({message: 'Application not found'})

        await application.update({job_title, company, job_url, status, applied_date, notes})

        res.status(200).json(application)
    }catch(error){
        res.status(500).json({message: error.message})
    }
}
async function deleteApplication(req, res){
    try{
        const application = await Application.findOne({
            where: { id: req.params.id, user_id: req.user.uid }
        })
        if (!application) return res.status(404).json({message: 'Application not found'})

        await application.destroy()

        res.status(200).json({message: 'Application deleted'})
    }catch(error){
        res.status(500).json({message: error.message})
    }
}

export default {
    createApplication,
    getAllApplications,
    updateStatus,
    deleteApplication
}
