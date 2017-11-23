"""
IntervalMonitor actually records that data input and stores it in some way
"""

import time
import math
import threading
from stats import WorkoutStats
import RPi.GPIO as GPIO


class IntervalMontior():
    rpm = 0
    elapse = 0
    sensor = 17
    start_timer = time.time()
    running = True
    cond = None
    data = None
    buffer = []

    current_workout = {'rpm': 0, 'history':{}, 'rot_count': 0, 'rpm_data': []}
    state = {'start_time': 0}
    workoutStats = WorkoutStats()

    def __init__(self, radius):
        self.radius = radius
        self.init_gpio()
        self.init_interrupt()

    def init_gpio(self):
        """
        initialize GPIO
        """
        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)
        GPIO.setup(self.sensor,GPIO.IN)

    def calculate_elapse(self, channel):
        """
        Add another measurement
        """
        self.elapse = time.time() - self.start_timer      # elapse for every 1 complete rotation made!
           
        self.start_timer = time.time()            # let current time equals to start_timer
        self.buffer.append(self.start_timer)

    def get_rpm(self):
        """
        get the current rpm measurment
        """
        return self.rpm

    def get_buffer(self):
        """
        get the history
        """
        return self.buffer

    def clear_buffer(self):
        """
        start interrupt
        """
        self.buffer = []
        return self.buffer

    def check_timeout(self):
        rpm_data = self.current_workout["rpm_data"]
        current_data_length = len(rpm_data)

        if current_data_length > 0:
            last_time = rpm_data[-1]['time']
            # If we have managed to get 30 minutes between pedals. Lets reset the history data
            if (time.time() - last_time) > 1800:
                self.reset_current_workout()


    def init_interrupt(self):
        """
        start interrupt
        """
        GPIO.add_event_detect(self.sensor,
                              GPIO.FALLING, callback=self.calculate_elapse, bouncetime=200)

    def set_interval(self, func, sec):
        """ Set interval to check for ....stuff """
        def func_wrapper():
            self.set_interval(func, sec)
            func()
        t = threading.Timer(sec, func_wrapper)
        t.start()
        return t

    def reset_current_workout(self):
        """ Take current history and archive it, or delete it, do ... something """

        clear the current workout --- maybe store it ?

    def compile_rpm(self, since):
        """ Gather rpm data and enrich with statistics """
        last_time = 0
        last_sec = 0
        last_rpm = 0
        history = self.get_buffer()
        his_length = len(history)
        rpm_data = self.current_workout["rpm_data"]
        current_data_length = len(rpm_data)

        if his_length > 0 and current_data_length > 0:
            last_time = rpm_data[-1]['time']
            last_sec = math.floor(last_time)
            # If we have managed to get 30 minutes between pedals. Lets reset the history data
            if (history[-1] - last_time) > 1800:
                self.reset_current_workout()
        elif his_length > 0:
            self.state['start_time'] = history[-1]

        #If the time gap between the last history is within a threshhold
        #Loop over the seconds (or maybe minutes)
        #Adding in data points of zero when we have no data

        for pedal_time in history:
            if last_time > 0:
                rpm = 0
                elapsed = pedal_time - last_time # Time since the last second,
                if elapsed > 0:
                    rpm = 1 / elapsed * 60
                curr_sec = math.floor(time)
                if (curr_sec - last_sec) > 1:
                    while last_sec < curr_sec:
                        rpm_data.append({"time": time - (curr_sec - last_sec), "rpm": rpm})
                        last_sec += 1
                rpm_data.append({"time": time, "rpm": rpm})
                last_rpm = rpm
                last_sec = curr_sec
                last_time = time
            else:
                last_sec = math.floor(time)
                last_time = time
                rpm_data.append({"time": time, "rpm": 0})
            self.current_workout["rot_count"] += 1


        #self.current_workout["rpm_data"] = [a for a in rpm_data if a["time"] > since]

        self.current_workout["rpm_data"] = rpm_data
        self.current_workout["velocity"] = self.workoutStats.calculate_speed(last_rpm, 10)
        self.clear_buffer()

