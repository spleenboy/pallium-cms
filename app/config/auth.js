module.exports = {
    settings: {
        domain: 'your-domain.auth0.com',
        clientID: 'your-client-id',
        clientSecret: 'your-client-secret'
    },
    allow: function(user) {
        return true;
    },
};
