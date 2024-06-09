#!/usr/bin/env python3

import requests
import json
import time
import api.schemas.message
import re
from sympy import sieve

base_url = 'http://10.1.6.203:8000'
server_id = None

bot_name1 = "ボット1"
bot_name2 = "ボット2"

def post_message(name, message):
    url = f"{base_url}/messages"
    m = api.schemas.message.MessageBase(name=name, message=message)
    requests.post(url, data=json.dumps(m.model_dump()))


def get_message(message_id):
    url = f"{base_url}/messages/{message_id}"
    res = requests.get(url)
    res_json = json.loads(res.text)
    response = api.schemas.message.Message.parse_obj(res_json)
    return response


def print_message(message):
    star = "★" if message.important else ""
    print(f"{message.update_time.strftime('%H:%M:%S')} "
          f"{message.name}: {message.message}{star}")


def check():
    url = base_url
    url = f"{url}/messages/current_id"
    res = requests.get(url)
    res_json = json.loads(res.text)
    global server_id  # ←関数外の変数に書き込むため global を使用
    if server_id is not None and \
       res_json['current_id'] != server_id:
        for i in range(server_id + 1, res_json['current_id'] + 1):
            message = get_message(i)
            print_message(message)

    server_id = res_json['current_id']

def answer():
    url = base_url
    url = f"{url}/messages/current_id"
    res = requests.get(url)
    res_json = json.loads(res.text)
    global server_id  # ←関数外の変数に書き込むため global を使用
    if server_id is not None and \
        res_json['current_id'] != server_id:
        for i in range(server_id + 1, res_json['current_id'] + 1):

            message = get_message(i)
            print_message(message)

            if "ぬるぽ" == message.message:
                post_message(bot_name1, "ガッ>>"+message.name)

            print(message.message)
            m = re.findall(r'\d+', message.message)
            print(m)

            calc_massage = ""

            if len(m) != 0:
                for i, j in enumerate(m):
                    if int(j) in sieve:
                        calc_massage = calc_massage + "素数"
                    else:
                        calc_massage = calc_massage + "素数じゃない"

                    if i != len(m)-1:
                        calc_massage = calc_massage + ", "
                
                post_message(bot_name2, calc_massage)
                m = []

    server_id = res_json['current_id']


def main():
    while True:
        #check()
        answer()
        time.sleep(1)

if __name__ == "__main__":
    main()
