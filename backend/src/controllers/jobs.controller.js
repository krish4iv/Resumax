import { Job } from '../models/index.js'
import { Op } from "sequelize"


// op.like = %search% is the operation for like to find similar jobs [WHERE title LIKE '%developer%']
async function getAllJobs(req, res) {

    try{
        const { search, job_type, location } = req.query
        const where = {}
        if (search) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { company: { [Op.iLike]: `%${search}%` } }
            ]
        }
        if (job_type) where.job_type = job_type
        if (location) where.location = { [Op.iLike]: `%${location}%` }

        const jobs = await Job.findAll({ where })
        res.status(200).json(jobs)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

async function getJobById(req, res) {
    try{
    const id = req.params.id
    const job = await Job.findByPk(id)
    if(!job) {
        return res.status(404).json({ message: 'Job not found' })
    }
    res.status(200).json(job)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

async function createJob(req, res) {
   
    try{
        const {title, description, company, location, salary, job_type, source_url, posted_at} = req.body

        if(!title || !company || !description) {
            return res.status(400).json({ message: 'Title, company and description are required' })
        }
        
        const job = await Job.create({
            title,
            description,
            company,
            location,
            salary,
            job_type,
            source_url,
            posted_at
        })
        res.status(201).json(job)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

async function deleteJob(req, res) {
    try{
        const id = req.params.id

        const job = await Job.findByPk(id)
        if(!job) {
            return res.status(404).json({ message: 'Job not found' })
        }

        await job.destroy()
        res.status(200).json({ message: 'Job deleted' })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export default {
    getAllJobs,
    getJobById,
    createJob,
    deleteJob
}
