const passport = require('passport');
const LocalSrategy = require('passport-local').Strategy;

const User = require('../models/User');

passport.use(new LocalSrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async(email, password, done) =>{
    //Match email's user
    const user = await User.findOne({email});
    if(!user){
        return done(null, false, {message: 'User not found.'});
    } else {
        //Match password User
        const match = await user.matchPassword(password);
        if(match){
            return done(null, user); // encontrou o usuario e senha, esta tudo ok salva session no servidor
        }
    }
}));

// Guardar a session no servidor
passport.serializeUser((user, done) =>{
    done(null, user.id);
})

//Quando esta logado verifica se tem autorização
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) =>{
        done(err, user)
    })
})