"""
runner - code execution component of code-service

Functionality:
    - Given a supplied path to a .class file on the
      remote file system, execute the file and
      return any output/report any errors
"""

import subprocess
from os import path, chdir, getcwd
import sys
from util import check_set_wd


def exec_file(class_path, tmp_dir="./tmp", args=[]):
    # check_set_wd()
    print getcwd()
    [uuid, file_name] = class_path.split('/')
    exec_path = class_path.replace('.class', '')
    executable = file_name.replace('.class', '')
    try:
        dir_path = path.join(tmp_dir, uuid)
        chdir(dir_path)
        # tmp_path = path.join(tmp_dir, exec_path)
        run_result = subprocess.check_output(['java', executable] + args,
                                             stderr=subprocess.STDOUT)
        return run_result, exec_path
    except subprocess.CalledProcessError as e:
        return e.output, None
    finally:
        chdir("../../")



if __name__ == '__main__':
    p = sys.stdin.read()
    print exec_file(p)
