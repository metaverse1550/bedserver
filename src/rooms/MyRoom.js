import { Room } from "colyseus";

export class MyRoom extends Room {
  // 1대1 배드민턴이므로 최대 2명 제한
  maxClients = 2;
  hostClient = null;
  guestClient = null;

  onCreate(options) {
    console.log("🏸 배드민턴 고속 웹소켓 방 생성 완료!", this.roomId);

    // 1. 플레이어 위치 및 스윙 상태 중계
    this.onMessage("player_pos", (client, data) => {
      this.broadcast("player_pos_sync", {
        senderId: client.sessionId,
        ...data
      }, { except: client });
    });

    // 2. 호스트가 계산한 공의 물리 위치 중계
    this.onMessage("ball_sync", (client, data) => {
      if (client === this.hostClient) {
        this.broadcast("ball_sync_data", data, { except: client });
      }
    });

    // 3. 호스트가 터뜨린 타격 이펙트 중계
    this.onMessage("hit_effect", (client, data) => {
      this.broadcast("hit_effect_sync", data, { except: client });
    });

    // 4. 게스트가 스윙했을 때 호스트에게 인풋 전달
    this.onMessage("guest_swing_input", (client, data) => {
      if (client === this.guestClient && this.hostClient) {
        this.hostClient.send("guest_swing_trigger", data);
      }
    });

    // 5. 점수 및 세트 동기화
    this.onMessage("score_sync", (client, data) => {
      this.broadcast("score_sync_data", data);
    });
    this.onMessage("set_end_sync", (client, data) => {
      this.broadcast("set_end_sync_data", data);
    });

    // 6. 재경기 조율
    this.onMessage("rematch_request", (client, data) => {
      this.broadcast("rematch_request_sync", data, { except: client });
    });
    this.onMessage("rematch_agree", (client, data) => {
      this.broadcast("rematch_agree_sync", data, { except: client });
    });
  }

  onJoin(client, options) {
    console.log(`👤 입장: ${client.sessionId}`);

    // 먼저 들어오면 Host(P1), 두 번째는 Guest(P2)
    if (!this.hostClient) {
      this.hostClient = client;
      client.send("assign_role", { role: "host" });
    } else if (!this.guestClient) {
      this.guestClient = client;
      client.send("assign_role", { role: "guest" });
      
      // 둘 다 모였으니 게임 시작 신호 발송!
      this.broadcast("start_match_trigger", {});
    }
  }

  onLeave(client, consented) {
    console.log(`❌ 퇴장: ${client.sessionId}`);
    if (client === this.hostClient) this.hostClient = null;
    if (client === this.guestClient) this.guestClient = null;
    this.broadcast("player_disconnected", {});
  }

  onDispose() {
    console.log("🧹 방이 비어서 삭제합니다.");
  }
}