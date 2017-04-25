from flask import Flask, render_template
from calculate_interval import IntervalMontior
import threading

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
# socketio = SocketIO(app)
data = {'rpm': 0, 'history':{}}
cond = threading.Condition()
monitor = IntervalMontior(cond,data);
monitor.start()

@app.route('/')
def hello_world():
    cond.acquire()
    rpm = data.rpm
    cond.release()
    return render_template('index.html', rpm=rpm)
    
@app.route('/rpm/<int:since>')
def rpm_since(since):
    return 0


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
    # socketio.run(app)