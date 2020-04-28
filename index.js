const Util = require('discord.js');
const Discord = require('discord.js');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core-discord');
const prefix = process.env.PREFIX;

const client = new Discord.Client({ disableEveryone: true });
const youtube = new YouTube(process.env.YOUTUBE_API_KEY);
const queue = new Map();

const embed = new Discord.RichEmbed()
    .setColor('#808080');

client.on('warn', console.warn);

client.on('error', console.error);

client.on('ready', () =>
{
	client.user.setStatus("dnd")
    client.user.setActivity(`${prefix}yardım | Made By pRx`);
    console.log('Ready!');
});

client.on('disconnect', () =>
{
    console.log('Disconnected, reconnecting now...');
});

client.on('reconnecting', () =>
{
    console.log('Reconnecting now!');
});

client.on('message', async message =>
{
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.split(/ +/);
    message.content = message.content.toLowerCase();
    const searchString = args.slice(1).join(' ');
    const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
    const serverQueue = queue.get(message.guild.id);

    if(message.content.startsWith(`${prefix}play`) || message.content.startsWith(`${prefix}çal`) || message.content.startsWith(`${prefix}oynat`))
    {
        const voiceChannel = message.member.voiceChannel;
        if(!voiceChannel) 
        {
            embed.setColor('#ffff00');
            embed.setDescription('You need to be in a voice channel to play music!');
            return message.channel.send(`Müzik çalmak için ses kanalında olmanız gerekiyor!`);
        }
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if(!permissions.has('CONNECT'))
        {
            embed.setColor('#ffff00');
            embed.setDescription('Bot!');
            return message.channel.send(`Botun odanıza girmesi için gerekli izinleri yok!`);
        }
        if(!permissions.has('SPEAK'))
        {
            embed.setColor('#ffff00');
            embed.setDescription('Cannot speak in this voice channel, make sure I have the proper permissions!');
            return message.channel.send(`Botun odanızda konuşmak için gerekli izinleri yok!`);
        }
        
        if(serverQueue && !serverQueue.playing && !args[1]) 
        {
            serverQueue.playing = true;
            serverQueue.connection.dispatcher.resume();
            return message.react('▶');
        }
        
        if(serverQueue && serverQueue.playing && !args[1])
        {
            embed.setColor('#ffff00');
            embed.setDescription('No title or link was provided!');
            return message.channel.send(`Bir kelime veya link belirtilmedi!`);
        }

        if(!args[1])
        {
            embed.setColor('#ffff00');
            embed.setDescription('Bir kelime veya link belirtilmedi!');
            return message.channel.send(`Bir kelime veya link belirtilmedi!`);
        }

        if(url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/))
        {
            const playlist = await youtube.getPlaylist(url);
            const videos = await playlist.getVideos();
            let videonum = 0; 
            for(const video of videos)
            {
                try 
                {
                    ++videonum;
                    const video2 = await youtube.getVideoByID(video.id);
                    await handleVideo(video2, message, voiceChannel, true);    
                } 
                catch (error) 
                {
                    console.log(error);
                    videos.shift();
                }
            }
            embed.setColor('#808080');
            embed.setDescription(`✅ [${playlist.title}](${playlist.url}) - ${videonum} adet şarkı sıraya eklendi!`);
            return message.channel.send(embed);
        }
        else
        {
            try 
            {
                var video = await youtube.getVideo(url);
            } 
            catch (error) 
            {
                try 
                {
                    var videos = await youtube.searchVideos(searchString, 1);
                    video = await youtube.getVideoByID(videos[0].id);
                } 
                catch (err) 
                {
                    console.error(err);
                    embed.setColor('#ffff00');
                    embed.setDescription('No search results were found.');
                    return message.channel.send(`Arama sonucu bulunamadı.`);
                }
            }
            return handleVideo(video, message, voiceChannel);
        }
    }
   else if(message.content.startsWith(`${prefix}join`) || message.content.startsWith(`${prefix}katıl`))
    {   
        const voiceChannel = message.member.voiceChannel;
        if(!voiceChannel) 
        {
            embed.setColor('#ffff00');
            embed.setDescription('You need to be in a voice channel to play music!');
            return message.channel.send(`Botun katılması için ses kanalında olmanız gerekiyor!`);
        }
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if(!permissions.has('CONNECT'))
        {
            embed.setColor('#ffff00');
            embed.setDescription('Bot!');
            return message.channel.send(`Botun odanıza girmesi için gerekli izinleri yok!`);
        }
	    var connection = await voiceChannel.join();
	    return message.channel.send(`Bot başarıyla <#${voiceChannel.id}> kanalına katıldı.`);
   }
    else if(message.content.startsWith(`${prefix}disconnect`) || message.content.startsWith(`${prefix}ayrıl`))
	    {    
		/*if (!message.member.voiceChannel) {
    message.channel.send("Bir sesli kanalda değilsiniz!");
  } else {
    if (!message.guild.me.voiceChannel) {
      message.channel.send("Bir sesli kanalda değilim!");
    } else {
      let bot = message.guild.me.voiceChannelID;
      let user = message.member.voiceChannelID;
      if (bot !== user) {
        message.channel.send("Seninle aynı sesli kanalda değilim!");
      } else {
        message.channel.send("Kanaldan başarıyla ayrıldım!");
        message.guild.me.voiceChannel.leave();
      }
    }
  }*/
	 const voiceChannel = message.member.voiceChannel;
	 if(!voiceChannel) 
        {
            embed.setColor('#ffff00');
            embed.setDescription('You need to be in a voice channel to play music!');
            return message.channel.send(`Botun ayrılması için ses kanalında olmanız gerekiyor!`);
        }
	const serverQueue = queue.get(guild.id);
        queue.delete(guild.id);
	 let bot = message.guild.me.voiceChannelID;
      let user = message.member.voiceChannelID;
      if (bot !== user) {
        message.channel.send("Bot ile aynı kanalda değilsiniz.");
      } else {
        message.channel.send(`Bot başarıyla <#${voiceChannel.id}> kanalından ayrıldı.`);
        voiceChannel.leave();
		     voiceChannel.leave();
		    return message.channel.send();
    }
    else if(message.content.startsWith(`${prefix}ara`) || message.content.startsWith(`${prefix}search`))
    {
        const voiceChannel = message.member.voiceChannel;
        if(!voiceChannel) 
        {
            embed.setColor('#ffff00');
            embed.setDescription('You need to be in a voice channel to play music!');
            return message.channel.send(`Müzik çalmak için ses kanalında olmanız gerekiyor!`);
        }
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if(!permissions.has('CONNECT'))
        {
            embed.setColor('#ffff00');
            embed.setDescription('Cannot connect to your voice channel, make sure I have the proper permissions!');
            return message.channel.send(`Botun odanıza girmek için gerekli izinleri yok!`);
        }
        if(!permissions.has('SPEAK'))
        {
            embed.setColor('#ffff00');
            embed.setDescription('Cannot speak in this voice channel, make sure I have the proper permissions!');
            return message.channel.send(`Botun odanızda konuşmak için gerekli izinleri yok!`);
        }

        try 
        {
            video = await youtube.getVideo(url);
        } 
        catch (error) 
        {
            try 
            {
                videos = await youtube.searchVideos(searchString, 10);
                let index = 0;
                const searchtext = new Discord.RichEmbed()
                    .setColor('#808080')
                    .setTitle('__**Şarkı Seçimi:**__')
                    .setDescription(`${videos.map(video2 => `**${++index} -** [${Util.escapeMarkdown(video2.title)}](${video2.url})`).join('\n')} 
                    
                     Lütfen listedeki 1-10 arasındaki bir şarkıyı seçiniz.`);
                message.channel.send(searchtext);

                try 
                {
                    var response = await message.channel.awaitMessages(message2 => message2.content > 0 && message2.content < 11, {
                        maxMatches: 1,
                        time: 10000,
                        errors: ['time'],
                    });
                } 
                catch (err) 
                {
                    console.error(err);
                    embed.setColor('#ffff00');
                    embed.setDescription('No or invalid value entered, cancelling video selection.');
                    return message.channel.send(`Bir şarkı seçilmediği için seçim iptal ediliyor.`);
                }
                const videoIndex = parseInt(response.first().content);
                video = await youtube.getVideoByID(videos[videoIndex - 1].id);
            } 
            catch (err) 
            {
                console.error(err);
                embed.setColor('#ffff00');
                embed.setDescription('No search results were found.');
                return message.channel.send(`Arama sonucu bulunamadı.`);
            }
        }
        return handleVideo(video, message, voiceChannel);
    }
    else if(message.content.startsWith(`${prefix}skip`) || message.content.startsWith(`${prefix}geç`))
    {
        if(!message.member.voiceChannel) 
        {
            embed.setColor('#ffff00');
            embed.setDescription('You are not in a voice channel!');
            return message.channel.send(`Bir ses kanalında değilsiniz!`);
        }
        if(!serverQueue) 
        {
            embed.setColor('#ffff00');
            embed.setDescription('There is nothing playing that can be skipped.');
            return message.channel.send(`Atlanabilecek hiçbir şey yok.`);
        }
        serverQueue.connection.dispatcher.end('Geç komudu kullanıldı!');
        return;
    }
    else if(message.content.startsWith(`${prefix}stop`) || message.content.startsWith(`${prefix}durdur`))
    {
        if(!message.member.voiceChannel) 
        {
            embed.setColor('#ffff00');
            embed.setDescription('You are not in a voice channel!');
            return message.channel.send(`Bir ses kanalında değilsiniz!`);
        }
        if(!serverQueue) 
        {
            embed.setColor('#ffff00');
            embed.setDescription('There is nothing playing that can be stopped.');
            return message.channel.send(`Durdurulabilecek hiçbir şey yok.`);
        }
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end('Dur komudu kullanıldı!');
        return message.react('🛑');
    }
    else if(message.content.startsWith(`${prefix}np`) || message.content.startsWith(`${prefix}şimdiçalan`) || message.content.startsWith(`${prefix}şç`) || message.content.startsWith(`${prefix}çalan`) || message.content.startsWith(`${prefix}şimdiki`))
    {
        if(!serverQueue) 
        {
            embed.setColor('#ffff00');
            embed.setDescription('There is nothing currently playing.');
            return message.channel.send(`Şu anda oynatılan hiçbir şey yok.`);
        }

        const nptext = new Discord.RichEmbed()
            .setColor('#808080')
            .setTitle('Şimdi Çalan')
            .setDescription(`[${serverQueue.songs[0].title}](${serverQueue.songs[0].url}) [${serverQueue.songs[0].requested}]`);
        return message.channel.send(nptext);
    }
    // Volume does not work with playOpusStream
    /* else if(message.content.startsWith(`${prefix}volume`))
    {
        const voiceChannel = message.member.voiceChannel;
        if(!voiceChannel) 
        {
            embed.setColor('#ff0000');
            embed.setDescription('You need to be in a voice channel to change the volume!');
            return message.channel.send(embed);
        }
        if(!serverQueue) 
        {
            embed.setColor('#ff0000');
            embed.setDescription('There is nothing currently playing.');
            return message.channel.send(embed);
        }
        if(!args[1]) 
        {
            embed.setColor('#808080');
            embed.setDescription(`Volume: **${serverQueue.volume}**`);
            return message.channel.send(embed);
        }

        if(parseInt(args[1]) <= 5 && parseInt(args[1]) >= 1)
        {
            serverQueue.volume = args[1];
            serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
    
            embed.setColor('#808080');
            embed.setDescription(`Volume set to: **${serverQueue.volume}**`);
            return message.channel.send(embed);
        }
        else 
        {
            embed.setColor('#ff0000');
            embed.setDescription(`Please set volume using values of 1-5. Current volume is: **${serverQueue.volume}**`);
            return message.channel.send(embed);
        }
    } */
    else if(message.content.startsWith(`${prefix}queue`) || message.content.startsWith(`${prefix}kuyruk`) || message.content.startsWith(`${prefix}sıra`))
    {
        if(!serverQueue) 
        {
            embed.setColor('#ffff00');
            embed.setDescription('There is nothing currently playing.');
            return message.channel.send(`Şu anda oynatılan hiçbir şey yok.`);
        }

        let pos = 0;
        const queuetext = new Discord.RichEmbed()
            .setColor('#808080')
            .setTitle('__**Şarkı Kuyruğu:**__')
            .setDescription(`${serverQueue.songs.map(song => `**${++pos}) ** ${song.title}`).join('\n')}
            
            **Şimdi Çalan:** ${serverQueue.songs[0].title}`);

        return message.channel.send(queuetext);
    }
    else if(message.content.startsWith(`${prefix}pause`) || message.content.startsWith(`${prefix}duraklat`))
    {
        if(serverQueue && serverQueue.playing) 
        {
            serverQueue.playing = false;
            serverQueue.connection.dispatcher.pause();
            return message.react('⏸');
        }
        else
        {
            embed.setColor('#ffff00');
            embed.setDescription('There is nothing currently playing.');
            return message.channel.send(`Şu anda oynatılan hiçbir şey yok.`);
        }
    }
    else if(message.content.startsWith(`${prefix}resume`) || message.content.startsWith(`${prefix}devamet`) || message.content.startsWith(`${prefix}devam`))
    {
        if(serverQueue && !serverQueue.playing) 
        {
            serverQueue.playing = true;
            serverQueue.connection.dispatcher.resume();
            return message.react('▶');
        }
        else
        {
            embed.setColor('#ffff00');
            embed.setDescription('There is nothing currently playing.');
            return message.channel.send(`Şu anda oynatılan hiçbir şey yok.`);
        }
    }
    else if(message.content.startsWith(`${prefix}help`) || message.content.startsWith(`${prefix}yardım`))
    {
        const helptext = new Discord.RichEmbed()
            .setColor('#808080')
            .setTitle('Komutlar')
            .setDescription(`-**${prefix}katıl**: Bot odanıza katılır.\n- **${prefix}çal [link/isim/playlist]**: Belirtilen YouTube bağlantısını veya oynatma listesini oynatır.\n- **${prefix}ara [isim]**: En iyi 10 YouTube arama sonucunu görüntüler ve kullanıcının 1-10 arasındaki değerleri kullanarak seçim yapmasına olanak tanır. 10 Saniye içinde seçim yapılmadığında iptal edilir.\n- **${prefix}geç**: Oyantılan şarkıyı geçer.\n- **${prefix}duraklat**: Oynatılan şarkıyı duraklatır.\n- **${prefix}kuyruk**: Geçerli kuyruğu görüntüler.\n- **${prefix}devam**: Duraklatılan şarkıya devam eder..\n- **${prefix}şimdiçalan**: Geçerli şarkıyı ve onu isteyen kullanıcıyı görüntüler.\n- **${prefix}karıştır**: Geçerli kuyruğu karıştırır.\n- **${prefix}durdur**: Tüm müzikleri durdurur ve kuyruğu temizler.\n- **${prefix}döngü**: Geçerli şarkıdaki döngüyü ayarlar. Atlamada sıfırlanır.\n\n**NOT:** Komutlar türkçe ve ingilizce olarak kullanılabilir.`);

        return message.channel.send(helptext);
    }
    else if(message.content.startsWith(`${prefix}shuffle`) || message.content.startsWith(`${prefix}karıştır`))
    {
        if(serverQueue && serverQueue.playing) 
        {
            shuffle(serverQueue.songs);
            return message.react('🔀');
        }
        else
        {
            embed.setColor('#ffff00');
            embed.setDescription('There is nothing currently playing.');
            return message.channel.send(`Şu anda oynatılan hiçbir şey yok.`);
        }
    }
    else if(message.content.startsWith(`${prefix}loop`) || message.content.startsWith(`${prefix}repeat`) || message.content.startsWith(`${prefix}döngü`))
    {
        if(serverQueue && serverQueue.playing) 
        {
            if(serverQueue.loop == true)
            {
                serverQueue.loop = false;
                message.react('🔁');
                return message.react('❌');
            }
            else
            {
                serverQueue.loop = true;
                message.react('🔁');
                return message.react('✅');
            }
        }
        else
        {
            embed.setColor('#ffff00');
            embed.setDescription('There is nothing currently playing.');
            return message.channel.send(`Şu anda oynatılan hiçbir şey yok.`);
        }
    }
    /* const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        
    if (!command) return;

    if (command.args && !args.length) 
    {
		return message.send(`You didn't provide any arguments, ${message.author}!`);
    }

    if (!cooldowns.has(command.name)) 
    {
        cooldowns.set(command.name, new Discord.Collection());
    }
    
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    
    if (timestamps.has(message.author.id)) 
    {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    
        if (now < expirationTime) 
        {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try 
    {
        command.execute(message, args);
    } 
    catch (error) 
    {
        console.error(error);
        message.reply('There was an error trying to execute that command!');
    } */
});

