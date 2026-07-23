import { Resume } from "../models/index.js";


async function createResume(req, res) {
  const { filename, content, ats_score, content_quality, ats_structure, job_optimization, writing_quality, app_ready, strengths, findings } = req.body
  const user_id = req.user.uid;
  const resume = await Resume.create({
    filename,
    content,
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
}

async function getAllResumes(req, res) {
  const user_id = req.user.uid;
  const resumes = await Resume.findAll({ where: { user_id }, order: [['createdAt', 'DESC']] })
  res.status(200).json(resumes);
}

async function getResumeById(req, res) {
  const { id } = req.params;
  const user_id = req.user.uid;
  const resume = await Resume.findOne({ where: { id, user_id } });
  if (!resume) return res.status(404).json({ message: 'Resume not found' });

  res.status(200).json(resume);
}

async function updateResume(req, res) {
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
}

async function deleteResume(req, res) {
  const { id } = req.params
  const user_id = req.user.uid
  const resume = await Resume.findOne({ where: { id, user_id } })
  if (!resume) return res.status(404).json({ message: 'Resume not found' })

  await resume.destroy()

  res.status(200).json({ message: 'Resume deleted' })
}

export default {
  createResume,
  getAllResumes,
  getResumeById,
  updateResume,
  deleteResume
}