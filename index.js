require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionsBitField
} = require("discord.js");


const client = new Client({

    intents:[
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]

});


// BOT ONLINE

client.once("ready",()=>{

    console.log(`✅ Bot online: ${client.user.tag}`);

});




// COMANDOS

client.on("messageCreate", async message => {


    if(message.author.bot) return;



    // CRIAR PAINEL DE TICKET

    if(message.content === "!ticket"){


        const embed = new EmbedBuilder()

        .setTitle("🛒 Loja - Atendimento")

        .setDescription(
            "Clique no botão abaixo para abrir um ticket de compra.\n\n"+
            "Um vendedor irá atender você."
        )

        .setColor("Blue");



        const button = new ButtonBuilder()

        .setCustomId("abrir_ticket")

        .setLabel("🎫 Abrir Ticket")

        .setStyle(ButtonStyle.Primary);



        const row = new ActionRowBuilder()

        .addComponents(button);



        message.channel.send({

            embeds:[embed],

            components:[row]

        });


    }





    // PIX


    if(message.content === "!pix"){


        const embed = new EmbedBuilder()

        .setTitle("💰 Pagamento PIX")

        .setDescription(
            `Chave PIX:\n\n`+
            `\`${process.env.PIX}\`\n\n`+
            `Envie o comprovante neste ticket.`
        )

        .setColor("Green")

        .setImage("attachment://qr.png");



        message.channel.send({

            embeds:[embed],

            files:["qr.png"]

        });


    }






    // CONFIRMAR COMPRA


    if(message.content === "!confirmar"){



        if(!message.member.roles.cache.has(process.env.CARGO_VENDEDOR)){


            return message.reply(
                "❌ Você não tem permissão para confirmar compras."
            );


        }



        if(!message.channel.name.startsWith("ticket-")){


            return message.reply(
                "❌ Use esse comando dentro de um ticket."
            );


        }



        const embed = new EmbedBuilder()

        .setTitle("✅ Compra Confirmada")

        .setDescription(

            `Pagamento confirmado!\n\n`+
            `Vendedor: ${message.author}\n\n`+
            `Obrigado pela compra.`

        )

        .setColor("Green")

        .setTimestamp();



        message.channel.send({

            embeds:[embed]

        });




        const logs = client.channels.cache.get(
            process.env.CANAL_LOG
        );


        if(logs){


            logs.send(

                `💰 **Venda Confirmada**\n\n`+

                `👤 Vendedor: ${message.author}\n`+

                `🎫 Ticket: ${message.channel}`

            );


        }



    }







    // FECHAR TICKET


    if(message.content === "!fechar"){



        if(!message.channel.name.startsWith("ticket-")) return;



        message.reply(
            "🔒 Ticket fechado."
        );


        setTimeout(()=>{

            message.channel.delete();

        },3000);


    }



});









// BOTÃO DO TICKET


client.on("interactionCreate", async interaction => {



    if(!interaction.isButton()) return;



    if(interaction.customId === "abrir_ticket"){



        const existe = interaction.guild.channels.cache.find(

            c => c.name === `ticket-${interaction.user.username}`

        );



        if(existe){


            return interaction.reply({

                content:"❌ Você já possui um ticket aberto.",

                ephemeral:true

            });


        }





        const canal = await interaction.guild.channels.create({


            name:`ticket-${interaction.user.username}`,


            type:ChannelType.GuildText,



            permissionOverwrites:[


                {


                    id:interaction.guild.id,


                    deny:[

                        PermissionsBitField.Flags.ViewChannel

                    ]

                },


                {


                    id:interaction.user.id,


                    allow:[

                        PermissionsBitField.Flags.ViewChannel,

                        PermissionsBitField.Flags.SendMessages

                    ]

                }


            ]



        });




        canal.send(

            `🎫 Olá ${interaction.user}!\n\n`+

            `Envie o que deseja comprar.\n\n`+

            `Use \`!pix\` para receber o pagamento.\n`+

            `Após pagar envie o comprovante.`

        );



        interaction.reply({

            content:`✅ Ticket criado: ${canal}`,

            ephemeral:true

        });



    }



});






client.login(process.env.TOKEN);