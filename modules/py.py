from py3cw.request import Py3CW

# request_options is optional, as all the keys from the dict
# so you can only change what you want.
#
# default options for request_options are:
# request_timeout: 30s (30 for connect, 30 for read)
# nr_of_retries: 5
# retry_status_codes: [500, 502, 503, 504]
# retry_backoff_factor (optional): It allows you to change how long the processes will sleep between failed requests.
# For example, if the backoff factor is set to:
# 1 second the successive sleeps will be 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256.
# 2 seconds - 1, 2, 4, 8, 16, 32, 64, 128, 256, 512
# 10 seconds - 5, 10, 20, 40, 80, 160, 320, 640, 1280, 2560
# 
# NOTE: Nr of retries and retry_status_codes will also be used if we get 
# an falsy success from 3 commas (eg: { "error": { "status_code": 502 }})
p3cw = Py3CW(
    key='54526ece1ca04e71bf35fa98fc88d19703076483900c468bb3d666349685032a', 
    secret='3b0439be408503039e0000f5a2c3fc2f118b337abadac3be53f411168d0306062d1ee50bc1430247cd4bd3c2b27eb620c976c950b468b240afe77d3d05dffd492c4f65c619cfb09f3daf8499a54f2f3cb18005fa8cf04d5f118d0e6d33b004baba4afa5a',
    request_options={
        'request_timeout': 10,
        'nr_of_retries': 1,
        'retry_status_codes': [502],
        'retry_backoff_factor': 0.1
    }
)
print(p3cw)

# With payload data
# Destruct response to error and data
# and check first if we have an error, otherwise check the data
error, data  = p3cw.request(
    entity='smart_trades_v2', 
    action='new', 
    payload={
        "account_id": 32249456,
        "pair": 'USDT_HOOK',
        "position": {
            "type": 'buy',
            "units": {
                "value": "10"
            },
            "order_type": "market"
        },

        "take_profit": {
            "enabled": "true",
            "steps": [
                {
                    "order_type": "limit",
                    "price": {
                        "value": 1.95 * 1.015,
                        # "percent": "1.5",
                        "type": "ask",
                    },
                    "volume": "100.0"
                },
            ]
        },
        "stop_loss": {
            "enabled": "false",
        }
    }
)

print(error, data)

# With action_id replaced in URL
# Destruct response to error and data
# and check first if we have an error, otherwise check the data
# error, data = p3cw.request(
#     entity='smart_trades_v2', 
#     action='get_by_id',
#     action_id='123456'
# )