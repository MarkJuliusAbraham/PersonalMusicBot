import discord
import json
import os


with open('config.json', 'r') as file:
    json_data = json.load(file)

from discord.ext import commands

intents = discord.Intents.default()
intents.message_content = True # enables message related events
bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f'Logged in as {bot.user}')

@bot.command()
async def hello(ctx):
    await ctx.send('Hello')

@bot.command()
async def prefix(ctx, *, target: str = None):

    if target is None:
        await ctx.send("Please provide a name after the command! Example: `!greet John`")
    else:
        bot.command_prefix = ctx.message.content
        await ctx.send(target)



    

bot.run(json_data['token'])