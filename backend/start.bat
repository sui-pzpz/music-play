@echo off
set "JAVA_HOME=D:\Program Files\Microsoft\jdk-17.0.19.10-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"
cd /d "D:\AI\m\backend"
call mvnw.cmd spring-boot:run
pause
