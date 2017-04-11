import json

from compiler import write_temp_decoded, compile_decoded
from runner import exec_file
from os import path
from flask import Flask, request

app = Flask(__name__)

"""
Code service API:

v1:
    - /compile (POST)
        Takes base64-encoded .java file and runs javac on it
        Responds with 200 (OK) if compilation succeeded
        or 500 (server error) with the compiler output
        (to be rendered in console)
    - /check/<uuid: filename> (GET)
        Responds with the last status of the file (i.e. compilation
        successful or error)
    - /run/<uuid: filename> (GET)
        Runs java filename.java (filename <-> uuid mapping
        maintained on server

TODOs:
    - Figure out file persistence; currently will just keep
      in-memory but need to factor out into some other database
      Use SQL ideally for storing base64'd representation
      of files with key being UUID. Alternately can use a
      key-value store for this (Redis, etcd?)


Architecture of the code service:
    - (Remote) headless git server that actually stores
      the source code for the files
    - Accessed via an API that speaks base64-encoded files

"""


# Set endpoint prefix to /v1 for initial API
# app.config["APPLICATION_ROOT"] = "/v1"

@app.route('/ping', methods=['GET'])
def pong():
    return "pong"


@app.route('/compile', methods=['POST'])
def compile_blob():
    data = json.loads(request.data)
    encoded_src = data['encoded_src']
    file_name = data['file_name']
    src_path = write_temp_decoded(encoded_src, file_name)
    compiler_errors, class_path = compile_decoded(src_path)
    compiler_errors = compiler_errors.replace(src_path, file_name)
    if class_path is None:
        response_data = {'compiler_errors': compiler_errors}
        return json.dumps(response_data)
    else:
        return class_path


@app.route('/check/<uuid:file_id>', methods=['GET'])
def check():
    return None


@app.route('/run/<uuid>/<file_id>', methods=['GET'])
def run(uuid, file_id):
    class_path = path.join(uuid, file_id)
    run_errors, exec_path = exec_file(class_path)
    run_errors = run_errors.replace(class_path, file_id)
    if exec_path is None:
        response_data = {'Runtime Errors': run_errors}
        return json.dumps(response_data)
    else:
        return exec_path

    return None


if __name__ == '__main__':
    app.run()
