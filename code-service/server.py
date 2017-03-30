from flask import Flask
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
app.config["APPLICATION_ROOT"] = "/v1"

@app.route('/ping', methods = ['GET'])
def pong():
    return "pong"

@app.route('/compile', methods=['POST'])
def compile():
    return None

@app.route('/check/<uuid:file_id>', methods=['GET'])
def check():
    return None

@app.route('/run/<uuid:file_id>', methods=['GET'])
def run():
    return None

if __name__ == '__main__':
    app.run()
