import { EmbedBuilder } from 'discord.js';
import { Match } from '../classes/Match.js';

export function matchVC(interaction, activeMatches, con){
    for(let x = 0; x < activeMatches.length; x++){
        if(activeMatches[x].matchCreator === interaction.user.tag){
            interaction.reply("You currently have a match running, please use /endmatch and choose a result!");
            return null;
        }
    }
    let numTeams = 2;
    if(!interaction.options.getInteger("number_of_teams")){
        numTeams = 2;
    }
    else{
        numTeams = interaction.options.getInteger("number_of_teams");
    }
    if(!interaction.member.voice.channel){
        interaction.reply("You must be in a Voice Channel to use this command!");
        return null;

    }
    if(numTeams > interaction.member.voice.channel.members.size){
        interaction.reply("You specified more teams than number of members in the voice channel. Try again.");
        return null;
    }
    let userArray = [];
    console.log("Members in VC: " + interaction.member.voice.channel.members.size);
    interaction.member.voice.channel.members.each(mem=>{
        console.log(mem.id);
        userArray.push(mem.id);
        //interaction.reply('<@'+ interaction.user.id + '>')
    });
    for(let i = 0; i < userArray.length; i++){
        console.log("User " + i + ": " + userArray[i]);
    }
    
    for (let i = userArray.length - 1; i > 0; i--) {

        let j = Math.floor(Math.random() * (i + 1));

        let temp = userArray[i];
        userArray[i] = userArray[j];
        userArray[j] = temp;
    }
    console.log("After Sort:\n");
    for(let i = 0; i < userArray.length; i++){
        console.log("User " + i + ": " + userArray[i]);            
    }
    let outArray = [];
    for(let i = 0; i < numTeams; i++){
        outArray.push([]);
    }
    for(let i = 0; i < userArray.length; i++){
        outArray[i % numTeams].push(userArray[i]);
    }

    let currMatch = new Match(outArray, "111222", interaction.user.tag);

    let outEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle("Teams List")
    .setFooter({ text: "Match ID: "+ currMatch.matchID })
    .setThumbnail('https://i.imgur.com/bc9zq15.png')
    .setAuthor({ name: (interaction.user.tag + `'s Match`), iconURL: interaction.user.displayAvatarURL()});
    for(let x = 0; x < outArray.length; x++){
        outEmbed.addFields({name: `Team ${x+1}`, value: teamMembers(outArray[x])});
    }     
    interaction.reply({ embeds: [outEmbed] });
    addUsersDB(interaction, userArray, con);
    return currMatch;
}

function teamMembers(arr){
    let outText = "";
    for(let i = 0; i < arr.length; i++){
        outText += "<@" + arr[i] + ">\n";
    }
    return outText;
}

async function addUsersDB(interaction, userArray, con){
    for(let i = 0; i < userArray.length; i++){
        
        const sqlcmd = `SELECT * FROM user_stats WHERE user_id="${userArray[i]}" AND server_id="${interaction.guild.id}"`;
            console.log(sqlcmd);
            con.execute(sqlcmd, function (err, result) {
                if(err) throw err;
                if(result.length === 0){
                    const sqlcmd2 = `INSERT INTO user_stats VALUES("${interaction.guild.id}","${userArray[i]}", 0, 0)`;
                    console.log(sqlcmd2);
                    con.execute(sqlcmd2, function (err, result2) {
                        if(err) throw err;
                    });
                }
            });
        
    }
}