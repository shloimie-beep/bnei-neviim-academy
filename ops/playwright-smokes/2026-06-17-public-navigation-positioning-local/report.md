# Public Navigation Positioning Local Browser Smoke

Base: http://localhost:18126
Desktop screenshot: ops/playwright-smokes/2026-06-17-public-navigation-positioning-local/homepage-desktop.png
Mobile screenshot: ops/playwright-smokes/2026-06-17-public-navigation-positioning-local/homepage-mobile-menu-open.png

## Checks
- PASS desktop shared nav rendered - {"width":1366,"navText":"Bnei Nevi'im Academy\nRamat Beit Shemesh\nHome\nExplore\nBlog\nFAQ\nPortal Login\nעברית\nContact Us\nBecome a Service Provider\nRegister","navHeight":71,"actionsDisplay":"flex"}
- PASS old inline homepage nav hidden - display=none
- PASS desktop nav actions stay inside shell - {"navHeight":71}
- PASS ecosystem has AI microschool and overhead copy - BNA ECOSYSTEM
A Learning Ecosystem, Not Just a Morning Program

Bnei Neviim serves schools, families, and service providers from one connected system: a Jewish AI microschool model, a family accountability app, and a pro
- PASS ecosystem images loaded - [{"imageComplete":true,"naturalWidth":1800,"title":"Schools / AI Microschool"},{"imageComplete":true,"naturalWidth":1366,"title":"Families / Parent App"},{"imageComplete":true,"naturalWidth":1800,"title":"Less Overhead, Better Teaching"},{"imageComplete":true,"naturalWidth":2880,"title":"Service Provider Network"}]
- PASS mobile nav starts collapsed without horizontal overflow - {"actionsDisplay":"none","horizontalOverflow":false,"toggleDisplay":"flex"}
- PASS mobile nav toggle is unique - count=1
- PASS mobile portal dropdown summary is unique - count=1
- PASS mobile menu opens with grouped safe links - {"actionsDisplay":"flex","horizontalOverflow":false,"menuBottom":495,"menuText":"Home\nExplore\nBlog\nFAQ\nPortal Login\nParent Login\nStudent Login\nRabbi / Provider Login\nOperations Login\nעברית\nContact Us\nBecome a Service Provider\nRegister","viewportHeight":844}
- PASS mobile open menu fits viewport width - {"actionsDisplay":"flex","horizontalOverflow":false,"menuBottom":495,"menuText":"Home\nExplore\nBlog\nFAQ\nPortal Login\nParent Login\nStudent Login\nRabbi / Provider Login\nOperations Login\nעברית\nContact Us\nBecome a Service Provider\nRegister","viewportHeight":844}
- PASS /parent/login safe topbar links - {"horizontalOverflow":false,"operationsLinks":0,"safeLinks":[{"href":"/","text":"Public site"},{"href":"/parents","text":"Families"},{"href":"/student/login","text":"Student login"}],"text":"BNA\nBnei Neviim Academy\nParent Portal\nPublic site\nFamilies\nStudent login","title":"BNA Parent Login"}
- PASS /student/login safe topbar links - {"horizontalOverflow":false,"operationsLinks":0,"safeLinks":[{"href":"/","text":"Public site"},{"href":"/parents","text":"Families"},{"href":"/parent/login","text":"Parent login"}],"text":"BNA\nBnei Neviim Academy\nStudent workspace\nPublic site\nFamilies\nParent login\nDaily accountability","title":"Student Goal Board"}
- PASS /provider safe topbar links - {"horizontalOverflow":false,"operationsLinks":0,"safeLinks":[{"href":"/","text":"Public site"},{"href":"/service-providers","text":"Directory"},{"href":"/become-service-provider?onboard=provider","text":"Join"}],"text":"BNA\nBnei Neviim Academy\nProvider portal\nPublic site\nDirectory\nJoin\nScoped Provider Workspace","title":"BNA Provider Portal"}
