import { Project } from "../models/index.js";

async function createProject(req, res) {
    try {
        const { name, description,  url, tags } = req.body;
        const user_id = req.user.uid;
        const project = await Project.create({
            name,
            description,
            url,
            tags,
            user_id
        });
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getProjects(req, res) {
    try {
        const user_id = req.user.uid;
        const projects = await Project.findAll({ where: { user_id }, order: [['createdAt', 'DESC']] });
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function updateProject(req, res) {
    try {
        const { id } = req.params;
        const { name, description, url, tags } = req.body;
        const user_id = req.user.uid;
        const project = await Project.findOne({ where: { id, user_id } });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        await project.update({
            name,
            description,
            url,
            tags
        });

        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function deleteProject(req, res) {
    try {
        const { id } = req.params;
        const user_id = req.user.uid;
        const project = await Project.findOne({ where: { id, user_id } });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        await project.destroy();

        res.status(200).json({ message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export default {
    createProject,
    getProjects,
    updateProject,
    deleteProject
};