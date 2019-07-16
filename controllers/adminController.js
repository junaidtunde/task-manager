import db from './../models/index';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const adminController = {};

let signAdmin = (admin) => {
    return new Promise((resolve, reject) => {
        jwt.sign({admin}, process.env.SECRET_KEY, {expiresIn: '1yr'}, (err, token) => {
            if (err) {
                reject(err);
            } else {
                resolve(token);
            }
        });
    });
};

adminController.createAdmin = (req, res) => {
    const {fullname, email, password} = req.body;
    db.Admin.findOne({email}).then(admin => {
        if (admin !== null) {
            res.status(409).json({status: false, message: 'Admin already has an account'});
        } else {
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                    if (err) {
                        res.status(500).json({status: false, message: 'An error occured while generating your password'});
                    } else {
                        const admins = new db.Admin({
                            fullname,
                            password: hash,
                            email
                        });
                        admins.save().then(Admin => {
                            signAdmin(Admin._id).then(token => {
                                res.status(200).json({status: true, message: 'Successfully created admin', data: Admin, token});
                            }).catch(err => {
                                res.status(500).json({status: false, message: err.message});
                            });
                        });
                    }
                });
            });
        }
    });
};

adminController.login = (req, res) => {
    const {email, password} = req.body;
    db.Admin.findOne({email}).then(admin => {
        if (admin === null) {
            res.status(404).json({status: false, message: 'There is no account linked with the email specified'});
        } else {
            bcrypt.compare(password, admin.password, (err, response) => {
                if (err) {
                    res.status(500).json({status: false, message: 'Wrong login details'});
                } else {
                    if (response === true) {
                        signAdmin(admin._id).then(token => {
                            res.status(200).json({status: true, message: 'Logged in', data: admin, token});
                        }).catch(err => {
                            res.status(500).json({status: false, message: 'An error occured while setting up admin token'});
                        });
                    } else {
                        res.status(500).json({status: false, message: 'Please check the password'});
                    }
                }
            });
        }
    });
};

adminController.getAdminDetails = (req, res) => {
    db.Admin.findById(req.admin).then(admin => {
        if (admin === null) {
            res.status(404).json({status: false, message: 'The admin profile was not found'});
        } else {
            res.status(200).json({status: true, data: admin});
        }
    }).catch(err => res.status(500).json({status: false, message: err.message}));
};

export default adminController;