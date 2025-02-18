import { createHelia } from 'helia';
import { createOrbitDB, IPFSAccessController } from '@orbitdb/core';
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { dcutr } from '@libp2p/dcutr'
import { identify } from "@libp2p/identify";
import { createLibp2p } from 'libp2p';
import { webRTC } from '@libp2p/webrtc'
import { webSockets } from '@libp2p/websockets';
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { bootstrap } from '@libp2p/bootstrap';
import { multiaddr } from '@multiformats/multiaddr'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import * as filters from '@libp2p/websockets/filters'
import { WebRTC as WebRTCMatcher } from '@multiformats/multiaddr-matcher'
import { kadDHT } from '@libp2p/kad-dht';
import { IDBBlockstore } from 'blockstore-idb'

import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'

import { createSecp256k1PeerId, exportToProtobuf, createFromProtobuf } from '@libp2p/peer-id-factory'
import { privateKeyToProtobuf, privateKeyFromProtobuf, generateKeyPair } from "@libp2p/crypto/keys"

import bootstrappers from "../server/bootstrappers"

let ipfs = null;
let orbitdb = null;
let db = null;
const relays = ["/dns4/wss.bitsflea.com/tcp/443/wss/p2p/12D3KooWT36TURqwnygqydMHCT4fFeHdGibgW7EwcWGaj9CEnk3h"]
// const relays = ["/ip4/127.0.0.1/tcp/61713/ws/p2p/12D3KooWT36TURqwnygqydMHCT4fFeHdGibgW7EwcWGaj9CEnk3h"]

export const initOrbitDB = async () => {
  if (db) return db;

  // const params = new URLSearchParams(window.location.search);
  let uid = localStorage.getItem("uid") ?? Math.floor(Math.random() * 10 ** 8).toString();
  let pri = localStorage.getItem(uid);
  if (pri == null || pri == undefined) {
    pri = await generateKeyPair("secp256k1")
    const priJson = privateKeyToProtobuf(pri)
    localStorage.setItem("uid", uid)
    localStorage.setItem(uid, JSON.stringify(priJson))
  } else {
    pri = privateKeyFromProtobuf(Uint8Array.from(Object.values(JSON.parse(pri))))
  }
  // console.log(pri)

  const option = {
    privateKey: pri,
    addresses: {
      listen: [
        '/p2p-circuit',
        '/webrtc'
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
      denyDialMultiaddr: () => {
        return false
      }
    },
    services: {
      identify: identify(),
      pubsub: gossipsub({ allowPublishToZeroTopicPeers: true, emitSelf: true }),
      dcutr: dcutr(),
      dht: kadDHT({ clientMode: true }),
    },
    peerDiscovery: [
      pubsubPeerDiscovery({
        interval: 1000
      })
    ],
    connectionManager: {
      maxConnections: 20, // 限制最大连接数
      outboundUpgradeTimeout: 30000,
      inboundUpgradeTimeout: 30000,
      dialTimeout: 50000
    }
  }

  if (relays.length > 0) {
    option.peerDiscovery.push(bootstrap({
      list: [...relays, ...bootstrappers]
    }))
  }

  try {
    // 配置 libp2p，支持 WebRTC 和 WebSockets
    const libp2p = await createLibp2p(option);

    const blockstore = new IDBBlockstore(`bitsflea-node-${uid}`);
    await blockstore.open();

    // 初始化 Helia (IPFS 实例)
    ipfs = await createHelia({ libp2p, blockstore });

    // 确保 IPFS 正确初始化
    if (!ipfs) {
      throw new Error("IPFS initialization failed");
    }

    // await ipfs.libp2p.dial(multiaddr(relay))
    console.log("peerId:", ipfs.libp2p.peerId.toString())

    ipfs.libp2p.addEventListener('peer:discovery', async (evt) => {
      const peerId = evt.detail.id.toString();
      console.log(`Discovered peer: ${peerId}`);

      try {
        // 连接到发现的节点
        await ipfs.libp2p.dial(evt.detail.id);
        console.log(`Connected to peer: ${peerId}`);
      } catch (err) {
        console.error(`Failed to connect to peer: ${peerId}`, err);
      }
    });

    ipfs.libp2p.addEventListener('connection:open', (evt) => {
      console.log("connection open:", evt.detail.id.toString())
      // const peerList = ipfs.libp2p.getPeers()
      // console.log("peerList:", peerList);
    })
    ipfs.libp2p.addEventListener('connection:close', (evt) => {
      console.log("connection close:", evt.detail.id.toString())
      // const peerList = ipfs.libp2p.getPeers()
      // console.log("peerList:", peerList);
    })
    ipfs.libp2p.addEventListener('self:peer:update', async (evt) => {
      // console.log("peer event:", evt)
      // const addr = ipfs.libp2p.getMultiaddrs().filter(ma => WebRTCMatcher.matches(ma)).pop()
      // console.log("addr:", addr.toString())
    })

    // 初始化 OrbitDB
    orbitdb = await createOrbitDB({ ipfs, id: uid, directory: `bitsflea-db-${uid}` });

    // 确保 OrbitDB 正常创建
    if (!orbitdb) {
      throw new Error("OrbitDB initialization failed");
    }

    db = await orbitdb.open("/orbitdb/zdpuAzQi2wjs135VhWjj62XSSwPySfV41by5FUxme9fByZQDi")

    console.log("Database ready:", db.address);


    // setInterval(()=>{
    //   console.log(ipfs.libp2p.getPeers().map((peerId) => peerId.toString()))
    // },3000)

    return db;
  } catch (error) {
    console.error("Error initializing OrbitDB in browser:", error);
    throw error;
  }
};

export const getOrbitDB = () => {
  if (!db) {
    throw new Error('OrbitDB not initialized');
  }
  return db;
};

export const cleanup = async () => {
  try {
    if (db) {
      await db.close(); // 关闭数据库
      db = null;
    }

    if (orbitdb) {
      await orbitdb.stop(); // 停止 OrbitDB
      orbitdb = null;
    }

    if (ipfs) {
      // 检查 IPFS 是否有停止方法
      if (typeof ipfs.stop === 'function') {
        await ipfs.stop();
      } else {
        console.warn('IPFS stop method is not defined');
      }
      ipfs = null;
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};
