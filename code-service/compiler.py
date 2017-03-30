"""
compiler - compilation service for code-service module.

Functionality:
    - Given a base64-encoded java file & a corresponding file name,
      write the decoded source code to a temp file
    - After writing to a temp file, compile the file, and report
      any errors if they occur
"""

import sys
import os
import base64

def write_temp_decoded(encoded_src, file_name):
    tmp_file = open(file_name, 'w')
    org_src = base64.b64decode(encoded_src)
    try:
        tmp_file.write(org_src)
        return True
    except:
        return False

if __name__ == '__main__':
    input = sys.stdin.read()
    write_temp_decoded(input, "HelloWorld.java")
