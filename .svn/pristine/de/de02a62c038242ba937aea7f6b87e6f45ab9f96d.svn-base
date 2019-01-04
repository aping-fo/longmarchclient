@echo off
set p=%cd%
cd ..
cd ..
set p2=%cd%
set filePath=assets\scripts\WXTool.js
set fPath=%p2%\%filePath%
set fPath= %fPath:\=\\%
cd %p%
start python modifyEnv.py %fPath% "const enable = false" "const enable = true"

cd /d D:\CocosCreator_2.1

CocosCreator.exe --path %p2% --build

cd %p%
start python modifyEnv.py %fPath% "const enable = true" "const enable = false"