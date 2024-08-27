export function deleteStats(interaction, con){
    console.log(interaction.user.tag + " Has deleted all stats on " + interaction.guild.name);
    const sqlcmd = `DELETE FROM user_stats WHERE server_id="${interaction.guild.id}"`;
    con.execute(sqlcmd, function (err, result) {
        if(err) throw err;
    });
}