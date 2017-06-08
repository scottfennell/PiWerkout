from flask import Flask, render_template, jsonify
from calculate_interval import IntervalMontior
import math

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
# socketio = SocketIO(app)
data = {'rpm': 0, 'history':{}, 'rot_count': 0}
monitor = IntervalMontior(radius = 20)
rpm_data = []
state = {'start_time': 0}

@app.route('/')
def hello_world():
    return render_template('index.html', rpm=monitor.get_rpm())
    
@app.route('/rpm/<int:since>')
def rpm_since(since):
    compileRpm()
    return jsonify(data)

@app.route('/rpm/<float:since>')
def rpm_since_float(since):
    compileRpm()
    return jsonify(data)

def clear_data():
    print("clearing rpm data");
    rpm_data = []

def compileRpm():
    last_time = 0
    last_sec = 0
    history = monitor.get_history()
    if len(history) > 0 and len(rpm_data) > 0:
        last_time = rpm_data[-1]['time']
        last_sec = math.floor(last_time)
        if (history[-1] - last_time) > 1800:
            clear_data()
    elif len(history) > 0:
        state['start_time'] = history[-1];
    
    #If the time gap between the last history is within a threshhold
    #Loop over the seconds (or maybe minutes)
    #Adding in data points of zero when we have no data
    
    for time in history:    
        if last_time > 0:
            elapsed = time - last_time # Time since the last second, 
            if (elapsed > 0):
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
        
        data["rot_count"] += 1
    
    data["rpm_data"] = rpm_data
    
    monitor.clear_history()
    

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
    # socketio.run(app)