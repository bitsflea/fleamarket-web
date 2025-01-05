/* eslint-disable no-console */

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
import { webRTC, webRTCDirect } from "@libp2p/webrtc";
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'

const options = {
    addresses: {
        listen: ['/ip4/0.0.0.0/tcp/61713/ws', "/webrtc"]
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
        // pubsub: gossipsub({ allowPublishToZeroPeers: true, emitSelf: true, canRelayMessage: true }),
        relay: circuitRelayServer({
            reservations: {
                maxReservations: Infinity
            }
        }),
        // kadDHT: kadDHT({
        //     protocol: '/ipfs/lan/kad/1.0.0',
        //     peerInfoMapper: removePublicAddressesMapper,
        //     clientMode: false
        // }),
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


    // await node.start()
    console.log(`Node started with id ${node.peerId.toString()}`)
    console.log('Listening on:')
    node.getMultiaddrs().forEach((ma) => console.log(ma.toString()))
}

main()