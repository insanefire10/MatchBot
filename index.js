import dotenv from 'dotenv'
dotenv.config()
const myToken = process.env.DISCORD_TOKEN;
const sql_user = process.env.MYSQL_USER;
const sql_pass = process.env.MYSQL_PASS;
import mysql from 'mysql2'
import { matchVC } from './commands/matchvc.js';
import { leaderboard } from './commands/leaderboards.js';
import { Match } from './classes/Match.js';
import { deleteStats } from './commands/resetstats.js';

import { Client, GatewayIntentBits, PermissionFlagsBits, ChannelType, userMention, GuildMember, WebhookClient, EmbedBuilder, SlashCommandBuilder, VoiceChannel} from 'discord.js';
import { endMatch } from './commands/endmatch.js';

//MySQL Setup
const con = await mysql.createConnection({
    host: "127.0.0.1",
    user: sql_user,
    password: sql_pass,
    database: "discord"
});
con.connect(function(err) {
    if (err) throw err;
    console.log("Successfully Connected to MySQL");
});

/*
con.execute("SELECT * FROM users", function (err, result) {
    if(err) throw err;
    console.log(result[0].user_id);
});
*/

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
    //.addUserOption(option =>
    //    option.setName("exclude")
    //        .setDescription("Select users to not include in matchmaking"))
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
    .setDescription('Deletes all match stats (Admins only, Cannot be undone!)');
    client.application.commands.create(resetStats);

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
        let data = await leaderboard(client, interaction, con);
        console.log(data);
        //interaction.reply("Test");

    }
    if(commandName === 'resetstats')
    {
        const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
        if(isAdmin){
            deleteStats(interaction, con);
            interaction.reply("All stats for this server have been deleted!");
        }
        else{
            interaction.reply("You do not have permission to do this!");
        }
    }
})