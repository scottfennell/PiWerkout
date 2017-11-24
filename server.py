from flask import Flask, render_template, jsonify
from flask_cors import CORS, cross_origin
from calculate_interval import IntervalMontior
from stats import WorkoutStats
import math

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'secret!'
# socketio = SocketIO(app)

monitor = IntervalMontior(radius=20, debug=True)
workoutStats = WorkoutStats()
rpm_data = []


@app.route('/')
def index():
    """ Return the index """
    return render_template('index.html', rpm=monitor.get_rpm())
    
@app.route('/rpm/<int:since>')
def rpm_since(since):
    """ return the rpm data since a time, since is epoch time """
    data = monitor.get_current_workout()
    return jsonify(data)

@app.route('/rpm/<float:since>')
def rpm_since_float(since):
    """ Rpm since, but since is a float and includes microseconds """
    data = monitor.get_current_workout()
    return jsonify(data)

def clear_data():
    """ Clear data """
    rpm_data = []


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
    # socketio.run(app)