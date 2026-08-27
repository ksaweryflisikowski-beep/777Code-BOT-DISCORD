const {
    Client,
    GatewayIntentBits,
    Partials,
    ActionRowBuilder,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ButtonBuilder,
    SlashCommandBuilder,
    ButtonStyle,
    ChannelType,
    REST,
    Routes,
    StringSelectMenuBuilder,
    ActivityType
} = require('discord.js');

const config = require('./config.js');

// ==========================================
// SPRAWDZANIE KONFIGURACJI
// ==========================================

if (!config.TOKEN) {
    console.error('❌ Brak TOKEN.');
    console.error('Wejdź w Bot-Hosting → Env i ustaw TOKEN.');
    process.exit(1);
}

if (!config.CLIENT_ID) {
    console.error('❌ Brak CLIENT_ID.');
    console.error('Ustaw CLIENT_ID w Bot-Hosting → Env.');
    process.exit(1);
}

if (!config.GUILD_ID) {
    console.error('❌ Brak GUILD_ID.');
    console.error('Ustaw GUILD_ID w Bot-Hosting → Env.');
    process.exit(1);
}

// ==========================================
// CLIENT
// ==========================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates
    ],

    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction
    ]
});

// ==========================================
// ZMIENNE
// ==========================================

const cooldowns = new Map();
const verificationQuestions = new Map();
const proposalVotes = new Map();

// ==========================================
// SLASH COMMANDS
// ==========================================

const commands = [
    new SlashCommandBuilder()
        .setName('propozycje')
        .setDescription('Otwórz formularz dodawania propozycji')
        .toJSON()
];

// ==========================================
// FUNKCJE
// ==========================================

