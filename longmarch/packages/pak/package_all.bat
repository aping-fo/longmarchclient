@echo off
set p=%cd%
echo %p%
call build_all.bat
cd %p%
call wecos@.bat
cd %p%
call copyRes.bat
echo 打包完成
pause