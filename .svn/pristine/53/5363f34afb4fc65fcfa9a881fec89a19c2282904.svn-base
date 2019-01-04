import os
from qcloud_cos import CosConfig
from qcloud_cos import CosS3Client
import sys
import logging

path=os.path.abspath(os.path.join(os.getcwd(), "../.."))
f=open(path+'\\version.txt', 'r')
version=f.read();

os.system('@echo off')
os.system('coscmd delete -r -f longmarch/'+version+'/res/')
os.chdir(path+'\\build\\wechatgame')
os.system('coscmd upload -r res longmarch/'+version+'/res')

file=path+'\\build\\wechatgame\\game.js'
old_str='wxDownloader.REMOTE_SERVER_ROOT'
file_data = ""
with open(file, "r", encoding="utf-8") as f:
    for line in f:
        if old_str in line:
            result = 1
            line = 'wxDownloader.REMOTE_SERVER_ROOT = "https://medicine-1257469607.cos.ap-guangzhou.myqcloud.com/longmarch'+'/'+version+'";\n'
        file_data += line
with open(file, "w", encoding="utf-8") as f:
    f.write(file_data)