async function handleVideo(video, message, voiceChannel, playlist = false)
{
    const serverQueue = queue.get(message.guild.id);
    console.log(video);
    const song = 
    {
        id: video.id,
        title: Util.escapeMarkdown(video.title),
        url: `https://www.youtube.com/watch?v=${video.id}`,
        requested: message.author,
        duration: video.duration,
    };

    console.log(song.duration);

    if(!serverQueue)
    {
        const queueConstruct = 
        {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 6,
            playing: true,
        };
        queue.set(message.guild.id, queueConstruct);

        queueConstruct.songs.push(song);

        try
        {
            var connection = await voiceChannel.join();
            queueConstruct.connection = connection;
            play(message.guild, queueConstruct.songs[0]);
        } 
        catch(error)
        {
            embed.setColor('#ffff00');
            embed.setDescription(`Ses kanalına girilemiyor: ${error}`);
            console.error(`Ses kanalına girilemiyor: ${error}`);
            queue.delete(message.guild.id);
            return message.channel.send(embed);
        }
    }
    else
    {
        if(!serverQueue.loop)
        {
            serverQueue.songs.push(song);
        }
        console.log(serverQueue.songs);
        if(playlist) 
        {
            return;
        }
        else 
        {
            embed.setColor('#808080');
            embed.setDescription(`✅ [${song.title}](${song.url}) kuyruğa eklendi! [${song.requested}]`);
            return message.channel.send(embed);
        }
    }
    return;
}

