import json
import bson
from flask import Flask, request, session
# from flask_uuid import FlaskUUID
from flask_pymongo import PyMongo
from uuid import uuid4
from bson.objectid import ObjectId
from flask_cors import CORS, cross_origin
from flask_socketio import send, emit, SocketIO

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app)
mongo = PyMongo(app)

"""
"""

# Set endpoint prefix to /v1 for initial API
# app.config["APPLICATION_ROOT"] = "/v1"

locks = dict({})
pair_sessions = dict({})


@app.route('/ping', methods=['GET'])
def pong():
    return "pong"


@app.route('/create-shared/<u1>/<u2>/<assignment>', methods=['POST'])
def create(u1, u2, assignment):
    # Create a new shared directory with path /shared/u1_u2_assignment
    dirname = u1 + "_" + u2 + "_" + assignment
    path = "/shared/" + dirname
    if (mongo.db.code.find_one({'path': path}) != None):
        return "file already exists"
    shared = mongo.db.code.find_one({'path': "/shared"})
    mongo.db.code.insert(
        {'name': dirname, 'children': [], 'contents': None, 'isDir': True, 'parent': shared['_id'],
         'path': path})
    newDir = mongo.db.code.find_one({'path': path})
    mongo.db.code.update({'_id': shared['_id']}, {"$addToSet": {'children': newDir['_id']}})
    return "success"


@app.route('/list-shared/<user>', methods=['GET'])
def getshared(user):
    # Return list of all shared directories belonging to user
    reg1 = user + '_.*'
    reg2 = '.*_' + user + '_.*'

    # TODO - fix this logic
    list1 = list(mongo.db.code.find({"name": {"$regex": reg1}}))
    list2 = list(mongo.db.code.find({"name": {"$regex": reg2}}))
    merged = []
    for i in list1:
        merged.append(i)
    for z in list2:
        if z not in merged:
            merged.append(z)

    if len(merged) == 0:
        return json.dumps([])
    loaded = []
    for directory in merged:
        # loaded.append({'rawSrc': None, 'fileName': directory['name'], 'isDir': True})
        loaded_dir = {'rawSrc': None, 'fileName': directory['name'], 'isDir': True}
        loaded_dir['children'] = []
        children = directory['children']
        for rid in children:
            doc = mongo.db.code.find_one({'_id': bson.ObjectId(oid=str(rid))})
            if len(doc) <= 0:
                continue
            if doc['isDir']:
                loaded_dir['children'].append({'rawSrc': None, 'fileName': doc['name'],
                                               'isDir': True, 'rid': str(rid)})
            else:
                loaded_dir['children'].append({'rawSrc': doc['contents'], 'fileName': doc['name'],
                                               'isDir': False, 'rid': str(rid)})
        loaded.append(loaded_dir)
    return json.dumps(loaded)


def evict_session(user, lock_path):
    global pair_sessions
    if lock_path in pair_sessions:
        users = pair_sessions[lock_path]
        if user in users:
            users.remove(user)
            pair_sessions[lock_path] = users
            print pair_sessions
            return True
    return False


def get_current_session(user):
    global pair_sessions
    for k, v in pair_sessions.iteritems():
        if user in v:
            return k
    return None


@socketio.on('join_session', namespace='/')
def join_session(payload):
    global pair_sessions
    data = json.loads(payload)
    lock_path = data['path']
    user = data['user'], request.sid
    session = get_current_session(user)
    if session is not None:
        if session == lock_path:
            pass
        elif session != lock_path:
            evict_session(user, session)
    if lock_path not in pair_sessions:
        pair_sessions[lock_path] = [user]
        print "{} joined {}".format(user, lock_path)
        print pair_sessions
    elif (lock_path in pair_sessions) and (user in pair_sessions[lock_path]):
        pass
    elif (lock_path in pair_sessions) and (user not in pair_sessions[lock_path]):
        users = pair_sessions[lock_path]
        users.append(user)
        pair_sessions[lock_path] = users
        print "{} joined {}".format(user, lock_path)
        print pair_sessions

@socketio.on('pair_file_change', namespace='/')
def on_pair_file_change(payload):
    data = json.loads(payload)
    print data
    lock_path = data['lockPath']
    new_file = data['rid']
    sid = request.sid
    emit('change_file', json.dumps({'sid':str(sid), 'path': lock_path, 'newRid': new_file,
                                    'fn': data['fn']}), namespace = '/', broadcast=True)

@socketio.on('get_lock', namespace='/')
def get_lock(payload, path):
    global locks
    global pair_sessions
    lock_request = json.loads(payload)
    user = lock_request['user']
    lock_path = lock_request['lock_path']
    sid = request.sid
    if lock_path in pair_sessions and len(pair_sessions[lock_path]) < 2:
        emit('lock_fail', json.dumps({'sid': str(sid), 'path': lock_path, 'msg':'Your partner is not online!'}), namespace='/')
    elif (lock_path in locks) and (locks[lock_path] is not None):
        emit('lock_fail', json.dumps({'sid': str(sid), 'path': lock_path, 'msg': 'Someone else is editing!'}), namespace='/')
    else:
        locks[lock_path] = {'sid': sid, 'user': user}
        emit('lock_success', json.dumps({'sid': str(sid), 'path': lock_path}), namespace='/', broadcast=True)


@socketio.on('disconnect', namespace='/')
def on_disconnect():
    global locks
    global pair_sessions
    for k, v in pair_sessions.iteritems():
        sids = map(lambda t: t[1], v)
        if request.sid in sids:
            new_users = filter(lambda t: t[1] != request.sid, v)
            pair_sessions[k] = new_users
            print "evicted {}".format(request.sid)

    for k, v in locks.iteritems():
        if v['sid'] == request.sid:
            print "{} disconnected...releasing lock".format(request.sid)
            del locks[k]
            emit('release_success', json.dumps({'sid': request.sid, 'path': k}), namespace='/', broadcast=True)


@socketio.on('release_lock', namespace='/')
def release_lock(payload, p):
    print "Received release lock request for {} from {}...acking...".format(payload, request.sid)
    global locks
    lock_request = json.loads(payload)
    lock_path = lock_request['lock_path']
    sid = request.sid
    if (lock_path in locks) and (locks[lock_path] is not None) and (locks[lock_path]['sid'] == sid):
        del locks[lock_path]
        emit('release_success', json.dumps({'sid': sid, 'path': lock_path}), namespace='/', broadcast=True)
    else:
        emit('release_fail', json.dumps({'sid': sid, 'path': lock_path}), namespace='/')


@socketio.on('code', namespace='/')
def on_code(payload, path):
    print "Received payload from {}".format(request.sid)
    code_obj = json.loads(payload)
    emit('code-sub', json.dumps({'sid': request.sid, 'code': code_obj['src'],
                                 'path': code_obj['path']}), namespace='/', broadcast=True)


if __name__ == '__main__':
    app.secret_key = 'cos333'
    socketio.run(app, port=9000, host='0.0.0.0', debug=True)
