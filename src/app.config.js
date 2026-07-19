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
        // 🚨 [패키지 설치 없는 CORS 차단 해제 치트키]
        // 별도의 cors 라이브러리 없이 미들웨어로 모든 오리진(file:// 포함)을 다 허용해 버립니다.
        app.use((req, res, next) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
            
            // 프리플라이트(OPTIONS) 요청 시 200번으로 빠르게 응답하고 패스시킵니다.
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