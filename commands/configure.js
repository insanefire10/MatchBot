import { ActionRow, ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, ModalBuilder, TextInputBuilder, PermissionFlagsBits } from 'discord.js';

export async function configure(interaction, con){

    const command = interaction.options.getString('config');
    if(command === 'confvc'){
        if(!interaction.member.permissions.has(PermissionFlagsBits.Administrator)){
            interaction.reply("Only Server Administrators may use this!")
            return;
        }
        const vc1 = new ChannelSelectMenuBuilder() 
        .setCustomId('vc1')
        .setPlaceholder('Team 1:')
        .addChannelTypes(ChannelType.GuildVoice);
        const vc2 = new ChannelSelectMenuBuilder()
        .setCustomId('vc2')
        .setPlaceholder('Team 2:')
        .addChannelTypes(ChannelType.GuildVoice);
        const actionRowT1 = new ActionRowBuilder().addComponents(vc1);
        const actionRowT2 = new ActionRowBuilder().addComponents(vc2);
        await interaction.reply({
            content: 'Select the voice channels for teams to use:',
            components: [actionRowT1, actionRowT2],
            ephemeral: true
        });
        console.log(vc1);

    }
    
}

async function updateDB(con) {
    
}