const notesCtrl = {};


const Note = require('../models/Notes');
const User = require('../models/User');

notesCtrl.renderNoteForm = (req, res) => {
    //res.send('Notes Add');
    res.render('notes/new-note');
};

notesCtrl.createNewNote = async(req, res) => {
    const {title, description} = req.body;
    const newNote = new Note({title, description});
    newNote.user = req.user.id;
    await newNote.save();
    //res.send('Salvo com sucesso');
    req.flash('success_msg', 'Note added Successfully');
    res.redirect(`/notes/${req.user.id}`);
    
};

notesCtrl.renderNotes = async (req, res) => {
	
	let usuarioAtualId = req.user._id.toString();
	
	let userParamIdStr = req.params.usrId;
	
	if(userParamIdStr != undefined)
		userParamIdStr = await userParamIdStr.toString();
	
	let ehMinhaPagina;
	
	if(usuarioAtualId === userParamIdStr || userParamIdStr===undefined){
		ehMinhaPagina = true;
	}
	else{
		ehMinhaPagina = false;
	}
	
	userParamIdStr = usuarioAtualId;
	
	
	const allUsers = await session.run(`MATCH (u:Usuario) WHERE u.id = "${userParamIdStr}" 
											MATCH (u), (u2:Usuario) WHERE NOT (u)-[:AMIGO]->(u2)
											MATCH (u2) WHERE u2.id <> "${userParamIdStr}" RETURN u2`, {});
	
	const friends = await session.run(`MATCH (u:Usuario) WHERE u.id = "${userParamIdStr}"
											MATCH (u), (u2:Usuario) WHERE (u)-[:AMIGO]->(u2) RETURN u2`)
	
	const usuarios = []
	allUsers.records.forEach(user => {
		usuarios.push({id: user.get(0).properties.id, currentUserId: usuarioAtualId, name: user.get(0).properties.name, perfilPhoto: user.get(0).properties.perfilPhoto})
	});
	
	
	const amigos = [];
	friends.records.forEach(user => {
		amigos.push({id: user.get(0).properties.id, currentUserId: usuarioAtualId, name: user.get(0).properties.name, perfilPhoto: user.get(0).properties.perfilPhoto});
	});
	
	let notes, Name_Photo;
	
	if(req.params.usrId===undefined){
		notes = await Note.find({user: userParamIdStr});
		Name_Photo = await User.findById(userParamIdStr).select('name perfilPhoto');
	}
	else{
		notes = await Note.find({user: req.params.usrId});
		Name_Photo = await User.findById(req.params.usrId).select('name perfilPhoto');
	}
	
	res.locals.pageOwner = {name: Name_Photo.name, perfilPhoto: Name_Photo.perfilPhoto};
	
	await notes.map((note) => {
		note.usrName = Name_Photo.name;
		note.isPageUser = ehMinhaPagina;
	});
	
	res.render('notes/all-notes', {notes, usuarios, amigos});
	
};

notesCtrl.renderEditForm = async(req, res) => {
    const note = await Note.findById(req.params.id);
    res.render('notes/edit-note', {note});
};


notesCtrl.updateNote = async (req, res) => {
	const id = req.query.id, usrId = req.query.usrId;
	const {title, description } =  req.body;
	await Note.findByIdAndUpdate(id, {title,description});
	req.flash('success_msg', 'Note Updated Successfully');	
    res.redirect(`/notes/${usrId}`);
};


notesCtrl.deleteNote = async (req, res) => {
    const id = req.query.id, usrId = req.query.usrId;
	await Note.findByIdAndDelete(id);
    req.flash('success_msg', 'Note Deleted Successfully');
    res.redirect(`/notes/${usrId}`);
};

module.exports = notesCtrl; 