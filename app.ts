import fs from 'fs';
import WebSocket from 'ws';
import url from 'url';
import { scanImage, getDeviceInfos } from './scan';

import http from 'http';
const server = http.createServer();

const wss = new WebSocket.Server({ server });
var msg: any;

wss.on('connection', function connection(ws: any, req: any) {
	ws.on('message', async function incoming(message: string) {
		console.log('received: %s', message);
		var mObj = JSON.parse(message);
		switch (mObj.action) {
			case 'scan': {
				try {
					const fileName = await scanImage(
						mObj.assetId,
						mObj.color_mode,
						mObj.resolution,
					)
					if (fs.existsSync(fileName)) {
						const content = fs.readFileSync(fileName);
						const imageData = new Uint8Array(content);
						ws.send(
							new Blob([imageData], {
								type:
									'image/' +
									fileName.substring(fileName.indexOf('.') + 1),
							}),
						);
						//fs.unlinkSync(fileName);
					} else {
						ws.send(JSON.stringify({result:"error",message:"File not exists!"}))
					}
				} catch (e) {
					console.log(e);
					ws.send(e);
				}
				break;
			}
			case 'deviceinfo': {
				ws.send(await getDeviceInfos());
				break;
			}
			default:
				break;
		}
	});
	ws.on('close', function () {
		wss.clients.delete(ws);
		console.log('disconnected');
	});
});

server.listen(8082);
