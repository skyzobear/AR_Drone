var low = require('lowdb'),
    md5 = require('MD5'),
	db = low('./data/db.json');
function Utilisateur(id, login, mdp) {
    this.id = id;
    this.login = login;
    this.mdp = mdp;
}
Utilisateur.prototype.connexion = function() {
    var bdd =   db('utilisateurs')
                    .where  ( 
                                {
                                    email: this.email,
                                    mdp: md5(this.mdp)
                                }
                            )
                    .first(1)
                    .value();
    if(bdd.length > 0) {
        this.id = bdd[0].id;
        return true;
    }
    else {
        return false;
    }
};

module.exports = Utilisateur;