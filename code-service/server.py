import json

from compiler import write_temp_decoded, compile_decoded
from runner import exec_file
from os import path
from flask import Flask, request
from flask_cors import CORS
import urllib2
import xmltodict

app = Flask(__name__)

# Enable CORS for the app (since requests will be coming from localhost:3000
CORS(app)

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

SERVICE_URL = "http%3A%2F%2Flocalhost%3A3000%2F"


# Set endpoint prefix to /v1 for initial API
# app.config["APPLICATION_ROOT"] = "/v1"

@app.route('/ping', methods=['GET'])
def pong():
    return "pong"

@app.route('/validate/<string:ticket>', methods=['GET'])
def validate_cas_ticket(ticket):
    cas_url = "https://fed.princeton.edu/cas/serviceValidate?service={}&ticket={}"
    cas_url = cas_url.format(SERVICE_URL, ticket)
    try:
        result = urllib2.urlopen(cas_url).read()
        cas_response = xmltodict.parse(result)
        user = cas_response['cas:serviceResponse']['cas:authenticationSuccess']['cas:user']
        return user
    except:
        return "failure"

@app.route('/compile/<path:path>', methods=['POST'])
def compile_blob(path):
    path = '/' + path
    data = json.loads(request.data)
    encoded_src = data['encoded_src']
    file_name = data['file_name']

    parentPath = '/'.join(path.split('/')[:-1])
    if '/' not in parentPath:
        parentPath = '/' + parentPath
    src_path = write_temp_decoded(encoded_src, file_name, parentPath)
    compiler_errors, class_path = compile_decoded(src_path)
    compiler_errors = compiler_errors.replace(src_path, file_name)
    if class_path is None:
        response_data = {'compiler_errors': compiler_errors, 'class_path': None}
        return json.dumps(response_data)
    else:
        response_data = {'compiler_errors': None, 'class_path': class_path}
        return json.dumps(response_data)


@app.route('/check/<uuid:file_id>', methods=['GET'])
def check():
    return None


@app.route('/run/<uuid>/<file_id>', methods=['POST'])
def run(uuid, file_id):
    data = json.loads(request.data)
    extra_args = data['extra_args']
    class_path = path.join(uuid, file_id)
    run_result, exec_path = exec_file(class_path, args=extra_args)
    if exec_path is None:
        run_errors = run_result.replace(class_path, file_id)
        response_data = run_errors
        return json.dumps(response_data)
    else:
        return run_result


if __name__ == '__main__':
    app.run(debug=True, threaded=True)
