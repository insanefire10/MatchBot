import dotenv from 'dotenv'
dotenv.config()
const myToken = process.env.DISCORD_TOKEN;
const sql_user = process.env.MYSQL_USER;
const sql_pass = process.env.MYSQL_PASS;
const sql_ip = process.env.MYSQL_IP;
import mysql from 'mysql2'
import { Match } from './classes/Match.js';
import { matchVC } from './commands/matchvc.js';
import { leaderboard } from './commands/leaderboards.js';
import { deleteStats } from './commands/resetstats.js';
import { endMatch } from './commands/endmatch.js';
import { configure } from './commands/configure.js';

import { Client, GatewayIntentBits, PermissionFlagsBits, ChannelType, userMention, GuildMember, WebhookClient, EmbedBuilder, SlashCommandBuilder, VoiceChannel} from 'discord.js';


//MySQL Setup
const con = await mysql.createPool({
    host: sql_ip,
    user: sql_user,
    password: sql_pass,
    database: "discord",
    waitForConnections: true,
    connectionLimit: 4,
    queueLimit: 0
});
console.log("Successfully Connected to MySQL");

//Required Intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.login(myToken);

let activeMatches = [];


client.on("ready", (x) => {
    console.log("Currently Online!");
    client.user.setActivity("In your walls");

    const matchvc = new SlashCommandBuilder()
    .setName('matchvc')
    .setDescription('Makes teams based on everyone currently in the VC')
    .addIntegerOption(option =>
        option.setName("number_of_teams")
            .setDescription("Number of teams to split into (Default is 2)")
    )
    ;
    client.application.commands.create(matchvc);

    const ping = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check if Im online!");
    client.application.commands.create(ping);
    

    const leaderboard = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('See the leaderboard!');
    client.application.commands.create(leaderboard);

    const endmatch = new SlashCommandBuilder()
    .setName('endmatch')
    .setDescription('End the match')
    .addStringOption(option =>
        option.setName('end_result')
        .setDescription('Select which team won')
        .setRequired(true)
        .addChoices(
            { name: 'Team 1', value: 'team1'},
            { name: 'Team 2', value: 'team2'},
            { name: 'Tie/Abort', value: 'tie'}
        )
    );
    client.application.commands.create(endmatch);

    const resetStats = new SlashCommandBuilder()
    .setName('resetstats')
    .setDescription('Deletes all match stats (Admins only, Cannot be undone!)')
    .addUserOption(option => 
        option.setName('user')
        .setDescription('Delete Stats for only 1 user')
    );
    client.application.commands.create(resetStats);

    const guildConfigure = new SlashCommandBuilder()
    .setName('configure')
    .setDescription('Configure MatchBot for this server')
    .addStringOption(option => 
        option.setName('config')
        .setDescription('Choose an option')
        .setRequired(true)
        .addChoices(
            { name: 'Configure Team VCs', value:'confvc'},
            { name: 'Alter Stats', value: 'alterstats'}
        )
    );
    client.application.commands.create(guildConfigure);

    console.log("Slash Commands Successfully Registered");

})

client.on("messageCreate", async (message) => {
    if(!message.author.bot)
    {
        if(message.content === "Hello")
        {
            message.reply("Why hello there!");
        }
    }
})

client.on("interactionCreate", async (interaction) => {
    const {commandName, options} = interaction;
    if(commandName === 'ping')
    {
        console.log("ping ran by " + interaction.user.tag);
        interaction.reply("pong!");
    }
    
    if(commandName === 'matchvc')
    {
        
        let newGame = matchVC(interaction, activeMatches, con);
        if(newGame instanceof Match){
            activeMatches.push(newGame);
            console.log("User " + `${newGame.matchCreator}` + " created a match. Match ID:" + newGame.matchID);
            for(let x = 0; x < newGame.matchArray.length; x++){
                console.log(newGame.matchArray[x]);
            }
        }
        else{
            console.log("User Entered Invalid Args");
        }
    }
    if(commandName === 'endmatch')
    {
        let endGame = endMatch(con, interaction, activeMatches);
    }

    if(commandName === 'leaderboard')
    {
        leaderboard(client, interaction, con);

    }
    if(commandName === 'resetstats')
    {
        const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
        if(isAdmin){
            deleteStats(interaction, con);
        }
        else{
            interaction.reply("You do not have permission to do this!");
        }
    }
    if(commandName === 'configure')
    {
        configure(interaction, con);
    }
})

//MySQL KeepAlive
setInterval(() => {
    con.query('SELECT 1', (error) => {
      if (error) {
        console.error('Error with keep-alive query:', error);
      } else {
        console.log("Running MySQL KeepAlive");
      }
    });
  }, 1000 * 60 * 60);