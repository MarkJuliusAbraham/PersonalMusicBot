import discord
import os
import asyncio
import yt_dlp
from dotenv import load_dotenv
from discord.ext import commands


def run_bot():
    load_dotenv()
    TOKEN = os.getenv('discord_bot_token')
    intents = discord.Intents.default()
    intents.message_content = True
    client = discord.Client(intents=intents)
    bot = commands.Bot(command_prefix="!", intents=intents)

    voice_clients = {}
    yt_dlp_options = {
        "format": "bestaudio/best",
        "postprocessors": [{
        "key": "FFmpegExtractAudio",  # Converts video to audio
        "preferredcodec": "mp3",      # Audio format (e.g., 'mp3', 'aac')
        "preferredquality": "320",    # Audio quality (bitrate)
    }],
        'default_search': 'ytsearch'
    }
    ytdl = yt_dlp.YoutubeDL(yt_dlp_options)

    ffmpeg_options = {
    'before_options': '-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5',
    'options': '-vn'
    }

    # ffmpeg_options = {
    # 'before_options': '-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5 -bufsize 1000k',
    # 'options': '-vn -max_reload 1'
    # }

    @bot.event
    async def on_ready():
        print(f'{bot.user} is now online')

    @client.event
    async def on_ready():
        print(f'{client.user} is now online')

    @client.event
    async def on_message(message):
        if message.content.startswith("!play"):
            try:
                voice_client = await message.author.voice.channel.connect()
                voice_clients[voice_client.guild.id] = voice_client
            except Exception as e:
                print(e)


            try:
                url = message.content.split()[1]

                loop = asyncio.get_event_loop()
                data = await loop.run_in_executor(None, lambda: ytdl.extract_info(url, download = False))

                song = data['url']
                player = discord.FFmpegOpusAudio(song, **ffmpeg_options)

                voice_clients[message.guild.id].play(player)
            except Exception as e:
                print(e)

    @bot.command()
    async def hello(ctx):
        await ctx.send(f"Hello World!")

    @bot.command()
    async def play(ctx, *, name: str = None):

        if name is None:
            await ctx.send("Please provide a song name or URL to play!")
            return

        try:
            voice_client = await ctx.author.voice.channel.connect()
            voice_clients[voice_client.guild.id] = voice_client
        except Exception as e:
            print(e)

        try:
            url = ctx.message.content

            loop = asyncio.get_event_loop()
            data = await loop.run_in_executor(None, lambda: ytdl.extract_info(url, download = False))

            song = data['url']
            player = discord.FFmpegOpusAudio(song, **ffmpeg_options)

            voice_clients[ctx.guild.id].play(player)
        except Exception as e:
            print(e)

    client.run(TOKEN)
    # bot.run(TOKEN)