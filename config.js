require('dotenv').config();

module.exports = { // NIE RUSZAĆ - USTAW TO W .ENV
    TOKEN: process.env.TOKEN,
    CLIENT_ID: process.env.CLIENT_ID,
    GUILD_ID: process.env.GUILD_ID,
    
    // Ustaw tutaj id kanałów
    CHANNELS: {
        TICKETS: '1494382864517697596', // id kanału od ticketów
        WELCOME: '1495370548249890837', // id kanału od powitań
        VERIFICATION: '1494719799035695246', // id kanału od weryfikacji
        PROPOSALS: '1494383451980173428' // id kanału od propozycji
    },
    
    // Ustaw tutaj id kategorii
    CATEGORIES: {
        TICKETS: '1495376977580916816' //  id kategorii od ticketów (ogólna kategoria)
    },
    
    // Ustaw tutaj id rang ( ról )
    ROLES: {
        ADMIN: '1494717987855270089', // rola administracji - może przejmować tickety i omija automod
        PLAYER: '1495371180234899476', // rola gracz nadawana automatycznie po wejściu
        VERIFIED: '1494718998665760829' // rola zweryfikowany (może być ranga gracz)
    },
    
    // Ustaw tutaj status bota
    BOT: {
        NAME: 'KIXIMC.PL',
        STATUS: 'dnd', // online, idle, dnd, invisible
        ACTIVITY_TYPE: 5, // 0=Playing, 1=Streaming, 2=Listening, 3=Watching, 5=Competing
        FOOTER_TEXT: '© 2025 KIXIMC.PL'
    },
    
    // Ustaw tutaj swoje tickety
    TICKETS: {
        COOLDOWN: 6000, // = 60 sekund
        CATEGORIES: [
            { 
                label: 'Znalazłem błąd', 
                value: 'Znalazłem błąd', 
                emoji: { name: 'plik', id: '1346130150173184010' }, 
                description: 'Jeśli znalazłeś błąd wybierz te kategorię' 
            },
            { 
                label: 'Discord KIXIMC.PL', 
                value: 'KIXIMC.PL', 
                emoji: { name: 'plik', id: '1346130179755479121' }, 
                description: 'Wybierz jeśli masz problem z discordem' 
            },
            { 
                label: 'Chcę otrzymać backupa', 
                value: 'Chcę otrzymać backupa', 
                emoji: { name: 'plik', id: '1346130170565627954' }, 
                description: 'Wybierz jeśli chcesz otrzymać backupa' 
            },
            { 
                label: 'Pytania Ogólne', 
                value: 'Pytania Ogólne', 
                emoji: { name: 'plik', id: '1346130168737038417' }, 
                description: 'Wybierz jeśli masz problem z innym problemem' 
            },
            { 
                label: 'Problem z itemshopem', 
                value: 'Problem z itemshopem', 
                emoji: { name: 'plik', id: '1346130153021112414' }, 
                description: 'Wybierz jeśli masz problem z itemshopem' 
            }
        ],
        MANAGEMENT_OPTIONS: [
            { 
                label: 'Zamknij ticket', 
                value: 'close_ticket', 
                emoji: '<:1346130179755479121:1371412002299445348>',
                description: 'Zamyka ticket i usuwa kanał' 
            },
            { 
                label: 'Przejmij ticket', 
                value: 'claim_ticket', 
                emoji: '<:1346130168737038417:1371411852478906501>',
                description: 'Przejmij ticket jako administrator' 
            },
            { 
                label: 'Opuść ticket', 
                value: 'unclaim_ticket', 
                emoji: '<:1346130161002741822:1371411931067449434>',
                description: 'Opuść przejęty ticket' 
            }
        ]
    },
    
    // Ustaw tutaj powitania | "\n" = nowa linijka
    WELCOME: {
        TITLE: 'KIXIMC.PL × Powitania Członków',
        DESCRIPTION: '> Witamy **{user}**, \n > Dołączyłeś na **oficjalny serwer** KIXIMC.PL \n \n > **Zapoznaj się** z regulaminem na kanale! \n > Jesteś **#{memberCount} osobą** na naszym serwerze!',
        COLOR: '#FF0000',
        IMAGE: 'https://cdn.discordapp.com/attachments/1495380008657485874/1495380729511542915/KIXIMC.pl_kopia.png?ex=69e60954&is=69e4b7d4&hm=67aeae428642e102095db2b83cd46f17fe4e5e6054b3036bf26aadd59797538a&',
        BUTTON_LABEL: '× Dziękujemy za dołączenie! ×'
    },
    
    // Ustaw tutaj embedy
    EMBEDS: {
        TICKET_PANEL: {
            TITLE: 'KIXIMC.PL × Utwórz Ticket',
            DESCRIPTION: '> Aby **utworzyć** nowy **ticket**, wybierz odpowiednią **kategorię**\n> dotyczącą twojego **problemu** do administracji.\n \n> Zabroniony jest spam i bezsensowne tickety. Grozi to **permamentnym banem** na discordzie.',
            COLOR: '#FF0000',
            IMAGE: 'https://cdn.discordapp.com/attachments/1495380008657485874/1495380729511542915/KIXIMC.pl_kopia.png?ex=69e60954&is=69e4b7d4&hm=67aeae428642e102095db2b83cd46f17fe4e5e6054b3036bf26aadd59797538a&'
        }
    },
    
    // Ustawienia intents
    INTENTS: [
        'Guilds',
        'GuildMessages', 
        'GuildMembers',
        'GuildPresences',
        'GuildVoiceStates',
        'MessageContent'
    ],
    
    PARTIALS: [
        'Message',
        'Channel',
        'Reaction'
    ],
    
    // Ustaw tutaj automoda
    AUTOMOD: {
        BAD_WORDS: ['kurwa', 'chuj', 'pierdole', 'jebany', 'spierdalaj'],
        ALLOWED_DOMAINS: [
            'discord.com', 
            'youtube.com', 
            'github.com', 
            'tenor.com', 
            'giphy.com',
            'media.discordapp.net', 
            'cdn.discordapp.com'
        ],
        BLOCKED_LINKS: [
            'discord.gg',
            'discordapp.com/invite'
        ]
    },
    
    // Ustaw tutaj weryfikacje
    VERIFICATION: {
        TYPE: 'math',
        MATH: {
            OPERATIONS: ['+', '-'],
            MIN_NUMBER: 1,
            MAX_NUMBER: 15,
            MAX_RESULT: 15
        },
        EMBED: {
            TITLE: 'KIXIMC.PL × Weryfikacja Konta',
            DESCRIPTION: '> Wybierz opcję z menu poniżej, aby przejść **proces weryfikacji** i odblokować pełny dostęp do serwera! \n \n > W razie problemów z weryfikacją swojego konta, napisz do właściciela w **prywatnej wiadomości**!',
            COLOR: '#FF0000',
            IMAGE: 'https://cdn.discordapp.com/attachments/1495380008657485874/1495380729511542915/KIXIMC.pl_kopia.png?ex=69e60954&is=69e4b7d4&hm=67aeae428642e102095db2b83cd46f17fe4e5e6054b3036bf26aadd59797538a&'
        },
        BUTTON_LABEL: '× Zweryfikuj swoje konto! ×',
        MODAL: {
            TITLE: 'Weryfikacja',
            CUSTOM_ID: 'verificationModal',
            INPUT_LABEL: 'Podaj wynik działania',
            PLACEHOLDER: 'Wpisz odpowiedź...'
        },
        MESSAGES: {
            SUCCESS: 'Pomyślnie zweryfikowano konto!',
            ERROR: 'Niepoprawna odpowiedź!',
            ROLE_ERROR: 'Nie udało się znaleźć roli.',
            SENT: 'Wiadomość weryfikacyjna została wysłana.',
            SEND_ERROR: 'Błąd przy wysyłaniu wiadomości:',
            MODAL_ERROR: 'Błąd przy wyświetlaniu formularza:',
            CHANNEL_ERROR: 'Nie znaleziono kanału weryfikacyjnego'
        }
    },
    
    // Ustaw tutaj propozycje
    PROPOSALS: {
        EMBED: {
            TITLE: 'KIXIMC.PL × Innowacje w zasięgu',
            DESCRIPTION: '> System propozycji pozwala na zgłaszanie pomysłów i głosowanie nad nimi.\n> Kliknij **Dodaj** aby zgłosić nową propozycję!',
            COLOR: '#FF0000',
            IMAGE: 'https://cdn.discordapp.com/attachments/1495380008657485874/1495380729511542915/KIXIMC.pl_kopia.png?ex=69e60954&is=69e4b7d4&hm=67aeae428642e102095db2b83cd46f17fe4e5e6054b3036bf26aadd59797538a&'
        },
        BUTTONS: {
            YES: {
                LABEL: '✓ 0',
                CUSTOM_ID: 'proposal_yes',
                STYLE: 'Success'
            },
            NO: {
                LABEL: '✗ 0',
                CUSTOM_ID: 'proposal_no',
                STYLE: 'Danger'
            },
            ADD: {
                LABEL: 'Dodaj',
                CUSTOM_ID: 'proposal_add',
                STYLE: 'Primary'
            }
        },
        MODAL: {
            TITLE: 'Dodaj nową propozycję',
            CUSTOM_ID: 'proposalModal',
            CONCERN_LABEL: 'Dotyczy',
            CONCERN_PLACEHOLDER: 'Wpisz temat propozycji...',
            CONTENT_LABEL: 'Treść',
            CONTENT_PLACEHOLDER: 'Opisz szczegółowo swoją propozycję...'
        },
        MESSAGES: {
            PROPOSAL_ADDED: 'Propozycja została dodana!',
            VOTE_RECORDED: 'Twój głos został zapisany!',
            ALREADY_VOTED: 'Już głosowałeś na tę propozycję!',
            MODAL_ERROR: 'Błąd przy wyświetlaniu formularza:',
            SEND_ERROR: 'Błąd przy wysyłaniu propozycji:',
            CHANNEL_ERROR: 'Nie znaleziono kanału propozycji'
        }
    },
    
    MESSAGES: {
        TICKET_CREATED: 'Ticket utworzony! :Tak:',
        TICKET_ERROR: 'Wystąpił błąd podczas tworzenia ticketa.',
        COOLDOWN: 'Musisz poczekać {time} sekund, zanim utworzysz kolejny ticket.',
        EXISTING_TICKET: 'Masz już otwarty ticket. Zamknij go, zanim utworzysz nowy.',
        NO_PERMISSION: 'Nie masz uprawnień do {action}!',
        CLOSING_TICKET: 'Zamykam ticket za 5 sekund...',
        TICKET_CLAIMED: 'Ticket został przejęty przez <@{userId}>.',
        TICKET_UNCLAIMED: '<@{userId}> opuścił ticketa',
        ROLE_ADDED: 'Rola {roleName} została nadana użytkownika {userTag}'
    },
    
    LOGS: {
        BOT_READY: 'Bot zalogowany jako {tag}',
        BOT_ONLINE: 'Bot jest online jako {tag}',
        TICKET_CREATED: 'Ticket utworzony!',
        TICKET_DELETED: 'Stara wiadomość ticketów została usunięta.',
        TICKET_ERROR: 'Błąd w wysyłaniu wiadomości na kanał ticketów:',
        TICKET_SENT: 'Wiadomość z ticketami została wysłana.',
        MESSAGE_DELETED: 'Usunięto wiadomość od {tag} ({id}) | Treść: "{content}"',
        ROLE_ERROR: 'Błąd przy nadawaniu roli:',
        TICKET_CLAIM_ERROR: 'Błąd przy przejmowaniu ticketu:',
        TICKET_UNCLAIM_ERROR: 'Błąd przy odprzejmowaniu ticketu:',
        MESSAGE_DELETE_ERROR: '❌ Błąd przy usuwaniu wiadomości:',
        ROLE_NOT_FOUND: 'Nie znaleziono roli!'
    }
};
