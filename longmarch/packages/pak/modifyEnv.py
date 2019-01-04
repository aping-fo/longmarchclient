import sys
def alter(file,old_str,new_str):
    """
    替换文件中的字符串
    :param file:文件名
    :param old_str:就字符串
    :param new_str:新字符串
    :return:
    """
    file_data = ""
    result=0
    with open(file, "r", encoding="utf-8") as f:
        for line in f:
            if old_str in line:
                result=1
                line = line.replace(old_str,new_str)
            file_data += line
    with open(file,"w",encoding="utf-8") as f:
        f.write(file_data)
        return result

contains=alter(sys.argv[1], sys.argv[2], sys.argv[3])
if contains == 1 and len(sys.argv)>4:
   alter(sys.argv[1], sys.argv[4], sys.argv[5])