function formatDateTime(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

function isAdmin(member) {
    return member.roles.cache.has(config.ROLES.ADMIN);
}

// ==========================================
// GOTOWOŚĆ BOTA
// ==========================================

client.once('ready', async () => {

    console.log(`🟢 Bot uruchomiony jako ${client.user.tag}`);

    // STATUS

    client.user.setPresence({
        activities: [
            {
                name: config.BOT.NAME,
                type: config.BOT.ACTIVITY_TYPE
            }
        ],
        status: config.BOT.STATUS
    });

    console.log(`🟢 Bot jest online jako ${client.user.tag}`);

    // ======================================
    // REJESTRACJA SLASH COMMANDS
    // ======================================

    try {
        const rest = new REST({ version: '10' })
            .setToken(config.TOKEN);

        console.log('🔄 Rejestrowanie slash commands...');

        await rest.put(
            Routes.applicationGuildCommands(
                config.CLIENT_ID,
                config.GUILD_ID
            ),
            {
                body: commands
            }
        );

        console.log('✅ Slash commands zostały zarejestrowane!');
    } catch (error) {
        console.error(
            '❌ Błąd podczas rejestracji slash commands:',
            error
        );
    }

    // ======================================
    // PANEL TICKETÓW
    // ======================================

    await setupTicketPanel();

    // ======================================
    // PANEL WERYFIKACJI
    // ======================================

    await setupVerificationPanel();
});

// ==========================================
// PANEL TICKETÓW
// ==========================================

async function setupTicketPanel() {

    try {

        const channel = await client.channels.fetch(
            config.CHANNELS.TICKETS
        );

        if (!channel) {
            console.error('❌ Nie znaleziono kanału ticketów.');
            return;
        }

        const oldMessages = await channel.messages.fetch({
            limit: 50
        });

        for (const message of oldMessages.values()) {

            if (
                message.author.id === client.user.id &&
                message.embeds.length > 0 &&
                message.embeds[0].title ===
                config.EMBEDS.TICKET_PANEL.TITLE
            ) {

                await message.delete().catch(() => {});
            }
        }

        const menu = new StringSelectMenuBuilder()
            .setCustomId('ticket_category')
            .setPlaceholder('🎫 Wybierz kategorię ticketu')
            .addOptions(config.TICKETS.CATEGORIES);

        const row = new ActionRowBuilder()
            .addComponents(menu);

        const embed = new EmbedBuilder()
            .setColor(config.EMBEDS.TICKET_PANEL.COLOR)
            .setTitle(config.EMBEDS.TICKET_PANEL.TITLE)
            .setDescription(
                config.EMBEDS.TICKET_PANEL.DESCRIPTION
            )
            .setFooter({
                text:
                    `${config.BOT.FOOTER_TEXT} • ` +
                    formatDateTime(new Date())
            });

        if (config.EMBEDS.TICKET_PANEL.IMAGE) {
            embed.setImage(config.EMBEDS.TICKET_PANEL.IMAGE);
        }

        await channel.send({
            embeds: [embed],
            components: [row]
        });

        console.log('🎫 Panel ticketów został wysłany.');

    } catch (error) {

        console.error(
            '❌ Błąd panelu ticketów:',
            error
        );
    }
}

// ==========================================
// PANEL WERYFIKACJI
// ==========================================

async function setupVerificationPanel() {

    try {

        const channel = await client.channels.fetch(
            config.CHANNELS.VERIFICATION
        );

        if (!channel) {
            console.error('❌ Nie znaleziono kanału weryfikacji.');
            return;
        }

        const oldMessages = await channel.messages.fetch({
            limit: 50
        });

        for (const message of oldMessages.values()) {

            if (
                message.author.id === client.user.id &&
                message.embeds.length > 0 &&
                message.embeds[0].title ===
                config.VERIFICATION.EMBED.TITLE
            ) {

                await message.delete().catch(() => {});
            }
        }

        const button = new ButtonBuilder()
            .setCustomId('start_verification')
            .setLabel(
                config.VERIFICATION.BUTTON_LABEL
            )
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder()
            .addComponents(button);

        const embed = new EmbedBuilder()
            .setColor(config.VERIFICATION.EMBED.COLOR)
            .setTitle(config.VERIFICATION.EMBED.TITLE)
            .setDescription(
                config.VERIFICATION.EMBED.DESCRIPTION
            )
            .setFooter({
                text:
                    `${config.BOT.FOOTER_TEXT} • ` +
                    formatDateTime(new Date())
            });

        if (config.VERIFICATION.EMBED.IMAGE) {
            embed.setImage(
                config.VERIFICATION.EMBED.IMAGE
            );
        }

        await channel.send({
            embeds: [embed],
            components: [row]
        });

        console.log('✅ Panel weryfikacji został wysłany.');

    } catch (error) {

        console.error(
            '❌ Błąd panelu weryfikacji:',
            error
        );
    }
}

// ==========================================
// INTERAKCJE
// ==========================================

client.on('interactionCreate', async interaction => {

    try {

        // ==================================
        // SLASH COMMAND
        // ==================================

        if (interaction.isChatInputCommand()) {

            if (
                interaction.commandName ===
                'propozycje'
            ) {

                const modal = new ModalBuilder()
                    .setCustomId(
                        config.PROPOSALS.MODAL.CUSTOM_ID
                    )
                    .setTitle(
                        config.PROPOSALS.MODAL.TITLE
                    );

                const concernInput =
                    new TextInputBuilder()
                        .setCustomId(
                            'proposalConcern'
                        )
                        .setLabel(
                            config.PROPOSALS.MODAL.CONCERN_LABEL
                        )
                        .setPlaceholder(
                            config.PROPOSALS.MODAL.CONCERN_PLACEHOLDER
                        )
                        .setStyle(
                            TextInputStyle.Short
                        )
                        .setRequired(true);

                const contentInput =
                    new TextInputBuilder()
                        .setCustomId(
                            'proposalContent'
                        )
                        .setLabel(
                            config.PROPOSALS.MODAL.CONTENT_LABEL
                        )
                        .setPlaceholder(
                            config.PROPOSALS.MODAL.CONTENT_PLACEHOLDER
                        )
                        .setStyle(
                            TextInputStyle.Paragraph
                        )
                        .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder()
                        .addComponents(concernInput),

                    new ActionRowBuilder()
                        .addComponents(contentInput)
                );

                await interaction.showModal(modal);
            }

            return;
        }

        // ==================================
        // TICKET CATEGORY
        // ==================================

        if (
            interaction.isStringSelectMenu() &&
            interaction.customId === 'ticket_category'
        ) {

            const cooldown =
                cooldowns.get(interaction.user.id);

            if (
                cooldown &&
                cooldown > Date.now()
            ) {

                const remaining = Math.ceil(
                    (cooldown - Date.now()) / 1000
                );

                return interaction.reply({
                    content:
                        config.MESSAGES.COOLDOWN.replace(
                            '{time}',
                            remaining
                        ),
                    ephemeral: true
                });
            }

            const existingTicket =
                interaction.guild.channels.cache.find(
                    channel =>
                        channel.name.startsWith(
                            `ticket-${interaction.user.id}`
                        ) &&
                        channel.type ===
                        ChannelType.GuildText
                );

            if (existingTicket) {

                return interaction.reply({
                    content:
                        config.MESSAGES.EXISTING_TICKET,
                    ephemeral: true
                });
            }

            const selected =
                interaction.values[0];

            const selectedCategory =
                config.TICKETS.CATEGORIES.find(
                    category =>
                        category.value === selected
                );

            const channelName =
                `ticket-${interaction.user.id}`;

            try {

                cooldowns.set(
                    interaction.user.id,
                    Date.now() +
                    config.TICKETS.COOLDOWN
                );

                const adminRole =
                    interaction.guild.roles.cache.get(
                        config.ROLES.ADMIN
                    );

                if (!adminRole) {

                    return interaction.reply({
                        content:
                            '❌ Nie znaleziono roli administracji.',
                        ephemeral: true
                    });
                }

                const ticketCategory =
                    interaction.guild.channels.cache.get(
                        config.CATEGORIES.TICKETS
                    );

                if (!ticketCategory) {

                    return interaction.reply({
                        content:
                            '❌ Nie znaleziono kategorii ticketów.',
                        ephemeral: true
                    });
                }

                const ticketChannel =
                    await interaction.guild.channels.create({
                        name: channelName,
                        type: ChannelType.GuildText,
                        parent: ticketCategory.id,

                        permissionOverwrites: [
                            {
                                id:
                                    interaction.guild.id,

                                deny: [
                                    'ViewChannel'
                                ]
                            },

                            {
                                id:
                                    interaction.user.id,

                                allow: [
                                    'ViewChannel',
                                    'SendMessages',
                                    'ReadMessageHistory'
                                ]
                            },

                            {
                                id:
                                    adminRole.id,

                                allow: [
                                    'ViewChannel',
                                    'SendMessages',
                                    'ReadMessageHistory',
                                    'ManageChannels'
                                ]
                            }
                        ]
                    });

                const embed =
                    new EmbedBuilder()
                        .setColor(0x5865F2)
                        .setTitle('🎫 Ticket')
                        .setDescription(
                            `**Kategoria:** ${selectedCategory?.label || selected}\n\n` +
                            `**Użytkownik:** ${interaction.user}\n` +
                            `**Utworzono:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
                            `Opisz tutaj swój problem. Administracja odpowie tak szybko, jak będzie mogła.`
                        )
                        .setFooter({
                            text:
                                config.BOT.FOOTER_TEXT
                        });

                const manageMenu =
                    new StringSelectMenuBuilder()
                        .setCustomId(
                            'ticket_manage'
                        )
                        .setPlaceholder(
                            '⚙️ Zarządzaj ticketem'
                        )
                        .addOptions(
                            config.TICKETS.MANAGEMENT_OPTIONS
                        );

                const row =
                    new ActionRowBuilder()
                        .addComponents(
                            manageMenu
                        );

                await ticketChannel.send({
                    content:
                        `${interaction.user}`,
                    embeds: [embed],
                    components: [row]
                });

                await interaction.reply({
                    content:
                        config.MESSAGES.TICKET_CREATED
                            .replace(
                                '{channelId}',
                                ticketChannel.id
                            ),
                    ephemeral: true
                });

            } catch (error) {

                console.error(
                    '❌ Błąd tworzenia ticketa:',
                    error
                );

                await interaction.reply({
                    content:
                        config.MESSAGES.TICKET_ERROR,
                    ephemeral: true
                });
            }

            return;
        }

        // ==================================
        // TICKET MANAGEMENT
        // ==================================

        if (
            interaction.isStringSelectMenu() &&
            interaction.customId === 'ticket_manage'
        ) {

            const selected =
                interaction.values[0];

            // CLOSE

            if (selected === 'close_ticket') {

                if (!isAdmin(interaction.member)) {

                    return interaction.reply({
                        content:
                            config.MESSAGES.NO_PERMISSION
                                .replace(
                                    '{action}',
                                    'zamknięcia ticketu'
                                ),
                        ephemeral: true
                    });
                }

                await interaction.reply({
                    content:
                        config.MESSAGES.CLOSING_TICKET,
                    ephemeral: false
                });

                setTimeout(() => {

                    interaction.channel
                        .delete()
                        .catch(() => {});

                }, 5000);

                return;
            }

            // CLAIM

            if (selected === 'claim_ticket') {

                if (!isAdmin(interaction.member)) {

                    return interaction.reply({
                        content:
                            config.MESSAGES.NO_PERMISSION
                                .replace(
                                    '{action}',
                                    'przejęcia ticketu'
                                ),
                        ephemeral: true
                    });
                }

                try {

                    await interaction.channel.permissionOverwrites.edit(
                        interaction.member.id,
                        {
                            ViewChannel: true,
                            SendMessages: true,
                            ReadMessageHistory: true
                        }
                    );

                    await interaction.reply({
                        content:
                            config.MESSAGES.TICKET_CLAIMED
                                .replace(
                                    '{userId}',
                                    interaction.member.id
                                )
                    });

                } catch (error) {

                    console.error(error);

                    await interaction.reply({
                        content:
                            '❌ Nie udało się przejąć ticketu.',
                        ephemeral: true
                    });
                }

                return;
            }

            // UNCLAIM

            if (selected === 'unclaim_ticket') {

                if (!isAdmin(interaction.member)) {

                    return interaction.reply({
                        content:
                            config.MESSAGES.NO_PERMISSION
                                .replace(
                                    '{action}',
                                    'odprzejęcia ticketu'
                                ),
                        ephemeral: true
                    });
                }

                try {

                    await interaction.channel.permissionOverwrites.delete(
                        interaction.member.id
                    ).catch(() => {});

                    await interaction.reply({
                        content:
                            config.MESSAGES.TICKET_UNCLAIMED
                                .replace(
                                    '{userId}',
                                    interaction.member.id
                                )
                    });

                } catch (error) {

                    console.error(error);

                    await interaction.reply({
                        content:
                            '❌ Nie udało się odprzejąć ticketu.',
                        ephemeral: true
                    });
                }

                return;
            }
        }

        // ==================================
        // START WERYFIKACJI
        // ==================================

        if (
            interaction.isButton() &&
            interaction.customId ===
            'start_verification'
        ) {

            const mathQuestion =
                generateMathQuestion();

            verificationQuestions.set(
                interaction.user.id,
                mathQuestion
            );

            const input =
                new TextInputBuilder()
                    .setCustomId(
                        'verificationAnswer'
                    )
                    .setLabel(
                        `Ile to ${mathQuestion.question}?`
                    )
                    .setPlaceholder(
                        config.VERIFICATION.MODAL.PLACEHOLDER
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        config.VERIFICATION.MODAL.CUSTOM_ID
                    )
                    .setTitle(
                        config.VERIFICATION.MODAL.TITLE
                    )
                    .addComponents(
                        new ActionRowBuilder()
                            .addComponents(input)
                    );

            await interaction.showModal(modal);

            return;
        }

        // ==================================
        // WERYFIKACJA
        // ==================================

        if (
            interaction.isModalSubmit() &&
            interaction.customId ===
            config.VERIFICATION.MODAL.CUSTOM_ID
        ) {

            const answer =
                interaction.fields.getTextInputValue(
                    'verificationAnswer'
                );

            const question =
                verificationQuestions.get(
                    interaction.user.id
                );

            if (!question) {

                return interaction.reply({
                    content:
                        '❌ Weryfikacja wygasła. Kliknij przycisk ponownie.',
                    ephemeral: true
                });
            }

            verificationQuestions.delete(
                interaction.user.id
            );

            if (
                answer.trim() !==
                question.answer
            ) {

                return interaction.reply({
                    content:
                        `${config.VERIFICATION.MESSAGES.ERROR} Spróbuj ponownie.`,
                    ephemeral: true
                });
            }

            const role =
                interaction.guild.roles.cache.get(
                    config.ROLES.VERIFIED
                );

            if (!role) {

                return interaction.reply({
                    content:
                        config.VERIFICATION.MESSAGES.ROLE_ERROR,
                    ephemeral: true
                });
            }

            try {

                await interaction.member.roles.add(
                    role
                );

                await interaction.reply({
                    content:
                        config.VERIFICATION.MESSAGES.SUCCESS,
                    ephemeral: true
                });

            } catch (error) {

                console.error(error);

                await interaction.reply({
                    content:
                        '❌ Nie mogę nadać Ci rangi. Sprawdź uprawnienia bota.',
                    ephemeral: true
                });
            }

            return;
        }

        // ==================================
        // PROPOZYCJE - PRZYCISK
        // ==================================

        if (
            interaction.isButton() &&
            interaction.customId ===
            'proposal_add'
        ) {

            const concernInput =
                new TextInputBuilder()
                    .setCustomId(
                        'proposalConcern'
                    )
                    .setLabel(
                        config.PROPOSALS.MODAL.CONCERN_LABEL
                    )
                    .setPlaceholder(
                        config.PROPOSALS.MODAL.CONCERN_PLACEHOLDER
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const contentInput =
                new TextInputBuilder()
                    .setCustomId(
                        'proposalContent'
                    )
                    .setLabel(
                        config.PROPOSALS.MODAL.CONTENT_LABEL
                    )
                    .setPlaceholder(
                        config.PROPOSALS.MODAL.CONTENT_PLACEHOLDER
                    )
                    .setStyle(
                        TextInputStyle.Paragraph
                    )
                    .setRequired(true);

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        config.PROPOSALS.MODAL.CUSTOM_ID
                    )
                    .setTitle(
                        config.PROPOSALS.MODAL.TITLE
                    )
                    .addComponents(
                        new ActionRowBuilder()
                            .addComponents(
                                concernInput
                            ),

                        new ActionRowBuilder()
                            .addComponents(
                                contentInput
                            )
                    );

            await interaction.showModal(modal);

            return;
        }

        // ==================================
        // GŁOSOWANIE
        // ==================================

        if (
            interaction.isButton() &&
            (
                interaction.customId ===
                'proposal_yes' ||

                interaction.customId ===
                'proposal_no'
            )
        ) {

            const messageId =
                interaction.message.id;

            if (!proposalVotes.has(messageId)) {

                proposalVotes.set(
                    messageId,
                    {
                        yes: new Set(),
                        no: new Set()
                    }
                );
            }

            const votes =
                proposalVotes.get(messageId);

            const userId =
                interaction.user.id;

            if (
                votes.yes.has(userId) ||
                votes.no.has(userId)
            ) {

                return interaction.reply({
                    content:
                        config.PROPOSALS.MESSAGES.ALREADY_VOTED,
                    ephemeral: true
                });
            }

            if (
                interaction.customId ===
                'proposal_yes'
            ) {

                votes.yes.add(userId);

            } else {

                votes.no.add(userId);
            }

            const yesButton =
                new ButtonBuilder()
                    .setCustomId(
                        'proposal_yes'
                    )
                    .setLabel(
                        `👍 ${votes.yes.size}`
                    )
                    .setStyle(
                        ButtonStyle.Success
                    );

            const noButton =
                new ButtonBuilder()
                    .setCustomId(
                        'proposal_no'
                    )
                    .setLabel(
                        `👎 ${votes.no.size}`
                    )
                    .setStyle(
                        ButtonStyle.Danger
                    );

            const addButton =
                new ButtonBuilder()
                    .setCustomId(
                        'proposal_add'
                    )
                    .setLabel(
                        config.PROPOSALS.BUTTONS.ADD.LABEL
                    )
                    .setStyle(
                        ButtonStyle.Primary
                    );

            const row =
                new ActionRowBuilder()
                    .addComponents(
                        yesButton,
                        noButton,
                        addButton
                    );

            await interaction.update({
                components: [row]
            });

            return;
        }

        // ==================================
        // DODAWANIE PROPOZYCJI
        // ==================================

        if (
            interaction.isModalSubmit() &&
            interaction.customId ===
            config.PROPOSALS.MODAL.CUSTOM_ID
        ) {

            const concern =
                interaction.fields.getTextInputValue(
                    'proposalConcern'
                );

            const content =
                interaction.fields.getTextInputValue(
                    'proposalContent'
                );

            const channel =
                client.channels.cache.get(
                    config.CHANNELS.PROPOSALS
                );

            if (!channel) {

                return interaction.reply({
                    content:
                        config.PROPOSALS.MESSAGES.CHANNEL_ERROR,
                    ephemeral: true
                });
            }

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.PROPOSALS.EMBED.COLOR
                    )
                    .setTitle(
                        '💡 Nowa propozycja'
                    )
                    .addFields(
                        {
                            name: '👤 Autor',
                            value:
                                `${interaction.user}`,
                            inline: true
                        },
                        {
                            name: '🎮 Dotyczy',
                            value:
                                concern,
                            inline: true
                        },
                        {
                            name: '📝 Treść',
                            value:
                                content,
                            inline: false
                        }
                    )
                    .setFooter({
                        text:
                            `${config.BOT.FOOTER_TEXT} • ` +
                            formatDateTime(new Date())
                    });

            const yesButton =
                new ButtonBuilder()
                    .setCustomId(
                        'proposal_yes'
                    )
                    .setLabel('👍 0')
                    .setStyle(
                        ButtonStyle.Success
                    );

            const noButton =
                new ButtonBuilder()
                    .setCustomId(
                        'proposal_no'
                    )
                    .setLabel('👎 0')
                    .setStyle(
                        ButtonStyle.Danger
                    );

            const addButton =
                new ButtonBuilder()
                    .setCustomId(
                        'proposal_add'
                    )
                    .setLabel(
                        config.PROPOSALS.BUTTONS.ADD.LABEL
                    )
                    .setStyle(
                        ButtonStyle.Primary
                    );

            const row =
                new ActionRowBuilder()
                    .addComponents(
                        yesButton,
                        noButton,
                        addButton
                    );

            const message =
                await channel.send({
                    embeds: [embed],
                    components: [row]
                });

            proposalVotes.set(
                message.id,
                {
                    yes: new Set(),
                    no: new Set()
                }
            );

            await interaction.reply({
                content:
                    config.PROPOSALS.MESSAGES.PROPOSAL_ADDED,
                ephemeral: true
            });

            return;
        }

    } catch (error) {

        console.error(
            '❌ Błąd interactionCreate:',
            error
        );

        if (!interaction.replied &&
            !interaction.deferred) {

            await interaction.reply({
                content:
                    '❌ Wystąpił nieoczekiwany błąd.',
                ephemeral: true
            }).catch(() => {});
        }
    }
});

// ==========================================
// POWITANIE + RANGA PLAYER
// ==========================================

client.on(
    'guildMemberAdd',
    async member => {

        try {

            const role =
                member.guild.roles.cache.get(
                    config.ROLES.PLAYER
                );

            if (role) {

                await member.roles.add(role);

                console.log(
                    config.MESSAGES.ROLE_ADDED
                        .replace(
                            '{roleName}',
                            role.name
                        )
                        .replace(
                            '{userTag}',
                            member.user.tag
                        )
                );
            }

        } catch (error) {

            console.error(
                '❌ Nie udało się nadać rangi:',
                error
            );
        }

        try {

            const channel =
                member.guild.channels.cache.get(
                    config.CHANNELS.WELCOME
                );

            if (!channel) return;

            const embed =
                new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setTitle(
                        `👋 Witaj ${member.user.username}!`
                    )
                    .setDescription(
                        `Witamy na serwerze!\n\n` +
                        `Jesteś **${member.guild.memberCount}** osobą na serwerze.`
                    )
                    .setThumbnail(
                        member.user.displayAvatarURL({
                            size: 256
                        })
                    )
                    .setFooter({
                        text:
                            config.BOT.FOOTER_TEXT
                    });

            await channel.send({
                embeds: [embed]
            });

        } catch (error) {

            console.error(
                '❌ Błąd wiadomości powitalnej:',
                error
            );
        }
    }
);

// ==========================================
// AUTOMOD
// ==========================================

client.on(
    'messageCreate',
    async message => {

        if (message.author.bot) return;
        if (!message.guild) return;

        if (
            message.member &&
            isAdmin(message.member)
        ) {
            return;
        }

        const content =
            message.content.toLowerCase();

        // WULGARYZMY

        const badWord =
            config.AUTOMOD.BAD_WORDS.some(
                word =>
                    content.includes(
                        word.toLowerCase()
                    )
            );

        if (badWord) {

            try {
                await message.delete();
            } catch {}

            return;
        }

        // LINKI

        const urls =
            message.content.match(
                /https?:\/\/[^\s]+/gi
            );

        if (!urls) return;

        const allAllowed =
            urls.every(url => {

                try {

                    const parsed =
                        new URL(url);

                    const domain =
                        parsed.hostname
                            .toLowerCase()
                            .replace(
                                /^www\./,
                                ''
                            );

                    return config.AUTOMOD.ALLOWED_DOMAINS.some(
                        allowed => {

                            allowed =
                                allowed
                                    .toLowerCase()
                                    .replace(
                                        /^www\./,
                                        ''
                                    );

                            return (
                                domain === allowed ||
                                domain.endsWith(
                                    `.${allowed}`
                                )
                            );
                        }
                    );

                } catch {

                    return false;
                }
            });

        if (!allAllowed) {

            try {
                await message.delete();
            } catch {}

            console.log(
                config.LOGS.MESSAGE_DELETED
                    .replace(
                        '{tag}',
                        message.author.tag
                    )
                    .replace(
                        '{id}',
                        message.author.id
                    )
                    .replace(
                        '{content}',
                        message.content
                    )
            );
        }
    }
);

// ==========================================
// MATEMATYKA
// ==========================================

function generateMathQuestion() {

    const {
        MIN_NUMBER,
        MAX_NUMBER,
        OPERATIONS,
        MAX_RESULT
    } = config.VERIFICATION.MATH;

    let question;
    let answer;

    for (let i = 0; i < 20; i++) {

        const num1 =
            Math.floor(
                Math.random() *
                (MAX_NUMBER - MIN_NUMBER + 1)
            ) +
            MIN_NUMBER;

        const num2 =
            Math.floor(
                Math.random() *
                (MAX_NUMBER - MIN_NUMBER + 1)
            ) +
            MIN_NUMBER;

        const operation =
            OPERATIONS[
                Math.floor(
                    Math.random() *
                    OPERATIONS.length
                )
            ];

        if (operation === '+') {

            answer =
                num1 + num2;

            question =
                `${num1} + ${num2}`;

        } else if (operation === '-') {

            const bigger =
                Math.max(num1, num2);

            const smaller =
                Math.min(num1, num2);

            answer =
                bigger - smaller;

            question =
                `${bigger} - ${smaller}`;

        } else if (operation === '*') {

            answer =
                num1 * num2;

            question =
                `${num1} × ${num2}`;
        }

        if (answer <= MAX_RESULT) {
            break;
        }
    }

    return {
        question,
        answer: String(answer)
    };
}

// ==========================================
// LOGIN
// ==========================================

client.login(config.TOKEN)
    .catch(error => {

        console.error(
            '❌ Nie udało się zalogować bota:',
            error
        );

        process.exit(1);
    });
