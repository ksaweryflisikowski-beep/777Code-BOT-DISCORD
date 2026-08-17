require('dotenv').config();

module.exports = { // NIE RUSZAĆ - USTAW TO W .ENV
    TOKEN: process.env.TOKEN,
    CLIENT_ID: process.env.CLIENT_ID,
    GUILD_ID: process.env.GUILD_ID,
    
    // Ustaw tutaj id kanałów
    CHANNELS: {
        TICKETS: '1494382864517697596',
        WELCOME: '1495370548249890837',
        VERIFICATION: '1494719799035695246',
        PROPOSALS: '1494383451980173428'
    },
    
    CATEGORIES: {
        TICKETS: '1495376977580916816'
    },
    
    ROLES: {
        ADMIN: '1494717987855270089',
        PLAYER: '1495371180234899476',
        VERIFIED: '1494718998665760829'
    },

    BOT: {
        NAME: 'KIXIMC.PL',
        STATUS: 'dnd',
        ACTIVITY_TYPE: 5,
        FOOTER_TEXT: '© 2025 KIXIMC.PL'
    },

    // RESZTĘ CONFIG.JS ZOSTAW TAK JAK MASZ
};
