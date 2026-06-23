from channels.generic.websocket import AsyncWebsocketConsumer
import json

class SensorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add(
            "sensores",
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            "sensores",
            self.channel_name
        )

    async def sensor_update(self, event):
        await self.send(text_data=json.dumps(event["data"]))