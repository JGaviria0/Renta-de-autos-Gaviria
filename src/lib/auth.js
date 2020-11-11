module.exports = {
    isLoggedIn (req, res, next) {
        
        if (req.isAuthenticated()) {
            return next();
        }
        return res.redirect('/signin');
    },

    isNotLoggedIn(req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        return res.redirect('/profile');
    },

    isSuperRoot(req, res, next) {
        const theUser = req.user

        if(theUser.username == 'root') {
            return next();
        }
        req.flash('message', 'Usted no es Super Usuario')
        return res.redirect('back');
    }

};