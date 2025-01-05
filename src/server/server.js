import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { circuitRelayServer } from '@libp2p/circuit-relay-v2'
import { identify } from '@libp2p/identify'
import { webSockets } from '@libp2p/websockets'
import { createLibp2p } from 'libp2p'
import { generateKeyPairFromSeed } from "@libp2p/crypto/keys"
import { create } from "@libp2p/crypto/hmac"
import * as filters from '@libp2p/websockets/filters'
import { kadDHT, removePublicAddressesMapper } from '@libp2p/kad-dht';
import { gossipsub } from "@chainsafe/libp2p-gossipsub";

import { LevelBlockstore } from 'blockstore-level'
import { createHelia } from 'helia';
import { createOrbitDB, IPFSAccessController } from '@orbitdb/core';


let ipfs = null;
let orbitdb = null;
let userId = "bitsflea-chat";

const options = {
    addresses: {
        listen: ['/ip4/0.0.0.0/tcp/61713/ws']
    },
    transports: [
        webSockets({
            filter: filters.all
        }),
    ],
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()],
    services: {
        identify: identify(),
        pubsub: gossipsub({ allowPublishToZeroPeers: true, emitSelf: true, canRelayMessage: true }),
        relay: circuitRelayServer({
            reservations: {
                maxReservations: Infinity
            }
        }),
        dht: kadDHT({ enabled: true }),
    }
}

async function main() {
    let secret = new TextEncoder().encode("12D3KooWMKhpKX3J2PY5nPLc5KSSEmT1FkBd8xcjLWVsRPJ4a4De")
    let data = await (await create("SHA256", secret)).digest(secret)
    let pri = await generateKeyPairFromSeed("Ed25519", data)

    const node = await createLibp2p(Object.assign(options, { privateKey: pri }))

    node.addEventListener('peer:discovery', async (evt) => {
        const peerId = evt.detail.id.toString();
        console.log(`Discovered peer: ${peerId}`);
    });

    // 配置存储
    const blockstore = new LevelBlockstore('./ipfs/blocks')
    await blockstore.open();

    // 初始化 Helia (IPFS 实例)
    ipfs = await createHelia({ libp2p: node, blockstore });

    // 确保 IPFS 正确初始化
    if (!ipfs) {
        throw new Error("IPFS initialization failed");
    }

    console.log("peerId:", ipfs.libp2p.peerId.toString())

    // // 初始化 OrbitDB
    orbitdb = await createOrbitDB({ ipfs, id: userId, directory: `./bitsflea-db-server` });

    // 确保 OrbitDB 正常创建
    if (!orbitdb) {
        throw new Error("OrbitDB initialization failed");
    }

    // 打开或创建一个数据库
    let db = await orbitdb.open("bitsflea-chat", {
        create: true, // 如果数据库不存在，则创建
        type: "events", // 可选：'events', 'keyvalue', 'docstore' 等
        AccessController: IPFSAccessController({
            write: ['*'] // 允许任何人写入
        })
    });

    const message = {
        content: "Hello Welcome!",
        timestamp: Date.now(),
        userId,
    };
    // console.log(db);

    await db.add(JSON.stringify(message));

    // await node.start()
    console.log(`Node started with id ${node.peerId.toString()}`)
    console.log('Listening on:')
    node.getMultiaddrs().forEach((ma) => console.log(ma.toString()))
    console.log("Database ready:", db.address);
}

main()