async function play(guild, song)
{
    const serverQueue = queue.get(guild.id);

    if(!song)
    {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    //console.log(serverQueue.songs);

    const dispatcher = serverQueue.connection.playOpusStream(await ytdl(song.url, { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25 }))
    .on('end', reason => 
    {
        if(reason == 'Stream is not generating quickly enough.') 
        {
            dispatcher.end();
            console.log('Song ended!');
        }
        else 
        {
            console.log(reason);
        }
        if(serverQueue.loop && reason == 'Skip command used!')
        {
            serverQueue.loop = false;
            serverQueue.songs.shift();
        }
        else if(!serverQueue.loop)
        {
            serverQueue.songs.shift();
        }
        play(guild, serverQueue.songs[0]);
    })
    .on('error', error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    
    const nptext = new Discord.RichEmbed()
        .setColor('#808080')
        .setTitle('Şimdi Oynatılıyor')
        .setDescription(`[${song.title}](${song.url}) [${song.requested}]`);

    serverQueue.textChannel.send(nptext);
}

function shuffle(songs) 
{
    var j, temp, i;
    for (i = songs.length - 1; i > 1; i--) 
    {
        j = Math.floor(Math.random() * (i + 1));
        while(j == 0)
        {
            j = Math.floor(Math.random() * (i + 1));
        }
        temp = songs[i];
        songs[i] = songs[j];
        songs[j] = temp;
    }
}

client.login(process.env.TOKEN);
