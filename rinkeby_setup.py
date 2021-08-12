# configure react app to use rinkeby network

import json

with open("react-app/src/env.json", 'w') as fw:
    with open("react-app/src/info.json", 'r') as fr:
        rinkeby_data = json.load(fr)
        json.dump(rinkeby_data, fw, indent=4)