"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allann = void 0;
exports.getAll = getAll;
exports.addAnn = addAnn;
exports.changeStatus = changeStatus;
exports.allann = [];
async function getAll(req, res) {
    try {
        console.log("This is the backend router returning all the announcements of the user notice board ");
        const sortedAnnouncements = [...exports.allann].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        console.log(sortedAnnouncements);
        return res.status(200).json({
            announcements: sortedAnnouncements,
            success: true,
            count: sortedAnnouncements.length,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "An unexpected error occured ",
            error: error,
        });
    }
}
async function addAnn(req, res) {
    try {
        const { id, title, description, status } = req.body;
        if (!title) {
            return res.json({
                message: "Please enter teh title to continue adding",
            });
        }
        const newAnn = {
            id: id,
            title: title,
            description: description,
            status: "active",
            createdAt: new Date(),
        };
        exports.allann.push(newAnn);
        console.log("added announcement", newAnn);
        return res.status(201).json({
            message: "Announcement added successfully",
            announcement: newAnn,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "An unexpected error occurred",
            error,
        });
    }
}
async function changeStatus(req, res) {
    try {
        const { id } = req.params;
        const announcement = exports.allann.find((c) => c.id === id);
        if (!announcement) {
            return res
                .status(404)
                .json({ message: `Announcement with id ${id} not found` });
        }
        announcement.status = "closed";
        console.log("changed status of the ", id);
        return res.json({
            message: ` the announecemt with the id ${id} and status changes to the ${announcement?.status}`,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "An unexpected error occurred",
            error,
        });
    }
}
