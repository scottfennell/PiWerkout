#!/usr/bin/python3
import RPi.GPIO as GPIO
from time import sleep
import threading
import time, math, threading

class IntervalMontior(threading.Thread):
    dist_meas = 0.00
    km_per_hour = 0
    rpm = 0
    elapse = 0
    sensor = 17
    pulse = 0
    start_timer = time.time()
    running = True
    cond = None
    data = None
    
    def __init__(self, cond, data):
        self.cond = cond
        self.data = data
        super(IntervalMontior, self).__init__()
        
    def run(self):
        self.init_GPIO();
        self.init_interrupt()
        while True:
            self.calculate_speed(20)   # call this function with wheel radius as parameter
            self.cond.acquire()
            data.rpm = self.rpm
            data.history[time.time] = self.rpm
            print('rpm:{0:.0f}-RPM kmh:{1:.0f}-KMH dist_meas:{2:.2f}m pulse:{3}'.format(rpm,km_per_hour,dist_meas,pulse))
            self.cond.release()
            sleep(0.1)
 
    def init_GPIO(self):               # initialize GPIO
       GPIO.setmode(GPIO.BCM)
       GPIO.setwarnings(False)
       GPIO.setup(self.sensor,GPIO.IN)

    def calculate_elapse(self, channel):            # callback function
       self.pulse+=1                        # increase pulse by 1 whenever interrupt occurred
       self.elapse = time.time() - self.start_timer      # elapse for every 1 complete rotation made!
       self.start_timer = time.time()            # let current time equals to start_timer

    def calculate_speed(self, r_cm):
       if self.elapse !=0:                     # to avoid DivisionByZero error
          self.rpm = 1 / self.elapse * 60
          self.circ_cm = (2 * math.pi) * self.r_cm         # calculate wheel circumference in CM
          self.dist_km = self.circ_cm / 100000          # convert cm to km
          self.km_per_sec = self.dist_km / self.elapse      # calculate KM/sec
          self.km_per_hour = self.km_per_sec * 3600      # calculate KM/h
          self.dist_meas = (self.dist_km * self.pulse) * 1000   # measure distance traverse in meter
          return self.km_per_hour

    def init_interrupt(self):
       GPIO.add_event_detect(self.sensor, GPIO.FALLING, callback = self.calculate_elapse, bouncetime = 200)

  
