@echo off
set "JAVA_HOME=D:\Program Files\Microsoft\jdk-17.0.19.10-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"
call mvnw.cmd clean package -DskipTests