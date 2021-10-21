const { Router } = require('express')
const router = Router();

const multer = require('multer');
const { isAuthenticated } = require('../helpers/auth');

//store image
var storage = multer.diskStorage({
	destination:function(req,file,cb){
		cb(null,'photos')
	},
	filename:function(req,file,cb){
		
		var ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
		
		cb(null,file.fieldname+'-'+Date.now()+ext)
	}
})

store=multer({storage:storage})

const { renderSignUpForm, signup, renderLoginForm, login, logout, addAmigo, removerAmigo } = require('../controllers/users.controller');

router.get('/users/signup', renderSignUpForm);
router.post('/users/signup', store.single('photo'), signup);
router.get('/users/login', renderLoginForm);
router.post('/users/login', login);
router.get('/users/logout', logout);

router.post('/users/addAmigo', isAuthenticated, addAmigo);
router.post('/users/removerAmigo', isAuthenticated, removerAmigo);

module.exports = router
