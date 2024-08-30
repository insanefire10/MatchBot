export function deleteStats(interaction, con){
    const userChosen = interaction.options.getUser('user');
    let sqlcmd = ""
    if(userChosen){
        console.log(interaction.user.tag + " Has deleted all stats for " + userChosen.id + " on "+ interaction.guild.name);
        sqlcmd = `DELETE FROM user_stats WHERE server_id="${interaction.guild.id}" AND user_id="${userChosen.id}"`;
        interaction.reply("All stats for this user have been deleted!");
    } else {
        console.log(interaction.user.tag + " Has deleted all stats on " + interaction.guild.name);
        sqlcmd = `DELETE FROM user_stats WHERE server_id="${interaction.guild.id}"`;
        interaction.reply("All stats for this server have been deleted!");
    }
    

    con.execute(sqlcmd, function (err, result) {
        if(err) throw err;
    });
}