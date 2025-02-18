import { bootstrap } from '@libp2p/bootstrap'
import { noise } from '@chainsafe/libp2p-noise'
import { createLibp2p } from 'libp2p'
import { generateKeyPairFromSeed } from "@libp2p/crypto/keys"
import { create } from "@libp2p/crypto/hmac"
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { LevelBlockstore } from 'blockstore-level'
import { LevelDatastore } from 'datastore-level'
import { createHelia, libp2pDefaults } from 'helia';
import { createOrbitDB, IPFSAccessController } from '@orbitdb/core';
import { CID } from 'multiformats/cid'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { json } from '@helia/json'
import drain from 'it-drain'
import { TimeoutController } from 'timeout-abort-controller'

import { webSockets } from '@libp2p/websockets'
import bootstrappers from './bootstrappers.js'
import * as filters from '@libp2p/websockets/filters'
import { webRTC } from '@libp2p/webrtc'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { yamux } from '@chainsafe/libp2p-yamux'
import { identify, identifyPush } from '@libp2p/identify'
import { circuitRelayServer } from '@libp2p/circuit-relay-v2'
import { kadDHT, removePublicAddressesMapper } from '@libp2p/kad-dht';

let ipfs = null;
let orbitdb = null;
let userId = "bitsflea-chat";
const topic = 'bitsflea-file-topic';

const onPin = (evt) => {
    console.log("onPin:", evt)
}

const options = {
    addresses: {
        listen: [
            '/ip4/0.0.0.0/tcp/61713/ws',
            '/p2p-circuit',
            '/webrtc',
        ]
    },
    transports: [
        webSockets({
            filter: filters.all
        }),
        webRTC(),
        circuitRelayTransport()
    ],
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()],
    connectionGater: {
        denyDialMultiaddr: () => false
    },
    services: {
        identify: identify(),
        identifyPush: identifyPush(),
        pubsub: gossipsub({ allowPublishToZeroTopicPeers: true, emitSelf: true, canRelayMessage: true }),
        relay: circuitRelayServer({
            reservations: {
                maxReservations: Infinity
            }
        }),
        dht: kadDHT(),
    },
    peerDiscovery: [
        bootstrap({
            list: [
                "/ip4/23.94.67.168/tcp/61713/ws/p2p/12D3KooWT36TURqwnygqydMHCT4fFeHdGibgW7EwcWGaj9CEnk3h"
            ]
        })
    ],
    connectionManager: {
        maxConnections: 30, // 限制最大连接数
    }
}

