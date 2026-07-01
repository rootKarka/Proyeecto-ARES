import json
from channels.generic.websocket import AsyncWebsocketConsumer


class MensajesConsumer(AsyncWebsocketConsumer):
    """
    WebSocket de mensajería bidireccional entre el Admin (React) y
    el Operador en campo (Kotlin).

    Usamos un grupo por usuario destinatario, así cada operador solo
    recibe los mensajes dirigidos a él:  mensajes_usuario_<id>
    """

    async def connect(self):
        # El cliente debe conectarse a ws/mensajes/<usuario_id>/
        self.usuario_id = self.scope['url_route']['kwargs']['usuario_id']
        self.group_name = f'mensajes_usuario_{self.usuario_id}'

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()
        print(f"✅ Cliente conectado al WebSocket de Mensajes (usuario {self.usuario_id})")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        print(f"❌ Cliente desconectado del WebSocket de Mensajes (usuario {self.usuario_id})")

    # Recibe el mensaje del backend (Django) y lo empuja al cliente conectado
    async def enviar_mensaje(self, event):
        mensaje = event['mensaje']
        await self.send(text_data=json.dumps(mensaje))