import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthTokenService } from '../security/auth-token.service';

@WebSocketGateway({
  namespace: '/stats',
  cors: { origin: true, credentials: true },
})
export class StatsGateway
  implements OnGatewayInit, OnGatewayConnection
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(
    StatsGateway.name,
  );

  constructor(
    private readonly authTokenService: AuthTokenService,
  ) {}

  afterInit() {
    this.logger.log(
      'Stats websocket gateway initialized',
    );
  }

  async handleConnection(
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const token =
        (client.handshake.auth?.token as
          | string
          | undefined) ||
        this.extractBearer(
          client.handshake.headers.authorization,
        );
      if (!token)
        throw new UnauthorizedException();

      const payload =
        this.authTokenService.verifyAccessToken(
          token,
        );
      if (!payload.organizationId) {
        throw new UnauthorizedException(
          'Missing organization scope',
        );
      }

      client.join(
        this.getTenantRoom(
          payload.organizationId,
        ),
      );
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('joinTenant')
  handleJoinTenant(
    @ConnectedSocket() client: Socket,
    @MessageBody() organizationId: string,
  ) {
    this.logger.log(
      `Client ${client.id} joining tenant room: ${organizationId}`,
    );

    client.rooms.forEach((room) => {
      if (room.startsWith('tenant:'))
        client.leave(room);
    });

    client.join(
      this.getTenantRoom(organizationId),
    );
    return { status: 'joined', organizationId };
  }

  emitTenantEvent(
    organizationId: string,
    event: 'click.processed' | 'email.processed',
    payload: Record<string, unknown>,
  ) {
    if (!this.server) return;
    this.server
      .to(this.getTenantRoom(organizationId))
      .emit(event, payload);
  }

  private getTenantRoom(organizationId: string) {
    return `tenant:${organizationId}`;
  }

  private extractBearer(
    value?: string,
  ): string | undefined {
    if (!value) return undefined;
    if (!value.startsWith('Bearer '))
      return undefined;
    return value.slice(7);
  }
}
