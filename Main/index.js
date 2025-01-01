// Imports the discord.js library
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');
const { google } = require('googleapis');

// Creates a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,          // For interacting with guilds (servers)
        GatewayIntentBits.GuildMessages,   // For reading messages
        GatewayIntentBits.MessageContent,   // For reading message content (required for reading text messages)
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Reads JSON files synchronously
const fs = require('fs');
const commands = JSON.parse(fs.readFileSync('Commands/commands.json', 'utf-8'));
var command_prefix_default = "!";

// Import the config file
const config = require('./config.json');  

const token = config.token;
const YOUTUBE_API_KEY = config.youtubeAPI;

const youtube = google.youtube({
    version: 'v3',
    auth: YOUTUBE_API_KEY,
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

});

// Event: Respond to messages
commandListener();

client.login(token);

function commandListener() {
    
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;

        if (message.content.startsWith(command_prefix_default)){

            const commandContent = message.content.slice(command_prefix_default.length).trim();
            
            if (commandContent.startsWith('ping')) {
                message.channel.send('Hatdog si Myckes');
            }
            if (commandContent.startsWith('prefix')) {
                const args = commandContent.split(' ');
                const chars_after_command = args[1];

                if (chars_after_command) {
                    // Set the new prefix to the term after the command
                    command_prefix_default = chars_after_command;

                    const embed = new EmbedBuilder()
                    .setTitle('Prefix Changed')
                    .setDescription(`The prefix used for detecting commands has been changed to ${command_prefix_default}`)  // Set the description
                    .setColor(0x3498db)  // Set the color (hex code for blue)
                    .setTimestamp();
            
                    message.channel.send({ embeds: [embed] });

                } else {
                    const embed = new EmbedBuilder()
                    .setTitle('Prefix Command Usage')
                    .setColor(0xFF0000)  // Set the color (hex code for red)
                    .addFields(
                        { name: 'Usage:', value: `${command_prefix_default}prefix {symbol}`, inline: false },
                        { name: 'Example:', value: `${command_prefix_default}prefix !!`, inline: false }
                    )
                    .setFooter({ text: 'Work in progress' })
                    .setTimestamp();
                    message.channel.send({ embeds: [embed] });}
            }
            if (commandContent.startsWith('play')) {
                const args = commandContent.split(' ');

                const parsed_track = commandContent.slice(5).trim();
                const voiceChannel = message.member?.voice.channel;
                
                if (parsed_track) {
                

                    const connection = joinVoiceChannel({
                        channelId: voiceChannel.id,
                        guildId: message.guild.id,
                        adapterCreator: message.guild.voiceAdapterCreator,
                    });

                    try {
                        // Perform YouTube search
                        const response = await youtube.search.list({
                            part: 'snippet',
                            q: parsed_track,
                            maxResults: 1,
                            type: 'video',
                        });

                        const video = response.data.items[0];
                        
                    } catch (error) {
                        console.error('Error fetching YouTube data:', error);
                        message.reply('An error occurred while searching YouTube.');
                    }

                    const embed = new EmbedBuilder()
                    .setTitle(`Track searched: ${parsed_track}`)
                    .setDescription(`Track found: WIP`)  // Set the description
                    .setColor(0x3498db)  // Set the color (hex code for blue)
                    .setTimestamp();
            
                    message.channel.send({ embeds: [embed] });

                } else {
                    const embed = new EmbedBuilder()
                    .setTitle('Play Command Usage')
                    .setColor(0xFF0000)  // Set the color (hex code for red)
                    .addFields(
                        { name: 'Usage:', value: `${command_prefix_default}play {track/song/search name}`, inline: false },
                        { name: 'Example:', value: `${command_prefix_default}play LeeHi - Red Lipstick`, inline: false }
                    )
                    .setFooter({ text: 'Work in progress' })
                    .setTimestamp();
                    message.channel.send({ embeds: [embed] });}

            }
        }
    });
}