import { Match } from '../classes/Match.js';

export async function endMatch(con, interaction, activeMatches){
    for(let x = 0; x < activeMatches.length; x++){
        if(activeMatches[x].matchCreator === interaction.user.tag){
            const winTeam = interaction.options.getString('end_result');
            if(winTeam === 'tie'){
                interaction.reply("Your match has ended in a Tie!");
                return null;
            }
            recordResult(con, interaction, winTeam, activeMatches[x].matchArray);
            activeMatches.splice(x, 1);
            return null;
        }
    }
    interaction.reply("You have no active matches");
    return null;
}

function recordResult(con, interaction, matchResult, playerList){
    for(let i = 0; i < playerList.length; i++){
        const thisTeam = matchResult === `team${i+1}` ? true : false;
        if(thisTeam){
            interaction.reply(`Team ${i+1} Wins!`);
        }
        for(let k = 0; k < playerList[i].length; k++){
            const sqlcmd = `SELECT * FROM user_stats WHERE user_id="${playerList[i][k]}" AND server_id="${interaction.guild.id}"`;
            console.log(sqlcmd);
            con.execute(sqlcmd, function (err, result) {
                if(err) throw err;
                
            });
            if(thisTeam){
                sendtoDB(interaction, con, playerList[i][k], true);
            }
            else{
                sendtoDB(interaction, con, playerList[i][k], false);
            }
        }
    }
}

async function sendtoDB(interaction, con, player, playerResult){
    let sqlcmd = "";
    if(playerResult){
        sqlcmd = `UPDATE user_stats SET wins = wins + 1 WHERE user_id ="${player}" AND server_id="${interaction.guild.id}"`;
        console.log(sqlcmd);
    }
    else{
        sqlcmd = `UPDATE user_stats SET losses = losses + 1 WHERE user_id ="${player}"`;
    }
    con.execute(sqlcmd, function (err, result) {
        if(err) throw err;
    });
}