async function main() {
    let secret = new TextEncoder().encode("12D3KooWMKhpKX3J2PY5nPLc5KSSEmT1FkBd8xcjLWVsRPJ4a4De")
    let data = await (await create("SHA256", secret)).digest(secret)
    let pri = await generateKeyPairFromSeed("Ed25519", data)

    // const node = await createLibp2p(Object.assign(options, { privateKey: pri }))
    const libp2pOption = libp2pDefaults({ privateKey: pri })
    libp2pOption.services['pubsub'] = gossipsub({ allowPublishToZeroTopicPeers: true, emitSelf: true, canRelayMessage: true })
    delete libp2pOption.services.upnp
    delete libp2pOption.services.autoNAT

    libp2pOption.connectionEncrypters = [noise()]
    libp2pOption.addresses.listen = [
        '/ip4/0.0.0.0/tcp/61713/ws',
        '/p2p-circuit',
        '/webrtc',
    ]
    libp2pOption.peerDiscovery = [
        bootstrap({
            list: [
                "/dns4/wss.bitsflea.com/tcp/443/wss/p2p/12D3KooWT36TURqwnygqydMHCT4fFeHdGibgW7EwcWGaj9CEnk3h",
                // "/ip4/23.94.67.168/tcp/61713/ws/p2p/12D3KooWT36TURqwnygqydMHCT4fFeHdGibgW7EwcWGaj9CEnk3h"
                
                // '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
                // '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
                // '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
                // '/dnsaddr/va1.bootstrap.libp2p.io/p2p/12D3KooWKnDdG3iXw9eTFijk3EWSunZcFi54Zka4wmtqtt6rPxc8',
                // '/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ'
            ],
        })
    ]
    libp2pOption.connectionManager = {
        maxConnections: 20,
        outboundUpgradeTimeout: 30000,
        inboundUpgradeTimeout: 30000,
        dialTimeout: 50000
    }
    // const node = await createLibp2p(Object.assign(options, { privateKey: pri }))
    const node = await createLibp2p(libp2pOption)

    const { signal } = new TimeoutController(30000)

    node.addEventListener('peer:discovery', async (evt) => {
        const peerId = evt.detail.id.toString();
        console.log(`Discovered peer: ${peerId}`);
        // await node.dial(evt.detail.id, { signal }).catch(console.debug)
        // const peerIds = node.getPeers().map(p => p.toString())
        // console.log("peerIds:", peerIds)
    });

    node.addEventListener('peer:connect', (evt) => {
        const connectedPeer = evt.detail
        // console.log(connectedPeer)
        const peerId = connectedPeer.toString()
        console.log(`Connected to peer: ${peerId}`)
    })

    node.addEventListener('peer:disconnect', (evt) => {
        console.log(`Peer disconnect: `, evt.detail)
    })

    node.addEventListener('peer:dial:error', (evt) => {
        console.log(`libp2p dial:error: `, evt)
    })

    node.addEventListener('error', (evt) => {
        console.log(`libp2p error: `, evt)
    })

    // 配置存储
    const blockstore = new LevelBlockstore('./ipfs/blocks')
    await blockstore.open();

    const datastore = new LevelDatastore('./ipfs/datas')
    datastore.open();

    // 初始化 Helia (IPFS 实例)
    ipfs = await createHelia({ libp2p: node, blockstore, datastore });

    // 确保 IPFS 正确初始化
    if (!ipfs) {
        throw new Error("IPFS initialization failed");
    }

    // test json 
    // const j = json(ipfs);
    // const cid = CID.parse("bagaaieran3gqmu65wp4fjccrgidryjyfdxkubvm2fihe6u52qztirfxi56xq")
    // const content = await j.get(cid)
    // console.log("Json content:", content)


    node.services.pubsub.addEventListener('message', async (evt) => {
        // console.log("evt:", evt, evt.detail.topic);
        if (evt.detail.topic == topic) {
            try {
                let str = uint8ArrayToString(evt.detail.data);
                // console.log("Pin:", str);
                let cid = CID.parse(str);
                let isPin = await ipfs.pins.isPinned(cid);
                if (!isPin) {
                    const pinResult = ipfs.pins.add(cid, { onProgress: onPin })
                    if (pinResult) {
                        await drain(pinResult);
                    }
                    isPin = await ipfs.pins.isPinned(cid);
                    console.log("Pin:", isPin, str);
                }
            } catch (e) {
                console.log(e);
            }
        }
    });
    node.services.pubsub.subscribe(topic);

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
        type: "events", // 可选：'events', 'keyvalue', 'documents' 等
        AccessController: IPFSAccessController({
            write: ['*'] // 允许任何人写入
        })
    });

    db.events.on('error', (evt) => {
        console.log("chat db error:", evt)
    })

    let userDb = await orbitdb.open("bitsflea-user-data", {
        create: true,
        type: "documents",
        AccessController: IPFSAccessController({
            write: ['*']
        })
    })

    userDb.events.on('error', (evt) => {
        console.log("user db error:", evt)
    })

    // const message = {
    //     content: "Hello Welcome!",
    //     timestamp: Date.now(),
    //     userId,
    // };
    // // console.log(db);

    // await db.add(JSON.stringify(message));

    // await node.start()
    console.log(`Node started with id ${node.peerId.toString()}`)
    console.log('Listening on:')
    node.getMultiaddrs().forEach((ma) => console.log(ma.toString()))
    console.log("Database Chat:", db.address);
    console.log("Database User:", userDb.address);
}

main()