import { EmbedBuilder } from "discord.js";
import e from "express";

export async function leaderboard (client, interaction, con) {
    console.log("Leaderboard Command Ran\nGiven Server ID: "+ interaction.guild.id);
    let x;
    let sqlcmd2 = `SELECT * FROM user_stats WHERE server_id=${interaction.guild.id} ORDER BY wins DESC`;
    con.execute(sqlcmd2, function (err, result2) {
        if(err) throw err;
        if(result2.length > 0)
        {
            let mostWinsLeaderboard = mostWinsCalc(result2);
            let bestKDLeaderboard = bestKD(result2);
            const outembed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Leaderboard for ' + `${interaction.guild.name}`)
            .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 128 }))
            .addFields(
                {name: 'Most Wins:', value: mostWinsLeaderboard},
                {name: 'Best W/L Ratio:', value: bestKDLeaderboard}
            );
            interaction.reply({ embeds: [outembed] });
            return;
        } else {
            interaction.reply("This server has no match stats");
            return;
        }
        
        
    });
}

function mostWinsCalc (arr) {
    let outText = "";
    for(let i = 0; i < arr.length || i < 10; i++){
        if(i === 0){
            outText += "🥇";
        }
        else if(i === 1){
            outText += "🥈";
        }
        else if(i === 2){
            outText += "🥉";
        }
        else{
            outText += `${emoji_dict[i]}`;
        }
        outText += `<@${arr[i].user_id}>` + " " + `**${arr[i].wins}**\n`;
    }
    return outText;
}

function bestKD (arr) {
    arr.sort((a,b) => {
        let akd = 0.0;
        let bkd = 0.0;
        if(a.losses == 0){
            akd = a.wins;
        }
        else akd = a.wins/a.losses;
        if(b.losses == 0){
            bkd = b.wins;
        }
        else bkd = b.wins/b.losses;
        if(akd === bkd){
            return 0;
        }
        else return akd < bkd ? 1 : -1;
    });
    let outText = "";
    for(let i = 0; i < arr.length || i < 10; i++){
        if(i === 0){
            outText += "🥇";
        }
        else if(i === 1){
            outText += "🥈";
        }
        else if(i === 2){
            outText += "🥉";
        }
        else{
            outText += `${emoji_dict[i]}`;
        }
        outText += `<@${arr[i].user_id}>` + " " + `**${(arr[i].losses == 0 ? arr[i].wins : arr[i].wins/arr[i].losses).toFixed(3)}**  (${arr[i].wins} / ${arr[i].losses})\n`;
    }
    return outText;
    
}

const emoji_dict = [`:one:`,`:two:`,`:three:`,`:four:`,`:five:`,`:six:`,`:seven:`,`:eight:`,`:nine:`,`:keycap_ten:`];
