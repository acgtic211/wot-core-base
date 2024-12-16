import rsa from 'node-rsa';
import fs from 'fs';
import crypto from 'node:crypto';

export class SecurityManager {
	
	constructor() {
		this.privateKey = new rsa();
		var priv = fs.readFileSync('/usr/src/app-launcher/keys9/root-CA.key', 'utf-8');

		this.privateKey.importKey(priv);

		//TIS
		this.servientList = [];
		
	}

	encrypt(id) {
		return this.privateKey.encrypt(id, 'base64');
	}
	
	validateContext() {
		return(true);
	}

	pairing(id, allowedIDs) {
		var decryptedID = this.privateKey.decrypt(id, 'utf-8');
		var res = allowedIDs.includes(decryptedID);

		return res;
	}

	//TODO: Función de registro de Servients y función de consulta para la identificación de Servients

	async registerServient(servientHREF, servientName){
		
		var servientID = servientName + "_" + crypto.randomBytes(16).toString("hex");
		var {
			publicKey,
			privateKey
		} = crypto.generateKeyPairSync('rsa', {
			modulusLength: 4096,
			publicKeyEncoding: {
				type: 'spki',
				format: 'pem'
			},
			privateKeyEncoding: {
				type: 'pkcs8',
				format: 'pem',
				cipher: 'aes-256-cbc',
				passphrase: 'acg123456'
			}
		});

		var newServient = {
			"servient_href": servientHREF,
			"servient_ID": servientID,
			"servient_privateKey": privateKey
		};
		
		this.servientList.push(newServient);

		
		var res = [
			newServient, publicKey
		]

		return res;
	}


	async checkServientIdentity(encryptedMSG, servientId){
		//Paso msg encriptado del servient a checkear (nombre de dicho servient encriptado con su clave privada) y el nombre del servient que se supone que es (?)
		
		var srv = this.servientList.filter(srnt => {
			return srnt.servient_ID === servientId
		});
		
		if(srv[0]) {
			var prKey = {
				"key": srv[0].servient_privateKey,
				"passphrase": 'acg123456'
			}
			var decryptedMSG = await crypto.privateDecrypt(prKey, encryptedMSG);

			//console.log("decrypted message: ", decryptedMSG.toString());
			
			if(decryptedMSG.toString().includes(servientId)){
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}

	}

	async encryptMessage(pubKey, msg) {
		var key = {
			"key": pubKey
		}
		var enc = await crypto.publicEncrypt(key, msg);

		return enc;
	}

}