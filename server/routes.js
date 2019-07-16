import express from 'express';
import controllers from './../controllers';
import jwt from 'jsonwebtoken';
import db from '../models';

const routes = express();

function verifyToken (req, res, next){
    // GET THE AUTH HEADER VALUE
    const bearerHeader = req.headers['authorization'];
    // check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        // verify jwt
        jwt.verify(bearerHeader, process.env.SECRET_KEY, (err, data)=>{
            db.User.findById(data.user).then((user)=>{
                if (user) {
                    req.user = data.user; 
                    next();             
                }else{
                    res.status(403).json({ status: false, message: 'Unauthorized' });
                }
            }).catch((err)=>{
                if (err) { res.status(403).json({ status: false, message: 'Unauthorized' }); }
            });
        });
        
    } else {
        //forbiden
        res.status(403).json({ status: false, message: 'Unauthorized' });
    }
}

function verifyAdmin(req, res, next) {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        jwt.verify(bearerHeader, process.env.SECRET_KEY, (err, data) => {
            if (err) {
                res.status(403).json({status: false, message: 'Unauthorized'});
            } else {
                db.Admin.findById(data.admin).then(admin => {
                    if (admin) {
                        req.admin = data.admin;
                        next();
                    } else {
                        res.status(403).json({status: false, message: 'Unauthorized'});
                    }
                });
            }
        });
    } else {
        res.status(403).json({status: false, message: 'Unauthorized'});
    }
}

routes.get('/', (req, res) => {
    res.json({status: true});
});

// user routes
routes.post('/user/login', controllers.userController.loginUser);
routes.post('/user/register', controllers.userController.registerUser);
routes.get('/user/all', controllers.userController.getAllUsers);
routes.post('/user/getInfo', verifyToken, controllers.userController.getUserInfo);

// Admin Routes
routes.post('/admin/create', controllers.adminController.createAdmin);
routes.post('/admin/login', controllers.adminController.login);
routes.get('/admin/one', verifyAdmin, controllers.adminController.getAdminDetails);

// Task Routes
routes.post('/task/create', verifyAdmin, controllers.taskController.createTask);
routes.put('/task/inprogress', verifyToken, controllers.taskController.changeStatusToProgress);
routes.put('/task/completed', verifyToken, controllers.taskController.changeStatusToCompleted);
routes.put('/task/archive', verifyAdmin, controllers.taskController.changeStatusToArchived);

// Comment Routes
routes.post('/comment/create', controllers.commentController.createComment);
routes.post('/comment/fetch', controllers.commentController.fetchCommentsAllByTask);
routes.delete('/comment/delete/:id', verifyAdmin, controllers.commentController.deleteComment);

export default routes;