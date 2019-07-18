import db from './../models/index';

const commentController = {};

commentController.createComment = (req, res) => {
    const {message, task_id} = req.body;
    db.Task.findById(task_id).then(task => {
        if (task === undefined) {
            res.status(404).json({ status: false, message: 'The task was not found' });
        }
        db.User.findById(req.user).then(user => {
            if (user === null) {
                res.status(404).json({ status: false, message: 'The user was not found' });
            }
            const cmnt = new db.Comment({
                user: user._id,
                task: task._id,
                message
            });
            db.Comment.create(cmnt, (err, completed) => {
                if (err) {
                    res.status(500).json({ status: false, message: "The comment was not created" });
                } else {
                    task.comments.push(completed._id);
                    task.save().then(saved => {
                        res.status(200).json({ status: true, message: 'Saved successfully', data: completed, user });
                    });
                }
            });
        });
    }).catch(err => {
        res.status(500).json({status: false, message: err.message});
    });
};

commentController.fetchCommentsAllByTask = (req, res) => {
    const {id} = req.body;
    // Find the post
    db.Comment.find({task: id}).sort({'created_at': -1}).populate('user').then(comment => {
        if (comment === undefined) {
            res.status(404).json({status: false, message: 'There is no comment for this task'});
        }
        res.status(200).json({status: true, message: 'Found comments', data: comment});
    }).catch(err => {
        res.status(500).json({status: false, message: err.message});
    });
};

commentController.deleteComment = (req, res) => {
    const comment_id = req.params.id;
    db.Admin.findById(req.admin).then(admin => {
        if (admin === null) {
            res.status(404).json({ status: false, message: 'The admin was not found' });
        }
        db.Comment.findByIdAndDelete(comment_id, (err, deleted) => {
            if (err) {
                res.status(500).json({ status: false, message: err.message });
            } else {
                res.status(200).json({ status: true, message: 'Successfully deleted this comment', data: deleted });
            }
        });
    }).catch(err => {
        res.status(401).json({ status: false, message: err.message });
    });
};

export default commentController;