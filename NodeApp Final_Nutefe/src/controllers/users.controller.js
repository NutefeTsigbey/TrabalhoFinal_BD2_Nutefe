const usersCtrl = {};

const passport = require('passport');
const User = require('../models/User')

const fs = require('fs');

usersCtrl.renderSignUpForm = (req, res) => {
    res.render('users/signup');
};

usersCtrl.signup = async(req, res) => {
    const errors = [];
    const {name, email, password, confirm_password, photo} = req.body;
	
	const file = (req.file);
	
    if(password != confirm_password){
        errors.push({text: 'Passwords do not match'});
    }
    else if(password.length < 4){
        errors.push({text: 'Passwords do not match'});
    }
    else if(errors.length != 0){
        res.render('users/signup', {errors, name, email});	
    }
	else {
        const emailUsers = await User.findOne({email});
        if(emailUsers){
            req.flash('error_msg', 'The e-mail is already in use.');
            res.redirect('/users/signup');
        } else{
			let encode_photo;
			if(file){
				let Photo = fs.readFileSync(file.path);
				encode_photo = Photo.toString('base64');
				fs.unlinkSync(file.path);
            }
			else
				encode_photo = null;
			const novoUsuario = new User({name, email, perfilPhoto: encode_photo, password});
			novoUsuario.password = await novoUsuario.encryptPassword(password);
            const newUser = await novoUsuario.save();
			const newUserNeo = await session.run(`CREATE (n:Usuario {id: "${newUser._id}", name: "${newUser.name}", email: "${newUser.email}", perfilPhoto: "${newUser.perfilPhoto}" })`, {});
            req.flash('success_msg', 'You are registered');
			//deleta imagem da pasta local
            res.redirect('/users/login');
        }
    }
};

usersCtrl.renderLoginForm = (req, res) => {
    res.render('users/login');
};

usersCtrl.login = passport.authenticate('local', {
    failureRedirect: '/users/login',
    successRedirect: '/my_notes',
    failureFlash: true
})

usersCtrl.logout = (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out now');
    res.redirect('/users/login');
};


usersCtrl.addAmigo = async (req, res) => {
	
	param1 = req.query.param1;
	param2 = req.query.param2;
	
	const novoAmigo = await session.run(`MATCH (u:Usuario), (u2:Usuario) WHERE u.id = "${param1}" AND u2.id = "${param2}" CREATE (u)-[:AMIGO]->(u2)`, {});
	
	res.redirect('/my_notes');
};

usersCtrl.removerAmigo = async (req, res) => {
	
	param1 = req.query.param1;
	param2 = req.query.param2;
	
	const removeAmigo = await session.run(`MATCH (u:Usuario {id: "${param1}"})-[p:AMIGO]->(u2:Usuario {id: "${param2}"}) 
												DELETE p`, {});
	
	res.redirect('/my_notes');	
};

module.exports = usersCtrl; 