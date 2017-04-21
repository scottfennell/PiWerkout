from flask import Flask, render_template
from flask_socketio import SocketIO
import calculate_interval as monitor

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)


@app.route('/')
def hello_world():
    return render_template('index.html', rpm=monitor.rpm)
    

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
    socketio.run(app)