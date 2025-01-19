import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
import { webRTC } from '@libp2p/webrtc'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { bootstrap } from '@libp2p/bootstrap'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { identify, identifyPush } from '@libp2p/identify'
import { kadDHT, removePublicAddressesMapper } from '@libp2p/kad-dht';
import { gossipsub } from "@chainsafe/libp2p-gossipsub";

const option = {
    addresses: {
        listen: [
            '/p2p-circuit',
            '/webrtc',
            '/ip4/0.0.0.0/tcp/61713/ws'
        ]
    },
    transports: [
        webSockets(),
        webRTC(),
        circuitRelayTransport()
    ],
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()],
    services: {
        identify: identify(),
        identifyPush: identifyPush(),
        pubsub: gossipsub({ allowPublishToZeroPeers: true, emitSelf: true, canRelayMessage: true }),
        dht: kadDHT({
            protocol: '/ipfs/lan/kad/1.0.0',
            peerInfoMapper: removePublicAddressesMapper,
            clientMode: true
        })
    },
    connectionGater: {
        denyDialMultiaddr: () => false
    },
    peerDiscovery: [
        bootstrap({
            list: [
                '/ip4/192.168.0.106/tcp/61713/ws/p2p/12D3KooWT36TURqwnygqydMHCT4fFeHdGibgW7EwcWGaj9CEnk3h',
            ],
        })
    ],
    connectionManager: {
        maxConnections: 10, // 限制最大连接数
    }
}

async function main() {
    const libp2p = await createLibp2p(option)

    libp2p.addEventListener('peer:discovery', async (evt) => {
        const peer = evt.detail
        console.log(`Discovered peer: ${peer.id.toString()}`)
        try {
            await libp2p.dial(peer.id)
            // console.log(`Successfully connected to peer: ${peer.id.toString()}`)
        } catch (err) {
            console.warn(`Failed to connect to peer ${peer.id.toString()}:`, err.message)
        }
    })

    libp2p.addEventListener('peer:connect', (evt) => {
        const connectedPeer = evt.detail
        // console.log(connectedPeer)
        const peerId = connectedPeer.toString()
        console.log(`Connected to peer: ${peerId}`)
    })
}


main()