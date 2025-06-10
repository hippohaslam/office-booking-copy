# Pico WH MicroPython

This is a MicroPython project for the Raspberry Pi Pico WH with a 2.13" e-paper display.

## Hardware

Pico WH:
https://thepihut.com/products/raspberry-pi-pico-w?srsltid=AfmBOoo_1ffGW2qcz-Zzv0c4UfUpBBKVZ7vKv79v5im6gIXf9NpH8CCg

2.13" e-paper display:
https://thepihut.com/products/2-13-e-paper-hat-for-raspberry-pi-250-x-122

## Installation
Before starting, you need to install Thonny IDE. You can download it from here: https://thonny.org/

To set up a new Pico WH and flash the Thonny firmware, please follow the instructions below to flash the firmware and deploy a scrit.

Full instructions here: https://projects.raspberrypi.org/en/projects/getting-started-with-the-pico/3

Once the firmware is flashed and connected, fill in the Wi-Fi and Bookable Object Id in main.py then deploy both main.py and epd.py to the Pico WH.
Power cycle the Pico WH and then ensure the display is working. It will show an "Initialising" screen and then change to the standard desk display.