import json
from channels.generic.websocket import AsyncWebsocketConsumer

class AlertasConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'alertas_ares'

        # Unimos este cliente al grupo de alertas
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()
        print("✅ Cliente conectado al WebSocket de Alertas")

    async def disconnect(self, close_code):
        # Lo sacamos del grupo al desconectarse
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        print("❌ Cliente desconectado del WebSocket de Alertas")

    # Esta función recibe los mensajes del backend y los empuja a React
    async def enviar_alerta(self, event):
        alerta = event['alerta']
        # Enviamos el JSON al frontend
        await self.send(text_data=json.dumps(alerta))