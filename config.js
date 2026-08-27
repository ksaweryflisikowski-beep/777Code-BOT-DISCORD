require('dotenv').config();

module.exports = {
    // ==========================================
    // DANE BOTA - USTAWIONE W BOT-HOSTING → ENV
    // ==========================================

    TOKEN: process.env.TOKEN,
    CLIENT_ID: process.env.CLIENT_ID,
    GUILD_ID: process.env.GUILD_ID,

    // ==========================================
    // KANAŁY
    // ==========================================

    CHANNELS: {
        TICKETS: '1494382864517697596',
        WELCOME: '1495370548249890837',
        VERIFICATION: '1494719799035695246',
        PROPOSALS: '1494383451980173428'
    },

    // ==========================================
    // KATEGORIE
    // ==========================================

    CATEGORIES: {
        TICKETS: '1495376977580916816'
    },

    // ==========================================
    // ROLE
    // ==========================================

    ROLES: {
        ADMIN: '1494717987855270089',
        PLAYER: '1495371180234899476',
        VERIFIED: '1494718998665760829'
    },

    // ==========================================
    // BOT
    // ==========================================

    BOT: {
        NAME: 'KIXIMC.PL',
        STATUS: 'dnd',
        ACTIVITY_TYPE: 0,
        FOOTER_TEXT: '© 2026 KIXIMC.PL'
    },

    // ==========================================
    // TICKETY
    // ==========================================

    TICKETS: {
        COOLDOWN: 30000,

        CATEGORIES: [
            {
                label: 'Pomoc',
                description: 'Potrzebuję pomocy',
                value: 'pomoc',
                emoji: '🆘'
            },
            {
                label: 'Administracja',
                description: 'Kontakt z administracją',
                value: 'administracja',
                emoji: '🛡️'
            },
            {
                label: 'Problem',
                description: 'Zgłoś problem',
                value: 'problem',
                emoji: '⚠️'
            },
            {
                label: 'Inne',
                description: 'Inna sprawa',
                value: 'inne',
                emoji: '📩'
            }
        ],

        MANAGEMENT_OPTIONS: [
            {
                label: 'Zamknij ticket',
                description: 'Zamknij ten ticket',
                value: 'close_ticket',
                emoji: '🔒'
            },
            {
                label: 'Przejmij ticket',
                description: 'Przejmij ticket jako administrator',
                value: 'claim_ticket',
                emoji: '🙋'
            },
            {
                label: 'Odprzejmij ticket',
                description: 'Oddaj ticket',
                value: 'unclaim_ticket',
                emoji: '↩️'
            }
        ]
    },

    // ==========================================
    // EMBEDY
    // ==========================================

    EMBEDS: {
        TICKET_PANEL: {
            COLOR: 0x5865F2,
            TITLE: '🎫 Centrum Ticketów',
            DESCRIPTION:
                'Potrzebujesz pomocy?\n\n' +
                'Wybierz kategorię z menu poniżej, aby utworzyć ticket.',
            IMAGE: null
        }
    },

    // ==========================================
    // WIADOMOŚCI
    // ==========================================

    MESSAGES: {
        COOLDOWN:
            '⏳ Musisz poczekać jeszcze **{time} sekund**, zanim utworzysz kolejny ticket.',

        EXISTING_TICKET:
            '❌ Masz już otwarty ticket.',

        TICKET_CREATED:
            '✅ Twój ticket został utworzony: <#{channelId}>',

        TICKET_ERROR:
            '❌ Wystąpił błąd podczas tworzenia ticketa.',

        CLOSING_TICKET:
            '🔒 Ticket zostanie zamknięty za **5 sekund**.',

        TICKET_CLAIMED:
            '🙋 Ticket został przejęty przez <@{userId}>.',

        TICKET_UNCLAIMED:
            '↩️ <@{userId}> przestał być osobą prowadzącą ten ticket.',

        NO_PERMISSION:
            '❌ Nie masz uprawnień do **{action}**.',

        ROLE_ADDED:
            '🏷️ Nadano rangę {roleName} użytkownikowi {userTag}.'
    },

    // ==========================================
    // LOGI
    // ==========================================

    LOGS: {
        BOT_READY: '🟢 Bot uruchomiony jako {tag}',
        BOT_ONLINE: '🟢 Bot jest online jako {tag}',
        TICKET_SENT: '🎫 Panel ticketów został wysłany.',
        TICKET_DELETED: '🗑️ Stary panel ticketów został usunięty.',
        TICKET_ERROR: '❌ Błąd panelu ticketów:',
        TICKET_CLAIM_ERROR: '❌ Błąd przejmowania ticketa:',
        TICKET_UNCLAIM_ERROR: '❌ Błąd odprzejmowania ticketa:',
        MESSAGE_DELETED:
            '🛡️ Usunięto wiadomość użytkownika {tag} ({id}): {content}',
        ROLE_NOT_FOUND: '❌ Nie znaleziono roli PLAYER.',
        ROLE_ERROR: '❌ Błąd nadawania roli:'
    },

    // ==========================================
    // WERYFIKACJA
    // ==========================================

    VERIFICATION: {
        BUTTON_LABEL: '🔐 ZWERYFIKUJ SIĘ',

        EMBED: {
            COLOR: 0x57F287,
            TITLE: '✅ Weryfikacja',
            DESCRIPTION:
                'Kliknij przycisk poniżej i rozwiąż proste działanie matematyczne, aby otrzymać rangę.',
            IMAGE: null
        },

        MODAL: {
            CUSTOM_ID: 'verification_modal',
            TITLE: '🔐 Weryfikacja',
            INPUT_LABEL: 'Odpowiedź',
            PLACEHOLDER: 'Wpisz wynik działania'
        },

        MESSAGES: {
            SUCCESS:
                '✅ Pomyślnie się zweryfikowałeś! Otrzymałeś odpowiednią rangę.',
            ERROR:
                '❌ Niepoprawna odpowiedź.',
            ROLE_ERROR:
                '❌ Nie znaleziono roli weryfikacyjnej.',
            CHANNEL_ERROR:
                '❌ Nie znaleziono kanału weryfikacji.',
            SENT:
                '✅ Panel weryfikacji został wysłany.',
            SEND_ERROR:
                '❌ Nie udało się wysłać panelu weryfikacji:',
            MODAL_ERROR:
                '❌ Nie udało się otworzyć formularza weryfikacji:'
        },

        MATH: {
            MIN_NUMBER: 1,
            MAX_NUMBER: 20,
            OPERATIONS: ['+', '-', '*'],
            MAX_RESULT: 100
        }
    },

    // ==========================================
    // PROPOZYCJE
    // ==========================================

    PROPOSALS: {
        MODAL: {
            CUSTOM_ID: 'proposal_modal',
            TITLE: '💡 Nowa propozycja',
            CONCERN_LABEL: 'Czego dotyczy?',
            CONCERN_PLACEHOLDER: 'Np. SkyPvP',
            CONTENT_LABEL: 'Treść propozycji',
            CONTENT_PLACEHOLDER: 'Opisz swoją propozycję...'
        },

        BUTTONS: {
            ADD: {
                LABEL: '💡 Dodaj propozycję'
            }
        },

        EMBED: {
            COLOR: 0x5865F2,
            TITLE: '💡 Propozycje',
            DESCRIPTION:
                'Kliknij przycisk poniżej, aby dodać swoją propozycję.',
            IMAGE: null
        },

        MESSAGES: {
            ALREADY_VOTED:
                '❌ Już zagłosowałeś w tej propozycji.',
            VOTE_RECORDED:
                '✅ Twój głos został zapisany.',
            PROPOSAL_ADDED:
                '✅ Twoja propozycja została dodana.',
            CHANNEL_ERROR:
                '❌ Nie znaleziono kanału propozycji.',
            SEND_ERROR:
                '❌ Błąd wysyłania propozycji:',
            MODAL_ERROR:
                '❌ Nie udało się otworzyć formularza propozycji:'
        }
    },

    // ==========================================
    // AUTOMOD
    // ==========================================

    AUTOMOD: {
        BAD_WORDS: [
            'kurwa',
            'kurwo',
            'chuj',
            'chuja',
            'jebac',
            'jebać',
            'jeba',
            'pizda',
            'pierdolić',
            'pierdol',
            'skurwysyn'
        ],

        ALLOWED_DOMAINS: [
            'youtube.com',
            'youtu.be',
            'tiktok.com',
            'discord.com',
            'discord.gg',
            'kiximc.pl'
        ]
    }
};
