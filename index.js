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
    Events,
    ButtonStyle,
    ChannelType,
    InteractionType,
    REST,
    Routes,
    StringSelectMenuBuilder,
    InteractionResponseType
} = require('discord.js');

const config = require('./config.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction
    ]
});

const commands = [
    new SlashCommandBuilder()
        .setName('propozycje')
        .setDescription('Otwórz formularz dodawania propozycji')
];

if (!config.TOKEN) {
    console.error('Token bota nie został ustawiony! Sprawdź konfigurację.');
    process.exit(1);
}

const tempChannels = new Set();
const cooldowns = new Map();

const proposalVotes = new Map();
const proposals = new Map();

// ========== FUNKCJE POMOCNICZE ========== //

function formatDateTime(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

function formatDiscordTime(date) {
    return `<t:${Math.floor(date.getTime() / 1000)}:R>`;
}

// ========== SYSTEM TICKETÓW ========== //

client.once('ready', async () => {
    console.log(config.LOGS.BOT_READY.replace('{tag}', client.user.tag));

    try {
        const rest = new REST({ version: '10' }).setToken(config.TOKEN);
        console.log('Rozpoczynam rejestrację slash commands...');
        
        await rest.put(
            Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID),
            { body: commands }
        );
        
        console.log('Slash commands zostały zarejestrowane!');
    } catch (error) {
        console.error('Błąd przy rejestracji slash commands:', error);
    }

    try {
        const ticketsChannel = await client.channels.fetch(config.CHANNELS.TICKETS);
        if (ticketsChannel) {
            const ticketMenu = new StringSelectMenuBuilder()
                .setCustomId('ticket_category')
                .setPlaceholder('🎫| Wybierz odpowiednią kategorię ticketa')
                .addOptions(config.TICKETS.CATEGORIES);

            const ticketRow = new ActionRowBuilder().addComponents(ticketMenu);

            const ticketEmbed = new EmbedBuilder()
                .setColor(config.EMBEDS.TICKET_PANEL.COLOR)
                .setTitle(config.EMBEDS.TICKET_PANEL.TITLE)
                .setDescription(config.EMBEDS.TICKET_PANEL.DESCRIPTION)
                .setImage(config.EMBEDS.TICKET_PANEL.IMAGE)
                .setFooter({ text: `${config.BOT.FOOTER_TEXT} • ${formatDateTime(new Date())}` });

            const messages = await ticketsChannel.messages.fetch({ limit: 50 });
            const oldTicketMessage = messages.find(msg => 
                msg.author.id === client.user.id &&
                msg.embeds.length > 0 &&
                msg.embeds[0].title === config.EMBEDS.TICKET_PANEL.TITLE
            );

            if (oldTicketMessage) {
                try {
                    await oldTicketMessage.delete();
                    console.log(config.LOGS.TICKET_DELETED);
                } catch (err) {
                    console.error(config.LOGS.TICKET_ERROR, err);
                }
            }

            await ticketsChannel.send({ embeds: [ticketEmbed], components: [ticketRow] });
            console.log(config.LOGS.TICKET_SENT);
        }
    } catch (error) {
        console.error(config.LOGS.TICKET_ERROR, error);
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'propozycje') {
            const modal = new ModalBuilder()
                .setCustomId(config.PROPOSALS.MODAL.CUSTOM_ID)
                .setTitle(config.PROPOSALS.MODAL.TITLE)
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('proposalConcern')
                            .setLabel(config.PROPOSALS.MODAL.CONCERN_LABEL)
                            .setPlaceholder(config.PROPOSALS.MODAL.CONCERN_PLACEHOLDER)
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('proposalContent')
                            .setLabel(config.PROPOSALS.MODAL.CONTENT_LABEL)
                            .setPlaceholder(config.PROPOSALS.MODAL.CONTENT_PLACEHOLDER)
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                    )
                );

            try {
                await interaction.showModal(modal);
            } catch (error) {
                console.error(config.PROPOSALS.MESSAGES.MODAL_ERROR, error);
            }
        }
    }

    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'ticket_category') {
            const cooldown = cooldowns.get(interaction.user.id);
            if (cooldown && cooldown > Date.now()) {
                const remaining = Math.ceil((cooldown - Date.now()) / 1000);
                return interaction.reply({
                    content: config.MESSAGES.COOLDOWN.replace('{time}', remaining),
                    flags: [1 << 6]
                });
            }

            const existingTicket = interaction.guild.channels.cache.find(
                channel => channel.name.startsWith(`ticket-${interaction.user.username}`) && !channel.name.endsWith('-closed')
            );
            if (existingTicket) {
                return interaction.reply({
                    content: config.MESSAGES.EXISTING_TICKET,
                    flags: [1 << 6]
                });
            }

            const selected = interaction.values[0];
            const categoryName = selected;
            const channelName = `ticket-${interaction.user.username}-${Date.now()}`;

            try {
                cooldowns.set(interaction.user.id, Date.now() + config.TICKETS.COOLDOWN);

                const adminRole = interaction.guild.roles.cache.get(config.ROLES.ADMIN);
                if (!adminRole) {
                    console.error(`Rola ADMIN o ID ${config.ROLES.ADMIN} nie została znaleziona!`);
                    return interaction.reply({
                        content: 'Błąd: Rola administratora nie została znaleziona.',
                        flags: [1 << 6]
                    });
                }

                const ticketCategory = interaction.guild.channels.cache.get(config.CATEGORIES.TICKETS);
                if (!ticketCategory) {
                    console.error(`Kategoria ticketów o ID ${config.CATEGORIES.TICKETS} nie została znaleziona!`);
                    return interaction.reply({
                        content: 'Błąd: Kategoria ticketów nie została znaleziona.',
                        flags: [1 << 6]
                    });
                }

                const permissionOverwrites = [
                    { id: interaction.guild.id, deny: ['ViewChannel'] },
                    { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
                    { id: adminRole.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageChannels'] },
                ];

                const ticketChannel = await interaction.guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    parent: ticketCategory.id,
                    permissionOverwrites: permissionOverwrites,
                });

                const ticketEmbed = new EmbedBuilder()
                    .setColor(config.EMBEDS.TICKET_PANEL.COLOR)
                    .setTitle(`Utworzono Ticket`)
                    .setDescription(`**Kategoria:** \`${categoryName}\`\n**Utworzono:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                    .setImage(config.EMBEDS.TICKET_PANEL.IMAGE)
                    .setFooter({ text: `${config.BOT.FOOTER_TEXT} • ${formatDateTime(new Date())}` });

                const ticketManageMenu = new StringSelectMenuBuilder()
                    .setCustomId('ticket_manage')
                    .setPlaceholder('⚙️| Zarządzaj ticketem')
                    .addOptions(config.TICKETS.MANAGEMENT_OPTIONS);

                const menuRow = new ActionRowBuilder().addComponents(ticketManageMenu);

                await ticketChannel.send({
                    content: `${interaction.user}, twój ticket został utworzony`,
                    embeds: [ticketEmbed],
                    components: [menuRow]
                });

                await interaction.reply({
                    content: config.MESSAGES.TICKET_CREATED.replace('{channelId}', ticketChannel.id),
                    flags: [1 << 6]
                });

            } catch (error) {
                console.error('Błąd przy tworzeniu ticketa:', error);
                await interaction.reply({ 
                    content: config.MESSAGES.TICKET_ERROR, 
                    flags: [1 << 6]
                });
            }
        }

        if (interaction.customId === 'ticket_manage') {
            const selected = interaction.values[0];

            switch (selected) {
                case 'close_ticket':
                    if (!interaction.member.roles.cache.has(config.ROLES.ADMIN)) {
                        return interaction.reply({ 
                            content: config.MESSAGES.NO_PERMISSION.replace('{action}', 'zamknięcia tego ticketa'), 
                            flags: [1 << 6]
                        });
                    }
                    await interaction.reply({ 
                        content: config.MESSAGES.CLOSING_TICKET, 
                        flags: [1 << 6]
                    });
                    setTimeout(() => interaction.channel.delete().catch(console.error), 5000);
                    break;

                case 'claim_ticket':
                    if (!interaction.member.roles.cache.has(config.ROLES.ADMIN)) {
                        return interaction.reply({ 
                            content: config.MESSAGES.NO_PERMISSION.replace('{action}', 'przejęcia tego ticketa'), 
                            flags: [1 << 6]
                        });
                    }
                    try {
                        await interaction.channel.permissionOverwrites.delete(config.ROLES.ADMIN);
                        await interaction.channel.permissionOverwrites.edit(interaction.member.id, {
                            ViewChannel: true,
                            SendMessages: true,
                            ReadMessageHistory: true
                        });
                        await interaction.reply({ 
                            content: config.MESSAGES.TICKET_CLAIMED.replace('{userId}', interaction.member.id)
                        });
                    } catch (error) {
                        console.error(config.LOGS.TICKET_CLAIM_ERROR, error);
                        await interaction.reply({ 
                            content: 'Wystąpił błąd podczas przejmowania ticketa.', 
                            flags: [1 << 6]
                        });
                    }
                    break;

                case 'unclaim_ticket':
                    if (!interaction.member.roles.cache.has(config.ROLES.ADMIN)) {
                        return interaction.reply({ 
                            content: config.MESSAGES.NO_PERMISSION.replace('{action}', 'odprzejmowania tego ticketa'), 
                            flags: [1 << 6]
                        });
                    }
                    const hasClaimed = (
                        interaction.channel.permissionOverwrites.cache.has(interaction.member.id) &&
                        !interaction.channel.permissionOverwrites.cache.has(config.ROLES.ADMIN)
                    );
                    if (!hasClaimed) {
                        return interaction.reply({
                            content: 'Nie możesz opuścić ticketa, którego nie przejąłeś!',
                            flags: [1 << 6]
                        });
                    }
                    try {
                        const username = interaction.channel.name.split('-')[1];
                        const ticketCreator = interaction.guild.members.cache.find(m => m.user.username === username);
                        if (!ticketCreator) return interaction.reply('Nie można znaleźć twórcy ticketu!');

                        await interaction.channel.permissionOverwrites.set([
                            { id: interaction.guild.id, deny: ['ViewChannel'] },
                            { id: ticketCreator.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
                            { id: config.ROLES.ADMIN, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageChannels'] },
                        ]);

                        await interaction.reply(config.MESSAGES.TICKET_UNCLAIMED.replace('{userId}', interaction.member.id));
                    } catch (error) {
                        console.error(config.LOGS.TICKET_UNCLAIM_ERROR, error);
                        await interaction.reply('Wystąpił błąd podczas odprzejmowania ticketu.');
                    }
                    break;
            }
        }
    }

    if (interaction.isButton() && interaction.customId === 'start_verification') {
        const mathQuestion = generateMathQuestion();
        verificationQuestions.set(interaction.user.id, mathQuestion);
        const modal = new ModalBuilder()
            .setCustomId(config.VERIFICATION.MODAL.CUSTOM_ID)
            .setTitle(config.VERIFICATION.MODAL.TITLE)
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('verificationAnswer')
                        .setLabel(`${config.VERIFICATION.MODAL.INPUT_LABEL}: ${mathQuestion.question}`)
                        .setPlaceholder(config.VERIFICATION.MODAL.PLACEHOLDER)
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                )
            );
        try {
            await interaction.showModal(modal);
        } catch (error) {
            console.error(config.VERIFICATION.MESSAGES.MODAL_ERROR, error);
        }
    }

    if (interaction.isModalSubmit() && interaction.customId === config.VERIFICATION.MODAL.CUSTOM_ID) {
        const userAnswer = interaction.fields.getTextInputValue('verificationAnswer');
        const userQuestion = verificationQuestions.get(interaction.user.id);
        
        if (!userQuestion) {
            return interaction.reply({ 
                content: 'Pytanie weryfikacyjne wygasło. Spróbuj ponownie.', 
                flags: [1 << 6] 
            });
        }
        
        if (userAnswer === userQuestion.answer) {
            const role = interaction.guild.roles.cache.get(config.ROLES.VERIFIED);
            if (!role) {
                return interaction.reply({ content: config.VERIFICATION.MESSAGES.ROLE_ERROR, flags: [1 << 6] });
            }

            await interaction.member.roles.add(role);
            verificationQuestions.delete(interaction.user.id);
            await interaction.reply({ content: config.VERIFICATION.MESSAGES.SUCCESS, flags: [1 << 6] });
        } else {
            verificationQuestions.delete(interaction.user.id);
            await interaction.reply({ 
                content: `${config.VERIFICATION.MESSAGES.ERROR} Poprawna odpowiedź to: ${userQuestion.answer}`, 
                flags: [1 << 6] 
            });
        }
    }

    if (interaction.isButton()) {
        if (interaction.customId === 'proposal_add') {
            const modal = new ModalBuilder()
                .setCustomId(config.PROPOSALS.MODAL.CUSTOM_ID)
                .setTitle(config.PROPOSALS.MODAL.TITLE)
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('proposalConcern')
                            .setLabel(config.PROPOSALS.MODAL.CONCERN_LABEL)
                            .setPlaceholder(config.PROPOSALS.MODAL.CONCERN_PLACEHOLDER)
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('proposalContent')
                            .setLabel(config.PROPOSALS.MODAL.CONTENT_LABEL)
                            .setPlaceholder(config.PROPOSALS.MODAL.CONTENT_PLACEHOLDER)
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                    )
                );

            try {
                await interaction.showModal(modal);
            } catch (error) {
                console.error(config.PROPOSALS.MESSAGES.MODAL_ERROR, error);
            }
        }

        if (interaction.customId === 'proposal_yes' || interaction.customId === 'proposal_no') {
            const messageId = interaction.message.id;
            const voteType = interaction.customId === 'proposal_yes' ? 'yes' : 'no';
            
            if (!proposalVotes.has(messageId)) {
                proposalVotes.set(messageId, { yes: new Set(), no: new Set() });
            }
            
            const votes = proposalVotes.get(messageId);
            const userId = interaction.user.id;
            
            if (votes[voteType].has(userId)) {
                return interaction.reply({ 
                    content: config.PROPOSALS.MESSAGES.ALREADY_VOTED, 
                    flags: [1 << 6] 
                });
            }
            
            votes.yes.delete(userId);
            votes.no.delete(userId);
            
            votes[voteType].add(userId);
            
            const yesButton = new ButtonBuilder()
                .setCustomId('proposal_yes')
                .setLabel(`✓ ${votes.yes.size}`)
                .setStyle(ButtonStyle.Success);
                
            const noButton = new ButtonBuilder()
                .setCustomId('proposal_no')
                .setLabel(`✗ ${votes.no.size}`)
                .setStyle(ButtonStyle.Danger);
                
            const addButton = new ButtonBuilder()
                .setCustomId('proposal_add')
                .setLabel(config.PROPOSALS.BUTTONS.ADD.LABEL)
                .setStyle(ButtonStyle.Primary);
                
            const row = new ActionRowBuilder().addComponents(yesButton, noButton, addButton);
            
            await interaction.update({ components: [row] });
            await interaction.followUp({ 
                content: config.PROPOSALS.MESSAGES.VOTE_RECORDED, 
                flags: [1 << 6] 
            });
        }
    }

    if (interaction.isModalSubmit() && interaction.customId === config.PROPOSALS.MODAL.CUSTOM_ID) {
        const concern = interaction.fields.getTextInputValue('proposalConcern');
        const content = interaction.fields.getTextInputValue('proposalContent');
        
        const proposalEmbed = new EmbedBuilder()
            .setColor(config.PROPOSALS.EMBED.COLOR)
            .setTitle('777Code.pl × Nowa Propozycja')
            .addFields(
                { name: 'Dodana przez:', value: interaction.user.username, inline: true },
                { name: 'Dotyczy Trybu:', value: concern, inline: true },
                { name: 'Treść:', value: content, inline: false }
            )
            .setImage(config.PROPOSALS.EMBED.IMAGE)
            .setFooter({ text: `${config.BOT.FOOTER_TEXT} • ${formatDateTime(new Date())}` });

        const yesButton = new ButtonBuilder()
            .setCustomId('proposal_yes')
            .setLabel('✓ 0')
            .setStyle(ButtonStyle.Success);
            
        const noButton = new ButtonBuilder()
            .setCustomId('proposal_no')
            .setLabel('✗ 0')
            .setStyle(ButtonStyle.Danger);
            
        const addButton = new ButtonBuilder()
            .setCustomId('proposal_add')
            .setLabel(config.PROPOSALS.BUTTONS.ADD.LABEL)
            .setStyle(ButtonStyle.Primary);
            
        const row = new ActionRowBuilder().addComponents(yesButton, noButton, addButton);
        
        try {
            const proposalsChannel = client.channels.cache.get(config.CHANNELS.PROPOSALS);
            if (proposalsChannel) {
                const message = await proposalsChannel.send({ embeds: [proposalEmbed], components: [row] });
                
                proposals.set(message.id, {
                    concern: concern,
                    content: content,
                    author: interaction.user.id
                });
                
                proposalVotes.set(message.id, { yes: new Set(), no: new Set() });
                
                await interaction.reply({ 
                    content: config.PROPOSALS.MESSAGES.PROPOSAL_ADDED, 
                    flags: [1 << 6] 
                });
            } else {
                await interaction.reply({ 
                    content: config.PROPOSALS.MESSAGES.CHANNEL_ERROR, 
                    flags: [1 << 6] 
                });
            }
        } catch (error) {
            console.error(config.PROPOSALS.MESSAGES.SEND_ERROR, error);
            await interaction.reply({ 
                content: 'Wystąpił błąd podczas dodawania propozycji.', 
                flags: [1 << 6] 
            });
        }
    }
});

// ---------------  AUTOMOD ---------------- //

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (!message.guild) return;

  const hasAllowedRole = message.member.roles.cache.has(config.ROLES.ADMIN);
  if (hasAllowedRole) return;

  if (containsBadWords(message.content)) {
    await message.delete();
    return;
  }

  if (containsLinks(message.content) && !isLinkAllowed(message.content)) {
    await message.delete();
    return;
  }

  if (/(discord\.gg\/\w+|discordapp\.com\/invite\/\w+)/i.test(message.content)) {
    await message.delete();
    console.log(config.LOGS.MESSAGE_DELETED.replace('{tag}', message.author.tag).replace('{id}', message.author.id).replace('{content}', message.content));
    return;
  }
});

function containsBadWords(content) {
  const lowerCaseContent = content.toLowerCase();
  return config.AUTOMOD.BAD_WORDS.some(word => lowerCaseContent.includes(word));
}

function containsLinks(content) {
  const urlRegex = /https?:\/\/[^\s]+/g;
  return urlRegex.test(content);
}

function isLinkAllowed(content) {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = content.match(urlRegex);
  if (!urls) return false;

  return urls.every(url => {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      
      const isAllowedDomain = config.AUTOMOD.ALLOWED_DOMAINS.some(allowed => {
        const allowedDomain = allowed.toLowerCase();
        return domain === allowedDomain || domain.endsWith('.' + allowedDomain);
      });
      
      if (isAllowedDomain) return true;
      
      if (domain.includes('tenor.com') || domain.includes('giphy.com')) {
        return true;
      }
      
      if (domain.includes('media.discordapp.net') || domain.includes('cdn.discordapp.com')) {
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  });
}

client.on('ready', async () => {
  console.log(config.LOGS.BOT_ONLINE.replace('{tag}', client.user.tag));
  client.user.setPresence({
      activities: [{ name: config.BOT.NAME, type: config.BOT.ACTIVITY_TYPE }],
      status: config.BOT.STATUS,
  });
  console.log(`✅ Bot działa jako ${client.user.tag}`);

  try {
    const verificationChannel = await client.channels.fetch(config.CHANNELS.VERIFICATION);
    if (verificationChannel) {
      const messages = await verificationChannel.messages.fetch({ limit: 50 });
      const oldVerificationMessage = messages.find(msg => 
                msg.author.id === client.user.id &&
                msg.embeds.length > 0 &&
                msg.embeds[0].title === config.VERIFICATION.EMBED.TITLE
            );

      if (oldVerificationMessage) {
        try {
          await oldVerificationMessage.delete();
          console.log('Stara wiadomość weryfikacyjna została usunięta.');
        } catch (err) {
          console.error('Błąd przy usuwaniu starej wiadomości weryfikacyjnej:', err);
        }
      }

      await sendVerificationMessage();
    }
  } catch (error) {
    console.error('Błąd przy wysyłaniu wiadomości weryfikacyjnej:', error);
  }
});

// ------------ NADAWANIE ROLI GRACZ ------------------ //

client.on('guildMemberAdd', async (member) => {
  try {
    const role = member.guild.roles.cache.get(config.ROLES.PLAYER);
    if (role) {
      await member.roles.add(role);
      console.log(config.MESSAGES.ROLE_ADDED.replace('{roleName}', role.name).replace('{userTag}', member.user.tag));
    } else {
      console.log(config.LOGS.ROLE_NOT_FOUND);
    }
  } catch (error) {
    console.error(config.LOGS.ROLE_ERROR, error);
  }

  const welcomeEmbed = new EmbedBuilder()
    .setColor(config.WELCOME.COLOR)
    .setTitle(config.WELCOME.TITLE.replace('{user}', member.user.username))
    .setDescription(config.WELCOME.DESCRIPTION.replace('{user}', member.user.username).replace('{memberCount}', member.guild.memberCount))
    .setThumbnail(member.user.displayAvatarURL())
    .setImage(config.WELCOME.IMAGE)
    .setFooter({ text: `${config.BOT.FOOTER_TEXT} • ${formatDateTime(new Date())}` });

  const pad1 = 'ㅤㅤㅤ';
  const pad2 = '⠀⠀⠀⠀';
  const pad3 = '　　　';

  const label = `${pad1}${pad2}${pad3}${config.WELCOME.BUTTON_LABEL}${pad3}${pad2}${pad1}`;

  const disabledButton = new ButtonBuilder()
    .setCustomId('disabled_welcome_button')
    .setLabel(label)
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(true);

  const row = new ActionRowBuilder().addComponents(disabledButton);

  const welcomeChannel = member.guild.channels.cache.get(config.CHANNELS.WELCOME);
  if (welcomeChannel) {
    welcomeChannel.send({ embeds: [welcomeEmbed], components: [row] });
  }
});

// ---------------- WERYFIKACJA --------------- //

const verificationQuestions = new Map();

function generateMathQuestion() {
    const { MIN_NUMBER, MAX_NUMBER, OPERATIONS, MAX_RESULT } = config.VERIFICATION.MATH;
    
    let question, answer;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
        const num1 = Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER;
        const num2 = Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER;
        const operation = OPERATIONS[Math.floor(Math.random() * OPERATIONS.length)];
        
        switch (operation) {
            case '+':
                answer = num1 + num2;
                question = `${num1} + ${num2}`;
                break;
            case '-':
                if (num1 >= num2) {
                    answer = num1 - num2;
                    question = `${num1} - ${num2}`;
                } else {
                    answer = num2 - num1;
                    question = `${num2} - ${num1}`;
                }
                break;
            case '*':
                answer = num1 * num2;
                question = `${num1} × ${num2}`;
                break;
            default:
                answer = num1 + num2;
                question = `${num1} + ${num2}`;
        }
        
        attempts++;
    } while (answer > MAX_RESULT && attempts < maxAttempts);
    
    return { question, answer: answer.toString() };
}

async function sendVerificationMessage() {
    const channel = client.channels.cache.get(config.CHANNELS.VERIFICATION);
    if (!channel) {
        console.error(config.VERIFICATION.MESSAGES.CHANNEL_ERROR);
        return;
    }

    const embed = new EmbedBuilder()
        .setColor(config.VERIFICATION.EMBED.COLOR)
        .setTitle(config.VERIFICATION.EMBED.TITLE)
        .setDescription(config.VERIFICATION.EMBED.DESCRIPTION)
        .setImage(config.VERIFICATION.EMBED.IMAGE)
        .setFooter({ text: `${config.BOT.FOOTER_TEXT} • ${formatDateTime(new Date())}` });

    const pad1 = 'ㅤㅤㅤㅤㅤ';
    const pad2 = '⠀⠀⠀⠀⠀⠀';
    const label = `${pad1}${pad2}${config.VERIFICATION.BUTTON_LABEL}${pad2}${pad1}`;

    const button = new ButtonBuilder()
        .setCustomId('start_verification')
        .setLabel(label)
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(button);

    await channel.send({ embeds: [embed], components: [row] })
        .then(() => {
            console.log(config.VERIFICATION.MESSAGES.SENT);
        })
        .catch(err => console.error(config.VERIFICATION.MESSAGES.SEND_ERROR, err));
}

async function sendProposalsMessage() {
    const channel = client.channels.cache.get(config.CHANNELS.PROPOSALS);
    if (!channel) {
        console.error(config.PROPOSALS.MESSAGES.CHANNEL_ERROR);
        return;
    }

    const embed = new EmbedBuilder()
        .setColor(config.PROPOSALS.EMBED.COLOR)
        .setTitle(config.PROPOSALS.EMBED.TITLE)
        .setDescription(config.PROPOSALS.EMBED.DESCRIPTION)
        .setImage(config.PROPOSALS.EMBED.IMAGE)
        .setFooter({ text: `${config.BOT.FOOTER_TEXT} • ${formatDateTime(new Date())}` });

    const yesButton = new ButtonBuilder()
        .setCustomId('proposal_yes')
        .setLabel('✓ 0')
        .setStyle(ButtonStyle.Success);
        
    const noButton = new ButtonBuilder()
        .setCustomId('proposal_no')
        .setLabel('✗ 0')
        .setStyle(ButtonStyle.Danger);
        
    const addButton = new ButtonBuilder()
        .setCustomId('proposal_add')
        .setLabel(config.PROPOSALS.BUTTONS.ADD.LABEL)
        .setStyle(ButtonStyle.Primary);
        
    const row = new ActionRowBuilder().addComponents(yesButton, noButton, addButton);

    await channel.send({ embeds: [embed], components: [row] })
        .then(() => {
            console.log('Panel propozycji został wysłany.');
        })
        .catch(err => console.error(config.PROPOSALS.MESSAGES.SEND_ERROR, err));
}

client.login(config.TOKEN);