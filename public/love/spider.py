from requests_html import HTMLSession
import requests
import os
import time
import json

session = HTMLSession()
r = session.get('https://lovelist.us')
event_list = r.html.find("div.event")
x = 1
datas = [
]
def upload(filePath):
    try:
        data = {'file': open(filePath, 'rb')}
        r = requests.post('https://www.niupic.com/api/upload', files=data)
        print(r.text)
        return r.json()['data']
    except Exception as e:
        upload(filePath)

for i in event_list:
    one = {
        "done": False,
        "desc": ""
    }
    event = i.find('h2', first=True).text
    one['event'] = event
    pic = i.find('span.img', first=True).attrs['style'].replace('background-image:url(', '').replace(');', '')
    image = requests.get('https://lovelist.us' + pic)
    datas.append(one)
    with open('img/'+str(x)+".jpg",'wb') as f:
        f.write(image.content)
    url = upload('img/'+str(x)+".jpg")
    one['pic'] = url
    x += 1


json.dump(datas, open('data.json', 'w'),indent=4,ensure_ascii=False)
