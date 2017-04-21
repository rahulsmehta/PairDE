from flask import Flask, request, redirect, url_for
from flask_pymongo import PyMongo

app = Flask(__name__)
mongo = PyMongo(app)

"""
TODO: Implement storage service with headless git repo
"""


# Set endpoint prefix to /v1 for initial API
# app.config["APPLICATION_ROOT"] = "/v1"

@app.route('/ping', methods=['GET'])
def pong():
    return "pong"


@app.route('/create/<pathtoresource>', methods=['GET'])
def create(pathtoresource):
    f = open("testfile.txt", "w+")
    for i in range(10):
        f.write("This is line %d\r\n" % (i + 1))
    mongo.save_file(pathtoresource, f)
    f.close()
    x = redirect(url_for('get_upload', filename=pathtoresource))
    return x.data


@app.route('/uploads/<path:filename>')
def get_upload(filename):
    return mongo.send_file(filename)
    # return redirect(url_for('get_upload', filename=filename))
    # client = MongoClient()
    # newID = db.insert_one({'name':'sam'})
    # db = client.local
    # return "foo"


@app.route('/uploads/<path:filename>', methods=['POST'])
def save_upload(filename):
    mongo.save_file(filename, request.files['file'])
    return redirect(url_for('get_upload', filename=filename))


if __name__ == '__main__':
    app.run(debug=True)
