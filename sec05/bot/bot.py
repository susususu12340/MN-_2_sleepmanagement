#!/usr/bin/env python3

import requests
import json
import time
import api.schemas.message


class Bot():
    def __init__(self):
        self.base_url = 'http://127.0.0.1:8000'
        self.server_id = None

    def post_message(self, name, message):
        url = f"{self.base_url}/messages"
        m = api.schemas.message.MessageBase(name=name, message=message)
        requests.post(url, data=json.dumps(m.model_dump()))

    def get_message(self, message_id):
        url = f"{self.base_url}/messages/{message_id}"
        res = requests.get(url)
        res_json = json.loads(res.text)
        response = api.schemas.message.Message.parse_obj(res_json)
        return response

    def check(self):
        url = self.base_url
        url = f"{url}/messages/current_id"
        res = requests.get(url)
        res_json = json.loads(res.text)
        if self.server_id is not None and \
           res_json['current_id'] != self.server_id:
            for i in range(self.server_id + 1, res_json['current_id'] + 1):
                message = self.get_message(i)
                self.print_message(message)

        self.server_id = res_json['current_id']

    @classmethod
    def print_message(cls, message):
        star = "★" if message.important else ""
        print(f"{message.update_time.strftime('%H:%M:%S')} "
              f"{message.name}: {message.message}{star}")

    @classmethod
    def main(cls):
        bot = Bot()
        while True:
            bot.check()
            time.sleep(1)


if __name__ == "__main__":
    Bot.main()
