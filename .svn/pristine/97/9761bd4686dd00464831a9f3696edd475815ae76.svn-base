@echo off
set p=%cd%
cd ..
cd ..
set p2=%cd%
set filePath=build\wechatgame\res
set fPath=%p2%\%filePath%
set fPath= %fPath:\=\\%
rd /s /q %fPath%

set filePath=bak\res
set fPath=%p2%\%filePath%
set fPath= %fPath:\=\\%

set filePath2=build\wechatgame\res
set fPath2=%p2%\%filePath2%
set fPath2= %fPath2:\=\\%

xcopy %fPath% %fPath2% /s/i
