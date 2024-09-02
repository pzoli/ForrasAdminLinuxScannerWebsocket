const fs = require('fs');
const { exec } = require("child_process");

const OUTPUT_FILE_NAME = 'scanned.jpg';

//const color_mode = 1; //Color : Color
//const color_mode = 2; //grayscale : Gray
//const color_mode = 4; //back-white : Lineart

async function scanImage(assetId: string, color_mode: number, resolution: number) : Promise<string> {
	const mode = color_mode == 1 ? "Color" : color_mode == 2 ? "Gray" : "Lineart"
	const promise = new Promise((resolve, reject) => {
		const scanProc = exec(`scanimage -d "${assetId}" --format tiff --mode ${mode} --resolution ${resolution} -l 0mm -t 0mm|convert - -quality 75 scanned.jpg`, (error: any, stdout: any, stderr: any) => {
			if (error) {
				reject(`error: ${error.message}`)
			}
			resolve(OUTPUT_FILE_NAME)
		});
	})
	var result: string
	try {
		result = await promise as string
 	} catch (e) {
		result = e as string
	}
	return result
}

async function getDeviceInfos(): Promise<string> {
	let result: {
		return: string;
		devices: { assetId: string; assetName: string }[];
	} = {
		return: 'deviceinfo',
		devices: [],
	};

	const promise = new Promise((resolve, reject) => {
		const ls = exec("scanimage -f \"%d\t%m\n\"", (error: any, stdout: any, stderr: any) => {
			if (error) {
				reject(`error: ${error.message}`)
			}
			if (stderr) {
				reject(`stderr: ${stderr}`)
			}
			resolve(stdout)
		});
	})
	try {
		const devicesStr = await promise as string
		const lines = devicesStr.split("\n")
		lines.forEach(deviceInfoLine => {
			if (deviceInfoLine != "") {
				const  l = deviceInfoLine.split("\t")
				if (l.length > 1) {
					result.devices.push({assetId:l[0],assetName:l[1]})
				}
			}
		})		
 	} catch (e) {
		console.log("exceptoin:" + e)
	}

	//result.devices = [{ assetId: 1, assetName: 'autobot' }];
	return JSON.stringify(result);
}

export { scanImage, getDeviceInfos };
