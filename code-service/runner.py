"""
runner - code execution component of code-service

Functionality:
    - Given a supplied path to a .class file on the
      remote file system, execute the file and
      return any output/report any errors
"""

import subprocess
import os
from util import check_set_wd


def exec_file(class_path):
    # check_set_wd()
    exec_path = class_path.replace('.class', '')
    try:
        run_result = subprocess.check_output(['java', class_path],
                                             stderr=subprocess.STDOUT)
        return run_result, exec_path
    except subprocess.CalledProcessError as e:
        return e.output, None


if __name__ == '__main__':
    p = sys.stdin.read()
    print exec_file(p)
