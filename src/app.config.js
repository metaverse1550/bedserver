import {
    defineServer,
    defineRoom,
    monitor,
    playground,
    createRouter,
    createEndpoint,
} from "colyseus";

/**
 * Import your Room files
 */
import { MyRoom } from "./rooms/MyRoom.js";

const server = defineServer({
    // 🚨 [여기가 진짜 핵심!] Colyseus 자체 서버 엔진에 CORS 통과 옵션을 명시합니다.
    options: {
        // file:// 환경의 'null' 출처를 포함해 모든 접속 요청의 헤더를 수락합니다.
        cors: {
            origin: (origin, callback) => callback(null, true),
            credentials: true
        }
    },

    /**
     * Define your room handlers:
     */
    rooms: {
        my_room: defineRoom(MyRoom)
    },

    /**
     * Experimental: Define API routes.
     */
    routes: createRouter({
        api_hello: createEndpoint("/api/hello", { method: "GET", }, async (ctx) => {
            return { message: "Hello World" }
        })
    }),

    /**
     * Bind your custom express routes here:
     */
    express: (app) => {
        // 일반 HTTP 요청도 혹시 모르니 한 번 더 빗장을 풀어둡니다.
        app.use((req, res, next) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
            if (req.method === 'OPTIONS') {
                return res.sendStatus(200);
            }
            next();
        });

        app.get("/hi", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        /**
         * Use @colyseus/monitor
         */
        app.use("/monitor", monitor());

        /**
         * Use @colyseus/playground
         */
        if (process.env.NODE_ENV !== "production") {
            app.use("/", playground());
        }
    }

});

export default server;