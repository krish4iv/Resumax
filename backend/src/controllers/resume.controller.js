import { Resume } from "../models/index.js";

async function createResume(req, res) {
    try {
        const { filename, ats_score, content_quality, ats_structure, job_optimization, writing_quality, app_ready, strengths, findings } = req.body
        const user_id = req.user.uid;
        const resume = await Resume.create({
            filename,
            ats_score,
            content_quality,
            ats_structure,
            job_optimization,
            writing_quality,
            app_ready,
            strengths,
            findings,
            user_id
        });
        res.status(201).json(resume);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getAllResumes(req, res) {
    try {
        const user_id = req.user.uid;
        const resumes = await Resume.findAll({ where: { user_id }, order: [['createdAt', 'DESC']] })
        res.status(200).json(resumes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getResumeById(req, res) {
    try {
        const { id } = req.params;
        const user_id = req.user.uid;
        const resume = await Resume.findOne({ where: { id, user_id } });
        if (!resume) return res.status(404).json({ message: 'Resume not found' });

        res.status(200).json(resume);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function updateResume(req, res) {
  try {
    const { id } = req.params
    const user_id = req.user.uid
    const resume = await Resume.findOne({ where: { id, user_id } })
    if (!resume) return res.status(404).json({ message: 'Resume not found' })

    const { filename, content, ats_score, content_quality, ats_structure,
            job_optimization, writing_quality, app_ready, strengths, findings } = req.body

    await resume.update({
      ...(filename !== undefined && { filename }),
      ...(content !== undefined && { content }),
      ...(ats_score !== undefined && { ats_score }),
      ...(content_quality !== undefined && { content_quality }),
      ...(ats_structure !== undefined && { ats_structure }),
      ...(job_optimization !== undefined && { job_optimization }),
      ...(writing_quality !== undefined && { writing_quality }),
      ...(app_ready !== undefined && { app_ready }),
      ...(strengths !== undefined && { strengths }),
      ...(findings !== undefined && { findings }),
    })

    res.status(200).json(resume)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export default {
  createResume,
  getAllResumes,
  getResumeById,
  updateResume 
}