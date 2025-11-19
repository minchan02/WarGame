해당 문제는 Log4j 1-day 취약점 문제로 처음 발생했던 CVE-2021-44228이 아닌 한번 패치가 된 2.15버전에서 발생하는 CVE-2021-45046을 타겟으로 한 문제입니다.

1. Filtering Bypass
먼저 여러 필터링이 걸려있는데 해당 필터링은 ${date:} 표현식을 사용하여 우회가 가능합니다.

2. URL Bypass
해당 패치에선 로컬호스트 이외의 다른 url은 lookup이 불가능하도록 설정했지만 JAVA의 URL class에선 # 주석을 사용하여 이를 우회할 수 있습니다.
ex) localhost#.attacker.com

3, TOCTOU
URL bypass에 성공해도 해당 패치에선 lookup한 곳이 악성서버로 의심될 경우 차단하고 있습니다.
그러나 이는 TOCTOU기법으로 bypass가 가능하며 첫번째에 정상적인URL을 넣고 그 뒤에 바로 악성 URL을 넣으면 성공적으로 내 서버에 ldap명령을 수행할 수 있게 됩니다.
https://secariolabs.com/analysing-and-reproducing-poc-for-log4j-2-15-0/
