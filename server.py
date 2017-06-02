from flask import Flask, render_template, jsonify
from calculate_interval import IntervalMontior
import math

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
# socketio = SocketIO(app)
data = {'rpm': 0, 'history':{}}
monitor = IntervalMontior(radius = 20)
rpm_data = []

@app.route('/')
def hello_world():
    return render_template('index.html', rpm=monitor.get_rpm())
    
@app.route('/rpm/<int:since>')
def rpm_since(since):
    compileRpm()
    return jsonify({"rpm_data": rpm_data})

@app.route('/rpm/<float:since>')
def rpm_since_float(since):
    compileRpm()
    return jsonify({"rpm_data": rpm_data})


def compileRpm():
    last_time = 0
    last_sec = 0
    history = monitor.get_history()
    if len(history) > 0 and len(rpm_data) > 0:
        #TODO Check to see if we should just start a new session if the elapsed 
        #TODO time is too much - but we should actually do this in the loop,
        #TODO  because this only gets run on read
        last_time = rpm_data[-1]['time']
        last_sec = math.floor(last_time)
    
    #If the time gap between the last history is within a threshhold
    #Loop over the seconds (or maybe minutes)
    #Adding in data points of zero when we have no data
    
    for time in history:    
        if last_time > 0:
            elapsed = time - last_time # Time since the last second, 
            rpm = 1 / elapsed * 60
            curr_sec = math.floor(time)
            if (curr_sec - last_sec) > 1:
                while last_sec < curr_sec:
                    rpm_data.append({"time": time - (curr_sec - last_sec), "rpm": rpm})
                    last_sec += 1
            rpm_data.append({"time": time, "rpm": rpm})
            
            last_sec = curr_sec
            last_time = time
        else:
            last_sec = math.floor(time)
            last_time = time
            rpm_data.append({"time": time, "rpm": 0})
    
    
    monitor.clear_history()
    

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
    # socketio.run(app)