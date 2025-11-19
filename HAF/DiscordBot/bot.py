import discord
import datetime, pytz
from discord.ext import commands

f = open('token.txt', 'r')
token = f.readline().strip()
f.close()

f = open('secret.txt', 'r')
secret = f.readline().strip()
f.close()

class Bot(commands.Bot):
    def __init__(self, intents:discord.Intents, **kwargs):
        super().__init__(command_prefix="!", intents=intents, case_insenstitive=True)
        
    async def on_ready(self):
        print(f"Logged in as {self.user}")
        await self.tree.sync()
        
    async def send_msg(self, ctx, content=None):
        await ctx.send(content, ephemeral=True)
        
intents = discord.Intents.all()
bot = Bot(intents=intents)

@bot.hybrid_command(name='admin', description='admin command')
async def admin(ctx: commands.Context):
    if ctx.guild:
        member = ctx.guild.get_member(ctx.author.id)
        if member.guild_permissions.administrator:
            await bot.send_msg(ctx, f'hello secret value is {secret}')
        else:
            await bot.send_msg(ctx, 'no permission')
    else:
        await bot.send_msg(ctx, 'This command can only be used in a server.')

@bot.hybrid_command(name='notice', description='HAF Wargame notice')
async def notice(interaction: discord.Interaction):
    embed = discord.Embed(title="Hide A Flag", description="Hello, join our wargame!",timestamp=datetime.datetime.now(pytz.timezone('UTC')), color=0x00ff00)

    embed.add_field(name="Site", value="http://haf.world", inline=False)
    embed.add_field(name="Rule1", value="문제 서버 이외 워게임 사이트를 공격하지 말아주세요", inline=False)
    embed.add_field(name="Rule2", value="Dos공격을 시도하지 말아주세요", inline=False)
    embed.add_field(name="Rule3", value="문제 오류가 의심될때 admin에게 곧바로 연락주세요", inline=False)
    embed.add_field(name="Rule4", value="Flag값이 다른 참가자에게 유출되지 않도록 주의해주세요", inline=False)
    embed.add_field(name="Rule5", value="Flag포맷은 flag{sample_flag} 혹은 FLAG{sample_flag}입니다", inline=False)

    embed.set_thumbnail(url="https://cdn.discordapp.com/attachments/1258334142144450611/1258482343602028585/images.jpg?ex=66883484&is=6686e304&hm=22debe238c9facef696170889f6fd697aac7004598e8b8a8d43eb54d6383b6c0&")

    await interaction.reply(embed=embed, ephemeral=True)
    
@bot.hybrid_command(name='permission', description='Change Role')
async def permission(ctx: commands.Context, permission_name: str, key: str = None):
    if not ctx.guild:
        await bot.send_msg(ctx, 'This command can only be used in a server.')
        return
    
    member = ctx.guild.get_member(ctx.author.id)
    server_id = 1258809267545313353
    guild = bot.get_guild(server_id)
    
    if not guild:
        await bot.send_msg(ctx, f'Server with ID {server_id} not found.')
        return
    
    if permission_name == "challenger":
        role = discord.utils.get(guild.roles, name="challenger")
        if role:
            await member.add_roles(role)
            await bot.send_msg(ctx, 'Role \'challenger\' has been assigned.')
        else:
            await bot.send_msg(ctx, 'Role \'challenger\' not found.')
    
    elif permission_name == "haf":
        if key == secret:
            role = discord.utils.get(guild.roles, name="haf")
            if role:
                await member.add_roles(role)
                await bot.send_msg(ctx, 'Role \'haf\' has been assigned.')
            else:
                await bot.send_msg(ctx, 'Role \'haf\' not found')
        else:
            await bot.send_msg(ctx, 'invalid key')
    
bot.run(token)