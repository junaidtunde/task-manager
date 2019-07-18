import db from './../models/index';
import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';

const taskController = {};

let sendMail = (dir_path, object) => {
    return new Promise((resolve, reject) => {
        ejs.renderFile(path.join(__dirname, '../templates/' + dir_path), object, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

taskController.createTask = (req, res) => {
    const { description, user_id } = req.body;

    db.Admin.findById(req.admin).then(admin => {
        if (admin === null) {
            res.status(404).json({ status: false, message: 'The admin account was not found'});
        } else {
            db.User.findById(user_id).then(user => {
                if (user === null) {
                    res.status(404).json({ status: false, message: 'The user account was not found'});
                }
                const task = new db.Task({
                    user: user._id,
                    description
                });
                db.Task.create(task, (err, completed) => {
                    if (err) {
                        res.status(500).json({ status: false, message: "The task was not created" });
                    } else {
                        // Send the email
                        const transporter = nodemailer.createTransport({
                            service: 'Sendgrid',
                            auth: {
                                user: process.env.SENDGRID_USERNAME,
                                pass: process.env.SENDGRID_PASSWORD
                            }
                        });

                        sendMail('newTask.ejs', { username: user.username, host: req.headers.host, protocol: req.protocol }).then(data => {
                            const mailOptions = {
                                from: 'task-manager@yourwebapp.com',
                                to: user.email,
                                subject: 'You have been assigned a new task',
                                html: data
                            };

                            transporter.sendMail(mailOptions, (err) => {
                                if (err) {
                                    return res.status(500).send({
                                        msg: err.message
                                    });
                                }
                                user.tasks.push(task._id);
                                user.save().then(saved => {
                                    res.status(200).json({
                                        status: true,
                                        message: 'A mail has been sent to ' + user.email + '.' + ' and a new task has been created',
                                        data: completed,
                                        user_name: user.username
                                    });
                                });
                            });
                        });
                    }
                });
            });
        }
    }).catch(err => {
        res.status(401).json({status: false, message: err.message});
    });
};

taskController.changeStatusToProgress = (req, res) => {
    const {task_id} = req.body;
    db.User.findById(req.user).then(user => {
        if (user === null) {
            res.status(404).json({status: false, message: 'The user was not found'});
        }
        db.Task.findById(task_id).then(task => {
            if (task === null) {
                res.status(404).json({status: false, message: 'The task was not found'});
            }
            task.status = 'in-progress';
            task.save().then(saved => {
                // Send the email
                const transporter = nodemailer.createTransport({
                    service: 'Sendgrid',
                    auth: {
                        user: process.env.SENDGRID_USERNAME,
                        pass: process.env.SENDGRID_PASSWORD
                    }
                });

                sendMail('progress.ejs', { username: user.username, task_status: 'in-progress', host: req.headers.host, protocol: req.protocol }).then(data => {
                    const mailOptions = {
                        from: 'task-manager@yourwebapp.com',
                        to: user.email,
                        subject: 'Changes have been made to your task',
                        html: data
                    };

                    // console.log('here');

                    transporter.sendMail(mailOptions, (err) => {
                        if (err) {
                            return res.status(500).send({
                                msg: err.message
                            });
                        }
                        res.status(200).json({
                            status: true,
                            message: 'A mail has been sent to ' + user.email + '.' + ' and status have been changed to in-progress',
                            data: user.email
                        });
                    });
                });
            });
        });
    }).catch(err => {
        res.status(401).json({status: false, message: err.message});
    });
};

taskController.changeStatusToCompleted = (req, res) => {
    const {task_id} = req.body;
    db.User.findById(req.user).then(user => {
        if (user === null) {
            res.status(404).json({status: false, message: 'The user was not found'});
        }
        db.Task.findById(task_id).then(task => {
            if (task === null) {
                res.status(404).json({status: false, message: 'The task was not found'});
            }
            task.status = 'completed';
            task.created_at = Date.now();
            task.save().then(saved => {
                // Send the email
                const transporter = nodemailer.createTransport({
                    service: 'Sendgrid',
                    auth: {
                        user: process.env.SENDGRID_USERNAME,
                        pass: process.env.SENDGRID_PASSWORD
                    }
                });

                sendMail('progress.ejs', { username: user.username, task_status: 'completed', host: req.headers.host, protocol: req.protocol }).then(data => {
                    const mailOptions = {
                        from: 'task-manager@yourwebapp.com',
                        to: user.email,
                        subject: 'Changes have been made to your task',
                        html: data
                    };

                    // console.log('here');

                    transporter.sendMail(mailOptions, (err) => {
                        if (err) {
                            return res.status(500).send({
                                msg: err.message
                            });
                        }
                        res.status(200).json({
                            status: true,
                            message: 'A mail has been sent to ' + user.email + '.' + ' and status have been changed to completed',
                            data: user.email
                        });
                    });
                });
            });
        });
    }).catch(err => {
        res.status(401).json({status: false, message: err.message});
    });
};

taskController.changeStatusToArchived = (req, res) => {
    const {task_id} = req.body;
    db.Admin.findById(req.admin).then(admin => {
        if (admin === null) {
            res.status(404).json({status: false, message: 'The admin was not found'});
        }
        db.Task.findById(task_id).populate('user').then(task => {
            if (task === null) {
                res.status(404).json({status: false, message: 'The task was not found'});
            }
            task.status = 'archived';
            task.created_at = Date.now();
            task.save().then(saved => {
                // Send the email
                const transporter = nodemailer.createTransport({
                    service: 'Sendgrid',
                    auth: {
                        user: process.env.SENDGRID_USERNAME,
                        pass: process.env.SENDGRID_PASSWORD
                    }
                });

                sendMail('progress.ejs', { username: task.user.username, task_status: 'archived', host: req.headers.host, protocol: req.protocol }).then(data => {
                    const mailOptions = {
                        from: 'task-manager@yourwebapp.com',
                        to: task.user.email,
                        subject: 'Changes have been made to your task',
                        html: data
                    };

                    // console.log('here');

                    transporter.sendMail(mailOptions, (err) => {
                        if (err) {
                            return res.status(500).send({
                                msg: err.message
                            });
                        }
                        res.status(200).json({
                            status: true,
                            message: 'A mail has been sent to ' + task.user.email + '.' + ' and status have been changed to in-progress',
                            data: task.user.email
                        });
                    });
                });
            });
        });
    }).catch(err => {
        res.status(401).json({status: false, message: err.message});
    });
};

taskController.getAllTasks = (req, res) => {
    db.Task.find().populate('comments').populate('user').then(tasks => {
        if (tasks === null || tasks.length === 0) {
            res.status(404).json({status: false, message: 'There are no tasks at the moment'});
        }
        res.status(200).json({status: true, message: 'Found all tasks', data: tasks})
    }).catch(err => {
        res.status(500).json({status: false, message: err.message});
    })
}

export default taskController;