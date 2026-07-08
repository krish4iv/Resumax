import { SavedJob } from '../models/index.js'

async function saveJob(req, res) {
    try {
        const { job_title, company, job_url, location, salary, job_type } = req.body;
        const user_id = req.user.uid;
        const savedJob = await SavedJob.create({
            job_title,
            company,
            job_url,
            location,
            salary,
            job_type,
            user_id
        });
        res.status(201).json(savedJob);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getSavedJobs(req, res) {
    try {
        const user_id = req.user.uid;
        const savedJobs = await SavedJob.findAll({ where: { user_id }, order: [['createdAt', 'DESC']] });
        res.status(200).json(savedJobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function deleteSavedJob(req, res) {
    try {
        const { id } = req.params;
        const user_id = req.user.uid;
        const savedJob = await SavedJob.findOne({ where: { id, user_id } });
        if (!savedJob) return res.status(404).json({ message: 'Saved job not found' });

        await savedJob.destroy();

        res.status(200).json({ message: 'Saved job deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export default {
    saveJob,
    getSavedJobs,
    deleteSavedJob
}