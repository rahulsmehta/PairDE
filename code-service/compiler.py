"""
compiler - compilation service for code-service module.

Functionality:
    - Given a base64-encoded java file & a corresponding file name,
      write the decoded source code to a temp file
    - After writing to a temp file, compile the file, and report
      any errors if they occur
"""

import sys
from os import path,mkdir
import base64
import subprocess
from uuid import uuid1

def write_temp_decoded(encoded_src, file_name, tmp_dir="./tmp"):
    org_src = base64.b64decode(encoded_src)
    try:
        tmp_path = path.join(tmp_dir,str(uuid1()))
        mkdir(tmp_path)
        file_path = path.join(tmp_path,file_name)
        tmp_file = open(file_path, 'w')
        tmp_file.write(org_src)
        return file_path
    except:
        return False

def compile_decoded(src_path):
    t = src_path.split('/')
    file_name = t[-1].split('.')[0]
    file_name += '.class'
    class_path = path.join('/'.join(t[0:-1]),file_name)
    try:
        compiler_result = subprocess.check_output(['javac',src_path],
                                          stderr=subprocess.STDOUT)
        return compiler_result,class_path
    except subprocess.CalledProcessError as e:
        return e.output,None


if __name__ == '__main__':
    input = sys.stdin.read()
    src_path = write_temp_decoded(input, file_name='HelloWorld.java')
    compiler_errors,path = compile_decoded(src_path)
    if path is None:
        sys.stdout.write(compiler_errors)
    else:
        print path
