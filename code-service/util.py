import os

def check_set_wd(tmp_dir='./tmp'):
    abs_tmp = os.path.expanduser(tmp_dir)
    if abs_tmp != os.getcwd():
        os.chdir(abs_tmp)
