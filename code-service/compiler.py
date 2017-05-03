"""
compiler - compilation service for code-service module.

Functionality:
    - Given a base64-encoded java file & a corresponding file name,
      write the decoded source code to a temp file
    - After writing to a temp file, compile the file, and report
      any errors if they occur
"""

import sys
from os import path, mkdir, chdir
import base64
import subprocess
import hashlib
from uuid import uuid1
from util import check_set_wd

def hash_path(fs_path):
    md5 = hashlib.md5()
    md5.update(fs_path)
    return md5.hexdigest()


def write_temp_decoded(encoded_src, file_name, fs_path, tmp_dir="./tmp"):
    # check_set_wd()
    org_src = base64.b64decode(encoded_src)
    try:
        tmp_path = path.join(tmp_dir, hash_path(fs_path))
        if not path.exists(tmp_dir):
            mkdir(tmp_dir)
        if not path.exists(tmp_path):
            mkdir(tmp_path)
        file_path = path.join(tmp_path, file_name)
        tmp_file = open(file_path, 'w+')
        tmp_file.write(org_src)
        return file_path
    except IOError:
        return False


def compile_decoded(src_path):
    t = src_path.split('/')
    file_name = t[-1].split('.')[0]
    src_name = file_name + '.java'
    file_name += '.class'
    class_path = path.join('/'.join(t[0:-1]), file_name)
    try:
        dir_path = '/'.join(t[:-1])
        chdir(dir_path)
        compiler_result = subprocess.check_output(['javac', src_name],
                                                  stderr=subprocess.STDOUT)
        return compiler_result, class_path
    except subprocess.CalledProcessError as e:
        return e.output, None
    finally:
        chdir('../../')


if __name__ == '__main__':
    input_encoded = sys.stdin.read()
    src = write_temp_decoded(input_encoded, file_name='HelloWorld.java')
    compiler_errors, path = compile_decoded(src)
    if path is None:
        sys.stdout.write(compiler_errors)
    else:
        print path
