import { Experience } from "../models/index.js";

async function createExperience(req, res) {
    try {
        const { role, company, start_date, end_date, bullets } = req.body
        const user_id = req.user.uid;
        const experience = await Experience.create({
            role,
            company,
            start_date,
            end_date,
            bullets,
            user_id
        });
        res.status(201).json(experience);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getExperience(req, res) {
    try {
        const user_id = req.user.uid;
        const experiences = await Experience.findAll({ where: { user_id }, order: [['createdAt', 'DESC']] });
        res.status(200).json(experiences);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function updateExperience(req, res) {
    try {
        const { id } = req.params;
        const { role, company, start_date, end_date, bullets } = req.body;
        const user_id = req.user.uid;
        const experience = await Experience.findOne({ where: { id, user_id } });
        if (!experience) return res.status(404).json({ message: 'Experience not found' });

        await experience.update({
            role,
            company,
            start_date,
            end_date,
            bullets
        });

        res.status(200).json(experience);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function deleteExperience(req, res) {
    try {
        const { id } = req.params;
        const user_id = req.user.uid;
        const experience = await Experience.findOne({ where: { id, user_id } });
        if (!experience) return res.status(404).json({ message: 'Experience not found' });

        await experience.destroy();

        res.status(200).json({ message: 'Experience deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export default {
    createExperience,
    getExperience,
    updateExperience,
    deleteExperience
};
