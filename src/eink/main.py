# Based on Pico_ePaper-2.13_V3.py

###################################################
# Set variables below per device

BOOKABLE_OBJECT_ID = 1
WIFI_SSID = ""
WIFI_PASSWORD = ""
AUTH_KEY=""
###################################################

import network
import requests
import time
import gc

from epd import EPD_2in13_V4_Landscape

def update_display_with_booking(response_obj):
    epd = EPD_2in13_V4_Landscape()
    epd.Clear()
    epd.fill(0xff)

    epd.write_text(response_obj["objectName"], 0, 10, 3, 0x00)

    if response_obj["isBooked"]:
        epd.write_text("BOOKED BY", 0, 40, 2, 0x00)
        epd.write_text(response_obj["bookedBy"], 0, 80, 2, 0x00)

    else:
        epd.write_text("AVAILABLE", 0, 60, 3, 0x00)

    epd.display(epd.buffer)
    epd.delay_ms(2000)
    epd.sleep()

if __name__ == '__main__':
    epd = EPD_2in13_V4_Landscape()
    epd.Clear()
    epd.fill(0xff)
    epd.write_text("Initialising...", 0, 10, 2, 0x00)
    epd.display(epd.buffer)

    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    # Connect to your network
    wlan.connect(WIFI_SSID, WIFI_PASSWORD)

    while not wlan.isconnected():
        pass

    epd.write_text("WLAN Connected", 0, 30, 2, 0x00)
    epd.display(epd.buffer)

    url = "https://reserveapi.internal.hippodigital.cloud/screen/availability/" + str(BOOKABLE_OBJECT_ID)

    last_response_obj = None

    while True:
        try:
            response = requests.get(url, headers={"Auth-Key": AUTH_KEY})

            if response.status_code == 200:
                responseObj = response.json()

                if last_response_obj != responseObj:
                    last_response_obj = responseObj
                    update_display_with_booking(responseObj)

            elif response.status_code == 204:
                print("API No Content")

            else:
                epd = EPD_2in13_V4_Landscape()
                epd.Clear()
                epd.fill(0xff)

                print("Error: " + str(response.status_code))
                epd.write_text("Error!!!", 0, 10, 3, 0x00)
                epd.write_text(str(response.status_code), 0, 40, 1, 0x00)
                epd.display(epd.buffer)
                epd.delay_ms(2000)
            epd.sleep()

            time.sleep(300)
            gc.collect()
        except:
            countdown_for_api_refresh = 0
            epd = EPD_2in13_V4_Landscape()
            epd.Clear()
            epd.fill(0xff)
            epd.write_text("Error!!!", 0, 10, 3, 0x00)
            epd.write_text("Will retry", 0, 40, 1, 0x00)
            epd.display(epd.buffer)
            epd.sleep()
            time.sleep(5)
            machine.reset()
